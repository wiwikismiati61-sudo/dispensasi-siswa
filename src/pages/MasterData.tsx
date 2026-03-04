import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import * as XLSX from 'xlsx';
import { Upload, Plus, Trash2 } from 'lucide-react';

type TabType = 'siswa' | 'wali_kelas' | 'guru_bk' | 'jenis_dispensasi';

export default function MasterData() {
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
      let endpoint = '';
      if (activeTab === 'siswa') endpoint = '/students';
      if (activeTab === 'wali_kelas') endpoint = '/homeroom-teachers';
      if (activeTab === 'guru_bk') endpoint = '/bk-teachers';
      if (activeTab === 'jenis_dispensasi') endpoint = '/dispensation-types';
      
      const res = await api.get(endpoint);
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
        let endpoint = '';

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
          endpoint = '/students/import';
          if (formattedData.length === 0) {
            setErrorMessage('Format excel tidak sesuai. Pastikan ada kolom Nama dan Kelas.');
            return;
          }
        } else if (activeTab === 'wali_kelas' || activeTab === 'guru_bk') {
          formattedData = excelData.map((row: any) => {
            const getVal = (keys: string[]) => {
              const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
              return key && row[key] != null ? String(row[key]) : '';
            };
            return { name: getVal(['nama', 'name', 'guru', 'wali kelas']) };
          }).filter((t) => t.name);
          endpoint = activeTab === 'wali_kelas' ? '/homeroom-teachers/import' : '/bk-teachers/import';
          if (formattedData.length === 0) {
            setErrorMessage('Format excel tidak sesuai. Pastikan ada kolom Nama.');
            return;
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
          endpoint = '/dispensation-types/import';
          if (formattedData.length === 0) {
            setErrorMessage('Format excel tidak sesuai. Pastikan ada kolom Nama dan Kategori.');
            return;
          }
        }

        let payload: any = {};
        if (activeTab === 'siswa') {
          payload = { students: formattedData };
        } else if (activeTab === 'wali_kelas' || activeTab === 'guru_bk') {
          payload = { teachers: formattedData };
        } else if (activeTab === 'jenis_dispensasi') {
          payload = { types: formattedData };
        }

        await api.post(endpoint, payload);
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
      let endpoint = '';
      let payload = {};

      if (activeTab === 'siswa') {
        endpoint = '/students';
        payload = { ...studentForm, nis: Date.now().toString() + Math.floor(Math.random() * 1000) };
      } else if (activeTab === 'wali_kelas') {
        endpoint = '/homeroom-teachers';
        payload = teacherForm;
      } else if (activeTab === 'guru_bk') {
        endpoint = '/bk-teachers';
        payload = teacherForm;
      } else if (activeTab === 'jenis_dispensasi') {
        endpoint = '/dispensation-types';
        payload = dispensationForm;
      }

      await api.post(endpoint, payload);
      
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
      let endpoint = '';
      if (activeTab === 'siswa') endpoint = `/students/${deleteId}`;
      if (activeTab === 'wali_kelas') endpoint = `/homeroom-teachers/${deleteId}`;
      if (activeTab === 'guru_bk') endpoint = `/bk-teachers/${deleteId}`;
      if (activeTab === 'jenis_dispensasi') endpoint = `/dispensation-types/${deleteId}`;
      
      await api.delete(endpoint);
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
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-slate-900">{getTitle()}</h1>
        <div className="flex space-x-3">
          <label className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">
            <Upload className="-ml-1 mr-2 h-5 w-5 text-slate-500" />
            Import Excel
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Tambah Manual
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex-shrink-0">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {showAddForm && (
        <div className="bg-white shadow sm:rounded-lg p-6 flex-shrink-0">
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            {activeTab === 'siswa' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nama Siswa</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Kelas</label>
                  <input
                    type="text"
                    required
                    value={studentForm.class_name}
                    onChange={(e) => setStudentForm({ ...studentForm, class_name: e.target.value })}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </>
            )}

            {(activeTab === 'wali_kelas' || activeTab === 'guru_bk') && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Nama Guru</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}

            {activeTab === 'jenis_dispensasi' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nama Dispensasi</label>
                  <input
                    type="text"
                    required
                    value={dispensationForm.name}
                    onChange={(e) => setDispensationForm({ ...dispensationForm, name: e.target.value })}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Kategori</label>
                  <select
                    required
                    value={dispensationForm.category}
                    onChange={(e) => setDispensationForm({ ...dispensationForm, category: e.target.value })}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="mr-3 bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow sm:rounded-md flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {activeTab === 'jenis_dispensasi' ? 'Nama Dispensasi' : 'Nama'}
                </th>
                {activeTab === 'siswa' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas</th>
                )}
                {activeTab === 'jenis_dispensasi' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategori</th>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-sm text-slate-500">Belum ada data</td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                    {activeTab === 'siswa' && (
                      <td className="px-4 py-3 text-sm text-slate-500">{item.class_name}</td>
                    )}
                    {activeTab === 'jenis_dispensasi' && (
                      <td className="px-4 py-3 text-sm text-slate-500">{item.category}</td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-sm text-slate-500 mb-6">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-medium text-red-600 mb-4">Terjadi Kesalahan</h3>
            <p className="text-sm text-slate-500 mb-6">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-medium text-green-600 mb-4">Berhasil</h3>
            <p className="text-sm text-slate-500 mb-6">{successMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setSuccessMessage(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
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
