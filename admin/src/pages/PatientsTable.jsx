import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, ShieldAlert, ShieldCheck, Clock, Users, UserCheck, Calendar } from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../utils/ThemeContext';
import BackButton from '../components/BackButton';

const PatientsTable = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients');
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString, showTime = true) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    if (showTime) {
      return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const stats = [
    { label: 'Total Accounts', value: users.length, icon: <Users size={20} />, color: 'bg-indigo-500/10 text-indigo-400' },
    { label: 'Active Today', value: users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt).toDateString() === new Date().toDateString()).length, icon: <UserCheck size={20} />, color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'Recently Joined', value: users.filter(u => u.createdAt && (new Date() - new Date(u.createdAt)) < 7 * 24 * 60 * 60 * 1000).length, icon: <Calendar size={20} />, color: 'bg-amber-500/10 text-amber-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">Identity & Access</h1>
          <p className="text-slate-400 text-sm md:text-base">Comprehensive overview of all users and platform activity</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }}
            key={idx} 
            className={`backdrop-blur-xl border p-6 rounded-[2rem] flex items-center gap-5 shadow-xl transition-all duration-300 ${
              theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`p-4 rounded-2xl ${stat.color} shadow-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
        className={`backdrop-blur-xl border rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200'
        }`}
      >
        
        {/* Toolbar */}
        <div className={`p-6 border-b flex flex-wrap gap-4 items-center justify-between ${
          theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'
        }`}>
          <div className={`flex rounded-2xl px-5 py-3 border w-full md:w-96 items-center gap-3 transition-all shadow-inner ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-700/50 focus-within:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-300'
          }`}>
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`} 
            />
          </div>
          <button className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all active:scale-95 shadow-lg ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
          }`}>
            <Filter size={18} /> Advanced Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`text-xs uppercase tracking-widest font-bold ${
                theme === 'dark' ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-50/50 text-slate-500'
              }`}>
                <th className="p-6">User Account</th>
                <th className="p-6">Access Level</th>
                <th className="p-6">Registered On</th>
                <th className="p-6">System Access Details</th>
                <th className="p-6 text-center">Interactions</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-700/30 font-medium">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center"><div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div></td></tr>
              ) : (() => {
                const filteredUsers = users.filter((user) => {
                  const searchLower = searchTerm.toLowerCase();
                  return (
                    user.fullName.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.role.toLowerCase().includes(searchLower)
                  );
                });

                if (filteredUsers.length === 0) {
                  return (
                    <tr><td colSpan="6" className="p-20 text-center text-slate-500">Zero matching records found in the database.</td></tr>
                  );
                }

                return filteredUsers.map((user) => {
                  const isDoctor = user.role === 'doctor';
                  const isAdmin = user.role === 'admin';
                  
                  return (
                    <tr key={user._id} className="hover:bg-slate-800/30 transition-all group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform ${
                            theme === 'dark' ? 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-slate-700/50 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          }`}>
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.fullName}</div>
                            <div className="text-slate-500 text-xs tracking-tight">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border
                          ${isAdmin ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                            isDoctor ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6 text-slate-400">
                        {formatDate(user.createdAt, false)}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3 text-slate-300">
                          <Clock size={16} className="text-slate-600" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-200">{formatDate(user.lastLoginAt)}</span>
                            {user.lastLoginIp && <span className="text-[10px] font-mono text-slate-500">{user.lastLoginIp}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.loginCount || 0}</span>
                          <span className="text-[10px] text-slate-500 font-bold tracking-widest">SESSIONS</span>
                        </div>
                      </td>
                      <td className="p-6 text-right pr-8">
                        <button className={`transition-all p-2.5 rounded-xl border border-transparent ${
                          theme === 'dark' ? 'text-slate-500 hover:text-white hover:bg-slate-700 hover:border-slate-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100'
                        }`}>
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientsTable;
