import Link from 'next/link';
import { PLANS } from '@/lib/plans';

// Every number comes from lib/plans.ts, so it cannot drift from billing.
export default function PlanLimitsTable() {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-[#e2dfdb] bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-5 py-3 font-bold">Plan</th>
            <th className="px-5 py-3 font-bold">Price / month</th>
            <th className="px-5 py-3 font-bold">Characters / month</th>
            <th className="px-5 py-3 font-bold">Per generation</th>
            <th className="px-5 py-3 font-bold">Voice clones</th>
            <th className="px-5 py-3 font-bold">History</th>
            <th className="px-5 py-3 font-bold">Commercial use</th>
          </tr>
        </thead>
        <tbody>
          {PLANS.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="px-5 py-3 font-bold text-slate-900">{p.name}</td>
              <td className="px-5 py-3">{p.priceMonthly === 0 ? 'Free' : `$${p.priceMonthly}`}</td>
              <td className="px-5 py-3">{p.chars}</td>
              <td className="px-5 py-3">{p.charsPerGen} chars</td>
              <td className="px-5 py-3">{p.voiceClones}</td>
              <td className="px-5 py-3">{p.history.replace(' history', '')}</td>
              <td className="px-5 py-3">{p.commercialUse ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-5 py-3 text-[12px] text-slate-500 border-t border-slate-100">
        Yearly billing is 20% cheaper. Full details on the <Link href="/pricing" className="underline">pricing page</Link>.
      </p>
    </div>
  );
}
