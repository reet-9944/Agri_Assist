import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Stores from './pages/Stores';
import Profile from './pages/Profile';
import Weather from './pages/Weather';
import Market from './pages/Market';
import Calendar from './pages/Calendar';
import DiseaseLibrary from './pages/DiseaseLibrary';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-agri-8">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🌿</div>
        <div className="text-agri-2 font-semibold">Loading AgriAssist...</div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/scanner" element={<Protected><Scanner /></Protected>} />
          <Route path="/weather" element={<Protected><Weather /></Protected>} />
          <Route path="/market" element={<Protected><Market /></Protected>} />
          <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
          <Route path="/diseases" element={<Protected><DiseaseLibrary /></Protected>} />
          <Route path="/stores" element={<Protected><Stores /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AuthProvider>
  );
}
