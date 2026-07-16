import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BarChart3, Check, Eye, Lightbulb, MousePointerClick, Target, TrendingDown } from "lucide-react";
import { CompletionToggle } from "@/components/completion-toggle";
import { Badge, PriorityBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { opportunityTypeLabels } from "@/lib/opportunities";
import { getWorkspaceData } from "@/lib/workspace-data";
import { formatNumber, formatPercent } from "@/lib/utils";

export default async function OpportunityDetailPage({ params }: PageProps<"/opportunities/[id]">) {
  const { id } = await params;
  const { opportunities, property } = await getWorkspaceData();
  const opportunity = opportunities.find((item) => item.id === id);
  if (!opportunity) notFound();

  const loss = opportunity.previousClicks - opportunity.clicks;
  const pageHref = opportunity.pageUrl.startsWith("http")
    ? opportunity.pageUrl
    : `${property.url.startsWith("http") ? property.url.replace(/\/$/, "") : `https://${property.label}`}${opportunity.pageUrl}`;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <Link href="/opportunities" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#707070] hover:text-black"><ArrowLeft className="size-3.5" /> Back to opportunities</Link>

      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2"><Badge>{opportunityTypeLabels[opportunity.type]}</Badge><PriorityBadge priority={opportunity.priority} /></div>
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.045em] text-black sm:text-[36px]">{opportunity.title}</h1>
          <p className="mt-3.5 flex flex-wrap items-center gap-2 text-[15px] text-[#686868]">Target keyword: <span className="font-semibold text-black">“{opportunity.keyword}”</span></p>
        </div>
        <CompletionToggle id={opportunity.id} initialCompleted={opportunity.completed} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="text-base font-semibold text-black">Why this matters</h2></CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3 rounded-xl bg-[#effaff] p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-black text-[#70d6ff] shadow-sm"><Lightbulb className="size-[18px]" /></span>
                <div><p className="text-sm leading-6 text-[#444444]">{opportunity.reason}</p><p className="mt-2 text-xs font-semibold text-black">{opportunity.impact}</p></div>
              </div>
              <a href={pageHref} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-between rounded-xl border border-[#e2e2df] px-4 py-3 text-xs font-medium text-[#555555] hover:bg-[#f7f7f5] hover:text-black"><span className="truncate">{pageHref}</span><ArrowRight className="ml-3 size-3.5 shrink-0" /></a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between"><div><h2 className="text-[18px] font-semibold text-black">Recommended actions</h2><p className="mt-1 text-xs text-[#777777]">Work through these in order for the clearest result.</p></div><span className="text-xs font-semibold text-[#737373]">~45 min</span></div>
            </CardHeader>
            <CardContent className="pt-3">
              <ol className="space-y-1">
                {opportunity.actions.map((action, index) => (
                  <li key={action} className="group flex items-start gap-3 rounded-xl p-3 hover:bg-[#effaff]">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#70d6ff] text-xs font-bold text-black">{index + 1}</span>
                    <div className="flex-1 border-b border-[#ededeb] pb-4 group-last:border-0 group-last:pb-0"><p className="text-sm font-semibold leading-5 text-black">{action}</p><p className="mt-1 text-xs leading-5 text-[#848484]">{index === 0 ? "Start here—this is the most direct lever for this opportunity." : "Keep the change focused on helping searchers complete their goal."}</p></div>
                    <span className="mt-0.5 flex size-5 items-center justify-center rounded-full border border-[#d0d0cc] text-transparent group-hover:border-black group-hover:text-black"><Check className="size-3" /></span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="border-[#bceaff] bg-[#effaff]">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div><p className="text-sm font-semibold text-black">Finished making the changes?</p><p className="mt-1 text-xs text-[#727272]">Mark this task complete and move on to your next best opportunity.</p></div>
              <CompletionToggle id={opportunity.id} initialCompleted={opportunity.completed} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader><h2 className="text-[16px] font-semibold text-black">Search performance</h2><p className="mt-1 text-xs text-[#7d7d7d]">Last 28 days</p></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pt-4">
              {[
                { label: "Clicks", value: formatNumber(opportunity.clicks), icon: MousePointerClick },
                { label: "Impressions", value: formatNumber(opportunity.impressions), icon: Eye },
                { label: "CTR", value: formatPercent(opportunity.ctr), icon: Target },
                { label: "Position", value: opportunity.position.toFixed(1), icon: BarChart3 },
              ].map((metric) => <div key={metric.label} className="rounded-xl bg-[#f7f7f5] p-3.5"><metric.icon className="size-4 text-black" /><p className="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-black">{metric.value}</p><p className="mt-0.5 text-[11px] font-medium text-[#7f7f7f]">{metric.label}</p></div>)}
            </CardContent>
          </Card>

          {opportunity.type === "DECLINING_PAGE" && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-lg bg-[#ff9770] text-black"><TrendingDown className="size-4" /></span><p className="text-xs font-semibold text-black">Click change</p></div>
                <div className="mt-4 flex items-end justify-between"><div><p className="text-2xl font-semibold text-black">-{formatNumber(loss)}</p><p className="text-[10px] text-[#8d8d8d]">clicks this period</p></div><p className="text-xs text-[#8d8d8d]">{formatNumber(opportunity.previousClicks)} → {formatNumber(opportunity.clicks)}</p></div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-black text-white">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-[#70d6ff]">Next in your queue</p>
              <p className="mt-2 text-sm font-semibold leading-5">{opportunities.find((item) => item.id !== opportunity.id)?.title}</p>
              <Link href={`/opportunities/${opportunities.find((item) => item.id !== opportunity.id)?.id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white">View next task <ArrowRight className="size-3.5" /></Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
