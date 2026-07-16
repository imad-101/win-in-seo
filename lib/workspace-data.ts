import "server-only";

import { mockProperty } from "@/lib/mock-data";
import { dashboardMetrics as mockMetrics, opportunities as mockOpportunities, opportunityTitle } from "@/lib/opportunities";
import type { Opportunity } from "@/lib/types";

export interface WorkspaceProperty {
  url: string;
  label: string;
  permission: string;
  lastSync: string;
}

const mockWorkspace = {
  source: "mock" as const,
  metrics: mockMetrics,
  opportunities: mockOpportunities,
  property: mockProperty,
};

export async function getWorkspaceData() {
  if (!process.env.DATABASE_URL) return mockWorkspace;
  try {
    const [{ getPrisma }, { getCurrentUser }] = await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/current-user"),
    ]);
    const user = await getCurrentUser();
    const site = await getPrisma().site.findFirst({
      where: { userId: user.id, lastSyncedAt: { not: null } },
      orderBy: { lastSyncedAt: "desc" },
      include: { performance: true, opportunities: true },
    });
    if (!site || !site.performance.length) return mockWorkspace;

    const clicks = site.performance.reduce((sum, row) => sum + row.clicks, 0);
    const previousClicks = site.performance.reduce((sum, row) => sum + row.previousClicks, 0);
    const impressions = site.performance.reduce((sum, row) => sum + row.impressions, 0);
    const position = site.performance.reduce((sum, row) => sum + row.position * row.impressions, 0) / Math.max(1, impressions);
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
        clicks,
        previousClicks,
        impressions,
        ctr: (clicks / Math.max(1, impressions)) * 100,
        position,
        opportunityCount: opportunities.filter((item) => !item.completed).length,
      },
      opportunities,
      property: {
        url: site.url,
        label: site.displayName,
        permission: site.gscPermission ?? "Connected",
        lastSync: site.lastSyncedAt?.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) ?? "Not synced",
      },
    };
  } catch (error) {
    console.error("Falling back to mock workspace data:", error);
    return mockWorkspace;
  }
}
