import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';

const NotFound = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/40"
          >
            <FileQuestion size={48} className="text-white" />
          </motion.div>
        </div>

        <h1 className="text-6xl font-black mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold mb-4">Resource Not Found</h2>
        <p className="text-slate-400 mb-10 leading-relaxed">
          The page you are looking for might have been moved, deleted, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <Home size={20} />
            Go to Dashboard
          </Link>
          <button 
            onClick={() => window.history.back()}
            className={`flex items-center justify-center gap-2 border px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
