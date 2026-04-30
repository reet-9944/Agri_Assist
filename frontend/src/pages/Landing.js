import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fade = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: [0.22,1,0.36,1] } });

const FEATURES = [
  { icon: '🔬', title: 'AI Disease Detection', desc: 'Upload a photo or use your camera. Detect 120+ crop diseases in under 3 seconds with 96% accuracy.', tags: ['Real-time', '96% Accuracy', '120+ Diseases'] },
  { icon: '🗺️', title: 'Nearby Store Finder', desc: 'Find fertilizer shops, pesticide stores, and agri-centers near your farm with ratings and driving directions.' },
  { icon: '🌤️', title: 'Weather + Disease Risk', desc: 'Hyperlocal weather with AI-powered disease risk alerts. Know when fungal or pest outbreaks are likely.' },
  { icon: '🔊', title: 'Voice in Your Language', desc: 'Listen to disease reports in Hindi, Punjabi, Telugu, Tamil and 15 more Indian languages.' },
  { icon: '📊', title: 'Crop Health Dashboard', desc: 'Track health scores across all your fields. Monitor trends, view scan history, and see treatment outcomes.' },
  { icon: '💡', title: 'Expert Farming Tips', desc: 'Daily seasonal tips, irrigation schedules, and market price alerts tailored to your location and crops.' },
];

const STATS = [
  { num: '50K+', label: 'Active Farmers' },
  { num: '96.4%', label: 'Detection Accuracy' },
  { num: '120+', label: 'Diseases Covered' },
  { num: '<3sec', label: 'Avg Scan Time' },
];

const TESTI = [
  { q: 'Meri tomato ki fasal mein pehle bohot nuksan hota tha. AgriAssist ne sirf 2 second mein disease identify karke proper treatment bataya. Ab meri puri fasal safe hai!', name: 'Rajesh Singh', info: 'Wheat & Tomato Farmer · Ludhiana', av: 'RS', bg: '#2d7d46' },
  { q: 'The weather disease alerts saved my potato crop twice this monsoon. This app is a must-have for every farmer in India.', name: 'Priya Mehta', info: 'Potato Farmer · Agra, UP', av: 'PM', bg: '#1a5c7a' },
  { q: 'As an agriculture student, AgriAssist helped me understand real field diseases better than any textbook.', name: 'Arjun Kumar', info: 'BSc Agriculture · PAU Ludhiana', av: 'AK', bg: '#6c3483' },
];

export default function Landing() {
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      if (navRef.current) navRef.current.classList.toggle('bg-white/95', window.scrollY > 40);
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="font-body bg-[#f7faf4] overflow-x-hidden">
      {/* NAV */}
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
          <div className="flex items-center gap-2.5 font-head text-xl text-white font-bold">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">🌿</div>
            Agri<strong>Assist</strong>
          </div>
          <div className="hidden md:flex gap-1 ml-auto">
            {['Features','How It Works','Farmers','Plans'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`}
                className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all">{l}</a>
            ))}
          </div>
          <div className="flex gap-2 ml-auto md:ml-0">
            <button onClick={() => navigate('/login')}
              className="text-white/90 border border-white/30 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-all">
              Login
            </button>
            <button onClick={() => navigate('/signup')}
              className="bg-white text-agri-2 px-5 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen bg-gradient-to-br from-agri-1 via-agri-2 to-agri-3 flex items-center pt-16 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-15%] right-[-5%] w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 rounded-full bg-white/4" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="max-w-6xl mx-auto w-full z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.div {...fade(0.1)} className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/90 px-4 py-2 rounded-full text-xs font-bold tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              AI-Powered · 50,000+ Farmers Trust Us
            </motion.div>
            <motion.h1 {...fade(0.2)} className="font-head text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
              Protect Your Crops<br/>with <em className="not-italic text-green-300">AI Intelligence</em>
            </motion.h1>
            <motion.p {...fade(0.3)} className="text-white/75 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Detect crop diseases instantly, get personalized treatment plans, and find nearby agricultural stores — all from your phone. Built for Indian farmers.
            </motion.p>
            <motion.div {...fade(0.4)} className="flex gap-3 justify-center lg:justify-start flex-wrap">
              <button onClick={() => navigate('/signup')}
                className="bg-white text-agri-1 font-bold px-8 py-3.5 rounded-full text-base hover:-translate-y-1 hover:shadow-xl transition-all">
                🌱 Start Free Today
              </button>
              <button onClick={() => navigate('/login')}
                className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 font-semibold px-7 py-3.5 rounded-full text-base transition-all">
                ▶ View Live Demo
              </button>
            </motion.div>
            <motion.div {...fade(0.5)} className="flex items-center gap-3 justify-center lg:justify-start mt-8">
              <div className="flex">
                {['RS','SP','PM','MK'].map((i,x) => (
                  <div key={x} className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-agri-2 border-2 border-white/50 flex items-center justify-center text-[10px] font-bold text-white -mr-2">{i}</div>
                ))}
              </div>
              <span className="text-white/65 text-sm ml-3">Trusted by <strong className="text-white">50,000+</strong> farmers</span>
            </motion.div>
          </div>

          {/* Phone Mockup */}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block relative">
            <div className="w-56 h-[460px] bg-gray-900 rounded-[36px] p-3 shadow-2xl border border-white/10 relative">
              <div className="w-20 h-6 bg-gray-900 rounded-full mx-auto mb-2" />
              <div className="bg-agri-8 rounded-[26px] h-[calc(100%-32px)] overflow-hidden">
                <div className="bg-agri-1 p-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/80 text-[10px] font-semibold">Scanning Tomato Leaf...</span>
                </div>
                <div className="flex flex-col items-center py-6 relative">
                  {[100,70,44].map((s,i) => (
                    <div key={i} className="absolute rounded-full border-2 border-agri-4/50 animate-ping" style={{ width: s, height: s, animationDelay: `${i*0.4}s`, animationDuration: '2s' }} />
                  ))}
                  <div className="text-5xl z-10">🍅</div>
                </div>
                <div className="px-3 pb-3">
                  <div className="text-[8px] text-gray-400 font-bold tracking-widest mb-0.5">DETECTED</div>
                  <div className="font-head text-sm font-bold text-gray-900 mb-2">Early Blight</div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 mb-1">
                    <span>Severity</span>
                    <div className="flex-1 h-1.5 bg-agri-7 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-agri-4 to-agri-2 rounded-full" />
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-agri-2">View Treatment →</div>
                </div>
              </div>
            </div>
            {/* Floating cards */}
            {[
              { style: 'top-4 -left-32', icon: '🌤️', t: '28°C · Partly Cloudy', s: 'Ludhiana, Punjab' },
              { style: 'top-40 -left-28', icon: '⚡', t: 'Disease Detected!', s: 'Potato Late Blight' },
              { style: 'bottom-16 -left-28', icon: '🏪', t: 'Store Found', s: '0.8 km away' },
            ].map((c, i) => (
              <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 3, delay: i * 0.8, repeat: Infinity }}
                className={`absolute ${c.style} bg-white/90 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg border border-white/80 min-w-max`}>
                <span className="text-lg">{c.icon}</span>
                <div><div className="text-xs font-bold text-gray-900">{c.t}</div><div className="text-[10px] text-gray-500">{c.s}</div></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,80 L0,80Z" fill="#f7faf4"/>
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-agri-7 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <div className="font-head text-3xl font-bold text-agri-2">{s.num}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6 bg-[#f7faf4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-agri-7 text-agri-2 text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-3">FEATURES</div>
            <h2 className="font-head text-3xl md:text-4xl font-bold text-gray-900 mb-3">Everything a Modern<br/>Farmer Needs</h2>
            <p className="text-gray-400 max-w-md mx-auto">One platform. Every tool to protect and grow your harvest.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(20,90,44,0.12)' }}
                className={`bg-white rounded-2xl border border-agri-7 p-6 transition-all duration-300 ${i === 0 ? 'border-agri-5 bg-agri-8' : ''}`}>
                <div className="w-12 h-12 rounded-xl bg-agri-8 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                {f.tags && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {f.tags.map(t => <span key={t} className="bg-agri-7 text-agri-2 text-xs font-semibold px-2.5 py-1 rounded-full">{t}</span>)}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-agri-1 to-agri-2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-white/15 text-white/90 text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-3">HOW IT WORKS</div>
            <h2 className="font-head text-3xl md:text-4xl font-bold text-white">Simple. Fast. Effective.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '01', icon: '📷', t: 'Photograph Your Crop', d: 'Take a photo of affected leaves using your phone camera or upload from gallery' },
              { num: '02', icon: '🤖', t: 'AI Analyzes Instantly', d: 'Our model detects disease type, severity and affected area in 3 seconds' },
              { num: '03', icon: '💊', t: 'Get Treatment Plan', d: 'Receive step-by-step treatment with specific product names and dosage' },
              { num: '04', icon: '🏪', t: 'Find Nearby Store', d: 'Locate the nearest store stocking your required pesticide with one tap' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="font-head text-5xl font-black text-white/15 mb-2">{s.num}</div>
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="text-white font-bold mb-2">{s.t}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="farmers" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-agri-7 text-agri-2 text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-3">FARMER STORIES</div>
            <h2 className="font-head text-3xl md:text-4xl font-bold text-gray-900">Real Results from Real Farmers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTI.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border p-6 ${i === 0 ? 'bg-gradient-to-br from-agri-1 to-agri-2 border-transparent' : 'bg-[#f7faf4] border-agri-7'}`}>
                <div className={`font-head text-6xl leading-none mb-3 ${i === 0 ? 'text-white/20' : 'text-agri-5'}`}>"</div>
                <p className={`text-sm leading-relaxed mb-5 ${i === 0 ? 'text-white/80' : 'text-gray-600'}`}>{t.q}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: t.bg }}>{t.av}</div>
                  <div>
                    <div className={`text-sm font-bold ${i === 0 ? 'text-white' : 'text-gray-900'}`}>{t.name}</div>
                    <div className={`text-xs ${i === 0 ? 'text-white/60' : 'text-gray-400'}`}>{t.info}</div>
                  </div>
                  <div className="ml-auto text-yellow-400 text-sm">★★★★★</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="plans" className="py-20 px-6 bg-[#f7faf4]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-agri-7 text-agri-2 text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-3">PLANS</div>
            <h2 className="font-head text-3xl md:text-4xl font-bold text-gray-900 mb-3">Simple, Farmer-Friendly Pricing</h2>
            <p className="text-gray-400">Start free. Upgrade when your farm grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {[
              { label: 'Free', price: '₹0', period: '/month', desc: 'Perfect for small farmers', features: ['10 scans/month', 'Basic disease detection', 'Weather alerts', 'Nearby store finder', '✗ Voice explanations'], btn: 'Start Free', outline: true },
              { label: 'Kisan Pro', price: '₹199', period: '/month', desc: 'Maximum protection', popular: true, features: ['Unlimited scans', 'Advanced AI detection', 'Voice in 18 languages', 'Crop health dashboard', 'Expert consultancy chat'], btn: 'Get Kisan Pro', outline: false },
              { label: 'Agri Business', price: '₹999', period: '/month', desc: 'For FPOs & companies', features: ['Everything in Pro', 'Multiple farm accounts', 'API access + reports', 'Dedicated support', 'Data analytics suite'], btn: 'Contact Sales', outline: true },
            ].map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border p-6 relative ${p.popular ? 'bg-gradient-to-br from-agri-1 to-agri-2 border-transparent scale-105 shadow-2xl' : 'bg-white border-agri-7'}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
                <div className={`text-xs font-bold tracking-widest mb-2 ${p.popular ? 'text-white/60' : 'text-gray-400'}`}>{p.label}</div>
                <div className={`font-head text-4xl font-bold mb-1 ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.price}<span className={`text-base font-normal ${p.popular ? 'text-white/60' : 'text-gray-400'}`}>{p.period}</span></div>
                <p className={`text-sm mb-5 ${p.popular ? 'text-white/70' : 'text-gray-400'}`}>{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => <li key={f} className={`text-sm flex items-center gap-2 ${p.popular ? 'text-white/80' : 'text-gray-600'} ${f.startsWith('✗') ? 'opacity-40' : ''}`}>
                    <span>{f.startsWith('✗') ? '✗' : '✓'}</span><span>{f.replace('✗ ', '')}</span>
                  </li>)}
                </ul>
                <button onClick={() => navigate('/signup')}
                  className={`w-full py-3 rounded-full font-bold text-sm transition-all ${p.popular ? 'bg-white text-agri-2 hover:shadow-lg' : 'border-2 border-agri-3 text-agri-2 hover:bg-agri-7'}`}>
                  {p.btn}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-agri-2 to-agri-1">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-head text-2xl md:text-3xl font-bold text-white mb-2">Ready to Protect Your Harvest?</h2>
            <p className="text-white/70">Join 50,000+ farmers already using AI to grow smarter.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => navigate('/signup')} className="bg-white text-agri-2 font-bold px-7 py-3 rounded-full hover:-translate-y-1 hover:shadow-lg transition-all">🌾 Create Free Account</button>
            <button onClick={() => navigate('/login')} className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 font-semibold px-6 py-3 rounded-full transition-all">Login</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0c1f11] text-white/50 py-8 px-6 text-center text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-head text-lg text-white font-bold">
            <span>🌿</span> AgriAssist
          </div>
          <span>© 2026 AgriAssist. Made with ❤️ for Indian Farmers</span>
        </div>
      </footer>
    </div>
  );
}
