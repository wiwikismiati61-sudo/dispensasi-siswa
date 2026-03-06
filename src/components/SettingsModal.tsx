import React, { useState } from 'react';
import { api } from '../lib/api';
import { X, Lock, Database, Download, Upload, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Password baru tidak cocok');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.post('/change-password', {
        username: user.username,
        oldPassword,
        newPassword,
      });

      if (res.success) {
        setSuccess('Password berhasil diubah');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError('Gagal mengubah password. Pastikan password lama benar.');
    }
  };

  const handleBackup = () => {
    window.open('/api/backup', '_blank');
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('database', file);

    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('Database berhasil direstore. Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('Gagal merestore database: ' + data.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan saat merestore database');
    }
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity animate-in fade-in duration-200" aria-hidden="true">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center">
              <ShieldCheck className="mr-2 h-6 w-6 text-indigo-100" />
              Pengaturan Sistem
            </h3>
            <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="bg-white px-6 pt-5 pb-6">
            <div className="space-y-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <Lock className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Ubah Password</h4>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-md flex items-start">
                      <ShieldCheck className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-700">{success}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Lama</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
                      placeholder="Masukkan password baru"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-md px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-bold text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Simpan Password Baru
                  </button>
                </form>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                    <Database className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Manajemen Database</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleBackup}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Download className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Backup Data</span>
                  </button>
                  
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Restore Data</span>
                    <input type="file" className="hidden" accept=".json,application/json,.sqlite,*/*" onChange={handleRestore} />
                  </label>
                </div>
                <p className="mt-3 text-xs text-slate-500 text-center bg-slate-50 p-2 rounded-lg">
                  <AlertCircle className="h-3 w-3 inline mr-1 text-slate-400" />
                  Restore akan menimpa seluruh data saat ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
