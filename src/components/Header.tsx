import { Bell, Settings, RefreshCw, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="flex items-center justify-between py-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">TikTok</span>{" "}
          <span className="gradient-accent-text">Shop</span>{" "}
          <span className="text-foreground">Analytics</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe suas métricas de vendas em tempo real
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/integracoes">
          <Button variant="outline" size="icon" className="relative">
            <Link2 className="w-5 h-5" />
          </Button>
        </Link>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse-glow" />
        </Button>
        <Link to="/configuracoes">
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
        <Button variant="gradient" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar Dados
        </Button>
      </div>
    </header>
  );
}
