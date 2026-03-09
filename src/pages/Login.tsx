import React, { useState } from 'react';
import { api } from '../lib/api';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password });
      if (res.success) {
        localStorage.setItem('user', JSON.stringify(res.user));
        onLogin();
      } else {
        setError(res.message || 'Username atau password salah');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 rounded-full bg-yellow-300 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 rounded-full bg-blue-300 opacity-20 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-xl">
            <img
              className="h-12 sm:h-16 w-auto"
              src="https://iili.io/KDFk4fI.png"
              alt="Logo"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
          DISPENSASI SISWA
        </h2>
        <p className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-white/80 font-medium tracking-wide">
          Sistem Informasi Manajemen Dispensasi Siswa
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/90 backdrop-blur-lg py-4 sm:py-6 px-4 shadow-2xl rounded-2xl sm:px-6 border border-white/20">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-md text-xs sm:text-sm shadow-sm flex items-center">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="username"
                className="block text-xs sm:text-sm font-semibold text-slate-700"
              >
                Username
              </label>
              <div className="mt-1.5 sm:mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm bg-white/50 focus:bg-white"
                  placeholder="Masukkan username Anda"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="mt-1.5 sm:mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm bg-white/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 sm:py-2.5 px-3 border border-transparent rounded-lg shadow-lg text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Masuk ke Sistem
              </button>
            </div>
          </form>
        </div>
        <p className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs text-white/60">
          &copy; {new Date().getFullYear()} Sistem Dispensasi Siswa. All rights reserved.
        </p>
      </div>
    </div>
  );
}
