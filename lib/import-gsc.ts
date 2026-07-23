import "server-only";

import { getCurrentUser } from "@/lib/current-user";
import { getValidGscAccessToken } from "@/lib/gsc-connection";
import { GoogleSearchConsoleProvider, listGscProperties, queryDailyPerformance } from "@/lib/gsc";
import { detectOpportunities } from "@/lib/opportunities";
import { getPrisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateInSearchConsoleTimezone() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(`${value.year}-${value.month}-${value.day}T00:00:00Z`);
}

export function defaultImportPeriod() {
  const end = dateInSearchConsoleTimezone();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

function displayName(siteUrl: string) {
  if (siteUrl.startsWith("sc-domain:")) return siteUrl.replace("sc-domain:", "");
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return siteUrl;
  }
}

export async function importGscSite(input: { siteUrl: string; origin: string }) {
  const prisma = getPrisma();
  const user = await getCurrentUser();
  const { accessToken, connection } = await getValidGscAccessToken(user.id, input.origin);
  const properties = await listGscProperties(accessToken);
  const property = properties.find((item) => item.siteUrl === input.siteUrl);
  if (!property) throw new Error("The selected property is not available to this Google account.");

  const period = defaultImportPeriod();
  const previousEnd = new Date(`${period.startDate}T00:00:00Z`);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - 27);
  const [rows, dailyRows] = await Promise.all([
    new GoogleSearchConsoleProvider().importPerformance({
      ...period,
      siteUrl: input.siteUrl,
      accessToken,
    }),
    queryDailyPerformance({
      siteUrl: input.siteUrl,
      accessToken,
      startDate: formatDate(previousStart),
      endDate: period.endDate,
    }),
  ]);
  const detected = detectOpportunities(rows);
  const periodStart = new Date(`${period.startDate}T00:00:00Z`);
  const periodEnd = new Date(`${period.endDate}T00:00:00Z`);

  const site = await prisma.$transaction(async (tx) => {
    const savedSite = await tx.site.upsert({
      where: { userId_url: { userId: user.id, url: input.siteUrl } },
      update: {
        gscConnectionId: connection.id,
        displayName: property.displayName || displayName(input.siteUrl),
        gscPermission: property.permissionLevel,
        lastSyncedAt: new Date(),
        importPeriodStart: periodStart,
        importPeriodEnd: periodEnd,
      },
      create: {
        userId: user.id,
        gscConnectionId: connection.id,
        url: input.siteUrl,
        displayName: property.displayName || displayName(input.siteUrl),
        gscPermission: property.permissionLevel,
        lastSyncedAt: new Date(),
        importPeriodStart: periodStart,
        importPeriodEnd: periodEnd,
      },
    });

    await tx.gscMetric.deleteMany({ where: { siteId: savedSite.id } });
    await tx.gscDailyMetric.deleteMany({ where: { siteId: savedSite.id } });

    for (let index = 0; index < rows.length; index += 1_000) {
      await tx.gscMetric.createMany({
        data: rows.slice(index, index + 1_000).map((row) => ({
          siteId: savedSite.id,
          pageUrl: row.pageUrl,
          query: row.query,
          clicks: row.clicks,
          previousClicks: row.previousClicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
          periodStart,
          periodEnd,
        })),
      });
    }

    if (dailyRows.length) {
      await tx.gscDailyMetric.createMany({
        data: dailyRows.map((row) => ({
          siteId: savedSite.id,
          date: new Date(`${row.date}T00:00:00Z`),
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        })),
      });
    }

    for (const item of detected) {
      const opportunityData = {
        type: item.type,
        priority: item.priority,
        pageUrl: item.pageUrl,
        targetKeyword: item.keyword,
        clicks: item.clicks,
        previousClicks: item.previousClicks,
        impressions: item.impressions,
        ctr: item.ctr,
        position: item.position,
        reason: item.reason,
        actions: item.actions,
      };
      await tx.opportunity.upsert({
        where: { siteId_sourceKey: { siteId: savedSite.id, sourceKey: item.id } },
        update: opportunityData,
        create: { siteId: savedSite.id, sourceKey: item.id, ...opportunityData },
      });
    }
    const currentSourceKeys = new Set(detected.map((item) => item.id));
    const persistedOpportunities = await tx.opportunity.findMany({
      where: { siteId: savedSite.id },
      select: { sourceKey: true },
    });
    const staleSourceKeys = persistedOpportunities
      .map((item) => item.sourceKey)
      .filter((sourceKey) => !currentSourceKeys.has(sourceKey));

    for (let index = 0; index < staleSourceKeys.length; index += 500) {
      await tx.opportunity.deleteMany({
        where: {
          siteId: savedSite.id,
          sourceKey: { in: staleSourceKeys.slice(index, index + 500) },
        },
      });
    }
    return savedSite;
  }, { timeout: 120_000 });

  return {
    site,
    period,
    importedRows: rows.length,
    importedDays: dailyRows.length,
    opportunities: detected.length,
  };
}
