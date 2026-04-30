import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, AlertCircle, CheckCircle } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, show }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const icons = {
    info: <Info className="text-blue-400" size={20} />,
    warning: <AlertCircle className="text-amber-400" size={20} />,
    success: <CheckCircle className="text-emerald-400" size={20} />,
    notification: <Bell className="text-indigo-400" size={20} />,
  };

  const colors = {
    info: 'bg-blue-500/10 border-blue-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20',
    notification: 'bg-indigo-500/10 border-indigo-500/20',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className={`fixed top-6 right-6 z-[100] flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px] ${colors[type]}`}
        >
          <div className="p-2 rounded-xl bg-slate-900/50">
            {icons[type]}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">System Notification</p>
            <p className="text-xs text-slate-400 mt-0.5">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
          
          <motion.div 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-white/20 origin-left rounded-full w-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
