export type Category = "complaint" | "media" | "rumor" | "official";

export type Sentiment = "positive" | "negative" | "neutral";

export type Platform = "news" | "video" | "forum" | "social";

export interface OpinionItem {
  id: string;
  title: string;
  summary: string;
  category: Category;
  sentiment: Sentiment;
  platform: Platform;
  author: string;
  publishTime: string;
  heat: number;
  heatTrend: "up" | "down" | "flat";
  reads: number;
  comments: number;
  shares: number;
  region: string;
}

export interface BrandConfig {
  brandName: string;
  productModels: string[];
  batchNumbers: string[];
  recallKeywords: string[];
  competitors: string[];
}

export interface PropagationStep {
  stepType: 'complaint' | 'kols_forward' | 'media_cite' | 'official' | 'rumor';
  author: string;
  authorTitle: string;
  platform: string;
  content: string;
  publishTime: string;
  heat?: number;
}

export interface TimelineNode {
  id: string;
  time: string;
  type: "seed" | "spread" | "peak" | "response" | "decline";
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  opinionIds: string[];
  propagationChain?: PropagationStep[];
}

export interface SentimentPoint {
  time: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface ActionUpdate {
  id: string;
  time: string;
  operator: string;
  content: string;
}

export interface ActionRecord {
  id: string;
  title: string;
  description: string;
  riskLevel: "high" | "medium" | "low";
  department: "pr" | "legal" | "cs" | "qa";
  status: "pending" | "in_progress" | "done";
  owner: string;
  createdAt: string;
  deadline: string;
  relatedOpinionIds: string[];
  updates: ActionUpdate[];
}

export interface StatItem {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "flat";
  color: "red" | "orange" | "green" | "blue";
}
