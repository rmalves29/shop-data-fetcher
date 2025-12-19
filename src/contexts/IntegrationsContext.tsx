import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Integration,
  IntegrationsContextType,
  SyncLog,
  ConnectionConfig,
  TikTokShopData,
  TikTokAdsData,
} from '@/types/integrations';
import { useTikTokShop } from '@/hooks/useTikTokShop';
import { useTikTokAds } from '@/hooks/useTikTokAds';
import { useToast } from '@/hooks/use-toast';
import { getConnectionStatus, setConnectionStatus } from '@/lib/indexedDB';

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export function IntegrationsProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Hooks das integrações
  const tiktokShop = useTikTokShop();
  const tiktokAds = useTikTokAds();

  // Estado das integrações
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'tiktok_shop',
      type: 'tiktok_shop',
      name: 'TikTok Shop',
      description: 'Pedidos, produtos e vendas',
      icon: 'ShoppingBag',
      status: 'disconnected',
      connected: false,
      lastSync: null,
      error: null,
    },
    {
      id: 'tiktok_ads',
      type: 'tiktok_ads',
      name: 'TikTok Ads',
      description: 'Campanhas, gastos e conversões',
      icon: 'Megaphone',
      status: 'disconnected',
      connected: false,
      lastSync: null,
      error: null,
    },
  ]);

  // Atualizar status das integrações baseado nos hooks
  useEffect(() => {
    setIntegrations((prev) =>
      prev.map((integration) => {
        if (integration.id === 'tiktok_shop') {
          return {
            ...integration,
            status: tiktokShop.isLoading
              ? 'syncing'
              : tiktokShop.error
              ? 'error'
              : tiktokShop.isConnected
              ? 'connected'
              : 'disconnected',
            connected: tiktokShop.isConnected,
            lastSync: tiktokShop.lastSync,
            error: tiktokShop.error,
          };
        }
        if (integration.id === 'tiktok_ads') {
          return {
            ...integration,
            status: tiktokAds.isLoading
              ? 'syncing'
              : tiktokAds.error
              ? 'error'
              : tiktokAds.isConnected
              ? 'connected'
              : 'disconnected',
            connected: tiktokAds.isConnected,
            lastSync: tiktokAds.lastSync,
            error: tiktokAds.error,
          };
        }
        return integration;
      })
    );
  }, [
    tiktokShop.isLoading,
    tiktokShop.isConnected,
    tiktokShop.lastSync,
    tiktokShop.error,
    tiktokAds.isLoading,
    tiktokAds.isConnected,
    tiktokAds.lastSync,
    tiktokAds.error,
  ]);

  // Adicionar log de sincronização
  const addSyncLog = useCallback((log: Omit<SyncLog, 'id' | 'timestamp'>) => {
    const newLog: SyncLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    setSyncLogs((prev) => [newLog, ...prev].slice(0, 50)); // Manter últimos 50 logs
  }, []);

  // Sincronizar integração específica
  const refreshIntegration = useCallback(
    async (id: string) => {
      try {
        addSyncLog({
          integrationId: id,
          status: 'success',
          message: `Iniciando sincronização de ${id}`,
        });

        if (id === 'tiktok_shop') {
          await tiktokShop.refetch();
          addSyncLog({
            integrationId: id,
            status: 'success',
            message: `TikTok Shop sincronizado: ${tiktokShop.totalOrders} pedidos, ${tiktokShop.totalProducts} produtos`,
          });
        } else if (id === 'tiktok_ads') {
          await tiktokAds.refetch();
          addSyncLog({
            integrationId: id,
            status: 'success',
            message: `TikTok Ads sincronizado: ${tiktokAds.campaigns.length} campanhas`,
          });
        }

        toast({
          title: 'Sincronização concluída',
          description: `${id} atualizado com sucesso`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        addSyncLog({
          integrationId: id,
          status: 'error',
          message: `Erro ao sincronizar ${id}: ${errorMessage}`,
        });

        toast({
          title: 'Erro na sincronização',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    [tiktokShop, tiktokAds, addSyncLog, toast]
  );

  // Sincronizar todas as integrações
  const refreshAll = useCallback(async () => {
    setIsGlobalLoading(true);
    try {
      await Promise.all([
        refreshIntegration('tiktok_shop'),
        refreshIntegration('tiktok_ads'),
      ]);

      toast({
        title: 'Sincronização completa',
        description: 'Todas as integrações foram atualizadas',
      });
    } catch (error) {
      toast({
        title: 'Erro na sincronização',
        description: 'Ocorreu um erro ao sincronizar as integrações',
        variant: 'destructive',
      });
    } finally {
      setIsGlobalLoading(false);
    }
  }, [refreshIntegration, toast]);

  // Conectar integração
  const connectIntegration = useCallback(
    async (id: string, config?: ConnectionConfig) => {
      try {
        if (id === 'tiktok_shop') {
          const appKey = import.meta.env.VITE_TIKTOK_APP_KEY;
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const redirectUri = encodeURIComponent(
            `${supabaseUrl}/functions/v1/tiktok-auth-callback`
          );
          const state = 'shop_auth_' + Date.now();
          const authUrl = `https://services.tiktokglobalshop.com/open/authorize?app_key=${appKey}&redirect_uri=${redirectUri}&state=${state}`;
          window.location.href = authUrl;
        } else if (id === 'tiktok_ads') {
          const appId = import.meta.env.VITE_TIKTOK_APP_KEY;
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const redirectUri = encodeURIComponent(
            `${supabaseUrl}/functions/v1/tiktok-ads-callback`
          );
          const state = 'ads_auth_' + Date.now();
          const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=${appId}&redirect_uri=${redirectUri}&state=${state}`;
          window.location.href = authUrl;
        }

        addSyncLog({
          integrationId: id,
          status: 'success',
          message: `Redirecionando para autenticação ${id}`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        addSyncLog({
          integrationId: id,
          status: 'error',
          message: `Erro ao conectar ${id}: ${errorMessage}`,
        });
      }
    },
    [addSyncLog]
  );

  // Desconectar integração
  const disconnectIntegration = useCallback(
    async (id: string) => {
      try {
        if (id === 'tiktok_shop') {
          setConnectionStatus({ shop: false });
        } else if (id === 'tiktok_ads') {
          setConnectionStatus({ ads: false });
        }

        addSyncLog({
          integrationId: id,
          status: 'warning',
          message: `${id} desconectado`,
        });

        toast({
          title: 'Integração desconectada',
          description: `${id} foi desconectado com sucesso`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        toast({
          title: 'Erro ao desconectar',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    [addSyncLog, toast]
  );

  // Obter dados da integração
  const getIntegrationData = useCallback(
    (id: string): TikTokShopData | TikTokAdsData | null => {
      if (id === 'tiktok_shop') {
        return {
          shops: tiktokShop.shops,
          orders: tiktokShop.orders,
          products: tiktokShop.products,
          metrics: {
            totalRevenue: tiktokShop.totalRevenue,
            totalOrders: tiktokShop.totalOrders,
            totalProducts: tiktokShop.totalProducts,
            averageOrderValue:
              tiktokShop.totalOrders > 0
                ? tiktokShop.totalRevenue / tiktokShop.totalOrders
                : 0,
          },
        };
      } else if (id === 'tiktok_ads') {
        return {
          advertisers: tiktokAds.advertisers,
          campaigns: tiktokAds.campaigns,
          adGroups: [],
          reports: tiktokAds.reports,
          metrics: {
            totalSpend: tiktokAds.totalSpend,
            totalImpressions: tiktokAds.totalImpressions,
            totalClicks: tiktokAds.totalClicks,
            totalConversions: tiktokAds.totalConversions,
            ctr: tiktokAds.totalImpressions > 0 
              ? (tiktokAds.totalClicks / tiktokAds.totalImpressions) * 100 
              : 0,
            cpc: tiktokAds.totalClicks > 0 
              ? tiktokAds.totalSpend / tiktokAds.totalClicks 
              : 0,
            roas: tiktokAds.roas,
          },
        };
      }
      return null;
    },
    [tiktokShop, tiktokAds]
  );

  // Atualizar configuração
  const updateConfig = useCallback(
    async (id: string, config: Partial<ConnectionConfig>) => {
      try {
        // Salvar configurações no localStorage
        const currentConfig = localStorage.getItem(`integration_config_${id}`);
        const newConfig = {
          ...(currentConfig ? JSON.parse(currentConfig) : {}),
          ...config,
        };
        localStorage.setItem(`integration_config_${id}`, JSON.stringify(newConfig));

        addSyncLog({
          integrationId: id,
          status: 'success',
          message: `Configuração de ${id} atualizada`,
        });

        toast({
          title: 'Configuração salva',
          description: 'As configurações foram atualizadas',
        });
      } catch (error) {
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar as configurações',
          variant: 'destructive',
        });
      }
    },
    [addSyncLog, toast]
  );

  const value: IntegrationsContextType = {
    integrations,
    syncLogs,
    isLoading: isGlobalLoading,
    refreshIntegration,
    refreshAll,
    connectIntegration,
    disconnectIntegration,
    getIntegrationData,
    updateConfig,
  };

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
}
