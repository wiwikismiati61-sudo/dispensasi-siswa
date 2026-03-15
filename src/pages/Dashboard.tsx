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
      const data = await api.getDashboardStats();
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
    <div className="flex flex-col h-full overflow-y-auto space-y-4 sm:space-y-6 pb-4 sm:pb-6 pr-1 sm:pr-2">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-slate-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative group">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="p-3 sm:p-4 relative z-10">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100 p-2 sm:p-2.5 rounded-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Siswa</dt>
                  <dd className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 mt-0.5">{stats.totalStudents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-slate-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative group">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="p-3 sm:p-4 relative z-10">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 p-2 sm:p-2.5 rounded-xl">
                <FileWarning className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Dispensasi</dt>
                  <dd className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 mt-0.5">{stats.totalDispensations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-slate-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative group">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="p-3 sm:p-4 relative z-10">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-emerald-100 to-teal-100 p-2 sm:p-2.5 rounded-xl">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">% Siswa Dispensasi</dt>
                  <dd className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 mt-0.5">{stats.percentage}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 flex-shrink-0">
        <div className="bg-white shadow-lg rounded-2xl p-3 sm:p-4 border border-slate-100">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2 sm:mb-3">Statistik Jenis Dispensasi</h3>
          <div className="h-40 sm:h-48 md:h-56">
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

        <div className="bg-white shadow-lg rounded-2xl p-3 sm:p-4 border border-slate-100">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2 sm:mb-3">Grafik Dispensasi per Kelas</h3>
          <div className="h-40 sm:h-48 md:h-56">
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

      <div className="bg-white shadow-lg rounded-2xl p-3 sm:p-4 border border-slate-100 flex-shrink-0">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2 sm:mb-3">Siswa Sering Dispensasi</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Dispensasi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {stats.frequentStudents.map((student: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[9px] sm:text-[10px] mr-2">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap">
                    <span className="px-1.5 sm:px-2 py-0.5 inline-flex text-[9px] sm:text-[10px] leading-4 font-semibold rounded-md bg-indigo-100 text-indigo-800">
                      {student.class_name}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-md">{student.count} kali</span>
                  </td>
                </tr>
              ))}
              {stats.frequentStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-[11px] text-slate-500 text-center font-medium bg-slate-50">
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
