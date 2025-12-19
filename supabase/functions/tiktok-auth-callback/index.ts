import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateSignature(params: Record<string, string>, appSecret: string): Promise<string> {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('');
  
  const signString = `${appSecret}${sortedParams}${appSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      throw new Error('Authorization code not found');
    }

    const appKey = Deno.env.get('TIKTOK_APP_KEY') || '';
    const appSecret = Deno.env.get('TIKTOK_APP_SECRET') || '';

    // Exchange code for access token
    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = {
      app_key: appKey,
      app_secret: appSecret,
      auth_code: code,
      grant_type: 'authorized_code',
    };

    const signature = await generateSignature(params, appSecret);

    const tokenResponse = await fetch(
      'https://auth.tiktok-shops.com/api/v2/token/get',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          sign: signature,
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

    // For now, we'll use a simple approach to store the token
    // In production, you should properly handle user authentication
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (user) {
        const expiresAt = new Date(Date.now() + tokenData.data.expires_in * 1000);

        await supabaseClient.from('tiktok_auth').upsert({
          user_id: user.id,
          access_token: tokenData.data.access_token,
          refresh_token: tokenData.data.refresh_token,
          expires_at: expiresAt.toISOString(),
          open_id: tokenData.data.open_id,
          seller_id: tokenData.data.seller_id,
          seller_base_region: tokenData.data.seller_base_region,
        });
      }
    }

    // Redirect to integrations page
    const redirectUrl = `${url.origin}/integracoes?tiktok_connected=true`;
    
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
    const redirectUrl = `${url.origin}/integracoes?tiktok_error=${encodeURIComponent(error.message)}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    });
  }
});
