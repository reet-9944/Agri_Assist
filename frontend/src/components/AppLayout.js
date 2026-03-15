import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/scanner',   icon: '🔬', label: 'Scan Disease', badge: 'AI' },
  { path: '/stores',    icon: '🗺️', label: 'Nearby Stores' },
  { path: '/profile',   icon: '👤', label: 'My Profile' },
];

export default function AppLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-agri-8 font-body">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-agri-7 shrink-0">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-agri-7">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-agri-4 to-agri-2 flex items-center justify-center text-lg">🌿</div>
          <span className="font-head text-xl font-bold text-agri-1">Agri<strong>Assist</strong></span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(n => (
            <Link key={n.path} to={n.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${location.pathname === n.path
                  ? 'bg-agri-7 text-agri-1 font-semibold'
                  : 'text-gray-500 hover:bg-agri-8 hover:text-agri-2'}`}>
              <span className="text-lg">{n.icon}</span>
              <span className="flex-1">{n.label}</span>
              {n.badge && <span className="text-xs font-bold bg-gradient-to-r from-agri-4 to-agri-2 text-white px-2 py-0.5 rounded-full">{n.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-agri-7">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-agri-8">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-agri-4 to-agri-2 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">{user?.name}</div>
              <div className="text-xs text-agri-3 font-semibold">Kisan Pro</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-semibold hover:bg-red-100 transition-colors">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 flex flex-col shadow-2xl md:hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-agri-7">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-agri-4 to-agri-2 flex items-center justify-center text-lg">🌿</div>
                  <span className="font-head text-xl font-bold text-agri-1">AgriAssist</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {NAV.map(n => (
                  <Link key={n.path} to={n.path} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                      ${location.pathname === n.path ? 'bg-agri-7 text-agri-1 font-semibold' : 'text-gray-500 hover:bg-agri-8'}`}>
                    <span className="text-xl">{n.icon}</span>
                    <span className="flex-1">{n.label}</span>
                    {n.badge && <span className="text-xs font-bold bg-gradient-to-r from-agri-4 to-agri-2 text-white px-2 py-0.5 rounded-full">{n.badge}</span>}
                  </Link>
                ))}
              </nav>
              <div className="p-3 border-t border-agri-7">
                <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 border border-red-200 rounded-lg py-2.5 text-sm font-semibold">🚪 Logout</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-agri-7 px-4 md:px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-500 text-xl p-1" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <div className="text-base font-bold text-gray-900">{title}</div>
              {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-agri-8 border border-agri-7 flex items-center justify-center text-base">🔔</button>
            <div onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-agri-4 to-agri-2 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-agri-7 flex z-30 pb-safe">
        {NAV.map(n => (
          <Link key={n.path} to={n.path}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-semibold transition-colors
              ${location.pathname === n.path ? 'text-agri-1' : 'text-gray-400'}`}>
            <span className="text-xl">{n.icon}</span>
            <span>{n.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
