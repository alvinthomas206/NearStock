import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates distance between two geographic coordinates in kilometers (Haversine Formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(1));
}

/**
 * Parses geographic coordinates (lat, lng) from a Google Maps link or location string.
 */
export function parseCoordinatesFromGoogleMapsLink(link: string): { lat: number; lng: number } | null {
  if (!link || typeof link !== 'string') return null;
  const decoded = decodeURIComponent(link.trim());

  // 1. Check for @lat,lng format e.g. @12.971598,77.594562
  const atMatch = decoded.match(/@(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 2. Check for query parameter q=lat,lng or ll=lat,lng or query=lat,lng or daddr=lat,lng
  const queryMatch = decoded.match(/[?&](?:q|ll|query|daddr|destination)=(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 3. Check for place/lat,lng or search/lat,lng or dir//lat,lng
  const pathMatch = decoded.match(/(?:place|search|dir|maps)\/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (pathMatch) {
    const lat = parseFloat(pathMatch[1]);
    const lng = parseFloat(pathMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 4. Check for embedded coordinates anywhere e.g. "12.9716, 77.5946" or "12.9716,77.5946"
  const rawMatch = decoded.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  return null;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDistanceKm(km?: number): string {
  if (km === undefined || km === null) return 'Nearby';
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

export function generatePickupCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `NS-${num}`;
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'PPP p');
  } catch {
    return dateString;
  }
}

export function formatPaiseToRupees(paise: number): string {
  const rupees = (paise || 0) / 100;
  if (rupees % 1 === 0) {
    return `₹${rupees.toLocaleString('en-IN')}`;
  }
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Authoritative Server-side Reservation Fee Calculation
 * Requirement 1: 1% of product total
 * Requirement 2: 60 mins -> ₹0; 120 mins -> ₹10 (1000 paise)
 * Stored as integer paise
 */
export function calculateReservationFeeDetails(
  unitPriceRupees: number,
  quantity: number,
  durationMinutes: number = 60
) {
  const qty = Math.max(1, quantity);
  const productSubtotalPaise = Math.round(unitPriceRupees * qty * 100);
  const reservationFeePaise = Math.round(productSubtotalPaise * 0.01);
  const extraReservationTimeFeePaise = durationMinutes > 60 ? 1000 : 0;
  const amountPayableNowPaise = reservationFeePaise + extraReservationTimeFeePaise;
  const amountPayableAtStorePaise = productSubtotalPaise;

  return {
    productSubtotalPaise,
    reservationFeePaise,
    reservationDurationMinutes: durationMinutes,
    extraReservationTimeFeePaise,
    amountPayableNowPaise,
    amountPayableAtStorePaise,
  };
}

export function getRemainingTimeDisplay(isoExpiryString: string): {
  remainingText: string;
  isExpired: boolean;
  minutesLeft: number;
} {
  try {
    const expiry = new Date(isoExpiryString).getTime();
    const now = Date.now();
    const diffMs = expiry - now;

    if (diffMs <= 0) {
      return { remainingText: 'Expired', isExpired: true, minutesLeft: 0 };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let text = '';
    if (hours > 0) {
      text = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      text = `${minutes}m ${seconds}s`;
    }

    return {
      remainingText: text,
      isExpired: false,
      minutesLeft: Math.ceil(diffMs / 60000),
    };
  } catch {
    return { remainingText: 'Expired', isExpired: true, minutesLeft: 0 };
  }
}

export function isExpired(isoExpiryString: string): boolean {
  try {
    const expiry = new Date(isoExpiryString);
    return !isAfter(expiry, new Date());
  } catch {
    return false;
  }
}

