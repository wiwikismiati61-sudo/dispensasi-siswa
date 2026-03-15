import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import Transaksi from './pages/Transaksi';
import Laporan from './pages/Laporan';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="master" element={
              <ProtectedRoute>
                <MasterData />
              </ProtectedRoute>
            } />
            <Route path="transaksi" element={
              <ProtectedRoute>
                <Transaksi />
              </ProtectedRoute>
            } />
            <Route path="laporan" element={
              <ProtectedRoute>
                <Laporan />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
