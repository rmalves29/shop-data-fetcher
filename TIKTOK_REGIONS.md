# 🌍 Configuração Regional - TikTok Shop

## Problema: "Não disponível na região da sua loja"

Se você recebeu este erro, significa que a aplicação TikTok Shop não está disponível para a região/mercado da sua loja.

## 📍 Regiões Disponíveis do TikTok Shop

O TikTok Shop opera em diferentes regiões com **URLs de API diferentes**:

### 1. **Global (incluindo Brasil)**
- **URL Base**: `https://open-api.tiktokglobalshop.com`
- **Regiões**: Brasil, Reino Unido, e outros mercados globais
- **Partner Portal**: https://partner.tiktokshop.com/

### 2. **Estados Unidos**
- **URL Base**: `https://open-api.us.tiktokshop.com`
- **Região**: Apenas EUA
- **Partner Portal**: https://partner.us.tiktokshop.com/

### 3. **Sudeste Asiático**
- **URL Base**: `https://open-api.tiktokglobalshop.com`
- **Regiões**: Indonésia, Tailândia, Vietnã, Filipinas, Malásia, Singapura
- **Partner Portal**: https://partner.tiktokshop.com/

## 🔧 Como Resolver

### Passo 1: Identificar Sua Região

1. Acesse sua conta do TikTok Shop Seller Center
2. Verifique o domínio:
   - `seller-br.tiktok.com` → Brasil (Global)
   - `seller-us.tiktok.com` → Estados Unidos
   - `seller.tiktokglobalshop.com` → Global/SEA

### Passo 2: Verificar/Criar Aplicação na Região Correta

#### Para Brasil e Outros Mercados Globais:

1. Acesse: https://partner.tiktokshop.com/
2. Vá em **Apps** → **Create App** (ou selecione app existente)
3. Configure:
   - **App Name**: Seu app
   - **Region**: Selecione **Global** ou **Brazil**
   - **Redirect URI**: `https://buvglenexmsfkougsfob.supabase.co/functions/v1/tiktok-auth-callback`

#### Para Estados Unidos:

1. Acesse: https://partner.us.tiktokshop.com/
2. Crie ou configure aplicação para região US
3. **IMPORTANTE**: Precisa alterar o código da Edge Function

### Passo 3: Atualizar Edge Function (se necessário)

Se você está nos **EUA**, precisa alterar a URL base:

```typescript
// No arquivo: supabase/functions/tiktok-shop-api/index.ts

// Trocar de:
const TIKTOK_API_BASE = 'https://open-api.tiktokglobalshop.com';

// Para:
const TIKTOK_API_BASE = 'https://open-api.us.tiktokshop.com';
```

Depois fazer deploy:
```bash
supabase functions deploy tiktok-shop-api
```

### Passo 4: Reautorizar a Aplicação

1. Vá em `/integracoes`
2. Clique em **"Conectar TikTok Shop"**
3. Autorize novamente
4. Configure o novo Access Token

## 🇧🇷 Situação Específica do Brasil

### Status Atual:
- TikTok Shop BR está em **expansão gradual**
- Nem todas as contas têm acesso imediato
- Pode haver fila de espera para sellers

### Como Verificar se Você Tem Acesso:

1. Acesse: https://seller-br.tiktok.com/
2. Verifique se consegue acessar o painel de vendedor
3. Procure por "TikTok Shop" nas configurações

### Se Não Tiver Acesso:

**Opção A - Solicitar Acesso:**
1. Entre em contato com TikTok Shop BR
2. Email: `br-seller-support@tiktok.com`
3. Ou através do suporte no app do TikTok

**Opção B - Usar Conta de Teste:**
1. Algumas regiões oferecem contas sandbox
2. Verifique na documentação do Partner Portal

**Opção C - Aguardar Lançamento:**
- O TikTok Shop BR está em expansão
- Novos sellers são adicionados regularmente

## 🔍 Verificar Configuração Atual

Execute este teste para verificar sua configuração:

```bash
# Testar conectividade com a API
curl -X POST https://buvglenexmsfkougsfob.supabase.co/functions/v1/tiktok-shop-api \
  -H "Content-Type: application/json" \
  -d '{"action": "get_shops"}'
```

## 📞 Suporte por Região

### Brasil:
- Email: br-seller-support@tiktok.com
- Centro de Ajuda: https://seller-br.tiktok.com/university/home

### Estados Unidos:
- Email: seller-support@tiktok.com
- Centro de Ajuda: https://seller-us.tiktok.com/university/home

### Global/SEA:
- Centro de Ajuda: https://seller.tiktokglobalshop.com/university/home

## ⚠️ Avisos Importantes

1. **Não misture regiões**: Uma aplicação US não funciona com lojas BR
2. **Tokens são específicos por região**: Não são intercambiáveis
3. **APIs diferentes**: Endpoints podem variar entre regiões
4. **Políticas diferentes**: Cada região tem suas próprias regras

## 🚀 Alternativa: Modo Demo

Se você não tem acesso ao TikTok Shop na sua região, pode usar dados de demonstração:

1. A aplicação já tem suporte a cache offline
2. Você pode popular o IndexedDB com dados de teste
3. Isso permite desenvolver e testar a interface

Exemplo de dados de teste em `src/lib/indexedDB.ts`:

```typescript
// Adicionar dados de demonstração
const demoOrders = [
  {
    order_id: 'DEMO001',
    date: new Date().toISOString(),
    total: 299.99,
    source: 'SHOP',
    status: 'COMPLETED',
  }
];

await saveOrders(demoOrders);
```

## 📚 Referências

- [TikTok Shop Developer Documentation](https://partner.tiktokshop.com/docv2)
- [Region & Market Guide](https://partner.tiktokshop.com/docv2/page/650ac2f5892b730004ee7b60)
- [API Endpoints by Region](https://partner.tiktokshop.com/docv2/page/650ac2f5892b730004ee7b61)

## ✅ Checklist de Resolução

- [ ] Identificar região da minha loja
- [ ] Verificar se aplicação está na região correta
- [ ] Confirmar URL base da API está correta
- [ ] Criar/reconfigurar aplicação se necessário
- [ ] Atualizar Edge Function se mudou região
- [ ] Reautorizar aplicação
- [ ] Testar conexão
- [ ] Verificar dados no dashboard

Se após seguir todos os passos o erro persistir, pode ser que o TikTok Shop ainda não esteja disponível completamente na sua região. Neste caso, entre em contato com o suporte do TikTok Shop.
