# 🏟️ TurfSpot — Modern Sports Turf Booking Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![MapLibre GL JS](https://img.shields.io/badge/Maps-MapLibre%20%2B%20OpenFreeMap-06b6d4.svg)](https://openfreemap.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-10b981.svg)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-6366f1.svg)](https://vitejs.dev/)

TurfSpot is a full-stack, production-grade sports turf booking and arena management platform designed for **Cricket** 🏏 and **Football** ⚽ enthusiasts. Built with a sleek sports-tech dark aesthetic, it features real-time slot reservations, native 2dsphere geospatial discovery, instant QR entry passes, and a completely free vector map solution powered by **MapLibre GL JS** and **OpenFreeMap**.

---

## 👨‍💻 Developer Details

- **Author**: Mohd Alfaiz
- **GitHub**: [@TechOrAlfaiz](https://github.com/TechOrAlfaiz)
- **Repository**: [https://github.com/TechOrAlfaiz/TurfSpot](https://github.com/TechOrAlfaiz/TurfSpot)
- **Email**: [mohdalfaiz1245@gmail.com](mailto:mohdalfaiz1245@gmail.com)

---

## 🌟 Core Highlights & Architecture

### 🗺️ 100% Free Modern Map Stack (Zero Google Maps Cost)
- **MapLibre GL JS & OpenFreeMap**: Smooth, hardware-accelerated vector map rendering using high-speed CDN vector tiles (`liberty` style).
- **No Google API Key / Credit Card Required**: Completely avoids legacy Google Maps billing and quota restrictions.
- **Geospatial Proximity**: Powered by MongoDB native `2dsphere` indexes (`$near` queries) with server-calculated Haversine distances.
- **Interactive Pins & Popups**: Distinct sport badges (🏏 Cricket / ⚽ Football), live price labels, and glassmorphic quick-booking cards.
- **Native Turn-by-Turn Navigation**: Direct "Get Directions" launcher connecting users seamlessly to their device's native GPS navigation.

### ⚡ Smart Slot Reservation & Anti-Conflict Engine
- **Atomic Slot Holds**: 10-minute temporary lock prevents race conditions and double-booking while payments are in flight.
- **Dynamic Slot Generation**: Calculated automatically from each turf's operating hours (including late-night 2 AM slots) and past-hour filtering.
- **Modular Payment Provider**:
  - `development`: Isolated, secure `MockPaymentProvider` simulating complete payment lifecycles without real money.
  - `production`: Direct `RazorpayPaymentProvider` with cryptographic HMAC-SHA256 signature verification and webhook idempotency.

### 🎟️ Instant Match Confirmation & QR Gate Passes
- Generates dynamic QR passes for confirmed bookings with match duration, sport type, and ground details.
- Full booking history with quick status filtering (Upcoming, Completed, Cancelled).
- Automatic cancellation and slot release rules with refund audit logging.

---

## 📂 Project Structure

```bash
TurfSpot/
├── client/
│   ├── user/          # Player Hub (React + Vite + Tailwind + MapLibre)
│   └── owner/         # Turf Owner & Admin Dashboard (Vite + React)
├── server/            # REST API (Express, Mongoose, Geospatial Engine)
│   ├── config/        # Database & payment configuration
│   ├── controllers/   # User, Owner, Admin controllers
│   ├── models/        # Turf, Booking, User, TimeSlot, Payment schemas
│   ├── routes/        # Modular API routes
│   └── services/      # Payment providers (Mock & Razorpay)
└── .gitignore         # Comprehensive rules protecting all .env and secrets
```

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/TechOrAlfaiz/TurfSpot.git
cd TurfSpot
```

### 2. Install Dependencies
```bash
# Install Server dependencies
cd server
npm install

# Install User Client dependencies
cd ../client/user
npm install

# Install Owner Client dependencies
cd ../owner
npm install
```

### 3. Environment Variables Configuration

#### Backend (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=1234
NODE_ENV=development
PAYMENT_PROVIDER=mock          # Use 'mock' for local dev, 'razorpay' for live
PAYMENT_HOLD_MINUTES=10
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Optional Razorpay credentials (only if PAYMENT_PROVIDER=razorpay)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

#### User Client (`client/user/.env`)
Create `client/user/.env` based on `client/user/.env.example`:
```env
VITE_API_BASE_URL=http://localhost:1234
# Free OpenFreeMap Vector Tile Style (Zero API key needed)
VITE_OPENFREEMAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
```

### 4. Run Locally

Open three terminal windows (or run concurrently):

```bash
# Terminal 1: Backend Server (runs on http://localhost:1234)
cd server
npm start

# Terminal 2: Player User Hub (runs on http://localhost:5173)
cd client/user
npm run dev

# Terminal 3: Owner / Admin Dashboard (runs on http://localhost:5174)
cd client/owner
npm run dev
```

---

## 🌐 Deployment Status

> ℹ️ **Notice**: This project is currently running in active local development and testing mode. Cloud production deployment (Vercel / Render / Railway) is planned for upcoming milestones. Old placeholder demo URLs from legacy templates have been decommissioned.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, MapLibre GL JS, Tailwind CSS, DaisyUI, Redux Toolkit, Lucide Icons
- **Backend**: Node.js, Express.js, Mongoose, Argon2, JWT
- **Database**: MongoDB Atlas (with `2dsphere` geospatial indexing)
- **Map Provider**: OpenFreeMap vector tiles (OpenStreetMap data)
- **Payment Architecture**: Modular Provider Pattern (Dev Simulator & Razorpay)

---

## 📜 License & Contact

This project is licensed under the [MIT License](LICENSE).

For inquiries, collaborations, or feedback, reach out to **Mohd Alfaiz**:
- 📧 Email: [mohdalfaiz1245@gmail.com](mailto:mohdalfaiz1245@gmail.com)
- 🐙 GitHub: [@TechOrAlfaiz](https://github.com/TechOrAlfaiz)
