import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export interface TikTokCredentials {
  app_key: string;
  app_secret: string;
  access_token: string | null;
  refresh_token: string | null;
  shop_id: string | null;
  shop_name: string | null;
  token_expires_at: string | null;
}

/**
 * Get TikTok credentials for a user from the database
 * Falls back to environment variables if no user credentials are found
 */
export async function getTikTokCredentials(
  userId?: string
): Promise<TikTokCredentials | null> {
  // If no userId provided, use environment variables
  if (!userId) {
    const appKey = Deno.env.get('TIKTOK_APP_KEY');
    const appSecret = Deno.env.get('TIKTOK_APP_SECRET');
    const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');

    if (!appKey || !appSecret) {
      return null;
    }

    return {
      app_key: appKey,
      app_secret: appSecret,
      access_token: accessToken || null,
      refresh_token: null,
      shop_id: null,
      shop_name: null,
      token_expires_at: null,
    };
  }

  // Create Supabase client with service role to bypass RLS
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Try to get credentials from database
  const { data, error } = await supabase
    .from('tiktok_credentials')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.log('No user credentials found, falling back to env vars');
    
    // Fallback to environment variables
    const appKey = Deno.env.get('TIKTOK_APP_KEY');
    const appSecret = Deno.env.get('TIKTOK_APP_SECRET');
    const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');

    if (!appKey || !appSecret) {
      return null;
    }

    return {
      app_key: appKey,
      app_secret: appSecret,
      access_token: accessToken || null,
      refresh_token: null,
      shop_id: null,
      shop_name: null,
      token_expires_at: null,
    };
  }

  return {
    app_key: data.app_key,
    app_secret: data.app_secret,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    shop_id: data.shop_id,
    shop_name: data.shop_name,
    token_expires_at: data.token_expires_at,
  };
}
