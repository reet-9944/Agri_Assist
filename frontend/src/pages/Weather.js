import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

const card = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay: d, ease: [0.22, 1, 0.36, 1] } });

const AGRI_CITIES = [
  { name: 'Ludhiana', state: 'Punjab' },
  { name: 'Amritsar', state: 'Punjab' },
  { name: 'Chandigarh', state: 'Haryana' },
  { name: 'Karnal', state: 'Haryana' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Agra', state: 'Uttar Pradesh' },
  { name: 'Pune', state: 'Maharashtra' },
  { name: 'Nashik', state: 'Maharashtra' },
  { name: 'Jaipur', state: 'Rajasthan' },
  { name: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Patna', state: 'Bihar' },
  { name: 'Bhopal', state: 'Madhya Pradesh' },
];

const CROP_RISK = (weather) => {
  if (!weather) return [];
  const h = weather.humidity, t = weather.temp, r = weather.rainfall;
  return [
    { crop: 'Tomato', emoji: '🍅', risk: h > 70 ? 'High' : h > 55 ? 'Moderate' : 'Low', reason: h > 70 ? 'High humidity favors blight' : 'Conditions normal' },
    { crop: 'Wheat', emoji: '🌾', risk: t < 15 ? 'High' : t < 20 ? 'Moderate' : 'Low', reason: t < 15 ? 'Cool temps favor rust' : 'Temperature normal' },
    { crop: 'Potato', emoji: '🥔', risk: h > 75 && r > 5 ? 'Critical' : h > 65 ? 'High' : 'Low', reason: h > 75 ? 'Late blight conditions' : 'Conditions normal' },
    { crop: 'Rice', emoji: '🌾', risk: h > 80 ? 'High' : 'Low', reason: h > 80 ? 'Blast disease risk elevated' : 'Conditions normal' },
    { crop: 'Mango', emoji: '🥭', risk: r > 10 ? 'Moderate' : 'Low', reason: r > 10 ? 'Anthracnose risk in wet weather' : 'Conditions normal' },
    { crop: 'Cotton', emoji: '🌿', risk: t > 38 ? 'High' : 'Low', reason: t > 38 ? 'Heat stress risk' : 'Conditions normal' },
  ];
};

const RISK_COLOR = { Critical: '#c0392b', High: '#e74c3c', Moderate: '#e67e22', Low: '#27ae60' };
const RISK_BG = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Moderate: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700' };

export default function Weather() {
  const { API } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle');

  const headers = { Authorization: `Bearer ${localStorage.getItem('agri_token')}` };

  const loadByCoords = (lat, lon) => {
    setLocationStatus('granted');
    setLoading(true);
    axios.get(`${API}/api/weather?lat=${lat}&lon=${lon}`, { headers })
      .then(r => { setWeather(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const loadByCity = (city) => {
    setLoading(true);
    setSelectedCity(city);
    axios.get(`${API}/api/weather?city=${encodeURIComponent(city)}`, { headers })
      .then(r => { setWeather(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions?.query({ name: 'geolocation' }).then(r => {
        if (r.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            pos => loadByCoords(pos.coords.latitude, pos.coords.longitude),
            () => loadByCity('Ludhiana')
          );
        } else {
          setLocationStatus('denied');
          loadByCity('Ludhiana');
        }
      }).catch(() => loadByCity('Ludhiana'));
    } else {
      loadByCity('Ludhiana');
    }
  }, []);

  const retryLocation = () => {
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      pos => loadByCoords(pos.coords.latitude, pos.coords.longitude),
      () => setLocationStatus('denied'),
      { timeout: 8000 }
    );
  };

  const cropRisks = CROP_RISK(weather);

  return (
    <AppLayout title="Weather & Disease Risk" subtitle="Live weather · Crop risk analysis">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* City Selector */}
        <motion.div {...card(0)} className="bg-white rounded-2xl border border-agri-7 p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-600 mr-1">📍 Select Region:</span>
            {locationStatus !== 'granted' && (
              <button onClick={retryLocation} className="px-3 py-1.5 rounded-full text-xs font-bold bg-agri-2 text-white hover:bg-agri-1 transition-colors">
                {locationStatus === 'requesting' ? '⏳ Locating...' : '📍 Use My Location'}
              </button>
            )}
            {AGRI_CITIES.map(c => (
              <button key={c.name} onClick={() => loadByCity(c.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCity === c.name ? 'bg-agri-2 text-white' : 'bg-agri-8 text-gray-600 hover:bg-agri-7 border border-agri-6'}`}>
                {c.name}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-5xl mb-4">🌤️</motion.div>
              <div className="text-agri-2 font-semibold">Fetching live weather...</div>
            </div>
          </div>
        ) : weather ? (
          <>
            {/* Main Weather Card */}
            <motion.div {...card(0.05)} className="bg-gradient-to-br from-[#1a5c7a] via-[#1e6e8f] to-[#2980b9] rounded-2xl p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/4 translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/60 text-sm font-bold">{weather.city}</span>
                      {weather.source === 'live' && <span className="bg-green-400/30 text-green-200 text-[10px] font-bold px-2 py-0.5 rounded-full">● LIVE</span>}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, type: 'spring' }}
                      className="font-head text-7xl font-black mb-1"
                    >{weather.temp}°C</motion.div>
                    <div className="text-white/70 text-lg">{weather.condition}</div>
                    <div className="text-white/50 text-sm mt-1">Feels like {weather.feels}°C</div>
                  </div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-8xl"
                  >{weather.icon}</motion.div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: '💧', label: 'Humidity', value: `${weather.humidity}%` },
                    { icon: '💨', label: 'Wind Speed', value: `${weather.wind} km/h` },
                    { icon: '🌧️', label: 'Rainfall', value: `${weather.rainfall} mm` },
                    { icon: '☀️', label: 'UV Index', value: `${weather.uv} / 11` },
                  ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                      className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="font-bold text-base">{s.value}</div>
                      <div className="text-white/50 text-xs">{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                {weather.alert && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl p-3 flex gap-2 text-sm mb-4">
                    <span>⚠️</span><span>{weather.alert}</span>
                  </motion.div>
                )}

                {weather.forecast && (
                  <div>
                    <div className="text-white/50 text-xs font-bold tracking-wider mb-3">4-DAY FORECAST</div>
                    <div className="grid grid-cols-4 gap-3">
                      {weather.forecast.map((f, i) => (
                        <motion.div key={f.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                          className="bg-white/10 rounded-xl p-3 text-center">
                          <div className="text-xs text-white/60 mb-1">{f.day}</div>
                          <div className="text-2xl my-1">{f.icon}</div>
                          <div className="font-bold text-sm">{f.high}°</div>
                          <div className="text-white/40 text-xs">{f.low}°</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Crop Disease Risk */}
            <motion.div {...card(0.15)} className="bg-white rounded-2xl border border-agri-7 p-5">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg">🦠 Crop Disease Risk Analysis</h3>
                <p className="text-xs text-gray-400 mt-0.5">Risk levels calculated from current temperature, humidity and rainfall</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cropRisks.map((r, i) => (
                  <motion.div key={r.crop} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.07 }}
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                    className="p-4 rounded-xl border-2 transition-all"
                    style={{ borderColor: RISK_COLOR[r.risk] + '40', background: RISK_COLOR[r.risk] + '08' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{r.emoji}</span>
                        <span className="font-bold text-gray-900">{r.crop}</span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${RISK_BG[r.risk]}`}>{r.risk}</span>
                    </div>
                    <p className="text-xs text-gray-500">{r.reason}</p>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: r.risk === 'Critical' ? '100%' : r.risk === 'High' ? '75%' : r.risk === 'Moderate' ? '50%' : '20%' }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                        className="h-full rounded-full" style={{ background: RISK_COLOR[r.risk] }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Farming Advisory */}
            <motion.div {...card(0.25)} className="bg-white rounded-2xl border border-agri-7 p-5">
              <h3 className="font-bold text-gray-900 mb-4">🌾 Today's Farming Advisory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: weather.humidity > 70 ? '⚠️' : '✅', title: 'Irrigation', body: weather.humidity > 70 ? 'Skip irrigation today — humidity is high. Risk of fungal disease if soil stays wet.' : `Good day to irrigate. Humidity at ${weather.humidity}% is manageable.`, color: weather.humidity > 70 ? '#e67e22' : '#27ae60' },
                  { icon: weather.temp > 35 ? '🌡️' : '✅', title: 'Field Work', body: weather.temp > 35 ? `Avoid heavy field work between 11AM–4PM. Temperature is ${weather.temp}°C.` : `Good conditions for field work. Temperature at ${weather.temp}°C is comfortable.`, color: weather.temp > 35 ? '#e74c3c' : '#27ae60' },
                  { icon: weather.wind > 20 ? '💨' : '✅', title: 'Spraying', body: weather.wind > 20 ? `Avoid pesticide spraying. Wind speed ${weather.wind}km/h will cause drift.` : `Good conditions for spraying. Wind at ${weather.wind}km/h is acceptable.`, color: weather.wind > 20 ? '#e74c3c' : '#27ae60' },
                  { icon: weather.rainfall > 5 ? '🌧️' : '✅', title: 'Harvesting', body: weather.rainfall > 5 ? `Delay harvesting if possible. ${weather.rainfall}mm rainfall expected — crops may be wet.` : 'Good conditions for harvesting. No significant rainfall expected.', color: weather.rainfall > 5 ? '#e67e22' : '#27ae60' },
                ].map((a, i) => (
                  <motion.div key={a.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex gap-3 p-4 rounded-xl border" style={{ borderColor: a.color + '30', background: a.color + '08' }}>
                    <span className="text-2xl flex-shrink-0">{a.icon}</span>
                    <div>
                      <div className="font-bold text-gray-900 text-sm mb-1">{a.title}</div>
                      <div className="text-xs text-gray-600 leading-relaxed">{a.body}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">Failed to load weather data. Try selecting a city above.</div>
        )}
      </div>
    </AppLayout>
  );
}
