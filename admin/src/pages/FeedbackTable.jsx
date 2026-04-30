import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, Send, Search } from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../utils/ThemeContext';
import BackButton from '../components/BackButton';

const SupportPage = () => {
  const { theme } = useTheme();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/admin/feedback');
      setFeedbacks(res.data.feedbacks || []);
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
      // Fallback display if endpoint 404s until fully implemented on their specific backend ver
      if(error.response?.status === 404) {
        setFeedbacks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    const adminReply = replyText[id]?.trim();
    if (!adminReply) return;

    try {
      setSending(id);
      const response = await api.put(`/support/admin/feedback/${id}/reply`, {
        adminReply,
        status: 'resolved',
      });

      const updatedFeedback = response.data.feedback;
      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback._id === id
            ? { ...feedback, ...updatedFeedback, user: feedback.user }
            : feedback
        )
      );
      setReplyText((prev) => ({ ...prev, [id]: updatedFeedback?.adminReply || adminReply }));
    } catch (error) {
      console.error("Failed to send reply", error);
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Support tickets</h1>
          <p className="text-slate-400">Respond to patient inquiries and feedback</p>
        </div>
        
        <div className={`flex rounded-2xl px-5 py-3 border w-full md:w-80 items-center gap-3 transition-all shadow-inner ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-700/50 focus-within:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-300'
        }`}>
          <Search size={18} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`} 
          />
        </div>
      </motion.div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>
        ) : (() => {
          const filteredFeedbacks = feedbacks.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
              item.subject?.toLowerCase().includes(searchLower) ||
              item.message?.toLowerCase().includes(searchLower) ||
              item.user?.fullName?.toLowerCase().includes(searchLower) ||
              item.user?.email?.toLowerCase().includes(searchLower)
            );
          });

          if (filteredFeedbacks.length === 0) {
            return (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-12 text-center text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{searchTerm ? 'No tickets match your search.' : 'No feedback tickets found at the moment.'}</p>
              </div>
            );
          }

          return filteredFeedbacks.map((item, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
               key={item._id} 
               className={`backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
                 theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200 shadow-lg'
               }`}
             >
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.subject}</h3>
                   <p className="text-sm text-slate-400">From: {item.user?.fullName} ({item.user?.email})</p>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                   item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                   'bg-amber-500/10 text-amber-400 border-amber-500/20'
                 }`}>
                   {item.status.toUpperCase()}
                 </span>
               </div>
               
               <div className="bg-slate-900/50 p-4 rounded-xl mb-4 border border-slate-700 text-slate-300 text-sm">
                 {item.message}
               </div>

               {item.status === 'resolved' || item.adminReply ? (
                 <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                   <p className="text-xs text-indigo-400 font-semibold mb-1">Admin Reply Sent:</p>
                   <p className="text-sm text-slate-300">{item.adminReply}</p>
                 </div>
               ) : (
                 <div className="flex gap-3">
                   <input 
                     type="text" 
                     placeholder="Type your response..."
                     value={replyText[item._id] || ''}
                     onChange={(e) => setReplyText({ ...replyText, [item._id]: e.target.value })}
                     className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                   />
                   <button 
                     onClick={() => handleReply(item._id)}
                     disabled={sending === item._id || !replyText[item._id]?.trim()}
                     className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                   >
                     {sending === item._id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                     Reply
                   </button>
                 </div>
               )}
             </motion.div>
          ));
        })()}
      </div>
    </div>
  );
};

export default SupportPage;
