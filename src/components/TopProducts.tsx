import { TrendingUp, Package } from "lucide-react";

const products = [
  { name: "Camiseta Básica Preta", vendas: 234, receita: 7020, trend: 12 },
  { name: "Tênis Esportivo Premium", vendas: 189, receita: 28350, trend: 8 },
  { name: "Bolsa Transversal Couro", vendas: 156, receita: 15600, trend: 15 },
  { name: "Relógio Digital Smart", vendas: 142, receita: 21300, trend: -3 },
  { name: "Óculos de Sol Vintage", vendas: 128, receita: 6400, trend: 22 },
];

export function TopProducts() {
  return (
    <div
      className="glass rounded-xl p-6 card-gradient animate-slide-up"
      style={{ animationDelay: "300ms" }}
    >
      <h3 className="text-lg font-semibold mb-6">Produtos Mais Vendidos</h3>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.name}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.vendas} vendas · R$ {product.receita.toLocaleString("pt-BR")}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                product.trend > 0 ? "text-primary" : "text-destructive"
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 ${product.trend < 0 ? "rotate-180" : ""}`}
              />
              {Math.abs(product.trend)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
