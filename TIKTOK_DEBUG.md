# Problema: Redirecionamento Incorreto do TikTok OAuth

## 🐛 Sintoma

Ao clicar em "Conectar TikTok Shop", você é redirecionado para:
```
https://www.tiktok.com/v2/auth/authorize/?client_key=awn32gkr1d27lv49...
```

**Problema:** Esse é o endpoint do **TikTok for Creators** (para criar conteúdo/vídeos), não do **TikTok Shop** (para e-commerce).

## 🔍 Análise da URL Problemática

```
URL: https://www.tiktok.com/v2/auth/authorize/
     ❌ Endpoint errado (deveria ser services.tiktokglobalshop.com)

client_key: awn32gkr1d27lv49
     ❌ App diferente (não é o nosso app_key)

redirect_uri: https://seller-br.tiktok.com/account/oauth/tt/callback
     ❌ Callback para o Seller Center, não para nossa API

scope: user.info.username, video.list, comment.list...
     ❌ Scopes de Creator, não de Shop
```

## ✅ URL Correta Esperada

```
URL: https://services.tiktokglobalshop.com/open/authorize
     ✅ Endpoint correto do TikTok Shop API

app_key: [seu_app_key]
     ✅ Seu app registrado no Partner Portal

redirect_uri: https://[supabase]/functions/v1/tiktok-auth-callback
     ✅ Callback para sua edge function

(Sem scope - TikTok Shop não usa scopes no authorize)
```

## 🎯 Possíveis Causas

### 1. **App Registrado no Portal Errado**

Você pode ter criado o app em:
- ❌ **TikTok for Developers** (https://developers.tiktok.com) - Para criadores de conteúdo
- ✅ **TikTok Shop Partner** (https://partner.tiktokshop.com) - Para vendedores

**Solução:**
1. Acesse: https://partner.tiktokshop.com/developer/apps
2. Verifique se seu app está listado lá
3. Se não estiver, crie um novo app no Partner Portal
4. Use o `app_key` e `app_secret` desse novo app

### 2. **TikTok Está Interceptando o Redirect**

O TikTok pode estar detectando sua região (Brasil) e forçando redirect para o Seller Center local.

**Solução:**
- Tente usar VPN para simular outra região (EUA, UK)
- Ou use o endpoint regional correto: `https://services.tiktokshop.com.br/` (se disponível)

### 3. **App Key Incorreto**

O `app_key` no `.env` pode estar errado ou de outro app.

**Solução:**
```bash
# Verifique o .env
cat .env | grep TIKTOK

# Deve mostrar:
VITE_TIKTOK_APP_KEY="[seu_app_key_aqui]"
```

### 4. **Redirect URI Não Cadastrado**

O redirect URI deve estar cadastrado no Developer Portal.

**Solução:**
1. Acesse: https://partner.tiktokshop.com/developer/apps/[seu_app_id]
2. Vá em "Authorization callback URL"
3. Adicione: `https://buvglenexmsfkougsfob.supabase.co/functions/v1/tiktok-auth-callback`
4. Salve e aguarde até 5 minutos para propagar

## 🔧 Como Debugar

### Passo 1: Verificar a URL Gerada

Abra o console do navegador (F12) e clique em "Conectar TikTok Shop".

Você verá logs como:
```
🔗 TikTok Shop OAuth URL: https://services.tiktokglobalshop.com/open/authorize?app_key=...
📋 Detalhes: { appKey: "...", redirectUri: "...", ... }
```

**Verifique:**
- ✅ URL começa com `https://services.tiktokglobalshop.com/`
- ✅ `app_key` está correto
- ✅ `redirect_uri` aponta para seu Supabase

### Passo 2: Testar Manualmente

Cole a URL no navegador (modo anônimo) e veja se:
- ✅ Carrega a página de autorização do TikTok Shop
- ❌ Redireciona para outro lugar

### Passo 3: Verificar App no Partner Portal

1. Acesse: https://partner.tiktokshop.com/developer/apps
2. Clique no seu app
3. Verifique:
   - **Status:** Ativo
   - **Region:** Disponível para sua região
   - **Redirect URIs:** Contém sua URL do Supabase

## 📝 Checklist de Verificação

- [ ] App criado no **Partner Portal** (não no Developers Portal)
- [ ] `app_key` correto no `.env`
- [ ] Redirect URI cadastrado no app
- [ ] App aprovado/ativo no Partner Portal
- [ ] URL gerada começa com `services.tiktokglobalshop.com`
- [ ] Região do app suporta Brasil

## 🚨 Problema Comum: Região Brasil

**Importante:** TikTok Shop pode não estar disponível oficialmente no Brasil via API.

As regiões oficialmente suportadas são:
- 🇺🇸 United States
- 🇬🇧 United Kingdom  
- 🇮🇩 Indonesia
- 🇲🇾 Malaysia
- 🇵🇭 Philippines
- 🇸🇬 Singapore
- 🇹🇭 Thailand
- 🇻🇳 Vietnam

**Se você estiver no Brasil:**

### Opção 1: Usar TikTok Shop de Região Suportada
```typescript
// Mudar endpoint para região específica
const authUrl = `https://services.tiktokshop.com/open/authorize?app_key=...`;
// Ou
const authUrl = `https://services.tiktokshop.co.uk/open/authorize?app_key=...`;
```

### Opção 2: Aguardar Disponibilidade
O TikTok Shop pode estar em fase de rollout no Brasil.

### Opção 3: Contato com Suporte
Entre em contato com o suporte do TikTok Shop Partner para verificar disponibilidade da API no Brasil.

## 📞 Próximos Passos

1. **Abra o console (F12)** e tente conectar novamente
2. **Copie a URL completa** que aparece no console
3. **Compartilhe a URL** para análise adicional
4. **Verifique seu app** no Partner Portal
5. **Confirme a região** do seu app e loja

## 🔗 Links Úteis

- **Partner Portal:** https://partner.tiktokshop.com/developer/apps
- **Documentação:** https://partner.tiktokshop.com/docv2
- **API Docs:** https://partner.tiktokshop.com/doc/page/262746
- **Regiões Suportadas:** https://partner.tiktokshop.com/doc/page/262820

---

**Precisa de mais ajuda?** Compartilhe:
1. A URL completa que aparece no console
2. Print da configuração do seu app no Partner Portal
3. Região/país da sua loja TikTok Shop
