export interface ShopifyRecord {
  'Day'?: string;
  'Utm campaign': string;
  'Utm term': string;
  'Landing page url': string;
  'Online store visitors': number;
  'Sessions': number;
  'Sessions with cart additions': number;
  'Sessions that reached checkout': number;
  'Average session duration': number;
  'Pageviews': number;
}

export interface CampaignMetrics {
  utmCampaign: string;
  totalCustomers: number;
  totalSessions: number;
  sessionsPerCustomer: number;
  avgSessionDuration: number;
  checkoutSessions: number;
  checkoutRate: number;
  cartAdditions: number;
  cartRate: number;
  pageviews: number;
  qualityScore: number;
  performanceTier: 'excellent' | 'good' | 'average' | 'poor';
  adSpend?: number; // Total ad spend across Meta/Google for this campaign
}

export interface KeyMetrics {
  // Campaign Information Row
  uniqueCampaigns: number;
  avgAdsetsPerCampaign: number;
  avgTrafficPerCampaign: number;
  
  // User Behavior Row
  totalUniqueUsers: number;
  totalSessions: number;
  avgSessionTime: number;
  avgPageviewsPerSession: number;
  
  // Funnel Data (BOF) Row
  totalATC: number;
  totalCheckoutSessions: number;
  overallConversionRate: number;
  totalRevenue: number;
}

export interface DateRange {
  start: Date;
  end: Date;
  days: number;
}

export interface PerformanceTiers {
  excellent: number;
  good: number;
  average: number;
  poor: number;
}

export interface UTMCampaign {
  utmCampaign: string;
  sessions?: number;
  totalSessions?: number;
  conversionRate?: number;
  checkoutRate?: number;
  performanceTier: 'excellent' | 'good' | 'average' | 'poor';
  adSpend?: number;
  checkoutSessions?: number;
}

export interface DashboardData {
  keyMetrics: KeyMetrics;
  campaigns: CampaignMetrics[];
  lastUpdated: string;
  dateRange?: DateRange;
  utmCampaigns?: UTMCampaign[];
  performanceTiers?: PerformanceTiers;
  topLevelData?: any[]; // Store original daily metrics for export
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}