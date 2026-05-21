import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';
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

// Custom Ambulance Icon
const ambulanceIcon = L.divIcon({
  html: '<div style="font-size: 30px; line-height: 1; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">🚑</div>',
  className: 'custom-leaflet-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Component to dynamically update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

const AmbulanceService = () => {
  const { t } = useTranslation();
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]); // Default Hyderabad
  const [hasScanned, setHasScanned] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [dispatchModal, setDispatchModal] = useState({ isOpen: false, status: 'idle' });
  const [dispatchDetails, setDispatchDetails] = useState({ location: '', phone: '' });
  const [locationError, setLocationError] = useState('');

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const estimateEta = (distanceKm) => {
    const minutes = Math.max(3, Math.round((distanceKm / 35) * 60));
    return `${minutes} mins`;
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!userLocation.trim()) return;

    setIsSearching(true);
    setHasScanned(true);
    setAmbulances([]);
    setSelectedAmbulance(null);
    setLocationError('');
    
    try {
      // Geocode the user location
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userLocation)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        findNearbyAmbulances(lat, lon);
      } else {
        setLocationError('City not found. Please enter a valid city name.');
        setIsSearching(false);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocationError('Error locating city. Please try again.');
      setIsSearching(false);
    }
  };

  const findNearbyAmbulances = async (lat, lon) => {
    setIsSearching(true);
    setAmbulances([]);
    setSelectedAmbulance(null);
    setLocationError('');

    try {
      const radiusMeters = 15000;
      const query = `
        [out:json][timeout:25];
        (
          node(around:${radiusMeters},${lat},${lon})["emergency"="ambulance_station"];
          way(around:${radiusMeters},${lat},${lon})["emergency"="ambulance_station"];
          relation(around:${radiusMeters},${lat},${lon})["emergency"="ambulance_station"];
          node(around:${radiusMeters},${lat},${lon})["healthcare"="ambulance_station"];
          way(around:${radiusMeters},${lat},${lon})["healthcare"="ambulance_station"];
          relation(around:${radiusMeters},${lat},${lon})["healthcare"="ambulance_station"];
        );
        out center tags 25;
      `;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`Overpass request failed with ${res.status}`);
      }
      const data = await res.json();
      const liveAmbulances = (data.elements || []).map((item) => {
        const itemLat = item.lat ?? item.center?.lat;
        const itemLon = item.lon ?? item.center?.lon;
        if (!itemLat || !itemLon) return null;
        const distanceKm = calculateDistance(lat, lon, itemLat, itemLon);
        const phone = item.tags?.phone || item.tags?.['contact:phone'] || item.tags?.emergency_phone || '';

        return {
          id: `${item.type}-${item.id}`,
          driver: item.tags?.operator || item.tags?.name || 'Ambulance service',
          distance: `${distanceKm.toFixed(1)} km`,
          eta: estimateEta(distanceKm),
          status: 'Available',
          type: item.tags?.name || 'Ambulance Station',
          reg: phone || `OSM-${item.id}`,
          phone,
          lat: itemLat,
          lng: itemLon,
        };
      }).filter(Boolean).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

      setAmbulances(liveAmbulances);
      if (liveAmbulances.length === 0) {
        setLocationError(t('No live ambulance stations found near this location. Try a nearby city or call local emergency services.'));
      }
    } catch (error) {
      console.error('Error fetching ambulance services from Overpass:', error);
      setLocationError(t('Unable to load live ambulance data right now. Please try again.'));
      setAmbulances([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    setIsSearching(true);
    setLocationError('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setMapCenter([lat, lon]);
          setHasScanned(true);
          findNearbyAmbulances(lat, lon);
        },
        () => {
          setLocationError(t('Location access denied. Please enter your city manually.'));
          setIsSearching(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError(t('Geolocation is not supported by your browser.'));
      setIsSearching(false);
    }
  };

  const handleDispatch = (e) => {
    e.preventDefault();
    setDispatchModal(prev => ({ ...prev, status: 'processing' }));
    setTimeout(() => {
      setDispatchModal(prev => ({ ...prev, status: 'success' }));
    }, 2000);
  };

  const contactAmbulance = (ambulance) => {
    if (ambulance.phone) {
      window.location.href = `tel:${ambulance.phone}`;
      return;
    }
    window.open(`https://www.google.com/maps/dir/${mapCenter[0]},${mapCenter[1]}/${ambulance.lat},${ambulance.lng}`, '_blank');
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
            <div className="flex-grow flex flex-col items-center justify-center relative rounded-[32px] overflow-hidden min-h-[400px]">
              {hasScanned && !locationError && !isSearching ? (
                <div className="absolute inset-0 z-0">
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    <MapUpdater center={mapCenter} />
                    
                    {/* User Location Marker */}
                    <Marker position={mapCenter}>
                      <Popup>Your Location</Popup>
                    </Marker>
                    
                    {/* Ambulance Markers */}
                    {ambulances.map(amb => (
                      <Marker 
                        key={amb.id} 
                        position={[amb.lat, amb.lng]} 
                        icon={ambulanceIcon}
                        eventHandlers={{
                          click: () => setSelectedAmbulance(amb),
                        }}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong>{amb.type}</strong><br/>
                            {amb.eta} away<br/>
                            Provider: {amb.driver}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              ) : (
                <div className="absolute inset-0 bg-slate-100 rounded-2xl overflow-hidden opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              )}
              
              <AnimatePresence>
                {(!isSearching && (!hasScanned || locationError) && ambulances.length === 0) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10 text-center bg-white/90 backdrop-blur-md p-8 rounded-[32px] shadow-2xl max-w-md w-full border border-white">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">📍</div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Where are you?')}</h3>
                    <p className="text-slate-500 mb-6">{t('Enter your current city or emergency address to find nearby ambulances.')}</p>
                    
                    {locationError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-bold">
                        {locationError}
                      </div>
                    )}

                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                      <input 
                        type="text" 
                        required
                        placeholder={t('e.g. Hyderabad')}
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none text-center text-lg font-bold shadow-sm"
                      />
                      <button 
                        type="submit"
                        disabled={isSearching}
                        className="w-full py-4 bg-red-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-70"
                      >
                        {t('Find Nearest Ambulance')}
                      </button>
                    </form>
                    
                    <div className="flex items-center justify-center gap-4 text-slate-400 font-bold uppercase text-xs my-6">
                      <span className="w-16 h-px bg-slate-200"></span> OR <span className="w-16 h-px bg-slate-200"></span>
                    </div>
                    
                    <button 
                      onClick={getCurrentLocation}
                      disabled={isSearching}
                      className="w-full py-4 bg-slate-100 text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-200 active:scale-95 transition-all border border-slate-200 flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                      <span className="text-xl">🧭</span> {t('Use My Current Location')}
                    </button>
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
                      <p>{amb.driver}</p>
                      <p className="text-xs mt-1">{amb.phone ? amb.phone : amb.reg}</p>
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
                 onClick={() => contactAmbulance(selectedAmbulance)}
                 className="mt-4 w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg hover:bg-red-700 active:scale-95 transition-all"
               >
                 {selectedAmbulance.phone ? t('Call Ambulance Service') : t('Get Directions')}
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
