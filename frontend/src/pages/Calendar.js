import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/AppLayout';

const card = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay: d, ease: [0.22, 1, 0.36, 1] } });

const CROPS = [
  {
    name: 'Wheat', emoji: '🌾', season: 'Rabi', color: '#f39c12',
    sowing: 'Oct 15 – Nov 15', harvest: 'Mar 15 – Apr 15',
    duration: '120–150 days', water: 'Medium (4–6 irrigations)',
    states: ['Punjab', 'Haryana', 'UP', 'MP', 'Rajasthan'],
    months: { sow: [10, 11], grow: [11, 12, 1, 2, 3], harvest: [3, 4] },
    tasks: [
      { month: 'Oct', task: 'Field preparation, soil testing, seed treatment' },
      { month: 'Nov', task: 'Sowing, basal fertilizer (DAP + Urea)' },
      { month: 'Dec', task: 'First irrigation, weed management' },
      { month: 'Jan', task: 'Second irrigation, top dressing urea' },
      { month: 'Feb', task: 'Monitor for yellow rust, third irrigation' },
      { month: 'Mar', task: 'Stop irrigation, monitor for aphids' },
      { month: 'Apr', task: 'Harvesting when grain is hard' },
    ],
  },
  {
    name: 'Rice', emoji: '🍚', season: 'Kharif', color: '#27ae60',
    sowing: 'Jun 15 – Jul 15', harvest: 'Oct 1 – Nov 15',
    duration: '100–150 days', water: 'High (flooded fields)',
    states: ['WB', 'UP', 'Punjab', 'Odisha', 'Bihar'],
    months: { sow: [6, 7], grow: [7, 8, 9, 10], harvest: [10, 11] },
    tasks: [
      { month: 'May', task: 'Nursery preparation, seed soaking' },
      { month: 'Jun', task: 'Transplanting seedlings, field flooding' },
      { month: 'Jul', task: 'Weed management, first top dressing' },
      { month: 'Aug', task: 'Monitor for blast disease, second top dressing' },
      { month: 'Sep', task: 'Drain field 2 weeks before harvest' },
      { month: 'Oct', task: 'Harvesting when 80% grains are golden' },
    ],
  },
  {
    name: 'Tomato', emoji: '🍅', season: 'Rabi/Kharif', color: '#e74c3c',
    sowing: 'Sep – Oct (Rabi), Jun – Jul (Kharif)', harvest: 'Dec – Feb (Rabi)',
    duration: '60–80 days after transplant', water: 'Medium (drip preferred)',
    states: ['Maharashtra', 'Karnataka', 'AP', 'MP', 'UP'],
    months: { sow: [9, 10], grow: [10, 11, 12], harvest: [12, 1, 2] },
    tasks: [
      { month: 'Sep', task: 'Nursery preparation, seed sowing in trays' },
      { month: 'Oct', task: 'Transplanting 25-day seedlings, staking' },
      { month: 'Nov', task: 'Fertigation, monitor for early blight' },
      { month: 'Dec', task: 'First harvest, apply fungicide if needed' },
      { month: 'Jan', task: 'Peak harvest, monitor for fruit borer' },
      { month: 'Feb', task: 'Final harvest, field clearing' },
    ],
  },
  {
    name: 'Potato', emoji: '🥔', season: 'Rabi', color: '#8B5E0A',
    sowing: 'Oct 15 – Nov 15', harvest: 'Jan 15 – Feb 28',
    duration: '70–90 days', water: 'Medium (6–8 irrigations)',
    states: ['UP', 'WB', 'Punjab', 'Bihar', 'Gujarat'],
    months: { sow: [10, 11], grow: [11, 12, 1], harvest: [1, 2] },
    tasks: [
      { month: 'Oct', task: 'Seed tuber selection, cut and treat with fungicide' },
      { month: 'Nov', task: 'Planting, basal fertilizer application' },
      { month: 'Dec', task: 'Earthing up, first irrigation, weed control' },
      { month: 'Jan', task: 'Monitor for late blight, second earthing up' },
      { month: 'Feb', task: 'Haulm cutting 10 days before harvest' },
      { month: 'Mar', task: 'Harvesting, grading, cold storage' },
    ],
  },
  {
    name: 'Soybean', emoji: '🫘', season: 'Kharif', color: '#6c3483',
    sowing: 'Jun 20 – Jul 10', harvest: 'Sep 20 – Oct 20',
    duration: '90–110 days', water: 'Low (rainfed mostly)',
    states: ['MP', 'Maharashtra', 'Rajasthan', 'Karnataka'],
    months: { sow: [6, 7], grow: [7, 8, 9], harvest: [9, 10] },
    tasks: [
      { month: 'Jun', task: 'Seed treatment with Rhizobium, field preparation' },
      { month: 'Jul', task: 'Sowing at 45cm row spacing, weed management' },
      { month: 'Aug', task: 'Monitor for stem fly, apply insecticide if needed' },
      { month: 'Sep', task: 'Stop irrigation at pod filling stage' },
      { month: 'Oct', task: 'Harvest when 95% pods turn brown' },
    ],
  },
  {
    name: 'Cotton', emoji: '🌿', season: 'Kharif', color: '#1a5c7a',
    sowing: 'Apr 15 – May 31', harvest: 'Oct – Jan',
    duration: '150–180 days', water: 'Medium (6–8 irrigations)',
    states: ['Gujarat', 'Maharashtra', 'Telangana', 'Punjab', 'Haryana'],
    months: { sow: [4, 5], grow: [6, 7, 8, 9, 10], harvest: [10, 11, 12, 1] },
    tasks: [
      { month: 'Apr', task: 'Deep ploughing, soil preparation, Bt seed selection' },
      { month: 'May', task: 'Sowing, basal fertilizer, drip installation' },
      { month: 'Jun', task: 'Gap filling, weed management' },
      { month: 'Jul', task: 'First top dressing, monitor for bollworm' },
      { month: 'Aug', task: 'Second top dressing, spray for whitefly' },
      { month: 'Sep', task: 'Defoliation if needed, stop irrigation' },
      { month: 'Oct', task: 'First picking of open bolls' },
    ],
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_MONTH = new Date().getMonth() + 1;

export default function Calendar() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? CROPS : CROPS.filter(c => c.season.includes(filter));

  return (
    <AppLayout title="Crop Calendar" subtitle="Sowing & harvest schedule · Task planner · Season guide">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Season Filter */}
        <motion.div {...card(0)} className="bg-white rounded-2xl border border-agri-7 p-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-600">Filter by Season:</span>
          {['All', 'Rabi', 'Kharif'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === s ? 'bg-agri-2 text-white' : 'bg-agri-8 text-gray-600 hover:bg-agri-7 border border-agri-6'}`}>
              {s === 'Rabi' ? '❄️ Rabi (Winter)' : s === 'Kharif' ? '☀️ Kharif (Monsoon)' : '🌾 All Crops'}
            </button>
          ))}
          <div className="ml-auto text-xs text-gray-400 bg-agri-8 px-3 py-1.5 rounded-full border border-agri-6">
            📅 Current Month: <strong className="text-agri-2">{MONTHS[CURRENT_MONTH - 1]}</strong>
          </div>
        </motion.div>

        {/* Annual Calendar Grid */}
        <motion.div {...card(0.05)} className="bg-white rounded-2xl border border-agri-7 p-5 overflow-x-auto">
          <h3 className="font-bold text-gray-900 mb-4">📊 Annual Crop Calendar</h3>
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left text-xs font-bold text-gray-500 pb-3 pr-4 w-28">Crop</th>
                {MONTHS.map((m, i) => (
                  <th key={m} className={`text-center text-xs font-bold pb-3 px-1 ${i + 1 === CURRENT_MONTH ? 'text-agri-2' : 'text-gray-400'}`}>
                    {m}
                    {i + 1 === CURRENT_MONTH && <div className="w-1 h-1 bg-agri-3 rounded-full mx-auto mt-0.5" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((crop, ci) => (
                <motion.tr key={crop.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.06 }}
                  onClick={() => setSelected(selected?.name === crop.name ? null : crop)}
                  className={`cursor-pointer transition-colors ${selected?.name === crop.name ? 'bg-agri-8' : 'hover:bg-agri-8/50'}`}>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{crop.emoji}</span>
                      <span className="text-sm font-semibold text-gray-900">{crop.name}</span>
                    </div>
                  </td>
                  {MONTHS.map((m, mi) => {
                    const monthNum = mi + 1;
                    const isSow = crop.months.sow.includes(monthNum);
                    const isGrow = crop.months.grow.includes(monthNum);
                    const isHarvest = crop.months.harvest.includes(monthNum);
                    const isCurrent = monthNum === CURRENT_MONTH;
                    return (
                      <td key={m} className={`py-2 px-0.5 ${isCurrent ? 'relative' : ''}`}>
                        {isCurrent && <div className="absolute inset-0 bg-agri-7/40 rounded" />}
                        {isSow && (
                          <div className="relative z-10 h-5 rounded text-center text-[9px] font-bold text-white flex items-center justify-center" style={{ background: crop.color }}>
                            SOW
                          </div>
                        )}
                        {isGrow && !isSow && !isHarvest && (
                          <div className="relative z-10 h-5 rounded text-center" style={{ background: crop.color + '40', border: `1px solid ${crop.color}60` }} />
                        )}
                        {isHarvest && (
                          <div className="relative z-10 h-5 rounded text-center text-[9px] font-bold flex items-center justify-center" style={{ background: crop.color + '20', border: `2px solid ${crop.color}`, color: crop.color }}>
                            ✂
                          </div>
                        )}
                        {!isSow && !isGrow && !isHarvest && <div className="h-5" />}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-4 mt-4 text-xs text-gray-500 flex-wrap">
            <div className="flex items-center gap-1.5"><div className="w-8 h-3 rounded bg-agri-2" /><span>Sowing</span></div>
            <div className="flex items-center gap-1.5"><div className="w-8 h-3 rounded bg-agri-5" /><span>Growing</span></div>
            <div className="flex items-center gap-1.5"><div className="w-8 h-3 rounded border-2 border-agri-3" /><span>Harvest</span></div>
          </div>
        </motion.div>

        {/* Crop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((crop, i) => (
            <motion.div key={crop.name} {...card(0.1 + i * 0.06)}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
              onClick={() => setSelected(selected?.name === crop.name ? null : crop)}
              className={`bg-white rounded-2xl border-2 cursor-pointer transition-all p-4 ${selected?.name === crop.name ? 'border-agri-3' : 'border-agri-7 hover:border-agri-5'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{crop.emoji}</span>
                  <div>
                    <div className="font-bold text-gray-900">{crop.name}</div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: crop.color }}>{crop.season}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between"><span className="text-gray-400">Sowing</span><span className="font-semibold">{crop.sowing.split(',')[0]}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Harvest</span><span className="font-semibold">{crop.harvest.split(',')[0]}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="font-semibold">{crop.duration}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Water</span><span className="font-semibold">{crop.water.split('(')[0].trim()}</span></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Crop Detail */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl border-2 p-5" style={{ borderColor: selected.color }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selected.emoji}</span>
                  <div>
                    <h3 className="font-head text-xl font-bold text-gray-900">{selected.name} — Monthly Task Guide</h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {selected.states.map(s => <span key={s} className="text-xs bg-agri-8 text-agri-2 font-semibold px-2 py-0.5 rounded-full border border-agri-6">{s}</span>)}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selected.tasks.map((t, i) => {
                  const monthIdx = MONTHS.indexOf(t.month);
                  const isCurrent = monthIdx + 1 === CURRENT_MONTH;
                  return (
                    <motion.div key={t.month} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                      className={`p-3 rounded-xl border-2 ${isCurrent ? 'border-agri-3 bg-agri-8' : 'border-agri-7'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: selected.color }}>{t.month}</span>
                        {isCurrent && <span className="text-xs font-bold text-agri-3">← Now</span>}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{t.task}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
