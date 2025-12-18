import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  });
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // First get shops
      const shopsResponse = await supabase.functions.invoke('tiktok-shop-api', {
        body: { action: 'get_shops' }
      });

      console.log('Shops response:', shopsResponse);

      if (shopsResponse.error) {
        throw new Error(shopsResponse.error.message || 'Failed to fetch shops');
      }

      const shopsData = shopsResponse.data;
      
      if (shopsData.code !== 0) {
        throw new Error(shopsData.message || 'TikTok API error');
      }

      const shops = shopsData.data?.shops || [];
      
      if (shops.length === 0) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          shops: [],
          error: 'Nenhuma loja encontrada. Verifique se a conta foi autorizada corretamente.'
        }));
        return;
      }

      const shopCipher = shops[0]?.cipher;

      // Fetch orders and products in parallel
      const [ordersResponse, productsResponse] = await Promise.all([
        supabase.functions.invoke('tiktok-shop-api', {
          body: { action: 'get_orders', shop_cipher: shopCipher }
        }),
        supabase.functions.invoke('tiktok-shop-api', {
          body: { action: 'get_products', shop_cipher: shopCipher }
        })
      ]);

      console.log('Orders response:', ordersResponse);
      console.log('Products response:', productsResponse);

      const orders = ordersResponse.data?.data?.orders || [];
      const products = productsResponse.data?.data?.products || [];

      // Calculate totals
      const totalRevenue = orders.reduce((sum: number, order: TikTokOrder) => {
        const amount = parseFloat(order.payment_info?.total_amount || '0');
        return sum + amount;
      }, 0);

      setData({
        shops,
        orders,
        products,
        isLoading: false,
        error: null,
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
      });

      toast({
        title: "Dados atualizados",
        description: `${orders.length} pedidos e ${products.length} produtos carregados.`,
      });

    } catch (error) {
      console.error('Error fetching TikTok data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados';
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast({
        title: "Erro ao carregar dados",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refetch: fetchData };
}
