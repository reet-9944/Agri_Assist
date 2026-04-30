import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'farmer', icon: '👨‍🌾', label: 'Farmer' },
  { value: 'student', icon: '🎓', label: 'Student' },
];

const STATES = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Karnataka',
  'Andhra Pradesh', 'Tamil Nadu', 'Rajasthan', 'Gujarat', 'Bihar',
  'Madhya Pradesh', 'Odisha',
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', state: 'Punjab', role: 'farmer' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! Welcome to AgriAssist 🌿');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-body">
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 bg-gradient-to-br from-agri-1 to-agri-3 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full bg-white/5" />
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white font-head text-xl font-bold">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">🌿</div>
          AgriAssist
        </Link>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-sm"
        >
          <h2 className="font-head text-3xl font-bold text-white mb-4">Join 50,000+<br/>Smart Farmers</h2>
          <p className="text-white/65 leading-relaxed mb-8">Create your free account and start protecting your crops with the power of AI</p>
          {['Free forever plan available', 'No credit card required', 'Setup in under 2 minutes', 'Works on any smartphone'].map(f => (
            <div key={f} className="flex items-center gap-3 text-white/80 text-sm mb-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
              {f}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2 font-head text-xl font-bold text-agri-1 mb-6">
            <div className="w-9 h-9 rounded-xl bg-agri-7 flex items-center justify-center">🌿</div>
            AgriAssist
          </Link>
          <h2 className="font-head text-2xl font-bold text-gray-900 mb-4">Create Your Account 🌱</h2>

          <div className="mb-5">
            <label className="text-sm font-semibold text-gray-600 block mb-2">I am a</label>
            <div className="flex gap-3">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 border-2 rounded-xl text-sm font-semibold transition-all
                    ${form.role === r.value ? 'border-agri-3 bg-agri-8 text-agri-1' : 'border-gray-200 text-gray-500 hover:border-agri-5'}`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Rajesh Singh"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agri-3 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">Mobile</label>
                <input
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agri-3 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                placeholder="farmer@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agri-3 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">State</label>
              <select
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agri-3 bg-gray-50 focus:bg-white transition-all"
              >
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Min 6 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agri-3 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-agri-3 to-agri-1 text-white py-3.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? '⏳ Creating account...' : 'Create Free Account 🌾'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-agri-3 font-semibold hover:underline">Login here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
