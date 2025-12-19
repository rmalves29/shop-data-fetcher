import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Megaphone,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  Radio,
  MousePointer,
  TrendingUp,
  Eye,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTikTokShop } from "@/hooks/useTikTokShop";
import { useToast } from "@/hooks/use-toast";

const Integracoes = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { shops, isLoading, error, refetch, totalOrders, totalProducts, totalRevenue } = useTikTokShop();
  const [autoSync, setAutoSync] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const isShopConnected = shops.length > 0 && !error;
  const isAdsConnected = false; // TikTok Ads não implementado ainda

  // Check for connection/error messages from OAuth callback
  useEffect(() => {
    if (searchParams.get('tiktok_connected') === 'true') {
      toast({
        title: "✅ TikTok Shop conectado!",
        description: "Sua conta foi conectada com sucesso. Sincronizando dados...",
      });
      refetch();
    }
    
    const tiktokError = searchParams.get('tiktok_error');
    if (tiktokError) {
      toast({
        title: "❌ Erro ao conectar TikTok Shop",
        description: decodeURIComponent(tiktokError),
        variant: "destructive",
      });
    }

    const adsError = searchParams.get('tiktok_ads_error');
    if (adsError) {
      toast({
        title: "❌ Erro ao conectar TikTok Ads",
        description: decodeURIComponent(adsError),
        variant: "destructive",
      });
    }

    if (searchParams.get('tiktok_ads_connected') === 'true') {
      toast({
        title: "✅ TikTok Ads conectado!",
        description: "Sua conta de anúncios foi conectada com sucesso.",
      });
    }
  }, [searchParams, toast, refetch]);

  const handleConnectShop = () => {
    // Redireciona para o fluxo OAuth do TikTok Shop
    const appKey = import.meta.env.VITE_TIKTOK_APP_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectUri = encodeURIComponent(`${supabaseUrl}/functions/v1/tiktok-auth-callback`);
    const state = "shop_auth_" + Date.now();
    // Use TikTok Global Shop endpoint (mais estável)
    const authUrl = `https://services.tiktokglobalshop.com/open/authorize?app_key=${appKey}&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = authUrl;
  };

  const handleConnectAds = () => {
    // TikTok Marketing API OAuth - usa o mesmo app mas escopo diferente
    const appId = import.meta.env.VITE_TIKTOK_APP_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectUri = encodeURIComponent(`${supabaseUrl}/functions/v1/tiktok-ads-callback`);
    const state = "ads_auth_" + Date.now();
    // TikTok Marketing API requer autenticação via business.tiktok.com
    const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=${appId}&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = authUrl;
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await refetch();
      toast({
        title: "Sincronização concluída",
        description: "Dados atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen">
      <div className="container max-w-5xl mx-auto px-6 pb-12">
        {/* Header */}
        <header className="flex items-center justify-between py-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="gradient-text">Integrações</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Conecte suas contas do TikTok
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Card TikTok Shop */}
          <Card className="glass border-border/50 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">TikTok Shop – Vendas & Live</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pedidos, produtos e vendas por live
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isShopConnected ? (
                    <span className="flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="w-4 h-4" />
                      Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-sm text-destructive">
                      <XCircle className="w-4 h-4" />
                      Não conectado
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isShopConnected ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Última sync: {new Date().toLocaleString("pt-BR")}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Package className="w-4 h-4" />
                        Pedidos
                      </div>
                      <p className="text-lg font-semibold">{totalOrders}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <DollarSign className="w-4 h-4" />
                        Vendas
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <ShoppingBag className="w-4 h-4" />
                        Produtos
                      </div>
                      <p className="text-lg font-semibold">{totalProducts}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Radio className="w-4 h-4" />
                        Vendas por Live
                      </div>
                      <p className="text-lg font-semibold">--</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSyncNow} disabled={isSyncing}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                      Sincronizar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => {
                      toast({
                        title: "Desconectar",
                        description: "Para desconectar, remova o Access Token nas configurações.",
                      });
                    }}>
                      Desconectar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-dashed border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Dados disponíveis após conectar:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">Pedidos</span>
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">Vendas</span>
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">Produtos</span>
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">Vendas por Live</span>
                    </div>
                  </div>
                  
                  <Button onClick={handleConnectShop} className="gap-2" variant="gradient">
                    <Zap className="w-4 h-4" />
                    Conectar TikTok Shop
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card TikTok Ads */}
          <Card className="glass border-border/50 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">TikTok Ads – Tráfego Pago</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gastos, impressões, cliques e ROAS
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdsConnected ? (
                    <span className="flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="w-4 h-4" />
                      Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-sm text-destructive">
                      <XCircle className="w-4 h-4" />
                      Não conectado
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdsConnected ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Última sync: --/--/---- --:--
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <DollarSign className="w-4 h-4" />
                        Gasto
                      </div>
                      <p className="text-lg font-semibold">R$ 0,00</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Eye className="w-4 h-4" />
                        Impressões
                      </div>
                      <p className="text-lg font-semibold">0</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <MousePointer className="w-4 h-4" />
                        Cliques
                      </div>
                      <p className="text-lg font-semibold">0</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        ROAS
                      </div>
                      <p className="text-lg font-semibold">0x</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Radio className="w-4 h-4" />
                        Conv. Live
                      </div>
                      <p className="text-lg font-semibold">0</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-dashed border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Dados disponíveis após conectar:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs">Gasto</span>
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs">Impressões</span>
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs">Cliques</span>
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs">ROAS</span>
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs">Conversões de Live</span>
                    </div>
                  </div>
                  
                  <Button onClick={handleConnectAds} className="gap-2" variant="outline">
                    <Zap className="w-4 h-4" />
                    Conectar TikTok Ads
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card Sincronização */}
          <Card className="glass border-border/50 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary text-foreground">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Sincronização</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gerencie a sincronização de dados
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Sincronização automática</p>
                    <p className="text-sm text-muted-foreground">Atualiza dados a cada 15 minutos</p>
                  </div>
                </div>
                <Switch
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSyncNow} 
                  disabled={isSyncing || isLoading}
                  variant="gradient"
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing || isLoading ? 'animate-spin' : ''}`} />
                  Sincronizar Agora
                </Button>
              </div>

              {/* Log de status */}
              <div className="p-4 rounded-lg bg-background/50 border border-border/50 max-h-32 overflow-y-auto">
                <p className="text-xs text-muted-foreground font-mono">
                  {isLoading ? (
                    <span className="text-primary">⏳ Sincronizando...</span>
                  ) : error ? (
                    <span className="text-destructive">❌ Erro: {error}</span>
                  ) : isShopConnected ? (
                    <span className="text-primary">✅ TikTok Shop conectado com sucesso</span>
                  ) : (
                    <span className="text-muted-foreground">ℹ️ Nenhuma integração ativa</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Integracoes;
