export type UserRole = 'CUSTOMER' | 'MERCHANT' | 'ADMIN';

export type MerchantStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';

export type PaymentStatus = 'PENDING' | 'PAYMENT_SUBMITTED' | 'VERIFIED' | 'REJECTED';

export interface MerchantRegistrationData {
  ownerName: string;
  mobile: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  alternateMobile?: string;
  shopName: string;
  shopCategory: 'Pharmacy' | 'Retail' | 'Medical Supplies' | 'General Store' | string;
  shopDescription: string;
  shopLogoUrl?: string;
  buildingNo: string;
  street: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  landmark?: string;
  googleMapsLink?: string;
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  weeklyHoliday?: string;
  pickupInstructions?: string;
  gstin?: string;
  businessLicenceNo?: string;
  // Pharmacy-specific fields
  drugLicenceNo?: string;
  drugLicenceExpiry?: string;
  drugLicenceDocUrl?: string;
  pharmacistName?: string;
  pharmacistRegNo?: string;
  // Consents
  termsAccepted: boolean;
  privacyAccepted: boolean;
  createdAt: string;
}

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type DocumentStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export type StockRequestStatus =
  | 'OPEN'
  | 'MATCHED'
  | 'FULFILLED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  mobile: string;
  locationLat: number;
  locationLng: number;
  formattedAddress: string;
  searchRadius: number; // in km, default 5, max 100
  createdAt: string;
  merchantStatus?: MerchantStatus;
  merchantRegistration?: MerchantRegistrationData;
}

export interface Store {
  id: string;
  name: string;
  category?: string;
  address: string;
  formattedAddress: string;
  googlePlaceId: string;
  lat: number;
  lng: number;
  phone: string;
  ownerId: string;
  distanceKm?: number;
  rating?: number;
  isOpen?: boolean;
  openingHours?: string;
  image?: string;
  status?: MerchantStatus; // Approval status for customer visibility
  
  // Editable Store Profile Fields (Requirements 10 & 17)
  description?: string;
  alternateMobile?: string;
  googleMapsLink?: string;
  buildingNo?: string;
  street?: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  landmark?: string;
  workingDays?: string[];
  openingTime?: string;
  closingTime?: string;
  weeklyHoliday?: string;
  pickupInstructions?: string;
  gstin?: string;
  businessLicenceNo?: string;
  // Pharmacy-specific fields
  drugLicenceNo?: string;
  drugLicenceExpiry?: string;
  drugLicenceDocUrl?: string;
  pharmacistName?: string;
  pharmacistRegNo?: string;
  createdAt?: string;
}

export interface MerchantOffer {
  id: string;
  requestId: string;
  storeId: string;
  storeName: string;
  storePhone?: string;
  storeAddress?: string;
  price: number;
  availableQuantity: number;
  notes?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  description: string;
  price: number;
  sku?: string;
  barcode?: string;
  storeId: string;
  stock: number;
  isActive: boolean;
  updatedAt: string;
  requiresPrescription?: boolean;
  image?: string;
  store?: Store; // Populated in search results
  distanceKm?: number;
}

export interface Reservation {
  id: string;
  customerId: string;
  storeId: string;
  productId: string;
  quantity: number;
  status: ReservationStatus;
  documentUrl?: string;
  documentStatus: DocumentStatus;
  expiresAt: string; // ISO string
  confirmationExpiresAt?: string;
  pickupExpiresAt: string; // ISO timestamp
  reservationStartAt?: string; // ISO timestamp
  pickupCode: string; // e.g. "NS-8924"
  createdAt: string;
  
  // Mandatory Integer Paise Fee Calculation Fields (Requirements 1, 2, 19, 20)
  productSubtotalPaise: number;
  reservationFeePaise: number; // 1% of productSubtotalPaise rounded to nearest paise
  reservationDurationMinutes: number; // 60 or 120
  extraReservationTimeFeePaise: number; // 0 for 60 mins, 1000 for 120 mins
  amountPayableNowPaise: number; // reservationFeePaise + extraReservationTimeFeePaise
  amountPayableAtStorePaise: number; // productSubtotalPaise

  // Mandatory Payment Fields (Requirement 4 & 19)
  paymentMethod: 'QR';
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  submittedAt?: string;
  verifiedAt?: string;

  // Snapshot fields
  productName: string;
  productBrand?: string;
  productImage?: string;
  unitPrice: number;
  totalPrice: number;
  storeName: string;
  storeAddress: string;
  // Joined fields for UI convenience
  product?: Product;
  store?: Store;
  customerName?: string;
  customerMobile?: string;
}

export interface StockRequest {
  id: string;
  customerId: string;
  productName: string;
  quantity: number;
  radiusKm: number;
  status: StockRequestStatus;
  notes?: string;
  createdAt: string;
  customerName?: string;
  customerMobile?: string;
  matchedStoreId?: string;
  matchedStoreName?: string;
  offers?: MerchantOffer[];
  acceptedOfferId?: string;
  reservationId?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface SavedStore {
  id: string;
  userId: string;
  storeId: string;
  store?: Store;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface SearchFilters {
  query: string;
  category: string;
  inStockOnly: boolean;
  maxDistanceKm: number; // capped at 100
  sortBy: 'distance' | 'price' | 'availability';
}

