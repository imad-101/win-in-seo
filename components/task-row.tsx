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

const typeStyle = {
  LOW_CTR: "border-[#c9edfc] bg-[#effaff] text-[#1689b8]",
  STRIKING_DISTANCE: "border-[#cdebd5] bg-[#eaffef] text-[#2d8f45]",
  DECLINING_PAGE: "border-[#ffd8ca] bg-[#fff0eb] text-[#c45c39]",
};

export function TaskRow({ opportunity, rank }: { opportunity: Opportunity; rank: number }) {
  const Icon = typeIcon[opportunity.type];
  return (
    <Link href={`/opportunities/${opportunity.id}`} className="group -mx-2 flex items-center gap-3 rounded-xl border-b border-[#eaede9] px-3 py-[17px] transition-colors last:border-0 hover:bg-[#f5f9f6] sm:gap-4">
      <span className="hidden w-6 text-center text-xs font-bold text-[#989898] sm:block">{rank}</span>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${typeStyle[opportunity.type]}`}><Icon className="size-[18px]" strokeWidth={1.9} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14px] font-semibold text-[#14201c] group-hover:text-[#1689b8]">{opportunity.title}</p>
          <PriorityBadge priority={opportunity.priority} className="hidden sm:inline-flex" />
        </div>
        <p className="mt-1.5 truncate text-[12px] text-[#77817c]">{opportunity.keyword} · {opportunityTypeLabels[opportunity.type]}</p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-[#14201c]">{formatNumber(opportunity.impressions)}</p>
        <p className="mt-0.5 text-[11px] text-[#8e8e8e]">impressions</p>
      </div>
      <ArrowRight className="size-4 text-[#a2a2a2] transition-transform group-hover:translate-x-0.5 group-hover:text-black" />
    </Link>
  );
}
