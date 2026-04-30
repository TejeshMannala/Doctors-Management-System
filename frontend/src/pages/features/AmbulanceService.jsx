import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';

const AmbulanceService = () => {
  const { t } = useTranslation();
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [hasScanned, setHasScanned] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [dispatchModal, setDispatchModal] = useState({ isOpen: false, status: 'idle' });
  const [dispatchDetails, setDispatchDetails] = useState({ location: '', phone: '' });

  const mockAmbulances = [
    { id: 1, driver: 'Raju Sharma', distance: '1.2 km', eta: '4 mins', status: 'Available', type: 'Advanced Life Support (ALS)', reg: 'TS 09 EU 4532' },
    { id: 2, driver: 'Manoj Kumar', distance: '2.5 km', eta: '8 mins', status: 'Available', type: 'Basic Life Support (BLS)', reg: 'TS 08 BC 9912' },
    { id: 3, driver: 'Srinivas Rao', distance: '0.8 km', eta: '3 mins', status: 'On Route to Patient', type: 'Advanced Life Support (ALS)', reg: 'TS 07 TR 1122' },
    { id: 4, driver: 'Ali Khan', distance: '4.1 km', eta: '12 mins', status: 'Available', type: 'Patient Transport (PTS)', reg: 'TS 10 MN 8821' },
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!userLocation.trim()) return;

    setIsSearching(true);
    setHasScanned(true);
    setAmbulances([]);
    setSelectedAmbulance(null);
    
    // Simulate API call and searching animation
    setTimeout(() => {
      setAmbulances(mockAmbulances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)));
      setIsSearching(false);
    }, 2500);
  };

  const handleDispatch = (e) => {
    e.preventDefault();
    setDispatchModal(prev => ({ ...prev, status: 'processing' }));
    setTimeout(() => {
      setDispatchModal(prev => ({ ...prev, status: 'success' }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-6 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-600 rounded-3xl text-4xl mb-6 shadow-sm">🚑</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('Emergency Ambulance Service')}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t('Quick and reliable ambulance support available for urgent medical situations.')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map & Search Section */}
          <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-xl relative overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex-grow flex flex-col items-center justify-center relative">
              {/* Fake Map Background */}
              <div className="absolute inset-0 bg-slate-100 rounded-2xl overflow-hidden opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <AnimatePresence>
                {!isSearching && !hasScanned && ambulances.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10 text-center bg-white/90 backdrop-blur-md p-8 rounded-[32px] shadow-2xl max-w-md w-full border border-white">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">📍</div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Where are you?')}</h3>
                    <p className="text-slate-500 mb-6">{t('Enter your current location or emergency address to find nearby ambulances.')}</p>
                    
                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                      <input 
                        type="text" 
                        required
                        placeholder={t('e.g. Jubilee Hills, Hyderabad')}
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none text-center text-lg font-bold shadow-sm"
                      />
                      <button 
                        type="submit"
                        className="w-full py-4 bg-red-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all"
                      >
                        {t('Find Nearest Ambulance')}
                      </button>
                    </form>
                  </motion.div>
                )}

                {isSearching && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="z-10 flex flex-col items-center">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                      <motion.div animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute w-full h-full bg-red-400 rounded-full"></motion.div>
                      <motion.div animate={{ scale: [1, 2], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="absolute w-full h-full bg-red-500 rounded-full"></motion.div>
                      <div className="w-12 h-12 bg-red-600 rounded-full z-10 flex items-center justify-center text-white text-xl">📍</div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">{t('Scanning area...')}</h3>
                    <p className="text-slate-500">{t('Locating available ambulances near you')}</p>
                  </motion.div>
                )}

                {ambulances.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 p-4">
                    {/* Fake Map Markers */}
                    {ambulances.map((amb, i) => (
                      <motion.div 
                        key={amb.id}
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className={`absolute ${i===0 ? 'top-1/4 left-1/3' : i===1 ? 'top-1/2 right-1/4' : i===2 ? 'bottom-1/3 left-1/4' : 'bottom-1/4 right-1/3'} cursor-pointer`}
                        onClick={() => setSelectedAmbulance(amb)}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg border-4 border-white transition-transform hover:scale-110 ${amb.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                          🚑
                        </div>
                        <div className="bg-white px-2 py-1 rounded-md shadow-md text-[10px] font-bold mt-1 text-center truncate w-20 -ml-4">
                          {amb.eta}
                        </div>
                      </motion.div>
                    ))}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                       <div className="w-8 h-8 bg-blue-600 border-4 border-white rounded-full shadow-lg"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* List Section */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-xl flex flex-col h-[500px]">
            <h2 className="text-2xl font-black mb-6">{t('Live Availability')}</h2>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
              {ambulances.length === 0 && !isSearching && (
                <div className="text-center py-20 text-slate-400">
                  <div className="text-4xl mb-4">📍</div>
                  <p>{t('Click search to find ambulances')}</p>
                </div>
              )}

              {isSearching && (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-slate-200/50 animate-pulse rounded-2xl"></div>
                  ))}
                </div>
              )}

              {ambulances.length > 0 && ambulances.map(amb => (
                <motion.div 
                  key={amb.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedAmbulance(amb)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedAmbulance?.id === amb.id ? 'border-red-500 bg-red-50/50' : 'border-transparent bg-white shadow-sm hover:border-slate-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800">{amb.type}</h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${amb.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {t(amb.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end text-sm text-slate-500">
                    <div>
                      <p>👨‍✈️ {amb.driver}</p>
                      <p className="text-xs mt-1">🔢 {amb.reg}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-800 text-lg">{amb.eta}</p>
                      <p className="text-xs">{amb.distance}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedAmbulance && selectedAmbulance.status === 'Available' && (
               <motion.button 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }}
                 onClick={() => setDispatchModal({ isOpen: true, status: 'idle' })}
                 className="mt-4 w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg hover:bg-red-700 active:scale-95 transition-all"
               >
                 {t('Book Ambulance Now')}
               </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {dispatchModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setDispatchModal({ isOpen: false, status: 'idle' })}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>

              {dispatchModal.status === 'idle' && (
                <form onSubmit={handleDispatch}>
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🚨</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Dispatch Ambulance')}</h3>
                  <p className="text-slate-500 mb-6">{selectedAmbulance?.type} • {t('ETA:')} {selectedAmbulance?.eta}</p>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Pickup Location / Landmark')}</label>
                      <input required type="text" placeholder="e.g. Near City Mall" value={dispatchDetails.location} onChange={e => setDispatchDetails({...dispatchDetails, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Emergency Contact Number')}</label>
                      <input required type="tel" value={dispatchDetails.phone} onChange={e => setDispatchDetails({...dispatchDetails, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all">
                    {t('Confirm Emergency Dispatch')}
                  </button>
                </form>
              )}

              {dispatchModal.status === 'processing' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-800">{t('Dispatching...')}</h3>
                  <p className="text-slate-500">{t('Sending coordinates to the driver')}</p>
                </div>
              )}

              {dispatchModal.status === 'success' && (
                <div className="py-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    🚑
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Ambulance Dispatched!')}</h3>
                  <p className="text-slate-500 mb-6">{t('Driver')} <span className="font-bold text-slate-800">{selectedAmbulance?.driver}</span> {t('is on the way. Expected arrival in')} <span className="font-bold text-red-600">{selectedAmbulance?.eta}</span>.</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl mb-6 text-left">
                    <p className="text-sm text-slate-500 mb-1">{t('Vehicle Details')}</p>
                    <p className="font-mono font-bold text-slate-900">{selectedAmbulance?.reg} • {selectedAmbulance?.type}</p>
                  </div>

                  <button 
                    onClick={() => setDispatchModal({ isOpen: false, status: 'idle' })}
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

export default AmbulanceService;
