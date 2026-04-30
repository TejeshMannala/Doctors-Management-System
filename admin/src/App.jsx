import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, LogOut, FileText, Bell, Search, Activity, Heart, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientsTable from './pages/PatientsTable';
import DoctorsTable from './pages/DoctorsTable';
import AppointmentsTable from './pages/AppointmentsTable';
import SupportPage from './pages/FeedbackTable';
import MedicineOrdersTable from './pages/MedicineOrdersTable';
import Toast from './components/Toast';
import api from './utils/api';
import { ThemeProvider, useTheme } from './utils/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import NotFound from './pages/NotFound';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Appointments', path: '/appointments', icon: <Calendar size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Doctors', path: '/doctors', icon: <Activity size={20} /> },
    { name: 'Orders', path: '/orders', icon: <Heart size={20} /> },
    { name: 'Feedback', path: '/support', icon: <FileText size={20} /> },
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div 
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className={`fixed lg:static inset-y-0 left-0 w-[280px] border-r backdrop-blur-xl flex flex-col p-6 z-50 transition-all duration-300 lg:translate-x-0 lg:opacity-100 ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-2xl lg:shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide">
              MediAdmin
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                to={item.path} 
                key={item.name}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : theme === 'dark' 
                      ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {item.icon}
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 mt-auto"
        >
          <LogOut size={20} />
          Logout
        </button>
      </motion.div>
    </>
  );
};

const Header = ({ pendingCount, onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  let adminName = 'Admin';
  try {
    const info = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    if (info.fullName) adminName = info.fullName.split(' ')[0];
  } catch(e) {}

  return (
    <div className={`h-20 px-4 md:px-8 flex items-center justify-between border-b backdrop-blur-xl sticky top-0 z-20 transition-all duration-300 ${
      theme === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white/60 shadow-sm'
    }`}>
      <button 
        onClick={onMenuClick}
        className={`lg:hidden p-2.5 rounded-xl border transition-all ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700' 
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
        }`}
      >
        <Menu size={24} />
      </button>
      
      <div className="flex items-center gap-2 md:gap-5 ml-auto">
        <button 
          onClick={toggleTheme}
          className={`p-2 md:p-2.5 rounded-full border transition-all transform hover:-translate-y-0.5 ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 shadow-sm'
          }`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className={`relative p-2 md:p-2.5 rounded-full border transition-all transform hover:-translate-y-0.5 ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white' 
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
        }`}>
          <Bell size={20} />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border-2 border-slate-900 dark:border-slate-900">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        <div className={`flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l cursor-pointer group ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="hidden sm:flex flex-col items-end">
            <span className={`text-sm font-semibold group-hover:text-indigo-400 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>{adminName}</span>
            <span className="text-xs text-slate-500">Administrator</span>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            {adminName.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  );
};

const LayoutContainer = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const checkNotifications = useCallback(async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        const newCount = response.data.stats.pendingFeedback;
        
        if (newCount > pendingCount && Date.now() - lastNotificationTime > 30000) {
          setShowToast(true);
          setLastNotificationTime(Date.now());
        }
        
        setPendingCount(newCount);
      }
    } catch (error) {
      console.error('Failed to poll notifications', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = '/login';
      }
    }
  }, [pendingCount, lastNotificationTime]);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  // Sync sidebar state with screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)} 
        type="notification"
        message={`You have ${pendingCount} pending feedback ticket(s) waiting for response.`}
      />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pendingCount={pendingCount} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <LayoutContainer>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<PatientsTable />} />
                  <Route path="/doctors" element={<DoctorsTable />} />
                  <Route path="/appointments" element={<AppointmentsTable />} />
                  <Route path="/orders" element={<MedicineOrdersTable />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </LayoutContainer>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
