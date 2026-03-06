import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import * as XLSX from 'xlsx';
import { Download, Filter, FileSpreadsheet, Users, BarChart3, AlertCircle } from 'lucide-react';

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
  const [filterClass, setFilterClass] = useState('Semua');
  const [filterStudent, setFilterStudent] = useState('');
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
    if (filterClass !== 'Semua' && item.class_name !== filterClass) match = false;
    if (filterStudent && !item.student_name?.toLowerCase().includes(filterStudent.toLowerCase())) match = false;
    if (filterDateStart && item.date < filterDateStart) match = false;
    if (filterDateEnd && item.date > filterDateEnd) match = false;
    return match;
  });

  const recapKelasMap = new Map();
  filteredData.forEach(item => {
    const key = `${item.class_name}-${item.type}`;
    if (!recapKelasMap.has(key)) {
      recapKelasMap.set(key, {
        'Kelas': item.class_name,
        'Jenis Dispensasi': item.type,
        'Jumlah Dispensasi': 0
      });
    }
    const record = recapKelasMap.get(key);
    record['Jumlah Dispensasi'] += 1;
  });
  
  const recapData = Array.from(recapKelasMap.values()).sort((a, b) => {
    if (a['Kelas'] !== b['Kelas']) return a['Kelas'].localeCompare(b['Kelas']);
    return a['Jenis Dispensasi'].localeCompare(b['Jenis Dispensasi']);
  });

  const rekapSiswaMap = new Map();
  filteredData.forEach(item => {
    const key = `${item.student_name}-${item.class_name}-${item.type}`;
    if (!rekapSiswaMap.has(key)) {
      rekapSiswaMap.set(key, {
        'Nama Siswa': item.student_name,
        'Kelas': item.class_name,
        'Jenis Dispensasi': item.type,
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
    <div className="flex flex-col h-full space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Laporan Dispensasi</h1>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-md text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="-ml-1 mr-2 h-5 w-5" />
          Download Excel {activeTab === 'rekap' ? 'Rekap Kelas' : activeTab === 'rekap_siswa' ? 'Rekap Siswa' : ''}
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-2 flex-shrink-0 border border-slate-100">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('data')}
            className={`${
              activeTab === 'data'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            } flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200`}
          >
            <FileSpreadsheet className={`mr-2 h-5 w-5 ${activeTab === 'data' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Data Dispensasi
          </button>
          <button
            onClick={() => setActiveTab('rekap')}
            className={`${
              activeTab === 'rekap'
                ? 'bg-purple-50 text-purple-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            } flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200`}
          >
            <BarChart3 className={`mr-2 h-5 w-5 ${activeTab === 'rekap' ? 'text-purple-600' : 'text-slate-400'}`} />
            Rekapitulasi per Kelas
          </button>
          <button
            onClick={() => setActiveTab('rekap_siswa')}
            className={`${
              activeTab === 'rekap_siswa'
                ? 'bg-pink-50 text-pink-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            } flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200`}
          >
            <Users className={`mr-2 h-5 w-5 ${activeTab === 'rekap_siswa' ? 'text-pink-600' : 'text-slate-400'}`} />
            Rekapitulasi per Siswa
          </button>
        </nav>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-6 flex-shrink-0 border border-slate-100">
        <div className="flex items-center mb-6 text-slate-800 font-bold text-lg border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <Filter className="h-5 w-5 text-indigo-600" />
          </div>
          Filter Laporan
        </div>
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-5 sm:gap-x-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Dispensasi</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
            >
              <option value="Semua">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Siswa</label>
            <input
              type="text"
              placeholder="Cari nama..."
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {activeTab === 'data' ? (
        <div className="bg-white shadow-lg rounded-2xl border border-slate-100 flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Waktu</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Siswa</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Jenis</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Alasan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                        <span className="text-sm font-medium text-slate-500">Memuat data laporan...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle className="h-12 w-12 mb-3 text-slate-300" />
                        <span className="text-base font-medium text-slate-500">Tidak ada data yang sesuai filter</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900">
                        <div className="whitespace-nowrap font-semibold">{item.date}</div>
                        <div className="whitespace-nowrap text-slate-500 text-xs mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded-md">{item.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3 flex-shrink-0">
                            {item.student_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{item.student_name}</div>
                            <div className="text-xs font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md mt-1">{item.class_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={item.follow_up}>{item.follow_up || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'rekap' ? (
        <div className="bg-white shadow-lg rounded-2xl border border-slate-100 flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Kelas</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Jenis Dispensasi</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Jumlah Dispensasi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {recapData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md border border-indigo-100">{item['Kelas']}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{item['Jenis Dispensasi']}</td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">{item['Jumlah Dispensasi']}</span>
                    </td>
                  </tr>
                ))}
                {recapData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle className="h-12 w-12 mb-3 text-slate-300" />
                        <span className="text-base font-medium text-slate-500">Tidak ada data rekapitulasi</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-2xl border border-slate-100 flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Nama Siswa</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Kelas</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Jenis Dispensasi</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Jumlah Dispensasi</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Alasan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {rekapSiswaData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{item['Nama Siswa']}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 text-xs">{item['Kelas']}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{item['Jenis Dispensasi']}</td>
                    <td className="px-6 py-4 text-sm font-bold text-pink-600">
                      <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full">{item['Jumlah Dispensasi']}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={item['Alasan']}>{item['Alasan']}</td>
                  </tr>
                ))}
                {rekapSiswaData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle className="h-12 w-12 mb-3 text-slate-300" />
                        <span className="text-base font-medium text-slate-500">Tidak ada data rekapitulasi siswa</span>
                      </div>
                    </td>
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
