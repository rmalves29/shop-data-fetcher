import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  DollarSign,
  Package,
  ShoppingBag,
  Eye,
  MousePointer,
  TrendingUp,
  Radio,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { MetricsGrid, MetricItem } from '@/components/integrations/MetricItem';
import { SyncLogs } from '@/components/integrations/SyncLogs';

const IntegrationsNew = () => {
  const {
    integrations,
    syncLogs,
    isLoading,
    refreshIntegration,
    refreshAll,
    connectIntegration,
    disconnectIntegration,
    getIntegrationData,
  } = useIntegrations();

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR');
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Obter integração do TikTok Shop
  const shopIntegration = integrations.find((i) => i.id === 'tiktok_shop');
  const shopData = getIntegrationData('tiktok_shop');

  // Obter integração do TikTok Ads
  const adsIntegration = integrations.find((i) => i.id === 'tiktok_ads');
  const adsData = getIntegrationData('tiktok_ads');

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-6 pb-12">
        {/* Header */}
        <header className="flex items-center justify-between py-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="gradient-text">Integrações</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas conexões com TikTok
              </p>
            </div>
          </div>
          <Button
            onClick={refreshAll}
            disabled={isLoading}
            variant="gradient"
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Sincronizar Tudo
          </Button>
        </header>

        <div className="space-y-6">
          {/* TikTok Shop Card */}
          {shopIntegration && (
            <IntegrationCard
              integration={shopIntegration}
              onConnect={() => connectIntegration('tiktok_shop')}
              onDisconnect={() => disconnectIntegration('tiktok_shop')}
              onSync={() => refreshIntegration('tiktok_shop')}
              isSyncing={shopIntegration.status === 'syncing'}
              metrics={
                shopData && shopIntegration.connected ? (
                  <MetricsGrid columns={4}>
                    <MetricItem
                      label="Pedidos"
                      value={formatNumber(shopData.metrics.totalOrders)}
                      icon={<Package className="w-4 h-4" />}
                    />
                    <MetricItem
                      label="Receita"
                      value={formatCurrency(shopData.metrics.totalRevenue)}
                      icon={<DollarSign className="w-4 h-4" />}
                    />
                    <MetricItem
                      label="Produtos"
                      value={formatNumber(shopData.metrics.totalProducts)}
                      icon={<ShoppingBag className="w-4 h-4" />}
                    />
                    <MetricItem
                      label="Ticket Médio"
                      value={formatCurrency(shopData.metrics.averageOrderValue)}
                      icon={<TrendingUp className="w-4 h-4" />}
                    />
                  </MetricsGrid>
                ) : null
              }
            />
          )}

          {/* TikTok Ads Card */}
          {adsIntegration && (
            <IntegrationCard
              integration={adsIntegration}
              onConnect={() => connectIntegration('tiktok_ads')}
              onDisconnect={() => disconnectIntegration('tiktok_ads')}
              onSync={() => refreshIntegration('tiktok_ads')}
              isSyncing={adsIntegration.status === 'syncing'}
              metrics={
                adsData && adsIntegration.connected ? (
                  <MetricsGrid columns={5}>
                    <MetricItem
                      label="Investimento"
                      value={formatCurrency(adsData.metrics.totalSpend)}
                      icon={<DollarSign className="w-4 h-4" />}
                    />
                    <MetricItem
                      label="Impressões"
                      value={formatNumber(adsData.metrics.totalImpressions)}
                      icon={<Eye className="w-4 h-4" />}
                    />
                    <MetricItem
                      label="Cliques"
                      value={formatNumber(adsData.metrics.totalClicks)}
                      icon={<MousePointer className="w-4 h-4" />}
                    />
                    <MetricItem
                      label="CTR"
                      value={formatPercentage(adsData.metrics.ctr)}
                      icon={<Radio className="w-4 h-4" />}
                    />
                    <MetricItem
                      label="ROAS"
                      value={`${adsData.metrics.roas.toFixed(2)}x`}
                      icon={<Zap className="w-4 h-4" />}
                      trend={
                        adsData.metrics.roas >= 2
                          ? 'up'
                          : adsData.metrics.roas >= 1
                          ? 'neutral'
                          : 'down'
                      }
                    />
                  </MetricsGrid>
                ) : null
              }
            />
          )}

          {/* Sync Logs */}
          <SyncLogs logs={syncLogs} maxHeight="400px" />
        </div>
      </div>
    </div>
  );
};

export default IntegrationsNew;
