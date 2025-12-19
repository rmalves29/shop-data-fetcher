import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TikTokAuthData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_in: number;
  open_id: string;
  seller_id: string;
  seller_base_region: string;
}

async function getAccessToken(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tiktok_auth')
      .select('access_token, expires_at')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching access token:', error);
      return null;
    }

    // Check if token is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.log('Access token expired');
      return null;
    }

    return data.access_token;
  } catch (error) {
    console.error('Error in getAccessToken:', error);
    return null;
  }
}

async function makeApiRequest(
  url: string,
  accessToken: string,
  params: Record<string, any> = {},
  retries = 3
): Promise<any> {
  const appKey = Deno.env.get('TIKTOK_APP_KEY') || '';
  const appSecret = Deno.env.get('TIKTOK_APP_SECRET') || '';
  
  // Generate timestamp and signature
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Build query string
  const queryParams = new URLSearchParams({
    app_key: appKey,
    timestamp: String(timestamp),
    access_token: accessToken,
    ...params,
  });

  // Generate signature
  const paramString = Array.from(queryParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}${value}`)
    .join('');
  
  const signString = `${appSecret}${paramString}${appSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  queryParams.append('sign', signature);

  const fullUrl = `${url}?${queryParams.toString()}`;

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error: any) {
      console.error(`Attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (error.name === 'AbortError') {
        if (i === retries - 1) {
          throw new Error('Request timeout after multiple retries');
        }
      } else if (i === retries - 1) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw new Error('Max retries exceeded');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, shop_cipher } = await req.json();

    const accessToken = await getAccessToken(supabaseClient, user.id);
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          code: 105001,
          message: 'Access token not found or expired',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let result;

    switch (action) {
      case 'get_shops':
        result = await makeApiRequest(
          'https://open-api.tiktokglobalshop.com/api/shop/get_authorized_shop',
          accessToken
        );
        break;

      case 'get_orders':
        if (!shop_cipher) {
          throw new Error('shop_cipher is required for get_orders');
        }
        
        // Get orders from last 30 days
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - (30 * 24 * 60 * 60);
        
        result = await makeApiRequest(
          'https://open-api.tiktokglobalshop.com/api/orders/search',
          accessToken,
          {
            shop_cipher,
            create_time_from: startTime,
            create_time_to: endTime,
            page_size: 50,
          }
        );
        break;

      case 'get_products':
        if (!shop_cipher) {
          throw new Error('shop_cipher is required for get_products');
        }
        
        result = await makeApiRequest(
          'https://open-api.tiktokglobalshop.com/api/products/search',
          accessToken,
          {
            shop_cipher,
            page_size: 50,
          }
        );
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        code: -1,
        message: error.message || 'Internal server error',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
