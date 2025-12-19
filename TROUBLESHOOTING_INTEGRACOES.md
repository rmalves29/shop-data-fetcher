# 🔧 Guia de Resolução de Problemas - Integrações TikTok

## ❌ Erro: "There seems to be an issue getting user information"

### 🎯 Causa
Este erro ocorre durante o processo de OAuth quando:
1. A aplicação não está aprovada pelo TikTok
2. O Redirect URI está incorreto
3. Os scopes/permissões estão incorretos
4. A conta não tem as permissões necessárias

---

## 🛠️ Solução Passo a Passo

### Para TikTok Shop:

#### 1. Verificar Aplicação no Partner Portal

```bash
1. Acesse: https://partner.tiktokshop.com/
2. Faça login com sua conta TikTok Shop
3. Vá em: Apps → Sua Aplicação
```

#### 2. Configurar Redirect URI

**URL EXATA que deve estar configurada:**
```
https://buvglenexmsfkougsfob.supabase.co/functions/v1/tiktok-auth-callback
```

**Como configurar:**
1. No Partner Portal → Apps → Sua App
2. Procure "Redirect URI" ou "Callback URL"
3. Cole a URL exata acima
4. Salve as alterações

#### 3. Verificar Permissões (Scopes)

Certifique-se de que sua aplicação tem estes scopes:
- ✅ `orders.read` - Ler pedidos
- ✅ `products.read` - Ler produtos  
- ✅ `seller.read` - Ler informações do vendedor
- ✅ `shop.read` - Ler informações da loja

#### 4. Configurar Variáveis no Supabase

```bash
# Conectar ao projeto
supabase link --project-ref buvglenexmsfkougsfob

# Configurar secrets
supabase secrets set TIKTOK_APP_KEY=seu_app_key_aqui
supabase secrets set TIKTOK_APP_SECRET=seu_app_secret_aqui
supabase secrets set TIKTOK_ACCESS_TOKEN=  # Deixe vazio por enquanto
```

#### 5. Deploy das Edge Functions

```bash
supabase functions deploy tiktok-auth-callback
supabase functions deploy tiktok-shop-api
```

#### 6. Testar Conexão

1. Acesse `/integracoes` no seu app
2. Clique em "Conectar TikTok Shop"
3. Siga o fluxo OAuth
4. Copie o Access Token gerado
5. Configure:
```bash
supabase secrets set TIKTOK_ACCESS_TOKEN=token_copiado
```

---

### Para TikTok Ads:

#### 1. Verificar Aplicação no Business Portal

```bash
1. Acesse: https://business-api.tiktok.com/portal/
2. Faça login com sua conta TikTok for Business
3. Vá em: Apps → My Apps → Sua Aplicação
```

#### 2. Configurar Redirect URI

**URL EXATA que deve estar configurada:**
```
https://buvglenexmsfkougsfob.supabase.co/functions/v1/tiktok-ads-callback
```

#### 3. Verificar Permissões (Scopes)

Certifique-se de que sua aplicação tem:
- ✅ `Advertiser Management` - Gerenciar contas de anunciante
- ✅ `Campaign Management` - Gerenciar campanhas
- ✅ `Reporting` - Acessar relatórios

#### 4. Configurar Variáveis no Supabase

```bash
supabase secrets set TIKTOK_ADS_ACCESS_TOKEN=  # Deixe vazio por enquanto
```

#### 5. Deploy da Edge Function

```bash
supabase functions deploy tiktok-ads-callback
supabase functions deploy tiktok-ads-api
```

---

## 🔐 Método Alternativo: Configuração Manual

Se o OAuth não estiver funcionando, use a configuração manual:

### Passo 1: Obter Token Manualmente

**Para TikTok Shop:**
1. Use Postman ou similar para fazer OAuth manual
2. Ou solicite ao suporte do TikTok um token de teste

**Para TikTok Ads:**
1. No Business Portal, vá em "Access Token"
2. Gere um token manualmente (Long-term)
3. Copie o token e Advertiser ID

### Passo 2: Configurar no Supabase

```bash
# TikTok Shop
supabase secrets set TIKTOK_ACCESS_TOKEN=seu_token_manual

# TikTok Ads
supabase secrets set TIKTOK_ADS_ACCESS_TOKEN=seu_token_manual
```

### Passo 3: Usar na Interface

1. Acesse `/integracoes`
2. Clique em "Conectar"
3. Vá na aba "Configuração Manual"
4. Cole o Access Token
5. Salve

---

## 🌍 Problemas Específicos por Região

### Brasil (TikTok Shop)

**Erro: "Not available in region"**

✅ **Soluções:**

1. **Verificar acesso ao TikTok Shop BR:**
   ```
   - Acesse: https://seller-br.tiktok.com/
   - Se não conseguir acessar → Shop não disponível ainda
   - Solicite acesso: br-seller-support@tiktok.com
   ```

2. **Verificar região da aplicação:**
   ```
   - Partner Portal → Apps → Sua App
   - Region deve estar: "Global" ou "Brazil"
   - Se estiver "US" → Criar nova app na região correta
   ```

3. **Aguardar liberação:**
   ```
   - TikTok Shop BR está em expansão gradual
   - Entre na lista de espera
   - Use dados de teste enquanto isso
   ```

---

## 🧪 Modo de Teste (Dados Simulados)

Se não conseguir conectar por nenhum método, use dados de teste:

### 1. Criar arquivo de teste

```typescript
// src/lib/testData.ts
export const testShopData = {
  shops: [{ shop_id: 'test_shop', shop_name: 'Loja Teste', ... }],
  orders: [
    { order_id: 'TEST001', total_amount: '299.99', ... },
    { order_id: 'TEST002', total_amount: '149.99', ... },
  ],
  products: [
    { id: 'PROD001', title: 'Produto Teste 1', ... },
    { id: 'PROD002', title: 'Produto Teste 2', ... },
  ],
};
```

### 2. Popular IndexedDB

```typescript
import { saveOrders, saveProducts } from '@/lib/indexedDB';
import { testShopData } from '@/lib/testData';

// No console do navegador:
await saveOrders(testShopData.orders);
await saveProducts(testShopData.products);
```

### 3. Marcar como conectado

```typescript
import { setConnectionStatus } from '@/lib/indexedDB';

setConnectionStatus({ shop: true, last_sync: new Date().toISOString() });
```

Recarregue a página e os dados de teste aparecerão!

---

## 📝 Checklist de Diagnóstico

### TikTok Shop:
- [ ] Conta TikTok Shop ativa e aprovada
- [ ] Aplicação criada no Partner Portal
- [ ] Redirect URI configurado corretamente
- [ ] App Key e App Secret configurados no Supabase
- [ ] Edge Functions deployed
- [ ] Região da aplicação corresponde à da loja
- [ ] Scopes corretos selecionados

### TikTok Ads:
- [ ] Conta TikTok for Business ativa
- [ ] Conta de anunciante criada
- [ ] Aplicação criada no Business Portal
- [ ] Redirect URI configurado corretamente
- [ ] App ID e App Secret configurados
- [ ] Edge Functions deployed
- [ ] Permissões corretas (Advertiser, Campaign, Reporting)

---

## 🔍 Logs de Debug

### Verificar logs das Edge Functions:

```bash
# Logs em tempo real
supabase functions logs tiktok-auth-callback --tail
supabase functions logs tiktok-shop-api --tail
supabase functions logs tiktok-ads-callback --tail
supabase functions logs tiktok-ads-api --tail
```

### Verificar no Supabase Dashboard:

1. Acesse: https://supabase.com/dashboard/project/buvglenexmsfkougsfob
2. Vá em: Functions → Logs
3. Procure por erros recentes

### Verificar no IndexedDB:

1. Chrome DevTools → Application → IndexedDB → tiktok_data
2. Veja se há dados salvos

---

## 💡 Perguntas Frequentes

### P: Por que o OAuth redireciona mas não funciona?
**R:** Provavelmente o Redirect URI está diferente do configurado no portal. Use EXATAMENTE a mesma URL, incluindo https://.

### P: Preciso recriar minha aplicação?
**R:** Só se a região estiver errada ou se você não conseguir editar o Redirect URI.

### P: O token expira?
**R:** Sim, tokens TikTok expiram. Shop tokens duram ~60 dias, Ads tokens duram ~30 dias. Você precisará reconectar.

### P: Posso usar uma conta de teste?
**R:** TikTok Shop não oferece sandbox. TikTok Ads oferece conta de teste via Business Portal.

### P: Como sei se minha região tem TikTok Shop?
**R:** Tente acessar seller-br.tiktok.com (Brasil) ou seller-us.tiktok.com (EUA). Se não carregar, não está disponível.

---

## 📞 Suporte

### TikTok Shop Brasil:
- Email: br-seller-support@tiktok.com
- Centro de Ajuda: https://seller-br.tiktok.com/university/home

### TikTok Ads:
- Centro de Ajuda: https://ads.tiktok.com/help/
- Business Support: Via portal business-api.tiktok.com

### Supabase:
- Documentação: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

## ✅ Próximos Passos Após Resolver

1. Testar sincronização manual
2. Verificar se dados aparecem no dashboard
3. Configurar sincronização automática
4. Explorar relatórios e métricas

---

**Última atualização:** 2024-12-19
