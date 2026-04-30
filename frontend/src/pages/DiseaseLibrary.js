import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

const card = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay: d, ease: [0.22, 1, 0.36, 1] } });

const DISEASES = [
  {
    id: 1, name: 'Tomato Early Blight', crop: 'Tomato', emoji: '🍅', pathogen: 'Alternaria solani',
    type: 'Fungal', severity: 'High', color: '#e74c3c',
    symptoms: 'Brown concentric lesions with yellow halos on older leaves. Dark spots with target-board pattern.',
    conditions: 'Warm humid weather (24–29°C), high humidity above 70%.',
    spread: 'Wind, rain splash, infected plant debris, contaminated tools.',
    treatments: ['Apply Mancozeb 75% WP @ 2.5 g/litre every 7–10 days', 'Remove and destroy infected leaves immediately', 'Use drip irrigation — avoid wetting foliage', 'Apply Copper Oxychloride 50% WP as preventive'],
    pesticide: 'Mancozeb 75% WP (Indofil M-45)',
    prevention: 'Crop rotation, proper plant spacing, avoid overhead irrigation, use resistant varieties.',
    loss: '30–50% yield loss if untreated',
  },
  {
    id: 2, name: 'Potato Late Blight', crop: 'Potato', emoji: '🥔', pathogen: 'Phytophthora infestans',
    type: 'Oomycete', severity: 'Critical', color: '#c0392b',
    symptoms: 'Water-soaked lesions turning dark brown on leaves. White mold on leaf undersides. Tuber rot.',
    conditions: 'Cool wet weather (10–20°C), humidity above 90%, prolonged leaf wetness.',
    spread: 'Wind-borne spores, infected seed tubers, rain splash.',
    treatments: ['Apply Metalaxyl + Mancozeb (Ridomil) immediately', 'Spray Cymoxanil 8% + Mancozeb 64% every 5 days', 'Destroy all infected material — burn or bury', 'Consider early harvest if blight exceeds 30%'],
    pesticide: 'Ridomil Gold 68 WP (Metalaxyl + Mancozeb)',
    prevention: 'Use certified disease-free seed tubers, ensure field drainage, avoid overhead irrigation.',
    loss: 'Can destroy entire field within 10 days',
  },
  {
    id: 3, name: 'Wheat Yellow Rust', crop: 'Wheat', emoji: '🌾', pathogen: 'Puccinia striiformis',
    type: 'Fungal', severity: 'High', color: '#f39c12',
    symptoms: 'Yellow-orange pustules arranged in stripes along leaf veins. Leaves turn yellow and die.',
    conditions: 'Cool moist weather (10–15°C), high humidity, dew formation.',
    spread: 'Wind-borne urediniospores over long distances.',
    treatments: ['Apply Propiconazole 25% EC spray immediately', 'Use Tebuconazole 250 EC as alternative', 'Spray during early morning for best absorption', 'Report large outbreaks to district agri office'],
    pesticide: 'Propiconazole 25% EC (Tilt)',
    prevention: 'Use resistant varieties, timely fungicide spray at first sign, balanced fertilization.',
    loss: '40–70% yield loss without treatment',
  },
  {
    id: 4, name: 'Rice Blast', crop: 'Rice', emoji: '🍚', pathogen: 'Magnaporthe oryzae',
    type: 'Fungal', severity: 'Moderate', color: '#27ae60',
    symptoms: 'Diamond-shaped lesions with gray centers and brown borders on leaves. Neck rot causes panicle death.',
    conditions: 'High humidity (>90%), temperature 25–28°C, excess nitrogen.',
    spread: 'Wind-borne conidia, infected seeds, crop debris.',
    treatments: ['Apply Tricyclazole 75% WP @ 0.6 g/litre', 'Use Carbendazim 50% WP as alternative', 'Avoid excess nitrogen application', 'Ensure proper field drainage'],
    pesticide: 'Beam 75WP (Tricyclazole)',
    prevention: 'Balanced fertilization, avoid overcrowding, proper irrigation management.',
    loss: 'Neck blast causes 100% loss in affected panicles',
  },
  {
    id: 5, name: 'Corn Southern Rust', crop: 'Corn', emoji: '🌽', pathogen: 'Puccinia polysora',
    type: 'Fungal', severity: 'Moderate', color: '#e67e22',
    symptoms: 'Orange-red circular pustules on upper leaf surfaces. Leaves turn yellow and dry.',
    conditions: 'Warm humid weather (27–32°C), high humidity.',
    spread: 'Wind-borne urediniospores.',
    treatments: ['Apply Propiconazole 25% EC @ 1 mL/litre', 'Use Azoxystrobin + Propiconazole combined', 'Ensure adequate potassium fertilization', 'Scout fields twice weekly in humid weather'],
    pesticide: 'Tilt 250EC (Propiconazole)',
    prevention: 'Plant resistant hybrids, timely sowing, balanced fertilization.',
    loss: '20–40% grain yield reduction',
  },
  {
    id: 6, name: 'Mango Anthracnose', crop: 'Mango', emoji: '🥭', pathogen: 'Colletotrichum gloeosporioides',
    type: 'Fungal', severity: 'Low', color: '#3498db',
    symptoms: 'Dark irregular spots on leaves, flowers and fruits. Fruit rot during storage.',
    conditions: 'Wet season, high humidity during flowering and fruiting.',
    spread: 'Rain splash, wind, infected plant material.',
    treatments: ['Apply Copper Oxychloride 50% WP spray', 'Use Carbendazim 50% WP for fruit protection', 'Prune infected branches, destroy away from tree', 'Apply lime sulfur during dormant season'],
    pesticide: 'Copper Oxychloride 50% WP (Blitox)',
    prevention: 'Improve canopy ventilation through pruning, avoid overhead irrigation.',
    loss: 'Significant post-harvest losses',
  },
  {
    id: 7, name: 'Cotton Bollworm', crop: 'Cotton', emoji: '🌿', pathogen: 'Helicoverpa armigera',
    type: 'Insect', severity: 'Critical', color: '#8e44ad',
    symptoms: 'Circular holes in bolls, frass (excreta) visible. Larvae inside bolls feeding on seeds.',
    conditions: 'Temperature 25–30°C, dry weather favors adult moth activity.',
    spread: 'Adult moths fly and lay eggs on flower buds and young bolls.',
    treatments: ['Apply Emamectin Benzoate 5% SG @ 0.4 g/litre', 'Use Spinosad 45% SC @ 0.3 mL/litre', 'Install pheromone traps @ 5/acre for monitoring', 'Spray Chlorantraniliprole 18.5% SC @ 0.4 mL/litre'],
    pesticide: 'Emamectin Benzoate 5% SG (Proclaim)',
    prevention: 'Use Bt cotton varieties, install pheromone traps, avoid excess nitrogen.',
    loss: '50–80% boll damage if uncontrolled',
  },
  {
    id: 8, name: 'Aphid Infestation', crop: 'Multiple', emoji: '🐛', pathogen: 'Aphis gossypii / Myzus persicae',
    type: 'Insect', severity: 'Moderate', color: '#16a085',
    symptoms: 'Curled, yellowing leaves. Sticky honeydew on leaves. Sooty mold growth. Stunted growth.',
    conditions: 'Mild temperatures (15–25°C), dry weather, excess nitrogen.',
    spread: 'Winged adults fly to new plants. Ants carry aphids to new locations.',
    treatments: ['Apply Imidacloprid 17.8% SL @ 0.5 mL/litre', 'Use Thiamethoxam 25% WG @ 0.3 g/litre', 'Spray Neem oil 1500 ppm @ 5 mL/litre for organic control', 'Release Ladybird beetles as biological control'],
    pesticide: 'Imidacloprid 17.8% SL (Confidor)',
    prevention: 'Avoid excess nitrogen, use reflective mulches, encourage natural predators.',
    loss: '20–30% yield loss plus virus transmission',
  },
  {
    id: 9, name: 'Powdery Mildew', crop: 'Multiple', emoji: '🍇', pathogen: 'Erysiphe spp.',
    type: 'Fungal', severity: 'Moderate', color: '#7f8c8d',
    symptoms: 'White powdery coating on leaves, stems and fruits. Leaves curl and turn yellow.',
    conditions: 'Dry weather with high humidity at night, temperature 20–25°C.',
    spread: 'Wind-borne conidia, very rapid spread in favorable conditions.',
    treatments: ['Apply Sulphur 80% WP @ 3 g/litre', 'Use Hexaconazole 5% EC @ 2 mL/litre', 'Spray Potassium bicarbonate solution', 'Apply Neem oil as preventive spray'],
    pesticide: 'Sulphur 80% WP (Sulfex)',
    prevention: 'Proper plant spacing, avoid overhead irrigation, use resistant varieties.',
    loss: '10–40% yield loss depending on crop',
  },
  {
    id: 10, name: 'Root Rot', crop: 'Multiple', emoji: '🌱', pathogen: 'Pythium / Fusarium spp.',
    type: 'Fungal', severity: 'High', color: '#795548',
    symptoms: 'Wilting despite adequate water. Brown/black discoloration of roots. Plant collapse.',
    conditions: 'Waterlogged soil, poor drainage, high soil moisture, temperature 20–30°C.',
    spread: 'Soil-borne, water movement, infected transplants.',
    treatments: ['Drench soil with Metalaxyl 35% WS @ 2 g/litre', 'Apply Trichoderma viride @ 5 g/kg soil', 'Improve field drainage immediately', 'Remove and destroy severely infected plants'],
    pesticide: 'Metalaxyl 35% WS (Apron)',
    prevention: 'Ensure proper drainage, avoid overwatering, use raised beds, seed treatment.',
    loss: 'Complete crop loss in severely affected areas',
  },
  {
    id: 11, name: 'Bacterial Leaf Blight', crop: 'Rice', emoji: '🍃', pathogen: 'Xanthomonas oryzae',
    type: 'Bacterial', severity: 'High', color: '#e74c3c',
    symptoms: 'Water-soaked lesions on leaf margins turning yellow then white. Kresek (wilting) in seedlings.',
    conditions: 'High temperature (25–34°C), high humidity, flooding, wounds from storms.',
    spread: 'Water, wind, infected seeds, contaminated tools.',
    treatments: ['Apply Copper Oxychloride 50% WP @ 3 g/litre', 'Use Streptomycin Sulphate + Tetracycline', 'Drain fields and reduce nitrogen', 'Remove and destroy infected plants'],
    pesticide: 'Copper Oxychloride 50% WP + Streptomycin',
    prevention: 'Use resistant varieties, balanced fertilization, avoid flood irrigation.',
    loss: '20–30% yield loss, up to 75% in severe cases',
  },
  {
    id: 12, name: 'White Fly', crop: 'Multiple', emoji: '🦟', pathogen: 'Bemisia tabaci',
    type: 'Insect', severity: 'High', color: '#f1c40f',
    symptoms: 'Yellowing leaves, honeydew deposits, sooty mold. Transmits leaf curl virus in tomato/cotton.',
    conditions: 'Hot dry weather (30–35°C), water stress, dense planting.',
    spread: 'Adults fly between plants. Wind-assisted dispersal.',
    treatments: ['Apply Spiromesifen 22.9% SC @ 1 mL/litre', 'Use Yellow sticky traps @ 10/acre', 'Spray Neem oil 1500 ppm @ 5 mL/litre', 'Apply Pyriproxyfen 10% EC @ 1 mL/litre'],
    pesticide: 'Spiromesifen 22.9% SC (Oberon)',
    prevention: 'Use reflective mulches, install yellow sticky traps, avoid water stress.',
    loss: 'Direct feeding loss + virus transmission causes 50–80% loss',
  },
];

const SEVERITY_COLOR = { Critical: '#c0392b', High: '#e74c3c', Moderate: '#e67e22', Low: '#27ae60' };
const SEVERITY_BG = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Moderate: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-700' };
const TYPE_COLOR = { Fungal: '#8e44ad', Bacterial: '#e74c3c', Insect: '#e67e22', Oomycete: '#2980b9' };

export default function DiseaseLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = DISEASES.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.crop.toLowerCase().includes(search.toLowerCase()) || d.pathogen.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || d.type === typeFilter;
    const matchSev = severityFilter === 'All' || d.severity === severityFilter;
    return matchSearch && matchType && matchSev;
  });

  return (
    <AppLayout title="Disease Library" subtitle={`${DISEASES.length} diseases & pests · Treatment guides · Prevention tips`}>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Search & Filters */}
        <motion.div {...card(0)} className="bg-white rounded-2xl border border-agri-7 p-4 space-y-3">
          <input
            type="text"
            placeholder="🔍 Search by disease name, crop or pathogen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-agri-6 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agri-3 bg-agri-8"
          />
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-gray-500 self-center">Type:</span>
            {['All', 'Fungal', 'Bacterial', 'Insect', 'Oomycete'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${typeFilter === t ? 'bg-agri-2 text-white' : 'bg-agri-8 text-gray-600 hover:bg-agri-7 border border-agri-6'}`}>
                {t}
              </button>
            ))}
            <span className="text-xs font-semibold text-gray-500 self-center ml-2">Severity:</span>
            {['All', 'Critical', 'High', 'Moderate', 'Low'].map(s => (
              <button key={s} onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${severityFilter === s ? 'text-white' : 'bg-agri-8 text-gray-600 hover:bg-agri-7 border border-agri-6'}`}
                style={severityFilter === s ? { background: SEVERITY_COLOR[s] || '#1e7a3e' } : {}}>
                {s}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Diseases', value: DISEASES.length, icon: '🦠', bg: '#e8f7ec' },
            { label: 'Critical/High', value: DISEASES.filter(d => ['Critical', 'High'].includes(d.severity)).length, icon: '⚠️', bg: '#fef2f2' },
            { label: 'Fungal', value: DISEASES.filter(d => d.type === 'Fungal').length, icon: '🍄', bg: '#f3e5f5' },
            { label: 'Insect Pests', value: DISEASES.filter(d => d.type === 'Insect').length, icon: '🐛', bg: '#fff3e0' },
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

        {/* Disease Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => (
            <motion.div key={d.id} {...card(0.05 + i * 0.04)}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
              onClick={() => setSelected(selected?.id === d.id ? null : d)}
              className={`bg-white rounded-2xl border-2 cursor-pointer transition-all p-4 ${selected?.id === d.id ? 'border-agri-3 shadow-lg' : 'border-agri-7 hover:border-agri-5'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{d.emoji}</span>
                  <div>
                    <div className="font-bold text-gray-900 text-sm leading-tight">{d.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{d.crop}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${SEVERITY_BG[d.severity]}`}>{d.severity}</span>
              </div>
              <div className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{d.symptoms}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: TYPE_COLOR[d.type] || '#666' }}>{d.type}</span>
                <span className="text-xs text-agri-3 font-semibold italic">{d.pathogen}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <div className="text-gray-500 font-semibold">No diseases found</div>
            <div className="text-gray-400 text-sm mt-1">Try a different search term or filter</div>
          </div>
        )}

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl border-2 p-5" style={{ borderColor: selected.color }}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selected.emoji}</span>
                  <div>
                    <h3 className="font-head text-2xl font-bold text-gray-900">{selected.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: TYPE_COLOR[selected.type] || '#666' }}>{selected.type}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SEVERITY_BG[selected.severity]}`}>{selected.severity} Severity</span>
                      <span className="text-xs text-gray-400 italic">{selected.pathogen}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wider">🔍 Symptoms</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.symptoms}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="text-xs font-bold text-orange-600 mb-2 uppercase tracking-wider">🌡️ Favorable Conditions</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.conditions}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="text-xs font-bold text-yellow-700 mb-2 uppercase tracking-wider">💨 How It Spreads</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.spread}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-agri-8 rounded-xl border border-agri-6">
                    <div className="text-xs font-bold text-agri-2 mb-3 uppercase tracking-wider">💊 Treatment Plan</div>
                    <div className="space-y-2">
                      {selected.treatments.map((t, i) => (
                        <div key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-agri-3 font-bold flex-shrink-0">{i + 1}.</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-agri-6">
                      <div className="text-xs font-bold text-agri-2 mb-1">Recommended Product:</div>
                      <div className="text-sm font-semibold text-gray-800">{selected.pesticide}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wider">🛡️ Prevention</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.prevention}</p>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: selected.color + '10', borderColor: selected.color + '40' }}>
                    <div className="text-xs font-bold mb-1" style={{ color: selected.color }}>⚠️ Economic Impact</div>
                    <div className="text-sm font-semibold text-gray-800">{selected.loss}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button onClick={() => navigate('/scanner')}
                  className="bg-gradient-to-r from-agri-3 to-agri-1 text-white font-bold px-5 py-2.5 rounded-full text-sm hover:shadow-lg transition-all">
                  🔬 Scan My Crop for This Disease
                </button>
                <button onClick={() => navigate('/stores')}
                  className="bg-agri-8 text-agri-2 border border-agri-5 font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-agri-7 transition-all">
                  🏪 Find Treatment Products Nearby
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
