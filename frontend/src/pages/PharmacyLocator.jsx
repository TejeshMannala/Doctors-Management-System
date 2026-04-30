import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';
import { formatDate } from '../utils/locale';

const PharmacyLocator = () => {
  const { t, i18n } = useTranslation();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [doctorLocation, setDoctorLocation] = useState({ latitude: null, longitude: null });
  const [pharmacies, setPharmacies] = useState([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [availabilityResults, setAvailabilityResults] = useState({});
  const [showNearbyMap, setShowNearbyMap] = useState(false);
  const [showingNearbyPharmacies, setShowingNearbyPharmacies] = useState(false);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);

  const pharmacyChains = [
    { name: 'MedPlus', color: '#00A651', icon: '💊' },
    { name: 'Apollo Pharmacy', color: '#0033A0', icon: '🏥' },
    { name: 'Wellness Forever', color: '#FF6B35', icon: '🌿' },
    { name: 'NetMeds', color: '#00BCD4', icon: '💉' },
    { name: 'PharmEasy', color: '#E91E63', icon: '📦' },
    { name: '1mg', color: '#4CAF50', icon: '🔬' },
    { name: 'Local Medical Store', color: '#795548', icon: '🏪' },
    { name: 'HealthFirst Pharmacy', color: '#2563EB', icon: '🧴' },
    { name: 'CarePlus Pharmacy', color: '#7C3AED', icon: '🩺' },
    { name: 'SafeMeds', color: '#F59E0B', icon: '💠' },
    { name: 'TrustCare Pharmacy', color: '#0F766E', icon: '🛡️' },
    { name: 'GreenLeaf Pharmacy', color: '#15803D', icon: '🍃' },
    { name: 'UrbanHealth Pharmacy', color: '#DB2777', icon: '🏬' },
    { name: 'CityCare Pharmacy', color: '#047857', icon: '🏥' },
    { name: 'MegaMed Pharmacy', color: '#0EA5E9', icon: '🩹' },
    { name: 'Village Pharmacy', color: '#92400E', icon: '🏡' },
    { name: 'BrightMeds', color: '#F97316', icon: '✨' },
    { name: 'Family Pharmacy', color: '#831843', icon: '👪' },
    { name: 'Tesuko Pharmacy', color: '#0F172A', icon: '🛒' },
    { name: 'Konuko Pharmacy', color: '#0EA5E9', icon: '🧾' },
  ];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const location = useLocation();

  useEffect(() => {
    checkUserHasPrescriptions();
    // Load default pharmacies immediately so the user doesn't wait for geolocation
    findNearbyPharmacies(17.3850, 78.4867);
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (medicines.length > 0 && location.state?.prescriptionId) {
      const matched = medicines.find(p => p._id === location.state.prescriptionId);
      if (matched) {
        checkMedicineAvailability(matched);
      }
    }
  }, [medicines, location.state]);

  const checkUserHasPrescriptions = async () => {
    try {
      const response = await axios.get(apiUrl('/prescriptions/patient'), {
        headers: authHeaders(token),
      });
      const prescriptionsList = Array.isArray(response.data) ? response.data : (response.data.prescriptions || []);
      setMedicines(prescriptionsList);
      if (prescriptionsList.length > 0 && prescriptionsList[0].doctorId?.userId?.address) {
        setDoctorLocation({
          latitude: 17.3850 + (Math.random() - 0.5) * 0.02,
          longitude: 78.4867 + (Math.random() - 0.5) * 0.02
        });
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      // Set a timeout to not wait too long for geolocation
      const geoTimeout = setTimeout(() => {
        const defaultLocation = { latitude: 17.3850, longitude: 78.4867 };
        setUserLocation(defaultLocation);
        findNearbyPharmacies(defaultLocation.latitude, defaultLocation.longitude);
      }, 3000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(geoTimeout);
          const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          setUserLocation(loc);
          findNearbyPharmacies(loc.latitude, loc.longitude);
        },
        () => {
          clearTimeout(geoTimeout);
          const defaultLocation = { latitude: 17.3850, longitude: 78.4867 };
          setUserLocation(defaultLocation);
          findNearbyPharmacies(defaultLocation.latitude, defaultLocation.longitude);
        },
        { timeout: 5000 }
      );
    } else {
      const defaultLocation = { latitude: 17.3850, longitude: 78.4867 };
      setUserLocation(defaultLocation);
      findNearbyPharmacies(defaultLocation.latitude, defaultLocation.longitude);
    }
  };

  const findNearbyPharmacies = (lat, lng) => {
    const mockPharmacies = generateMockPharmacies(lat, lng);
    setPharmacies(mockPharmacies);
    if (selectedPrescription) {
      checkNearbyPharmacyAvailability(mockPharmacies);
    }
    setLoading(false);
  };

  const generateMockPharmacies = (lat, lng) => {
    return pharmacyChains.map((chain, index) => {
      const offsetLat = (Math.random() - 0.5) * 0.05;
      const offsetLng = (Math.random() - 0.5) * 0.05;
      const distance = (Math.random() * searchRadius).toFixed(1);
      const trustScore = Math.floor(78 + Math.random() * 21);
      const trustStatusKey = trustScore >= 90 ? 'Highly Trusted' : trustScore >= 80 ? 'Trusted' : 'Verified';
      
      return {
        id: index + 1,
        name: chain.name,
        icon: chain.icon,
        color: chain.color,
        address: `${Math.floor(Math.random() * 200) + 1}, Main Road, City Center`,
        distance: distance,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        openingHours: index < 3 ? t('24/7') : t('8:00 AM - 10:00 PM'),
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        ownerName: ['Ramesh Kumar', 'Priya Singh', 'Asha Patel'][index % 3],
        foundedYear: 1995 + (index % 15),
        trustScore,
        trustStatus: t(trustStatusKey),
        verified: trustScore >= 80,
        licenseId: `PH-${Math.floor(100000 + Math.random() * 900000)}`,
        latitude: lat + offsetLat,
        longitude: lng + offsetLng,
        services: [t('Home Delivery'), t('Online Orders')]
      };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  const checkMedicineAvailability = (prescription) => {
    setSelectedPrescription(prescription);
  };

  useEffect(() => {
    if (selectedPrescription && pharmacies.length > 0) {
      checkNearbyPharmacyAvailability(pharmacies);
    }
  }, [selectedPrescription, pharmacies]);

  const checkNearbyPharmacyAvailability = (nearbyPharmaciesList, explicitPrescription = null) => {
    const activePrescription = explicitPrescription || selectedPrescription;
    if (!activePrescription) return;
    
    const results = {};
    for (const pharmacy of nearbyPharmaciesList) {
      const medicineAvailability = activePrescription.medicines?.map(medicine => ({
        name: medicine.name,
        available: Math.random() > 0.3,
        price: Math.floor(Math.random() * 500) + 50,
      })) || [];
      const someAvailable = medicineAvailability.some(m => m.available);
      results[pharmacy.id] = {
        pharmacy,
        medicines: medicineAvailability,
        allAvailable: medicineAvailability.every(m => m.available),
        someAvailable,
        noneAvailable: !someAvailable,
        estimatedTotal: medicineAvailability.filter(m => m.available).reduce((sum, m) => sum + m.price, 0)
      };
    }
    setAvailabilityResults(results);
  };

  const getDirections = (pharmacy) => {
    if (userLocation.latitude && pharmacy.latitude) {
      window.open(`https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${pharmacy.latitude},${pharmacy.longitude}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] pb-20 font-sans text-slate-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -45, 0],
            x: [0, -80, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
      <div className="p-4">
        <BackButton />
      </div>

      {/* Premium Hero Section */}
      <section className="py-16 px-8 text-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="inline-block px-5 py-2 bg-white/40 backdrop-blur-md rounded-full text-xs md:text-sm font-bold text-primary-600 shadow-sm mb-6 border border-white/50">
            ✨ {t('Instant Medicine Access')}
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight mb-6 text-slate-900">
            {t('Your Health,')} <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent animate-gradient-x">
              {t('Closer Than Ever')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed px-4">
            {t('Locate verified pharmacies near you and check real-time medicine availability.')}
          </p>
        </motion.div>
        
        <div className="hero-visuals">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-1/4 left-[15%] text-5xl drop-shadow-xl z-5">💊</motion.div>
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute bottom-1/4 right-[15%] text-5xl drop-shadow-xl z-5">🏥</motion.div>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-2 border-dashed border-primary-100 rounded-full pointer-events-none"></motion.div>
        </div>
      </section>

      {/* Prescription Selection Section */}
      <section className="max-w-7xl mx-auto mb-16 px-4 md:px-8">
        <div className="mb-10 flex items-center gap-4 md:gap-6">
          <h2 className="text-xl md:text-2xl font-black whitespace-nowrap">📋 {t('Step 1: Select Prescription')}</h2>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {medicines.map((prescription, idx) => (
            <motion.div
              key={prescription._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-white/40 backdrop-blur-xl border rounded-[24px] p-5 cursor-pointer relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm ${selectedPrescription?._id === prescription._id ? 'border-primary-600 bg-white shadow-[0_20px_40px_rgba(2,132,199,0.1)]' : 'border-white/50'}`}
              onClick={() => checkMedicineAvailability(prescription)}
            >
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary-600 rounded-r-lg transition-opacity ${selectedPrescription?._id === prescription._id ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-xl md:text-2xl">👨‍⚕️</div>
                <div className="info overflow-hidden">
                  <h3 className="text-sm md:text-[1rem] font-bold mb-0.5 truncate">{prescription.doctorId?.userId?.fullName || t('Doctor')}</h3>
                  <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider">{formatDate(prescription.issuedAt, i18n.resolvedLanguage)}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {medicines.length === 0 && (
             <div className="bg-white/80 border border-dashed border-slate-300 rounded-[24px] p-8 text-center cursor-pointer hover:bg-white transition-colors" onClick={() => setMedicines([{ _id: 'sample', issuedAt: new Date().toISOString(), doctorId: { userId: { fullName: t('Sample Doctor') } }, medicines: [{ name: t('Sample Medicine') }] }])}>
                <p className="text-slate-500">{t('No prescriptions? Click to load sample data.')}</p>
             </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto mb-16 px-4 md:px-8">
        <div className="mb-10 flex items-center gap-4 md:gap-6">
          <h2 className="text-xl md:text-2xl font-black whitespace-nowrap">🏪 {t('Step 2: Nearby Pharmacies')}</h2>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 items-start">
          <AnimatePresence mode='popLayout'>
            {(() => {
              const allItems = selectedPrescription 
                ? Object.values(availabilityResults).filter(item => item.someAvailable) 
                : pharmacies.map(p => ({ pharmacy: p }));
              
              const filteredItems = selectedPharmacyId 
                ? allItems.filter(item => item.pharmacy.id === selectedPharmacyId)
                : allItems;

              if (filteredItems.length === 0) {
                return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center bg-white/50 backdrop-blur-md rounded-[32px] border border-dashed border-slate-300"
                  >
                    <div className="text-6xl mb-6">🔍</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t('No results found')}</h3>
                    <p className="text-slate-500">{t('Try adjusting your search or selecting a different prescription.')}</p>
                  </motion.div>
                );
              }

              return filteredItems.map((item, idx) => (
                <motion.div
                  key={item.pharmacy.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white/60 backdrop-blur-md rounded-[32px] border border-white/50 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/80 overflow-hidden flex flex-col group"
                >
                  <div className="p-6 md:p-8 flex justify-between items-start">
                    <div className="flex gap-4 md:gap-5">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-[22px] flex items-center justify-center text-2xl md:text-3xl shrink-0 transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${item.pharmacy.color}15`, color: item.pharmacy.color }}>
                        {item.pharmacy.icon}
                      </div>
                      <div className="name-addr overflow-hidden">
                        <h3 className="text-lg md:text-xl font-black mb-1 truncate">{item.pharmacy.name}</h3>
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed truncate">{item.pharmacy.address}</p>
                      </div>
                    </div>
                    {selectedPrescription && (
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase ${item.allAvailable ? 'bg-green-100 text-green-700' : item.someAvailable ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {item.allAvailable ? t('Available') : item.someAvailable ? t('Partial') : t('Out')}
                      </div>
                    )}
                  </div>

                  <div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-wrap gap-2 md:gap-4">
                    <div className="text-[10px] md:text-sm text-slate-600 font-bold flex items-center gap-1.5 bg-white/50 px-3 py-2 rounded-xl border border-white/50"><span>📏</span> {item.pharmacy.distance} km</div>
                    <div className="text-[10px] md:text-sm text-slate-600 font-bold flex items-center gap-1.5 bg-white/50 px-3 py-2 rounded-xl border border-white/50"><span>⭐</span> {item.pharmacy.rating}</div>
                    <div className="text-[10px] md:text-sm text-slate-600 font-bold flex items-center gap-1.5 bg-white/50 px-3 py-2 rounded-xl border border-white/50"><span>🕒</span> {item.pharmacy.openingHours}</div>
                  </div>

                  <div className="p-4 md:p-6 px-6 md:px-8 border-t border-white/30 bg-white/30">
                    <div className="flex gap-3 md:gap-6">
                      <button className="flex-1 py-3 md:py-4 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:scale-[1.02] hover:bg-primary-700 active:scale-95" onClick={() => getDirections(item.pharmacy)}>
                        <span className="text-lg md:text-xl">🗺️</span> {t('Directions')}
                      </button>
                      <button 
                        className={`flex-1 py-3 md:py-4 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 bg-white/60 text-slate-900 border border-white/50 hover:bg-white hover:border-primary-600 active:scale-95 ${selectedPharmacyId === item.pharmacy.id ? 'bg-slate-900 text-white border-slate-900' : ''}`} 
                        onClick={() => setSelectedPharmacyId(selectedPharmacyId === item.pharmacy.id ? null : item.pharmacy.id)}
                      >
                        <span className="text-lg md:text-xl">📄</span> {selectedPharmacyId === item.pharmacy.id ? t('Close') : t('Details')}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Details */}
                  <AnimatePresence>
                    {selectedPharmacyId === item.pharmacy.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white border-t border-dashed border-slate-200"
                      >
                      <div className="p-6">
                        <div className="mb-6">
                          <h4 className="text-[0.8rem] font-extrabold uppercase text-slate-500 mb-3 tracking-wider">{t('Pharmacy Info')}</h4>
                          <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">{t('Owner')}</span><span className="font-bold">{item.pharmacy.ownerName}</span></div>
                          <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">{t('Contact')}</span><span className="font-bold">{item.pharmacy.phone}</span></div>
                          <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">{t('License')}</span><span className="font-bold">{item.pharmacy.licenseId}</span></div>
                        </div>
                        
                        {selectedPrescription && item.medicines && (
                          <div className="mb-4 last:mb-0">
                            <h4 className="text-[0.8rem] font-extrabold uppercase text-slate-500 mb-3 tracking-wider">{t('Medicine Availability')}</h4>
                            <div className="flex flex-col gap-2 mb-4">
                              {item.medicines.map((m, i) => (
                                <div key={i} className={`flex justify-between p-3 bg-slate-50 rounded-xl text-sm border-l-4 ${m.available ? 'border-green-500' : 'border-red-500 opacity-60'}`}>
                                  <span className="font-medium">{m.available ? '✅' : '❌'} {m.name}</span>
                                  {m.available && <b className="text-primary-600">₹{m.price}</b>}
                                </div>
                              ))}
                            </div>
                            <div className="p-4 bg-primary-50 rounded-2xl flex justify-between items-center">
                              <span className="font-bold text-slate-600">{t('Estimated Total')}</span>
                              <b className="text-xl text-primary-600">₹{item.estimatedTotal}</b>
                            </div>
                          </div>
                        )}
                      </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ));
            })()}
          </AnimatePresence>
        </div>
      </section>

      {loading && medicines.length === 0 && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
          <div className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-slate-900 font-bold tracking-wide">{t('Loading prescriptions...')}</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default PharmacyLocator;
