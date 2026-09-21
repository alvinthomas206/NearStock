# NearStock — Local Inventory Discovery & Reservation App

> **Tagline**: *"Find it nearby. Reserve it. Get it."*

NearStock is a production-ready web application enabling customers to find real-time local product stock (pharmacies, medical supplies, groceries, electronics), compare prices and distances, reserve items for 30-minute instant hold with pickup passcodes, and broadcast Smart Stock Requests to nearby merchants when items are unavailable.

---

## 🌟 Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Radix-inspired / shadcn/ui components (Navy `#0B2A4A`, Teal `#1F9D8C`, Light BG `#F5F9FC`, 16px rounded corners, Inter font)
- **Database & Auth**: Firebase Auth (Email/Password, Mobile), Cloud Firestore, Cloud Storage, Firebase Admin SDK
- **Maps Integration**: `@vis.gl/react-google-maps`, Google Maps JavaScript API, Places API, Geocoding API, Distance Matrix API
- **State & Fallbacks**: React Context Provider + Dual-mode local state engine (runs fully offline or connected to Firebase/Google Maps Cloud)
- **Validation & Dates**: Zod + React Hook Form + `date-fns`
- **Deploy Target**: Vercel

---

## 🔑 Environment Variables Setup

Create a `.env.local` file in the project root (and add these to Vercel Project Settings):

```env
# Firebase Client SDK Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nearstock-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nearstock-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nearstock-demo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef...

# Firebase Server / Admin Credentials
FIREBASE_PROJECT_ID=nearstock-demo
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-demo@nearstock-demo.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk..."

# Google Maps API Keys
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
GOOGLE_MAPS_SERVER_API_KEY=AIzaSy...
```

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Seed Database**:
   ```bash
   npm run seed
   ```
   Or visit `http://localhost:3000/api/seed` in your browser.

---

## 📱 Features & Roles

### 1. Customer Flow (`/dashboard`, `/search`, `/product/[id]`, `/reservations`)
- **Location Onboarding**: Auto-locate via browser GPS or search location via Google Places Autocomplete (`/onboarding`).
- **Product Search**: Search "digital thermometer" -> observe nearby stores sorted by distance, price, or stock levels.
- **Map & List Toggle**: Interactive map view featuring user location marker, radius circle, and pharmacy markers.
- **30-Minute Hold Reservation**: Select item quantity, attach prescription documents to Firebase Storage if Rx required, and receive a generated 6-character pickup passcode (e.g. `NS-8924`).
- **Smart Stock Request**: Broadcast requests for out-of-stock items to merchants within a customizable radius (`/stock-requests`).

### 2. Merchant Portal (`/merchant/overview`, `/merchant/products`, `/merchant/bookings`)
- **Overview Dashboard**: Metrics on total items, stock levels, low-stock warnings (&le; 3 units), and pending hold bookings.
- **Store Manager**: Update address via Google Places Autocomplete, save `googlePlaceId`, `formattedAddress`, `lat`, `lng`.
- **Inventory Matrix**: Update item quantities in real-time.
- **Pickup Workflow**: Confirm incoming customer reservations and mark them as ready for pickup.

---

## 🔒 Firebase Security Rules

### Firestore Security Rules (`firestore.rules`)
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /stores/{storeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /reservations/{reservationId} {
      allow read, write: if request.auth != null;
    }
    match /stockRequests/{requestId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ⚡ Vercel Deployment Instructions

1. **Push Code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial NearStock production release"
   git remote add origin https://github.com/your-username/nearstock.git
   git push -u origin main
   ```

2. **Import Repository to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your `nearstock` GitHub repository.

3. **Configure Environment Variables**:
   - Navigate to **Project Settings → Environment Variables**.
   - Copy all key-value pairs from `.env.local` / `.env.example`.

4. **Deploy**:
   - Click **Deploy**. Vercel will build Next.js automatically using `next build`.

5. **Post-Deployment Configuration**:
   - In **Firebase Console → Authentication → Settings → Authorized domains**, add your Vercel domain (e.g. `nearstock.vercel.app`).
   - In **Google Cloud Console → Credentials**, restrict your `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` HTTP referrers to include `https://nearstock.vercel.app/*`.

---

## 🧪 Demo Credentials

- **Customer Demo**: `demo@nearstock.app` / `password123`
- **Merchant Demo**: `merchant@nearstock.app` / `password123`
