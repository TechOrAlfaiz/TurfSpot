# 🏟️ TurfSpot

> **Next-Generation Sports Turf Booking & Arena Discovery Platform for Jaipur**

[![Live Demo](https://img.shields.io/badge/Live_Demo-user--six--steel.vercel.app-10B981?style=for-the-badge&logo=vercel&logoColor=white)](https://user-six-steel.vercel.app)
[![API Status](https://img.shields.io/badge/API-Online-3B82F6?style=for-the-badge&logo=fastapi&logoColor=white)](https://server-three-beryl-10.vercel.app/api/user/turf/all)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%202dsphere-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![MapLibre](https://img.shields.io/badge/Maps-MapLibre%20GL-396B9C?style=for-the-badge&logo=maplibre&logoColor=white)](https://maplibre.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Production Deployment Links

| Resource | Live URL | Description |
| :--- | :--- | :--- |
| 🚀 **Web Application** | **[https://user-six-steel.vercel.app](https://user-six-steel.vercel.app)** | Production frontend client (Vite + React 18 + Tailwind) |
| 🗺️ **Explore & Map View** | **[https://user-six-steel.vercel.app/turfs](https://user-six-steel.vercel.app/turfs)** | Full venue catalog with interactive MapLibre vector pins |
| ⚡ **REST API Gateway** | **[https://server-three-beryl-10.vercel.app](https://server-three-beryl-10.vercel.app)** | Production Serverless Express API connected to MongoDB Atlas |
| 📡 **API Catalog Endpoint**| **[`GET /api/user/turf/all`](https://server-three-beryl-10.vercel.app/api/user/turf/all)** | Live JSON endpoint serving 35 active Jaipur sports venues |

---

## 🔑 Demo Access & Test Credentials

You can test all user roles on the live production application immediately:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@gmail.com` | `Admin@TurfSpot2025!` | [Admin Dashboard](https://user-six-steel.vercel.app/admin/dashboard) |
| **Turf Owner** | *(Generated automatically on approval)* | *(Shown in Admin modal)* | [Owner Dashboard](https://user-six-steel.vercel.app/owner/dashboard) |
| **Player / User** | Sign up with any email | Any 6+ characters | [Player Portal](https://user-six-steel.vercel.app/login) |

---

## 📌 Overview

**TurfSpot** is a full-stack, location-aware sports turf booking and arena discovery application tailored specifically for players, teams, and ground managers in **Jaipur, Rajasthan**. Designed with an ultra-responsive sports-tech dark aesthetic, TurfSpot enables athletes to discover nearby box cricket pitches and football turfs, inspect certified synthetic grass surfaces, check tonight's real-time slot availability, lock slots with anti-collision atomic holds, and receive instant digital QR entry passes.

The platform provides a 360-degree sports venue ecosystem:
1. **Players**: Discover grounds by GPS distance, filter late-night matches (up to 2 AM), compare amenities, and reserve slots.
2. **Turf Owners**: Onboard arenas via an interactive map coordinate pin picker, track live bookings, configure custom pricing, and manage slot schedules.
3. **Super Administrators**: Review pending arena onboarding applications, inspect satellite coordinates, approve venues with 1-click credential generation, and govern platform health.

---

## ✨ Key Architectural Highlights

### 1. ⚡ Anti-Collision Slot Hold Engine
- Solves the classic race condition where two simultaneous players attempt to reserve the same 8 PM–9 PM cricket pitch.
- When checkout starts, an **atomic 10-minute hold** (`status: "HELD"`, `holdExpiresAt: Date`) is acquired via MongoDB concurrency guards.
- If checkout succeeds, the slot transitions cleanly to `BOOKED`. If the player abandons checkout, a self-purging background TTL mechanism frees the slot automatically.

### 2. 🗺️ 100% Free, High-Speed Vector Map (Zero Google API Costs)
- Integrated with **MapLibre GL JS** and vector street tiles from **OpenFreeMap** (`https://tiles.openfreemap.org/styles/liberty`).
- Zero billing threshold, zero usage limits, and zero Google Maps API keys required for map rendering.
- Displays custom branded green & amber pill markers indicating sports type (🏏 Cricket, ⚽ Football) and hourly prices (`₹900`, `₹1200`, etc.).
- Clicking any pin reveals an interactive glassmorphic popup with photo gallery, ratings, full address, and one-tap turn-by-turn navigation.

### 3. 📍 Dual-Layer External Venue Discovery
- Alongside platform-bookable turfs, TurfSpot maps external sports venues (stadiums, sports complexes, school grounds) in Jaipur using the **OpenStreetMap Overpass API** (with pluggable **Google Places API** fallback).
- Includes an in-memory 24-hour spatial cache keyed by rounded geographical coordinates to eliminate redundant network roundtrips.
- Features spatial deduplication that automatically suppresses external pins located within 150m of verified platform turfs.
- External discovery pins are visually and functionally distinct (directions-only popup with no booking CTA) to maintain platform integrity.

### 4. 📝 Self-Service "Become Owner" Onboarding & Admin Governance
- Turf owners submit arena details including name, street address, sport capabilities, hourly rates, and photos.
- Includes an **interactive MapLibre location picker** with one-tap browser GPS autofill, allowing applicants to drop their exact pin on the map.
- Administrators review applications inside an enriched inspection modal with map preview and photo verification. Approving an applicant automatically provisions the `Owner` account and creates an active `Turf` document with instant visibility on all public listings.

### 5. 💳 Modular Dual-Mode Payment Architecture
- **Development / Demo Mode**: Integrated `MockPaymentProvider` simulating checkout dialogs, order IDs, and payment verification with zero external dependencies.
- **Production Mode**: `RazorpayPaymentProvider` supporting live orders, cryptographic HMAC-SHA256 signature verification, and webhook idempotency.

---

## 🛠️ Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                               TURFSPOT                                 │
└────────────────────────────────────────────────────────────────────────┘
        │                                                │
   [Frontend]                                       [Backend]
   React 18 + Vite                                  Express.js (Node.js 20+)
   Tailwind CSS + DaisyUI                           Serverless & Standalone
   Redux Toolkit + Persist                          Argon2 Password Hashing
   MapLibre GL JS + OpenFreeMap                     JSON Web Tokens (JWT)
   Lucide React Icons                               Express Rate Limit & Helmet
        │                                                │
        └───────────────────────┬────────────────────────┘
                                │
                         [Data & Storage]
                         MongoDB Atlas (2dsphere geospatial index)
                         Mongoose 8 ODM
                         Local & Cloudinary Media Storage
```

---

## 📂 Repository Structure

```bash
TurfSpot/
├── client/
│   ├── user/                          # Main Unified Player & Governance Client
│   │   ├── public/                    # Static assets, favicon, sports imagery
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/            # Carousel, RoleRoute, Navbar, Footer
│   │   │   │   ├── home/              # SportsImageMarquee (RTL auto-scroll)
│   │   │   │   └── turf/              # MapLibreCatalogMap, LocationPickerMap, TurfCard
│   │   │   ├── data/                  # Jaipur localities, coordinates & seeds
│   │   │   ├── features/              # BecomeOwner multi-step onboarding
│   │   │   ├── hooks/                 # useTurfData, useUserLocation, useAxiosInstance
│   │   │   ├── pages/
│   │   │   │   ├── admin/             # AdminDashboardPage (request governance)
│   │   │   │   ├── owner/             # OwnerDashboardPage (revenue & slot control)
│   │   │   │   └── auth/              # Unified Login & Registration
│   │   │   └── redux/                 # Global slices (auth, turf, theme)
│   │   ├── vercel.json                # Client SPA rewrite configuration
│   │   └── vite.config.js
│   └── owner/                         # Standalone Owner Dashboard Client (Optional)
├── server/                            # Backend REST API
│   ├── config/                        # Database connection & memory server failover
│   ├── controllers/
│   │   ├── admin/                     # Request approval, deactivation & analytics
│   │   ├── owner/                     # Owner venue & slot management
│   │   └── user/                      # Booking lifecycle, catalog & nearby queries
│   ├── middleware/                    # JWT auth, role validation, rate limiting
│   ├── models/                        # Turf, Booking, User, OwnerRequest, TimeSlot
│   ├── routes/                        # Modular Express routes
│   ├── scripts/                       # Migration & backfill scripts
│   ├── services/                      # Payment providers (Mock/Razorpay) & Discovery (OSM)
│   ├── tests/                         # Production readiness automated test suite (26 checks)
│   ├── server.js                      # Application entry point (dual serverless/standalone)
│   ├── vercel.json                    # Serverless API deployment configuration
│   └── .env.example                   # Master backend environment template
├── render.yaml                        # Automated Render Blueprint configuration
├── vercel.json                        # Root monorepo deployment configuration
├── LICENSE                            # MIT License
└── README.md                          # Platform Documentation
```

---

## 📡 REST API Reference

All backend routes are prefixed with `/api`. Below are the primary public and authenticated endpoints:

### Public Turf Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/user/turf/all` | Returns all active platform turfs sorted by rating |
| `GET` | `/api/user/turf/nearby` | Spatial query (`?lat=&lng=&radius=&sport=&lateNight=`) |
| `GET` | `/api/user/turf/:id` | Returns single turf details with distance calculation |
| `GET` | `/api/user/turf/:id/slots` | Returns hourly slots and availability for given date (`?date=YYYY-MM-DD`) |
| `GET` | `/api/user/discovery/nearby`| Queries nearby external sports grounds via OpenStreetMap Overpass |

### Booking & Reservation Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/user/booking/hold` | Acquires 10-minute atomic lock on selected time slots |
| `POST` | `/api/user/booking/create` | Finalizes reservation and generates QR entry pass |
| `GET` | `/api/user/booking/my-bookings` | Returns authenticated player's reservation history |

### Onboarding & Governance Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/owner/auth/ownerRequest` | Submits new "Become Owner" arena onboarding application |
| `GET` | `/api/admin/owner-requests/list` | Returns pending, approved, and rejected applications *(Admin only)* |
| `PUT` | `/api/admin/owner-requests/:id/accept` | Approves applicant, creates Owner account, and publishes Turf |
| `DELETE` | `/api/admin/owner-requests/:id` | Rejects application and deactivates associated venue |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance or free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/TechOrAlfaiz/TurfSpot.git
cd TurfSpot

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client/user
npm install
```

### 2. Environment Variables

Create `.env` in `server/`:
```bash
cd server
cp .env.example .env
```
Ensure `MONGO_URI` and `JWT_SECRET` are populated.

Create `.env` in `client/user/`:
```bash
cd ../client/user
cp .env.example .env
```

### 3. Launch Development Servers

```bash
# Terminal 1 — Backend API (Starts on http://localhost:1234)
cd server
npm start

# Terminal 2 — Frontend Client (Starts on http://localhost:5173)
cd client/user
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Running Automated Tests

TurfSpot includes a comprehensive native test suite verifying production readiness:

```bash
cd server
npm test
```

**Test Coverage (26 Automated Checks):**
- Authentication & JWT token role assignment (Admin, Owner, Player).
- Public turf listing serialization and Haversine distance calculations.
- Atomic slot holds and automatic hold expiration.
- End-to-end Become Owner application submission, admin approval, and rejection deactivation.
- Spatial Overpass API discovery queries and in-memory cache deduplication.

---

## ⚙️ Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :---: |
| `PORT` | API server port | `1234` | **Yes** |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` | **Yes** |
| `CLIENT_ORIGIN` | Allowed CORS origins (comma-separated for multiples) | `http://localhost:5173,https://user-six-steel.vercel.app` | **Yes** |
| `PAYMENT_PROVIDER` | Payment mode (`mock` or `razorpay`) | `mock` | **Yes** |
| `PAYMENT_HOLD_MINUTES` | Duration in minutes for temporary slot holds | `10` | **Yes** |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` | **Yes** |
| `JWT_SECRET` | Cryptographic secret for signing tokens | `3VpHKW...` | **Yes** |
| `ADMIN_EMAIL` | Super admin login email | `admin@gmail.com` | **Yes** |
| `ADMIN_PASSWORD` | Super admin login password | `Admin@TurfSpot2025!` | **Yes** |
| `GOOGLE_PLACES_API_KEY`| Google Places API key *(falls back to OpenStreetMap if empty)* | `AIzaSy...` | Optional |
| `RAZORPAY_KEY_ID` | Razorpay Merchant Key ID *(only when `PAYMENT_PROVIDER=razorpay`)* | `rzp_live_...` | Optional |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key | Secret | Optional |

### Frontend (`client/user/.env`)
| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :---: |
| `VITE_API_BASE_URL` | Production or local API gateway URL | `https://server-three-beryl-10.vercel.app` | **Yes** |
| `VITE_OPENFREEMAP_STYLE_URL` | OpenFreeMap vector style JSON | `https://tiles.openfreemap.org/styles/liberty` | **Yes** |
| `VITE_RAZORPAY_KEY_ID` | Public client Razorpay key ID | `rzp_test_...` | Optional |

---

## 🗺️ Project Status & Roadmap

- [x] Vector map catalog using MapLibre GL JS & OpenFreeMap
- [x] Swappable sports ground discovery pins via OpenStreetMap Overpass API
- [x] Atomic slot hold engine eliminating race conditions
- [x] Multi-step "Become Owner" onboarding with interactive GPS map picker
- [x] Admin application governance modal with coordinate & photo inspection
- [x] One-time database migration backfilling previously approved venues
- [x] Production deployment on Vercel (Frontend & Serverless API)
- [ ] Progressive Web App (PWA) offline entry pass wallet
- [ ] Automated SMS & WhatsApp booking confirmation notifications
- [ ] Player tournament bracket generator and matchmaking lobby

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete license details.

---

## 👨‍💻 Author & Contact

**Mohd Alfaiz**  
- **GitHub**: [@TechOrAlfaiz](https://github.com/TechOrAlfaiz)  
- **Repository**: [https://github.com/TechOrAlfaiz/TurfSpot](https://github.com/TechOrAlfaiz/TurfSpot)  
- **Live Demo**: [https://user-six-steel.vercel.app](https://user-six-steel.vercel.app)  
- **Email**: [mohdalfaiz1245@gmail.com](mailto:mohdalfaiz1245@gmail.com)  
