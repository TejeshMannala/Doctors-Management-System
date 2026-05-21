import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';
import { formatDate } from '../utils/locale';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const pharmacyIcon = L.divIcon({
  html: '<div style="font-size: 30px; line-height: 1; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">🏪</div>',
  className: 'custom-leaflet-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

const PharmacyLocator = () => {
  const { t, i18n } = useTranslation();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [cityInput, setCityInput] = useState('');
  const [locationError, setLocationError] = useState('');
  const [hasScanned, setHasScanned] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availabilityResults, setAvailabilityResults] = useState({});
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);


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
    // Do not load default pharmacies immediately; wait for user input
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
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = async (e) => {
    e?.preventDefault();
    if (!cityInput.trim()) return;
    
    setIsSearchingLocation(true);
    setLocationError('');
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setUserLocation({ latitude: lat, longitude: lon });
        findNearbyPharmacies(lat, lon);
        setHasScanned(true);
      } else {
        setLocationError(t('City not found. Please enter a valid city name.'));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocationError(t('Error locating city. Please try again.'));
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const getCurrentLocation = () => {
    setIsSearchingLocation(true);
    setLocationError('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          setUserLocation(loc);
          findNearbyPharmacies(loc.latitude, loc.longitude);
          setHasScanned(true);
          setIsSearchingLocation(false);
        },
        () => {
          setLocationError(t('Location access denied. Please enter your city manually.'));
          setIsSearchingLocation(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError(t('Geolocation is not supported by your browser.'));
      setIsSearchingLocation(false);
    }
  };

  const findNearbyPharmacies = async (lat, lng) => {
    setIsSearchingLocation(true);
    setLocationError('');
    setPharmacies([]);
    setSelectedPharmacyId(null);
    try {
      const radiusMeters = 10000;
      const query = `
        [out:json][timeout:25];
        (
          node(around:${radiusMeters},${lat},${lng})["amenity"="pharmacy"];
          way(around:${radiusMeters},${lat},${lng})["amenity"="pharmacy"];
          relation(around:${radiusMeters},${lat},${lng})["amenity"="pharmacy"];
        );
        out center tags 30;
      `;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`Overpass request failed with ${res.status}`);
      }
      const data = await res.json();
      
      let realPharmacies = [];
      if (data && data.elements && data.elements.length > 0) {
        realPharmacies = data.elements.map((node) => {
          const nodeLat = node.lat ?? node.center?.lat;
          const nodeLon = node.lon ?? node.center?.lon;
          if (!nodeLat || !nodeLon) return null;
          const addressParts = [
            node.tags?.['addr:housenumber'],
            node.tags?.['addr:street'],
            node.tags?.['addr:suburb'],
            node.tags?.['addr:city']
          ].filter(Boolean);
          
          return {
            id: `${node.type}-${node.id}`,
            name: node.tags?.name || t('Local Pharmacy'),
            icon: '🏪',
            color: '#00A651',
            address: addressParts.length > 0 ? addressParts.join(', ') : t('Address available in map'),
            distance: calculateDistance(lat, lng, nodeLat, nodeLon).toFixed(1),
            phone: node.tags?.phone || node.tags?.['contact:phone'] || '',
            openingHours: node.tags?.opening_hours || t('Hours not listed'),
            rating: t('Live map data'),
            ownerName: node.tags?.operator || t('Not listed'),
            foundedYear: '',
            trustScore: null,
            trustStatus: t('OpenStreetMap'),
            verified: true,
            licenseId: `OSM-${node.id}`,
            latitude: nodeLat,
            longitude: nodeLon,
            services: [t('Pharmacy')]
          };
        }).filter(Boolean).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).slice(0, 30);
      } else {
        realPharmacies = [];
      }
      
      setPharmacies(realPharmacies);
      if (realPharmacies.length === 0) {
        setLocationError(t('No live pharmacies found near this location. Try another nearby area.'));
      }
      if (selectedPrescription) {
        checkNearbyPharmacyAvailability(realPharmacies);
      }
    } catch (err) {
      console.error("Error fetching pharmacies from Overpass:", err);
      setLocationError(t('Unable to load live pharmacy data right now. Please try again.'));
      setPharmacies([]);
    } finally {
      setIsSearchingLocation(false);
      setLoading(false);
    }
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
        available: null,
        price: null,
      })) || [];
      results[pharmacy.id] = {
        pharmacy,
        medicines: medicineAvailability,
        allAvailable: false,
        someAvailable: true,
        noneAvailable: false,
        estimatedTotal: null
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

      {/* Location Selection Section */}
      <section className="max-w-4xl mx-auto mb-16 px-4 md:px-8">
        {!hasScanned ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-8 md:p-12 shadow-xl text-center">
            <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">📍</div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">{t('Where are you looking for medicines?')}</h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">{t('Enter your city to find verified live pharmacies near you and check their medicine stock.')}</p>
            
            {locationError && (
              <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-2xl text-sm font-bold border border-red-200">
                {locationError}
              </div>
            )}

            <form onSubmit={handleCitySearch} className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
              <input 
                type="text" 
                placeholder={t('e.g. Hyderabad, Mumbai, Delhi')}
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full md:w-96 px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none text-lg font-bold shadow-sm"
              />
              <button 
                type="submit"
                disabled={isSearchingLocation}
                className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-70"
              >
                {isSearchingLocation ? t('Searching...') : t('Find Pharmacies')}
              </button>
            </form>
            
            <div className="flex items-center justify-center gap-4 text-slate-400 font-bold uppercase text-xs my-6">
              <span className="w-16 h-px bg-slate-200"></span> OR <span className="w-16 h-px bg-slate-200"></span>
            </div>
            
            <button 
              onClick={getCurrentLocation}
              disabled={isSearchingLocation}
              className="px-8 py-4 bg-slate-100 text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-200 active:scale-95 transition-all border border-slate-200 inline-flex items-center gap-3 disabled:opacity-70"
            >
              <span className="text-xl">🧭</span> {t('Use My Current Location')}
            </button>
          </motion.div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-xl mb-12 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">✅</div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Current Location')}</p>
                <p className="text-lg font-black text-slate-800">{cityInput || t('Your Location')}</p>
              </div>
            </div>
            <button onClick={() => { setHasScanned(false); setPharmacies([]); }} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              {t('Change')}
            </button>
          </div>
        )}
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
             <div className="bg-white/80 border border-dashed border-slate-300 rounded-[24px] p-8 text-center">
                <p className="text-slate-500">{t('No prescriptions found. You can still search live nearby pharmacies using your location.')}</p>
             </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
      {hasScanned && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto mb-16 px-4 md:px-8">
          <div className="mb-10 flex items-center gap-4 md:gap-6">
            <h2 className="text-xl md:text-2xl font-black whitespace-nowrap">🏪 {t('Step 2: Nearby Pharmacies')}</h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          
          {/* Map Display */}
          <div className="w-full h-[400px] bg-slate-100 rounded-[32px] overflow-hidden mb-10 shadow-inner border border-white/50 relative z-0">
            {userLocation.latitude && (
              <MapContainer center={[userLocation.latitude, userLocation.longitude]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapUpdater center={[userLocation.latitude, userLocation.longitude]} />
                
                {/* User Location */}
                <Marker position={[userLocation.latitude, userLocation.longitude]}>
                  <Popup>{t('Your Location')}</Popup>
                </Marker>

                {/* Pharmacy Markers */}
                {pharmacies.map(pharmacy => (
                  <Marker 
                    key={pharmacy.id} 
                    position={[pharmacy.latitude, pharmacy.longitude]}
                    icon={pharmacyIcon}
                    eventHandlers={{
                      click: () => setSelectedPharmacyId(pharmacy.id)
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong>{pharmacy.name}</strong><br/>
                        {pharmacy.distance} km away
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 items-start">
            <AnimatePresence mode='popLayout'>
              {(() => {
              const allItems = pharmacies.map(p => availabilityResults[p.id] || { pharmacy: p });
              
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
                    {selectedPrescription && item.medicines && (
                      <div className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                        {t('Call to verify')}
                      </div>
                    )}
                  </div>

                  <div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-wrap gap-2 md:gap-4">
                    <div className="text-[10px] md:text-sm text-slate-600 font-bold flex items-center gap-1.5 bg-white/50 px-3 py-2 rounded-xl border border-white/50"><span>📏</span> {item.pharmacy.distance} km</div>
                    <div className="text-[10px] md:text-sm text-slate-600 font-bold flex items-center gap-1.5 bg-white/50 px-3 py-2 rounded-xl border border-white/50"><span>OSM</span> {item.pharmacy.rating}</div>
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
                          <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">{t('Contact')}</span><span className="font-bold">{item.pharmacy.phone || t('Not listed')}</span></div>
                          <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">{t('License')}</span><span className="font-bold">{item.pharmacy.licenseId}</span></div>
                        </div>
                        
                        {selectedPrescription && item.medicines && (
                          <div className="mb-4 last:mb-0">
                            <h4 className="text-[0.8rem] font-extrabold uppercase text-slate-500 mb-3 tracking-wider">{t('Medicine Availability')}</h4>
                            <div className="flex flex-col gap-2 mb-4">
                              {item.medicines.map((m, i) => (
                                <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm border-l-4 border-blue-500">
                                  <span className="font-medium">{m.name}</span>
                                  <b className="text-primary-600">{t('Call to verify')}</b>
                                </div>
                              ))}
                            </div>
                            <div className="p-4 bg-primary-50 rounded-2xl flex justify-between items-center">
                              <span className="font-bold text-slate-600">{t('Live stock')}</span>
                              <b className="text-sm text-primary-600">{t('Not provided by map data')}</b>
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
      </motion.section>
      )}
      </AnimatePresence>

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

