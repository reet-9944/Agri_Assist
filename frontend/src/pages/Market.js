import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/AppLayout';

const card = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay: d, ease: [0.22, 1, 0.36, 1] } });

const MARKET_DATA = [
  { crop: 'Wheat', emoji: '🌾', category: 'Cereal', price: 2275, prev: 2224, msp: 2275, unit: 'Quintal', markets: ['Ludhiana', 'Amritsar', 'Karnal'], trend: [2100, 2150, 2180, 2224, 2275], desc: 'Rabi crop. Major producer states: Punjab, Haryana, UP.' },
  { crop: 'Rice (Paddy)', emoji: '🍚', category: 'Cereal', price: 2183, prev: 2200, msp: 2183, unit: 'Quintal', markets: ['Karnal', 'Patna', 'Cuttack'], trend: [2050, 2100, 2150, 2200, 2183], desc: 'Kharif crop. Major producer states: WB, UP, Punjab.' },
  { crop: 'Maize', emoji: '🌽', category: 'Cereal', price: 2090, prev: 2065, msp: 2090, unit: 'Quintal', markets: ['Davangere', 'Gulbarga', 'Nizamabad'], trend: [1900, 1950, 2000, 2065, 2090], desc: 'Kharif crop. Used for feed, starch and ethanol.' },
  { crop: 'Tomato', emoji: '🍅', category: 'Vegetable', price: 1840, prev: 1636, msp: null, unit: 'Quintal', markets: ['Nashik', 'Kolar', 'Madanapalle'], trend: [800, 1100, 1400, 1636, 1840], desc: 'High price volatility. Peak season: Oct–Feb.' },
  { crop: 'Potato', emoji: '🥔', category: 'Vegetable', price: 1200, prev: 1238, msp: null, unit: 'Quintal', markets: ['Agra', 'Farrukhabad', 'Jalandhar'], trend: [900, 1050, 1150, 1238, 1200], desc: 'Rabi crop. Cold storage availability affects prices.' },
  { crop: 'Onion', emoji: '🧅', category: 'Vegetable', price: 2100, prev: 1990, msp: null, unit: 'Quintal', markets: ['Lasalgaon', 'Pimpalgaon', 'Solapur'], trend: [1200, 1500, 1700, 1990, 2100], desc: 'Highly volatile. Export policy impacts domestic prices.' },
  { crop: 'Soybean', emoji: '🫘', category: 'Oilseed', price: 4600, prev: 4550, msp: 4600, unit: 'Quintal', markets: ['Indore', 'Ujjain', 'Latur'], trend: [4200, 4300, 4450, 4550, 4600], desc: 'Kharif oilseed. Used for oil and animal feed.' },
  { crop: 'Mustard', emoji: '🌼', category: 'Oilseed', price: 5650, prev: 5450, msp: 5650, unit: 'Quintal', markets: ['Alwar', 'Bharatpur', 'Agra'], trend: [5000, 5150, 5300, 5450, 5650], desc: 'Rabi oilseed. Major producer: Rajasthan, UP, Haryana.' },
  { crop: 'Cotton', emoji: '🌿', category: 'Fiber', price: 6620, prev: 6500, msp: 6620, unit: 'Quintal', markets: ['Akola', 'Amravati', 'Guntur'], trend: [6000, 6150, 6300, 6500, 6620], desc: 'Kharif crop. India is world\'s largest cotton producer.' },
  { crop: 'Sugarcane', emoji: '🎋', category: 'Cash Crop', price: 315, prev: 305, msp: 315, unit: '100 kg', markets: ['Muzaffarnagar', 'Meerut', 'Kolhapur'], trend: [280, 290, 300, 305, 315], desc: 'SAP (State Advised Price) set by state governments.' },
  { crop: 'Chana (Gram)', emoji: '🟡', category: 'Pulse', price: 5440, prev: 5300, msp: 5440, unit: 'Quintal', markets: ['Indore', 'Bikaner', 'Gulbarga'], trend: [4800, 4950, 5100, 5300, 5440], desc: 'Rabi pulse. India is world\'s largest producer.' },
  { crop: 'Tur (Arhar)', emoji: '🟤', category: 'Pulse', price: 7000, prev: 6800, msp: 7000, unit: 'Quintal', markets: ['Gulbarga', 'Latur', 'Akola'], trend: [6000, 6200, 6500, 6800, 7000], desc: 'Kharif pulse. Deficit production keeps prices high.' },
];

const CATEGORIES = ['All', 'Cereal', 'Vegetable', 'Oilseed', 'Pulse', 'Fiber', 'Cash Crop'];

const MiniChart = ({ trend, color }) => {
  const max = Math.max(...trend), min = Math.min(...trend);
  const pts = trend.map((v, i) => {
    const x = (i / (trend.length - 1)) * 100;
    const y = 100 - ((v - min) / (max - min || 1)) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-16 h-8" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function Market() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [lastUpdated] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

  const filtered = MARKET_DATA.filter(m => {
    const matchCat = category === 'All' || m.category === category;
    const matchSearch = m.crop.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AppLayout title="Market Prices" subtitle="Live mandi rates · MSP reference · Price trends">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '📊', label: 'Crops Tracked', value: MARKET_DATA.length, bg: '#e8f7ec' },
            { icon: '📈', label: 'Rising Today', value: MARKET_DATA.filter(m => m.price > m.prev).length, bg: '#e8f7ec' },
            { icon: '📉', label: 'Falling Today', value: MARKET_DATA.filter(m => m.price < m.prev).length, bg: '#fef2f2' },
            { icon: '🏛️', label: 'MSP Protected', value: MARKET_DATA.filter(m => m.msp).length, bg: '#e8f4fd' },
          ].map((s, i) => (
            <motion.div key={s.label} {...card(i * 0.05)} className="bg-white rounded-xl border border-agri-7 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: s.bg }}>{s.icon}</div>
              <div>
                <div className="font-head text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div {...card(0.1)} className="bg-white rounded-2xl border border-agri-7 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="🔍 Search crop..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 border border-agri-6 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-agri-3 bg-agri-8"
            />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${category === c ? 'bg-agri-2 text-white' : 'bg-agri-8 text-gray-600 hover:bg-agri-7 border border-agri-6'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">Last updated: {lastUpdated} · Prices in ₹ per {filtered[0]?.unit || 'Quintal'}</div>
        </motion.div>

        {/* Price Table */}
        <motion.div {...card(0.15)} className="bg-white rounded-2xl border border-agri-7 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-agri-8 border-b border-agri-7">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Change</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">MSP</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">7-Day Trend</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const change = m.price - m.prev;
                  const changePct = ((change / m.prev) * 100).toFixed(1);
                  const isUp = change >= 0;
                  return (
                    <motion.tr
                      key={m.crop}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(selected?.crop === m.crop ? null : m)}
                      className={`border-b border-agri-7 cursor-pointer transition-colors ${selected?.crop === m.crop ? 'bg-agri-8' : 'hover:bg-agri-8/50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{m.emoji}</span>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{m.crop}</div>
                            <div className="text-xs text-gray-400">{m.markets[0]} mandi</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-head font-bold text-gray-900">₹{m.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">/{m.unit}</div>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <div className={`font-bold text-sm ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                          {isUp ? '▲' : '▼'} ₹{Math.abs(change)}
                        </div>
                        <div className={`text-xs ${isUp ? 'text-green-500' : 'text-red-400'}`}>{isUp ? '+' : ''}{changePct}%</div>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        {m.msp ? (
                          <div>
                            <div className="text-sm font-semibold text-agri-2">₹{m.msp.toLocaleString()}</div>
                            <div className={`text-xs font-bold ${m.price >= m.msp ? 'text-green-600' : 'text-red-500'}`}>
                              {m.price >= m.msp ? '✓ Above MSP' : '⚠ Below MSP'}
                            </div>
                          </div>
                        ) : <span className="text-xs text-gray-400">No MSP</span>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex justify-center">
                          <MiniChart trend={m.trend} color={isUp ? '#27ae60' : '#e74c3c'} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="text-xs font-semibold bg-agri-8 text-agri-2 px-2 py-1 rounded-full border border-agri-6">{m.category}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Selected Crop Detail */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl border-2 border-agri-3 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selected.emoji}</span>
                  <div>
                    <h3 className="font-head text-xl font-bold text-gray-900">{selected.crop}</h3>
                    <span className="text-xs bg-agri-7 text-agri-2 font-bold px-2 py-0.5 rounded-full">{selected.category}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <p className="text-sm text-gray-600">{selected.desc}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-agri-8 rounded-xl p-3">
                      <div className="text-xs text-gray-400 mb-1">Today's Price</div>
                      <div className="font-head text-2xl font-bold text-agri-2">₹{selected.price.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">per {selected.unit}</div>
                    </div>
                    <div className="bg-agri-8 rounded-xl p-3">
                      <div className="text-xs text-gray-400 mb-1">Yesterday</div>
                      <div className="font-head text-2xl font-bold text-gray-700">₹{selected.prev.toLocaleString()}</div>
                      <div className={`text-xs font-bold ${selected.price >= selected.prev ? 'text-green-600' : 'text-red-500'}`}>
                        {selected.price >= selected.prev ? '▲' : '▼'} ₹{Math.abs(selected.price - selected.prev)} ({(((selected.price - selected.prev) / selected.prev) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 mb-2">ACTIVE MARKETS</div>
                    <div className="flex gap-2 flex-wrap">
                      {selected.markets.map(m => (
                        <span key={m} className="bg-agri-7 text-agri-2 text-xs font-semibold px-3 py-1 rounded-full">📍 {m}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-2">PRICE TREND (5 DAYS)</div>
                  <div className="bg-agri-8 rounded-xl p-3 h-24 flex items-end">
                    <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
                      {selected.trend.map((v, i) => {
                        const max = Math.max(...selected.trend), min = Math.min(...selected.trend);
                        const x = (i / (selected.trend.length - 1)) * 100;
                        const y = 60 - ((v - min) / (max - min || 1)) * 55;
                        return i === 0 ? null : (
                          <line key={i}
                            x1={(i - 1) / (selected.trend.length - 1) * 100} y1={60 - ((selected.trend[i - 1] - min) / (max - min || 1)) * 55}
                            x2={x} y2={y}
                            stroke={selected.price >= selected.prev ? '#27ae60' : '#e74c3c'} strokeWidth="2.5" strokeLinecap="round"
                          />
                        );
                      })}
                      {selected.trend.map((v, i) => {
                        const max = Math.max(...selected.trend), min = Math.min(...selected.trend);
                        const x = (i / (selected.trend.length - 1)) * 100;
                        const y = 60 - ((v - min) / (max - min || 1)) * 55;
                        return <circle key={i} cx={x} cy={y} r="2.5" fill={selected.price >= selected.prev ? '#27ae60' : '#e74c3c'} />;
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div {...card(0.3)} className="bg-gradient-to-r from-agri-8 to-white rounded-2xl border border-agri-7 p-4">
          <p className="text-xs text-gray-400 text-center">
            ⚠️ Prices are indicative reference rates based on recent mandi data. Actual prices may vary by location and quality. Always verify with your local mandi before selling.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
