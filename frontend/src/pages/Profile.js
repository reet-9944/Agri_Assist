import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

const card = (d = 0) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: d } });

const CROP_EMOJI = { tomato: '🍅', potato: '🥔', corn: '🌽', mango: '🥭', wheat: '🌾', rice: '🌾' };

const LEVEL_STYLES = {
  Critical: 'bg-red-100 text-red-600',
  High: 'bg-orange-100 text-orange-600',
  Moderate: 'bg-yellow-100 text-yellow-700',
  Healthy: 'bg-agri-7 text-agri-1',
};

export default function Profile() {
  const { user, logout, API } = useAuth();
  const [scans, setScans] = useState([]);
  const [toggles, setToggles] = useState({ notifications: true, location: true, weatherAlerts: true, offline: false });

  useEffect(() => {
    axios.get(`${API}/api/scans`).then(r => setScans(r.data)).catch(() => {});
  }, [API]);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const CROP_EMOJI_MAP = { tomato: '🍅', potato: '🥔', corn: '🌽', mango: '🥭', wheat: '🌾', rice: '🌾' };
  const uniqueCrops = [...new Set(scans.map(s => s.cropType?.toLowerCase()).filter(Boolean))];
  const dynamicCrops = uniqueCrops.map(c => ({ name: c }));

  const Toggle = ({ name }) => (
    <div
      onClick={() => setToggles(t => ({ ...t, [name]: !t[name] }))}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${toggles[name] ? 'bg-agri-3' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${toggles[name] ? 'left-6' : 'left-1'}`} />
    </div>
  );

  const displayScans = scans.slice(0, 6);

  return (
    <AppLayout title="My Profile" subtitle="Account & Settings">
      <motion.div {...card(0)} className="bg-white rounded-2xl border border-agri-7 overflow-hidden mb-5">
        <div className="h-32 bg-gradient-to-r from-agri-1 via-agri-2 to-agri-3 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute bottom-0 left-5 translate-y-1/2">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-agri-4 to-agri-2 flex items-center justify-center text-white font-head text-2xl font-bold border-4 border-white shadow-lg">
                {initials}
              </div>
            )}
          </div>
        </div>
        <div className="px-5 pt-14 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-head text-xl font-bold text-gray-900 leading-tight">{user?.name || 'Farmer'}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {user?.role === 'student' ? '🎓 Student' : '👨‍🌾 Farmer'} · {user?.state || 'Punjab'}, India
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-agri-7 text-agri-1 text-xs font-bold px-3 py-1 rounded-full">🌟 Kisan Pro Member</span>
                {user?.email && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">📧 {user.email}</span>}
              </div>
            </div>
            <button className="bg-white text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex-shrink-0">
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div {...card(0.05)} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { n: scans.length, l: 'Total Scans', c: 'text-agri-2' },
          { n: dynamicCrops.length, l: 'Active Crops', c: 'text-agri-2' },
          { n: scans.length, l: 'Diseases Found', c: 'text-red-500' },
          { n: scans.filter(s => s.disease?.treatments || s.mlResult?.disease?.treatment).length, l: 'Treatments', c: 'text-agri-2' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-agri-7 p-4 text-center">
            <div className={`font-head text-3xl font-bold mb-1 ${s.c}`}>{s.n}</div>
            <div className="text-xs text-gray-400">{s.l}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div {...card(0.1)} className="bg-white rounded-2xl border border-agri-7 p-5">
          <h3 className="font-bold text-gray-900 mb-4">📋 Scan History</h3>
          <div className="space-y-2">
            {displayScans.length > 0 ? displayScans.map((s, i) => {
              const level = s.disease?.level || s.mlResult?.disease?.level || 'Unknown';
              const name = s.disease?.name || s.mlResult?.disease?.name || 'Unknown';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-agri-8 rounded-xl"
                >
                  <span className="text-xl">{CROP_EMOJI[s.cropType] || '🌿'}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{name}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(s.scannedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${LEVEL_STYLES[level] || 'bg-agri-7 text-agri-1'}`}>
                    {level}
                  </span>
                </motion.div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-4xl mb-3">🔬</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">No scans yet</div>
                <div className="text-xs text-gray-400">Your scan history will appear here</div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div {...card(0.15)} className="bg-white rounded-2xl border border-agri-7 p-5">
            <h3 className="font-bold text-gray-900 mb-4">⚙️ Settings</h3>
            <div className="divide-y divide-agri-8">
              {[
                { key: 'notifications', label: 'Push Notifications', sub: 'Disease alerts & daily tips' },
                { key: 'location', label: 'Location Services', sub: 'Required for nearby stores' },
                { key: 'weatherAlerts', label: 'Weather Alerts', sub: 'Disease risk notifications' },
                { key: 'offline', label: 'Offline Mode', sub: 'Save data for no-internet zones' },
              ].map(s => (
                <div key={s.key} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{s.label}</div>
                    <div className="text-xs text-gray-400">{s.sub}</div>
                  </div>
                  <Toggle name={s.key} />
                </div>
              ))}
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Voice Language</div>
                  <div className="text-xs text-gray-400">English (India)</div>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </div>
            </div>
          </motion.div>

          <motion.div {...card(0.2)} className="bg-white rounded-2xl border border-agri-7 p-5">
            <h3 className="font-bold text-gray-900 mb-4">🏡 Farm Details</h3>
            <div className="divide-y divide-agri-8 text-sm">
              {[
                ['Email', user?.email || 'rajesh@farm.com'],
                ['Mobile', user?.mobile || '+91 98765 43210'],
                ['Location', `${user?.state || 'Punjab'}, India`],
                ['Total Land', '14 Acres'],
                ['Active Crops', 'Wheat, Tomato, Potato, Rice'],
                ['Plan', '🌟 Kisan Pro'],
              ].map(([k, v]) => (
                <div key={k} className="py-2.5 flex justify-between">
                  <span className="text-gray-400">{k}</span>
                  <span className={`font-semibold text-right ${k === 'Plan' ? 'text-agri-2' : 'text-gray-900'}`}>{v}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...card(0.25)}>
            <button
              onClick={logout}
              className="w-full bg-red-50 text-red-600 border-2 border-red-200 py-3.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
            >
              🚪 Logout from Account
            </button>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
