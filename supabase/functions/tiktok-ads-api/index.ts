import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIKTOK_ADS_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

interface TikTokAdsParams {
  advertiser_id?: string;
  service_type?: string;
  data_level?: string;
  report_type?: string;
  dimensions?: string[];
  metrics?: string[];
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
  filtering?: Record<string, unknown>;
}

async function makeAdsApiRequest(
  path: string,
  accessToken: string,
  params: TikTokAdsParams = {},
  method: string = 'GET'
) {
  const url = new URL(`${TIKTOK_ADS_API_BASE}${path}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        url.searchParams.append(key, JSON.stringify(value));
      } else if (typeof value === 'object') {
        url.searchParams.append(key, JSON.stringify(value));
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  });

  console.log(`Making ${method} request to: ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  console.log(`Response:`, JSON.stringify(data));
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action, 
      advertiser_id,
      start_date,
      end_date,
      page = 1,
      page_size = 50,
      filtering,
      dimensions,
      metrics
    } = await req.json();

    const accessToken = Deno.env.get('TIKTOK_ADS_ACCESS_TOKEN');

    if (!accessToken) {
      return new Response(
        JSON.stringify({ 
          code: 40100,
          message: 'TikTok Ads access token not configured',
          error: 'Access token missing' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (action) {
      case 'get_advertisers':
        // Get advertiser accounts
        result = await makeAdsApiRequest(
          '/oauth2/advertiser/get/',
          accessToken,
          {
            page,
            page_size,
          }
        );
        break;

      case 'get_campaigns':
        // Get campaigns
        if (!advertiser_id) {
          return new Response(
            JSON.stringify({ 
              code: 40000,
              message: 'advertiser_id required for campaigns',
              error: 'Missing advertiser_id' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await makeAdsApiRequest(
          '/campaign/get/',
          accessToken,
          {
            advertiser_id,
            page,
            page_size,
            filtering,
          }
        );
        break;

      case 'get_adgroups':
        // Get ad groups
        if (!advertiser_id) {
          return new Response(
            JSON.stringify({ 
              code: 40000,
              message: 'advertiser_id required for adgroups',
              error: 'Missing advertiser_id' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await makeAdsApiRequest(
          '/adgroup/get/',
          accessToken,
          {
            advertiser_id,
            page,
            page_size,
            filtering,
          }
        );
        break;

      case 'get_ads':
        // Get ads
        if (!advertiser_id) {
          return new Response(
            JSON.stringify({ 
              code: 40000,
              message: 'advertiser_id required for ads',
              error: 'Missing advertiser_id' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await makeAdsApiRequest(
          '/ad/get/',
          accessToken,
          {
            advertiser_id,
            page,
            page_size,
            filtering,
          }
        );
        break;

      case 'get_reports':
        // Get performance reports
        if (!advertiser_id) {
          return new Response(
            JSON.stringify({ 
              code: 40000,
              message: 'advertiser_id required for reports',
              error: 'Missing advertiser_id' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Default metrics if not provided
        const defaultMetrics = [
          'spend', 
          'impressions', 
          'clicks', 
          'ctr', 
          'cpc', 
          'cpm',
          'conversion',
          'cost_per_conversion',
        ];

        // Default date range: last 7 days
        const endDate = end_date || new Date().toISOString().split('T')[0];
        const startDateObj = start_date 
          ? new Date(start_date) 
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const startDate = start_date || startDateObj.toISOString().split('T')[0];

        result = await makeAdsApiRequest(
          '/report/integrated/get/',
          accessToken,
          {
            advertiser_id,
            service_type: 'AUCTION',
            report_type: 'BASIC',
            data_level: dimensions?.[0] || 'AUCTION_CAMPAIGN',
            dimensions: dimensions || ['campaign_id', 'stat_time_day'],
            metrics: metrics || defaultMetrics,
            start_date: startDate,
            end_date: endDate,
            page,
            page_size,
          }
        );
        break;

      case 'get_audience_reports':
        // Get audience insights
        if (!advertiser_id) {
          return new Response(
            JSON.stringify({ 
              code: 40000,
              message: 'advertiser_id required for audience reports',
              error: 'Missing advertiser_id' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const audienceEndDate = end_date || new Date().toISOString().split('T')[0];
        const audienceStartDateObj = start_date 
          ? new Date(start_date) 
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const audienceStartDate = start_date || audienceStartDateObj.toISOString().split('T')[0];

        result = await makeAdsApiRequest(
          '/report/audience/get/',
          accessToken,
          {
            advertiser_id,
            data_level: 'AUCTION_CAMPAIGN',
            dimensions: ['age', 'gender'],
            metrics: ['impressions', 'clicks', 'conversion'],
            start_date: audienceStartDate,
            end_date: audienceEndDate,
          }
        );
        break;

      default:
        return new Response(
          JSON.stringify({ 
            code: 40000,
            message: 'Invalid action', 
            valid_actions: [
              'get_advertisers',
              'get_campaigns', 
              'get_adgroups', 
              'get_ads', 
              'get_reports',
              'get_audience_reports'
            ],
            error: 'Invalid action parameter'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Action ${action} result:`, JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in tiktok-ads-api:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        code: 50000,
        message: errorMessage,
        error: 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
