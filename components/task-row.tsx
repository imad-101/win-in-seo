import Link from "next/link";
import { ArrowRight, BarChart2, MousePointerClick, TrendingDown } from "lucide-react";
import { PriorityBadge } from "@/components/ui/badge";
import { opportunityTypeLabels } from "@/lib/opportunities";
import type { Opportunity } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const typeIcon = {
  LOW_CTR: MousePointerClick,
  STRIKING_DISTANCE: BarChart2,
  DECLINING_PAGE: TrendingDown,
};

export function TaskRow({ opportunity, rank }: { opportunity: Opportunity; rank: number }) {
  const Icon = typeIcon[opportunity.type];
  return (
    <Link href={`/opportunities/${opportunity.id}`} className="group flex items-center gap-3 border-b border-[#e9e9e6] px-1 py-[18px] last:border-0 sm:gap-4">
      <span className="hidden w-6 text-center text-xs font-bold text-[#989898] sm:block">{rank}</span>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#dff5ff] text-black"><Icon className="size-[19px]" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-semibold text-black group-hover:text-[#1689b8]">{opportunity.title}</p>
          <PriorityBadge priority={opportunity.priority} className="hidden sm:inline-flex" />
        </div>
        <p className="mt-1.5 truncate text-[13px] text-[#707070]">{opportunity.keyword} · {opportunityTypeLabels[opportunity.type]}</p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-black">{formatNumber(opportunity.impressions)}</p>
        <p className="mt-0.5 text-[11px] text-[#8e8e8e]">impressions</p>
      </div>
      <ArrowRight className="size-4 text-[#a2a2a2] transition-transform group-hover:translate-x-0.5 group-hover:text-black" />
    </Link>
  );
}
