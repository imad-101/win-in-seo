import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowRight, BarChart3, CalendarDays, Eye, MousePointerClick, Sparkles, Target } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { PerformanceChart } from "@/components/performance-chart";
import { TaskRow } from "@/components/task-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getWorkspaceData } from "@/lib/workspace-data";
import { formatNumber, formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  const firstName = clerkUser?.firstName ?? clerkUser?.username ?? "there";
  const { metrics: dashboardMetrics, opportunities } = await getWorkspaceData();
  const clickChange = ((dashboardMetrics.clicks - dashboardMetrics.previousClicks) / Math.max(1, dashboardMetrics.previousClicks)) * 100;
  const topOpportunity = opportunities[0];
  return (
    <div className="mx-auto max-w-[1460px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[13px] font-semibold text-[#1689b8]">Thursday, July 16</p>
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.045em] text-black sm:text-[36px]">Good morning, {firstName}</h1>
          <p className="mt-2.5 text-[15px] text-[#686868]">Here are the SEO improvements most worth your attention today.</p>
        </div>
        <button className="flex h-11 items-center gap-2.5 self-start rounded-xl border border-[#dededb] bg-white px-4 text-[13px] font-semibold text-black shadow-[0_3px_12px_rgba(0,0,0,0.05)] sm:self-auto">
          <CalendarDays className="size-[17px]" /> Last 28 days <span className="text-[#8d8d8d]">Jun 19 – Jul 16</span>
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-[16px] font-semibold text-black">Search performance</h2><p className="mt-0.5 text-xs text-[#808080]">A clear snapshot of the last 28 days</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full bg-[#eaffef] px-3 py-1.5 text-xs font-semibold text-black sm:inline-flex"><span className="size-2 rounded-full bg-[#80ed99] ring-1 ring-black/20" /> Data is up to date</span>
          <Link href="/opportunities" className="inline-flex items-center gap-2 rounded-full border border-[#dededb] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:border-[#70d6ff]"><Sparkles className="size-3.5 text-black" /> {dashboardMetrics.opportunityCount} open opportunities <ArrowRight className="size-3" /></Link>
        </div>
      </div>
      <div className="grid gap-4 min-[380px]:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total clicks" value={formatNumber(dashboardMetrics.clicks)} change={`${Math.abs(clickChange).toFixed(1)}%`} positive={clickChange >= 0} icon={MousePointerClick} />
        <MetricCard label="Total impressions" value={formatNumber(dashboardMetrics.impressions)} icon={Eye} note="latest 28 days" />
        <MetricCard label="Average CTR" value={formatPercent(dashboardMetrics.ctr, 1)} icon={Target} note="clicks ÷ impressions" />
        <MetricCard label="Average position" value={dashboardMetrics.position.toFixed(1)} icon={BarChart3} note="impression-weighted" />
      </div>

      <section className="mt-7 grid gap-6 min-[1400px]:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#dff5ff] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.09em] text-black"><Sparkles className="size-3" /> Action plan</div>
              <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-black">Your next best moves</h2>
              <p className="mt-1.5 text-[13px] text-[#747474]">Start at the top—these tasks have the strongest traffic potential.</p>
            </div>
            <Link href="/opportunities" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-black hover:bg-[#dff5ff]">View all {opportunities.length} <ArrowRight className="size-3.5" /></Link>
          </CardHeader>
          <CardContent className="pt-2">
            {opportunities.slice(0, 5).map((opportunity, index) => <TaskRow key={opportunity.id} opportunity={opportunity} rank={index + 1} />)}
          </CardContent>
        </Card>

        {topOpportunity ? <Card className="overflow-hidden border-black bg-black text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
          <CardContent className="flex h-full flex-col p-7 lg:p-8">
            <div className="mb-8 flex items-center justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-[#70d6ff] text-black"><Sparkles className="size-5" /></span><span className="rounded-full bg-[#ff9770] px-3 py-1 text-[11px] font-bold text-black">High priority</span></div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#70d6ff]">Biggest quick win</p>
            <h2 className="mt-3 max-w-md text-[24px] font-semibold leading-8 tracking-[-0.035em]">{topOpportunity.title}</h2>
            <p className="mt-4 max-w-lg text-[14px] leading-6 text-white/70">{topOpportunity.reason}</p>
            <div className="mt-7 grid grid-cols-3 gap-3 border-y border-white/12 py-5">
              <div><p className="text-[21px] font-semibold">{formatNumber(topOpportunity.impressions)}</p><p className="mt-1 text-[11px] text-white/55">Impressions</p></div>
              <div><p className="text-[21px] font-semibold">{formatPercent(topOpportunity.ctr)}</p><p className="mt-1 text-[11px] text-white/55">CTR</p></div>
              <div><p className="text-[21px] font-semibold">#{topOpportunity.position.toFixed(1)}</p><p className="mt-1 text-[11px] text-white/55">Position</p></div>
            </div>
            <Link href={`/opportunities/${topOpportunity.id}`} className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#70d6ff] px-5 text-[14px] font-bold text-black hover:bg-[#91e0ff]">Open recommendation <ArrowRight className="size-4" /></Link>
          </CardContent>
        </Card> : <Card><CardContent className="flex h-full min-h-72 flex-col items-center justify-center text-center"><Sparkles className="size-6 text-black" /><h2 className="mt-3 text-lg font-semibold text-black">No urgent opportunities</h2><p className="mt-2 max-w-sm text-sm text-[#737373]">Your latest import did not trigger any of the current MVP opportunity rules.</p></CardContent></Card>}
      </section>

      <section id="performance" className="mt-7 grid scroll-mt-24 gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div><h2 className="text-[18px] font-semibold text-black">Performance trend</h2><p className="mt-1 text-[13px] text-[#777777]">Daily clicks from Google Search</p></div>
            <div className="text-right"><p className="text-lg font-semibold text-black">+8.7%</p><p className="text-[10px] text-[#8b8b8b]">period over period</p></div>
          </CardHeader>
          <CardContent className="pt-0"><PerformanceChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-[18px] font-semibold text-black">Weekly progress</h2><p className="mt-1 text-[13px] text-[#777777]">Your 3-task focus</p></CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="relative flex size-24 items-center justify-center rounded-full" style={{ background: "conic-gradient(#80ed99 0 33%, #ededeb 33% 100%)" }}><div className="flex size-[72px] flex-col items-center justify-center rounded-full bg-white"><span className="text-xl font-semibold text-black">1/3</span><span className="text-[9px] text-[#888888]">complete</span></div></div>
              <div><p className="text-sm font-semibold text-black">A strong start</p><p className="mt-1 text-xs leading-5 text-[#777777]">Complete 2 more high-impact tasks this week.</p></div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
