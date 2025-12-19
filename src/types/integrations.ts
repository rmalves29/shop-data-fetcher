// Tipos centralizados para todas as integrações

export type IntegrationType = 'tiktok_shop' | 'tiktok_ads';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

export type IntegrationRegion = 'BR' | 'US' | 'UK' | 'SEA' | 'GLOBAL';

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  icon: string;
  status: IntegrationStatus;
  connected: boolean;
  lastSync: string | null;
  error: string | null;
  region?: IntegrationRegion;
}

export interface IntegrationMetrics {
  integrationId: string;
  data: Record<string, number | string>;
  timestamp: string;
}

export interface SyncLog {
  id: string;
  integrationId: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: Record<string, unknown>;
}

export interface ConnectionConfig {
  integrationId: string;
  appKey?: string;
  appSecret?: string;
  accessToken?: string;
  advertiserId?: string;
  region?: IntegrationRegion;
  autoSync?: boolean;
  syncInterval?: number; // em minutos
}

// TikTok Shop Types
export interface TikTokShopData {
  shops: TikTokShop[];
  orders: TikTokOrder[];
  products: TikTokProduct[];
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    averageOrderValue: number;
  };
}

export interface TikTokShop {
  shop_id: string;
  shop_name: string;
  shop_cipher: string;
  region: string;
  status: string;
}

export interface TikTokOrder {
  order_id: string;
  order_status: string;
  payment_info: {
    total_amount: string;
    currency: string;
  };
  create_time: number;
  buyer_message?: string;
  line_items?: Array<{
    product_name: string;
    sku_name: string;
    quantity: number;
    sale_price: string;
  }>;
}

export interface TikTokProduct {
  id: string;
  title: string;
  status: string;
  sales?: number;
  skus?: Array<{
    id: string;
    price: {
      sale_price: string;
      original_price?: string;
    };
    stock_infos?: Array<{
      available_stock: number;
    }>;
  }>;
}

// TikTok Ads Types
export interface TikTokAdsData {
  advertisers: TikTokAdvertiser[];
  campaigns: TikTokCampaign[];
  adGroups: TikTokAdGroup[];
  reports: TikTokAdsReport[];
  metrics: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    ctr: number;
    cpc: number;
    roas: number;
  };
}

export interface TikTokAdvertiser {
  advertiser_id: string;
  advertiser_name: string;
  status: string;
  currency: string;
  timezone: string;
}

export interface TikTokCampaign {
  campaign_id: string;
  campaign_name: string;
  objective_type: string;
  status: string;
  budget: number;
  budget_mode: string;
}

export interface TikTokAdGroup {
  adgroup_id: string;
  adgroup_name: string;
  campaign_id: string;
  status: string;
  budget: number;
}

export interface TikTokAdsReport {
  dimensions: {
    campaign_id?: string;
    campaign_name?: string;
    adgroup_id?: string;
    stat_time_day?: string;
  };
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    conversion: number;
    cost_per_conversion: number;
    video_play_actions?: number;
    video_watched_2s?: number;
    video_watched_6s?: number;
  };
}

// Integration Context
export interface IntegrationsContextType {
  integrations: Integration[];
  syncLogs: SyncLog[];
  isLoading: boolean;
  refreshIntegration: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  connectIntegration: (id: string, config?: ConnectionConfig) => Promise<void>;
  disconnectIntegration: (id: string) => Promise<void>;
  getIntegrationData: (id: string) => TikTokShopData | TikTokAdsData | null;
  updateConfig: (id: string, config: Partial<ConnectionConfig>) => Promise<void>;
}
