import React from 'react';
import { X, Database, Download, Upload, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
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
              <div>
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
                    <Database className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800">Manajemen Database</h4>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Database sekarang dikelola secara otomatis oleh Firebase Firestore.
                  </p>
                  <p className="mt-2 text-[10px] text-slate-500">
                    Data Anda tersimpan dengan aman di cloud dan sinkron secara real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
