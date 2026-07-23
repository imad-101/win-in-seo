import { Download, Info } from "lucide-react";
import { OpportunityList } from "@/components/opportunity-list";
import { getWorkspaceData } from "@/lib/workspace-data";

export default async function OpportunitiesPage() {
  const { opportunities } = await getWorkspaceData();
  const openOpportunityCount = opportunities.filter((opportunity) => !opportunity.completed).length;
  return (
    <div className="mx-auto max-w-[1460px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3"><h1 className="text-[30px] font-semibold leading-tight tracking-[-0.045em] text-black sm:text-[36px]">SEO opportunities</h1><span className="rounded-full bg-[#dff5ff] px-3 py-1.5 text-[12px] font-bold text-black">{openOpportunityCount} open</span></div>
          <p className="mt-2.5 max-w-2xl text-[15px] text-[#686868]">A prioritized list of improvements based on your actual Search Console performance.</p>
        </div>
        <button className="flex h-11 items-center gap-2 self-start rounded-xl border border-black bg-black px-4 text-[13px] font-semibold text-white shadow-[0_3px_12px_rgba(0,0,0,0.08)]"><Download className="size-4 text-[#70d6ff]" /> Export tasks</button>
      </div>

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#bceaff] bg-[#effaff] px-4 py-3 text-xs leading-5 text-[#555555]">
        <Info className="mt-0.5 size-4 shrink-0 text-black" />
        Opportunities are generated when a query has high impressions and low CTR, ranks between positions 4–20, or when a page loses 15%+ clicks versus the previous period.
      </div>

      <OpportunityList opportunities={opportunities} />
    </div>
  );
}
