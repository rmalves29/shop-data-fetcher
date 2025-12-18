import { AlertCircle, Plug, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface ConnectionStatusProps {
  isConnected: boolean;
  onConnect?: () => void;
}

export function ConnectionStatus({ isConnected, onConnect }: ConnectionStatusProps) {
  if (isConnected) {
    return (
      <div className="glass rounded-xl p-4 flex items-center gap-3 border-primary/30 animate-slide-up">
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-medium">Conectado ao TikTok Shop</span>
        <span className="text-xs text-muted-foreground">Última atualização: há 5 min</span>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border-accent/30 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-accent/10">
          <AlertCircle className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Conecte sua conta TikTok Shop</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Para puxar dados automaticamente, você precisa conectar sua conta do TikTok Shop.
            Os dados exibidos atualmente são demonstrativos.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="gradient" className="gap-2" onClick={onConnect}>
              <Plug className="w-4 h-4" />
              Conectar TikTok Shop
            </Button>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Como obter API?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
