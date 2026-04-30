import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';

const HealthPackages = () => {
  const { t } = useTranslation();
  const [bookingModal, setBookingModal] = useState({ isOpen: false, pkg: null, status: 'idle' }); // idle, processing, success

  const packages = [
    {
      id: 1,
      name: 'Basic Health Checkup',
      price: '₹999',
      originalPrice: '₹1499',
      features: ['Complete Blood Count (CBC)', 'Thyroid Profile (T3, T4, TSH)', 'Fasting Blood Sugar', 'Lipid Profile', 'Doctor Consultation'],
      color: 'blue'
    },
    {
      id: 2,
      name: 'Comprehensive Full Body',
      price: '₹2499',
      originalPrice: '₹3999',
      features: ['Basic Checkup Included', 'Liver Function Test', 'Kidney Function Test', 'Vitamin D & B12', 'HbA1c', 'ECG & X-Ray', 'Dietitian Consultation'],
      color: 'emerald',
      popular: true
    },
    {
      id: 3,
      name: 'Senior Citizen Package',
      price: '₹1999',
      originalPrice: '₹2999',
      features: ['Comprehensive Body Profile', 'Bone Mineral Density', 'Eye Examination', 'Cardiac Risk Markers', 'Physiotherapy Session'],
      color: 'amber'
    },
    {
      id: 4,
      name: 'Women\'s Wellness',
      price: '₹2199',
      originalPrice: '₹3499',
      features: ['Thyroid Profile', 'Vitamin D & Iron', 'Pap Smear', 'Ultrasound Pelvis', 'Gynecologist Consultation'],
      color: 'pink'
    },
    {
      id: 5,
      name: 'Cardiac Care Check',
      price: '₹2999',
      originalPrice: '₹4500',
      features: ['Lipid Profile Advanced', 'TMT (Treadmill Test)', 'Echocardiogram', 'Hs-CRP', 'Cardiologist Review'],
      color: 'rose'
    },
    {
      id: 6,
      name: 'Executive Lifestyle Plan',
      price: '₹4999',
      originalPrice: '₹7500',
      features: ['Full Body MRI', 'Advanced Cancer Markers', 'Hormone Profile', 'Nutritional Assessment', 'Premium Executive Lounge'],
      color: 'indigo'
    }
  ];

  const handleBook = (pkg) => {
    setBookingModal({ isOpen: true, pkg, status: 'idle' });
  };

  const confirmBooking = (e) => {
    e.preventDefault();
    setBookingModal(prev => ({ ...prev, status: 'processing' }));
    
    // Simulate backend call
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl text-4xl mb-6 shadow-sm">🎁</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('Affordable Health Packages')}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t('Choose from our curated health checkup plans designed for every age and need, at the most affordable prices.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {packages.map((pkg, i) => (
            <motion.div 
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-[40px] p-8 border h-full flex flex-col ${pkg.popular ? 'border-emerald-500 shadow-2xl scale-105 z-10 lg:mt-[-20px]' : 'border-slate-100 shadow-lg'} transition-transform hover:-translate-y-2`}
            >
              {pkg.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-6 py-1.5 rounded-full font-black text-sm shadow-lg tracking-wider uppercase">
                  {t('Most Popular')}
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-${pkg.color}-50 text-${pkg.color}-600`}>
                {i === 0 ? '🔬' : i === 1 ? '🧬' : i === 2 ? '👴' : i === 3 ? '🌸' : i === 4 ? '❤️' : '💼'}
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">{t(pkg.name)}</h3>
              <div className="flex items-baseline gap-2 mb-6">
                 <span className="text-4xl font-black text-slate-900">{pkg.price}</span>
                 <span className="text-lg text-slate-400 line-through font-bold">{pkg.originalPrice}</span>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                {pkg.features.map(feature => (
                  <div key={feature} className="flex items-start gap-3">
                    <span className={`text-${pkg.color}-500 mt-1`}>✓</span>
                    <span className="text-slate-600 font-medium">{t(feature)}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleBook(pkg)}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 mt-auto ${pkg.popular ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/30' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                {t('Book Package')}
              </button>
            </motion.div>
          ))}
        </div>
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
                onClick={() => setBookingModal({ isOpen: false, pkg: null, status: 'idle' })}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>

              {bookingModal.status === 'idle' && (
                <form onSubmit={confirmBooking}>
                  <div className={`w-16 h-16 bg-${bookingModal.pkg?.color}-50 text-${bookingModal.pkg?.color}-600 rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                    📋
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Confirm Booking')}</h3>
                  <p className="text-slate-500 mb-6">
                    {t('You are booking the')} <span className="font-bold text-slate-900">{t(bookingModal.pkg?.name)}</span> {t('for')} <span className="font-bold text-emerald-600">{bookingModal.pkg?.price}</span>.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Select Preferred Date')}</label>
                      <input type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Select Time Slot')}</label>
                      <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white">
                         <option value="">{t('Choose a time slot')}</option>
                         <option value="morning">{t('Morning (8:00 AM - 11:00 AM)')}</option>
                         <option value="afternoon">{t('Afternoon (12:00 PM - 3:00 PM)')}</option>
                         <option value="evening">{t('Evening (4:00 PM - 7:00 PM)')}</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-600/20">
                    {t('Confirm & Pay at Hospital')}
                  </button>
                </form>
              )}

              {bookingModal.status === 'processing' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-800">{t('Processing Booking...')}</h3>
                </div>
              )}

              {bookingModal.status === 'success' && (
                <div className="py-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    ✓
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Booking Confirmed!')}</h3>
                  <p className="text-slate-500 mb-6">{t('Your appointment has been successfully booked.')}</p>
                  <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Booking ID')}</p>
                    <p className="font-mono text-xl font-bold text-slate-900">PKG-{Math.floor(100000 + Math.random() * 900000)}</p>
                  </div>
                  <button 
                    onClick={() => setBookingModal({ isOpen: false, pkg: null, status: 'idle' })}
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

export default HealthPackages;
