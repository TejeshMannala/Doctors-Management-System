import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';

const HomeSampleCollection = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'reports'
  const [bookingModal, setBookingModal] = useState({ isOpen: false, test: null, status: 'idle' });
  const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', address: '' });

  const availableTests = [
    { id: 1, name: 'Comprehensive Full Body Checkup', price: '₹1499', params: 84, time: '10-12 hrs fasting' },
    { id: 2, name: 'Complete Blood Count (CBC)', price: '₹299', params: 24, time: 'No fasting required' },
    { id: 3, name: 'Advanced Lipid Profile', price: '₹599', params: 8, time: '12 hrs fasting' },
    { id: 4, name: 'Thyroid Profile (T3, T4, TSH)', price: '₹499', params: 3, time: 'No fasting required' },
    { id: 5, name: 'Diabetes Screening', price: '₹399', params: 4, time: '8 hrs fasting' },
    { id: 6, name: 'Vitamin D & B12', price: '₹899', params: 2, time: 'No fasting required' }
  ];

  const pastReports = [
    { id: 101, testName: 'Complete Blood Count (CBC)', date: '12 April 2026', status: 'Ready to Download', pdf: true },
    { id: 102, testName: 'Thyroid Profile', date: '05 March 2026', status: 'Ready to Download', pdf: true },
    { id: 103, testName: 'Advanced Lipid Profile', date: '28 April 2026', status: 'Processing...', pdf: false }
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    setBookingModal(prev => ({ ...prev, status: 'processing' }));
    setTimeout(() => {
      setBookingModal(prev => ({ ...prev, status: 'success' }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl text-4xl mb-6 shadow-sm">🏠</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('Home Sample Collection')}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t('Book lab tests from the comfort of your home and access your digital reports instantly.')}</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm border border-white/50 ${activeTab === 'book' ? 'bg-emerald-600 text-white shadow-emerald-600/20 shadow-lg' : 'bg-white/80 backdrop-blur-md text-slate-500 hover:bg-emerald-50'}`}
          >
            {t('Book Lab Tests')}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm border border-white/50 ${activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-emerald-600/20 shadow-lg' : 'bg-white/80 backdrop-blur-md text-slate-500 hover:bg-emerald-50'}`}
          >
            {t('My Test Reports')}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'book' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTests.map((test, i) => (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i*0.05 }} key={test.id} className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🔬</div>
                      <span className="bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded-xl text-sm">{test.price}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{test.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 flex-grow">Includes {test.params} parameters. {test.time}.</p>
                    <button 
                      onClick={() => setBookingModal({ isOpen: true, test, status: 'idle' })}
                      className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg active:scale-95"
                    >
                      {t('Book Home Visit')}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md p-8 rounded-[32px] border border-white/50 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-8">{t('Recent Lab Reports')}</h3>
                <div className="space-y-4">
                  {pastReports.map((report, i) => (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.1 }} key={report.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${report.pdf ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                           {report.pdf ? '📄' : '⏳'}
                         </div>
                         <div>
                           <h4 className="font-bold text-lg text-slate-900">{report.testName}</h4>
                           <p className="text-sm text-slate-500">Collected on: {report.date}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${report.pdf ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {report.status}
                        </span>
                        {report.pdf && (
                          <button className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
                            <span>📥</span> {t('Download')}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setBookingModal({ isOpen: false, test: null, status: 'idle' })}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>

              {bookingModal.status === 'idle' && (
                <form onSubmit={handleBooking}>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🛵</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Schedule Collection')}</h3>
                  <p className="text-slate-500 mb-6">{bookingModal.test?.name} - <span className="font-bold text-emerald-600">{bookingModal.test?.price}</span></p>

                  <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">{t('Select Date')}</label>
                        <input required type="date" value={bookingDetails.date} onChange={e => setBookingDetails({...bookingDetails, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">{t('Time Slot')}</label>
                        <select required value={bookingDetails.time} onChange={e => setBookingDetails({...bookingDetails, time: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="">{t('Select')}</option>
                          <option>07:00 AM - 08:00 AM</option>
                          <option>08:00 AM - 09:00 AM</option>
                          <option>09:00 AM - 10:00 AM</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Complete Home Address')}</label>
                      <textarea required rows="3" placeholder="Flat No, Building, Street..." value={bookingDetails.address} onChange={e => setBookingDetails({...bookingDetails, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all">
                    {t('Confirm & Pay Later')}
                  </button>
                </form>
              )}

              {bookingModal.status === 'processing' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-800">{t('Scheduling Visit...')}</h3>
                  <p className="text-slate-500">{t('Assigning nearest phlebotomist')}</p>
                </div>
              )}

              {bookingModal.status === 'success' && (
                <div className="py-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    ✓
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Visit Scheduled!')}</h3>
                  <p className="text-slate-500 mb-6">{t('A phlebotomist will arrive at your address on')} <span className="font-bold text-emerald-600">{bookingDetails.date}</span> {t('between')} <span className="font-bold text-emerald-600">{bookingDetails.time}</span>.</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl mb-6 text-left">
                    <p className="text-sm text-slate-500 mb-1">{t('Booking ID')}</p>
                    <p className="font-mono font-bold text-slate-900">LAB-{Math.floor(Math.random() * 100000)}</p>
                  </div>

                  <button 
                    onClick={() => {
                      setBookingModal({ isOpen: false, test: null, status: 'idle' });
                      setActiveTab('reports');
                    }}
                    className="w-full py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    {t('Done')}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeSampleCollection;
