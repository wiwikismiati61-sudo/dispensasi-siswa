import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

export default function Layout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Master Data', href: '/master', icon: Database },
    { name: 'Transaksi', href: '/transaksi', icon: FileText },
    { name: 'Laporan', href: '/laporan', icon: FileText },
  ];

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-72 md:flex-col bg-white border-r border-slate-200 shadow-sm relative z-20">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-20 flex-shrink-0 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
            <div className="bg-white p-1.5 rounded-lg mr-3 shadow-sm">
              <img
                className="h-8 w-auto"
                src="https://iili.io/KDFk4fI.png"
                alt="Logo"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-white font-extrabold text-xl tracking-wide drop-shadow-sm">DISPENSASI</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    } group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                      } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex flex-col border-t border-slate-100 p-4 space-y-2 bg-slate-50/50">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all duration-200"
            >
              <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
              Pengaturan
            </button>
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden relative">
        {/* Decorative background elements for main content */}
        <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none z-0"></div>
        
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-slate-200 shadow-sm flex items-center h-16 px-4">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="ml-4 flex items-center">
            <span className="text-slate-800 font-bold text-lg">DISPENSASI</span>
          </div>
        </div>
        <main className="flex-1 overflow-hidden flex flex-col relative z-10">
          <div className="py-6 flex-1 flex flex-col overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex-1 flex flex-col w-full overflow-hidden">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl transform transition-transform">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-0 pb-4 overflow-y-auto">
              <div className="flex items-center h-20 flex-shrink-0 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
                <div className="bg-white p-1.5 rounded-lg mr-3 shadow-sm">
                  <img
                    className="h-8 w-auto"
                    src="https://iili.io/KDFk4fI.png"
                    alt="Logo"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-white font-extrabold text-xl tracking-wide">DISPENSASI</span>
              </div>
              <nav className="mt-6 px-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                      } group flex items-center px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                        } mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex flex-col border-t border-slate-100 p-4 space-y-2 bg-slate-50">
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-base font-semibold text-slate-600 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all duration-200"
              >
                <Settings className="mr-4 h-6 w-6 text-slate-400" />
                Pengaturan
              </button>
              <button
                onClick={onLogout}
                className="flex items-center w-full px-4 py-3 text-base font-semibold text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              >
                <LogOut className="mr-4 h-6 w-6 text-red-500" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}
