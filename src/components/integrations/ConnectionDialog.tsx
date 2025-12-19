import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationId: string;
  integrationName: string;
  onConnect: (config?: { accessToken?: string; advertiserId?: string }) => void;
}

export function ConnectionDialog({
  open,
  onOpenChange,
  integrationId,
  integrationName,
  onConnect,
}: ConnectionDialogProps) {
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState('');
  const [advertiserId, setAdvertiserId] = useState('');
  const [copied, setCopied] = useState(false);

  const isShop = integrationId === 'tiktok_shop';
  const isAds = integrationId === 'tiktok_ads';

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const redirectUri = isShop
    ? `${supabaseUrl}/functions/v1/tiktok-auth-callback`
    : `${supabaseUrl}/functions/v1/tiktok-ads-callback`;

  const partnerPortalUrl = isShop
    ? 'https://partner.tiktokshop.com/'
    : 'https://business-api.tiktok.com/portal/';

  const docsUrl = isShop
    ? 'https://partner.tiktokshop.com/docv2/page/650ac2f5892b730004ee7b60'
    : 'https://business-api.tiktok.com/portal/docs?id=1738855176671230';

  const handleCopyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copiado!',
      description: 'URL de redirecionamento copiada',
    });
  };

  const handleOAuthConnect = () => {
    onConnect();
    onOpenChange(false);
  };

  const handleManualConnect = () => {
    if (!accessToken.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira o Access Token',
        variant: 'destructive',
      });
      return;
    }

    if (isAds && !advertiserId.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira o Advertiser ID',
        variant: 'destructive',
      });
      return;
    }

    // Salvar no localStorage para uso posterior
    localStorage.setItem(
      `${integrationId}_manual_token`,
      JSON.stringify({ accessToken, advertiserId })
    );

    toast({
      title: 'Token salvo',
      description: 'Configure o token nas Edge Functions do Supabase',
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Conectar {integrationName}
          </DialogTitle>
          <DialogDescription>
            Escolha o método de conexão preferido
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="oauth" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="oauth">OAuth (Recomendado)</TabsTrigger>
            <TabsTrigger value="manual">Configuração Manual</TabsTrigger>
          </TabsList>

          {/* OAuth Tab */}
          <TabsContent value="oauth" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pré-requisitos</AlertTitle>
              <AlertDescription>
                Certifique-se de que você tem:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Uma conta {isShop ? 'TikTok Shop' : 'TikTok for Business'}</li>
                  <li>Aplicação criada no Partner Portal</li>
                  <li>Redirect URI configurado corretamente</li>
                  {!isShop && <li>Conta de anunciante ativa</li>}
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">
                  URL de Redirecionamento (Redirect URI)
                </Label>
                <div className="flex gap-2 mt-1.5">
                  <Input value={redirectUri} readOnly className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyRedirectUri}
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta URL deve estar configurada na sua aplicação
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <h4 className="font-medium text-sm">Passo a passo:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                  <li>
                    Acesse o{' '}
                    <a
                      href={partnerPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Partner Portal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Vá em Apps e selecione ou crie uma aplicação</li>
                  <li>Configure o Redirect URI (copie acima)</li>
                  <li>Anote o App Key e App Secret</li>
                  <li>Configure as variáveis de ambiente no Supabase</li>
                  <li>Clique no botão "Autorizar com TikTok" abaixo</li>
                </ol>
              </div>

              {/* Aviso sobre região */}
              {isShop && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atenção: Região</AlertTitle>
                  <AlertDescription>
                    Se você receber erro de "não disponível na região", significa
                    que o TikTok Shop não está disponível para sua conta ou região.
                    Verifique o arquivo TIKTOK_REGIONS.md para mais informações.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" asChild>
                <a href={docsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Documentação
                </a>
              </Button>
              <Button onClick={handleOAuthConnect} variant="gradient">
                Autorizar com TikTok
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Manual Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuração Manual</AlertTitle>
              <AlertDescription>
                Use este método se você já possui um Access Token gerado ou se o
                OAuth não está funcionando.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token *</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="Cole seu Access Token aqui"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Obtenha o token através do fluxo OAuth manual ou do Partner Portal
                </p>
              </div>

              {isAds && (
                <div className="space-y-2">
                  <Label htmlFor="advertiserId">Advertiser ID *</Label>
                  <Input
                    id="advertiserId"
                    type="text"
                    placeholder="1234567890"
                    value={advertiserId}
                    onChange={(e) => setAdvertiserId(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID da conta de anunciante do TikTok Ads
                  </p>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>Após salvar o token aqui, você precisa:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>
                      Configurar o token como secret no Supabase:
                      <code className="block mt-1 p-2 bg-muted rounded text-xs">
                        supabase secrets set{' '}
                        {isShop ? 'TIKTOK_ACCESS_TOKEN' : 'TIKTOK_ADS_ACCESS_TOKEN'}
                        =seu_token
                      </code>
                    </li>
                    <li>Fazer deploy da Edge Function correspondente</li>
                    <li>Sincronizar a integração</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleManualConnect}>Salvar Token</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
