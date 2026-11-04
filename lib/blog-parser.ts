import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Normalizes raw blog content (plain text, formatted text, or Markdown)
 * into standard GitHub-flavored Markdown.
 */
export function normalizeBlogContent(raw: string): string {
  if (!raw) return '';

  // If the content already contains rich HTML markup, keep it as-is
  const hasRichHtml = /<\/(p|h1|h2|h3|h4|h5|h6|ul|ol|article|blockquote)>/i.test(raw);
  if (hasRichHtml) {
    return raw;
  }

  const lines = raw.split(/\r?\n/);
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Fix isolated bullet symbol on its own line: '•\nText' -> '- Text'
    if (/^[•\*\-]$/.test(trimmed)) {
      if (i + 1 < lines.length && lines[i + 1].trim()) {
        out.push(`- ${lines[i + 1].trim()}`);
        i++;
        continue;
      }
    }

    // Fix isolated number on its own line: '1.\nText' -> '1. Text'
    const isolatedNumMatch = trimmed.match(/^(\d+)\.$/);
    if (isolatedNumMatch && i + 1 < lines.length && lines[i + 1].trim()) {
      out.push(`${isolatedNumMatch[1]}. ${lines[i + 1].trim()}`);
      i++;
      continue;
    }

    // Fix lines starting with bullet character directly: '• Text' -> '- Text'
    if (/^[•]\s+(.*)/.test(trimmed)) {
      out.push(trimmed.replace(/^[•]\s+/, '- '));
      continue;
    }

    // Check if line is a numbered major section heading like '1. Choose a niche...'
    if (/^\d+\.\s+[A-Z].{4,90}$/.test(trimmed)) {
      out.push(`\n## ${trimmed}\n`);
      continue;
    }

    // Existing markdown heading '# Heading'
    if (/^#{1,6}\s+/.test(trimmed)) {
      out.push(`\n${trimmed}\n`);
      continue;
    }

    // Subhead ending with colon e.g. 'Here are five formats that can work well with narration:'
    if (/^[A-Z].{4,80}:$/.test(trimmed)) {
      out.push(`\n### ${trimmed}\n`);
      continue;
    }

    out.push(lines[i]);
  }

  return out.join('\n');
}

/**
 * Creates a clean slug for an HTML heading ID
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z0-9#]+;/gi, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Parses and sanitizes blog content into rich, structured HTML with proper
 * H1-H6 headings, paragraph tags, bullet lists, blockquotes, and heading IDs.
 */
export function renderBlogHtml(rawContent: string): string {
  if (!rawContent || !rawContent.trim()) return '';

  const normalized = normalizeBlogContent(rawContent);

  // If content is already HTML, use it directly; otherwise parse with marked
  let html = '';
  const isAlreadyHtml = /<\/(p|h1|h2|h3|h4|h5|h6|ul|ol|article|blockquote)>/i.test(normalized);

  if (isAlreadyHtml) {
    html = normalized;
  } else {
    // Synchronously parse markdown to HTML with GFM breaks
    html = marked.parse(normalized, {
      gfm: true,
      breaks: false,
    }) as string;
  }

  // Ensure all h1, h2, h3, h4 tags have IDs for Table of Contents
  html = html.replace(/<(h[1-6])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
    // If id already exists, preserve it
    if (/id=["'][^"']*["']/i.test(attrs)) {
      return match;
    }
    const id = slugify(content) || `heading-${Math.random().toString(36).slice(2, 7)}`;
    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });

  // Sanitize the HTML allowing rich formatting tags and attributes
  const cleanHtml = sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'ul', 'ol', 'li', 'blockquote',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'code', 'pre', 'hr', 'br',
      'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'iframe', 'div', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
      iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'class'],
      '*': ['id', 'class', 'style']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com']
  });

  return cleanHtml;
}

