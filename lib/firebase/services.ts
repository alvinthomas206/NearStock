import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { auth, db } from './client';
import {
  UserProfile,
  UserRole,
  Store,
  Product,
  Reservation,
  StockRequest,
  AppNotification,
  LocationCoordinates,
} from '../types';
import { INITIAL_STORES, INITIAL_PRODUCTS, DEFAULT_LOCATION } from '../mock-data';
import { parseCoordinatesFromGoogleMapsLink } from '../utils';

// Map Firestore User Doc to UserProfile
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    console.warn('Error fetching Firestore user profile:', error);
  }
  return null;
}

// Sign Up with Firebase Auth & Create Firestore User Document
export async function firebaseSignUp(params: {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  shopName?: string;
  userLocation?: LocationCoordinates;
}): Promise<UserProfile> {
  if (!auth || !db) {
    // Graceful fallback for demo/test mode when Firebase environment variables are not configured in Vercel
    const loc = params.userLocation || DEFAULT_LOCATION;
    return {
      id: `demo-user-${Date.now()}`,
      name: params.name || 'NearStock User',
      email: params.email,
      mobile: params.mobile || '+91 98765 43210',
      role: params.role,
      locationLat: loc.lat,
      locationLng: loc.lng,
      formattedAddress: loc.formattedAddress,
      searchRadius: 5,
      createdAt: new Date().toISOString(),
    };
  }

  const userCredential = await createUserWithEmailAndPassword(auth, params.email, params.password);
  const fbUser = userCredential.user;

  // Update display name
  if (params.name) {
    await updateProfile(fbUser, { displayName: params.name });
  }

  const loc = params.userLocation || DEFAULT_LOCATION;

  const newUserProfile: UserProfile = {
    id: fbUser.uid,
    name: params.name || fbUser.displayName || 'NearStock User',
    email: params.email,
    mobile: params.mobile || '',
    role: params.role,
    locationLat: loc.lat,
    locationLng: loc.lng,
    formattedAddress: loc.formattedAddress,
    searchRadius: 5,
    createdAt: new Date().toISOString(),
  };

  // Persist to Firestore users collection
  await setDoc(doc(db, 'users', fbUser.uid), newUserProfile);

  // If user is a merchant, ensure store profile exists with original shop name
  if (params.role === 'MERCHANT') {
    const defaultStoreId = `store-${fbUser.uid.substring(0, 8)}`;
    const newStore: Store = {
      id: defaultStoreId,
      name: params.shopName || 'Pharmacy Store',
      address: loc.formattedAddress,
      formattedAddress: loc.formattedAddress,
      googlePlaceId: 'place_default',
      lat: loc.lat,
      lng: loc.lng,
      phone: params.mobile || '+91 98765 00000',
      ownerId: fbUser.uid,
      openingHours: '8:00 AM - 10:00 PM',
      rating: 4.8,
      isOpen: true,
    };
    await setDoc(doc(db, 'stores', defaultStoreId), newStore, { merge: true });
  }

  return newUserProfile;
}

// Sign In with Firebase Auth & Fetch Firestore Profile
export async function firebaseSignIn(email: string, password: string): Promise<UserProfile> {
  if (!auth || !db) {
    const isMerchant = email.toLowerCase().includes('merchant');
    const isAdmin = email.toLowerCase().includes('admin');
    const isDemoAccount = email.toLowerCase().includes('nearstock.app') || email.toLowerCase().includes('demo');

    if (isDemoAccount || password === 'demo123' || password === '123456') {
      const role: UserRole = isAdmin ? 'ADMIN' : isMerchant ? 'MERCHANT' : 'CUSTOMER';
      return {
        id: isMerchant ? 'merchant-citycare' : isAdmin ? 'admin-123' : 'customer-demo-123',
        name: isMerchant ? 'CityCare Pharmacy' : isAdmin ? 'System Admin' : 'Demo User',
        email: email,
        mobile: '+91 98765 43210',
        role: role,
        locationLat: DEFAULT_LOCATION.lat,
        locationLng: DEFAULT_LOCATION.lng,
        formattedAddress: DEFAULT_LOCATION.formattedAddress,
        searchRadius: 5,
        createdAt: new Date().toISOString(),
      };
    }

    throw new Error(
      'Firebase Client SDK is not initialized. Please set NEXT_PUBLIC_FIREBASE_* environment variables in Vercel Project Settings > Environment Variables and redeploy, or check your .env.local file.'
    );
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;

  let profile = await fetchUserProfile(fbUser.uid);

  if (!profile) {
    // Auto-create missing profile
    const isMerchant = email.includes('merchant');
    profile = {
      id: fbUser.uid,
      name: fbUser.displayName || (isMerchant ? 'Merchant Store' : 'NearStock User'),
      email: fbUser.email || email,
      mobile: '+91 98765 43210',
      role: isMerchant ? 'MERCHANT' : 'CUSTOMER',
      locationLat: DEFAULT_LOCATION.lat,
      locationLng: DEFAULT_LOCATION.lng,
      formattedAddress: DEFAULT_LOCATION.formattedAddress,
      searchRadius: 5,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', fbUser.uid), profile);
  }

  return profile;
}

// Sign Out
export async function firebaseSignOut(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

// Seed Initial Data to Firestore if collections are empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (!db) return;
  try {
    const storesSnap = await getDocs(collection(db, 'stores'));
    if (storesSnap.empty) {
      console.log('Seeding initial stores to Firestore...');
      for (const store of INITIAL_STORES) {
        await setDoc(doc(db, 'stores', store.id), store);
      }
    }

    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      console.log('Seeding initial products to Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }
  } catch (error) {
    console.warn('Error during automatic Firestore seeding:', error);
  }
}

// Real-Time Subscriptions
export function subscribeToStores(onUpdate: (stores: Store[]) => void) {
  if (!db) return () => { };
  return onSnapshot(
    collection(db, 'stores'),
    (snap) => {
      const stores = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Store));
      onUpdate(stores);
    },
    (err) => console.warn('Stores Firestore snapshot error:', err)
  );
}

export function subscribeToProducts(onUpdate: (products: Product[]) => void) {
  if (!db) return () => { };
  return onSnapshot(
    collection(db, 'products'),
    (snap) => {
      const products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      onUpdate(products);
    },
    (err) => console.warn('Products Firestore snapshot error:', err)
  );
}

export function subscribeToReservations(
  onUpdate: (reservations: Reservation[]) => void,
  userId?: string,
  role?: UserRole
) {
  if (!db) return () => { };
  const reservationsCol = collection(db, 'reservations');
  let q = query(reservationsCol, orderBy('createdAt', 'desc'));

  if (userId && role === 'CUSTOMER') {
    q = query(reservationsCol, where('customerId', '==', userId), orderBy('createdAt', 'desc'));
  }

  return onSnapshot(
    q,
    (snap) => {
      const reservations = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Reservation));
      onUpdate(reservations);
    },
    (err) => console.warn('Reservations Firestore snapshot error:', err)
  );
}

export function subscribeToStockRequests(onUpdate: (requests: StockRequest[]) => void) {
  if (!db) return () => { };
  const requestsCol = collection(db, 'stockRequests');
  const q = query(requestsCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const requests = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StockRequest));
      onUpdate(requests);
    },
    (err) => console.warn('Stock Requests Firestore snapshot error:', err)
  );
}

export function subscribeToNotifications(
  onUpdate: (notifs: AppNotification[]) => void,
  userId: string
) {
  if (!db || !userId) return () => { };
  const notifsCol = collection(db, 'notifications');
  const q = query(notifsCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const notifs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AppNotification));
      onUpdate(notifs);
    },
    (err) => console.warn('Notifications Firestore snapshot error:', err)
  );
}

// Firestore Database Mutations
export async function saveReservationToFirestore(reservation: Reservation): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'reservations', reservation.id), reservation);
}

export async function updateReservationStatusInFirestore(
  reservationId: string,
  status: Reservation['status']
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'reservations', reservationId), { status });
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'products', product.id), product);
}

export async function updateProductInFirestore(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'products', productId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateStockInFirestore(
  productId: string,
  newStock: number
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'products', productId), {
    stock: Math.max(0, newStock),
    updatedAt: new Date().toISOString(),
  });
}

export async function saveStockRequestToFirestore(request: StockRequest): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'stockRequests', request.id), request);
}

export async function saveNotificationToFirestore(notification: AppNotification): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'notifications', notification.id), notification);
}

export async function updateStoreProfileInFirestore(
  storeId: string,
  updates: Partial<Store>
): Promise<void> {
  if (!db) return;
  // Requirement 10: Do not let the merchant change sensitive system fields
  const safeUpdates = { ...updates };
  delete (safeUpdates as any).ownerId;
  delete (safeUpdates as any).approvedBy;
  delete (safeUpdates as any).role;
  delete (safeUpdates as any).status;

  // If googleMapsLink is updated, re-parse coordinates if valid
  if (safeUpdates.googleMapsLink) {
    const coords = parseCoordinatesFromGoogleMapsLink(safeUpdates.googleMapsLink);
    if (coords) {
      safeUpdates.lat = coords.lat;
      safeUpdates.lng = coords.lng;
    }
  }

  await updateDoc(doc(db, 'stores', storeId), safeUpdates);
}

export async function saveMerchantRegistrationToFirestore(
  userId: string,
  data: any,
  defaultLocation?: LocationCoordinates
): Promise<Store> {
  if (!db) {
    throw new Error('Firestore DB not initialized.');
  }

  // Parse location coordinates from Google Maps Link if available
  const parsedCoords = data.googleMapsLink ? parseCoordinatesFromGoogleMapsLink(data.googleMapsLink) : null;
  const lat = parsedCoords?.lat || defaultLocation?.lat || DEFAULT_LOCATION.lat;
  const lng = parsedCoords?.lng || defaultLocation?.lng || DEFAULT_LOCATION.lng;

  const formattedAddress = `${data.buildingNo || ''}, ${data.street || ''}, ${data.locality || ''}, ${data.city || 'Bengaluru'}, ${data.state || ''} ${data.pinCode || ''}`.trim();
  const storeId = `store-${userId.substring(0, 8)}`;

  const storeData: Store = {
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
    ownerId: userId,
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

  // 1. Save Store details to Firestore
  await setDoc(doc(db, 'stores', storeId), storeData, { merge: true });

  // 2. Save User profile with merchant details to Firestore
  const userUpdates = {
    id: userId,
    name: data.ownerName || 'Pharmacy Owner',
    email: data.email || '',
    mobile: data.mobile || '',
    role: 'MERCHANT' as UserRole,
    merchantStatus: 'PENDING',
    merchantRegistration: data,
    locationLat: lat,
    locationLng: lng,
    formattedAddress,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', userId), userUpdates, { merge: true });

  return storeData;
}

export async function updateMerchantStatusInFirestore(
  userId: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
): Promise<void> {
  if (!db) return;

  // 1. Update User Document
  await updateDoc(doc(db, 'users', userId), {
    merchantStatus: status,
    updatedAt: new Date().toISOString(),
  });

  // 2. Update Store Document(s) owned by this merchant
  const storesCol = collection(db, 'stores');
  const q = query(storesCol, where('ownerId', '==', userId));
  const snap = await getDocs(q);
  for (const docSnap of snap.docs) {
    await updateDoc(doc(db, 'stores', docSnap.id), { status });
  }
}

