import type { GscRow, Opportunity, Priority } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const priorityWeight: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

export function displayPageUrl(pageUrl: string) {
  if (!pageUrl.startsWith("http")) return pageUrl;
  try {
    const url = new URL(pageUrl);
    return `${url.pathname}${url.search}` || "/";
  } catch {
    return pageUrl;
  }
}

export function opportunityTitle(type: Opportunity["type"], pageUrl: string) {
  const page = displayPageUrl(pageUrl);
  if (type === "LOW_CTR") return `Improve ${page}`;
  if (type === "STRIKING_DISTANCE") return `Move ${page} onto page one`;
  return `Recover traffic to ${page}`;
}

const actions = {
  LOW_CTR: [
    "Rewrite the page title around the target keyword",
    "Make the meta description more specific and benefit-led",
    "Align the opening paragraph with the search intent",
    "Review the current search results for stronger wording ideas",
  ],
  STRIKING_DISTANCE: [
    "Expand the section that answers this query",
    "Add the keyword naturally to a relevant heading",
    "Add an FAQ that covers related follow-up questions",
    "Build internal links from two related high-authority pages",
  ],
  DECLINING_PAGE: [
    "Compare the page with its previous best-performing version",
    "Refresh outdated examples, screenshots, and claims",
    "Check indexing, cannibalization, and recent SERP changes",
    "Strengthen internal links and republish after the update",
  ],
};

function lowCtrPriority(row: GscRow): Priority {
  if (row.impressions >= 4000 && row.position <= 10) return "HIGH";
  return row.impressions >= 1800 ? "MEDIUM" : "LOW";
}

function rankingPriority(row: GscRow): Priority {
  if (row.impressions >= 2500 && row.position <= 10) return "HIGH";
  return row.impressions >= 1500 ? "MEDIUM" : "LOW";
}

export function detectOpportunities(rows: GscRow[]): Opportunity[] {
  const opportunities: Opportunity[] = [];

  for (const row of rows) {
    if (row.impressions >= 1000 && row.ctr < 2.2) {
      opportunities.push({
        id: `${row.id}-low-ctr`,
        type: "LOW_CTR",
        title: opportunityTitle("LOW_CTR", row.pageUrl),
        pageUrl: row.pageUrl,
        keyword: row.query,
        clicks: row.clicks,
        previousClicks: row.previousClicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        reason: `This keyword has ${formatNumber(row.impressions)} impressions, ranks at position ${row.position.toFixed(1)}, and its ${row.ctr.toFixed(1)}% CTR is lower than expected.`,
        priority: lowCtrPriority(row),
        actions: actions.LOW_CTR,
        impact: `A 1-point CTR lift could add about ${formatNumber(row.impressions * 0.01)} clicks per month.`,
      });
    } else if (row.impressions > 0 && row.position >= 4 && row.position <= 20) {
      opportunities.push({
        id: `${row.id}-ranking`,
        type: "STRIKING_DISTANCE",
        title: opportunityTitle("STRIKING_DISTANCE", row.pageUrl),
        pageUrl: row.pageUrl,
        keyword: row.query,
        clicks: row.clicks,
        previousClicks: row.previousClicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        reason: `This keyword already earns ${formatNumber(row.impressions)} impressions and ranks at position ${row.position.toFixed(1)}—close enough for focused on-page improvements to matter.`,
        priority: rankingPriority(row),
        actions: actions.STRIKING_DISTANCE,
        impact: row.position <= 10 ? "A move into the top 3 could materially increase qualified clicks." : "Reaching page one would make this query much more visible.",
      });
    }

  }

  const pages = new Map<string, {
    clicks: number;
    previousClicks: number;
    impressions: number;
    weightedPosition: number;
    bestRow: GscRow;
  }>();

  for (const row of rows) {
    const page = pages.get(row.pageUrl);
    if (!page) {
      pages.set(row.pageUrl, {
        clicks: row.clicks,
        previousClicks: row.previousClicks,
        impressions: row.impressions,
        weightedPosition: row.position * row.impressions,
        bestRow: row,
      });
      continue;
    }
    page.clicks += row.clicks;
    page.previousClicks += row.previousClicks;
    page.impressions += row.impressions;
    page.weightedPosition += row.position * row.impressions;
    if (row.impressions > page.bestRow.impressions) page.bestRow = row;
  }

  for (const [pageUrl, page] of pages) {
    const lossPercent = ((page.previousClicks - page.clicks) / page.previousClicks) * 100;
    if (page.previousClicks > 0 && lossPercent >= 15) {
      const priority: Priority = lossPercent >= 25 ? "HIGH" : "MEDIUM";
      opportunities.push({
        id: `${page.bestRow.id}-page-decline`,
        type: "DECLINING_PAGE",
        title: opportunityTitle("DECLINING_PAGE", pageUrl),
        pageUrl,
        keyword: page.bestRow.query,
        clicks: page.clicks,
        previousClicks: page.previousClicks,
        impressions: page.impressions,
        ctr: page.impressions ? (page.clicks / page.impressions) * 100 : 0,
        position: page.impressions ? page.weightedPosition / page.impressions : page.bestRow.position,
        reason: `Page clicks fell ${lossPercent.toFixed(0)}% versus the previous period, from ${formatNumber(page.previousClicks)} to ${formatNumber(page.clicks)}.`,
        priority,
        actions: actions.DECLINING_PAGE,
        impact: `Recovering the lost traffic would restore about ${formatNumber(page.previousClicks - page.clicks)} clicks per month.`,
      });
    }
  }

  return opportunities.sort((a, b) => {
    const byPriority = priorityWeight[b.priority] - priorityWeight[a.priority];
    return byPriority || b.impressions - a.impressions;
  });
}

export const opportunityTypeLabels = {
  LOW_CTR: "Low CTR",
  STRIKING_DISTANCE: "Ranking opportunity",
  DECLINING_PAGE: "Losing clicks",
} as const;
