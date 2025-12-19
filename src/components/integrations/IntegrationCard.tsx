import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  Megaphone,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Settings,
  Unplug,
  Zap,
} from 'lucide-react';
import { Integration } from '@/types/integrations';

interface IntegrationCardProps {
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  onSettings?: () => void;
  metrics?: React.ReactNode;
  isSyncing?: boolean;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'ShoppingBag':
      return ShoppingBag;
    case 'Megaphone':
      return Megaphone;
    default:
      return Zap;
  }
};

const getStatusConfig = (status: Integration['status']) => {
  switch (status) {
    case 'connected':
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        label: 'Conectado',
      };
    case 'disconnected':
      return {
        icon: XCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
        label: 'Desconectado',
      };
    case 'error':
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        label: 'Erro',
      };
    case 'syncing':
      return {
        icon: Loader2,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        label: 'Sincronizando',
      };
  }
};

export function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onSync,
  onSettings,
  metrics,
  isSyncing = false,
}: IntegrationCardProps) {
  const Icon = getIcon(integration.icon);
  const statusConfig = getStatusConfig(integration.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="glass border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                integration.connected
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{integration.name}</CardTitle>
              <CardDescription className="mt-1">
                {integration.description}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={integration.connected ? 'default' : 'secondary'}
            className={`gap-1 ${statusConfig.bgColor} ${statusConfig.color}`}
          >
            <StatusIcon
              className={`w-3 h-3 ${
                integration.status === 'syncing' ? 'animate-spin' : ''
              }`}
            />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status e última sincronização */}
        {integration.connected && integration.lastSync && (
          <div className="text-sm text-muted-foreground">
            Última sincronização:{' '}
            {new Date(integration.lastSync).toLocaleString('pt-BR')}
          </div>
        )}

        {/* Erro */}
        {integration.error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{integration.error}</p>
          </div>
        )}

        {/* Métricas */}
        {integration.connected && metrics && (
          <div className="pt-2">{metrics}</div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-2">
          {integration.connected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={isSyncing || integration.status === 'syncing'}
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    isSyncing || integration.status === 'syncing'
                      ? 'animate-spin'
                      : ''
                  }`}
                />
                Sincronizar
              </Button>
              {onSettings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSettings}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={onDisconnect}
                className="gap-2"
              >
                <Unplug className="w-4 h-4" />
                Desconectar
              </Button>
            </>
          ) : (
            <Button
              onClick={onConnect}
              variant="gradient"
              className="gap-2"
              disabled={integration.status === 'syncing'}
            >
              <Zap className="w-4 h-4" />
              Conectar {integration.name}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
