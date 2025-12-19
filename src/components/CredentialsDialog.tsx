import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Key, 
  Settings,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationType: "tiktok_shop" | "tiktok_ads";
}

export function CredentialsDialog({
  open,
  onOpenChange,
  integrationType,
}: CredentialsDialogProps) {
  const { toast } = useToast();
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // TikTok Shop credentials
  const [shopAppKey, setShopAppKey] = useState("");
  const [shopAppSecret, setShopAppSecret] = useState("");
  const [shopAccessToken, setShopAccessToken] = useState("");
  const [shopRefreshToken, setShopRefreshToken] = useState("");

  // TikTok Ads credentials
  const [adsAppId, setAdsAppId] = useState("");
  const [adsAppSecret, setAdsAppSecret] = useState("");
  const [adsAccessToken, setAdsAccessToken] = useState("");
  const [adsAdvertiserId, setAdsAdvertiserId] = useState("");

  const isShop = integrationType === "tiktok_shop";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência`,
    });
  };

  const handleSaveCredentials = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      if (isShop) {
        // Validate Shop credentials
        if (!shopAccessToken) {
          throw new Error("Access Token é obrigatório");
        }

        // Save to database
        const { error } = await supabase.from('tiktok_auth').upsert({
          user_id: user.id,
          access_token: shopAccessToken,
          refresh_token: shopRefreshToken || null,
          app_key: shopAppKey || null,
          app_secret: shopAppSecret || null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "✅ Credenciais salvas!",
          description: "TikTok Shop configurado com sucesso",
        });
      } else {
        // Validate Ads credentials
        if (!adsAccessToken || !adsAdvertiserId) {
          throw new Error("Access Token e Advertiser ID são obrigatórios");
        }

        // Save to database
        const { error } = await supabase.from('tiktok_ads_auth').upsert({
          user_id: user.id,
          access_token: adsAccessToken,
          advertiser_id: adsAdvertiserId,
          app_id: adsAppId || null,
          app_secret: adsAppSecret || null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "✅ Credenciais salvas!",
          description: "TikTok Ads configurado com sucesso",
        });
      }

      onOpenChange(false);
      window.location.reload(); // Reload to fetch new data
    } catch (error) {
      console.error("Error saving credentials:", error);
      toast({
        title: "❌ Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Configurar Credenciais - {isShop ? "TikTok Shop" : "TikTok Ads"}
          </DialogTitle>
          <DialogDescription>
            Configure manualmente suas credenciais de API
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Configuração Manual</TabsTrigger>
            <TabsTrigger value="help">Ajuda</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            {isShop ? (
              // TikTok Shop Fields
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Obtenha suas credenciais no{" "}
                    <a
                      href="https://partner.tiktokshop.com/developer/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline inline-flex items-center gap-1"
                    >
                      TikTok Shop Partner Portal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="shop-app-key">
                    App Key <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="shop-app-key"
                      value={shopAppKey}
                      onChange={(e) => setShopAppKey(e.target.value)}
                      placeholder="Ex: 6ih0dnluvugft"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(shopAppKey, "App Key")}
                      disabled={!shopAppKey}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Identificador público do seu aplicativo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shop-app-secret">
                    App Secret <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="shop-app-secret"
                      type={showSecret ? "text" : "password"}
                      value={shopAppSecret}
                      onChange={(e) => setShopAppSecret(e.target.value)}
                      placeholder="••••••••••••••••"
                    />
                    <Button
                      variant="outline"
                      size="icon"
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
                    Chave secreta do seu aplicativo (nunca compartilhe)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shop-access-token" className="flex items-center gap-2">
                    Access Token <span className="text-destructive">*</span>
                    <span className="text-xs text-muted-foreground">(Obrigatório)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="shop-access-token"
                      type={showSecret ? "text" : "password"}
                      value={shopAccessToken}
                      onChange={(e) => setShopAccessToken(e.target.value)}
                      placeholder="ROW_xxx..."
                      required
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(shopAccessToken, "Access Token")}
                      disabled={!shopAccessToken}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Token de acesso obtido após autorização OAuth
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shop-refresh-token">
                    Refresh Token <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <Input
                    id="shop-refresh-token"
                    type={showSecret ? "text" : "password"}
                    value={shopRefreshToken}
                    onChange={(e) => setShopRefreshToken(e.target.value)}
                    placeholder="refresh_xxx..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Token para renovar o Access Token automaticamente
                  </p>
                </div>
              </>
            ) : (
              // TikTok Ads Fields
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Obtenha suas credenciais no{" "}
                    <a
                      href="https://business-api.tiktok.com/portal/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline inline-flex items-center gap-1"
                    >
                      TikTok for Business
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="ads-app-id">
                    App ID <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <Input
                    id="ads-app-id"
                    value={adsAppId}
                    onChange={(e) => setAdsAppId(e.target.value)}
                    placeholder="Ex: 1234567890123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ads-app-secret">
                    App Secret <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <Input
                    id="ads-app-secret"
                    type={showSecret ? "text" : "password"}
                    value={adsAppSecret}
                    onChange={(e) => setAdsAppSecret(e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ads-access-token" className="flex items-center gap-2">
                    Access Token <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ads-access-token"
                    type={showSecret ? "text" : "password"}
                    value={adsAccessToken}
                    onChange={(e) => setAdsAccessToken(e.target.value)}
                    placeholder="act.xxx..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ads-advertiser-id" className="flex items-center gap-2">
                    Advertiser ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ads-advertiser-id"
                    value={adsAdvertiserId}
                    onChange={(e) => setAdsAdvertiserId(e.target.value)}
                    placeholder="Ex: 7123456789012345678"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    ID da sua conta de anunciante
                  </p>
                </div>
              </>
            )}

            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Segurança:</strong> Suas credenciais são criptografadas e armazenadas com segurança.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="help" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">📚 Como obter suas credenciais</h3>
                {isShop ? (
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      Acesse o{" "}
                      <a
                        href="https://partner.tiktokshop.com/developer/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-primary"
                      >
                        Partner Portal
                      </a>
                    </li>
                    <li>Clique no seu aplicativo ou crie um novo</li>
                    <li>
                      Copie o <strong>App Key</strong> e <strong>App Secret</strong>
                    </li>
                    <li>
                      Autorize seu aplicativo para obter o <strong>Access Token</strong>
                    </li>
                    <li>Cole as credenciais nos campos acima</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      Acesse{" "}
                      <a
                        href="https://business-api.tiktok.com/portal/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-primary"
                      >
                        TikTok for Business
                      </a>
                    </li>
                    <li>Crie ou selecione seu aplicativo</li>
                    <li>Autorize seu aplicativo e obtenha o Access Token</li>
                    <li>Encontre seu Advertiser ID nas configurações da conta</li>
                    <li>Cole as credenciais nos campos acima</li>
                  </ol>
                )}
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dica:</strong> Use a configuração OAuth (botão "Conectar") para um processo mais simples e seguro.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="font-semibold mb-2">🔐 Segurança</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Nunca compartilhe suas credenciais</li>
                  <li>O App Secret é sensível - mantenha seguro</li>
                  <li>Access Tokens expiram - renove periodicamente</li>
                  <li>Use Refresh Token para renovação automática</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">❓ Campos Obrigatórios</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong>Access Token:</strong> Sempre obrigatório
                  </li>
                  {!isShop && (
                    <li>
                      <strong>Advertiser ID:</strong> Necessário para TikTok Ads
                    </li>
                  )}
                  <li>
                    <strong>Outros campos:</strong> Opcionais (úteis para debug)
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveCredentials} 
            disabled={isSaving || (isShop ? !shopAccessToken : !adsAccessToken || !adsAdvertiserId)}
          >
            {isSaving ? "Salvando..." : "Salvar Credenciais"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
