// One-time blog cleanup: promote heading-like paragraphs to H2/H3, fix "2027" -> "2026",
// repair "�" apostrophes, and set author_name. Wording is never changed.
//
// Dry run (default, read-only):  node --env-file=.env.local scripts/blog-structure-fix.mjs --out <dir>
// Apply after reviewing <dir>:   node --env-file=.env.local scripts/blog-structure-fix.mjs --out <dir> --apply
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const AUTHOR = 'Theo Greenslade'; // keep in sync with FOUNDER.name in lib/siteStats.ts
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const OUT = args.includes('--out') ? args[args.indexOf('--out') + 1] : '.blog-fix-dryrun';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Run with --env-file=.env.local (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)');
const db = createClient(url, key);

const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
const isFaqTitle = (t) => /^(faqs?|frequently asked questions|common questions)\??$/i.test(t);
const isHtml = (c) => /<\/(p|h1|h2|h3|h4|h5|h6|ul|ol|article|blockquote)>/i.test(c);

// Sentences that were split where a link used to be ("…, visit" / "FlashTTS's official page.").
const CONTINUES = /\b(the|a|an|to|with|visit|open|see|explore|its|on|for|of|and|or|can|official|current|from|at|in|your|our|you)$/i;
const isFragment = (t) => !/[.!?:;]$/.test(t) && CONTINUES.test(t);

// Short, no links/breaks, does not end like a sentence or a fragment.
function isCandidate(p) {
  if (!p) return false;
  const { text, inner } = p;
  if (text.length < 3 || text.length > 100) return false;
  if (/<(a|br|img)\b/i.test(inner)) return false;
  if (/[.,;:!]$/.test(text) || isFragment(text)) return false;
  return true;
}
const isBody = (p, than) => !!p && p.text.length > 60 && p.text.length > than.text.length;

// Shared walk over paragraphs. `paras` = [{text, inner}], returns level per index (0 = keep).
// A heading directly followed by another heading opens a sub-section: the following headings become H3.
function decideLevels(paras) {
  const levels = new Array(paras.length).fill(0);
  let inFaq = false, sub = false, subNumbered = null;
  for (let i = 0; i < paras.length; i++) {
    const p = paras[i], next = paras[i + 1];
    if (isFaqTitle(p.text)) { levels[i] = 2; inFaq = true; sub = false; continue; }
    if (inFaq && p.text.endsWith('?') && p.text.length <= 160 && !/<(a|br|img)\b/i.test(p.inner)) { levels[i] = 3; continue; }
    if (!isCandidate(p)) continue;
    const numbered = /^\d+\.\s/.test(p.text);
    if (sub && subNumbered && !numbered) sub = false; // numbered steps end at the next plain heading
    if (isBody(next, p)) {
      if (sub && subNumbered === null) subNumbered = numbered;
      levels[i] = sub ? 3 : 2; inFaq = false;
    }
    else if (isCandidate(next) && isBody(paras[i + 2], next)) { levels[i] = 2; sub = true; subNumbered = null; inFaq = false; }
  }
  return levels;
}

// Re-join fragments with the following paragraph (markup only, words unchanged).
function mergeFragments(blocks, merged) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i].trim();
    while (isFragment(b) && i + 1 < blocks.length && !/^(#|-|\*|\d+\.|>|\|)/.test(blocks[i + 1].trim())) {
      merged.push(`${b} + ${blocks[i + 1].trim().slice(0, 60)}`);
      b = `${b} ${blocks[++i].trim()}`;
    }
    out.push(b);
  }
  return out;
}

function structureHtml(content, found) {
  if ((content.match(/<h2\b/gi) || []).length >= 2) return content;
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  const matches = [...content.matchAll(re)];
  const paras = matches.map((m) => ({ text: strip(m[1]), inner: m[1] }));
  const levels = decideLevels(paras);
  let out = '', last = 0;
  matches.forEach((m, i) => {
    out += content.slice(last, m.index);
    if (levels[i]) {
      out += `<h${levels[i]}>${m[1].trim()}</h${levels[i]}>`;
      found.push(`H${levels[i]}: ${paras[i].text}`);
    } else out += m[0];
    last = m.index + m[0].length;
  });
  return out + content.slice(last);
}

function structureMarkdown(content, found) {
  if ((content.match(/^##\s/gm) || []).length >= 2) return content;
  const merged = [];
  const blocks = mergeFragments(content.split(/\n\s*\n/), merged);
  merged.forEach((m) => found.push(`JOINED: ${m}`));
  const paras = blocks.map((b) => ({ text: b.trim(), inner: b.includes('\n') ? '<br>' : '' }));
  // Bullets, quotes, tables and existing headings are never promoted; "1. Step title" lines can be.
  const levels = decideLevels(paras.map((p) => (/^(#|-|\*|>|\|)/.test(p.text) ? { text: '', inner: '<br>' } : p)));
  return blocks.map((b, i) => {
    if (!levels[i]) return b;
    found.push(`H${levels[i]}: ${paras[i].text}`);
    return `${'#'.repeat(levels[i])} ${b.trim()}`;
  }).join('\n\n');
}

function fixText(s, stats) {
  if (!s) return s;
  const y = (s.match(/2027/g) || []).length;
  stats.year += y;
  let t = s.replace(/2027/g, '2026');
  t = t.replace(/([A-Za-z])�([A-Za-z])/g, (_, a, b) => { stats.apos++; return `${a}’${b}`; });
  stats.leftover += (t.match(/�/g) || []).length;
  return t;
}

const { data: posts, error } = await db
  .from('blog_posts')
  .select('id, slug, title, meta_title, meta_description, content, author_name')
  .eq('status', 'published');
if (error) throw error;

mkdirSync(OUT, { recursive: true });
const summary = [];
for (const p of posts) {
  const found = [];
  const stats = { year: 0, apos: 0, leftover: 0 };
  const content0 = p.content || '';
  let content = fixText(content0, stats);
  content = isHtml(content) ? structureHtml(content, found) : structureMarkdown(content, found);
  const update = {
    content,
    title: fixText(p.title, stats),
    meta_title: fixText(p.meta_title, stats),
    meta_description: fixText(p.meta_description, stats),
    author_name: AUTHOR,
  };
  const changed = Object.keys(update).filter((k) => (update[k] ?? null) !== (p[k] ?? null));
  summary.push({ slug: p.slug, changed, headings: found, ...stats });
  if (changed.length) {
    writeFileSync(join(OUT, `${p.slug}.before.html`), content0);
    writeFileSync(join(OUT, `${p.slug}.after.html`), content);
  }
  if (APPLY && changed.length) {
    const { error: e } = await db.from('blog_posts').update(Object.fromEntries(changed.map((k) => [k, update[k]]))).eq('id', p.id);
    if (e) throw e;
  }
}

const txt = summary.map((s) =>
  `${s.slug}\n  changed: ${s.changed.join(', ') || 'nothing'} | 2027->2026: ${s.year} | apostrophes fixed: ${s.apos} | other � left: ${s.leftover}\n` +
  s.headings.map((h) => `    ${h}`).join('\n')).join('\n\n');
writeFileSync(join(OUT, 'summary.txt'), txt);
console.log(`${APPLY ? 'APPLIED' : 'DRY RUN'}: ${posts.length} posts, ${summary.filter((s) => s.changed.length).length} with changes. Summary: ${join(OUT, 'summary.txt')}`);
