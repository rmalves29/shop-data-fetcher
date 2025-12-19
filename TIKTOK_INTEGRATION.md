# Integração TikTok Shop - Nova Implementação

## 📋 O que foi feito

### Removido
- ✅ Todas as edge functions antigas do TikTok (tiktok-shop-api, tiktok-auth-callback, tiktok-ads-callback)
- ✅ Hook useTikTokShop.ts antigo com problemas de conexão
- ✅ Backup criado dos arquivos antigos (`backup_tiktok_*.tar.gz`)

### Implementado

#### 1. **Novo Hook useTikTokShop.ts** com melhorias:
- ✅ **Sistema de Retry**: 3 tentativas automáticas com backoff exponencial
- ✅ **Timeout de Requisição**: 30 segundos por requisição
- ✅ **Melhor tratamento de erros**: Mensagens claras e específicas
- ✅ **Cache com IndexedDB**: Dados persistidos localmente
- ✅ **Estados de conexão**: Controle de estado conectado/desconectado

#### 2. **Nova Edge Function tiktok-shop-api** com:
- ✅ **Retry logic**: 3 tentativas com timeout de 25s cada
- ✅ **Backoff exponencial**: Espera progressiva entre tentativas
- ✅ **Validação de token**: Verifica expiração antes de fazer requisições
- ✅ **Assinatura segura**: Geração correta de signature para TikTok API
- ✅ **Suporte a múltiplas ações**: get_shops, get_orders, get_products

#### 3. **Edge Function tiktok-auth-callback** renovada:
- ✅ **OAuth flow completo**: Troca de código por access token
- ✅ **Persistência no Supabase**: Salva tokens na tabela tiktok_auth
- ✅ **Redirecionamento inteligente**: Volta para /integracoes com status
- ✅ **Tratamento de erros**: Redireciona com mensagem de erro se falhar

#### 4. **Edge Function tiktok-ads-callback** implementada:
- ✅ **OAuth para TikTok Ads**: Suporte para TikTok Marketing API
- ✅ **Armazenamento separado**: Tabela tiktok_ads_auth
- ✅ **Fluxo completo**: Do authorize até o token

#### 5. **Melhorias na UI**:
- ✅ **Alertas de status**: Mostra conexão bem-sucedida ou erro
- ✅ **Mensagens claras**: Erros específicos em português
- ✅ **Loading states**: Indicadores visuais durante sincronização
- ✅ **Status bar melhorado**: Mostra estado da conexão em tempo real

## 🔧 Como funciona

### Fluxo de Autenticação

1. **Usuário clica em "Conectar TikTok Shop"**
   - Redireciona para `https://services.tiktokshop.com/open/authorize`
   - Usuário autoriza o app na plataforma TikTok

2. **TikTok redireciona para callback**
   - URL: `https://[supabase]/functions/v1/tiktok-auth-callback?code=xxx`
   - Edge function troca o código por access_token
   - Salva token no Supabase (tabela `tiktok_auth`)

3. **Redirecionamento final**
   - Volta para `/integracoes?tiktok_connected=true`
   - Hook detecta parâmetro e inicia sincronização

### Fluxo de Sincronização

1. **Hook carrega dados do cache** (IndexedDB)
   - Mostra dados antigos imediatamente
   - UX melhorada, não fica em branco

2. **Busca dados da API**
   - Usa sistema de retry (3 tentativas)
   - Timeout de 30s por requisição
   - Requisições paralelas (orders + products)

3. **Atualiza cache e estado**
   - Salva no IndexedDB
   - Atualiza estado React
   - Mostra toast de sucesso

## 🚀 Vantagens da nova implementação

### Robustez
- ✅ **Retry automático**: Não falha na primeira tentativa
- ✅ **Timeout configurável**: Evita requisições travadas
- ✅ **Tratamento de erros**: Captura e mostra erros específicos

### Performance
- ✅ **Cache local**: Dados disponíveis instantaneamente
- ✅ **Requisições paralelas**: Orders e products ao mesmo tempo
- ✅ **Backoff exponencial**: Não sobrecarrega a API

### UX
- ✅ **Feedback visual**: Loading states e mensagens claras
- ✅ **Mensagens em português**: Erros compreensíveis
- ✅ **Estado de conexão**: Usuário sabe se está conectado

## 📊 Estrutura de Dados

### IndexedDB (Cache Local)
```typescript
// Stores
- orders: { order_id, date, total, source, status, items[] }
- products: { id, title, status, price, sales }
- live: { live_id, date, orders, revenue, products }
- ads: { date, campaign, spend, clicks, conversions, roas }

// localStorage
- tiktok_status: { shop: boolean, ads: boolean, last_sync: string }
```

### Supabase Tables (Backend)
```sql
-- tiktok_auth
- user_id (UUID)
- access_token (text)
- refresh_token (text)
- expires_at (timestamp)
- open_id (text)
- seller_id (text)
- seller_base_region (text)

-- tiktok_ads_auth
- user_id (UUID)
- access_token (text)
- expires_at (timestamp)
- advertiser_id (text)
```

## 🔐 Variáveis de Ambiente Necessárias

As edge functions precisam destas variáveis no Supabase:

```env
TIKTOK_APP_KEY=6ih0dnluvugft
TIKTOK_APP_SECRET=<seu_secret>
SUPABASE_URL=<sua_url>
SUPABASE_ANON_KEY=<sua_key>
```

## 🐛 Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Token expirado` | Access token inválido | Reconectar TikTok Shop |
| `Request timeout` | API lenta ou conexão ruim | Retry automático (3x) |
| `Nenhuma loja encontrada` | Conta não autorizada | Verificar autorização no TikTok |
| `Max retries exceeded` | API indisponível | Aguardar e tentar novamente |

### Logs

Todos os erros são logados no console:
```javascript
console.error('Error fetching TikTok data:', error);
console.log('Attempt X/3 failed:', error);
```

## 📝 Próximos Passos

- [ ] Implementar refresh token automático
- [ ] Adicionar webhook para atualizações em tempo real
- [ ] Implementar TikTok Ads API completamente
- [ ] Adicionar analytics de Live Shopping
- [ ] Criar dashboard específico para Lives

## 🔄 Como testar

1. **Build do projeto**:
   ```bash
   npm run build
   ```

2. **Iniciar dev server**:
   ```bash
   npm run dev
   ```

3. **Testar conexão**:
   - Ir para `/integracoes`
   - Clicar em "Conectar TikTok Shop"
   - Autorizar no TikTok
   - Verificar redirecionamento e sincronização

4. **Verificar cache**:
   - Abrir DevTools > Application > IndexedDB
   - Verificar store `tiktok_data`
   - Ver orders e products salvos

## 📚 Documentação Relacionada

- [TikTok Shop API Docs](https://partner.tiktokshop.com/doc)
- [TikTok Marketing API Docs](https://business-api.tiktok.com/portal/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
