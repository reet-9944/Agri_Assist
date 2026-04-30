import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TYPE_COLORS = { fertilizer: '#27ae60', pesticide: '#c49a3c', center: '#1a5276', organic: '#6c3483', lab: '#8e44ad' };
const ICON_MAP = { fertilizer: '🌿', pesticide: '🧪', center: '🏛️', organic: '🌱', lab: '🔬' };
const FILTERS = ['All', 'Fertilizer', 'Pesticide', 'Center', 'Organic', 'Lab'];

const makeIcon = (color, emoji) => L.divIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-size:14px;">${emoji}</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const youIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#2980b9;border:3px solid white;box-shadow:0 0 0 8px rgba(41,128,185,0.2)"></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const FALLBACK_STORES = [
  { id: 1, name: 'Kisan Agri Store', type: 'fertilizer', lat: 30.9015, lng: 75.8573, rating: 4.9, distance: '0.8 km', open: true, stock: ['Mancozeb', 'DAP', 'Urea'], phone: '98765-00001' },
  { id: 2, name: 'Punjab Pesticides Hub', type: 'pesticide', lat: 30.9051, lng: 75.8612, rating: 4.3, distance: '1.3 km', open: true, stock: ['Ridomil', 'Propiconazole', 'Imidacloprid'], phone: '98765-00002' },
  { id: 3, name: 'Punjab Agricultural Center', type: 'center', lat: 30.8989, lng: 75.8540, rating: 4.8, distance: '2.1 km', open: false, stock: ['Free Soil Test', 'Expert Advice'], phone: '98765-00003' },
  { id: 4, name: 'Green Farm Organics', type: 'organic', lat: 30.9070, lng: 75.8490, rating: 4.5, distance: '3.2 km', open: true, stock: ['Neem Oil', 'Trichoderma', 'Bio-NPK'], phone: '98765-00004' },
  { id: 5, name: 'Agro Soil Testing Lab', type: 'lab', lat: 30.8950, lng: 75.8650, rating: 5.0, distance: '4.5 km', open: true, stock: ['NPK Analysis', 'pH Test'], phone: '98765-00005' },
];

export default function Stores() {
  const { API } = useAuth();
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchStores = (lat, lng) => {
      let url = `${API}/api/stores`;
      if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
      
      axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('agri_token')}` } })
        .then(r => setStores(r.data))
        .catch(() => setStores(FALLBACK_STORES))
        .finally(() => setLoading(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          fetchStores(lat, lng);
        },
        () => fetchStores() // User denied location, use Ludhiana default
      );
    } else {
      fetchStores();
    }
  }, [API]);

  const filtered = filter === 'All' ? stores : stores.filter(s => s.type === filter.toLowerCase());
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : [30.9008, 75.8573];

  const openDirections = (store) => {
    const dest = `${store.lat},${store.lng}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, '_blank');
  };

  return (
    <AppLayout title="Nearby Agri Stores" subtitle={`${filtered.length} stores found`}>
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-agri-7 overflow-hidden"
          style={{ height: 320 }}
        >
          <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapCenter} icon={youIcon}>
              <Popup>
                <div className="font-bold">📍 You are here</div>
                <div className="text-xs text-gray-400">{userLocation ? 'Your location' : 'Ludhiana, Punjab'}</div>
              </Popup>
            </Marker>
            <Circle
              center={mapCenter}
              radius={5000}
              pathOptions={{ color: '#47bc70', fillColor: '#47bc70', fillOpacity: 0.05, weight: 1 }}
            />
            {stores.map(s => (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={makeIcon(TYPE_COLORS[s.type] || '#27ae60', ICON_MAP[s.type] || '🌿')}
                eventHandlers={{ click: () => setSelectedStore(s) }}
              >
                <Popup>
                  <div className="min-w-[160px]">
                    <div className="font-bold text-sm mb-1">{s.name}</div>
                    <div className="text-xs text-gray-400 mb-1 capitalize">{s.type} shop</div>
                    <div className="text-xs text-yellow-500 mb-1">{'★'.repeat(Math.round(s.rating))} {s.rating}</div>
                    <div className="text-xs font-semibold text-agri-2">{s.distance} away</div>
                    <div className={`text-xs font-bold mt-1 ${s.open ? 'text-green-600' : 'text-red-500'}`}>
                      {s.open ? '● Open Now' : '● Closed'}
                    </div>
                    <button
                      onClick={() => openDirections(s)}
                      className="mt-2 w-full bg-agri-2 text-white text-xs font-bold py-1.5 rounded-lg"
                    >
                      Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                ${filter === f ? 'bg-agri-2 text-white' : 'bg-white border border-agri-7 text-gray-600 hover:border-agri-4 hover:text-agri-2'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)
          ) : filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedStore(selectedStore?.id === s.id ? null : s)}
              className={`bg-white rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md
                ${selectedStore?.id === s.id ? 'border-agri-3 shadow-lg' : 'border-agri-7'}`}
            >
              <div className="p-4 flex gap-3 items-start">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${TYPE_COLORS[s.type]}20` }}
                >
                  {ICON_MAP[s.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{s.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.open ? 'bg-agri-7 text-agri-1' : 'bg-gray-100 text-gray-500'}`}>
                      {s.open ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 capitalize mb-1.5">{s.type} store</div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="text-yellow-500 font-semibold">{'★'.repeat(Math.round(s.rating))} {s.rating}</span>
                    <span className="text-agri-2 font-semibold">📍 {s.distance}</span>
                    <span className="text-gray-400">📞 {s.phone}</span>
                  </div>
                </div>
                <button className="bg-agri-2 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-agri-1 transition-colors flex-shrink-0">
                  →
                </button>
              </div>

              {selectedStore?.id === s.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-agri-7 px-4 pb-4 pt-3"
                >
                  <div className="text-xs text-gray-500 font-semibold mb-2">In Stock / Services:</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {s.stock.map(item => (
                      <span key={item} className="bg-agri-8 text-agri-2 text-xs font-semibold px-2.5 py-1 rounded-full">{item}</span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openDirections(s); }}
                    className="w-full bg-agri-2 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-agri-1 transition-colors"
                  >
                    🗺️ Get Directions
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
