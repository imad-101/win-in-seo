"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Filter, Search, SlidersHorizontal } from "lucide-react";
import { Badge, PriorityBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { setOpportunityCompletion, useCompletionOverrides } from "@/lib/completion-store";
import { opportunityTypeLabels } from "@/lib/opportunities";
import type { Opportunity, OpportunityType } from "@/lib/types";
import { cn, formatNumber, formatPercent } from "@/lib/utils";

type FilterType = "ALL" | OpportunityType | "COMPLETED";

const filters: { value: FilterType; label: string }[] = [
  { value: "ALL", label: "All opportunities" },
  { value: "LOW_CTR", label: "Low CTR" },
  { value: "STRIKING_DISTANCE", label: "Positions 4–20" },
  { value: "DECLINING_PAGE", label: "Losing clicks" },
  { value: "COMPLETED", label: "Completed" },
];

export function OpportunityList({ opportunities }: { opportunities: Opportunity[] }) {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [query, setQuery] = useState("");
  const completionOverrides = useCompletionOverrides();
  const isCompleted = (opportunity: Opportunity) => completionOverrides[opportunity.id] ?? opportunity.completed ?? false;

  const visible = opportunities.filter((opportunity) => {
    const completed = isCompleted(opportunity);
    const matchesFilter = filter === "ALL" || (filter === "COMPLETED" ? completed : opportunity.type === filter);
    const haystack = `${opportunity.title} ${opportunity.keyword} ${opportunity.pageUrl}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  });

  function markComplete(event: React.MouseEvent, opportunity: Opportunity) {
    event.preventDefault();
    setOpportunityCompletion(opportunity.id, !isCompleted(opportunity));
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button key={item.value} onClick={() => setFilter(item.value)} className={cn("h-9 shrink-0 rounded-xl border px-3.5 text-xs font-semibold transition-colors", filter === item.value ? "border-black bg-black text-white" : "border-[#dededb] bg-white text-[#636363] hover:border-[#70d6ff]")}>{item.label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#dededb] bg-white px-3 text-black xl:w-60">
            <Search className="size-4 shrink-0" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages or keywords" className="w-full bg-transparent text-xs text-black outline-none placeholder:text-[#999999]" />
          </label>
          <button aria-label="More filters" className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#dededb] bg-white text-black"><SlidersHorizontal className="size-4" /></button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[minmax(250px,1fr)_125px_70px_90px_85px_72px_82px] items-center gap-4 border-b border-[#e8e8e5] bg-[#f7f7f5] px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.09em] text-[#7f7f7f] lg:grid">
          <span>Opportunity</span><span>Keyword</span><span>Clicks</span><span>Impressions</span><span>CTR / Pos.</span><span>Priority</span><span>Status</span>
        </div>
        <div className="divide-y divide-[#ededeb]">
          {visible.map((opportunity) => {
            const completed = isCompleted(opportunity);
            return (
              <Link key={opportunity.id} href={`/opportunities/${opportunity.id}`} className={cn("group grid grid-cols-3 gap-4 px-4 py-[18px] transition-colors hover:bg-[#effaff] sm:px-5 lg:grid-cols-[minmax(250px,1fr)_125px_70px_90px_85px_72px_82px] lg:items-center", completed && "bg-[#f7f7f5] opacity-70")}>
                <div className="col-span-3 min-w-0 lg:col-span-1">
                  <div className="flex items-center gap-2">
                    {completed && <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#80ed99] text-black"><Check className="size-3" /></span>}
                    <p className={cn("truncate text-sm font-semibold text-black group-hover:text-[#1689b8]", completed && "line-through")}>{opportunity.title}</p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge className="px-2 py-0.5 text-[10px]">{opportunityTypeLabels[opportunity.type]}</Badge>
                    <span className="truncate text-[11px] text-[#8a8a8a]">{opportunity.pageUrl}</span>
                  </div>
                </div>
                <p className="hidden truncate text-xs font-medium text-[#555555] lg:block">{opportunity.keyword}</p>
                <div><span className="mr-1 text-[10px] text-[#989898] lg:hidden">Clicks</span><span className="text-xs font-semibold text-black">{formatNumber(opportunity.clicks)}</span></div>
                <div><span className="mr-1 text-[10px] text-[#989898] lg:hidden">Impr.</span><span className="text-xs font-semibold text-black">{formatNumber(opportunity.impressions)}</span></div>
                <div className="text-xs font-semibold text-black">{formatPercent(opportunity.ctr)} <span className="font-normal text-[#9a9a9a]">/ {opportunity.position.toFixed(1)}</span></div>
                <PriorityBadge priority={opportunity.priority} className="w-fit self-center" />
                <button onClick={(event) => markComplete(event, opportunity)} className={cn("col-span-2 flex h-8 w-fit items-center justify-center justify-self-end gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold transition-colors lg:col-span-1 lg:justify-self-start", completed ? "border-[#80ed99] bg-[#eaffef] text-black" : "border-[#dededb] bg-white text-[#616161] hover:border-black hover:text-black")} aria-label={completed ? "Mark opportunity as open" : "Mark opportunity completed"}><Check className="size-3.5" />{completed ? "Reopen" : "Done"}</button>
              </Link>
            );
          })}
          {visible.length === 0 && <div className="flex flex-col items-center px-6 py-16 text-center"><Filter className="size-6 text-black" /><p className="mt-3 text-sm font-semibold text-black">No matching opportunities</p><p className="mt-1 text-xs text-[#8a8a8a]">Try another filter or search term.</p></div>}
        </div>
      </Card>
      <p className="mt-4 text-center text-xs text-[#8f8f8f]">Showing {visible.length} of {opportunities.length} opportunities · Updated today</p>
    </>
  );
}
