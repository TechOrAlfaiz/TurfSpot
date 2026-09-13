# 🏟️ TurfSpot

> **Next-Generation Sports Turf Booking & Arena Discovery Platform for Jaipur**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%202dsphere-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![MapLibre](https://img.shields.io/badge/Maps-MapLibre%20GL-396B9C?style=for-the-badge&logo=maplibre&logoColor=white)](https://maplibre.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20%2B%20Mock-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

---

## 📌 Overview

**TurfSpot** is a full-stack, location-aware sports turf booking and arena discovery application tailored specifically for sports enthusiasts in **Jaipur**. Designed with a high-performance sports-tech dark aesthetic, TurfSpot enables players to discover nearby cricket grounds and football pitches, check real-time tonight availability, lock slots with atomic concurrency controls, and receive digital QR entry passes.

The platform also includes a comprehensive multi-role management ecosystem: players discover and book grounds, verified turf owners manage live bookings and slot pricing, and super administrators inspect venue onboarding applications via interactive satellite coordinate reviews.

---

## ✨ Key Features

- **⚡ Real-Time Slot Reservation & Anti-Collision Holds**:
  - Dynamically calculates available time slots based on operating hours (including late-night 2 AM sessions).
  - Automatically locks slots with a temporary **10-minute atomic hold** while checkout is in progress, preventing double-booking race conditions.

- **🗺️ Geolocation Discovery & 100% Free Vector Map**:
  - Powered by **MapLibre GL JS** and high-speed **OpenFreeMap** vector street tiles (`liberty` style) with zero Google Maps API costs.
  - Native MongoDB `2dsphere` spatial indexing calculates accurate Haversine driving distances from the user's active GPS or chosen Jaipur neighborhood.
  - Interactive sport badges (🏏 Cricket, ⚽ Football), live hourly rates, and one-tap native GPS turn-by-turn directions.

- **📍 Swappable External Venue Discovery Pins**:
  - Sourced live via **OpenStreetMap Overpass API** (with zero-code switchover to **Google Places API** via environment variables).
  - Features a server-side in-memory 24-hour spatial cache bucketed by rounded coordinates to prevent redundant network calls.
  - Spatial deduplication suppresses external pins within 150m of active platform listings.
  - Discovery pins are clearly marked with directions-only popups (no booking CTA) to maintain strict functional separation.

- **💳 Modular Payment Engine**:
  - **Development Mode**: Integrated `MockPaymentProvider` simulating end-to-end checkout, holds, confirmations, and failure flows without real money.
  - **Production Mode**: Full `RazorpayPaymentProvider` support with cryptographic HMAC-SHA256 signature verification and webhook idempotency.

- **📝 "Become Owner" Turf Onboarding Flow**:
  - Self-service onboarding for turf managers capturing arena name, physical street address, sport types, pricing, and multi-photo uploads.
  - Interactive **MapLibre Location Pin Picker** with GPS autofill allowing applicants to accurately pin exact ground coordinates.

- **🛡️ Role-Based Portals (User / Owner / Admin)**:
  - **Player Hub**: Location-aware discovery, neighborhood radius filters, late-night owl filters, match checkout, and digital QR gate passes.
  - **Turf Owner Dashboard**: Unified role-authenticated portal to monitor live reservations, slot schedules, and revenue metrics.
  - **Super Admin Governance**: Deep-slate management dashboard featuring a dedicated venue application review modal with embedded coordinate inspection and photo gallery verification.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit & Redux Persist
- **Styling**: Vanilla CSS, Tailwind CSS (v3.4), DaisyUI (v4)
- **Map & Geolocation**: MapLibre GL JS (`maplibre-gl`), Leaflet, OpenFreeMap Vector CDN
- **Icons & UI**: Lucide React, GSAP animations

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Security & Headers**: Helmet, CORS, Express Rate Limit
- **Authentication**: JSON Web Tokens (JWT), Argon2 password hashing
- **Validation**: Express Validator
- **Testing**: Node.js Native Test Runner (`node --test`)

### Database & Storage
- **Database**: MongoDB Atlas with native `2dsphere` geospatial indexing
- **ODM**: Mongoose 8
- **Local Dev Database**: Embedded `mongodb-memory-server` automatic fallback
- **File & Media Storage**: Local `/public/turfs/` storage with Cloudinary support

### Services & Gateways
- **Vector Tile Provider**: OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`)
- **External Discovery**: OpenStreetMap Overpass API / Google Places API
- **Payments**: Razorpay Node SDK & Developer Mock Payment Simulator
- **Entry Passes**: QRCode generator (`qrcode`)

---

## 📸 Screenshots & Demo

<!-- TODO: Add live demo URL once deployed to production -->
> ℹ️ *Live demonstration recording and deployment links will be placed here.*

| Location-Aware Catalog Map & Discovery Pins | Enriched "Become Owner" Interactive Pin Picker |
| :---: | :---: |
| <!-- TODO: Insert Map Screenshot --> `client/user/src/components/turf/MapLibreCatalogMap.jsx` | <!-- TODO: Insert Become Owner Screenshot --> `client/user/src/features/becomeOwner/BecomeOwner.jsx` |

| Redesigned High-Tech Admin Dashboard | Mobile-Optimized Turf Details & Slot Selection |
| :---: | :---: |
| <!-- TODO: Insert Admin Dashboard Screenshot --> `client/user/src/pages/admin/AdminDashboardPage.jsx` | <!-- TODO: Insert Turf Details Screenshot --> `client/user/src/components/turf/TurfDetails.jsx` |

---

## 📂 Project Structure

```bash
TurfSpot/
├── client/
│   ├── user/                          # Main Unified Player & Dashboard Client (React + Vite)
│   │   ├── public/
│   │   │   └── turfs/                 # High-resolution venue sports photography
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/            # Navbar, Footer, Carousel, RoleRoute
│   │   │   │   ├── home/              # SportsImageMarquee (RTL auto-scroll)
│   │   │   │   └── turf/              # MapLibreCatalogMap, TurfCard, LocationPickerMap
│   │   │   ├── data/                  # Jaipur locality coordinates and seed definitions
│   │   │   ├── features/              # BecomeOwner multi-step onboarding
│   │   │   ├── hooks/                 # Custom React hooks (useTurfData, useUserLocation)
│   │   │   ├── pages/
│   │   │   │   ├── admin/             # AdminDashboardPage (Venue approval modal)
│   │   │   │   ├── owner/             # OwnerDashboardPage (Revenue & slot management)
│   │   │   │   └── auth/              # Unified Login and Registration
│   │   │   └── redux/                 # Global state slices (auth, turf, theme)
│   │   └── vite.config.js
│   └── owner/                         # Standalone Owner Dashboard Client (Optional)
├── server/                            # Backend REST API Server (Express + Mongoose)
│   ├── config/                        # Database connection & memory server failover
│   ├── controllers/
│   │   ├── admin/                     # Request management & admin governance
│   │   ├── owner/                     # Owner turf & booking operations
│   │   └── user/                      # Booking lifecycle, turfs, and discovery
│   ├── middleware/                    # JWT auth, role validation, rate limiting, uploads
│   ├── models/                        # Turf, Booking, User, OwnerRequest, TimeSlot
│   ├── routes/                        # Modular Express routing
│   ├── services/
│   │   ├── discovery/                 # Swappable OSM Overpass & Google Places service
│   │   └── payment/                   # Mock & Razorpay payment providers
│   ├── tests/                         # Production readiness automated test suite
│   ├── server.js                      # Application entry point
│   └── .env.example                   # Master backend environment template
├── LICENSE                            # MIT License
└── README.md                          # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB daemon or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

### 1. Clone the Repository
```bash
git clone https://github.com/TechOrAlfaiz/TurfSpot.git
cd TurfSpot
```

---

### 2. Install Dependencies

#### Backend Server
```bash
cd server
npm install
```

#### Frontend Client
```bash
cd ../client/user
npm install
```

*(Optional standalone owner portal)*:
```bash
cd ../owner
npm install
```

---

### 3. Configure Environment Variables

#### Backend (`server/.env`)
Copy the example configuration file in `server/`:
```bash
cd server
cp .env.example .env
```
Fill in your database credentials and preferred settings (see [Environment Variables](#-environment-variables)).

#### Frontend (`client/user/.env`)
Create or edit `client/user/.env`:
```bash
cd client/user
cp .env.example .env
```

---

### 4. Run Locally

Open two separate terminal windows:

#### Terminal 1 — Backend API
```bash
cd server
npm start
# Server starts on http://localhost:1234
```
*(You can also use `npm run dev` to run with node directly, or `npm run server` for nodemon).*

#### Terminal 2 — Frontend User Hub
```bash
cd client/user
npm run dev
# Vite dev server starts on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser to explore the platform.

---

### 5. Running Automated Tests
Run the production readiness API verification test suite:
```bash
cd server
npm test
```
*Validates 26 automated checks covering JWT authorization, Become Owner lifecycles, race condition prevention, and proximity calculations.*

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :---: |
| `PORT` | HTTP port for the Express API server | `1234` | **Yes** |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` | **Yes** |
| `CLIENT_ORIGIN` | Allowed CORS origins for the frontend client | `http://localhost:5173` | **Yes** |
| `PAYMENT_PROVIDER` | Payment engine mode (`mock` for dev simulation, `razorpay` for live) | `mock` | **Yes** |
| `PAYMENT_HOLD_MINUTES` | Minutes to hold a reserved slot before automatic expiration | `10` | **Yes** |
| `MONGO_URI` | MongoDB Atlas or local connection string | `mongodb+srv://...` | **Yes** |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `64-char hex string` | **Yes** |
| `ADMIN_EMAIL` | Super administrator email login | `admin@yourdomain.com` | **Yes** |
| `ADMIN_PASSWORD` | Super administrator password | Strong password | **Yes** |
| `GOOGLE_PLACES_API_KEY` | Google Places API key for nearby discovery *(falls back to OSM if omitted)* | `AIzaSy...` | Optional |
| `RAZORPAY_KEY_ID` | Razorpay Merchant Key ID *(only when `PAYMENT_PROVIDER=razorpay`)* | `rzp_live_...` | Optional |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key | Key Secret | Optional |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook verification secret | Secret | Optional |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary storage bucket name for user uploads | Cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API access key | API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Secret | Optional |

### Frontend (`client/user/.env`)

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :---: |
| `VITE_API_BASE_URL` | Base HTTP endpoint for the backend API | `http://localhost:1234` | **Yes** |
| `VITE_OPENFREEMAP_STYLE_URL` | OpenFreeMap vector JSON tile stylesheet URL | `https://tiles.openfreemap.org/styles/liberty` | **Yes** |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key ID for checkout dialogs | `rzp_test_...` | Optional |

---

## 🗺️ Roadmap

- [x] Vector map integration using MapLibre GL JS & OpenFreeMap
- [x] Dynamic sports venue discovery pins via OpenStreetMap Overpass API
- [x] Atomic slot hold engine preventing double-booking race conditions
- [x] Multi-step "Become Owner" onboarding with interactive map coordinate picker
- [x] Modernized Admin & Owner role dashboards with venue inspection modal
- [x] 10 unique high-resolution venue photos across all Jaipur grounds
- [ ] Cloud production deployment to Vercel (Frontend) and Render/Railway (Backend)
- [ ] Progressive Web App (PWA) offline ticket caching & push notifications
- [ ] Team challenge and player matchmaking community features

---

## 🤝 Contributing

Contributions are welcome! If you would like to help improve TurfSpot:

1. **Fork** the repository: `https://github.com/TechOrAlfaiz/TurfSpot/fork`
2. **Create** your feature branch: `git checkout -b feature/AmazingFeature`
3. **Commit** your changes: `git commit -m "feat: add some amazing feature"`
4. **Push** to your branch: `git push origin feature/AmazingFeature`
5. **Open** a Pull Request against `main`.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

---

## 👨‍💻 Author & Contact

**Mohd Alfaiz**  
- **GitHub**: [@TechOrAlfaiz](https://github.com/TechOrAlfaiz)  
- **Repository**: [https://github.com/TechOrAlfaiz/TurfSpot](https://github.com/TechOrAlfaiz/TurfSpot)  
- **Email**: [mohdalfaiz1245@gmail.com](mailto:mohdalfaiz1245@gmail.com)  
