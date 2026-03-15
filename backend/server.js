const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim();
  });
}

const app = express();
const PORT = 5000;
const JWT_SECRET = 'agriassist_secret_2025';

app.use(cors());
app.use(express.json());

// ── IN-MEMORY STORE (localhost data) ──
const db = {
  users: [],
  scans: [],
};

// ── SEED DEMO USER ──
(async () => {
  const hash = await bcrypt.hash('farmer123', 10);
  db.users.push({
    id: 'demo-001',
    name: 'Rajesh Singh',
    email: 'rajesh@farm.com',
    password: hash,
    role: 'farmer',
    state: 'Punjab',
    mobile: '+91 98765 43210',
    createdAt: new Date().toISOString(),
  });
})();

// ── MOCK DATA ──
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

const STORES = [
  { id: 1, name: 'Kisan Agri Store', type: 'fertilizer', lat: 30.9015, lng: 75.8573, rating: 4.9, distance: '0.8 km', open: true, stock: ['Mancozeb', 'DAP', 'Urea', 'Copper Oxy'], phone: '98765-00001' },
  { id: 2, name: 'Punjab Pesticides Hub', type: 'pesticide', lat: 30.9051, lng: 75.8612, rating: 4.3, distance: '1.3 km', open: true, stock: ['Ridomil', 'Propiconazole', 'Imidacloprid'], phone: '98765-00002' },
  { id: 3, name: 'Punjab Agricultural Center', type: 'center', lat: 30.8989, lng: 75.8540, rating: 4.8, distance: '2.1 km', open: false, stock: ['Free Soil Test', 'Expert Advice', 'Subsidies'], phone: '98765-00003' },
  { id: 4, name: 'Green Farm Organics', type: 'organic', lat: 30.9070, lng: 75.8490, rating: 4.5, distance: '3.2 km', open: true, stock: ['Neem Oil', 'Trichoderma', 'Bio-NPK'], phone: '98765-00004' },
  { id: 5, name: 'Agro Soil Testing Lab', type: 'lab', lat: 30.8950, lng: 75.8650, rating: 5.0, distance: '4.5 km', open: true, stock: ['NPK Analysis', 'pH Test', 'Heavy Metals'], phone: '98765-00005' },
];

const WEATHER = {
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
};

const TIPS = [
  { id: 1, icon: '💧', title: 'Irrigation Timing', body: 'Water fields between 5–7 AM to reduce evaporation and minimize fungal risk in high humidity.' },
  { id: 2, icon: '🌡️', title: 'Heat Alert', body: 'Temperatures above 35°C expected this weekend. Use shade nets for tomato and pepper crops.' },
  { id: 3, icon: '🐛', title: 'Pest Watch', body: 'Aphid season is active. Inspect undersides of leaves and apply neem oil spray if needed.' },
  { id: 4, icon: '🌱', title: 'Soil Health', body: 'Add organic compost before next sowing season to improve nitrogen levels and soil structure.' },
  { id: 5, icon: '📅', title: 'Sowing Schedule', body: 'Ideal window for Rabi crops opens in 3 weeks. Prepare fields and source certified seeds now.' },
];

// ── AUTH MIDDLEWARE ──
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ── AUTH ROUTES ──
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, state, mobile } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
    if (db.users.find(u => u.email === email)) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), name, email, password: hashed, role: role || 'farmer', state: state || 'Punjab', mobile: mobile || '', createdAt: new Date().toISOString() };
    db.users.push(user);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, state: user.state } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, state: user.state } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, state: user.state, mobile: user.mobile });
});

// ── SCAN ROUTES ──

// Real ML scan via crop.health (Kindwise) API
app.post('/api/scan/ml', authMiddleware, async (req, res) => {
  try {
    const { imageBase64, cropType } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Image required' });

    const CROP_HEALTH_KEY = process.env.CROP_HEALTH_API_KEY || '';

    if (!CROP_HEALTH_KEY) {
      return res.status(503).json({ message: 'ML API key not configured. Add CROP_HEALTH_API_KEY to environment.' });
    }

    const payload = {
      images: [imageBase64],
      ...(cropType ? { crop: cropType } : {}),
    };

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

    // Normalise response for frontend
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

    // Save to history
    const scan = { id: uuidv4(), userId: req.user.id, cropType: topCrop?.name || cropType || 'unknown', mlResult: normalised, scannedAt: new Date().toISOString() };
    db.scans.push(scan);

    res.json(normalised);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Fallback mock scan (keyword-based)
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
  const scan = { id: uuidv4(), userId: req.user.id, cropType: key, disease, scannedAt: new Date().toISOString() };
  db.scans.push(scan);
  res.json(scan);
});

app.get('/api/scans', authMiddleware, (req, res) => {
  const userScans = db.scans.filter(s => s.userId === req.user.id).reverse().slice(0, 20);
  res.json(userScans);
});

// ── DATA ROUTES ──
app.get('/api/stores', authMiddleware, (req, res) => res.json(STORES));
app.get('/api/weather', authMiddleware, (req, res) => res.json(WEATHER));
app.get('/api/tips', authMiddleware, (req, res) => res.json(TIPS));
app.get('/api/diseases', (req, res) => res.json(DISEASE_DATA));

app.get('/', (req, res) => res.json({ status: 'AgriAssist API running', version: '1.0.0' }));

app.listen(PORT, () => {
  console.log(`\n🌿 AgriAssist Backend running on http://localhost:${PORT}`);
  console.log('📧 Demo login: rajesh@farm.com / farmer123\n');
});
