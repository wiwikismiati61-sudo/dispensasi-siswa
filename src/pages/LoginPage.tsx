import { useAuth } from '../components/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async () => {
    try {
      await login();
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Selamat Datang</h2>
          <p className="mt-2 text-gray-600">Silakan masuk untuk mengakses fitur aplikasi</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all font-semibold"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
          Masuk dengan Google
        </button>

        <div className="text-center text-sm text-gray-500">
          <p>Aplikasi Dispensasi Siswa</p>
        </div>
      </motion.div>
    </div>
  );
}
