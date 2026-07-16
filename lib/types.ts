export type OpportunityType = "LOW_CTR" | "STRIKING_DISTANCE" | "DECLINING_PAGE";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface GscRow {
  id: string;
  pageUrl: string;
  query: string;
  clicks: number;
  previousClicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  pageUrl: string;
  keyword: string;
  clicks: number;
  previousClicks: number;
  impressions: number;
  ctr: number;
  position: number;
  reason: string;
  priority: Priority;
  actions: string[];
  impact: string;
  completed?: boolean;
}
