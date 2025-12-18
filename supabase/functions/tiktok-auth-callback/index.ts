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
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    console.log('Received auth callback with code:', code ? 'present' : 'missing');

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Authorization code not provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const appKey = Deno.env.get('TIKTOK_APP_KEY');
    const appSecret = Deno.env.get('TIKTOK_APP_SECRET');

    if (!appKey || !appSecret) {
      console.error('Missing TikTok credentials');
      return new Response(
        JSON.stringify({ error: 'TikTok credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange authorization code for access token
    const tokenUrl = 'https://auth.tiktok-shops.com/api/v2/token/get';
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_key: appKey,
        app_secret: appSecret,
        auth_code: code,
        grant_type: 'authorized_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token exchange response:', JSON.stringify(tokenData));

    if (tokenData.code !== 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to get access token', details: tokenData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the tokens - in production, you'd want to store these securely
    const { access_token, refresh_token, access_token_expire_in } = tokenData.data;

    // Redirect back to the app with success message
    const redirectUrl = new URL(Deno.env.get('SUPABASE_URL') || '');
    const appUrl = redirectUrl.origin.replace('supabase.co', 'lovable.app').replace('buvglenexmsfkougsfob.', '');
    
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>TikTok Shop Authorization</title>
          <style>
            body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: white; }
            .container { text-align: center; padding: 2rem; }
            .success { color: #10b981; font-size: 1.5rem; margin-bottom: 1rem; }
            .token { background: #2d2d44; padding: 1rem; border-radius: 8px; margin: 1rem 0; word-break: break-all; font-size: 0.75rem; }
            .label { color: #9ca3af; margin-bottom: 0.5rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓ Autorização bem sucedida!</div>
            <p>Guarde o Access Token abaixo para usar na integração:</p>
            <div class="label">Access Token:</div>
            <div class="token">${access_token}</div>
            <div class="label">Refresh Token:</div>
            <div class="token">${refresh_token}</div>
            <div class="label">Expira em: ${Math.floor(access_token_expire_in / 3600)} horas</div>
          </div>
        </body>
      </html>`,
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error in tiktok-auth-callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
