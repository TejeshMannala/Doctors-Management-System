import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { apiUrl, authHeaders } from '../../config/api';

const DigitalHealthRecords = () => {
  const { t } = useTranslation();
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, rxRes, profileRes] = await Promise.all([
          axios.get(apiUrl('/appointments/patient'), { headers: authHeaders(token) }),
          axios.get(apiUrl('/prescriptions/patient'), { headers: authHeaders(token) }).catch(() => ({ data: { prescriptions: [] } })),
          axios.get(apiUrl('/patients/profile'), { headers: authHeaders(token) }).catch(() => ({ data: { user: null } }))
        ]);
        
        setAppointments(Array.isArray(aptRes.data) ? aptRes.data : aptRes.data.appointments || []);
        setPrescriptions(rxRes.data.prescriptions || []);
        setProfile(profileRes.data.user || null);
      } catch (error) {
        console.error('Error fetching health records:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchData();
  }, [token]);

  const handleDownload = () => {
    const dataStr = JSON.stringify({
      patient: user,
      appointments,
      prescriptions
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'health_records.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const patient = {
    name: profile?.fullName || user?.fullName || "Patient Name",
    age: profile?.age || user?.age || "N/A",
    bloodGroup: user?.bloodGroup || "O+",
    height: user?.height || "-",
    weight: user?.weight || "-",
    allergies: ["None logged"]
  };

  const recentVitals = [];
  const labReports = [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl text-3xl mb-4 shadow-sm">📁</div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{t('Digital Health Records')}</h1>
            <p className="text-xl text-slate-500">{t('Your secure digital locker for medical history and reports.')}</p>
          </div>
          <button onClick={handleDownload} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg active:scale-95 flex items-center gap-2">
            <span>📥</span> {t('Download All Data')}
          </button>
        </div>

        {/* Patient Profile Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 opacity-50"></div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl text-white font-black shadow-lg">
            {patient.name.charAt(0)}
          </div>
          
          <div className="flex-grow text-center md:text-left z-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">{patient.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 font-medium">
              <span className="bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">{patient.age} yrs</span>
              <span className="bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100 bg-rose-50 text-rose-600">{patient.bloodGroup}</span>
              <span className="bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">{patient.height}</span>
              <span className="bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">{patient.weight}</span>
            </div>
          </div>

          <div className="w-full md:w-auto bg-amber-50 p-4 rounded-2xl border border-amber-100 z-10">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">{t('Known Allergies')}</p>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map(allergy => (
                <span key={allergy} className="px-3 py-1 bg-white text-amber-700 rounded-lg text-sm font-bold shadow-sm">{allergy}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['overview', 'reports', 'prescriptions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-2xl font-bold text-lg whitespace-nowrap transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-white/50 shadow-sm'}`}
            >
              {t(tab.charAt(0).toUpperCase() + tab.slice(1))}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Conditions List */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl">📅</span> 
                    {t('My Appointments')}
                  </h3>
                  <div className="grid gap-4">
                    {loading ? (
                      <div className="p-6 text-center text-slate-500">Loading appointments...</div>
                    ) : appointments.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 bg-white/60 rounded-3xl border border-white/50">{t('No booked appointments found')}</div>
                    ) : (
                      appointments.map((apt, i) => (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.1 }} key={apt._id} className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                          <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{apt.doctorId?.userId?.fullName || 'Unknown Doctor'}</h4>
                            <p className="text-sm text-slate-500">
                              {new Date(apt.date).toLocaleDateString()} • {apt.timeSlot} • {apt.doctorId?.specialization}
                            </p>
                          </div>
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold ${apt.status === 'Scheduled' || apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {apt.status}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Vitals Grid */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <span className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-xl">❤️</span> 
                    {t('Recent Vitals')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {recentVitals.map((vital, i) => (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i*0.1 }} key={vital.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                        <div className="text-3xl mb-2">{vital.icon}</div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{vital.label}</p>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-2xl font-black text-slate-900">{vital.value}</span>
                          <span className="text-xs text-slate-500">{vital.unit}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${vital.status === 'Normal' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
                 <h3 className="text-2xl font-black mb-6">{t('Laboratory & Imaging Reports')}</h3>
                 <div className="grid gap-4">
                    {labReports.map((report, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} key={report.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors">📄</div>
                          <div>
                            <h4 className="font-bold text-slate-900">{report.name}</h4>
                            <p className="text-sm text-slate-500">{report.date} • {report.lab}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className={`text-sm font-bold ${report.status === 'Normal' ? 'text-emerald-500' : 'text-amber-500'}`}>{report.status}</span>
                           <button className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">View PDF</button>
                        </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
                 <h3 className="text-2xl font-black mb-6">{t('Active Medications')}</h3>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {prescriptions.length === 0 ? (
                       <div className="col-span-3 p-6 text-center text-slate-500 bg-white/60 rounded-3xl border border-white/50">{t('No active medications found')}</div>
                     ) : prescriptions.map((rx, i) => (
                       rx.medicines.map((med, j) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i+j)*0.1 }} key={`${rx._id}-${j}`} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400"></div>
                          <div className="flex justify-between items-start mb-4">
                             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">💊</div>
                             <span className="text-xs font-bold text-slate-400">Prescribed by {rx.doctorId?.userId?.fullName || 'Doctor'}</span>
                          </div>
                          <h4 className="font-black text-lg text-slate-900 mb-1">{med.name}</h4>
                          <p className="text-sm font-medium text-blue-600 mb-4">{med.dosage}</p>
                          <div className="bg-slate-50 p-3 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">Directions</p>
                            <p className="text-sm font-medium text-slate-800">{med.frequency} • {med.duration}</p>
                          </div>
                        </motion.div>
                       ))
                    ))}
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DigitalHealthRecords;
