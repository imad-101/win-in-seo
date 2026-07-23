import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ACTIVE_SITE_COOKIE } from "@/lib/active-site";
import { opportunityTitle } from "@/lib/opportunities";
import type { Opportunity } from "@/lib/types";
import { listWorkspaceProperties } from "@/lib/workspace-properties";
import type { WorkspaceProperty } from "@/lib/workspace-properties";

export type { WorkspaceProperty } from "@/lib/workspace-properties";

const DAY_MS = 86_400_000;

interface DailyMetric {
  date: Date;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dailyRange(start: Date, end: Date, rows: DailyMetric[]) {
  const byDate = new Map(rows.map((row) => [dateKey(row.date), row]));
  const days: DailyMetric[] = [];
  for (let time = start.getTime(); time <= end.getTime(); time += DAY_MS) {
    const date = new Date(time);
    days.push(byDate.get(dateKey(date)) ?? { date, clicks: 0, impressions: 0, ctr: 0, position: 0 });
  }
  return days;
}

function summarizeDaily(rows: DailyMetric[]) {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  return {
    clicks,
    impressions,
    ctr: (clicks / Math.max(1, impressions)) * 100,
    position: rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / Math.max(1, impressions),
  };
}

export const getWorkspaceData = cache(async () => {
  if (!process.env.DATABASE_URL) redirect("/connect?error=missing_configuration");

  const [{ getPrisma }, { getCurrentUser }] = await Promise.all([
    import("@/lib/prisma"),
    import("@/lib/current-user"),
  ]);
  const user = await getCurrentUser();
  const prisma = getPrisma();
  const properties: WorkspaceProperty[] = await listWorkspaceProperties(user.id);
  if (!properties.length) redirect("/connect");

  const requestedSiteId = (await cookies()).get(ACTIVE_SITE_COOKIE)?.value;
  const activeProperty = properties.find((item) => item.id === requestedSiteId) ?? properties[0];
  const site = await prisma.site.findFirst({
    where: { id: activeProperty.id, userId: user.id },
    include: {
      performance: true,
      dailyPerformance: { orderBy: { date: "asc" } },
      opportunities: true,
    },
  });
  if (!site) redirect("/connect");

  const periodEnd = site.importPeriodEnd ?? site.lastSyncedAt ?? new Date();
  const periodStart = site.importPeriodStart ?? new Date(periodEnd.getTime() - 27 * DAY_MS);
  const previousEnd = new Date(periodStart.getTime() - DAY_MS);
  const previousStart = new Date(previousEnd.getTime() - 27 * DAY_MS);
  const currentDaily = dailyRange(periodStart, periodEnd, site.dailyPerformance);
  const previousDaily = dailyRange(previousStart, previousEnd, site.dailyPerformance);
  const hasDailyData = site.dailyPerformance.length > 0;

  const currentSummary = hasDailyData ? summarizeDaily(currentDaily) : {
    clicks: site.performance.reduce((sum, row) => sum + row.clicks, 0),
    impressions: site.performance.reduce((sum, row) => sum + row.impressions, 0),
    ctr: 0,
    position: 0,
  };
  if (!hasDailyData) {
    currentSummary.ctr = (currentSummary.clicks / Math.max(1, currentSummary.impressions)) * 100;
    currentSummary.position = site.performance.reduce(
      (sum, row) => sum + row.position * row.impressions,
      0,
    ) / Math.max(1, currentSummary.impressions);
  }
  const previousClicks = hasDailyData
    ? summarizeDaily(previousDaily).clicks
    : site.performance.reduce((sum, row) => sum + row.previousClicks, 0);

  const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
  const opportunities: Opportunity[] = site.opportunities.map((item) => ({
    id: item.id,
    type: item.type,
    title: opportunityTitle(item.type, item.pageUrl),
    pageUrl: item.pageUrl,
    keyword: item.targetKeyword,
    clicks: item.clicks,
    previousClicks: item.previousClicks,
    impressions: item.impressions,
    ctr: item.ctr,
    position: item.position,
    reason: item.reason,
    priority: item.priority,
    actions: Array.isArray(item.actions) ? item.actions.filter((action): action is string => typeof action === "string") : [],
    impact: item.type === "LOW_CTR"
      ? `A 1-point CTR lift could add about ${Math.round(item.impressions * 0.01)} clicks per month.`
      : item.type === "DECLINING_PAGE"
        ? `Recovering the lost traffic would restore about ${Math.max(0, item.previousClicks - item.clicks)} clicks per month.`
        : "Moving higher on page one could materially increase qualified clicks.",
    completed: item.status === "COMPLETED",
  })).sort((left, right) => {
    if (Boolean(left.completed) !== Boolean(right.completed)) return left.completed ? 1 : -1;
    const priorityDifference = priorityWeight[right.priority] - priorityWeight[left.priority];
    return priorityDifference || right.impressions - left.impressions;
  });

  return {
    source: "gsc" as const,
    metrics: {
      ...currentSummary,
      previousClicks,
      opportunityCount: opportunities.filter((item) => !item.completed).length,
    },
    trends: {
      clicks: currentDaily.map((row) => row.clicks),
      previousClicks: previousDaily.map((row) => row.clicks),
      impressions: currentDaily.map((row) => row.impressions),
      ctr: currentDaily.map((row) => row.ctr),
      position: currentDaily.map((row) => row.position),
      dates: currentDaily.map((row) => dateKey(row.date)),
    },
    opportunities,
    property: {
      id: site.id,
      url: site.url,
      label: site.displayName,
      permission: site.gscPermission ?? "Connected",
      lastSync: site.lastSyncedAt?.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) ?? "Not synced",
      opportunityCount: opportunities.filter((item) => !item.completed).length,
      metricRows: site.performance.length,
    },
    properties,
  };
});
