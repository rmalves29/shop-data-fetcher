import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { SalesChart } from "@/components/SalesChart";
import { TopProducts } from "@/components/TopProducts";
import { RecentOrders } from "@/components/RecentOrders";
import { useTikTokShop } from "@/hooks/useTikTokShop";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { 
    orders, 
    products, 
    isLoading, 
    error, 
    totalRevenue, 
    totalOrders, 
    totalProducts,
    refetch 
  } = useTikTokShop();

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-6 pb-12">
        <Header />

        <div className="space-y-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between glass rounded-xl p-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-3 h-3 rounded-full ${error ? 'bg-destructive' : 'bg-primary'} animate-pulse`} />
              <div className="flex-1">
                <span className={`text-sm ${error ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  {isLoading ? 'Carregando dados do TikTok Shop...' : 
                   error ? `⚠️ ${error}` : 
                   `Conectado · ${totalOrders} pedidos · ${totalProducts} produtos`}
                </span>
                {error && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Verifique sua conexão ou tente reconectar em Integrações
                  </p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-xl p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))
            ) : (
              <>
                <MetricCard
                  title="Receita Total"
                  value={formatCurrency(totalRevenue)}
                  change={totalOrders > 0 ? `${totalOrders} pedidos` : "Sem dados"}
                  changeType={totalRevenue > 0 ? "positive" : "neutral"}
                  icon={DollarSign}
                  delay={0}
                />
                <MetricCard
                  title="Pedidos"
                  value={totalOrders.toString()}
                  change="TikTok Shop"
                  changeType="positive"
                  icon={ShoppingCart}
                  delay={50}
                />
                <MetricCard
                  title="Produtos Ativos"
                  value={totalProducts.toString()}
                  change="Catálogo"
                  changeType="neutral"
                  icon={Package}
                  delay={100}
                />
                <MetricCard
                  title="Ticket Médio"
                  value={totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : "R$ 0,00"}
                  change="Por pedido"
                  changeType="neutral"
                  icon={Users}
                  delay={150}
                />
                <MetricCard
                  title="Taxa de Conversão"
                  value="--"
                  change="Em breve"
                  changeType="neutral"
                  icon={TrendingUp}
                  delay={200}
                />
                <MetricCard
                  title="Visualizações"
                  value="--"
                  change="Em breve"
                  changeType="neutral"
                  icon={Eye}
                  delay={250}
                />
              </>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart />
            <TopProducts products={products} isLoading={isLoading} />
          </div>

          {/* Recent Orders */}
          <RecentOrders orders={orders} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
