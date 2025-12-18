import { Package, Clock, CheckCircle2, Truck } from "lucide-react";

const orders = [
  {
    id: "#TK-2847",
    customer: "Maria Silva",
    product: "Camiseta Básica Preta",
    value: 89.9,
    status: "entregue",
    time: "2h atrás",
  },
  {
    id: "#TK-2846",
    customer: "João Santos",
    product: "Tênis Esportivo Premium",
    value: 299.9,
    status: "enviado",
    time: "4h atrás",
  },
  {
    id: "#TK-2845",
    customer: "Ana Costa",
    product: "Bolsa Transversal Couro",
    value: 159.9,
    status: "processando",
    time: "5h atrás",
  },
  {
    id: "#TK-2844",
    customer: "Pedro Lima",
    product: "Relógio Digital Smart",
    value: 249.9,
    status: "entregue",
    time: "8h atrás",
  },
  {
    id: "#TK-2843",
    customer: "Carla Mendes",
    product: "Óculos de Sol Vintage",
    value: 129.9,
    status: "enviado",
    time: "12h atrás",
  },
];

const statusConfig = {
  entregue: {
    label: "Entregue",
    icon: CheckCircle2,
    color: "text-primary bg-primary/10",
  },
  enviado: {
    label: "Enviado",
    icon: Truck,
    color: "text-accent bg-accent/10",
  },
  processando: {
    label: "Processando",
    icon: Clock,
    color: "text-muted-foreground bg-muted",
  },
};

export function RecentOrders() {
  return (
    <div
      className="glass rounded-xl p-6 card-gradient animate-slide-up"
      style={{ animationDelay: "400ms" }}
    >
      <h3 className="text-lg font-semibold mb-6">Pedidos Recentes</h3>
      <div className="space-y-3">
        {orders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          return (
            <div
              key={order.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.id}</p>
                  <span className="text-xs text-muted-foreground">{order.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {order.customer} · {order.product}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  R$ {order.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
