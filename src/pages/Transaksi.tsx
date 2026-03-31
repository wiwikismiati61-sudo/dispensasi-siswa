import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2, AlertCircle, Calendar, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function Transaksi() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || '';
  const isAdmin = userRole === 'full access' || userRole === 'admin' || userRole === 'administrator' || user?.username === 'admin';
  const canEdit = isAdmin || userRole === 'input data dan edit';
  const canDelete = isAdmin;
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
        api.getDispensations(),
        api.getStudents(),
        api.getTeachers('homeroom'),
        api.getTeachers('bk'),
        api.getDispensationTypes()
      ]);
      setDispensations(dispRes || []);
      setStudents(studRes || []);
      setHomeroomTeachers(hrRes || []);
      setBkTeachers(bkRes || []);
      setDispensationTypes(typeRes || []);
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
        await api.updateDispensation(editingId.toString(), formData);
      } else {
        await api.addDispensation(formData);
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
      await api.deleteDispensation(deleteId.toString());
      setDeleteId(null);
      fetchData();
    } catch (error) {
      setErrorMessage('Gagal menghapus data');
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 sm:space-y-6 pb-6">
      <div className="flex justify-between items-center flex-shrink-0">
        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Transaksi Dispensasi</h1>
        {canEdit && (
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
            className={`inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 border border-transparent shadow-md text-xs font-bold rounded-lg text-white transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
              showAddForm 
                ? 'bg-slate-500 hover:bg-slate-600' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            }`}
          >
            {showAddForm ? (
              'Batal'
            ) : (
              <>
                <Plus className="-ml-1 mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Tambah Dispensasi</span>
                <span className="sm:hidden">Tambah</span>
              </>
            )}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white shadow-lg rounded-xl p-3 sm:p-4 border border-slate-100 flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-800">{editingId ? 'Edit Data Dispensasi' : 'Form Tambah Dispensasi'}</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Silakan isi form di bawah ini dengan lengkap.</p>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                </div>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="block w-full pl-6 sm:pl-8 border border-slate-200 rounded-md shadow-sm py-1 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[10px] sm:text-xs bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1">Jam</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                </div>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="block w-full pl-6 sm:pl-8 border border-slate-200 rounded-md shadow-sm py-1 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[10px] sm:text-xs bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1">Kelas</label>
              <select
                required
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setFormData({ ...formData, student_id: '' });
                }}
                className="block w-full border border-slate-200 rounded-md shadow-sm py-1 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[10px] sm:text-xs bg-slate-50 focus:bg-white"
              >
                <option value="">Pilih...</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1">Siswa</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                </div>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  disabled={!selectedClass}
                  className="block w-full pl-6 sm:pl-8 border border-slate-200 rounded-md shadow-sm py-1 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[10px] sm:text-xs bg-slate-50 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="">{selectedClass ? 'Pilih...' : 'Pilih Kelas'}</option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1">Jenis Dispensasi</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="block w-full border border-slate-200 rounded-md shadow-sm py-1 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[10px] sm:text-xs bg-slate-50 focus:bg-white"
              >
                <option value="">Pilih...</option>
                {dispensationTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1">Alasan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="block w-full pl-6 sm:pl-8 border border-slate-200 rounded-md shadow-sm py-1 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[10px] sm:text-xs bg-slate-50 focus:bg-white"
                  placeholder="Alasan detail"
                />
              </div>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1">Wali Kelas</label>
              <select
                required
                value={formData.homeroom_teacher}
                onChange={(e) => setFormData({ ...formData, homeroom_teacher: e.target.value })}
                className="block w-full border border-slate-200 rounded-md shadow-sm py-1 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[10px] sm:text-xs bg-slate-50 focus:bg-white"
              >
                <option value="">Pilih...</option>
                {homeroomTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1">Guru BK</label>
              <select
                required
                value={formData.bk_teacher}
                onChange={(e) => setFormData({ ...formData, bk_teacher: e.target.value })}
                className="block w-full border border-slate-200 rounded-md shadow-sm py-1 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[10px] sm:text-xs bg-slate-50 focus:bg-white"
              >
                <option value="">Pilih...</option>
                {bkTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1">Tindak Lanjut</label>
              <textarea
                rows={1}
                value={formData.follow_up}
                onChange={(e) => setFormData({ ...formData, follow_up: e.target.value })}
                className="block w-full border border-slate-200 rounded-md shadow-sm py-1 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-[10px] sm:text-xs bg-slate-50 focus:bg-white resize-none"
                placeholder="Catatan tindak lanjut (opsional)"
              />
            </div>
            <div className="col-span-2 flex justify-end pt-2 mt-1 border-t border-slate-100">
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
                className="mr-2 sm:mr-3 bg-white py-1.5 sm:py-2 px-3 sm:px-4 border border-slate-200 rounded-lg shadow-sm text-[11px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg shadow-md py-1.5 sm:py-2 px-3 sm:px-4 inline-flex justify-center text-[11px] sm:text-xs font-bold text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Data'}
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
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Waktu</th>
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Siswa</th>
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Jenis</th>
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Alasan</th>
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tindak Lanjut</th>
                {(canEdit || canDelete) && (
                  <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-4 py-6 sm:py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-indigo-600 mb-2 sm:mb-3"></div>
                      <span className="text-[11px] sm:text-xs font-medium text-slate-500">Memuat data transaksi...</span>
                    </div>
                  </td>
                </tr>
              ) : dispensations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-4 py-6 sm:py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-slate-300" />
                      <span className="text-xs sm:text-sm font-medium text-slate-500">Belum ada data transaksi</span>
                      <span className="text-[10px] sm:text-[11px] mt-1">Silakan tambah data dispensasi baru.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                dispensations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs text-slate-900">
                      <div className="whitespace-nowrap font-semibold">{item.date}</div>
                      <div className="whitespace-nowrap text-slate-500 text-[9px] sm:text-[10px] mt-1 bg-slate-100 inline-block px-1.5 py-0.5 rounded-md">{item.time}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                      <div className="flex items-center">
                        <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[9px] sm:text-[10px] mr-2 flex-shrink-0">
                          {item.student_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[11px] sm:text-xs font-bold text-slate-800">{item.student_name}</div>
                          <div className="text-[9px] sm:text-[10px] font-medium text-indigo-600 bg-indigo-50 inline-block px-1.5 py-0.5 rounded-md mt-0.5">{item.class_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs text-slate-600">
                      <span className="px-2 py-0.5 inline-flex text-[9px] sm:text-[10px] leading-4 font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs text-slate-600 max-w-[100px] sm:max-w-[150px] truncate" title={item.reason}>{item.reason}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs text-slate-600 max-w-[100px] sm:max-w-[150px] truncate" title={item.follow_up}>{item.follow_up || '-'}</td>
                    {(canEdit || canDelete) && (
                      <td className="px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap text-right text-[11px] sm:text-xs font-medium">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors mr-1"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
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
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Apakah Anda yakin ingin menghapus data transaksi ini? Tindakan ini tidak dapat dibatalkan.</p>
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
    </div>
  );
}
