import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';

const generateMockBeds = () => {
  const cities = ['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai'];
  const bedTypes = ['ICU', 'Oxygen', 'General', 'Ventilator'];
  const statuses = ['Available', 'Occupied', 'Maintenance'];
  const hospitals = ['Apollo Hospital', 'Care Hospital', 'Yashoda Hospital', 'KIMS', 'Medicover', 'AIG', 'Fortis', 'Max Super Speciality'];
  
  const beds = [];
  for (let i = 1; i <= 85; i++) {
    beds.push({
      id: `BED-${1000 + i}`,
      hospital: hospitals[Math.floor(Math.random() * hospitals.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      type: bedTypes[Math.floor(Math.random() * bedTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      price: Math.floor(Math.random() * 5000) + 1500,
      lastUpdated: `${Math.floor(Math.random() * 59) + 1} mins ago`
    });
  }
  return beds.sort((a, b) => a.city.localeCompare(b.city));
};

const LiveBedAvailability = () => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [reservationModal, setReservationModal] = useState({ isOpen: false, bed: null, status: 'idle' });
  const [patientDetails, setPatientDetails] = useState({ name: '', phone: '' });

  // Generate once per render cycle
  const mockBeds = useMemo(() => generateMockBeds(), []);
  
  const cities = ['All', 'Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai'];
  const bedTypes = ['All', 'ICU', 'Oxygen', 'General', 'Ventilator'];

  const filteredBeds = mockBeds.filter(bed => {
    const matchType = filterType === 'All' || bed.type === filterType;
    const matchCity = selectedCity === 'All' || bed.city === selectedCity;
    return matchType && matchCity;
  });

  const availableCount = filteredBeds.filter(b => b.status === 'Available').length;
  const occupiedCount = filteredBeds.filter(b => b.status === 'Occupied').length;

  const handleReserve = (e) => {
    e.preventDefault();
    setReservationModal(prev => ({ ...prev, status: 'processing' }));
    
    // Simulate backend call
    setTimeout(() => {
      setReservationModal(prev => ({ ...prev, status: 'success' }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl text-4xl mb-6 shadow-sm">🛏️</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('Live Bed Availability')}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t('Real-time tracking of hospital beds across major cities. Reserve instantly in emergencies.')}</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('Total Filtered Beds')}</p>
              <h3 className="text-3xl font-black text-slate-800">{filteredBeds.length}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl">🏥</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('Available Now')}</p>
              <h3 className="text-3xl font-black text-emerald-600">{availableCount}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl">✓</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('Occupied')}</p>
              <h3 className="text-3xl font-black text-amber-600">{occupiedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl">⚠️</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 border border-white/50 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="font-bold text-slate-500 mr-2">{t('Filter by City:')}</span>
            <div className="relative">
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 py-3 pl-5 pr-10 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                {cities.map(city => <option key={city} value={city}>{t(city)}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                ▼
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {bedTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${filterType === type ? 'bg-blue-600 text-white shadow-blue-600/20 shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Bed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredBeds.map((bed, i) => (
              <motion.div 
                key={bed.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: (i % 10) * 0.05 }}
                className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${bed.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : bed.status === 'Occupied' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                    {bed.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{bed.id}</span>
                </div>
                
                <h3 className="text-xl font-black text-slate-800 mb-1">{bed.hospital}</h3>
                <div className="flex items-center gap-2 mb-4 text-slate-500 text-sm font-medium">
                  <span>📍 {bed.city}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 flex-grow border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-slate-400">{t('Bed Type')}</span>
                    <span className={`text-sm font-black ${bed.type === 'ICU' ? 'text-red-500' : 'text-blue-600'}`}>{bed.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-400">{t('Price/Day')}</span>
                    <span className="text-sm font-black text-slate-900">₹{bed.price}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <button 
                    disabled={bed.status !== 'Available'}
                    onClick={() => setReservationModal({ isOpen: true, bed, status: 'idle' })}
                    className={`w-full py-3 rounded-xl font-black text-sm transition-all ${bed.status === 'Available' ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    {bed.status === 'Available' ? t('Reserve Bed') : t('Currently Unavailable')}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">Updated: {bed.lastUpdated}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredBeds.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="text-6xl mb-4 opacity-30">🛏️</div>
              <h3 className="text-2xl font-bold text-slate-700">{t('No Beds Found')}</h3>
              <p className="text-slate-500">{t('Try changing your city or bed type filter.')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reservation Modal */}
      <AnimatePresence>
        {reservationModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setReservationModal({ isOpen: false, bed: null, status: 'idle' })}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>

              {reservationModal.status === 'idle' && (
                <form onSubmit={handleReserve}>
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">🏥</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Reserve Bed')}</h3>
                  <p className="text-slate-500 mb-6">{t('You are reserving a')} <span className="font-bold text-blue-600">{reservationModal.bed?.type}</span> {t('bed at')} {reservationModal.bed?.hospital}, {reservationModal.bed?.city}.</p>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Patient Full Name')}</label>
                      <input type="text" required value={patientDetails.name} onChange={e => setPatientDetails({...patientDetails, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Contact Number')}</label>
                      <input type="tel" required value={patientDetails.phone} onChange={e => setPatientDetails({...patientDetails, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="+91 9876543210" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20">
                    {t('Confirm Reservation')}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4">{t('Note: Beds are held for only 2 hours after online reservation.')}</p>
                </form>
              )}

              {reservationModal.status === 'processing' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-800">{t('Processing Reservation...')}</h3>
                </div>
              )}

              {reservationModal.status === 'success' && (
                <div className="py-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    ✓
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Bed Reserved!')}</h3>
                  <p className="text-slate-500 mb-6">{t('Your bed has been successfully reserved.')}</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Reservation ID')}</p>
                    <p className="font-mono text-xl font-black text-slate-900">RES-{Math.floor(10000 + Math.random() * 90000)}</p>
                    <p className="text-sm font-medium text-slate-500 mt-2">{t('Please present this ID at the hospital reception.')}</p>
                  </div>

                  <button 
                    onClick={() => setReservationModal({ isOpen: false, bed: null, status: 'idle' })}
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

export default LiveBedAvailability;
