const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim();
  });
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'agriassist_secret_2025';
const CROP_HEALTH_KEY = process.env.CROP_HEALTH_API_KEY || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));

const db = new Database(path.join(__dirname, 'agriassist.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    google_id TEXT,
    picture TEXT,
    role TEXT DEFAULT 'farmer',
    state TEXT DEFAULT 'Punjab',
    mobile TEXT DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    crop_type TEXT,
    disease_json TEXT,
    ml_result_json TEXT,
    scanned_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const seedUser = db.prepare('SELECT id FROM users WHERE email = ?').get('rajesh@farm.com');
if (!seedUser) {
  const hash = bcrypt.hashSync('farmer123', 10);
  db.prepare(`INSERT INTO users (id, name, email, password, role, state, mobile, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run('demo-001', 'Rajesh Singh', 'rajesh@farm.com', hash, 'farmer', 'Punjab', '+91 98765 43210', new Date().toISOString());
}

const dbHelpers = {
  findUserByEmail: (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(email),
  findUserById: (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id),
  createUser: (user) => db.prepare(`INSERT INTO users (id, name, email, password, google_id, picture, role, state, mobile, created_at)
    VALUES (@id, @name, @email, @password, @google_id, @picture, @role, @state, @mobile, @created_at)`).run(user),
  updateUserGoogle: (id, googleId, picture) => db.prepare('UPDATE users SET google_id = ?, picture = ? WHERE id = ?').run(googleId, picture, id),
  insertScan: (scan) => db.prepare(`INSERT INTO scans (id, user_id, crop_type, disease_json, ml_result_json, scanned_at)
    VALUES (@id, @user_id, @crop_type, @disease_json, @ml_result_json, @scanned_at)`).run(scan),
  getUserScans: (userId) => db.prepare('SELECT * FROM scans WHERE user_id = ? ORDER BY scanned_at DESC LIMIT 20').all(userId),
};

const DISEASE_DATA = {
  tomato: {
    name: 'Tomato Early Blight',
    pathogen: 'Alternaria solani',
    severity: 72,
    level: 'High',
    color: '#e74c3c',
    description: 'Brown concentric lesions with yellow halos on older leaves. Spreads rapidly in warm humid conditions (24–29°C). Can cause 30–50% yield loss if untreated.',
    treatments: [
      'Apply Mancozeb 75% WP @ 2.5 g/litre every 7–10 days',
      'Remove and destroy infected leaves immediately',
      'Use drip irrigation — avoid wetting foliage',
      'Apply Copper Oxychloride 50% WP as preventive',
    ],
    pesticide: 'Mancozeb 75% WP (Indofil M-45)',
    prevention: 'Rotate crops, maintain plant spacing, avoid overhead irrigation',
  },
  potato: {
    name: 'Potato Late Blight',
    pathogen: 'Phytophthora infestans',
    severity: 88,
    level: 'Critical',
    color: '#c0392b',
    description: 'Water-soaked lesions turning dark brown. Can destroy entire field within 10 days. Most dangerous in cool wet weather.',
    treatments: [
      'Apply Metalaxyl + Mancozeb (Ridomil) immediately',
      'Spray Cymoxanil 8% + Mancozeb 64% every 5 days',
      'Destroy all infected material — burn or bury',
      'Consider early harvest if blight > 30%',
    ],
    pesticide: 'Ridomil Gold 68 WP (Metalaxyl + Mancozeb)',
    prevention: 'Use certified disease-free seed tubers, ensure field drainage',
  },
  corn: {
    name: 'Corn Southern Rust',
    pathogen: 'Puccinia polysora',
    severity: 52,
    level: 'Moderate',
    color: '#e67e22',
    description: 'Orange-red pustules on upper leaf surfaces. Reduces photosynthesis causing grain fill loss. Thrives at 27–32°C.',
    treatments: [
      'Apply Propiconazole 25% EC @ 1 mL/litre',
      'Use Azoxystrobin + Propiconazole combined',
      'Ensure adequate potassium fertilization',
      'Scout fields twice weekly in humid weather',
    ],
    pesticide: 'Tilt 250EC (Propiconazole)',
    prevention: 'Plant resistant hybrids, timely sowing, balanced fertilization',
  },
  wheat: {
    name: 'Wheat Yellow Rust',
    pathogen: 'Puccinia striiformis',
    severity: 40,
    level: 'Moderate',
    color: '#f39c12',
    description: 'Yellow stripes of powder along leaf veins. Severe in cool moist weather. Can cause 40–70% yield loss without treatment.',
    treatments: [
      'Apply Propiconazole 25% EC spray immediately',
      'Use Tebuconazole 250 EC as alternative',
      'Spray during early morning for best absorption',
      'Report large outbreaks to district agri office',
    ],
    pesticide: 'Propiconazole 25% EC (Tilt)',
    prevention: 'Use resistant varieties, timely fungicide spray at first sign',
  },
  rice: {
    name: 'Rice Blast Disease',
    pathogen: 'Magnaporthe oryzae',
    severity: 35,
    level: 'Low-Moderate',
    color: '#27ae60',
    description: 'Diamond-shaped lesions with gray centers. Can affect leaves, neck and panicle. Neck blast causes 100% loss in affected area.',
    treatments: [
      'Apply Tricyclazole 75% WP @ 0.6 g/litre',
      'Use Carbendazim 50% WP as alternative',
      'Avoid excess nitrogen application',
      'Ensure proper field drainage',
    ],
    pesticide: 'Beam 75WP (Tricyclazole)',
    prevention: 'Balanced fertilization, avoid overcrowding, proper irrigation',
  },
  mango: {
    name: 'Mango Anthracnose',
    pathogen: 'Colletotrichum gloeosporioides',
    severity: 28,
    level: 'Low',
    color: '#3498db',
    description: 'Dark spots on leaves and fruits. Most severe during wet season at flowering and fruiting stage. Causes post-harvest losses.',
    treatments: [
      'Apply Copper Oxychloride 50% WP spray',
      'Use Carbendazim 50% WP for fruit protection',
      'Prune infected branches, destroy away from tree',
      'Apply lime sulfur during dormant season',
    ],
    pesticide: 'Copper Oxychloride 50% WP (Blitox)',
    prevention: 'Improve canopy ventilation through pruning, avoid overhead irrigation',
  },
};

const STORE_NAMES = ['Kisan Agri Store', 'Punjab Pesticides Hub', 'Green Farm Organics', 'Agrivet Center', 'Farmer Supermart', 'Crop Care Clinic'];
const STORE_TYPES = ['fertilizer', 'pesticide', 'center', 'organic', 'lab'];
const STORE_STOCKS = [
  ['Mancozeb', 'DAP', 'Urea'], ['Ridomil', 'Propiconazole', 'Imidacloprid'],
  ['Free Soil Test', 'Expert Advice'], ['Neem Oil', 'Trichoderma', 'Bio-NPK'],
  ['NPK Analysis', 'pH Test']
];

function generateDynamicStores(lat, lng) {
  // Use pseudo-random logic to generate stores around the given lat/lng
  const stores = [];
  const baseLat = parseFloat(lat) || 30.9008;
  const baseLng = parseFloat(lng) || 75.8573;
  
  for (let i = 0; i < 5; i++) {
    // Math.sin acts as a pseudo-random seed based on index and coordinates
    const seed = Math.abs(Math.sin(baseLat * baseLng * (i + 1))); 
    const isNearby = seed > 0.5;
    
    // Add small random offsets to lat/lng for map displacement (radius ~ 5km max)
    const latOffset = (Math.sin(seed * 100) * 0.04);
    const lngOffset = (Math.cos(seed * 100) * 0.04);

    const distance = (1 + (seed * 4)).toFixed(1); // 1.0 to 5.0 km
    const typeIdx = Math.floor(seed * 100) % STORE_TYPES.length;

    stores.push({
      id: i + 1,
      name: STORE_NAMES[Math.floor(seed * 1000) % STORE_NAMES.length] + ' ' + (i + 1),
      type: STORE_TYPES[typeIdx],
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset,
      rating: (4 + seed).toFixed(1),
      distance: `${distance} km`,
      open: seed > 0.2, // 80% chance of being open
      stock: STORE_STOCKS[typeIdx],
      phone: `98765-0000${i + 1}`
    });
  }
  return stores;
}

const TIPS = [
  { id: 1, icon: '💧', title: 'Irrigation Timing', body: 'Water fields between 5–7 AM to reduce evaporation and minimize fungal risk in high humidity.' },
  { id: 2, icon: '🌡️', title: 'Heat Alert', body: 'Temperatures above 35°C expected this weekend. Use shade nets for tomato and pepper crops.' },
  { id: 3, icon: '🐛', title: 'Pest Watch', body: 'Aphid season is active. Inspect undersides of leaves and apply neem oil spray if needed.' },
  { id: 4, icon: '🌱', title: 'Soil Health', body: 'Add organic compost before next sowing season to improve nitrogen levels and soil structure.' },
  { id: 5, icon: '📅', title: 'Sowing Schedule', body: 'Ideal window for Rabi crops opens in 3 weeks. Prepare fields and source certified seeds now.' },
];

const WEATHER_FALLBACK = {
  city: 'Ludhiana, Punjab',
  temp: 28,
  feels: 31,
  humidity: 72,
  wind: 8,
  rainfall: 3,
  uv: 6,
  condition: 'Partly Cloudy',
  icon: '⛅',
  forecast: [
    { day: 'Tomorrow', icon: '🌧️', high: 26, low: 19 },
    { day: 'Thu', icon: '☁️', high: 24, low: 18 },
    { day: 'Fri', icon: '🌤️', high: 30, low: 20 },
    { day: 'Sat', icon: '☀️', high: 33, low: 22 },
  ],
  alert: 'High humidity (72%) increases fungal infection risk. Monitor tomato and wheat crops closely.',
  source: 'fallback',
};

function getWMOIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '⛅';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌦️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '❄️';
  if (code <= 84) return '🌧️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

function getWMOCondition(code) {
  if (code === 0) return 'Clear Sky';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rainy';
  if (code <= 79) return 'Snowy';
  if (code <= 84) return 'Rain Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

async function fetchGeocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocode API returned ${response.status}`);
  const json = await response.json();
  if (!json.results?.length) throw new Error('City not found');
  const r = json.results[0];
  return { lat: r.latitude, lon: r.longitude, name: r.name, country: r.country };
}

async function fetchOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo API returned ${response.status}`);
  const json = await response.json();
  const c = json.current;
  const d = json.daily;

  const temp = Math.round(c.temperature_2m);
  const feels = Math.round(c.apparent_temperature);
  const humidity = Math.round(c.relative_humidity_2m);
  const wind = Math.round(c.wind_speed_10m);
  const rainfall = Math.round(c.precipitation || 0);
  const uv = Math.round(c.uv_index || 0);
  const code = c.weather_code;
  const icon = getWMOIcon(code);
  const condition = getWMOCondition(code);

  let alert = null;
  if (humidity > 70) alert = `High humidity (${humidity}%) increases fungal infection risk. Monitor crops closely.`;
  else if (temp > 38) alert = `Extreme heat (${temp}°C) detected. Irrigate early morning and use shade nets.`;
  else if (rainfall > 10) alert = `Heavy rainfall (${rainfall}mm). Ensure proper field drainage to prevent waterlogging.`;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const forecast = d.time.slice(1, 5).map((dateStr, i) => {
    // Handling date safely, ensuring it evaluates to noon local time to avoid timezone offset shifts in getDay()
    const safeDateStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
    const dayOfWeek = new Date(safeDateStr).getDay();
    return {
      day: i === 0 ? 'Tomorrow' : dayNames[dayOfWeek],
      icon: getWMOIcon(d.weather_code[i + 1]),
      high: Math.round(d.temperature_2m_max[i + 1]),
      low: Math.round(d.temperature_2m_min[i + 1]),
    };
  });

  return { temp, feels, humidity, wind, rainfall, uv, condition, icon, forecast, alert, source: 'live' };
}

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, state, mobile } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
    if (dbHelpers.findUserByEmail(email)) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(), name, email, password: hashed,
      google_id: null, picture: null,
      role: role || 'farmer', state: state || 'Punjab',
      mobile: mobile || '', created_at: new Date().toISOString(),
    };
    dbHelpers.createUser(user);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, state: user.state } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = dbHelpers.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, state: user.state } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential required' });
    const parts = credential.split('.');
    if (parts.length !== 3) return res.status(400).json({ message: 'Invalid credential format' });
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const { email, name, sub: googleId, picture } = payload;
    if (!email || !name) return res.status(400).json({ message: 'Invalid Google token payload' });
    let user = dbHelpers.findUserByEmail(email);
    if (!user) {
      const newUser = {
        id: uuidv4(), name, email, password: null,
        google_id: googleId, picture,
        role: 'farmer', state: 'Punjab',
        mobile: '', created_at: new Date().toISOString(),
      };
      dbHelpers.createUser(newUser);
      user = dbHelpers.findUserById(newUser.id);
    } else if (!user.google_id) {
      dbHelpers.updateUserGoogle(user.id, googleId, picture);
      user.google_id = googleId;
      user.picture = picture;
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, state: user.state, picture: user.picture } });
  } catch (err) {
    res.status(500).json({ message: 'Google auth failed', error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = dbHelpers.findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, state: user.state, mobile: user.mobile, picture: user.picture });
});

app.post('/api/scan/ml', authMiddleware, async (req, res) => {
  try {
    const { imageBase64, cropType } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Image required' });
    if (!CROP_HEALTH_KEY) return res.status(503).json({ message: 'ML API key not configured. Add CROP_HEALTH_API_KEY to environment.' });

    const payload = { images: [imageBase64], ...(cropType ? { crop: cropType } : {}) };

    const response = await fetch('https://crop.kindwise.com/api/v1/identification?details=treatment,description,symptoms,severity,spreading,wiki_url', {
      method: 'POST',
      headers: { 'Api-Key': CROP_HEALTH_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ message: 'ML API error', detail: err });
    }

    const data = await response.json();
    const cropSuggestions = data.result?.crop?.suggestions || [];
    const diseaseSuggestions = data.result?.disease?.suggestions || [];
    const topCrop = cropSuggestions[0];
    const topDisease = diseaseSuggestions[0];

    const normalised = {
      id: data.access_token || uuidv4(),
      source: 'ml',
      cropDetected: topCrop ? { name: topCrop.name, probability: topCrop.probability } : null,
      disease: topDisease ? {
        name: topDisease.name,
        probability: topDisease.probability,
        severity: topDisease.details?.severity || null,
        description: topDisease.details?.description || topDisease.details?.wiki_description?.value || '',
        symptoms: topDisease.details?.symptoms || '',
        spreading: topDisease.details?.spreading || '',
        treatment: topDisease.details?.treatment || {},
        wikiUrl: topDisease.details?.wiki_url || '',
        level: topDisease.probability > 0.7 ? 'High' : topDisease.probability > 0.4 ? 'Moderate' : 'Low',
      } : null,
      allDiseases: diseaseSuggestions.slice(0, 5).map(d => ({
        name: d.name,
        probability: d.probability,
        description: d.details?.description || '',
        treatment: d.details?.treatment || {},
      })),
      allCrops: cropSuggestions.slice(0, 3).map(c => ({ name: c.name, probability: c.probability })),
      isHealthy: data.result?.is_healthy?.binary ?? null,
      healthProbability: data.result?.is_healthy?.probability ?? null,
      scannedAt: new Date().toISOString(),
    };

    dbHelpers.insertScan({
      id: uuidv4(),
      user_id: req.user.id,
      crop_type: topCrop?.name || cropType || 'unknown',
      disease_json: null,
      ml_result_json: JSON.stringify(normalised),
      scanned_at: new Date().toISOString(),
    });
    res.json(normalised);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/scan', authMiddleware, (req, res) => {
  const { cropType, filename } = req.body;
  let key = 'tomato';
  const fn = (filename || cropType || '').toLowerCase();
  if (fn.includes('potato')) key = 'potato';
  else if (fn.includes('corn') || fn.includes('maize')) key = 'corn';
  else if (fn.includes('wheat')) key = 'wheat';
  else if (fn.includes('rice')) key = 'rice';
  else if (fn.includes('mango')) key = 'mango';
  else if (fn.includes('tomato')) key = 'tomato';
  const disease = DISEASE_DATA[key];
  dbHelpers.insertScan({
    id: uuidv4(),
    user_id: req.user.id,
    crop_type: key,
    disease_json: JSON.stringify(disease),
    ml_result_json: null,
    scanned_at: new Date().toISOString(),
  });
  res.json({ id: uuidv4(), userId: req.user.id, cropType: key, disease, scannedAt: new Date().toISOString() });
});

app.get('/api/scans', authMiddleware, (req, res) => {
  const rows = dbHelpers.getUserScans(req.user.id);
  const scans = rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    cropType: r.crop_type,
    disease: r.disease_json ? JSON.parse(r.disease_json) : null,
    mlResult: r.ml_result_json ? JSON.parse(r.ml_result_json) : null,
    scannedAt: r.scanned_at,
  }));
  res.json(scans);
});

app.get('/api/weather', authMiddleware, async (req, res) => {
  try {
    let lat = parseFloat(req.query.lat);
    let lon = parseFloat(req.query.lon);
    let cityName = null;

    if (!lat || !lon) {
      const city = req.query.city || 'Ludhiana';
      const geo = await fetchGeocode(city);
      lat = geo.lat;
      lon = geo.lon;
      cityName = `${geo.name}, ${geo.country}`;
    }

    const weather = await fetchOpenMeteo(lat, lon);

    if (!cityName) {
      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      cityName = await new Promise(resolve => {
        https.get(reverseUrl, { headers: { 'User-Agent': 'AgriAssist/1.0' } }, (r) => {
          let d = '';
          r.on('data', c => { d += c; });
          r.on('end', () => {
            try {
              const j = JSON.parse(d);
              const addr = j.address;
              const place = addr.city || addr.town || addr.village || addr.county || 'Your Location';
              const state = addr.state || '';
              resolve(state ? `${place}, ${state}` : place);
            } catch { resolve('Your Location'); }
          });
        }).on('error', () => resolve('Your Location'));
      });
    }

    weather.city = cityName;
    res.json(weather);
  } catch {
    res.json(WEATHER_FALLBACK);
  }
});

app.get('/api/stores', authMiddleware, (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;
  res.json(generateDynamicStores(lat, lng));
});
app.get('/api/tips', authMiddleware, (req, res) => res.json(TIPS));
app.get('/api/diseases', (req, res) => res.json(DISEASE_DATA));

app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));
app.get('/', (req, res) => res.json({ status: 'AgriAssist API running', version: '1.0.0' }));

app.listen(PORT, () => {
  console.log(`\n🌿 AgriAssist Backend running on http://localhost:${PORT}`);
  console.log(`📧 Demo login: rajesh@farm.com / farmer123`);
  console.log(`🌤️  Weather API: Live (Open-Meteo, no key needed)`);
  console.log(`🤖 ML API: ${CROP_HEALTH_KEY ? 'Active (crop.health)' : 'Demo mode'}`);
  console.log(`🔐 Google OAuth: ${GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}\n`);
});
