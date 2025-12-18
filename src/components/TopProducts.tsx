import { TrendingUp, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TikTokProduct } from "@/hooks/useTikTokShop";

interface TopProductsProps {
  products: TikTokProduct[];
  isLoading: boolean;
}

export function TopProducts({ products, isLoading }: TopProductsProps) {
  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 card-gradient animate-slide-up" style={{ animationDelay: "300ms" }}>
        <h3 className="text-lg font-semibold mb-6">Produtos do Catálogo</h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="glass rounded-xl p-6 card-gradient animate-slide-up" style={{ animationDelay: "300ms" }}>
        <h3 className="text-lg font-semibold mb-6">Produtos do Catálogo</h3>
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum produto encontrado</p>
          <p className="text-sm">Adicione produtos na sua loja TikTok Shop</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass rounded-xl p-6 card-gradient animate-slide-up"
      style={{ animationDelay: "300ms" }}
    >
      <h3 className="text-lg font-semibold mb-6">Produtos do Catálogo</h3>
      <div className="space-y-4">
        {products.slice(0, 5).map((product, index) => {
          const price = product.skus?.[0]?.price?.sale_price 
            ? parseFloat(product.skus[0].price.sale_price) 
            : 0;
          
          return (
            <div
              key={product.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.title}</p>
                <p className="text-sm text-muted-foreground">
                  {product.status === 'ACTIVATE' ? 'Ativo' : product.status}
                  {price > 0 && ` · R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${product.status === 'ACTIVATE' ? 'text-primary' : 'text-muted-foreground'}`}>
                <TrendingUp className="w-4 h-4" />
                {product.sales || '--'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
