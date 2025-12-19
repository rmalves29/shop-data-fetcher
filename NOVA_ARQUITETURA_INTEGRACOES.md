# 🎨 Nova Arquitetura de Integrações

## 📋 Visão Geral

A arquitetura de integrações foi completamente redesenhada para ser **modular**, **escalável** e **fácil de manter**. Agora o sistema suporta múltiplas integrações de forma centralizada e organizada.

## 🏗️ Estrutura de Arquivos

```
src/
├── types/
│   └── integrations.ts          # Tipos TypeScript centralizados
├── contexts/
│   └── IntegrationsContext.tsx  # Contexto React para gerenciar integrações
├── components/
│   └── integrations/
│       ├── IntegrationCard.tsx  # Card reutilizável para cada integração
│       ├── MetricItem.tsx       # Componente de métricas
│       └── SyncLogs.tsx         # Histórico de sincronização
├── hooks/
│   ├── useTikTokShop.ts        # Hook específico TikTok Shop
│   └── useTikTokAds.ts         # Hook específico TikTok Ads
└── pages/
    └── IntegrationsNew.tsx      # Nova página de integrações
```

## 🎯 Principais Melhorias

### 1. **Sistema Centralizado de Gerenciamento**

#### `IntegrationsContext` 
Contexto React que centraliza toda a lógica de integrações:

```typescript
const {
  integrations,      // Lista de todas as integrações
  syncLogs,          // Histórico de sincronizações
  isLoading,         // Estado de loading global
  refreshIntegration, // Sincronizar integração específica
  refreshAll,        // Sincronizar todas
  connectIntegration, // Conectar nova integração
  disconnectIntegration, // Desconectar
  getIntegrationData, // Obter dados da integração
  updateConfig,      // Atualizar configurações
} = useIntegrations();
```

**Benefícios:**
- ✅ Estado unificado de todas as integrações
- ✅ Lógica centralizada e reutilizável
- ✅ Fácil adicionar novas integrações
- ✅ Melhor controle de loading e erros

### 2. **Tipos TypeScript Robustos**

Arquivo `types/integrations.ts` com interfaces completas:

```typescript
// Tipos principais
- Integration           // Dados básicos da integração
- IntegrationStatus     // Estados: connected, disconnected, error, syncing
- IntegrationRegion     // Regiões: BR, US, UK, SEA, GLOBAL
- SyncLog              // Logs de sincronização
- ConnectionConfig     // Configurações de conexão

// Tipos específicos TikTok Shop
- TikTokShopData
- TikTokShop
- TikTokOrder
- TikTokProduct

// Tipos específicos TikTok Ads
- TikTokAdsData
- TikTokAdvertiser
- TikTokCampaign
- TikTokAdGroup
- TikTokAdsReport
```

**Benefícios:**
- ✅ IntelliSense completo no VS Code
- ✅ Detecção de erros em tempo de desenvolvimento
- ✅ Documentação automática via tipos
- ✅ Refatoração segura

### 3. **Componentes Reutilizáveis**

#### `<IntegrationCard />`
Card modular para exibir qualquer integração:

```tsx
<IntegrationCard
  integration={shopIntegration}
  onConnect={() => connectIntegration('tiktok_shop')}
  onDisconnect={() => disconnectIntegration('tiktok_shop')}
  onSync={() => refreshIntegration('tiktok_shop')}
  metrics={<MetricsGrid>...</MetricsGrid>}
/>
```

**Features:**
- Status visual (conectado, desconectado, erro, sincronizando)
- Badges de status com cores dinâmicas
- Botões de ação contextuais
- Exibição de erros inline
- Área de métricas customizável

#### `<MetricItem />` e `<MetricsGrid />`
Componentes para exibir métricas:

```tsx
<MetricsGrid columns={4}>
  <MetricItem
    label="Receita"
    value={formatCurrency(totalRevenue)}
    icon={<DollarSign />}
    trend="up"
    trendValue="+15%"
  />
</MetricsGrid>
```

**Features:**
- Grid responsivo (2-5 colunas)
- Ícones customizáveis
- Indicadores de tendência (up/down/neutral)
- Valores formatados automaticamente

#### `<SyncLogs />`
Histórico detalhado de sincronizações:

```tsx
<SyncLogs logs={syncLogs} maxHeight="400px" />
```

**Features:**
- Scroll área com altura customizável
- Status coloridos (sucesso, erro, aviso)
- Timestamp relativo (5min atrás, 2h atrás)
- Detalhes expansíveis
- Últimos 50 logs mantidos

### 4. **Sistema de Logs e Auditoria**

Cada ação gera um log automático:

```typescript
{
  id: "log_123",
  integrationId: "tiktok_shop",
  timestamp: "2024-12-19T17:00:00Z",
  status: "success",
  message: "TikTok Shop sincronizado: 45 pedidos, 120 produtos",
  details: { orders: 45, products: 120 }
}
```

**Tipos de logs:**
- ✅ **Success**: Operações bem-sucedidas
- ⚠️ **Warning**: Avisos (ex: desconexão)
- ❌ **Error**: Falhas e erros

### 5. **Gerenciamento de Estado Melhorado**

#### Estados das Integrações:

1. **`disconnected`** - Não conectada
2. **`syncing`** - Sincronizando (com spinner)
3. **`connected`** - Conectada e funcionando
4. **`error`** - Erro na última operação

#### Fluxo de Estados:

```
disconnected → [Connect] → syncing → connected
connected → [Sync] → syncing → connected
connected → [Error] → error → [Retry] → syncing
connected → [Disconnect] → disconnected
```

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────┐
│         IntegrationsContext (Provider)          │
│  - Gerencia estado global                       │
│  - Orquestra hooks específicos                  │
│  - Mantém logs de sincronização                 │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│ useTikTokShop│  │ useTikTokAds │
│              │  │              │
│ - API calls  │  │ - API calls  │
│ - IndexedDB  │  │ - IndexedDB  │
│ - Cache      │  │ - Cache      │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
       ┌────────────────┐
       │  IntegrationCard│
       │                │
       │  - Visual UI   │
       │  - Metrics     │
       │  - Actions     │
       └────────────────┘
```

## 🎨 Design System

### Cores por Status:

- **Connected**: Verde (`text-green-500`, `bg-green-500/10`)
- **Disconnected**: Cinza (`text-gray-500`, `bg-gray-500/10`)
- **Error**: Vermelho (`text-red-500`, `bg-red-500/10`)
- **Syncing**: Azul (`text-blue-500`, `bg-blue-500/10`)

### Animações:

- `animate-spin` - Ícones de loading
- `animate-slide-up` - Entrada suave do header
- `hover:shadow-lg` - Cards com elevação no hover
- Transições suaves: `transition-all duration-300`

## 🚀 Como Adicionar Nova Integração

### 1. Adicionar tipo em `types/integrations.ts`:

```typescript
export type IntegrationType = 'tiktok_shop' | 'tiktok_ads' | 'facebook_ads';

export interface FacebookAdsData {
  campaigns: FacebookCampaign[];
  metrics: { /* ... */ };
}
```

### 2. Criar hook específico (ex: `useFacebookAds.ts`):

```typescript
export function useFacebookAds() {
  const [data, setData] = useState<FacebookAdsData>(/* ... */);
  const fetchData = async () => { /* ... */ };
  return { ...data, refetch: fetchData };
}
```

### 3. Adicionar ao `IntegrationsContext`:

```typescript
const facebookAds = useFacebookAds();

const [integrations, setIntegrations] = useState([
  // ... outras integrações
  {
    id: 'facebook_ads',
    type: 'facebook_ads',
    name: 'Facebook Ads',
    description: 'Campanhas do Facebook',
    icon: 'Facebook',
    // ...
  },
]);
```

### 4. Atualizar lógica do contexto:

```typescript
// Em refreshIntegration
if (id === 'facebook_ads') {
  await facebookAds.refetch();
}

// Em getIntegrationData
if (id === 'facebook_ads') {
  return {
    campaigns: facebookAds.campaigns,
    metrics: { /* ... */ },
  };
}
```

### 5. Usar na página `IntegrationsNew.tsx`:

```tsx
const fbIntegration = integrations.find((i) => i.id === 'facebook_ads');

<IntegrationCard
  integration={fbIntegration}
  onConnect={() => connectIntegration('facebook_ads')}
  // ...
/>
```

## 📊 Métricas Disponíveis

### TikTok Shop:
- ✅ Total de Pedidos
- ✅ Receita Total
- ✅ Total de Produtos
- ✅ Ticket Médio
- ✅ Taxa de Conversão (em breve)

### TikTok Ads:
- ✅ Investimento Total
- ✅ Impressões
- ✅ Cliques
- ✅ CTR (Click-Through Rate)
- ✅ CPC (Cost Per Click)
- ✅ ROAS (Return on Ad Spend)
- ✅ Conversões
- ✅ Custo por Conversão

## 🔐 Segurança

### Tokens e Credenciais:
- ✅ Nunca expostos no frontend
- ✅ Armazenados como Supabase Secrets
- ✅ Acesso apenas via Edge Functions

### Cache Local:
- ✅ IndexedDB para dados não sensíveis
- ✅ LocalStorage apenas para configurações
- ✅ Nenhum token armazenado localmente

## 🧪 Testes e Debugging

### Logs de Desenvolvimento:

```typescript
console.log('Shops response:', shopsResponse);
console.log('Action get_orders result:', JSON.stringify(result));
```

### Estado no React DevTools:

Instale React DevTools e inspecione:
- `IntegrationsContext` - Ver estado completo
- `useTikTokShop` - Ver dados do Shop
- `useTikTokAds` - Ver dados do Ads

### Verificar IndexedDB:

Chrome DevTools → Application → IndexedDB → `tiktok_data`

## 📱 Responsividade

A interface é totalmente responsiva:

- **Mobile** (< 768px): 1-2 colunas
- **Tablet** (768px - 1024px): 2-3 colunas
- **Desktop** (> 1024px): 3-5 colunas

## 🔄 Sincronização

### Tipos de Sincronização:

1. **Manual**: Botão "Sincronizar" em cada card
2. **Global**: Botão "Sincronizar Tudo" no header
3. **Automática**: Ao carregar a página (se conectado)

### Frequência:
- Não há sincronização automática por tempo
- Usuário controla quando atualizar
- Cache offline garante performance

## 📚 Referências

- [React Context API](https://react.dev/reference/react/createContext)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [shadcn/ui Components](https://ui.shadcn.com/)

## ✅ Checklist de Migração

Se estiver migrando da versão antiga:

- [x] Novos tipos em `types/integrations.ts`
- [x] Contexto `IntegrationsContext` criado
- [x] Componentes reutilizáveis criados
- [x] Nova página `IntegrationsNew.tsx`
- [x] App.tsx atualizado com Provider
- [x] Rota `/integracoes` apontando para nova página
- [x] Build testado e funcionando

## 🎉 Benefícios da Nova Arquitetura

1. **Escalabilidade**: Fácil adicionar novas integrações
2. **Manutenibilidade**: Código organizado e documentado
3. **Reutilização**: Componentes modulares
4. **Type Safety**: TypeScript em toda aplicação
5. **UX Melhorada**: Interface mais intuitiva e responsiva
6. **Auditoria**: Histórico completo de ações
7. **Performance**: Cache offline e loading states
8. **Debugging**: Logs detalhados e estruturados
