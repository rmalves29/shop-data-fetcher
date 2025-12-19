import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Key,
  Lock,
  Shield,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TikTokCredentials {
  app_key: string;
  app_secret: string;
  access_token: string;
  refresh_token: string;
  shop_name: string;
  token_expires_at: string | null;
}

const Configuracoes = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);

  const [credentials, setCredentials] = useState<TikTokCredentials>({
    app_key: "",
    app_secret: "",
    access_token: "",
    refresh_token: "",
    shop_name: "",
    token_expires_at: null,
  });

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setLoadingData(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar logado para acessar as configurações.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("tiktok_credentials")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setCredentials({
          app_key: data.app_key || "",
          app_secret: data.app_secret || "",
          access_token: data.access_token || "",
          refresh_token: data.refresh_token || "",
          shop_name: data.shop_name || "",
          token_expires_at: data.token_expires_at,
        });
        setHasCredentials(true);
      }
    } catch (error) {
      console.error("Error loading credentials:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validação
      if (!credentials.app_key || !credentials.app_secret) {
        toast({
          title: "Campos obrigatórios",
          description: "App Key e App Secret são obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar logado para salvar as configurações.",
          variant: "destructive",
        });
        return;
      }

      const credentialsData = {
        user_id: user.id,
        app_key: credentials.app_key,
        app_secret: credentials.app_secret,
        access_token: credentials.access_token || null,
        refresh_token: credentials.refresh_token || null,
        shop_name: credentials.shop_name || null,
        token_expires_at: credentials.token_expires_at || null,
      };

      const { error } = await supabase
        .from("tiktok_credentials")
        .upsert(credentialsData, {
          onConflict: "user_id",
        });

      if (error) throw error;

      setHasCredentials(true);
      toast({
        title: "Configurações salvas",
        description: "Suas credenciais foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error saving credentials:", error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from("tiktok_credentials")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setCredentials({
        app_key: "",
        app_secret: "",
        access_token: "",
        refresh_token: "",
        shop_name: "",
        token_expires_at: null,
      });
      setHasCredentials(false);

      toast({
        title: "Credenciais removidas",
        description: "Suas credenciais foram removidas com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting credentials:", error);
      toast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isTokenExpired = () => {
    if (!credentials.token_expires_at) return false;
    return new Date(credentials.token_expires_at) < new Date();
  };

  const formatExpiryDate = () => {
    if (!credentials.token_expires_at) return "Não definido";
    const date = new Date(credentials.token_expires_at);
    return date.toLocaleString("pt-BR");
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto px-6 pb-12">
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
                <span className="gradient-text">Configurações</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure suas credenciais do TikTok
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Status Card */}
          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle>Status da Integração</CardTitle>
                    <CardDescription>
                      Estado atual das suas credenciais
                    </CardDescription>
                  </div>
                </div>
                {hasCredentials ? (
                  <span className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4" />
                    Configurado
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    Não configurado
                  </span>
                )}
              </div>
            </CardHeader>
            {hasCredentials && credentials.access_token && (
              <CardContent>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">Status do Token</p>
                      <p className="text-xs text-muted-foreground">
                        {isTokenExpired() ? (
                          <span className="text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Token expirado - Reconecte sua conta
                          </span>
                        ) : (
                          <span className="text-primary flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Token válido até {formatExpiryDate()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Credentials Form */}
          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary text-foreground">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Credenciais da API TikTok</CardTitle>
                  <CardDescription>
                    Configure sua App Key, Secret e Access Token
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* App Key */}
              <div className="space-y-2">
                <Label htmlFor="app_key" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  App Key (App ID)
                </Label>
                <Input
                  id="app_key"
                  type="text"
                  placeholder="Digite seu App Key do TikTok"
                  value={credentials.app_key}
                  onChange={(e) =>
                    setCredentials({ ...credentials, app_key: e.target.value })
                  }
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Encontre no TikTok Developer Dashboard
                </p>
              </div>

              {/* App Secret */}
              <div className="space-y-2">
                <Label htmlFor="app_secret" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  App Secret
                </Label>
                <div className="relative">
                  <Input
                    id="app_secret"
                    type={showSecret ? "text" : "password"}
                    placeholder="Digite seu App Secret"
                    value={credentials.app_secret}
                    onChange={(e) =>
                      setCredentials({ ...credentials, app_secret: e.target.value })
                    }
                    className="font-mono pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mantenha este valor em segredo
                </p>
              </div>

              {/* Access Token */}
              <div className="space-y-2">
                <Label htmlFor="access_token" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Access Token (Opcional)
                </Label>
                <div className="relative">
                  <Input
                    id="access_token"
                    type={showAccessToken ? "text" : "password"}
                    placeholder="Cole o Access Token obtido após OAuth"
                    value={credentials.access_token}
                    onChange={(e) =>
                      setCredentials({ ...credentials, access_token: e.target.value })
                    }
                    className="font-mono pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                  >
                    {showAccessToken ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtido após conectar via OAuth na página de Integrações
                </p>
              </div>

              {/* Refresh Token */}
              <div className="space-y-2">
                <Label htmlFor="refresh_token" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Refresh Token (Opcional)
                </Label>
                <div className="relative">
                  <Input
                    id="refresh_token"
                    type={showRefreshToken ? "text" : "password"}
                    placeholder="Cole o Refresh Token"
                    value={credentials.refresh_token}
                    onChange={(e) =>
                      setCredentials({ ...credentials, refresh_token: e.target.value })
                    }
                    className="font-mono pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowRefreshToken(!showRefreshToken)}
                  >
                    {showRefreshToken ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usado para renovar o Access Token automaticamente
                </p>
              </div>

              {/* Shop Name */}
              <div className="space-y-2">
                <Label htmlFor="shop_name">Nome da Loja (Opcional)</Label>
                <Input
                  id="shop_name"
                  type="text"
                  placeholder="Nome da sua loja TikTok"
                  value={credentials.shop_name}
                  onChange={(e) =>
                    setCredentials({ ...credentials, shop_name: e.target.value })
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="gap-2"
                  variant="gradient"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>

                {hasCredentials && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={loading} className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover credenciais?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação removerá todas as suas credenciais salvas do TikTok.
                          Você precisará configurá-las novamente para usar a integração.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {/* Help Text */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Onde encontrar:</strong>
                  <br />
                  1. Acesse o{" "}
                  <a
                    href="https://partner.tiktokshop.com/docv2/page/650a5cb0c1b0ee02c632fb89"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    TikTok Developer Portal
                  </a>
                  <br />
                  2. Crie ou selecione sua aplicação
                  <br />
                  3. Copie o App Key e App Secret
                  <br />
                  4. Para o Access Token, use o botão "Conectar TikTok Shop" na{" "}
                  <Link to="/integracoes" className="text-primary hover:underline">
                    página de Integrações
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
