import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  saveOrders,
  saveProducts,
  getOrders,
  getProducts,
  getConnectionStatus,
  setConnectionStatus,
  DBOrder,
  DBProduct,
} from "@/lib/indexedDB";

export interface TikTokShop {
  shop_id: string;
  shop_name: string;
  shop_cipher: string;
  region: string;
}

export interface TikTokOrder {
  order_id: string;
  order_status: string;
  payment_info: {
    total_amount: string;
    currency: string;
  };
  create_time: number;
  buyer_message?: string;
  line_items?: Array<{
    product_name: string;
    sku_name: string;
    quantity: number;
  }>;
}

export interface TikTokProduct {
  id: string;
  title: string;
  status: string;
  sales?: number;
  skus?: Array<{
    price: {
      sale_price: string;
    };
  }>;
}

export interface TikTokData {
  shops: TikTokShop[];
  orders: TikTokOrder[];
  products: TikTokProduct[];
  isLoading: boolean;
  error: string | null;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  isConnected: boolean;
  lastSync: string | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const REQUEST_TIMEOUT = 30000;

async function fetchWithRetry(
  functionName: string,
  body: any,
  retries = MAX_RETRIES
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await supabase.functions.invoke(functionName, {
        body,
        signal: controller.signal as any,
      });

      clearTimeout(timeout);

      if (response.error) {
        throw new Error(response.error.message || 'Request failed');
      }

      return response;
    } catch (error: any) {
      console.error(`Attempt ${i + 1}/${retries} failed:`, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - verifique sua conexão');
      }

      if (i === retries - 1) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }

  throw new Error('Max retries exceeded');
}

export function useTikTokShop() {
  const [data, setData] = useState<TikTokData>({
    shops: [],
    orders: [],
    products: [],
    isLoading: true,
    error: null,
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    isConnected: false,
    lastSync: null,
  });
  const { toast } = useToast();

  const loadCachedData = useCallback(async () => {
    try {
      const status = getConnectionStatus();
      const [cachedOrders, cachedProducts] = await Promise.all([
        getOrders(),
        getProducts(),
      ]);

      if (cachedOrders.length > 0 || cachedProducts.length > 0) {
        const totalRevenue = cachedOrders.reduce((sum, order) => sum + order.total, 0);
        
        setData(prev => ({
          ...prev,
          orders: cachedOrders.map(o => ({
            order_id: o.order_id,
            order_status: o.status,
            payment_info: { total_amount: String(o.total), currency: 'BRL' },
            create_time: new Date(o.date).getTime() / 1000,
            line_items: o.items?.map(item => ({
              product_name: item.product_name,
              sku_name: '',
              quantity: item.quantity,
            })),
          })),
          products: cachedProducts.map(p => ({
            id: p.id,
            title: p.title,
            status: p.status,
            sales: p.sales,
            skus: [{ price: { sale_price: String(p.price) } }],
          })),
          totalRevenue,
          totalOrders: cachedOrders.length,
          totalProducts: cachedProducts.length,
          isConnected: status.shop,
          lastSync: status.last_sync,
        }));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Fetch shops with retry logic
      const shopsResponse = await fetchWithRetry('tiktok-shop-api', {
        action: 'get_shops',
        user_id: userId
      });

      console.log('Shops response:', shopsResponse);

      const shopsData = shopsResponse.data;
      
      if (shopsData.code !== 0) {
        setConnectionStatus({ shop: false });
        
        if (shopsData.code === 105001 || shopsData.message?.includes('access token is invalid')) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            isConnected: false,
            error: 'Token expirado. Clique em "Conectar TikTok Shop" para reconectar.',
          }));
          return;
        }
        
        // Handle region not available error
        if (shopsData.message?.includes('not available') || shopsData.message?.includes('region')) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            isConnected: false,
            error: 'TikTok Shop não disponível na sua região. Verifique se sua loja tem acesso ao TikTok Shop ou se a aplicação está configurada para a região correta.',
          }));
          return;
        }
        
        throw new Error(shopsData.message || 'TikTok API error');
      }

      const shops = shopsData.data?.shops || [];
      
      if (shops.length === 0) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          shops: [],
          isConnected: false,
          error: 'Nenhuma loja encontrada. Verifique se a conta foi autorizada corretamente.'
        }));
        return;
      }

      const shopCipher = shops[0]?.cipher;

      // Fetch orders and products in parallel with retry logic
      const [ordersResponse, productsResponse] = await Promise.all([
        fetchWithRetry('tiktok-shop-api', {
          action: 'get_orders',
          shop_cipher: shopCipher,
          user_id: userId
        }),
        fetchWithRetry('tiktok-shop-api', {
          action: 'get_products',
          shop_cipher: shopCipher,
          user_id: userId
        })
      ]);

      console.log('Orders response:', ordersResponse);
      console.log('Products response:', productsResponse);

      const orders = ordersResponse.data?.data?.orders || [];
      const products = productsResponse.data?.data?.products || [];

      const totalRevenue = orders.reduce((sum: number, order: TikTokOrder) => {
        const amount = parseFloat(order.payment_info?.total_amount || '0');
        return sum + amount;
      }, 0);

      // Save to IndexedDB
      const dbOrders: DBOrder[] = orders.map((order: TikTokOrder) => ({
        order_id: order.order_id,
        date: new Date(order.create_time * 1000).toISOString(),
        total: parseFloat(order.payment_info?.total_amount || '0'),
        source: 'SHOP',
        status: order.order_status,
        items: order.line_items?.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
        })),
      }));

      const dbProducts: DBProduct[] = products.map((product: TikTokProduct) => ({
        id: product.id,
        title: product.title,
        status: product.status,
        price: parseFloat(product.skus?.[0]?.price?.sale_price || '0'),
        sales: product.sales,
      }));

      await Promise.all([
        saveOrders(dbOrders),
        saveProducts(dbProducts),
      ]);

      const now = new Date().toISOString();
      setConnectionStatus({ shop: true, last_sync: now });

      setData({
        shops,
        orders,
        products,
        isLoading: false,
        error: null,
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        isConnected: true,
        lastSync: now,
      });

      toast({
        title: "Dados atualizados",
        description: `${orders.length} pedidos e ${products.length} produtos sincronizados.`,
      });

    } catch (error) {
      console.error('Error fetching TikTok data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados';
      
      const status = getConnectionStatus();
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isConnected: status.shop,
        lastSync: status.last_sync,
      }));
      
      toast({
        title: "Erro ao carregar dados",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadCachedData().then(() => fetchData());
  }, [loadCachedData, fetchData]);

  return { ...data, refetch: fetchData };
}
