import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { SyncLog } from '@/types/integrations';

interface SyncLogsProps {
  logs: SyncLog[];
  maxHeight?: string;
}

export function SyncLogs({ logs, maxHeight = '300px' }: SyncLogsProps) {
  const getStatusConfig = (status: SyncLog['status']) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Sucesso',
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: 'Erro',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          label: 'Aviso',
        };
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return `${seconds}s atrás`;
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          Histórico de Sincronização
        </CardTitle>
        <CardDescription>Últimas atividades das integrações</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma atividade registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const statusConfig = getStatusConfig(log.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-background transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${statusConfig.bgColor} ${statusConfig.color} flex-shrink-0`}
                      >
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {log.integrationId}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm break-words">{log.message}</p>
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Ver detalhes
                            </summary>
                            <pre className="text-xs mt-2 p-2 rounded bg-muted overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
