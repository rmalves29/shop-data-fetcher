import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "01/12", vendas: 4200, pedidos: 24 },
  { name: "02/12", vendas: 3800, pedidos: 21 },
  { name: "03/12", vendas: 5100, pedidos: 32 },
  { name: "04/12", vendas: 4600, pedidos: 28 },
  { name: "05/12", vendas: 6200, pedidos: 38 },
  { name: "06/12", vendas: 5800, pedidos: 35 },
  { name: "07/12", vendas: 7400, pedidos: 45 },
  { name: "08/12", vendas: 6900, pedidos: 42 },
  { name: "09/12", vendas: 8200, pedidos: 52 },
  { name: "10/12", vendas: 7800, pedidos: 48 },
  { name: "11/12", vendas: 9100, pedidos: 58 },
  { name: "12/12", vendas: 8600, pedidos: 54 },
];

export function SalesChart() {
  return (
    <div className="glass rounded-xl p-6 card-gradient animate-slide-up" style={{ animationDelay: "200ms" }}>
      <h3 className="text-lg font-semibold mb-6">Vendas nos Últimos 12 Dias</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174 72% 56%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(174 72% 56%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
            <XAxis
              dataKey="name"
              stroke="hsl(215 20% 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(215 20% 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 18% 10%)",
                border: "1px solid hsl(220 15% 18%)",
                borderRadius: "8px",
                color: "hsl(210 40% 98%)",
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Vendas"]}
            />
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="hsl(174 72% 56%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVendas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
