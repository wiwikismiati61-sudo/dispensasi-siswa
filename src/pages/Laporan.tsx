import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import * as XLSX from 'xlsx';
import { Download, Filter } from 'lucide-react';

const CATEGORIES = [
  'Semua',
  'Keluarga Sakit/Meninggal',
  'Acara Kepentingan Keluarga',
  'Menikah',
  'Khitan',
  'Lomba Akademik',
  'Lomba Non Akademik',
  'Kondisional'
];

export default function Laporan() {
  const [dispensations, setDispensations] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Semua');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [activeTab, setActiveTab] = useState<'data' | 'rekap' | 'rekap_siswa'>('data');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dispData, studentsData] = await Promise.all([
        api.get('/dispensations'),
        api.get('/students')
      ]);
      setDispensations(dispData);
      
      const uniqueClasses = Array.from(new Set(studentsData.map((s: any) => s.class_name))).filter(Boolean).sort() as string[];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = dispensations.filter((item) => {
    let match = true;
    if (filterType !== 'Semua' && item.type !== filterType) match = false;
    if (filterDateStart && item.date < filterDateStart) match = false;
    if (filterDateEnd && item.date > filterDateEnd) match = false;
    return match;
  });

  const recapData = classes.map(className => {
    const count = filteredData.filter(item => item.class_name === className).length;
    return {
      'Kelas': className,
      'Jumlah Dispensasi': count
    };
  });

  const rekapSiswaMap = new Map();
  filteredData.forEach(item => {
    const key = `${item.student_name}-${item.class_name}`;
    if (!rekapSiswaMap.has(key)) {
      rekapSiswaMap.set(key, {
        'Nama Siswa': item.student_name,
        'Kelas': item.class_name,
        'Jumlah Dispensasi': 0,
        'Alasan': [] as string[]
      });
    }
    const record = rekapSiswaMap.get(key);
    record['Jumlah Dispensasi'] += 1;
    if (item.reason && !record['Alasan'].includes(item.reason)) {
      record['Alasan'].push(item.reason);
    }
  });

  const rekapSiswaData = Array.from(rekapSiswaMap.values()).map(record => ({
    ...record,
    'Alasan': record['Alasan'].join(', ')
  })).sort((a, b) => b['Jumlah Dispensasi'] - a['Jumlah Dispensasi']);

  const exportToExcel = () => {
    if (activeTab === 'data') {
      const dataToExport = filteredData.map((item) => ({
        'Tanggal': item.date,
        'Jam': item.time,
        'Nama Siswa': item.student_name,
        'Kelas': item.class_name,
        'Jenis Dispensasi': item.type,
        'Alasan': item.reason,
        'Wali Kelas': item.homeroom_teacher,
        'Guru BK': item.bk_teacher,
        'Tindak Lanjut': item.follow_up
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Dispensasi');
      XLSX.writeFile(wb, `Laporan_Dispensasi_${new Date().getTime()}.xlsx`);
    } else if (activeTab === 'rekap') {
      const ws = XLSX.utils.json_to_sheet(recapData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kelas');
      XLSX.writeFile(wb, `Rekap_Dispensasi_Kelas_${new Date().getTime()}.xlsx`);
    } else {
      const ws = XLSX.utils.json_to_sheet(rekapSiswaData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Siswa');
      XLSX.writeFile(wb, `Rekap_Dispensasi_Siswa_${new Date().getTime()}.xlsx`);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-slate-900">Laporan Dispensasi</h1>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <Download className="-ml-1 mr-2 h-5 w-5" />
          Download Excel {activeTab === 'rekap' ? 'Rekap' : ''}
        </button>
      </div>

      <div className="border-b border-slate-200 flex-shrink-0">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('data')}
            className={`${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Data Dispensasi
          </button>
          <button
            onClick={() => setActiveTab('rekap')}
            className={`${
              activeTab === 'rekap'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Rekapitulasi per Kelas
          </button>
          <button
            onClick={() => setActiveTab('rekap_siswa')}
            className={`${
              activeTab === 'rekap_siswa'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Rekapitulasi per Siswa
          </button>
        </nav>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-6 flex-shrink-0">
        <div className="flex items-center mb-4 text-slate-700 font-medium">
          <Filter className="h-5 w-5 mr-2" />
          Filter Laporan
        </div>
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Jenis Dispensasi</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Tanggal Mulai</label>
            <input
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Tanggal Akhir</label>
            <input
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {activeTab === 'data' ? (
        <div className="bg-white shadow sm:rounded-md flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Siswa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Jenis</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Alasan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-sm text-slate-500">Loading...</td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-sm text-slate-500">Tidak ada data yang sesuai filter</td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        <div className="whitespace-nowrap">{item.date}</div>
                        <div className="whitespace-nowrap text-slate-500">{item.time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">{item.student_name}</div>
                        <div className="text-sm text-slate-500">{item.class_name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.type}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.reason}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.follow_up}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'rekap' ? (
        <div className="bg-white shadow sm:rounded-md flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Kelas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Jumlah Dispensasi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recapData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item['Kelas']}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item['Jumlah Dispensasi']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-md flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Nama Siswa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Kelas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Jumlah Dispensasi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Alasan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {rekapSiswaData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item['Nama Siswa']}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item['Kelas']}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item['Jumlah Dispensasi']}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item['Alasan']}</td>
                  </tr>
                ))}
                {rekapSiswaData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-sm text-slate-500">Tidak ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
