import { useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { SalesChart } from "@/components/SalesChart";
import { TopProducts } from "@/components/TopProducts";
import { RecentOrders } from "@/components/RecentOrders";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = () => {
    toast({
      title: "Integração necessária",
      description:
        "Para conectar ao TikTok Shop, precisamos habilitar o backend. Clique em 'Conectar Lovable Cloud' para continuar.",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-6 pb-12">
        <Header />

        <div className="space-y-6">
          <ConnectionStatus isConnected={isConnected} onConnect={handleConnect} />

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MetricCard
              title="Receita Total"
              value="R$ 78.420"
              change="+12,5% vs mês anterior"
              changeType="positive"
              icon={DollarSign}
              delay={0}
            />
            <MetricCard
              title="Pedidos"
              value="847"
              change="+8,3% vs mês anterior"
              changeType="positive"
              icon={ShoppingCart}
              delay={50}
            />
            <MetricCard
              title="Produtos Ativos"
              value="156"
              change="3 novos esta semana"
              changeType="neutral"
              icon={Package}
              delay={100}
            />
            <MetricCard
              title="Clientes"
              value="2.431"
              change="+234 novos"
              changeType="positive"
              icon={Users}
              delay={150}
            />
            <MetricCard
              title="Taxa de Conversão"
              value="4,2%"
              change="+0,8% vs mês anterior"
              changeType="positive"
              icon={TrendingUp}
              delay={200}
            />
            <MetricCard
              title="Visualizações"
              value="48.2K"
              change="-2,1% vs mês anterior"
              changeType="negative"
              icon={Eye}
              delay={250}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart />
            <TopProducts />
          </div>

          {/* Recent Orders */}
          <RecentOrders />
        </div>
      </div>
    </div>
  );
};

export default Index;
