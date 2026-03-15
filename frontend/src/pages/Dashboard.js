import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

const card = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }
});

const CROPS = [
  { name: 'Wheat', area: 'Field A · 5 acres', emoji: '🌾', health: 85, color: '#27ae60', status: 'Good' },
  { name: 'Tomato', area: 'Field B · 2 acres', emoji: '🍅', health: 62, color: '#f39c12', status: 'Watch' },
  { name: 'Potato', area: 'Field C · 3 acres', emoji: '🥔', health: 38, color: '#e74c3c', status: 'Alert' },
  { name: 'Rice', area: 'Field D · 4 acres', emoji: '🌾', health: 91, color: '#27ae60', status: 'Good' },
];

export default function Dashboard() {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [tips, setTips] = useState([]);
  const [scans, setScans] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/weather`).then(r => setWeather(r.data)).catch(() => {});
    axios.get(`${API}/api/tips`).then(r => setTips(r.data)).catch(() => {});
    axios.get(`${API}/api/scans`).then(r => setScans(r.data)).catch(() => {});
    axios.get(`${API}/api/stores`).then(r => setStores(r.data.slice(0, 3))).catch(() => {});
  }, [API]);

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AppLayout title="Dashboard" subtitle={dateStr}>
      {/* Welcome Banner */}
      <motion.div {...card(0)} className="bg-gradient-to-r from-agri-2 to-agri-1 rounded-2xl p-5 mb-5 flex items-center justify-between overflow-hidden relative">
        <div className="absolute top-[-30px] right-[100px] w-40 h-40 rounded-full bg-white/5" />
        <div className="z-10">
          <p className="text-white/60 text-xs font-bold tracking-wider mb-1">GOOD MORNING</p>
          <h2 className="font-head text-xl md:text-2xl font-bold text-white mb-1">
            {user?.name?.split(' ')[0] || 'Farmer'} 👋
          </h2>
          <p className="text-white/70 text-sm mb-4">2 crops need attention today. Check alerts below.</p>
          <button onClick={() => navigate('/scanner')}
            className="bg-white text-agri-2 font-bold px-5 py-2 rounded-full text-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            🔬 Scan Crop Now
          </button>
        </div>
        <div className="hidden sm:block text-6xl opacity-25 select-none">🌾</div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: '🔬', bg: '#e8f7ec', num: scans.length || 14, label: 'Total Scans' },
          { icon: '🌾', bg: '#fef9e7', num: 4, label: 'Active Crops' },
          { icon: '⚠️', bg: '#fef2f2', num: 2, label: 'Alerts Today' },
          { icon: '💊', bg: '#e8f4fd', num: 7, label: 'Treatments' },
        ].map((s, i) => (
          <motion.div key={i} {...card(0.05 * i)}
            className="bg-white rounded-xl border border-agri-7 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <div className="font-head text-xl font-bold text-gray-900">{s.num}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weather Widget */}
        <motion.div {...card(0.1)} className="bg-gradient-to-br from-[#1a5c7a] to-[#2980b9] rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs opacity-60 font-bold tracking-wider mb-1">
                {weather?.city || 'Ludhiana, Punjab'}
              </div>
              <div className="font-head text-4xl font-bold">{weather?.temp || 28}°C</div>
              <div className="text-sm opacity-80 mt-1">{weather?.condition || 'Partly Cloudy'} · Feels {weather?.feels || 31}°C</div>
            </div>
            <div className="text-5xl">{weather?.icon || '⛅'}</div>
          </div>
          <div className="flex gap-5 flex-wrap mb-4">
            {[
              { v: `${weather?.humidity || 72}%`, l: 'Humidity' },
              { v: `${weather?.wind || 8}km/h`, l: 'Wind' },
              { v: `${weather?.rainfall || 3}mm`, l: 'Rain' },
              { v: `UV ${weather?.uv || 6}`, l: 'UV Index' },
            ].map(w => (
              <div key={w.l}><div className="font-bold text-sm">{w.v}</div><div className="text-xs opacity-60">{w.l}</div></div>
            ))}
          </div>
          {weather?.alert && (
            <div className="bg-white/15 rounded-xl p-3 text-xs flex gap-2">
              <span>⚠️</span><span>{weather.alert}</span>
            </div>
          )}
          {/* Forecast */}
          {weather?.forecast && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {weather.forecast.map(f => (
                <div key={f.day} className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-[10px] opacity-60 mb-1">{f.day}</div>
                  <div className="text-base">{f.icon}</div>
                  <div className="text-xs font-bold">{f.high}°</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Crop Health */}
        <motion.div {...card(0.15)} className="bg-white rounded-2xl border border-agri-7 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">🌾 Crop Health Monitor</h3>
            <button onClick={() => navigate('/scanner')} className="text-xs font-bold text-agri-3 bg-agri-8 px-3 py-1.5 rounded-full hover:bg-agri-7 transition-colors">+ Scan</button>
          </div>
          <div className="space-y-3">
            {CROPS.map((c, i) => (
              <motion.div key={i} {...card(0.18 + i * 0.05)}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${c.health < 50 ? 'bg-red-50 border border-red-100' : 'hover:bg-agri-8'}`}>
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'Good' ? 'bg-agri-7 text-agri-1' :
                      c.status === 'Watch' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-600'}`}>{c.status}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1.5">{c.area}</div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${c.health}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full" style={{ background: c.color }} />
                  </div>
                </div>
                <span className="text-xs font-bold" style={{ color: c.color }}>{c.health}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Scans */}
        <motion.div {...card(0.2)} className="bg-white rounded-2xl border border-agri-7 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">🔬 Recent Scans</h3>
            <button onClick={() => navigate('/scanner')} className="text-xs font-bold text-agri-3 bg-agri-8 px-3 py-1.5 rounded-full hover:bg-agri-7 transition-colors">Scan Now</button>
          </div>
          {scans.length > 0 ? (
            <div className="space-y-2">
              {scans.slice(0,4).map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-agri-7 hover:bg-agri-8 transition-colors">
                  <span className="text-2xl">
                    {s.cropType === 'tomato' ? '🍅' : s.cropType === 'potato' ? '🥔' : s.cropType === 'corn' ? '🌽' : s.cropType === 'mango' ? '🥭' : '🌾'}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{s.disease.name}</div>
                    <div className="text-xs text-gray-400">{new Date(s.scannedAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    s.disease.level === 'Critical' ? 'bg-red-100 text-red-600' :
                    s.disease.level === 'High' ? 'bg-orange-100 text-orange-600' :
                    s.disease.level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'}`}>{s.disease.level}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { e: '🍅', n: 'Tomato Early Blight', d: 'Today, 10:30 AM', l: 'High', lc: 'orange' },
                { e: '🥔', n: 'Potato Late Blight', d: '2 days ago', l: 'Critical', lc: 'red' },
                { e: '🌽', n: 'Corn Southern Rust', d: '1 week ago', l: 'Moderate', lc: 'yellow' },
                { e: '🌾', n: 'Wheat — Healthy', d: '2 weeks ago', l: 'Healthy', lc: 'green' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-agri-7">
                  <span className="text-2xl">{s.e}</span>
                  <div className="flex-1"><div className="text-sm font-semibold">{s.n}</div><div className="text-xs text-gray-400">{s.d}</div></div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${s.lc}-100 text-${s.lc}-700`}>{s.l}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Nearby Stores */}
        <motion.div {...card(0.25)} className="bg-white rounded-2xl border border-agri-7 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">📍 Nearby Stores</h3>
            <button onClick={() => navigate('/stores')} className="text-xs font-bold text-agri-3 bg-agri-8 px-3 py-1.5 rounded-full hover:bg-agri-7 transition-colors">View Map</button>
          </div>
          <div className="space-y-3">
            {(stores.length ? stores : [
              { name: 'Kisan Agri Store', type: 'fertilizer', rating: 4.9, distance: '0.8 km', open: true },
              { name: 'Punjab Pesticides Hub', type: 'pesticide', rating: 4.3, distance: '1.3 km', open: true },
              { name: 'Agri Center Punjab', type: 'center', rating: 4.8, distance: '2.1 km', open: false },
            ]).map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-agri-8 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#e8f7ec' }}>
                  {s.type === 'fertilizer' ? '🌿' : s.type === 'pesticide' ? '🧪' : s.type === 'organic' ? '🌱' : '🏛️'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                  <div className="text-xs text-yellow-500">{'★'.repeat(Math.round(s.rating))} <span className="text-gray-400">{s.rating} · {s.distance}</span></div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.open ? 'bg-agri-7 text-agri-1' : 'bg-gray-100 text-gray-500'}`}>
                  {s.open ? 'Open' : 'Closed'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div {...card(0.3)} className="bg-white rounded-2xl border border-agri-7 p-5 lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-4">💡 Daily Farming Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(tips.length ? tips.slice(0,3) : [
              { icon: '💧', title: 'Irrigation Timing', body: 'Water fields between 5–7 AM to reduce evaporation and minimize fungal risk.' },
              { icon: '🌡️', title: 'Heat Alert', body: '35°C expected this weekend. Use shade nets for tomato and pepper crops.' },
              { icon: '🐛', title: 'Pest Watch', body: 'Aphid season active. Check leaf undersides, apply neem oil if needed.' },
            ]).map((t, i) => (
              <div key={i} className="flex gap-3 p-3 bg-agri-8 rounded-xl">
                <span className="text-xl flex-shrink-0 mt-0.5">{t.icon}</span>
                <div><div className="text-sm font-bold text-gray-900 mb-1">{t.title}</div><div className="text-xs text-gray-500 leading-relaxed">{t.body}</div></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
