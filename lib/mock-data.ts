import { Store, Product, Reservation, StockRequest, AppNotification, UserProfile } from './types';

// Default User Location (City Center - MG Road, Bengaluru / Standard Metro Center)
export const DEFAULT_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
  formattedAddress: 'MG Road Metro Station, Central City, Bengaluru 560001',
};

export const INITIAL_STORES: Store[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_RESERVATIONS: Reservation[] = [];
export const INITIAL_STOCK_REQUESTS: StockRequest[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];


