# Fix do Erro de OAuth do TikTok

## 🐛 Problema Identificado

Erro exibido no TikTok for Business:
```
seq_url_value &ih0bhluxugft: an invalid integer, 
strconv.ParseInt: parsing "&ih0bhluxugft": invalid syntax
```

### Causa Raiz

1. **Endpoint incorreto**: Estava usando `services.tiktokshop.com` ao invés de `services.tiktokglobalshop.com`
2. **Endpoint de token incorreto**: Estava usando `auth.tiktok-shops.com` ao invés de `auth.tiktokglobalshop.com`
3. **Parâmetros incorretos na assinatura**: Estava incluindo `app_secret` no corpo da requisição (não deve ser incluído)

## ✅ Correções Aplicadas

### 1. Frontend - src/pages/Integracoes.tsx
```typescript
// ANTES
const authUrl = `https://services.tiktokshop.com/open/authorize?app_key=${appKey}...`

// DEPOIS
const authUrl = `https://services.tiktokglobalshop.com/open/authorize?app_key=${appKey}...`
```

### 2. Backend - supabase/functions/tiktok-auth-callback/index.ts

#### Correção do endpoint
```typescript
// ANTES
'https://auth.tiktok-shops.com/api/v2/token/get'

// DEPOIS
'https://auth.tiktokglobalshop.com/api/v2/token/get'
```

#### Correção dos parâmetros
```typescript
// ANTES - Incluía app_secret no body (ERRADO!)
const params = {
  app_key: appKey,
  app_secret: appSecret,  // ❌ NÃO DEVE ESTAR AQUI
  auth_code: code,
  grant_type: 'authorized_code',
};

// DEPOIS - app_secret só na assinatura (CORRETO!)
const params = {
  app_key: appKey,
  auth_code: code,
  grant_type: 'authorized_code',
};

// Assinatura calculada separadamente
const signString = appSecret + sortedKeys.map(k => k + params[k]).join('') + appSecret;
```

#### Melhor logging
```typescript
console.log('Callback received:', { code: code?.substring(0, 10) + '...', state });
console.log('Token request body:', { ...requestBody, auth_code: code.substring(0, 10) + '...' });
console.log('Token response code:', tokenData.code, 'message:', tokenData.message);
```

## 📚 Documentação TikTok

### Endpoints Corretos

| Região | Authorization | Token |
|--------|---------------|-------|
| **Global** | `https://services.tiktokglobalshop.com/open/authorize` | `https://auth.tiktokglobalshop.com/api/v2/token/get` |
| US | `https://services.tiktokshop.us/open/authorize` | `https://auth.tiktokshop.us/api/v2/token/get` |
| UK | `https://services.tiktokshop.co.uk/open/authorize` | `https://auth.tiktokshop.co.uk/api/v2/token/get` |
| ID | `https://services.tiktokshop.id/open/authorize` | `https://auth.tiktokshop.id/api/v2/token/get` |

### Fluxo OAuth Correto

1. **Autorização**
   ```
   GET https://services.tiktokglobalshop.com/open/authorize
   Params:
   - app_key: SEU_APP_KEY
   - redirect_uri: URL_CALLBACK (URL encoded)
   - state: STRING_ALEATORIA
   ```

2. **Callback**
   ```
   Recebe: ?code=AUTHORIZATION_CODE&state=SEU_STATE
   ```

3. **Troca por Token**
   ```
   POST https://auth.tiktokglobalshop.com/api/v2/token/get
   Body (JSON):
   {
     "app_key": "SEU_APP_KEY",
     "auth_code": "AUTHORIZATION_CODE",
     "grant_type": "authorized_code",
     "sign": "SHA256_SIGNATURE"
   }
   ```

4. **Cálculo da Assinatura**
   ```
   1. Ordenar parâmetros alfabeticamente (app_key, auth_code, grant_type)
   2. Concatenar: key1value1key2value2key3value3
   3. Envolver com app_secret: SECRET + concatenated + SECRET
   4. SHA-256 hash em hexadecimal
   ```

## 🔍 Como Verificar

### Logs do Supabase

Após fazer deploy, verificar logs:
```bash
supabase functions logs tiktok-auth-callback --follow
```

Você deve ver:
```
Callback received: { code: "abc123...", state: "shop_auth_..." }
Token request body: { app_key: "...", auth_code: "abc123...", grant_type: "authorized_code", sign: "..." }
Token response code: 0 message: success
```

### Testar Manualmente

1. Acessar URL de autorização:
   ```
   https://services.tiktokglobalshop.com/open/authorize?app_key=6ih0dnluvugft&redirect_uri=https%3A%2F%2Fbuvglenexmsfkougsfob.supabase.co%2Ffunctions%2Fv1%2Ftiktok-auth-callback&state=test123
   ```

2. Autorizar no TikTok

3. Verificar se redirecionou corretamente

## 🚀 Deploy

### Configuração de Segurança

**Frontend (arquivo .env):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PROJECT_ID=your-project-id  
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_TIKTOK_APP_KEY=your-tiktok-app-key
```

⚠️ **IMPORTANTE**: 
- Use `.env.example` como template
- **NUNCA** commite o arquivo `.env` no Git
- Todas as credenciais sensíveis devem estar em variáveis de ambiente

**Backend (Supabase Secrets):**
```bash
# 1. Fazer deploy da função atualizada
supabase functions deploy tiktok-auth-callback

# 2. Configurar secrets (se ainda não configurado)
supabase secrets set TIKTOK_APP_KEY=your_app_key_here
supabase secrets set TIKTOK_APP_SECRET=your_secret_here

# 3. Testar a conexão
# Acessar /integracoes e clicar em "Conectar TikTok Shop"
```

## ⚠️ Importante

- ✅ `app_secret` NUNCA deve ir no body da requisição
- ✅ `app_secret` é usado APENAS para calcular a assinatura
- ✅ Use sempre os endpoints `tiktokglobalshop.com` (mais estável)
- ✅ Verifique se o redirect_uri está cadastrado no Developer Portal do TikTok

## 📖 Referências

- [TikTok Shop API - Authorization](https://partner.tiktokshop.com/doc/page/262746)
- [TikTok Shop API - Token](https://partner.tiktokshop.com/doc/page/262748)
- [TikTok Shop API - Signature](https://partner.tiktokshop.com/doc/page/262829)
