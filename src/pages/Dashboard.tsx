import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Users, FileWarning, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/dashboard');
      setStats(data);
    } catch (error: any) {
      console.error('Failed to fetch stats', error);
      setError(error.message || 'Failed to fetch stats');
    }
  };

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 shadow-sm flex items-center">
      <FileWarning className="w-6 h-6 mr-3" />
      <span className="font-medium">Error: {error}</span>
    </div>
  );
  if (!stats) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-8 pb-8 pr-2">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-slate-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="p-6 relative z-10">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Siswa</dt>
                  <dd className="text-4xl font-extrabold text-slate-800 mt-1">{stats.totalStudents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-slate-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="p-6 relative z-10">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
                <FileWarning className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Dispensasi</dt>
                  <dd className="text-4xl font-extrabold text-slate-800 mt-1">{stats.totalDispensations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-slate-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="p-6 relative z-10">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-xl">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider">% Siswa Dispensasi</dt>
                  <dd className="text-4xl font-extrabold text-slate-800 mt-1">{stats.percentage}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 flex-shrink-0">
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Statistik Jenis Dispensasi</h3>
          <div className="h-72">
            {stats.typeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.typeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="type"
                    paddingAngle={5}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.typeStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium bg-slate-50 rounded-xl">Belum ada data</div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Grafik Dispensasi per Kelas</h3>
          <div className="h-72">
            {stats.classStats && stats.classStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.classStats}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="class_name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="count" name="Jumlah Dispensasi" fill="url(#colorUv)" radius={[6, 6, 0, 0]}>
                    {stats.classStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium bg-slate-50 rounded-xl">Belum ada data</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100 flex-shrink-0">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Siswa Sering Dispensasi</h3>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Dispensasi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {stats.frequentStudents.map((student: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {student.class_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{student.count} kali</span>
                  </td>
                </tr>
              ))}
              {stats.frequentStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 whitespace-nowrap text-sm text-slate-500 text-center font-medium bg-slate-50">
                    Belum ada data siswa yang sering dispensasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
