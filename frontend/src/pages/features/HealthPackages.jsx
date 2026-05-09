import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';

const colorStyles = {
  sky: {
    iconWrap: 'bg-sky-50 text-sky-600',
    check: 'text-sky-500',
  },
  teal: {
    iconWrap: 'bg-teal-50 text-teal-600',
    check: 'text-teal-500',
  },
  emerald: {
    iconWrap: 'bg-emerald-50 text-emerald-600',
    check: 'text-emerald-500',
  },
  amber: {
    iconWrap: 'bg-amber-50 text-amber-600',
    check: 'text-amber-500',
  },
  pink: {
    iconWrap: 'bg-pink-50 text-pink-600',
    check: 'text-pink-500',
  },
  rose: {
    iconWrap: 'bg-rose-50 text-rose-600',
    check: 'text-rose-500',
  },
  indigo: {
    iconWrap: 'bg-indigo-50 text-indigo-600',
    check: 'text-indigo-500',
  },
  violet: {
    iconWrap: 'bg-violet-50 text-violet-600',
    check: 'text-violet-500',
  },
};

const packages = [
  {
    id: 1,
    name: 'Mini Fever Panel',
    price: 'Rs. 399',
    originalPrice: 'Rs. 699',
    features: ['Complete Blood Count (CBC)', 'Fever screening', 'Doctor review call', 'Digital report in 24 hours'],
    color: 'sky',
    icon: 'MF',
  },
  {
    id: 2,
    name: 'Basic Health Checkup',
    price: 'Rs. 799',
    originalPrice: 'Rs. 1,299',
    features: ['Complete Blood Count (CBC)', 'Thyroid Profile', 'Fasting Blood Sugar', 'Lipid Profile', 'Doctor Consultation'],
    color: 'teal',
    icon: 'BH',
  },
  {
    id: 3,
    name: 'Family Wellness Saver',
    price: 'Rs. 1,299',
    originalPrice: 'Rs. 1,999',
    features: ['2 adult screenings', 'Sugar and cholesterol tests', 'Blood pressure review', 'Diet guidance'],
    color: 'emerald',
    popular: true,
    icon: 'FW',
  },
  {
    id: 4,
    name: 'Senior Citizen Package',
    price: 'Rs. 1,699',
    originalPrice: 'Rs. 2,599',
    features: ['Comprehensive body profile', 'Bone health screening', 'Eye check guidance', 'Cardiac risk markers', 'Physiotherapy session'],
    color: 'amber',
    icon: 'SC',
  },
  {
    id: 5,
    name: 'Women\'s Wellness',
    price: 'Rs. 1,899',
    originalPrice: 'Rs. 2,999',
    features: ['Thyroid profile', 'Vitamin D and iron', 'Pap smear guidance', 'Ultrasound pelvis', 'Gynecologist consultation'],
    color: 'pink',
    icon: 'WW',
  },
  {
    id: 6,
    name: 'Diabetes Care Package',
    price: 'Rs. 2,099',
    originalPrice: 'Rs. 3,299',
    features: ['HbA1c', 'Kidney function test', 'Lipid profile', 'Foot care review', 'Doctor follow-up'],
    color: 'rose',
    icon: 'DB',
  },
  {
    id: 7,
    name: 'Cardiac Care Check',
    price: 'Rs. 2,499',
    originalPrice: 'Rs. 3,999',
    features: ['Advanced lipid profile', 'ECG', '2D echo support', 'Hs-CRP', 'Cardiologist review'],
    color: 'indigo',
    icon: 'CC',
  },
  {
    id: 8,
    name: 'Comprehensive Full Body',
    price: 'Rs. 2,899',
    originalPrice: 'Rs. 4,399',
    features: ['Basic checkup included', 'Liver function test', 'Kidney function test', 'Vitamin D and B12', 'HbA1c', 'Dietitian consultation'],
    color: 'violet',
    icon: 'FB',
  },
];

const HealthPackages = () => {
  const { t } = useTranslation();
  const [bookingModal, setBookingModal] = useState({ isOpen: false, pkg: null, status: 'idle' });

  const handleBook = (pkg) => {
    setBookingModal({ isOpen: true, pkg, status: 'idle' });
  };

  const confirmBooking = (e) => {
    e.preventDefault();
    setBookingModal((prev) => ({ ...prev, status: 'processing' }));

    window.setTimeout(() => {
      setBookingModal((prev) => ({ ...prev, status: 'success' }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl text-2xl font-black mb-6 shadow-sm">PKG</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('Affordable Health Packages')}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t('Choose from low-cost health checkup plans for individuals, families, women, seniors, and chronic care needs.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {packages.map((pkg, i) => {
            const styles = colorStyles[pkg.color];

            return (
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

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black mb-6 ${styles.iconWrap}`}>
                  {pkg.icon}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2">{t(pkg.name)}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black text-slate-900">{pkg.price}</span>
                  <span className="text-lg text-slate-400 line-through font-bold">{pkg.originalPrice}</span>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  {pkg.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className={`${styles.check} mt-1`}>+</span>
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
            );
          })}
        </div>
      </div>

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
                X
              </button>

              {bookingModal.status === 'idle' && (
                <form onSubmit={confirmBooking}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black mb-6 ${colorStyles[bookingModal.pkg?.color || 'sky'].iconWrap}`}>
                    {bookingModal.pkg?.icon || 'PKG'}
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
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6">
                    OK
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
