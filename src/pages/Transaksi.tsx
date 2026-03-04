import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function Transaksi() {
  const [dispensations, setDispensations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [homeroomTeachers, setHomeroomTeachers] = useState<any[]>([]);
  const [bkTeachers, setBkTeachers] = useState<any[]>([]);
  const [dispensationTypes, setDispensationTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    student_id: '',
    type: '',
    reason: '',
    homeroom_teacher: '',
    bk_teacher: '',
    follow_up: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dispRes, studRes, hrRes, bkRes, typeRes] = await Promise.all([
        api.get('/dispensations'),
        api.get('/students'),
        api.get('/homeroom-teachers'),
        api.get('/bk-teachers'),
        api.get('/dispensation-types')
      ]);
      setDispensations(dispRes);
      setStudents(studRes);
      setHomeroomTeachers(hrRes);
      setBkTeachers(bkRes);
      setDispensationTypes(typeRes);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const CLASSES = [
    '7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H',
    '8A', '8B', '8C', '8D', '8E', '8F', '8G', '8H',
    '9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H'
  ];

  const filteredStudents = selectedClass 
    ? students.filter(s => s.class_name.toUpperCase() === selectedClass.toUpperCase())
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/dispensations/${editingId}`, formData);
      } else {
        await api.post('/dispensations', formData);
      }
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        student_id: '',
        type: '',
        reason: '',
        homeroom_teacher: '',
        bk_teacher: '',
        follow_up: ''
      });
      setSelectedClass('');
      setShowAddForm(false);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      setErrorMessage(`Gagal ${editingId ? 'mengubah' : 'menambah'} data: ` + error.message);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      date: item.date,
      time: item.time,
      student_id: item.student_id,
      type: item.type,
      reason: item.reason,
      homeroom_teacher: item.homeroom_teacher,
      bk_teacher: item.bk_teacher,
      follow_up: item.follow_up || ''
    });
    setSelectedClass(item.class_name);
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/dispensations/${deleteId}`);
      setDeleteId(null);
      fetchData();
    } catch (error) {
      setErrorMessage('Gagal menghapus data');
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center flex-shrink-0">
        <h1 className="text-2xl font-semibold text-slate-900">Transaksi Dispensasi</h1>
        <button
          onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditingId(null);
              setFormData({
                date: format(new Date(), 'yyyy-MM-dd'),
                time: format(new Date(), 'HH:mm'),
                student_id: '',
                type: '',
                reason: '',
                homeroom_teacher: '',
                bk_teacher: '',
                follow_up: ''
              });
              setSelectedClass('');
            } else {
              setShowAddForm(true);
            }
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          {showAddForm ? 'Batal' : 'Tambah Dispensasi'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white shadow sm:rounded-lg p-6 flex-shrink-0">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Tanggal</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Jam</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Kelas</label>
                <select
                  required
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setFormData({ ...formData, student_id: '' }); // Reset student when class changes
                  }}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Pilih Kelas...</option>
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Siswa</label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  disabled={!selectedClass}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">{selectedClass ? 'Pilih Siswa...' : 'Pilih Kelas Terlebih Dahulu'}</option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Jenis Dispensasi</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Pilih Jenis...</option>
                {dispensationTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name} ({type.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Alasan</label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nama Wali Kelas</label>
              <select
                required
                value={formData.homeroom_teacher}
                onChange={(e) => setFormData({ ...formData, homeroom_teacher: e.target.value })}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Pilih Wali Kelas...</option>
                {homeroomTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nama Guru BK</label>
              <select
                required
                value={formData.bk_teacher}
                onChange={(e) => setFormData({ ...formData, bk_teacher: e.target.value })}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Pilih Guru BK...</option>
                {bkTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Tindak Lanjut</label>
              <textarea
                rows={3}
                value={formData.follow_up}
                onChange={(e) => setFormData({ ...formData, follow_up: e.target.value })}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData({
                    date: format(new Date(), 'yyyy-MM-dd'),
                    time: format(new Date(), 'HH:mm'),
                    student_id: '',
                    type: '',
                    reason: '',
                    homeroom_teacher: '',
                    bk_teacher: '',
                    follow_up: ''
                  });
                  setSelectedClass('');
                }}
                className="mr-3 bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

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
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : dispensations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-slate-500">Belum ada data transaksi</td>
                </tr>
              ) : (
                dispensations.map((item) => (
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
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit2 className="h-5 w-5 inline" />
                      </button>
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
    </div>
  );
}
