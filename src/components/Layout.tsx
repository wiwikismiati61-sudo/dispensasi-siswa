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
    <div className="h-screen bg-slate-100 flex overflow-hidden">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col bg-slate-900">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-900 border-b border-slate-800">
            <img
              className="h-8 w-auto mr-3"
              src="https://iili.io/KDFk4fI.png"
              alt="Logo"
              referrerPolicy="no-referrer"
            />
            <span className="text-white font-bold text-lg tracking-wider">DISPENSASI</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex flex-col border-t border-slate-800 p-4 space-y-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Settings className="mr-3 h-5 w-5 text-slate-400" />
              Pengaturan
            </button>
            <button
              onClick={onLogout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-slate-800 hover:text-red-300 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-400" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-slate-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1 overflow-hidden flex flex-col">
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
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <img
                  className="h-8 w-auto mr-3"
                  src="https://iili.io/KDFk4fI.png"
                  alt="Logo"
                  referrerPolicy="no-referrer"
                />
                <span className="text-white font-bold text-lg">DISPENSASI</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                        } mr-4 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex flex-col border-t border-slate-800 p-4 space-y-2">
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-2 py-2 text-base font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white"
              >
                <Settings className="mr-4 h-6 w-6 text-slate-400" />
                Pengaturan
              </button>
              <button
                onClick={onLogout}
                className="flex items-center w-full px-2 py-2 text-base font-medium text-red-400 rounded-md hover:bg-slate-800 hover:text-red-300"
              >
                <LogOut className="mr-4 h-6 w-6 text-red-400" />
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
