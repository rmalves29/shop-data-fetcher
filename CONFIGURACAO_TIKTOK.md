# Configuração das Credenciais TikTok

Este documento explica como configurar as credenciais da API do TikTok Shop para usar o dashboard.

## 📋 Pré-requisitos

1. Conta no [TikTok for Business](https://ads.tiktok.com/)
2. Aplicação criada no [TikTok Developer Portal](https://partner.tiktokshop.com/docv2/page/650a5cb0c1b0ee02c632fb89)
3. Conta autenticada no dashboard

## 🔧 Configuração via Interface (Recomendado)

### Passo 1: Obter as Credenciais no TikTok Developer Portal

1. Acesse [TikTok Developer Portal](https://partner.tiktokshop.com/docv2/page/650a5cb0c1b0ee02c632fb89)
2. Faça login com sua conta TikTok Business
3. Navegue até "My Apps" → Selecione ou crie sua aplicação
4. Copie o **App Key** (também chamado de App ID)
5. Copie o **App Secret** (mantenha em segredo!)

### Passo 2: Configurar no Dashboard

1. Acesse o dashboard e clique no ícone de **Configurações** (⚙️) no header
2. Ou navegue diretamente para `/configuracoes`
3. Preencha os campos:
   - **App Key**: Cole o App Key obtido
   - **App Secret**: Cole o App Secret obtido
   - Deixe os outros campos vazios por enquanto
4. Clique em **Salvar Configurações**

### Passo 3: Conectar sua Loja via OAuth

1. Vá para a página de **Integrações** (`/integracoes`)
2. Clique em **Conectar TikTok Shop**
3. Você será redirecionado para o TikTok para autorizar o acesso
4. Após autorizar, você verá uma página com o **Access Token** e **Refresh Token**
5. Copie esses valores
6. Volte para **Configurações** (`/configuracoes`)
7. Cole o **Access Token** e **Refresh Token** nos campos correspondentes
8. Clique em **Salvar Configurações**

### Pronto! 🎉

Agora você pode usar a integração normalmente. O dashboard buscará os dados da sua loja automaticamente.

## 🔐 Segurança

- **As credenciais são armazenadas de forma segura no banco de dados Supabase**
- **Row Level Security (RLS)** garante que cada usuário só acesse suas próprias credenciais
- **Os campos sensíveis são criptografados** durante o armazenamento
- **Nunca compartilhe seu App Secret ou Access Token**

## 🔄 Renovação de Token

Os Access Tokens do TikTok expiram após algumas horas. Quando isso acontecer:

1. Você verá um aviso na página de Integrações
2. Volte para a página de Integrações
3. Clique em **Conectar TikTok Shop** novamente
4. Autorize o acesso
5. Copie o novo Access Token e cole na página de Configurações
6. Salve as configurações

**Nota:** Se você configurou o Refresh Token, o sistema tentará renovar automaticamente o Access Token quando ele expirar (funcionalidade futura).

## 🛠️ Configuração via Variáveis de Ambiente (Fallback)

Se preferir, você ainda pode configurar as credenciais via variáveis de ambiente no Supabase:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Edge Functions**
4. Adicione as variáveis:
   ```
   TIKTOK_APP_KEY=seu_app_key
   TIKTOK_APP_SECRET=seu_app_secret
   TIKTOK_ACCESS_TOKEN=seu_access_token
   ```

**Nota:** As credenciais configuradas na interface têm prioridade sobre as variáveis de ambiente.

## 📊 Estrutura do Banco de Dados

A tabela `tiktok_credentials` armazena:

```sql
- id (UUID): Identificador único
- user_id (UUID): ID do usuário (FK para auth.users)
- app_key (TEXT): App Key do TikTok
- app_secret (TEXT): App Secret do TikTok
- access_token (TEXT): Access Token obtido via OAuth
- refresh_token (TEXT): Refresh Token para renovação
- shop_id (TEXT): ID da loja conectada
- shop_name (TEXT): Nome da loja
- token_expires_at (TIMESTAMPTZ): Data de expiração do token
- created_at (TIMESTAMPTZ): Data de criação
- updated_at (TIMESTAMPTZ): Data de atualização
```

## ❓ Troubleshooting

### "TikTok credentials not configured"
- Verifique se você preencheu o App Key e App Secret
- Certifique-se de clicar em "Salvar Configurações"

### "TikTok access token not configured"
- Você precisa conectar sua loja via OAuth primeiro
- Vá para a página de Integrações e clique em "Conectar TikTok Shop"

### "Token expirado"
- Siga os passos de "Renovação de Token" acima

### Erro ao salvar configurações
- Verifique se você está autenticado
- Certifique-se de que a migration do banco de dados foi aplicada

## 🔗 Links Úteis

- [TikTok Developer Portal](https://partner.tiktokshop.com/docv2/page/650a5cb0c1b0ee02c632fb89)
- [TikTok Shop API Documentation](https://partner.tiktokshop.com/docv2/page/650a5cb0c1b0ee02c632fb89)
- [Supabase Documentation](https://supabase.com/docs)
