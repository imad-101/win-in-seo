import "server-only";

import { getPrisma } from "@/lib/prisma";

export interface WorkspaceProperty {
  id: string;
  url: string;
  label: string;
  permission: string;
  lastSync: string;
  opportunityCount: number;
  metricRows: number;
}

export async function listWorkspaceProperties(userId: string): Promise<WorkspaceProperty[]> {
  const sites = await getPrisma().site.findMany({
    where: { userId, lastSyncedAt: { not: null } },
    orderBy: { lastSyncedAt: "desc" },
    select: {
      id: true,
      url: true,
      displayName: true,
      gscPermission: true,
      lastSyncedAt: true,
      _count: {
        select: {
          performance: true,
          opportunities: { where: { status: "OPEN" } },
        },
      },
    },
  });

  return sites.map((site) => ({
    id: site.id,
    url: site.url,
    label: site.displayName,
    permission: site.gscPermission ?? "Connected",
    lastSync: site.lastSyncedAt?.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) ?? "Not synced",
    opportunityCount: site._count.opportunities,
    metricRows: site._count.performance,
  }));
}
