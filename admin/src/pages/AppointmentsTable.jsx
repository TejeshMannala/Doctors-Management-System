import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CalendarDays, Key, MoreVertical, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../utils/ThemeContext';
import BackButton from '../components/BackButton';

const AppointmentsTable = () => {
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/admin');
      setAppointments(res.data.appointments || []);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdating(id);
      await api.put(`/appointments/${id}/status`, { status });
      // Update local state without refetching all
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-max"><CheckCircle2 size={14}/> Confirmed</span>;
      case 'pending': return <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-max"><Clock size={14}/> Pending</span>;
      case 'cancelled': return <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-max"><XCircle size={14}/> Cancelled</span>;
      case 'completed': return <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-max"><CheckCircle2 size={14}/> Completed</span>;
      default: return <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(apt => {
    const searchLower = searchTerm.toLowerCase();
    return (
      apt.patientId?.fullName?.toLowerCase().includes(searchLower) ||
      apt.patientId?.email?.toLowerCase().includes(searchLower) ||
      apt.doctorId?.userId?.fullName?.toLowerCase().includes(searchLower) ||
      apt.doctorId?.specialization?.toLowerCase().includes(searchLower) ||
      apt.consultationType?.toLowerCase().includes(searchLower) ||
      apt.status?.toLowerCase().includes(searchLower) ||
      new Date(apt.date).toLocaleDateString().toLowerCase().includes(searchLower) ||
      apt.timeSlot?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Appointments Dashboard</h1>
          <p className="text-slate-400 text-sm">View and manage all appointments across the system {filteredAppointments.length !== appointments.length && `(${filteredAppointments.length} of ${appointments.length} shown)`}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
        className={`backdrop-blur-sm border rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200 shadow-xl'
        }`}
      >
        <div className={`p-4 border-b flex flex-wrap gap-4 items-center ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className={`flex rounded-xl px-4 py-2 border w-full md:w-80 items-center gap-2 transition-colors ${
            theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50 focus-within:border-indigo-500' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-300'
          }`}>
            <Search size={16} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Search appointments..." 
              className={`bg-transparent border-none outline-none text-sm w-full ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider font-semibold ${
                theme === 'dark' ? 'bg-slate-900/30 text-slate-400' : 'bg-slate-50/50 text-slate-500'
              }`}>
                <th className="p-4 pl-6">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-700/30">
               {loading ? (
                 <tr><td colSpan="6" className="p-8 text-center text-slate-500 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></td></tr>
               ) : filteredAppointments.length === 0 ? (
                 <tr><td colSpan="6" className="p-8 text-center text-slate-500">{searchTerm ? 'No appointments match your search.' : 'No appointments found.'}</td></tr>
               ) : (
                 filteredAppointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 pl-6 leading-tight">
                        <div className="text-white font-medium">{apt.patientId?.fullName || 'Unknown'}</div>
                        <div className="text-slate-500 text-xs">{apt.patientId?.email}</div>
                      </td>
                      <td className="p-4 leading-tight">
                        <div className="text-white font-medium">Dr. {apt.doctorId?.userId?.fullName || 'Unknown'}</div>
                        <div className="text-slate-500 text-xs">{apt.doctorId?.specialization || 'General'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <CalendarDays size={14} className="text-slate-500" />
                          <div className="flex flex-col">
                            <span>{new Date(apt.date).toLocaleDateString()}</span>
                            <span className="text-xs text-indigo-400 font-medium">{apt.timeSlot}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md text-xs border border-slate-700">{apt.consultationType}</span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                           <select 
                             value={apt.status} 
                             onChange={(e) => handleUpdateStatus(apt._id, e.target.value)}
                             disabled={updating === apt._id}
                             className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none"
                           >
                             <option value="pending">Pending</option>
                             <option value="confirmed">Confirmed</option>
                             <option value="completed">Completed</option>
                             <option value="cancelled">Cancelled</option>
                           </select>
                           {updating === apt._id && <Loader2 size={16} className="animate-spin text-indigo-400" />}
                         </div>
                      </td>
                    </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AppointmentsTable;
