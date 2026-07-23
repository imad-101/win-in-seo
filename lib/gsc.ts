import "server-only";

import { createHash } from "node:crypto";
import type { GscRow } from "@/lib/types";

const GSC_API_BASE = "https://www.googleapis.com/webmasters/v3";
const PAGE_SIZE = 25_000;
const MAX_ROWS = 50_000;

export interface GscProperty {
  siteUrl: string;
  permissionLevel: string;
  displayName: string;
}

export interface GscDailyRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchAnalyticsRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
}

export interface SearchConsoleProvider {
  importPerformance(input: {
    siteUrl: string;
    startDate: string;
    endDate: string;
    accessToken?: string;
  }): Promise<GscRow[]>;
}

export class GscApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function googleApiFetch<T>(url: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const data = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) throw new GscApiError(data.error?.message ?? "Google Search Console request failed.", response.status);
  return data;
}

function propertyDisplayName(siteUrl: string) {
  if (siteUrl.startsWith("sc-domain:")) return siteUrl.replace("sc-domain:", "");
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return siteUrl;
  }
}

function permissionDisplayName(permissionLevel?: string) {
  const labels: Record<string, string> = {
    siteOwner: "Owner",
    siteFullUser: "Full user",
    siteRestrictedUser: "Restricted user",
    siteUnverifiedUser: "Unverified",
  };
  return labels[permissionLevel ?? ""] ?? permissionLevel ?? "Unknown";
}

export async function listGscProperties(accessToken: string): Promise<GscProperty[]> {
  const data = await googleApiFetch<{ siteEntry?: Array<{ siteUrl?: string; permissionLevel?: string }> }>(
    `${GSC_API_BASE}/sites`,
    accessToken,
  );
  return (data.siteEntry ?? [])
    .filter((site): site is { siteUrl: string; permissionLevel?: string } => Boolean(site.siteUrl))
    .map((site) => ({
      siteUrl: site.siteUrl,
      permissionLevel: permissionDisplayName(site.permissionLevel),
      displayName: propertyDisplayName(site.siteUrl),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function comparisonPeriod(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const previousEnd = new Date(start.getTime() - 86_400_000);
  const previousStart = new Date(previousEnd.getTime() - (days - 1) * 86_400_000);
  return { startDate: formatDate(previousStart), endDate: formatDate(previousEnd) };
}

async function queryRows(input: { accessToken: string; siteUrl: string; startDate: string; endDate: string }) {
  const rows: SearchAnalyticsRow[] = [];
  for (let startRow = 0; startRow < MAX_ROWS; startRow += PAGE_SIZE) {
    const data = await googleApiFetch<SearchAnalyticsResponse>(
      `${GSC_API_BASE}/sites/${encodeURIComponent(input.siteUrl)}/searchAnalytics/query`,
      input.accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          startDate: input.startDate,
          endDate: input.endDate,
          dimensions: ["page", "query"],
          dataState: "final",
          rowLimit: PAGE_SIZE,
          startRow,
        }),
      },
    );
    const batch = data.rows ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return rows;
}

export async function queryDailyPerformance(input: {
  accessToken: string;
  siteUrl: string;
  startDate: string;
  endDate: string;
}): Promise<GscDailyRow[]> {
  const data = await googleApiFetch<SearchAnalyticsResponse>(
    `${GSC_API_BASE}/sites/${encodeURIComponent(input.siteUrl)}/searchAnalytics/query`,
    input.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        startDate: input.startDate,
        endDate: input.endDate,
        dimensions: ["date"],
        dataState: "final",
        rowLimit: 250,
      }),
    },
  );

  return (data.rows ?? []).flatMap((row) => {
    const [date] = row.keys ?? [];
    if (!date) return [];
    return [{
      date,
      clicks: Math.round(row.clicks ?? 0),
      impressions: Math.round(row.impressions ?? 0),
      ctr: (row.ctr ?? 0) * 100,
      position: row.position ?? 0,
    }];
  });
}

export class GoogleSearchConsoleProvider implements SearchConsoleProvider {
  async importPerformance(input: {
    siteUrl: string;
    startDate: string;
    endDate: string;
    accessToken?: string;
  }): Promise<GscRow[]> {
    if (!input.accessToken) throw new Error("A Google access token is required.");
    const previous = comparisonPeriod(input.startDate, input.endDate);
    const [currentRows, previousRows] = await Promise.all([
      queryRows({ ...input, accessToken: input.accessToken }),
      queryRows({ ...previous, siteUrl: input.siteUrl, accessToken: input.accessToken }),
    ]);

    const previousByKey = new Map(
      previousRows.map((row) => [(row.keys ?? []).join("\u0000"), Math.round(row.clicks ?? 0)]),
    );

    const currentKeys = new Set(currentRows.map((row) => (row.keys ?? []).join("\u0000")));
    const current = currentRows.flatMap((row) => {
      const [pageUrl, query] = row.keys ?? [];
      if (!pageUrl || !query) return [];
      const key = `${pageUrl}\u0000${query}`;
      return [{
        id: createHash("sha1").update(key).digest("hex").slice(0, 16),
        pageUrl,
        query,
        clicks: Math.round(row.clicks ?? 0),
        previousClicks: previousByKey.get(key) ?? 0,
        impressions: Math.round(row.impressions ?? 0),
        ctr: (row.ctr ?? 0) * 100,
        position: row.position ?? 0,
      }];
    });

    const previousOnly = previousRows.flatMap((row) => {
      const [pageUrl, query] = row.keys ?? [];
      const key = (row.keys ?? []).join("\u0000");
      if (!pageUrl || !query || currentKeys.has(key)) return [];
      return [{
        id: createHash("sha1").update(key).digest("hex").slice(0, 16),
        pageUrl,
        query,
        clicks: 0,
        previousClicks: Math.round(row.clicks ?? 0),
        impressions: 0,
        ctr: 0,
        position: row.position ?? 0,
      }];
    });

    return [...current, ...previousOnly];
  }
}
