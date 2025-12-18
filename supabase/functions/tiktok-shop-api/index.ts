import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIKTOK_API_BASE = 'https://open-api.tiktokglobalshop.com';

function generateSignature(path: string, params: Record<string, string>, appSecret: string): string {
  // Sort parameters alphabetically and create signature string
  const sortedKeys = Object.keys(params).sort();
  const signString = sortedKeys.map(key => `${key}${params[key]}`).join('');
  const stringToSign = `${appSecret}${path}${signString}${appSecret}`;
  
  const hmac = createHmac('sha256', appSecret);
  hmac.update(stringToSign);
  return hmac.digest('hex');
}

async function makeApiRequest(
  path: string, 
  accessToken: string, 
  appKey: string, 
  appSecret: string,
  additionalParams: Record<string, string> = {},
  method: string = 'GET',
  body?: object
) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  const params: Record<string, string> = {
    app_key: appKey,
    timestamp: timestamp,
    access_token: accessToken,
    ...additionalParams,
  };

  const sign = generateSignature(path, params, appSecret);
  params.sign = sign;

  const queryString = new URLSearchParams(params).toString();
  const url = `${TIKTOK_API_BASE}${path}?${queryString}`;

  console.log(`Making ${method} request to: ${path}`);
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body && method === 'POST') {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, shop_cipher, page_size = '20', cursor } = await req.json();

    const appKey = Deno.env.get('TIKTOK_APP_KEY');
    const appSecret = Deno.env.get('TIKTOK_APP_SECRET');
    const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');

    if (!appKey || !appSecret) {
      return new Response(
        JSON.stringify({ error: 'TikTok credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'TikTok access token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (action) {
      case 'get_shops':
        // Get authorized shops
        result = await makeApiRequest(
          '/authorization/202309/shops',
          accessToken,
          appKey,
          appSecret
        );
        break;

      case 'get_orders':
        // Get orders list
        if (!shop_cipher) {
          return new Response(
            JSON.stringify({ error: 'shop_cipher required for orders' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await makeApiRequest(
          '/order/202309/orders/search',
          accessToken,
          appKey,
          appSecret,
          { 
            shop_cipher,
            page_size,
            ...(cursor && { cursor })
          }
        );
        break;

      case 'get_products':
        // Get products list
        if (!shop_cipher) {
          return new Response(
            JSON.stringify({ error: 'shop_cipher required for products' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await makeApiRequest(
          '/product/202309/products/search',
          accessToken,
          appKey,
          appSecret,
          { 
            shop_cipher,
            page_size,
            ...(cursor && { cursor })
          }
        );
        break;

      case 'get_seller_info':
        // Get seller info
        result = await makeApiRequest(
          '/seller/202309/shops',
          accessToken,
          appKey,
          appSecret
        );
        break;

      case 'get_finance':
        // Get finance/settlements data
        if (!shop_cipher) {
          return new Response(
            JSON.stringify({ error: 'shop_cipher required for finance' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await makeApiRequest(
          '/finance/202309/settlements',
          accessToken,
          appKey,
          appSecret,
          { 
            shop_cipher,
            page_size,
            ...(cursor && { cursor })
          }
        );
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action', valid_actions: ['get_shops', 'get_orders', 'get_products', 'get_seller_info', 'get_finance'] }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Action ${action} result:`, JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in tiktok-shop-api:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
