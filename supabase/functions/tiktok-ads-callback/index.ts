import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const authCode = url.searchParams.get('auth_code');
    const state = url.searchParams.get('state');

    console.log('Received TikTok Ads callback with auth_code:', authCode ? 'present' : 'missing');
    console.log('State:', state);

    if (!authCode) {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>TikTok Ads Authorization</title>
            <style>
              body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: white; }
              .container { text-align: center; padding: 2rem; }
              .error { color: #ef4444; font-size: 1.5rem; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">❌ Código de autorização não recebido</div>
              <p>Tente autorizar novamente.</p>
            </div>
          </body>
        </html>`,
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    const appId = Deno.env.get('TIKTOK_APP_KEY');
    const appSecret = Deno.env.get('TIKTOK_APP_SECRET');

    if (!appId || !appSecret) {
      console.error('Missing TikTok Ads credentials');
      return new Response(
        JSON.stringify({ error: 'TikTok Ads credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange authorization code for access token
    // TikTok Marketing API token endpoint
    const tokenUrl = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/';
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        secret: appSecret,
        auth_code: authCode,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('TikTok Ads token exchange response:', JSON.stringify(tokenData));

    if (tokenData.code !== 0) {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>TikTok Ads Authorization</title>
            <style>
              body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: white; }
              .container { text-align: center; padding: 2rem; }
              .error { color: #ef4444; font-size: 1.5rem; margin-bottom: 1rem; }
              .details { background: #2d2d44; padding: 1rem; border-radius: 8px; margin: 1rem 0; font-size: 0.85rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">❌ Erro ao obter access token</div>
              <div class="details">${tokenData.message || 'Erro desconhecido'}</div>
            </div>
          </body>
        </html>`,
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    const { access_token, advertiser_ids } = tokenData.data;

    // Return success page with tokens
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>TikTok Ads Authorization</title>
          <style>
            body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: white; }
            .container { text-align: center; padding: 2rem; max-width: 600px; }
            .success { color: #10b981; font-size: 1.5rem; margin-bottom: 1rem; }
            .token { background: #2d2d44; padding: 1rem; border-radius: 8px; margin: 1rem 0; word-break: break-all; font-size: 0.75rem; }
            .label { color: #9ca3af; margin-bottom: 0.5rem; }
            .info { color: #60a5fa; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓ TikTok Ads autorizado com sucesso!</div>
            <p>Guarde o Access Token abaixo para usar na integração:</p>
            <div class="label">Access Token:</div>
            <div class="token">${access_token}</div>
            <div class="label">Advertiser IDs:</div>
            <div class="token">${advertiser_ids?.join(', ') || 'Nenhum'}</div>
            <div class="info">
              <p>Para usar este token, adicione-o como secret TIKTOK_ADS_ACCESS_TOKEN no projeto.</p>
            </div>
          </div>
        </body>
      </html>`,
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error in tiktok-ads-callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>TikTok Ads Authorization</title>
          <style>
            body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: white; }
            .container { text-align: center; padding: 2rem; }
            .error { color: #ef4444; font-size: 1.5rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌ Erro interno</div>
            <p>${errorMessage}</p>
          </div>
        </body>
      </html>`,
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }
});
