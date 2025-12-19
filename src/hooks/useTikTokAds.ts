import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  saveAdsData,
  getAdsData,
  getConnectionStatus,
  setConnectionStatus,
  DBAds,
} from "@/lib/indexedDB";

export interface TikTokAdvertiser {
  advertiser_id: string;
  advertiser_name: string;
  status: string;
}

export interface TikTokCampaign {
  campaign_id: string;
  campaign_name: string;
  budget: number;
  status: string;
  objective_type: string;
}

export interface TikTokAdsReport {
  date: string;
  campaign_id?: string;
  campaign_name?: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversion: number;
  cost_per_conversion: number;
}

export interface TikTokAdsData {
  advertisers: TikTokAdvertiser[];
  campaigns: TikTokCampaign[];
  reports: TikTokAdsReport[];
  isLoading: boolean;
  error: string | null;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  roas: number;
  isConnected: boolean;
  lastSync: string | null;
}

export function useTikTokAds() {
  const [data, setData] = useState<TikTokAdsData>({
    advertisers: [],
    campaigns: [],
    reports: [],
    isLoading: true,
    error: null,
    totalSpend: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    roas: 0,
    isConnected: false,
    lastSync: null,
  });
  const { toast } = useToast();

  // Load cached data from IndexedDB on mount
  const loadCachedData = useCallback(async () => {
    try {
      const status = getConnectionStatus();
      const cachedAds = await getAdsData();

      if (cachedAds.length > 0) {
        const totalSpend = cachedAds.reduce((sum, ad) => sum + ad.spend, 0);
        const totalConversions = cachedAds.reduce((sum, ad) => sum + ad.conversions, 0);
        const totalClicks = cachedAds.reduce((sum, ad) => sum + ad.clicks, 0);
        const roas = totalSpend > 0 ? totalConversions / totalSpend : 0;

        setData(prev => ({
          ...prev,
          reports: cachedAds.map(ad => ({
            date: ad.date,
            campaign_name: ad.campaign,
            spend: ad.spend,
            impressions: 0,
            clicks: ad.clicks,
            ctr: 0,
            cpc: 0,
            cpm: 0,
            conversion: ad.conversions,
            cost_per_conversion: ad.conversions > 0 ? ad.spend / ad.conversions : 0,
          })),
          totalSpend,
          totalClicks,
          totalConversions,
          roas,
          isConnected: status.ads,
          lastSync: status.last_sync,
        }));
      }
    } catch (error) {
      console.error('Error loading cached ads data:', error);
    }
  }, []);

  const fetchData = useCallback(async (startDate?: string, endDate?: string) => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // First get advertisers
      const advertisersResponse = await supabase.functions.invoke('tiktok-ads-api', {
        body: { action: 'get_advertisers' }
      });

      console.log('Advertisers response:', advertisersResponse);

      if (advertisersResponse.error) {
        throw new Error(advertisersResponse.error.message || 'Failed to fetch advertisers');
      }

      const advertisersData = advertisersResponse.data;

      if (advertisersData.code !== 0) {
        // Token invalid or expired - mark as disconnected
        setConnectionStatus({ ads: false });

        // Handle token expiration specifically
        if (advertisersData.code === 40100 || advertisersData.message?.includes('access token')) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            isConnected: false,
            error: 'Token expirado. Clique em "Conectar TikTok Ads" para reconectar.',
          }));
          return;
        }

        throw new Error(advertisersData.message || 'TikTok Ads API error');
      }

      const advertisers = advertisersData.data?.list || [];

      if (advertisers.length === 0) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          advertisers: [],
          isConnected: false,
          error: 'Nenhuma conta de anunciante encontrada. Verifique se a conta foi autorizada corretamente.'
        }));
        return;
      }

      const advertiserId = advertisers[0]?.advertiser_id;

      // Fetch campaigns and reports in parallel
      const [campaignsResponse, reportsResponse] = await Promise.all([
        supabase.functions.invoke('tiktok-ads-api', {
          body: { 
            action: 'get_campaigns', 
            advertiser_id: advertiserId,
            filtering: { status: 'STATUS_ENABLE' }
          }
        }),
        supabase.functions.invoke('tiktok-ads-api', {
          body: { 
            action: 'get_reports', 
            advertiser_id: advertiserId,
            start_date: startDate,
            end_date: endDate,
            dimensions: ['campaign_id', 'stat_time_day'],
            metrics: [
              'spend',
              'impressions',
              'clicks',
              'ctr',
              'cpc',
              'cpm',
              'conversion',
              'cost_per_conversion',
            ]
          }
        })
      ]);

      console.log('Campaigns response:', campaignsResponse);
      console.log('Reports response:', reportsResponse);

      const campaigns = campaignsResponse.data?.data?.list || [];
      const reports = reportsResponse.data?.data?.list || [];

      // Calculate totals
      const totalSpend = reports.reduce((sum: number, report: TikTokAdsReport) => {
        return sum + (parseFloat(String(report.spend)) || 0);
      }, 0);

      const totalImpressions = reports.reduce((sum: number, report: TikTokAdsReport) => {
        return sum + (parseInt(String(report.impressions)) || 0);
      }, 0);

      const totalClicks = reports.reduce((sum: number, report: TikTokAdsReport) => {
        return sum + (parseInt(String(report.clicks)) || 0);
      }, 0);

      const totalConversions = reports.reduce((sum: number, report: TikTokAdsReport) => {
        return sum + (parseInt(String(report.conversion)) || 0);
      }, 0);

      // ROAS = Revenue / Ad Spend (assuming conversion value = 1x spend for simplicity)
      const roas = totalSpend > 0 ? (totalConversions / totalSpend) : 0;

      // Save to IndexedDB
      const dbAds: DBAds[] = reports.map((report: TikTokAdsReport) => ({
        date: report.date,
        campaign: report.campaign_name || 'Unknown',
        spend: parseFloat(String(report.spend)) || 0,
        clicks: parseInt(String(report.clicks)) || 0,
        conversions: parseInt(String(report.conversion)) || 0,
        roas: parseFloat(String(report.cost_per_conversion)) || 0,
      }));

      await saveAdsData(dbAds);

      // Update connection status
      const now = new Date().toISOString();
      setConnectionStatus({ ads: true, last_sync: now });

      setData({
        advertisers,
        campaigns,
        reports,
        isLoading: false,
        error: null,
        totalSpend,
        totalImpressions,
        totalClicks,
        totalConversions,
        roas,
        isConnected: true,
        lastSync: now,
      });

      toast({
        title: "Dados do TikTok Ads atualizados",
        description: `${campaigns.length} campanhas e ${reports.length} relatórios sincronizados.`,
      });

    } catch (error) {
      console.error('Error fetching TikTok Ads data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados';

      // Keep cached data but show error
      const status = getConnectionStatus();
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isConnected: status.ads,
        lastSync: status.last_sync,
      }));

      toast({
        title: "Erro ao carregar dados do TikTok Ads",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadCachedData().then(() => {
      const status = getConnectionStatus();
      if (status.ads) {
        fetchData();
      } else {
        setData(prev => ({ ...prev, isLoading: false }));
      }
    });
  }, [loadCachedData, fetchData]);

  return { ...data, refetch: fetchData };
}
