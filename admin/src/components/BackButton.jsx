import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';

const BackButton = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-x-1 mb-6 border ${
        theme === 'dark' 
          ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700' 
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
      }`}
    >
      <ArrowLeft size={18} />
      Go Back
    </button>
  );
};

export default BackButton;
