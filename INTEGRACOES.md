# Integrações TikTok - Guia de Configuração

Este sistema integra tanto o **TikTok Shop** quanto o **TikTok Ads** para fornecer uma visão completa dos seus dados de e-commerce e marketing.

## 📦 TikTok Shop Integration

### O que é coletado:
- Pedidos e vendas
- Produtos ativos no catálogo
- Vendas por live streaming
- Informações financeiras

### Como configurar:

1. **Obter credenciais da aplicação:**
   - Acesse [TikTok Shop Partner Portal](https://partner.tiktokshop.com/)
   - Crie uma aplicação ou use uma existente
   - Anote o `App Key` e `App Secret`

2. **Configurar variáveis de ambiente no Supabase:**
   ```bash
   TIKTOK_APP_KEY=seu_app_key_aqui
   TIKTOK_APP_SECRET=seu_app_secret_aqui
   ```

3. **Autorizar a aplicação:**
   - Na página `/integracoes`, clique em "Conectar TikTok Shop"
   - Autorize a aplicação na página do TikTok
   - Copie o Access Token gerado

4. **Configurar o Access Token:**
   ```bash
   TIKTOK_ACCESS_TOKEN=seu_access_token_aqui
   ```

### Endpoints da API utilizados:
- `GET /authorization/202309/shops` - Lista lojas autorizadas
- `GET /order/202309/orders/search` - Busca pedidos
- `GET /product/202309/products/search` - Busca produtos
- `GET /finance/202309/settlements` - Dados financeiros

## 📊 TikTok Ads Integration

### O que é coletado:
- Gastos com anúncios
- Impressões e alcance
- Cliques e CTR
- Conversões e ROAS
- Dados de campanhas e grupos de anúncios

### Como configurar:

1. **Obter credenciais da aplicação:**
   - Acesse [TikTok for Business Portal](https://business-api.tiktok.com/)
   - Crie uma aplicação ou use uma existente
   - Anote o `App ID` e `App Secret`

2. **Configurar variáveis de ambiente no Supabase:**
   ```bash
   TIKTOK_APP_KEY=seu_app_key_aqui  # Mesmo do Shop
   TIKTOK_APP_SECRET=seu_app_secret_aqui  # Mesmo do Shop
   ```

3. **Autorizar a aplicação:**
   - Na página `/integracoes`, clique em "Conectar TikTok Ads"
   - Autorize a aplicação na página do TikTok for Business
   - Copie o Access Token gerado

4. **Configurar o Access Token:**
   ```bash
   TIKTOK_ADS_ACCESS_TOKEN=seu_ads_access_token_aqui
   ```

### Endpoints da API utilizados:
- `GET /oauth2/advertiser/get/` - Lista contas de anunciante
- `GET /campaign/get/` - Lista campanhas
- `GET /adgroup/get/` - Lista grupos de anúncios
- `GET /ad/get/` - Lista anúncios
- `GET /report/integrated/get/` - Relatórios de desempenho
- `GET /report/audience/get/` - Relatórios de público

## 🔧 Configuração do Supabase

### Edge Functions necessárias:

1. **tiktok-auth-callback**: Callback OAuth do TikTok Shop
2. **tiktok-shop-api**: API proxy para TikTok Shop
3. **tiktok-ads-callback**: Callback OAuth do TikTok Ads
4. **tiktok-ads-api**: API proxy para TikTok Ads

### Como fazer deploy das Edge Functions:

```bash
# Autenticar no Supabase
supabase login

# Link com o projeto
supabase link --project-ref buvglenexmsfkougsfob

# Deploy das funções
supabase functions deploy tiktok-auth-callback
supabase functions deploy tiktok-shop-api
supabase functions deploy tiktok-ads-callback
supabase functions deploy tiktok-ads-api

# Configurar secrets
supabase secrets set TIKTOK_APP_KEY=seu_app_key
supabase secrets set TIKTOK_APP_SECRET=seu_app_secret
supabase secrets set TIKTOK_ACCESS_TOKEN=seu_shop_token
supabase secrets set TIKTOK_ADS_ACCESS_TOKEN=seu_ads_token
```

## 💾 Armazenamento Local

Os dados são armazenados localmente usando **IndexedDB** para:
- Cache offline
- Redução de chamadas à API
- Melhor performance
- Sincronização automática

### Stores do IndexedDB:
- `orders`: Pedidos do TikTok Shop
- `products`: Produtos do catálogo
- `live`: Dados de vendas por live
- `ads`: Métricas de anúncios

## 🔄 Sincronização

### Automática:
- Ao carregar a página inicial
- Ao acessar a página de integrações
- A cada 15 minutos (se habilitado)

### Manual:
- Botão "Sincronizar" na página de integrações
- Botão "Atualizar" no dashboard

## 📈 Métricas Calculadas

### Shop:
- **Receita Total**: Soma de todos os pedidos
- **Ticket Médio**: Receita / Número de pedidos
- **Taxa de Conversão**: (Em desenvolvimento)

### Ads:
- **CTR**: (Cliques / Impressões) × 100
- **CPC**: Gasto / Cliques
- **Taxa de Conversão**: (Conversões / Cliques) × 100
- **ROAS**: Receita das Conversões / Gasto
- **Custo por Conversão**: Gasto / Conversões

## 🐛 Troubleshooting

### Token Expirado
Se aparecer "Token expirado", reconecte na página de integrações.

### Erro de API
Verifique:
1. Variáveis de ambiente configuradas corretamente
2. Access tokens válidos
3. Permissões da aplicação
4. Logs das Edge Functions no Supabase

### Dados não aparecem
1. Verifique se a autorização foi feita corretamente
2. Aguarde alguns segundos após a conexão
3. Clique em "Sincronizar"
4. Verifique o console do navegador

## 📚 Referências

- [TikTok Shop API Documentation](https://partner.tiktokshop.com/docv2/page/64f8c3e9e5c45102e0fbb048)
- [TikTok Marketing API Documentation](https://business-api.tiktok.com/portal/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🔐 Segurança

- Nunca exponha seus tokens no código frontend
- Sempre use Edge Functions para chamar APIs
- Tokens são armazenados como secrets no Supabase
- Nenhum dado sensível é armazenado no IndexedDB

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs no console do navegador
2. Verifique os logs das Edge Functions no Supabase
3. Consulte a documentação oficial do TikTok
