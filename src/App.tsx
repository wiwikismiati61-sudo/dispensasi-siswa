import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import Transaksi from './pages/Transaksi';
import Laporan from './pages/Laporan';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="master" element={<MasterData />} />
          <Route path="transaksi" element={<Transaksi />} />
          <Route path="laporan" element={<Laporan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
