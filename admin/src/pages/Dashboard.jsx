import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Activity, FileText, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../utils/ThemeContext';

const Dashboard = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    appointments: 0,
    pendingFeedback: 0,
    appointmentsToday: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: <Users size={24} />, bg: 'from-blue-500/20 to-blue-600/5', color: 'text-blue-400', border: 'border-blue-500/20' },
    { title: 'Appointments Today', value: stats.appointmentsToday, icon: <Calendar size={24} />, bg: 'from-purple-500/20 to-purple-600/5', color: 'text-purple-400', border: 'border-purple-500/20' },
    { title: 'Active Doctors', value: stats.doctors, icon: <Activity size={24} />, bg: 'from-emerald-500/20 to-emerald-600/5', color: 'text-emerald-400', border: 'border-emerald-500/20' },
    { title: 'Pending Feedback', value: stats.pendingFeedback, icon: <FileText size={24} />, bg: 'from-amber-500/20 to-amber-600/5', color: 'text-amber-400', border: 'border-amber-500/20' },
  ];

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin w-8 h-8 focus:outline-none border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="max-w-7xl mx-auto">
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-slate-400 mb-8">Real-time metrics and administration controls</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`backdrop-blur-sm border ${stat.border} rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-800/40' : 'bg-white shadow-lg'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bg} rounded-full blur-2xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                  } ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <h3 className="text-slate-400 font-medium text-sm mb-1">{stat.title}</h3>
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stat.value}</h2>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className={`backdrop-blur-sm border rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recent System Activity</h3>
              <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View All Logs</button>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex items-start gap-4 p-4 rounded-xl transition-colors border ${
                  theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/30' : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
                }`}>
                  <div className="mt-1 bg-indigo-500/10 text-indigo-400 p-2 rounded-lg">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>New User Registration</p>
                    <p className="text-xs text-slate-400 mt-1">user{i}@example.com registered as a Patient</p>
                  </div>
                  <div className="ml-auto text-xs text-slate-500">{i * 2} hours ago</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className={`backdrop-blur-sm border rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
             <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Server Status</h3>
             <div className="space-y-6">
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-sm text-slate-400 mb-1">CPU Usage</p>
                   <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>24%</p>
                 </div>
                 <div className="h-12 w-24 bg-emerald-500/10 rounded-lg relative overflow-hidden">
                   <div className="absolute bottom-0 left-0 w-full h-[24%] bg-emerald-500/50"></div>
                 </div>
               </div>
               
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-sm text-slate-400 mb-1">Memory (RAM)</p>
                   <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>6.2 GB</p>
                 </div>
                 <div className="h-12 w-24 bg-blue-500/10 rounded-lg relative overflow-hidden">
                   <div className="absolute bottom-0 left-0 w-full h-[62%] bg-blue-500/50"></div>
                 </div>
               </div>
             </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
