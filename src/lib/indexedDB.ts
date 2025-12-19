// IndexedDB utility for TikTok data persistence

const DB_NAME = 'tiktok_data';
const DB_VERSION = 1;

export interface DBOrder {
  order_id: string;
  date: string;
  total: number;
  source: string;
  live_id?: string;
  status: string;
  items?: Array<{ product_name: string; quantity: number }>;
}

export interface DBLive {
  live_id: string;
  date: string;
  orders: number;
  revenue: number;
  products: number;
}

export interface DBAds {
  date: string;
  campaign: string;
  spend: number;
  clicks: number;
  conversions: number;
  roas: number;
}

export interface DBProduct {
  id: string;
  title: string;
  status: string;
  price: number;
  sales?: number;
}

let dbInstance: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'order_id' });
      }
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('live')) {
        db.createObjectStore('live', { keyPath: 'live_id' });
      }
      if (!db.objectStoreNames.contains('ads')) {
        db.createObjectStore('ads', { keyPath: 'date' });
      }
    };
  });
}

export async function saveOrders(orders: DBOrder[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('orders', 'readwrite');
  const store = tx.objectStore('orders');
  
  orders.forEach(order => store.put(order));
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOrders(): Promise<DBOrder[]> {
  const db = await openDB();
  const tx = db.transaction('orders', 'readonly');
  const store = tx.objectStore('orders');
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProducts(products: DBProduct[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('products', 'readwrite');
  const store = tx.objectStore('products');
  
  products.forEach(product => store.put(product));
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getProducts(): Promise<DBProduct[]> {
  const db = await openDB();
  const tx = db.transaction('products', 'readonly');
  const store = tx.objectStore('products');
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLiveData(lives: DBLive[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('live', 'readwrite');
  const store = tx.objectStore('live');
  
  lives.forEach(live => store.put(live));
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLiveData(): Promise<DBLive[]> {
  const db = await openDB();
  const tx = db.transaction('live', 'readonly');
  const store = tx.objectStore('live');
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAdsData(ads: DBAds[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('ads', 'readwrite');
  const store = tx.objectStore('ads');
  
  ads.forEach(ad => store.put(ad));
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAdsData(): Promise<DBAds[]> {
  const db = await openDB();
  const tx = db.transaction('ads', 'readonly');
  const store = tx.objectStore('ads');
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  const stores = ['orders', 'products', 'live', 'ads'];
  
  for (const storeName of stores) {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
  }
}

// localStorage helpers for status
export interface TikTokStatus {
  shop: boolean;
  ads: boolean;
  last_sync: string | null;
}

export function getConnectionStatus(): TikTokStatus {
  const stored = localStorage.getItem('tiktok_status');
  if (stored) {
    return JSON.parse(stored);
  }
  return { shop: false, ads: false, last_sync: null };
}

export function setConnectionStatus(status: Partial<TikTokStatus>): void {
  const current = getConnectionStatus();
  const updated = { ...current, ...status };
  localStorage.setItem('tiktok_status', JSON.stringify(updated));
}
