import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🌿');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-body">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 bg-gradient-to-br from-agri-1 to-agri-3 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-[-10%] left-[-5%] w-60 h-60 rounded-full bg-white/4" />
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white font-head text-xl font-bold">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">🌿</div>
          AgriAssist
        </Link>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-sm">
          <h2 className="font-head text-3xl font-bold text-white mb-4">Protect Your Crops<br/>with AI Intelligence</h2>
          <p className="text-white/65 leading-relaxed mb-8">Login to access your farm dashboard, scan crops, and get instant disease alerts.</p>
          {['AI Disease Detection in 3 seconds', '120+ Crop Diseases Covered', 'Nearby Store Finder with Map', 'Voice Support in 18 Languages'].map(f => (
            <div key={f} className="flex items-center gap-3 text-white/80 text-sm mb-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
              {f}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-head text-xl font-bold text-agri-1 mb-8">
            <div className="w-9 h-9 rounded-xl bg-agri-7 flex items-center justify-center">🌿</div>
            AgriAssist
          </Link>
          <h2 className="font-head text-2xl font-bold text-gray-900 mb-1">Welcome Back 👋</h2>
          <p className="text-gray-400 text-sm mb-6">Login to your AgriAssist account</p>

          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 mb-4 transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or sign in with email</span><div className="flex-1 h-px bg-gray-200" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agri-3 bg-gray-50 focus:bg-white transition-all" placeholder="farmer@example.com" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agri-3 bg-gray-50 focus:bg-white transition-all" placeholder="Enter password" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" defaultChecked className="accent-agri-3" />Remember me</label>
              <a className="text-sm text-agri-3 font-medium cursor-pointer hover:underline">Forgot password?</a>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-agri-3 to-agri-1 text-white py-3.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:translate-y-0">
              {loading ? '⏳ Logging in...' : 'Login to Dashboard 🚀'}
            </button>
          </form>
          <div className="mt-4 p-3 bg-agri-8 rounded-xl text-xs text-agri-2">
            <strong>Demo:</strong> rajesh@farm.com / farmer123
          </div>
          <p className="text-center text-sm text-gray-400 mt-5">
            New to AgriAssist? <Link to="/signup" className="text-agri-3 font-semibold hover:underline">Create free account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
