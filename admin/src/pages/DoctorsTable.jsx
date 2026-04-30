import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Star, CheckCircle, XCircle, Edit2, Save, X, Plus, Trash2, UserPlus, Mail, Lock, Briefcase, DollarSign } from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../utils/ThemeContext';
import BackButton from '../components/BackButton';

const DoctorsTable = () => {
  const { theme } = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDoctor, setNewDoctor] = useState({
    fullName: '', email: '', password: '', specialization: '', experience: '', consultationFee: 500
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors');
      // The backend returns an array in res.data.doctors based on my observation of doctorController.js
      setDoctors(res.data.doctors || res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch doctors", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (doc) => {
    setEditingId(doc._id);
    setEditFormData({
      specialization: doc.specialization,
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      isAvailable: doc.isAvailable,
      rating: doc.rating || 0
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSave = async (id) => {
    try {
      setSaving(true);
      const res = await api.put(`/doctors/admin/${id}`, editFormData);
      if (res.data.success) {
        setDoctors(doctors.map(doc => doc._id === id ? { ...doc, ...editFormData } : doc));
      }
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update doctor", error);
      alert('Failed to update doctor details');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor? This will also delete their user account.')) return;
    
    try {
      setSaving(true);
      await api.delete(`/doctors/admin/${id}`);
      setDoctors(doctors.filter(doc => doc._id !== id));
    } catch (error) {
      console.error("Failed to delete doctor", error);
      alert('Failed to delete doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/doctors/admin/add', newDoctor);
      if (res.data.success) {
        setShowAddModal(false);
        setNewDoctor({ fullName: '', email: '', password: '', specialization: '', experience: '', consultationFee: 500 });
        fetchDoctors(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to add doctor", error);
      alert(error.response?.data?.message || 'Failed to add doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-4xl font-extrabold mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Staff Management</h1>
          <p className="text-slate-400">Manage clinical credentials and availability</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={20} />
          Add New Practitioner
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
        className={`backdrop-blur-xl border rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`p-6 border-b flex flex-wrap gap-4 items-center ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className={`flex rounded-2xl px-5 py-3 border w-full md:w-96 items-center gap-3 transition-all shadow-inner ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-700/50 focus-within:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-300'
          }`}>
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter by name, specialization, or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`} 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`text-xs uppercase tracking-widest font-bold ${
                theme === 'dark' ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-50/50 text-slate-500'
              }`}>
                <th className="p-6">Practitioner</th>
                <th className="p-6">Specialization</th>
                <th className="p-6">Exp.</th>
                <th className="p-6">Fee</th>
                <th className="p-6">Rating</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-center">Controls</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-700/30">
               {loading ? (
                 <tr><td colSpan="7" className="p-20 text-center"><Loader2 className="animate-spin text-indigo-500 w-10 h-10 mx-auto" /></td></tr>
               ) : doctors.length === 0 ? (
                 <tr><td colSpan="7" className="p-20 text-center text-slate-500 font-medium">No medical staff found in the records.</td></tr>
               ) : (() => {
                 const filteredDoctors = doctors.filter((doc) => {
                   const searchLower = searchTerm.toLowerCase();
                   const doctorName = doc.userId?.fullName?.toLowerCase() || '';
                   const doctorEmail = doc.userId?.email?.toLowerCase() || '';
                   const doctorSpec = doc.specialization?.toLowerCase() || '';
                   
                   return doctorName.includes(searchLower) || 
                          doctorEmail.includes(searchLower) || 
                          doctorSpec.includes(searchLower);
                 });
                 
                 return filteredDoctors.length === 0 ? (
                   <tr><td colSpan="7" className="p-20 text-center text-slate-500 font-medium">No doctors match your search criteria.</td></tr>
                 ) : (
                   filteredDoctors.map((doc) => {
                    const isEditing = editingId === doc._id;
                    
                    return (
                      <tr key={doc._id} className={`${isEditing ? 'bg-indigo-500/5 shadow-inner' : 'hover:bg-slate-800/30'} transition-all`}>
                        <td className="p-6 leading-tight">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-sm">
                              {doc.userId?.profileImage ? <img src={doc.userId.profileImage} className="w-full h-full rounded-2xl object-cover" /> : 'DR'}
                            </div>
                            <div>
                              <div className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{doc.userId?.fullName || 'Dr. Profile Pending'}</div>
                              <div className="text-slate-500 text-xs font-medium">{doc.userId?.email || 'No email attached'}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-6">
                          {isEditing ? (
                            <input type="text" name="specialization" value={editFormData.specialization} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                          ) : (
                            <span className="text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-xl text-xs font-bold border border-indigo-500/10 uppercase tracking-tighter">{doc.specialization}</span>
                          )}
                        </td>
                        
                        <td className="p-6 text-slate-300 font-medium">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input type="number" name="experience" value={editFormData.experience} onChange={handleChange} className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-center" />
                              <span className="text-xs text-slate-500">YRS</span>
                            </div>
                          ) : (
                            `${doc.experience} Years`
                          )}
                        </td>
                        
                        <td className="p-6 text-emerald-400 font-bold">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-500/60">$</span>
                              <input type="number" name="consultationFee" value={editFormData.consultationFee} onChange={handleChange} className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                          ) : (
                            `$${doc.consultationFee}`
                          )}
                        </td>
                        
                        <td className="p-6">
                          {isEditing ? (
                             <div className="flex items-center gap-2">
                               <Star size={16} className="text-amber-400" />
                               <input type="number" step="0.1" max="5" name="rating" value={editFormData.rating} onChange={handleChange} className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                             </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/5 px-3 py-1.5 rounded-xl border border-amber-400/10 w-fit">
                              <Star size={14} fill="currentColor" />
                              <span className="font-bold text-slate-200">{doc.rating || 0}</span>
                            </div>
                          )}
                        </td>
                        
                        <td className="p-6">
                           {isEditing ? (
                             <label className="flex items-center gap-3 cursor-pointer group">
                               <div className="relative">
                                 <input type="checkbox" name="isAvailable" checked={editFormData.isAvailable} onChange={handleChange} className="sr-only peer" />
                                 <div className="w-10 h-6 bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                               </div>
                               <span className="text-xs font-bold text-slate-400 peer-checked:text-emerald-400">AVAILABLE</span>
                             </label>
                           ) : doc.isAvailable ? (
                              <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10"><CheckCircle size={14}/> ONLINE</span>
                           ) : (
                              <span className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-500/5 px-3 py-1.5 rounded-xl border border-slate-500/10"><XCircle size={14}/> OFFLINE</span>
                           )}
                        </td>
                        
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-3">
                            {isEditing ? (
                                <>
                                  <button onClick={() => handleSave(doc._id)} className="p-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"><Save size={18} /></button>
                                  <button onClick={cancelEdit} className="p-2.5 bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-all"><X size={18} /></button>
                                </>
                            ) : (
                              <>
                                <button onClick={() => handleEditClick(doc)} className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/20">
                                  <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(doc._id)} className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                   })
                 );
               })()}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !saving && setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-xl border rounded-[2.5rem] p-10 shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <UserPlus size={28} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Add Practitioner</h2>
                    <p className="text-slate-400 text-sm">Onboard a new medical professional</p>
                  </div>
                </div>
                {!saving && <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>}
              </div>

              <form onSubmit={handleAddDoctor} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input required type="text" value={newDoctor.fullName} onChange={e => setNewDoctor({...newDoctor, fullName: e.target.value})} className={`w-full border rounded-2xl py-4 pl-12 pr-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${
                        theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} placeholder="Dr. John Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input required type="email" value={newDoctor.email} onChange={e => setNewDoctor({...newDoctor, email: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="doe@medical.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input required type="password" value={newDoctor.password} onChange={e => setNewDoctor({...newDoctor, password: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Specialization</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input required type="text" value={newDoctor.specialization} onChange={e => setNewDoctor({...newDoctor, specialization: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Cardiologist" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Experience (Years)</label>
                    <input required type="number" value={newDoctor.experience} onChange={e => setNewDoctor({...newDoctor, experience: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Consultation Fee</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                      <input required type="number" value={newDoctor.consultationFee} onChange={e => setNewDoctor({...newDoctor, consultationFee: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-10 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                    disabled={saving} 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                   >
                     {saving ? <Loader2 size={24} className="animate-spin" /> : <>Register Practitioner</>}
                   </button>
                   <button 
                    disabled={saving} 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-8 bg-slate-800 text-slate-400 font-bold hover:text-white rounded-2xl transition-all active:scale-95"
                   >
                     Cancel
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorsTable;
