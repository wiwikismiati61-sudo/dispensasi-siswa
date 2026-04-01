import React, { useRef, useState } from 'react';
import { X, Database, Download, Upload, ShieldCheck, AlertCircle, Users } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check for various admin roles just in case
  const userRole = user?.role?.toLowerCase() || '';
  const username = user?.username?.toLowerCase() || '';
  const isAdmin = userRole === 'full access' || userRole === 'admin' || userRole === 'administrator' || username === 'admin' || username === 'administrator';

  const handleBackup = () => {
    window.open('/api/backup', '_blank');
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Apakah Anda yakin ingin memulihkan database? Semua data saat ini akan ditimpa.')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsRestoring(true);
    const formData = new FormData();
    formData.append('database', file);

    try {
      const response = await fetch('/api/restore', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert('Database berhasil dipulihkan. Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('Gagal memulihkan database: ' + result.message);
      }
    } catch (error) {
      console.error('Error restoring database:', error);
      alert('Terjadi kesalahan saat memulihkan database.');
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity animate-in fade-in duration-200" aria-hidden="true">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
              <ShieldCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-100" />
              Pengaturan Sistem
            </h3>
            <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="bg-white px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4">
            <div className="space-y-4 sm:space-y-6">
              {isAdmin && (
                <div>
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-800">Manajemen Pengguna</h4>
                  </div>
                  
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/users');
                    }}
                    className="w-full flex items-center justify-between p-3 sm:p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-blue-700">Kelola Akun Pengguna</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Tambah, edit, atau hapus akses pengguna</span>
                    </div>
                    <Users className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
                    <Database className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800">Manajemen Database</h4>
                </div>
                
                {isAdmin ? (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={handleBackup}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                      <Download className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-indigo-600 mb-1.5 sm:mb-2 transition-colors" />
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-indigo-700">Backup Data</span>
                    </button>
                    
                    <label className={`flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group cursor-pointer ${isRestoring ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-emerald-600 mb-1.5 sm:mb-2 transition-colors" />
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                        {isRestoring ? 'Memulihkan...' : 'Restore Data'}
                      </span>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleRestore}
                        disabled={isRestoring}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-600 font-medium">
                      Anda tidak memiliki akses untuk mengelola database.
                    </p>
                    <p className="mt-2 text-[10px] text-slate-500">
                      Hanya pengguna dengan role "Full Access" yang dapat melakukan backup dan restore data.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
