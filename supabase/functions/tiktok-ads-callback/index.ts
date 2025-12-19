import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('auth_code');
    const state = url.searchParams.get('state');

    if (!code) {
      throw new Error('Authorization code not found');
    }

    const appId = Deno.env.get('TIKTOK_APP_KEY') || '';
    const appSecret = Deno.env.get('TIKTOK_APP_SECRET') || '';

    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: appId,
          secret: appSecret,
          auth_code: code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.code !== 0) {
      throw new Error(tokenData.message || 'Token exchange failed');
    }

    // Get user from session
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (user) {
        const expiresAt = new Date(Date.now() + tokenData.data.expires_in * 1000);

        await supabaseClient.from('tiktok_ads_auth').upsert({
          user_id: user.id,
          access_token: tokenData.data.access_token,
          expires_at: expiresAt.toISOString(),
          advertiser_id: tokenData.data.advertiser_id,
        });
      }
    }

    // Redirect to integrations page
    const redirectUrl = `${url.origin}/integracoes?tiktok_ads_connected=true`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    });

  } catch (error: any) {
    console.error('Error:', error);
    
    const url = new URL(req.url);
    const redirectUrl = `${url.origin}/integracoes?tiktok_ads_error=${encodeURIComponent(error.message)}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    });
  }
});
