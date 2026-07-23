import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Sparkles,
  Target,
} from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { PerformanceChart } from "@/components/performance-chart";
import { TaskRow } from "@/components/task-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getWorkspaceData } from "@/lib/workspace-data";
import { formatNumber, formatPercent } from "@/lib/utils";

function shortDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  const firstName = clerkUser?.firstName ?? clerkUser?.username ?? "there";
  const { metrics: dashboardMetrics, opportunities, property, trends, weeklyProgress } = await getWorkspaceData();
  const clickChange = dashboardMetrics.previousClicks > 0
    ? ((dashboardMetrics.clicks - dashboardMetrics.previousClicks) / dashboardMetrics.previousClicks) * 100
    : null;
  const openOpportunities = opportunities.filter((opportunity) => !opportunity.completed);
  const topOpportunity = openOpportunities[0];
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  const periodLabel = trends.dates.length
    ? `${shortDate(trends.dates[0])} – ${shortDate(trends.dates[trends.dates.length - 1])}`
    : "No imported dates";
  const weeklyCompleted = Math.min(weeklyProgress.completed, weeklyProgress.goal);
  const weeklyRemaining = Math.max(0, weeklyProgress.goal - weeklyProgress.completed);
  const weeklyRatio = weeklyCompleted / weeklyProgress.goal;
  const weeklyCircumference = 276.5;
  const weeklyDashOffset = weeklyCircumference * (1 - weeklyRatio);
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[12px] font-semibold text-[#249fd0]">{today}</p>
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#14201c] sm:text-[36px]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-2.5 max-w-xl text-[14px] leading-6 text-[#6d7872]">
            Your clearest SEO priorities and recent search performance, all in one place.
          </p>
        </div>
        <button className="flex h-10 items-center gap-2 self-start rounded-xl border border-[#dfe4df] bg-white px-3.5 text-[12px] font-semibold text-[#43504a] shadow-sm transition-colors hover:border-[#cbd4cd] sm:self-auto">
          <CalendarDays className="size-4 text-[#249fd0]" />
          {periodLabel}
        </button>
      </header>

      <section aria-labelledby="performance-summary">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="performance-summary" className="text-[15px] font-semibold text-[#14201c]">Search performance</h2>
            <p className="mt-1 text-[12px] text-[#818a85]">Compared with the previous 28-day period</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6e7873]">
              <CheckCircle2 className="size-3.5 text-[#43b95f]" strokeWidth={2.2} /> Synced {property.lastSync}
            </span>
            <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#43504a] transition-colors hover:text-[#1689b8]">
              {dashboardMetrics.opportunityCount} open opportunities <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        <div className="grid gap-3 min-[380px]:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total clicks" value={formatNumber(dashboardMetrics.clicks)} change={clickChange === null ? undefined : `${Math.abs(clickChange).toFixed(1)}%`} positive={clickChange === null || clickChange >= 0} icon={MousePointerClick} note={clickChange === null ? "No previous-period clicks" : undefined} trend={trends.clicks} tone={clickChange === null || clickChange >= 0 ? "green" : "orange"} />
          <MetricCard label="Total impressions" value={formatNumber(dashboardMetrics.impressions)} icon={Eye} note="Latest 28 days" trend={trends.impressions} />
          <MetricCard label="Average CTR" value={formatPercent(dashboardMetrics.ctr, 1)} icon={Target} note="Clicks ÷ impressions" trend={trends.ctr} tone="green" />
          <MetricCard label="Average position" value={dashboardMetrics.position.toFixed(1)} icon={BarChart3} note="Impression-weighted" trend={trends.position} />
        </div>
      </section>

      <section className="mt-6 grid gap-5 min-[1380px]:grid-cols-[minmax(0,1.5fr)_minmax(330px,0.72fr)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1689b8]">
                <Sparkles className="size-3" /> Priority queue
              </div>
              <h2 className="text-[19px] font-semibold tracking-[-0.025em] text-[#14201c]">Your next best moves</h2>
              <p className="mt-1.5 text-[12px] leading-5 text-[#78827d]">Work from the top for the strongest potential return.</p>
            </div>
            <Link href="/opportunities" className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg px-3 text-[12px] font-semibold text-[#43504a] transition-colors hover:bg-[#effaff] hover:text-[#1689b8]">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {openOpportunities.slice(0, 5).map((opportunity, index) => (
              <TaskRow key={opportunity.id} opportunity={opportunity} rank={index + 1} />
            ))}
            {!openOpportunities.length && (
              <div className="flex min-h-40 flex-col items-center justify-center text-center">
                <CheckCircle2 className="size-6 text-[#54ce71]" />
                <p className="mt-2 text-sm font-semibold text-[#14201c]">No open opportunities</p>
                <p className="mt-1 text-xs text-[#78827d]">Your imported data has no unfinished recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {topOpportunity ? (
          <Card className="overflow-hidden border-[#14201c] bg-[#14201c] text-white shadow-[0_22px_50px_rgba(20,32,28,0.18)]">
            <CardContent className="flex h-full flex-col p-6 sm:p-7">
              <div className="mb-8 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#70d6ff] ring-1 ring-inset ring-white/10">
                  <Sparkles className="size-[18px]" />
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/60"><span className="size-1.5 rounded-full bg-[#ff9770]" /> {topOpportunity.priority.toLowerCase()} priority</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#70d6ff]">Biggest quick win</p>
              <h2 className="mt-3 max-w-md text-[23px] font-semibold leading-8 tracking-[-0.035em]">{topOpportunity.title}</h2>
              <p className="mt-3 max-w-lg text-[13px] leading-6 text-white/65">{topOpportunity.reason}</p>
              <div className="mt-7 grid grid-cols-3 gap-3 border-y border-white/10 py-5">
                <div><p className="text-[19px] font-semibold">{formatNumber(topOpportunity.impressions)}</p><p className="mt-1 text-[10px] text-white/45">Impressions</p></div>
                <div><p className="text-[19px] font-semibold">{formatPercent(topOpportunity.ctr)}</p><p className="mt-1 text-[10px] text-white/45">CTR</p></div>
                <div><p className="text-[19px] font-semibold">#{topOpportunity.position.toFixed(1)}</p><p className="mt-1 text-[10px] text-white/45">Position</p></div>
              </div>
              <Link href={`/opportunities/${topOpportunity.id}`} className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#70d6ff] px-5 text-[13px] font-bold text-[#10201a] transition-colors hover:bg-[#91e0ff]">
                Open recommendation <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <CheckCircle2 className="size-7 text-[#54ce71]" />
              <h2 className="mt-3 text-lg font-semibold text-[#14201c]">You’re all caught up</h2>
              <p className="mt-2 max-w-sm text-sm text-[#74807a]">Your latest import did not surface any urgent opportunities.</p>
            </CardContent>
          </Card>
        )}
      </section>

      <section id="performance" className="mt-6 grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#dcecf3] text-[#249fd0]"><BarChart3 className="size-4" strokeWidth={1.9} /></span>
              <div>
                <h2 className="text-[17px] font-semibold text-[#14201c]">Performance trend</h2>
                <p className="mt-1 text-[12px] text-[#7c8681]">Daily clicks from Google Search</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-[16px] font-semibold ${clickChange === null || clickChange >= 0 ? "text-[#2d9f48]" : "text-[#c45c39]"}`}>
                {clickChange === null ? "No prior data" : `${clickChange >= 0 ? "+" : "−"}${Math.abs(clickChange).toFixed(1)}%`}
              </p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-[#929a96]">period over period</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0"><PerformanceChart currentValues={trends.clicks} previousValues={trends.previousClicks} dates={trends.dates} /></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#cdebd5] text-[#43b95f]"><CheckCircle2 className="size-4" strokeWidth={1.9} /></span>
            <div>
              <h2 className="text-[17px] font-semibold text-[#14201c]">Weekly progress</h2>
              <p className="mt-1 text-[12px] text-[#7c8681]">Completed opportunities since Monday</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="relative flex size-24 shrink-0 items-center justify-center">
                <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" role="img" aria-label={`${weeklyProgress.completed} of ${weeklyProgress.goal} weekly tasks completed`}>
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#edf0ed" strokeWidth="8" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#80ed99" strokeWidth="8" strokeLinecap="round" strokeDasharray={weeklyCircumference} strokeDashoffset={weeklyDashOffset} />
                </svg>
                <div className="relative flex size-[74px] flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_#edf0ed]">
                  <span className="text-xl font-semibold text-[#14201c]">{weeklyCompleted}/{weeklyProgress.goal}</span>
                  <span className="text-[9px] text-[#8a938f]">complete</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#14201c]">{weeklyRemaining ? weeklyProgress.completed ? "A strong start" : "Ready when you are" : "Weekly goal reached"}</p>
                <p className="mt-1 text-xs leading-5 text-[#78827d]">
                  {weeklyRemaining
                    ? `Complete ${weeklyRemaining} more high-impact ${weeklyRemaining === 1 ? "task" : "tasks"} this week.`
                    : `${weeklyProgress.completed} ${weeklyProgress.completed === 1 ? "task" : "tasks"} completed this week.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
