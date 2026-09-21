'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/client';
import {
  UserProfile,
  UserRole,
  Store,
  Product,
  Reservation,
  StockRequest,
  AppNotification,
  LocationCoordinates,
} from './types';
import {
  DEFAULT_LOCATION,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_RESERVATIONS,
  INITIAL_STOCK_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from './mock-data';
import { calculateDistance, generatePickupCode, calculateReservationFeeDetails, parseCoordinatesFromGoogleMapsLink } from './utils';
import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  fetchUserProfile,
  seedFirestoreIfEmpty,
  subscribeToStores,
  subscribeToProducts,
  subscribeToReservations,
  subscribeToStockRequests,
  subscribeToNotifications,
  saveReservationToFirestore,
  updateReservationStatusInFirestore,
  saveProductToFirestore,
  updateProductInFirestore,
  updateStockInFirestore,
  saveStockRequestToFirestore,
  saveNotificationToFirestore,
  updateStoreProfileInFirestore,
  saveMerchantRegistrationToFirestore,
  updateMerchantStatusInFirestore,
} from './firebase/services';

interface AppContextType {
  user: UserProfile | null;
  role: UserRole;
  userLocation: LocationCoordinates;
  searchRadius: number;
  savedStoreIds: string[];
  stores: Store[];
  products: Product[];
  reservations: Reservation[];
  stockRequests: StockRequest[];
  notifications: AppNotification[];
  isLoaded: boolean;

  // Actions
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  signup: (data: {
    name: string;
    email: string;
    mobile: string;
    password?: string;
    role: UserRole;
    shopName?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateLocation: (coords: LocationCoordinates) => void;
  updateSearchRadius: (radius: number) => void;
  toggleSaveStore: (storeId: string) => void;

  // Reservation Actions
  createReservation: (data: {
    productId: string;
    storeId: string;
    quantity: number;
    durationMinutes?: number; // 60 or 120
    documentUrl?: string;
    paymentReference?: string;
  }) => Promise<Reservation>;
  submitPayment: (reservationId: string, paymentReference?: string) => Promise<boolean>;
  cancelReservation: (reservationId: string) => Promise<boolean>;
  updateReservationStatus: (
    reservationId: string,
    status: Reservation['status']
  ) => Promise<boolean>;

  // Merchant Actions
  addProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  updateStock: (productId: string, newStock: number) => Promise<boolean>;
  updateStoreProfile: (storeId: string, updates: Partial<Store>) => Promise<boolean>;
  submitMerchantRegistration: (data: any) => Promise<boolean>;
  updateMerchantStatus: (userId: string, status: any) => Promise<boolean>;

  // Stock Request Actions
  createStockRequest: (data: {
    productName: string;
    quantity: number;
    radiusKm: number;
    notes?: string;
  }) => Promise<StockRequest>;
  submitStockOffer: (data: {
    requestId: string;
    storeId: string;
    price: number;
    availableQuantity: number;
    notes?: string;
  }) => Promise<boolean>;
  acceptStockOffer: (requestId: string, offerId: string) => Promise<Reservation | null>;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nearstock_state_v2';

const isSampleStore = (s: Store) =>
  s.id === 'store-greenway' || s.id === 'store-neighborhood' || s.id === 'store-citycare' || s.name?.includes('City Care') || s.name?.includes('Greenway');

const isSampleProduct = (p: Product) =>
  p.id?.startsWith('prod-greenway') || p.id?.startsWith('prod-neighborhood') || p.id?.startsWith('prod-citycare');

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoordinates>(DEFAULT_LOCATION);
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [savedStoreIds, setSavedStoreIds] = useState<string[]>([]);

  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>(INITIAL_STOCK_REQUESTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial Load & Firebase Seeding
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.user) setUser(parsed.user);
        if (parsed.userLocation) setUserLocation(parsed.userLocation);
        if (parsed.searchRadius) setSearchRadius(parsed.searchRadius);
        if (parsed.savedStoreIds) setSavedStoreIds(parsed.savedStoreIds);
        if (parsed.stores?.length) setStores(parsed.stores.filter((s: Store) => !isSampleStore(s)));
        if (parsed.products?.length) setProducts(parsed.products.filter((p: Product) => !isSampleProduct(p)));
        if (parsed.reservations?.length) setReservations(parsed.reservations);
        if (parsed.stockRequests?.length) setStockRequests(parsed.stockRequests);
        if (parsed.notifications?.length) setNotifications(parsed.notifications);
      }
    } catch (e) {
      console.warn('Failed to load local state', e);
    } finally {
      setIsLoaded(true);
    }

    // Seed Firestore collections if connected and empty
    seedFirestoreIfEmpty();
  }, []);

  // Firebase Auth Observer
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await fetchUserProfile(fbUser.uid);
        if (profile) {
          setUser(profile);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubStores = subscribeToStores((fetchedStores) => {
      if (fetchedStores.length) setStores(fetchedStores);
    });

    const unsubProducts = subscribeToProducts((fetchedProducts) => {
      if (fetchedProducts.length) setProducts(fetchedProducts);
    });

    const unsubStockRequests = subscribeToStockRequests((fetchedRequests) => {
      setStockRequests(fetchedRequests);
    });

    return () => {
      unsubStores();
      unsubProducts();
      unsubStockRequests();
    };
  }, []);

  // User-specific Firestore Subscriptions (Reservations & Notifications)
  useEffect(() => {
    if (!user) return;
    const unsubReservations = subscribeToReservations(
      (fetchedReservations) => {
        setReservations(fetchedReservations);
      },
      user.id,
      user.role
    );

    const unsubNotifications = subscribeToNotifications((fetchedNotifs) => {
      setNotifications(fetchedNotifs);
    }, user.id);

    return () => {
      unsubReservations();
      unsubNotifications();
    };
  }, [user]);

  // Persist state to LocalStorage as cache/fallback
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          user,
          userLocation,
          searchRadius,
          savedStoreIds,
          stores,
          products,
          reservations,
          stockRequests,
          notifications,
        })
      );
    } catch (e) {
      console.warn('Failed to persist local state', e);
    }
  }, [user, userLocation, searchRadius, savedStoreIds, stores, products, reservations, stockRequests, notifications, isLoaded]);

  // Cross-tab real-time synchronization via window storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.reservations) setReservations(parsed.reservations);
          if (parsed.products) setProducts(parsed.products);
          if (parsed.stockRequests) setStockRequests(parsed.stockRequests);
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.stores) setStores(parsed.stores);
        } catch (err) {
          console.warn('Failed to parse cross-tab storage sync', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Dynamic distance calculation based on Google Maps Location Link or stored coordinates
  const storesWithDistance = stores
    .filter((store) => store.status === 'APPROVED' || !store.status || user?.role === 'MERCHANT' || user?.role === 'ADMIN')
    .map((store) => {
      // Calculate distance based on Google Maps Location Link if available
      const parsedCoords = store.googleMapsLink ? parseCoordinatesFromGoogleMapsLink(store.googleMapsLink) : null;
      const targetLat = parsedCoords?.lat || store.lat;
      const targetLng = parsedCoords?.lng || store.lng;

      return {
        ...store,
        lat: targetLat,
        lng: targetLng,
        distanceKm: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          targetLat,
          targetLng
        ),
      };
    });

  const submitMerchantRegistration = async (data: any): Promise<boolean> => {
    const merchantId = user?.id || `merchant-${Date.now()}`;
    let newStore: Store;

    try {
      // Save all merchant signup fields and create store document in Firebase Firestore
      newStore = await saveMerchantRegistrationToFirestore(merchantId, data, userLocation);
    } catch (err) {
      console.warn('Firestore offline/demo fallback for merchant registration:', err);
      const parsedCoords = data.googleMapsLink ? parseCoordinatesFromGoogleMapsLink(data.googleMapsLink) : null;
      const lat = parsedCoords?.lat || userLocation?.lat || DEFAULT_LOCATION.lat;
      const lng = parsedCoords?.lng || userLocation?.lng || DEFAULT_LOCATION.lng;
      const formattedAddress = `${data.buildingNo || ''}, ${data.street || ''}, ${data.locality || ''}, ${data.city || 'Bengaluru'}, ${data.state || ''} ${data.pinCode || ''}`.trim();
      const storeId = `store-${merchantId.substring(0, 8)}`;

      newStore = {
        id: storeId,
        name: data.shopName || 'Pharmacy Store',
        category: data.shopCategory || 'Pharmacy',
        description: data.shopDescription || '',
        image: data.shopLogoUrl || 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=600',
        address: `${data.buildingNo || ''} ${data.street || ''}`.trim(),
        formattedAddress,
        googlePlaceId: `place_${storeId}`,
        buildingNo: data.buildingNo || '',
        street: data.street || '',
        locality: data.locality || '',
        city: data.city || 'Bengaluru',
        district: data.district || '',
        state: data.state || 'Karnataka',
        pinCode: data.pinCode || '',
        landmark: data.landmark || '',
        googleMapsLink: data.googleMapsLink || `https://maps.google.com/?q=${lat},${lng}`,
        phone: data.mobile || '',
        alternateMobile: data.alternateMobile || '',
        ownerId: merchantId,
        workingDays: data.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        openingTime: data.openingTime || '08:00',
        closingTime: data.closingTime || '22:00',
        openingHours: `${data.openingTime || '08:00'} - ${data.closingTime || '22:00'}`,
        weeklyHoliday: data.weeklyHoliday || 'Sunday',
        pickupInstructions: data.pickupInstructions || 'Show 4-digit passcode at counter.',
        gstin: data.gstin || '',
        businessLicenceNo: data.businessLicenceNo || '',
        drugLicenceNo: data.drugLicenceNo || '',
        drugLicenceExpiry: data.drugLicenceExpiry || '',
        drugLicenceDocUrl: data.drugLicenceDocUrl || '',
        pharmacistName: data.pharmacistName || '',
        pharmacistRegNo: data.pharmacistRegNo || '',
        lat,
        lng,
        rating: 5.0,
        isOpen: true,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
    }

    const updatedUser: UserProfile = {
      id: merchantId,
      role: 'MERCHANT',
      name: data.ownerName || 'Merchant Owner',
      email: data.email || 'merchant@nearstock.app',
      mobile: data.mobile || '+91 98765 00000',
      locationLat: newStore.lat,
      locationLng: newStore.lng,
      formattedAddress: newStore.formattedAddress,
      searchRadius: 5,
      createdAt: new Date().toISOString(),
      merchantStatus: 'PENDING',
      merchantRegistration: data,
    };

    setUser(updatedUser);
    setStores((prev) => [...prev.filter((s) => s.ownerId !== merchantId && s.id !== newStore.id), newStore]);
    return true;
  };

  const updateMerchantStatus = async (userId: string, status: any): Promise<boolean> => {
    if (user && user.id === userId) {
      setUser({ ...user, merchantStatus: status });
    }
    setStores((prev) =>
      prev.map((s) => (s.ownerId === userId ? { ...s, status } : s))
    );
    await updateMerchantStatusInFirestore(userId, status).catch(() => {});
    return true;
  };

  const updateStoreProfile = async (storeId: string, updates: Partial<Store>) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, ...updates } : s))
    );
    if (user && user.role === 'MERCHANT') {
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          merchantRegistration: {
            ...(prevUser.merchantRegistration || {} as any),
            shopName: updates.name ?? prevUser.merchantRegistration?.shopName,
            shopDescription: updates.description ?? prevUser.merchantRegistration?.shopDescription,
            shopLogoUrl: updates.image ?? prevUser.merchantRegistration?.shopLogoUrl,
            mobile: updates.phone ?? prevUser.merchantRegistration?.mobile,
            alternateMobile: updates.alternateMobile ?? prevUser.merchantRegistration?.alternateMobile,
            googleMapsLink: updates.googleMapsLink ?? prevUser.merchantRegistration?.googleMapsLink,
            workingDays: updates.workingDays ?? prevUser.merchantRegistration?.workingDays,
            openingTime: updates.openingTime ?? prevUser.merchantRegistration?.openingTime,
            closingTime: updates.closingTime ?? prevUser.merchantRegistration?.closingTime,
            weeklyHoliday: updates.weeklyHoliday ?? prevUser.merchantRegistration?.weeklyHoliday,
            pickupInstructions: updates.pickupInstructions ?? prevUser.merchantRegistration?.pickupInstructions,
            gstin: updates.gstin ?? prevUser.merchantRegistration?.gstin,
            businessLicenceNo: updates.businessLicenceNo ?? prevUser.merchantRegistration?.businessLicenceNo,
            drugLicenceNo: updates.drugLicenceNo ?? prevUser.merchantRegistration?.drugLicenceNo,
            drugLicenceExpiry: updates.drugLicenceExpiry ?? prevUser.merchantRegistration?.drugLicenceExpiry,
            drugLicenceDocUrl: updates.drugLicenceDocUrl ?? prevUser.merchantRegistration?.drugLicenceDocUrl,
            pharmacistName: updates.pharmacistName ?? prevUser.merchantRegistration?.pharmacistName,
            pharmacistRegNo: updates.pharmacistRegNo ?? prevUser.merchantRegistration?.pharmacistRegNo,
          },
        };
      });
    }
    updateStoreProfileInFirestore(storeId, updates).catch(() => { });
    return true;
  };

  const login = async (email: string, password?: string, requestedRole?: UserRole): Promise<boolean> => {
    if (!password) {
      throw new Error('Password is required.');
    }

    // Firebase Auth Login
    const loggedUser = await firebaseSignIn(email, password);

    // Requirement 12 & 13: Strict Customer / Merchant Portal Login Separation
    if (requestedRole === 'MERCHANT' && loggedUser.role !== 'MERCHANT' && loggedUser.role !== 'ADMIN') {
      await firebaseSignOut();
      throw new Error('This account is registered as a customer. Please use Customer Login.');
    }

    if (requestedRole === 'CUSTOMER' && loggedUser.role === 'MERCHANT') {
      await firebaseSignOut();
      throw new Error('This account is registered as a merchant. Please use Merchant Login.');
    }

    setUser(loggedUser);
    return true;
  };

  const signup = async (data: {
    name: string;
    email: string;
    mobile: string;
    password?: string;
    role: UserRole;
    shopName?: string;
  }): Promise<boolean> => {
    if (!data.password) {
      throw new Error('Password is required.');
    }
    const newUser = await firebaseSignUp({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      role: data.role,
      shopName: data.shopName,
      userLocation,
    });
    setUser(newUser);
    return true;
  };

  const logout = () => {
    firebaseSignOut().catch(() => { });
    setUser(null);
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...parsed, user: null }));
      }
    } catch (e) { }
  };

  const updateLocation = (coords: LocationCoordinates) => {
    setUserLocation(coords);
    if (user) {
      setUser({
        ...user,
        locationLat: coords.lat,
        locationLng: coords.lng,
        formattedAddress: coords.formattedAddress,
      });
    }
  };

  const updateSearchRadius = (radius: number) => {
    // Requirement 7 & 24: Max search radius is 100 KM
    const validRadius = Math.min(100, Math.max(1, radius));
    setSearchRadius(validRadius);
    if (user) {
      setUser({ ...user, searchRadius: validRadius });
    }
  };

  const toggleSaveStore = (storeId: string) => {
    setSavedStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const createReservation = async (data: {
    productId: string;
    storeId: string;
    quantity: number;
    durationMinutes?: number;
    documentUrl?: string;
    paymentReference?: string;
  }): Promise<Reservation> => {
    const product = products.find((p) => p.id === data.productId);
    const store = stores.find((s) => s.id === data.storeId);

    // Deduct stock in real-time locally
    const updatedStock = Math.max(0, (product?.stock || 1) - data.quantity);
    if (product) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === data.productId
            ? { ...p, stock: updatedStock }
            : p
        )
      );
      updateStockInFirestore(data.productId, updatedStock).catch(() => { });
    }

    const now = new Date();
    const durationMinutes = data.durationMinutes || 60;
    const pickupExpiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
    const confirmationExpiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

    const unitPrice = product?.price || 0;
    const totalPrice = unitPrice * data.quantity;

    // Requirement 1 & 2: Fee calculation in integer paise
    const feeDetails = calculateReservationFeeDetails(unitPrice, data.quantity, durationMinutes);

    const initialPaymentStatus = data.paymentReference ? 'PAYMENT_SUBMITTED' : 'PENDING';

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      customerId: user?.id || `cust-${Date.now()}`,
      storeId: data.storeId,
      productId: data.productId,
      quantity: data.quantity,
      status: 'CONFIRMED',
      documentUrl: data.documentUrl,
      documentStatus: data.documentUrl ? 'PENDING' : 'NOT_REQUIRED',
      expiresAt: pickupExpiresAt,
      confirmationExpiresAt,
      pickupExpiresAt,
      reservationStartAt: now.toISOString(),
      pickupCode: generatePickupCode(),
      createdAt: now.toISOString(),

      // Integer Paise Fields (Requirements 1, 2, 19, 20)
      productSubtotalPaise: feeDetails.productSubtotalPaise,
      reservationFeePaise: feeDetails.reservationFeePaise,
      reservationDurationMinutes: durationMinutes,
      extraReservationTimeFeePaise: feeDetails.extraReservationTimeFeePaise,
      amountPayableNowPaise: feeDetails.amountPayableNowPaise,
      amountPayableAtStorePaise: feeDetails.amountPayableAtStorePaise,

      // QR Payment Details (Requirement 4)
      paymentMethod: 'QR',
      paymentStatus: initialPaymentStatus,
      paymentReference: data.paymentReference || undefined,
      submittedAt: data.paymentReference ? now.toISOString() : undefined,

      productName: product?.name || 'Item Reservation',
      productBrand: product?.brand || '',
      productImage: product?.image || '',
      unitPrice,
      totalPrice,
      storeName: store?.name || 'Local Pharmacy',
      storeAddress: store?.formattedAddress || store?.address || 'Pharmacy Address',
      product: product,
      store: store,
      customerName: user?.name || 'Customer',
      customerMobile: user?.mobile || '',
    };

    setReservations((prev) => [newReservation, ...prev]);
    saveReservationToFirestore(newReservation).catch(() => { });

    // Create Notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: user?.id || `user-${Date.now()}`,
      title: 'Reservation Held! 📍',
      body: `Reserved ${data.quantity}x ${product?.name || 'item'} at ${store?.name || 'Store'}. Pickup code: ${newReservation.pickupCode}`,
      read: false,
      linkUrl: `/reservations/${newReservation.id}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveNotificationToFirestore(newNotif).catch(() => { });

    return newReservation;
  };

  const submitPayment = async (reservationId: string, paymentReference?: string): Promise<boolean> => {
    const now = new Date().toISOString();
    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId
          ? {
            ...r,
            paymentStatus: 'PAYMENT_SUBMITTED',
            paymentReference: paymentReference || r.paymentReference || 'QR_PAID',
            submittedAt: now,
          }
          : r
      )
    );
    updateReservationStatusInFirestore(reservationId, 'CONFIRMED').catch(() => { });
    return true;
  };

  const cancelReservation = async (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (res && res.productId) {
      const restoredStock = (products.find(p => p.id === res.productId)?.stock || 0) + res.quantity;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === res.productId ? { ...p, stock: restoredStock } : p
        )
      );
      updateStockInFirestore(res.productId, restoredStock).catch(() => { });
    }

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, status: 'CANCELLED' } : r
      )
    );
    updateReservationStatusInFirestore(reservationId, 'CANCELLED').catch(() => { });
    return true;
  };

  const updateReservationStatus = async (
    reservationId: string,
    status: Reservation['status']
  ) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
    );
    updateReservationStatusInFirestore(reservationId, status).catch(() => { });

    const targetRes = reservations.find((r) => r.id === reservationId);
    if (targetRes) {
      const statusTitles: Record<string, string> = {
        READY_FOR_PICKUP: 'Ready for Store Pickup! 🛍️',
        COMPLETED: 'Order Fulfilled & Picked Up! ✅',
        CANCELLED: 'Reservation Cancelled ❌',
        CONFIRMED: 'Reservation Confirmed! 📍',
      };
      const statusBodies: Record<string, string> = {
        READY_FOR_PICKUP: `Your reserved item "${targetRes.productName}" is ready for pickup at ${targetRes.storeName}. Passcode: ${targetRes.pickupCode}`,
        COMPLETED: `Your order for "${targetRes.productName}" at ${targetRes.storeName} has been marked completed/delivered.`,
        CANCELLED: `Your reservation for "${targetRes.productName}" at ${targetRes.storeName} was cancelled by the store.`,
        CONFIRMED: `Your reservation for "${targetRes.productName}" at ${targetRes.storeName} has been confirmed.`,
      };

      if (statusTitles[status]) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: targetRes.customerId,
          title: statusTitles[status],
          body: statusBodies[status],
          read: false,
          linkUrl: `/reservations/${reservationId}`,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
        saveNotificationToFirestore(notif).catch(() => { });
      }
    }

    // If reservation completed, update any linked stock request status to FULFILLED
    if (status === 'COMPLETED') {
      setStockRequests((prev) =>
        prev.map((req) =>
          req.reservationId === reservationId ? { ...req, status: 'FULFILLED' } : req
        )
      );
    }
    return true;
  };

  const addProduct = async (productData: Partial<Product>): Promise<Product> => {
    const merchantStore = stores.find((s) => s.ownerId === user?.id);
    const targetStoreId =
      productData.storeId ||
      merchantStore?.id ||
      (user?.id ? `store-${user.id.substring(0, 8)}` : `store-${Date.now()}`);

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name || 'New Product',
      category: productData.category || 'Pharmacy',
      subcategory: productData.subcategory || '',
      brand: productData.brand || '',
      description: productData.description || '',
      price: Number(productData.price) || 0,
      sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: productData.barcode || '',
      storeId: targetStoreId,
      stock: Number(productData.stock) || 0,
      isActive: true,
      updatedAt: new Date().toISOString(),
      requiresPrescription: Boolean(productData.requiresPrescription),
      image: productData.image || 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=600',
    };

    setProducts((prev) => [newProduct, ...prev]);
    saveProductToFirestore(newProduct).catch(() => { });
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
    updateProductInFirestore(id, updates).catch(() => { });
    return true;
  };

  const updateStock = async (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stock: Math.max(0, newStock), updatedAt: new Date().toISOString() }
          : p
      )
    );
    updateStockInFirestore(productId, newStock).catch(() => { });
    return true;
  };

  const createStockRequest = async (data: {
    productName: string;
    quantity: number;
    radiusKm: number;
    notes?: string;
  }): Promise<StockRequest> => {
    const newReq: StockRequest = {
      id: `req-${Date.now()}`,
      customerId: user?.id || 'customer-demo-1',
      productName: data.productName,
      quantity: data.quantity,
      radiusKm: data.radiusKm,
      status: 'OPEN',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      customerName: user?.name || 'Alvin Thomas',
      customerMobile: user?.mobile || '+91 98765 00000',
      offers: [],
    };

    setStockRequests((prev) => [newReq, ...prev]);
    saveStockRequestToFirestore(newReq).catch(() => { });
    return newReq;
  };

  const submitStockOffer = async (data: {
    requestId: string;
    storeId: string;
    price: number;
    availableQuantity: number;
    notes?: string;
  }): Promise<boolean> => {
    const store = stores.find((s) => s.id === data.storeId);
    const newOffer = {
      id: `offer-${Date.now()}`,
      requestId: data.requestId,
      storeId: data.storeId,
      storeName: store?.name || 'Local Pharmacy',
      storePhone: store?.phone,
      storeAddress: store?.formattedAddress || store?.address,
      price: data.price,
      availableQuantity: data.availableQuantity,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    setStockRequests((prev) =>
      prev.map((req) =>
        req.id === data.requestId
          ? {
            ...req,
            status: 'MATCHED',
            matchedStoreId: data.storeId,
            matchedStoreName: store?.name,
            offers: [...(req.offers || []), newOffer],
          }
          : req
      )
    );
    return true;
  };

  const acceptStockOffer = async (requestId: string, offerId: string): Promise<Reservation | null> => {
    const req = stockRequests.find((r) => r.id === requestId);
    if (!req) return null;
    const offer = req.offers?.find((o) => o.id === offerId);
    if (!offer) return null;

    const store = stores.find((s) => s.id === offer.storeId);
    const now = new Date();
    const pickupExpiresAt = new Date(now.getTime() + 120 * 60 * 1000).toISOString();

    const qty = Math.min(req.quantity, offer.availableQuantity);
    const feeDetails = calculateReservationFeeDetails(offer.price, qty, 60);

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      customerId: user?.id || req.customerId,
      storeId: offer.storeId,
      productId: `req-product-${req.id}`,
      quantity: qty,
      status: 'CONFIRMED',
      documentStatus: 'NOT_REQUIRED',
      expiresAt: pickupExpiresAt,
      confirmationExpiresAt: now.toISOString(),
      pickupExpiresAt,
      reservationStartAt: now.toISOString(),
      pickupCode: generatePickupCode(),
      createdAt: now.toISOString(),

      // Integer Paise Fields (Requirements 1, 2, 19, 20)
      productSubtotalPaise: feeDetails.productSubtotalPaise,
      reservationFeePaise: feeDetails.reservationFeePaise,
      reservationDurationMinutes: 60,
      extraReservationTimeFeePaise: feeDetails.extraReservationTimeFeePaise,
      amountPayableNowPaise: feeDetails.amountPayableNowPaise,
      amountPayableAtStorePaise: feeDetails.amountPayableAtStorePaise,

      paymentMethod: 'QR',
      paymentStatus: 'PENDING',

      productName: req.productName,
      unitPrice: offer.price,
      totalPrice: offer.price * qty,
      storeName: offer.storeName,
      storeAddress: offer.storeAddress || store?.formattedAddress || 'Pharmacy Address',
      store: store,
      customerName: user?.name || req.customerName || 'Customer',
      customerMobile: user?.mobile || req.customerMobile || '',
    };

    setReservations((prev) => [newReservation, ...prev]);
    setStockRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'MATCHED', acceptedOfferId: offerId, reservationId: newReservation.id }
          : r
      )
    );
    return newReservation;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role: user?.role || 'CUSTOMER',
        userLocation,
        searchRadius,
        savedStoreIds,
        stores: storesWithDistance,
        products,
        reservations,
        stockRequests,
        notifications,
        isLoaded,
        login,
        signup,
        logout,
        updateLocation,
        updateSearchRadius,
        toggleSaveStore,
        createReservation,
        submitPayment,
        cancelReservation,
        updateReservationStatus,
        addProduct,
        updateProduct,
        updateStock,
        updateStoreProfile,
        submitMerchantRegistration,
        updateMerchantStatus,
        createStockRequest,
        submitStockOffer,
        acceptStockOffer,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
