import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

const card = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

const CROP_EMOJI = { tomato: '🍅', potato: '🥔', corn: '🌽', mango: '🥭', wheat: '🌾', rice: '🌾', apple: '🍎', banana: '🍌', citrus: '🍊', soybean: '🫘', cotton: '🌿', sugarcane: '🎋' };

const MARKET_PRICES = [
  { crop: 'Wheat', emoji: '🌾', price: 2275, unit: '/qtl', change: +2.3, msp: 2275 },
  { crop: 'Rice', emoji: '🍚', price: 2183, unit: '/qtl', change: -0.8, msp: 2183 },
  { crop: 'Tomato', emoji: '🍅', price: 1840, unit: '/qtl', change: +12.4, msp: null },
  { crop: 'Potato', emoji: '🥔', price: 1200, unit: '/qtl', change: -3.1, msp: null },
  { crop: 'Onion', emoji: '🧅', price: 2100, unit: '/qtl', change: +5.6, msp: null },
  { crop: 'Maize', emoji: '🌽', price: 2090, unit: '/qtl', change: +1.2, msp: 2090 },
];

const SEASONAL_TASKS = [
  { month: 'May', tasks: ['Harvest Rabi crops', 'Prepare Kharif fields', 'Soil testing'], done: [true, false, false] },
  { month: 'Jun', tasks: ['Sow Kharif crops', 'Apply basal fertilizer', 'Set up irrigation'], done: [false, false, false] },
  { month: 'Jul', tasks: ['Monitor monsoon pests', 'Top dressing urea', 'Weed management'], done: [false, false, false] },
];

const DISEASE_RISK_FACTORS = (weather) => {
  if (!weather) return [];
  const risks = [];
  if (weather.humidity > 70) risks.push({ name: 'Fungal Blight', level: 'High', color: '#e74c3c', icon: '🍄', tip: 'Apply preventive fungicide spray' });
  else if (weather.humidity > 55) risks.push({ name: 'Fungal Blight', level: 'Moderate', color: '#e67e22', icon: '🍄', tip: 'Monitor crops closely' });
  if (weather.temp > 35) risks.push({ name: 'Heat Stress', level: 'High', color: '#e74c3c', icon: '🌡️', tip: 'Irrigate early morning, use shade nets' });
  if (weather.rainfall > 5) risks.push({ name: 'Root Rot', level: 'Moderate', color: '#e67e22', icon: '💧', tip: 'Ensure proper field drainage' });
  if (weather.wind > 20) risks.push({ name: 'Pest Spread', level: 'Moderate', color: '#e67e22', icon: '🐛', tip: 'Inspect crops for aphids and whitefly' });
  if (risks.length === 0) risks.push({ name: 'Low Disease Risk', level: 'Low', color: '#27ae60', icon: '✅', tip: 'Conditions are favorable for crops' });
  return risks;
};

export default function Dashboard() {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [tips, setTips] = useState([]);
  const [scans, setScans] = useState([]);
  const [stores, setStores] = useState([]);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [activeMarketCrop, setActiveMarketCrop] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('agri_token')}` };

    const loadWeatherByCoords = (lat, lon) => {
      setLocationStatus('granted');
      axios.get(`${API}/api/weather?lat=${lat}&lon=${lon}`, { headers })
        .then(r => setWeather(r.data))
        .catch(() => {});
    };

    const loadWeatherByCity = () => {
      setLocationStatus('denied');
      axios.get(`${API}/api/weather?city=Ludhiana`, { headers })
        .then(r => setWeather(r.data))
        .catch(() => {});
    };

    const requestLocation = () => {
      setLocationStatus('requesting');
      const timeout = setTimeout(loadWeatherByCity, 8000);
      navigator.geolocation.getCurrentPosition(
        pos => {
          clearTimeout(timeout);
          loadWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          clearTimeout(timeout);
          loadWeatherByCity();
        },
        { timeout: 8000, maximumAge: 300000 }
      );
    };

    if (navigator.geolocation) {
      navigator.permissions?.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            pos => loadWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            loadWeatherByCity
          );
        } else if (result.state === 'prompt') {
          requestLocation();
        } else {
          loadWeatherByCity();
        }
      }).catch(requestLocation);
    } else {
      loadWeatherByCity();
    }

    axios.get(`${API}/api/tips`, { headers }).then(r => setTips(r.data)).catch(() => {});
    axios.get(`${API}/api/scans`, { headers }).then(r => setScans(r.data)).catch(() => {});
    axios.get(`${API}/api/stores`, { headers }).then(r => setStores(r.data.slice(0, 3))).catch(() => {});
  }, [API]);

  const retryLocation = () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('agri_token')}` };
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocationStatus('granted');
        axios.get(`${API}/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`, { headers })
          .then(r => setWeather(r.data)).catch(() => {});
      },
      () => setLocationStatus('denied'),
      { timeout: 8000 }
    );
  };

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const timeStr = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const diseaseRisks = DISEASE_RISK_FACTORS(weather);

  const uniqueCropsMap = {};
  let alertsCount = 0;
  let treatmentsCount = 0;

  scans.forEach(s => {
    const cType = (s.cropType || 'unknown').toLowerCase();
    
    if (s.disease?.treatments || s.mlResult?.disease?.treatment) {
      treatmentsCount++;
    }

    if (!uniqueCropsMap[cType]) {
      const isHealthy = s.mlResult?.isHealthy === true;
      let diseaseSeverity = s.disease?.severity || s.mlResult?.disease?.severity || (s.mlResult?.disease?.probability * 100) || 0;
      
      const isGood = isHealthy || (!s.disease && !s.mlResult?.disease) || diseaseSeverity < 30;
      const healthNum = isHealthy ? 95 : (100 - (diseaseSeverity || 0));
      
      const realStatus = isGood ? 'Good' : (healthNum > 50 ? 'Watch' : 'Alert');
      if (realStatus === 'Alert') alertsCount++;

      uniqueCropsMap[cType] = {
        name: cType.charAt(0).toUpperCase() + cType.slice(1),
        area: 'Recently Scanned',
        emoji: CROP_EMOJI[cType] || '🌿',
        health: Math.max(0, Math.min(100, Math.round(healthNum))),
        color: isGood ? '#27ae60' : (healthNum > 50 ? '#f39c12' : '#e74c3c'),
        status: realStatus
      };
    }
  });

  const dynamicCrops = Object.values(uniqueCropsMap);

  return (
    <AppLayout title="Dashboard" subtitle={dateStr}>

      <motion.div {...card(0)} className="bg-gradient-to-r from-agri-2 to-agri-1 rounded-2xl p-5 mb-5 overflow-hidden relative">
        <div className="absolute top-[-30px] right-[80px] w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-[-20px] right-[-10px] w-32 h-32 rounded-full bg-white/4" />
        <div className="flex items-center justify-between">
          <div className="z-10">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-white/60 text-xs font-bold tracking-wider">{greeting.toUpperCase()}</p>
              <span className="text-white/40 text-xs">·</span>
              <p className="text-white/60 text-xs font-bold">{timeStr}</p>
            </div>
            <h2 className="font-head text-xl md:text-2xl font-bold text-white mb-1">
              {user?.name?.split(' ')[0] || 'Farmer'} 👋
            </h2>
            <p className="text-white/70 text-sm mb-4">
              {alertsCount > 0 ? `${alertsCount} crop${alertsCount > 1 ? 's' : ''} need attention today.` : 'All monitored crops are healthy today.'}
            </p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => navigate('/scanner')} className="bg-white text-agri-2 font-bold px-5 py-2 rounded-full text-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                🔬 Scan Crop
              </button>
              <button onClick={() => navigate('/stores')} className="bg-white/15 border border-white/30 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-white/25 transition-all">
                🏪 Find Store
              </button>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1 opacity-20 select-none">
            <div className="text-6xl">🌾</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: '🔬', bg: '#e8f7ec', num: scans.length, label: 'Total Scans', sub: 'all time' },
          { icon: '🌾', bg: '#fef9e7', num: dynamicCrops.length, label: 'Active Crops', sub: 'monitored' },
          { icon: '⚠️', bg: '#fef2f2', num: alertsCount, label: 'Alerts', sub: 'need action' },
          { icon: '💊', bg: '#e8f4fd', num: treatmentsCount, label: 'Treatments', sub: 'applied' },
        ].map((s, i) => (
          <motion.div key={i} {...card(0.05 + i * 0.04)} className="bg-white rounded-xl border border-agri-7 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.05, type: 'spring' }}
                className="font-head text-2xl font-bold text-gray-900"
              >{s.num}</motion.div>
              <div className="text-xs font-semibold text-gray-600">{s.label}</div>
              <div className="text-[10px] text-gray-400">{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <motion.div {...card(0.1)} className="lg:col-span-2 bg-gradient-to-br from-[#1a5c7a] to-[#2980b9] rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs opacity-60 font-bold tracking-wider mb-1 flex items-center gap-2 flex-wrap">
                <span>{weather?.city || 'Loading location...'}</span>
                {weather?.source === 'live' && <span className="bg-white/20 text-white/80 text-[9px] font-bold px-2 py-0.5 rounded-full">LIVE</span>}
                {locationStatus === 'denied' && (
                  <button onClick={retryLocation} className="bg-white/20 hover:bg-white/30 text-white/80 text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors">
                    📍 Use My Location
                  </button>
                )}
                {locationStatus === 'requesting' && <span className="bg-white/20 text-white/80 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">📍 Locating...</span>}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-head text-5xl font-bold"
              >{weather?.temp ?? '--'}°C</motion.div>
              <div className="text-sm opacity-80 mt-1">{weather?.condition || '...'} · Feels {weather?.feels ?? '--'}°C</div>
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl"
            >{weather?.icon || '🌡️'}</motion.div>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { v: `${weather?.humidity ?? '--'}%`, l: 'Humidity', i: '💧' },
              { v: `${weather?.wind ?? '--'}km/h`, l: 'Wind', i: '💨' },
              { v: `${weather?.rainfall ?? '--'}mm`, l: 'Rain', i: '🌧️' },
              { v: `UV ${weather?.uv ?? '--'}`, l: 'UV Index', i: '☀️' },
            ].map(w => (
              <div key={w.l} className="bg-white/10 rounded-xl p-2.5 text-center">
                <div className="text-base mb-1">{w.i}</div>
                <div className="font-bold text-sm">{w.v}</div>
                <div className="text-[10px] opacity-60">{w.l}</div>
              </div>
            ))}
          </div>
          {weather?.alert && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-yellow-400/20 border border-yellow-400/30 rounded-xl p-3 text-xs flex gap-2 mb-4"
            >
              <span>⚠️</span><span>{weather.alert}</span>
            </motion.div>
          )}
          {weather?.forecast && (
            <div className="grid grid-cols-4 gap-2">
              {weather.forecast.map((f, i) => (
                <motion.div
                  key={f.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="bg-white/10 rounded-xl p-2 text-center"
                >
                  <div className="text-[10px] opacity-60 mb-1">{f.day}</div>
                  <div className="text-lg">{f.icon}</div>
                  <div className="text-xs font-bold">{f.high}°</div>
                  <div className="text-[10px] opacity-50">{f.low}°</div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...card(0.15)} className="bg-white rounded-2xl border border-agri-7 p-5">
          <h3 className="font-bold text-gray-900 mb-1">🦠 Disease Risk Index</h3>
          <p className="text-xs text-gray-400 mb-4">Based on current weather conditions</p>
          <div className="space-y-3">
            {diseaseRisks.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-3 rounded-xl border"
                style={{ borderColor: r.color + '40', background: r.color + '10' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.icon}</span>
                    <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: r.color }}>
                    {r.level}
                  </span>
                </div>
                <p className="text-xs text-gray-500 ml-7">{r.tip}</p>
              </motion.div>
            ))}
          </div>
          {!weather && <div className="text-center py-4 text-xs text-gray-400 animate-pulse">Loading weather data...</div>}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <motion.div {...card(0.2)} className="bg-white rounded-2xl border border-agri-7 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-900">🌾 Crop Health Monitor</h3>
              <p className="text-xs text-gray-400">Based on your scan history</p>
            </div>
            <button onClick={() => navigate('/scanner')} className="text-xs font-bold text-agri-3 bg-agri-8 px-3 py-1.5 rounded-full hover:bg-agri-7 transition-colors">+ Scan</button>
          </div>
          <div className="space-y-3">
            {dynamicCrops.length > 0 ? dynamicCrops.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${c.health < 50 ? 'bg-red-50 border border-red-100' : 'hover:bg-agri-8 border border-transparent'}`}
              >
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.status === 'Good' ? 'bg-agri-7 text-agri-1' : c.status === 'Watch' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>{c.status}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{c.area}</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.health}%` }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${c.color}99, ${c.color})` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold min-w-[36px] text-right" style={{ color: c.color }}>{c.health}%</span>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-agri-6 rounded-xl">
                <div className="text-4xl mb-2">🌱</div>
                <div className="text-sm font-semibold text-gray-600 mb-1">No crops monitored yet</div>
                <div className="text-xs text-gray-400 mb-3">Scan a crop to track its health here</div>
                <button onClick={() => navigate('/scanner')} className="bg-agri-2 text-white text-xs font-bold px-4 py-2 rounded-full">Start Scanning</button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div {...card(0.22)} className="bg-white rounded-2xl border border-agri-7 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-900">🔬 Recent Scans</h3>
              <p className="text-xs text-gray-400">{scans.length} scan{scans.length !== 1 ? 's' : ''} total</p>
            </div>
            <button onClick={() => navigate('/scanner')} className="text-xs font-bold text-agri-3 bg-agri-8 px-3 py-1.5 rounded-full hover:bg-agri-7 transition-colors">Scan Now</button>
          </div>
          {scans.length > 0 ? (
            <div className="space-y-2">
              {scans.slice(0, 5).map((s, i) => {
                const level = s.disease?.level || s.mlResult?.disease?.level;
                const name = s.disease?.name || s.mlResult?.disease?.name || 'Scan Result';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-agri-7 hover:bg-agri-8 hover:border-agri-5 transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-agri-8 flex items-center justify-center text-xl flex-shrink-0">
                      {CROP_EMOJI[s.cropType?.toLowerCase()] || '🌿'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
                      <div className="text-xs text-gray-400">{new Date(s.scannedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${level === 'Critical' ? 'bg-red-100 text-red-600' : level === 'High' ? 'bg-orange-100 text-orange-600' : level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{level || 'Done'}</span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-3">🔬</motion.div>
              <div className="text-sm font-semibold text-gray-700 mb-1">No scans yet</div>
              <div className="text-xs text-gray-400 mb-4">Upload a crop photo to detect diseases instantly</div>
              <button onClick={() => navigate('/scanner')} className="bg-gradient-to-r from-agri-3 to-agri-1 text-white text-xs font-bold px-5 py-2.5 rounded-full hover:shadow-lg transition-all">
                🔬 Start First Scan
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div {...card(0.28)} className="bg-white rounded-2xl border border-agri-7 p-5 mb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-gray-900">📈 Today's Market Prices</h3>
            <p className="text-xs text-gray-400">Mandi rates · Updated daily · MSP reference included</p>
          </div>
          <span className="text-xs bg-agri-7 text-agri-2 font-bold px-3 py-1 rounded-full">₹/Quintal</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MARKET_PRICES.map((m, i) => (
            <motion.div
              key={m.crop}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(20,90,44,0.12)' }}
              onClick={() => setActiveMarketCrop(activeMarketCrop === m.crop ? null : m.crop)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${activeMarketCrop === m.crop ? 'border-agri-3 bg-agri-8' : 'border-agri-7 hover:border-agri-5'}`}
            >
              <div className="text-2xl mb-1">{m.emoji}</div>
              <div className="text-xs font-bold text-gray-700 mb-1">{m.crop}</div>
              <div className="font-head text-base font-bold text-gray-900">₹{m.price.toLocaleString()}</div>
              <div className={`text-xs font-bold flex items-center gap-0.5 mt-1 ${m.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                <span>{m.change >= 0 ? '▲' : '▼'}</span>
                <span>{Math.abs(m.change)}%</span>
              </div>
              {m.msp && <div className="text-[10px] text-agri-3 font-semibold mt-1">MSP ✓</div>}
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {activeMarketCrop && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-agri-8 rounded-xl text-xs text-gray-600 border border-agri-6"
            >
              {(() => {
                const m = MARKET_PRICES.find(x => x.crop === activeMarketCrop);
                return <span>📊 <strong>{m.crop}</strong> is trading at <strong>₹{m.price}/qtl</strong> today ({m.change >= 0 ? '+' : ''}{m.change}% vs yesterday).{m.msp ? ` Government MSP is ₹${m.msp}/qtl.` : ' No MSP applicable.'}</span>;
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <motion.div {...card(0.32)} className="bg-white rounded-2xl border border-agri-7 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-900">📍 Nearby Agri Stores</h3>
              <p className="text-xs text-gray-400">Fertilizer, pesticide and organic stores</p>
            </div>
            <button onClick={() => navigate('/stores')} className="text-xs font-bold text-agri-3 bg-agri-8 px-3 py-1.5 rounded-full hover:bg-agri-7 transition-colors">View Map</button>
          </div>
          <div className="space-y-2">
            {(stores.length ? stores : [
              { name: 'Kisan Agri Store', type: 'fertilizer', rating: 4.9, distance: '0.8 km', open: true },
              { name: 'Punjab Pesticides Hub', type: 'pesticide', rating: 4.3, distance: '1.3 km', open: true },
              { name: 'Agri Center Punjab', type: 'center', rating: 4.8, distance: '2.1 km', open: false },
            ]).map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                onClick={() => navigate('/stores')}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-agri-8 transition-all cursor-pointer border border-transparent hover:border-agri-6"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-agri-8">
                  {s.type === 'fertilizer' ? '🌿' : s.type === 'pesticide' ? '🧪' : s.type === 'organic' ? '🌱' : '🏛️'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-yellow-500">{'★'.repeat(Math.round(s.rating || 4))}</span>
                    <span className="text-gray-400">{s.rating} · {s.distance}</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${s.open ? 'bg-agri-7 text-agri-1' : 'bg-gray-100 text-gray-500'}`}>
                  {s.open ? 'Open' : 'Closed'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...card(0.34)} className="bg-white rounded-2xl border border-agri-7 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-900">📅 Seasonal Calendar</h3>
              <p className="text-xs text-gray-400">Upcoming farm tasks this season</p>
            </div>
            <span className="text-xs bg-yellow-50 text-yellow-700 font-bold px-3 py-1 rounded-full">Kharif Season</span>
          </div>
          <div className="space-y-3">
            {SEASONAL_TASKS.map((month, mi) => (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + mi * 0.1 }}
                className="border border-agri-7 rounded-xl overflow-hidden"
              >
                <div className="bg-agri-8 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-agri-2">{month.month} 2025</span>
                  <span className="text-[10px] text-gray-400">{month.tasks.filter((_, i) => month.done[i]).length}/{month.tasks.length} done</span>
                </div>
                <div className="p-2 space-y-1">
                  {month.tasks.map((task, ti) => (
                    <div key={ti} className="flex items-center gap-2 text-xs py-1">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${month.done[ti] ? 'bg-agri-3' : 'border-2 border-gray-200'}`}>
                        {month.done[ti] && <span className="text-white text-[8px]">✓</span>}
                      </div>
                      <span className={month.done[ti] ? 'text-gray-400 line-through' : 'text-gray-700'}>{task}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div {...card(0.38)} className="bg-white rounded-2xl border border-agri-7 p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-gray-900">💡 Daily Farming Tips</h3>
            <p className="text-xs text-gray-400">Personalized for your region and season</p>
          </div>
          <span className="text-xs bg-agri-7 text-agri-2 font-bold px-3 py-1 rounded-full">Today</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(tips.length ? tips : [
            { icon: '💧', title: 'Irrigation Timing', body: 'Water fields between 5–7 AM to reduce evaporation and minimize fungal risk.' },
            { icon: '🌡️', title: 'Heat Alert', body: 'High temps expected. Use shade nets for tomato and pepper crops.' },
            { icon: '🐛', title: 'Pest Watch', body: 'Aphid season active. Check leaf undersides, apply neem oil if needed.' },
            { icon: '🌱', title: 'Soil Health', body: 'Add organic compost before next sowing to improve nitrogen levels.' },
            { icon: '📅', title: 'Sowing Window', body: 'Ideal Kharif sowing window opens soon. Prepare fields and source seeds.' },
          ]).map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y: -3 }}
              className="flex flex-col gap-2 p-3 bg-agri-8 rounded-xl border border-agri-7 hover:border-agri-5 transition-all"
            >
              <span className="text-2xl">{t.icon}</span>
              <div className="text-sm font-bold text-gray-900">{t.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{t.body}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </AppLayout>
  );
}
