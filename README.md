# 🌿 AgriAssist — AI Smart Farming Assistant

A full-stack hackathon prototype built with **React + Node.js + Express**.  
AI-powered crop disease detection, weather insights, nearby store finder, and more — built for Indian farmers.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS (CDN), Framer Motion |
| Backend | Node.js, Express.js |
| Auth | JWT + bcryptjs (in-memory store) |
| Maps | Leaflet.js + React-Leaflet + OpenStreetMap |
| Voice | Web Speech API (browser built-in) |
| Camera | HTML5 getUserMedia API |
| Data | In-memory (localhost, no database needed) |

---

## 📁 Project Structure

```
agriassist-react/
├── backend/
│   ├── server.js          ← Express API (auth, scan, weather, stores)
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html     ← Tailwind CDN + Google Fonts + Leaflet CSS
│   ├── src/
│   │   ├── App.js          ← Routes + Protected routes
│   │   ├── index.js        ← React entry
│   │   ├── context/
│   │   │   └── AuthContext.js   ← Global auth state
│   │   ├── components/
│   │   │   └── AppLayout.js     ← Sidebar + header + mobile nav
│   │   └── pages/
│   │       ├── Landing.js       ← Public landing page
│   │       ├── Login.js         ← Login with JWT auth
│   │       ├── Signup.js        ← Signup with role picker
│   │       ├── Dashboard.js     ← Main dashboard
│   │       ├── Scanner.js       ← AI disease scanner + camera
│   │       ├── Stores.js        ← Leaflet map + store list
│   │       └── Profile.js       ← User profile + settings
│   └── package.json
├── package.json            ← Root scripts
├── start.sh                ← One-command startup
└── README.md
```

---

## 🚀 How to Run

### Prerequisites
- **Node.js v18+** → https://nodejs.org
- **npm v9+** (comes with Node)

---

### Method 1: Manual (Recommended)

**Terminal 1 — Start Backend:**
```bash
cd agriassist-react/backend
npm install
node server.js
```
You'll see: `🌿 AgriAssist Backend running on http://localhost:5000`

**Terminal 2 — Start Frontend:**
```bash
cd agriassist-react/frontend
npm install
npm start
```
Browser opens at: `http://localhost:3000`

---

### Method 2: Using start.sh (Mac/Linux)
```bash
cd agriassist-react
chmod +x start.sh
./start.sh
```

---

### Method 3: Windows (PowerShell)
```powershell
# Terminal 1 — Backend
cd agriassist-react\backend
npm install
node server.js

# Terminal 2 — Frontend
cd agriassist-react\frontend
npm install
npm start
```

---

## 🔑 Demo Login Credentials

| Field | Value |
|-------|-------|
| Email | `rajesh@farm.com` |
| Password | `farmer123` |

> These are pre-seeded in the backend on startup.  
> You can also create a new account via the Signup page.

---

## 🗺️ API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/scan` | Yes | Submit scan, get disease result |
| GET | `/api/scans` | Yes | Get user's scan history |
| GET | `/api/weather` | Yes | Mock weather data |
| GET | `/api/stores` | Yes | Nearby store list |
| GET | `/api/tips` | Yes | Daily farming tips |
| GET | `/api/diseases` | No | All disease database |

---

## 🔬 Scanner Demo — How to Use

1. Go to **Scan Disease** page
2. Choose a **sample crop** (tomato, potato, corn, wheat, rice, mango)  
   OR upload your own image  
   OR use **📸 Camera** button (requires camera permission)
3. Click **"Analyze with AI"**
4. Watch animated scanning progress (6 steps)
5. See disease result with:
   - Disease name + severity bar
   - AI confidence score (94.2%)
   - Treatment plan (5 steps)
   - Recommended pesticide
   - **🔊 Hear Treatment** — reads result aloud (Web Speech API)
6. Click **"Find Store"** → goes to Stores map
7. Click **"Scan Another"** → reset

### Disease Mapping Logic (filename-based)
| Crop | Disease | Severity |
|------|---------|----------|
| `tomato` | Early Blight | 72% High |
| `potato` | Late Blight | 88% Critical |
| `corn` / `maize` | Southern Rust | 52% Moderate |
| `wheat` | Yellow Rust | 40% Moderate |
| `rice` | Blast Disease | 35% Low-Moderate |
| `mango` | Anthracnose | 28% Low |

---

## 🗺️ Map (Stores Page)

- Uses **Leaflet.js + OpenStreetMap** (no API key needed)
- Shows **5 mock stores** around Ludhiana, Punjab
- Click any marker for store popup
- Click any store card to expand stock info
- Filter by: All / Fertilizer / Pesticide / Center / Organic / Lab

---

## 📱 Responsive Design

- **Desktop**: sidebar navigation + full layout
- **Tablet**: collapsible sidebar
- **Mobile**: bottom navigation bar (like a real app)

---

## ⚠️ Notes

- **All data is in-memory** — restarting the backend resets users/scans (except the demo user)
- **No database needed** — intentional for hackathon simplicity
- **Camera API** requires HTTPS in production — works on `localhost` for demo
- **Voice** uses browser's built-in speech synthesis — Chrome/Edge recommended

---

## 🎯 Hackathon Judge Flow

1. Open `http://localhost:3000`
2. Click **"Get Started"** on landing page
3. Login with `rajesh@farm.com` / `farmer123`
4. Explore **Dashboard** — weather, crop health, tips
5. Go to **Scan Disease** → select Tomato sample → click Analyze
6. See disease result → click **🔊 Hear Treatment**
7. Click **Find Store** → see Leaflet map
8. Visit **Profile** → see scan history, toggle settings

---

Made with ❤️ for Indian Farmers · AgriAssist 2025 Hackathon
