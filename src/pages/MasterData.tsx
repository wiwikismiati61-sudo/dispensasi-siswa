import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import * as XLSX from 'xlsx';
import { Upload, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

type TabType = 'siswa' | 'wali_kelas' | 'guru_bk' | 'jenis_dispensasi';

export default function MasterData() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || '';
  const isAdmin = userRole === 'full access' || userRole === 'admin' || userRole === 'administrator' || user?.username === 'admin';
  const canEdit = isAdmin || userRole === 'input data dan edit' || userRole === 'kesiswaan' || user?.username?.toLowerCase() === 'kesiswaan';
  const canDelete = isAdmin;
  const [activeTab, setActiveTab] = useState<TabType>('siswa');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form states
  const [studentForm, setStudentForm] = useState({ name: '', class_name: '' });
  const [teacherForm, setTeacherForm] = useState({ name: '' });
  const [dispensationForm, setDispensationForm] = useState({ name: '', category: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res: any[] = [];
      if (activeTab === 'siswa') res = await api.getStudents() || [];
      if (activeTab === 'wali_kelas') res = await api.getTeachers('homeroom') || [];
      if (activeTab === 'guru_bk') res = await api.getTeachers('bk') || [];
      if (activeTab === 'jenis_dispensasi') res = await api.getDispensationTypes() || [];
      
      setData(res);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const excelData = XLSX.utils.sheet_to_json(ws);
        
        let formattedData: any[] = [];

        if (activeTab === 'siswa') {
          formattedData = excelData.map((row: any, index: number) => {
            const getVal = (keys: string[]) => {
              const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
              return key && row[key] != null ? String(row[key]) : '';
            };
            const name = getVal(['nama', 'name', 'nama siswa', 'siswa']);
            const className = getVal(['kelas', 'class', 'rombel']);
            const nis = getVal(['nis', 'nisn', 'nomor induk']);
            return {
              nis: nis || `TEMP-${name}-${className}-${index}`.replace(/\s+/g, '-').toUpperCase(),
              name: name,
              class_name: className
            };
          }).filter((s) => s.name);
          
          if (formattedData.length === 0) {
            setErrorMessage('Format excel tidak sesuai. Pastikan ada kolom Nama dan Kelas.');
            return;
          }
          for (const student of formattedData) {
            await api.addStudent(student);
          }
        } else if (activeTab === 'wali_kelas' || activeTab === 'guru_bk') {
          formattedData = excelData.map((row: any) => {
            const getVal = (keys: string[]) => {
              const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
              return key && row[key] != null ? String(row[key]) : '';
            };
            return { 
              name: getVal(['nama', 'name', 'guru', 'wali kelas']),
              type: activeTab === 'wali_kelas' ? 'homeroom' : 'bk'
            };
          }).filter((t) => t.name);
          
          if (formattedData.length === 0) {
            setErrorMessage('Format excel tidak sesuai. Pastikan ada kolom Nama.');
            return;
          }
          for (const teacher of formattedData) {
            await api.addTeacher(teacher);
          }
        } else if (activeTab === 'jenis_dispensasi') {
          formattedData = excelData.map((row: any) => {
            const getVal = (keys: string[]) => {
              const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
              return key && row[key] != null ? String(row[key]) : '';
            };
            return { 
              name: getVal(['nama', 'jenis', 'alasan', 'name']),
              category: getVal(['kategori', 'category', 'kelompok'])
            };
          }).filter((d) => d.name && d.category);
          
          if (formattedData.length === 0) {
            setErrorMessage('Format excel tidak sesuai. Pastikan ada kolom Nama dan Kategori.');
            return;
          }
          for (const type of formattedData) {
            await api.addDispensationType(type);
          }
        }

        setSuccessMessage('Data berhasil diimport');
        fetchData();
      } catch (error) {
        console.error('Error importing data', error);
        setErrorMessage('Gagal mengimport data');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'siswa') {
        await api.addStudent({ ...studentForm, nis: Date.now().toString() + Math.floor(Math.random() * 1000) });
      } else if (activeTab === 'wali_kelas') {
        await api.addTeacher({ ...teacherForm, type: 'homeroom' });
      } else if (activeTab === 'guru_bk') {
        await api.addTeacher({ ...teacherForm, type: 'bk' });
      } else if (activeTab === 'jenis_dispensasi') {
        await api.addDispensationType(dispensationForm);
      }

      setStudentForm({ name: '', class_name: '' });
      setTeacherForm({ name: '' });
      setDispensationForm({ name: '', category: '' });
      setShowAddForm(false);
      fetchData();
    } catch (error: any) {
      setErrorMessage('Gagal menambah data: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const idStr = deleteId.toString();
      if (activeTab === 'siswa') await api.deleteStudent(idStr);
      if (activeTab === 'wali_kelas' || activeTab === 'guru_bk') await api.deleteTeacher(idStr);
      if (activeTab === 'jenis_dispensasi') await api.deleteDispensationType(idStr);
      
      setDeleteId(null);
      fetchData();
    } catch (error) {
      setErrorMessage('Gagal menghapus data');
      setDeleteId(null);
    }
  };

  const getTitle = () => {
    if (activeTab === 'siswa') return 'Master Data Siswa';
    if (activeTab === 'wali_kelas') return 'Master Data Wali Kelas';
    if (activeTab === 'guru_bk') return 'Master Data Guru BK';
    if (activeTab === 'jenis_dispensasi') return 'Master Data Jenis Dispensasi';
  };

  return (
    <div className="flex flex-col h-full space-y-4 sm:space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 flex-shrink-0">
        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">{getTitle()}</h1>
        {canEdit && (
          <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
            <label className="flex-1 sm:flex-none inline-flex justify-center items-center px-2.5 py-1.5 sm:px-3 sm:py-2 border border-slate-200 shadow-sm text-xs font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all duration-200">
              <Upload className="-ml-1 mr-1.5 h-4 w-4 text-indigo-500" />
              <span className="hidden sm:inline">Import Excel</span>
              <span className="sm:hidden">Import</span>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-2.5 py-1.5 sm:px-3 sm:py-2 border border-transparent shadow-md text-xs font-bold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="-ml-1 mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Tambah Manual</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1 flex-shrink-0 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max" aria-label="Tabs">
          {[
            { id: 'siswa', label: 'Siswa' },
            { id: 'wali_kelas', label: 'Wali Kelas' },
            { id: 'guru_bk', label: 'Guru BK' },
            { id: 'jenis_dispensasi', label: 'Jenis Dispensasi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setShowAddForm(false);
              }}
              className={`
                whitespace-nowrap py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg font-bold text-xs transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {showAddForm && (
        <div className="bg-white shadow-lg rounded-xl p-3 sm:p-4 border border-slate-100 flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-800">Form Tambah Data</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Silakan isi form di bawah ini untuk menambahkan data baru.</p>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-y-3 sm:gap-y-4 sm:grid-cols-2 sm:gap-x-4">
            {activeTab === 'siswa' && (
              <>
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Nama Siswa</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="block w-full border border-slate-200 rounded-lg shadow-sm py-1.5 sm:py-2 px-2.5 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[11px] sm:text-xs bg-slate-50 focus:bg-white"
                    placeholder="Masukkan nama siswa"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    value={studentForm.class_name}
                    onChange={(e) => setStudentForm({ ...studentForm, class_name: e.target.value })}
                    className="block w-full border border-slate-200 rounded-lg shadow-sm py-1.5 sm:py-2 px-2.5 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[11px] sm:text-xs bg-slate-50 focus:bg-white"
                    placeholder="Contoh: X RPL 1"
                  />
                </div>
              </>
            )}

            {(activeTab === 'wali_kelas' || activeTab === 'guru_bk') && (
              <div className="sm:col-span-2">
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Nama Guru</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="block w-full border border-slate-200 rounded-lg shadow-sm py-1.5 sm:py-2 px-2.5 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[11px] sm:text-xs bg-slate-50 focus:bg-white"
                  placeholder="Masukkan nama guru beserta gelar"
                />
              </div>
            )}

            {activeTab === 'jenis_dispensasi' && (
              <>
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Nama Dispensasi</label>
                  <input
                    type="text"
                    required
                    value={dispensationForm.name}
                    onChange={(e) => setDispensationForm({ ...dispensationForm, name: e.target.value })}
                    className="block w-full border border-slate-200 rounded-lg shadow-sm py-1.5 sm:py-2 px-2.5 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[11px] sm:text-xs bg-slate-50 focus:bg-white"
                    placeholder="Masukkan nama/alasan dispensasi"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    required
                    value={dispensationForm.category}
                    onChange={(e) => setDispensationForm({ ...dispensationForm, category: e.target.value })}
                    className="block w-full border border-slate-200 rounded-lg shadow-sm py-1.5 sm:py-2 px-2.5 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[11px] sm:text-xs bg-slate-50 focus:bg-white"
                  >
                    <option value="">Pilih Kategori...</option>
                    <option value="Dispensasi Keluarga">Dispensasi Keluarga</option>
                    <option value="Dispensasi Kegiatan Sekolah">Dispensasi Kegiatan Sekolah</option>
                    <option value="Dispensasi Kegiatan Dinas/Undangan resmi">Dispensasi Kegiatan Dinas/Undangan resmi</option>
                    <option value="Dispensasi Khusus /Kondisional">Dispensasi Khusus /Kondisional</option>
                  </select>
                </div>
              </>
            )}

            <div className="sm:col-span-2 flex justify-end pt-2 sm:pt-3 border-t border-slate-100 mt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="mr-2 sm:mr-3 bg-white py-1.5 sm:py-2 px-3 sm:px-4 border border-slate-200 rounded-lg shadow-sm text-[11px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg shadow-md py-1.5 sm:py-2 px-3 sm:px-4 inline-flex justify-center text-[11px] sm:text-xs font-bold text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Simpan Data
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl border border-slate-100 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {activeTab === 'jenis_dispensasi' ? 'Nama Dispensasi' : 'Nama'}
                </th>
                {activeTab === 'siswa' && (
                  <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Kelas</th>
                )}
                {activeTab === 'jenis_dispensasi' && (
                  <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Kategori</th>
                )}
                {canDelete && (
                  <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-3 sm:px-4 py-6 sm:py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-indigo-600 mb-2 sm:mb-3"></div>
                      <span className="text-[11px] sm:text-xs font-medium text-slate-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 sm:px-4 py-6 sm:py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-slate-300" />
                      <span className="text-xs sm:text-sm font-medium text-slate-500">Belum ada data</span>
                      <span className="text-[10px] sm:text-[11px] mt-1">Silakan tambah data manual atau import dari Excel.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-800">{item.name}</td>
                    {activeTab === 'siswa' && (
                      <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs text-slate-600">
                        <span className="px-2 py-0.5 inline-flex text-[9px] sm:text-[10px] leading-4 font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {item.class_name}
                        </span>
                      </td>
                    )}
                    {activeTab === 'jenis_dispensasi' && (
                      <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs text-slate-600">
                        <span className="px-2 py-0.5 inline-flex text-[9px] sm:text-[10px] leading-4 font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                          {item.category}
                        </span>
                      </td>
                    )}
                    {canDelete && (
                      <td className="px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap text-right text-[11px] sm:text-xs font-medium">
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all scale-100">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan dan data akan hilang permanen.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 shadow-sm transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border-t-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Terjadi Kesalahan</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border-t-4 border-emerald-500">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Berhasil</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">{successMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setSuccessMessage(null)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
