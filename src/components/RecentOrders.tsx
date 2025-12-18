import { Package, Clock, CheckCircle2, Truck, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TikTokOrder } from "@/hooks/useTikTokShop";

interface RecentOrdersProps {
  orders: TikTokOrder[];
  isLoading: boolean;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  COMPLETED: {
    label: "Entregue",
    icon: CheckCircle2,
    color: "text-primary bg-primary/10",
  },
  DELIVERED: {
    label: "Entregue",
    icon: CheckCircle2,
    color: "text-primary bg-primary/10",
  },
  IN_TRANSIT: {
    label: "Enviado",
    icon: Truck,
    color: "text-accent bg-accent/10",
  },
  SHIPPED: {
    label: "Enviado",
    icon: Truck,
    color: "text-accent bg-accent/10",
  },
  AWAITING_SHIPMENT: {
    label: "Processando",
    icon: Clock,
    color: "text-muted-foreground bg-muted",
  },
  UNPAID: {
    label: "Aguardando Pagamento",
    icon: AlertCircle,
    color: "text-yellow-500 bg-yellow-500/10",
  },
  CANCELLED: {
    label: "Cancelado",
    icon: AlertCircle,
    color: "text-destructive bg-destructive/10",
  },
};

const defaultStatus = {
  label: "Pendente",
  icon: Clock,
  color: "text-muted-foreground bg-muted",
};

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d atrás`;
  if (hours > 0) return `${hours}h atrás`;
  return "Agora";
}

export function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 card-gradient animate-slide-up" style={{ animationDelay: "400ms" }}>
        <h3 className="text-lg font-semibold mb-6">Pedidos Recentes</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="glass rounded-xl p-6 card-gradient animate-slide-up" style={{ animationDelay: "400ms" }}>
        <h3 className="text-lg font-semibold mb-6">Pedidos Recentes</h3>
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum pedido encontrado</p>
          <p className="text-sm">Os pedidos aparecerão aqui quando houver vendas</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass rounded-xl p-6 card-gradient animate-slide-up"
      style={{ animationDelay: "400ms" }}
    >
      <h3 className="text-lg font-semibold mb-6">Pedidos Recentes</h3>
      <div className="space-y-3">
        {orders.slice(0, 10).map((order) => {
          const status = statusConfig[order.order_status] || defaultStatus;
          const StatusIcon = status.icon;
          const amount = parseFloat(order.payment_info?.total_amount || '0');
          const productName = order.line_items?.[0]?.product_name || 'Produto';

          return (
            <div
              key={order.order_id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">#{order.order_id.slice(-8)}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(order.create_time)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {productName}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {order.payment_info?.currency || 'BRL'} {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
