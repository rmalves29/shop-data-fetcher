import {
  DollarSign,
  Eye,
  MousePointer,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdsMetricsProps {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  roas: number;
  isLoading: boolean;
}

export const AdsMetrics = ({
  totalSpend,
  totalImpressions,
  totalClicks,
  totalConversions,
  roas,
  isLoading,
}: AdsMetricsProps) => {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="glass animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Desempenho de Anúncios
          </CardTitle>
          <CardDescription>Métricas do TikTok Ads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalSpend === 0 && totalImpressions === 0) {
    return (
      <Card className="glass animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Desempenho de Anúncios
          </CardTitle>
          <CardDescription>Métricas do TikTok Ads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Conecte sua conta do TikTok Ads para ver as métricas aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Desempenho de Anúncios
        </CardTitle>
        <CardDescription>
          Dados dos últimos 7 dias · TikTok Ads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Gasto */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="w-4 h-4" />
              <span>Investimento</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p>
            <p className="text-xs text-muted-foreground">
              CPC: {formatCurrency(cpc)}
            </p>
          </div>

          {/* Impressões */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Eye className="w-4 h-4" />
              <span>Impressões</span>
            </div>
            <p className="text-2xl font-bold">
              {totalImpressions.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted-foreground">
              CTR: {ctr.toFixed(2)}%
            </p>
          </div>

          {/* Cliques */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MousePointer className="w-4 h-4" />
              <span>Cliques</span>
            </div>
            <p className="text-2xl font-bold">
              {totalClicks.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalImpressions > 0 ? `${ctr.toFixed(2)}% do total` : "Sem dados"}
            </p>
          </div>

          {/* Conversões */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Conversões</span>
            </div>
            <p className="text-2xl font-bold">
              {totalConversions.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted-foreground">
              Taxa: {conversionRate.toFixed(2)}%
            </p>
          </div>

          {/* ROAS */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Zap className="w-4 h-4" />
              <span>ROAS</span>
            </div>
            <p className={`text-2xl font-bold ${
              roas >= 2 ? "text-green-500" : 
              roas >= 1 ? "text-yellow-500" : 
              "text-red-500"
            }`}>
              {roas.toFixed(2)}x
            </p>
            <p className="text-xs text-muted-foreground">
              {roas >= 2 ? "Excelente" : roas >= 1 ? "Bom" : "Melhorar"}
            </p>
          </div>

          {/* Custo por Conversão */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="w-4 h-4" />
              <span>Custo/Conv.</span>
            </div>
            <p className="text-2xl font-bold">
              {totalConversions > 0 
                ? formatCurrency(totalSpend / totalConversions)
                : "R$ 0,00"}
            </p>
            <p className="text-xs text-muted-foreground">
              Por conversão
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
