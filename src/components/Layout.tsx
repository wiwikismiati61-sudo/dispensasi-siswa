import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, FileText, Settings, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';
import { useAuth } from './AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/dashboard');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Master Data', href: '/master', icon: Database },
    { name: 'Transaksi', href: '/transaksi', icon: FileText },
    { name: 'Laporan', href: '/laporan', icon: FileText },
  ];

  const userRole = user?.role?.toLowerCase() || '';
  const username = user?.username?.toLowerCase() || '';
  const isAdmin = userRole === 'full access' || userRole === 'admin' || userRole === 'administrator' || username === 'admin' || username === 'administrator';

  if (isAdmin) {
    navigation.push({ name: 'Manajemen User', href: '/users', icon: UserIcon });
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-48 lg:w-56 md:flex-col bg-white border-r border-slate-200 shadow-sm relative z-20">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-12 sm:h-14 flex-shrink-0 px-3 sm:px-4 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
            <div className="bg-white p-1 rounded-md mr-2 shadow-sm">
              <img
                className="h-5 sm:h-6 w-auto"
                src="https://iili.io/KDFk4fI.png"
                alt="Logo"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-white font-extrabold text-sm sm:text-base tracking-wide drop-shadow-sm">DISPENSASI</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-2 sm:py-3 space-y-1">
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
                    } group flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                      } mr-2 flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors duration-200`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex flex-col border-t border-slate-100 p-2 space-y-1 bg-slate-50/50">
            {user ? (
              <>
                <div className="px-3 py-2 flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <UserIcon className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-900 truncate">{user.name || user.username}</p>
                    <p className="text-[9px] text-slate-500 truncate capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-600 rounded-lg hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all duration-200"
                >
                  <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-indigo-500" />
                  Pengaturan
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" />
                  Keluar
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200"
              >
                <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden relative">
        {/* Decorative background elements for main content */}
        <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none z-0"></div>
        
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-2 sm:pt-2 bg-white border-b border-slate-200 shadow-sm flex items-center h-12 px-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="ml-2 flex items-center">
            <span className="text-slate-800 font-bold text-sm">DISPENSASI</span>
          </div>
        </div>
        <main className="flex-1 overflow-hidden flex flex-col relative z-10">
          <div className="py-2 sm:py-3 flex-1 flex flex-col overflow-hidden">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 flex-1 flex flex-col w-full overflow-hidden">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-[240px] w-full bg-white shadow-2xl transform transition-transform">
            <div className="absolute top-0 right-0 -mr-10 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-4 w-4 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-0 pb-4 overflow-y-auto">
              <div className="flex items-center h-12 flex-shrink-0 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
                <div className="bg-white p-1 rounded-md mr-2 shadow-sm">
                  <img
                    className="h-5 w-auto"
                    src="https://iili.io/KDFk4fI.png"
                    alt="Logo"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-white font-extrabold text-sm tracking-wide">DISPENSASI</span>
              </div>
              <nav className="mt-2 px-2 space-y-1">
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
                      } group flex items-center px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all duration-200`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                        } mr-2 flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors duration-200`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex flex-col border-t border-slate-100 p-2 space-y-1 bg-slate-50">
              {user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-3.5 w-3.5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-900 truncate">{user.name || user.username}</p>
                      <p className="text-[9px] text-slate-500 truncate capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-2 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 rounded-lg hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all duration-200"
                  >
                    <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                    Pengaturan
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-2 py-1.5 text-[11px] sm:text-xs font-semibold text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" />
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center w-full px-2 py-1.5 text-[11px] sm:text-xs font-semibold text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
                  Masuk
                </Link>
              )}
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
