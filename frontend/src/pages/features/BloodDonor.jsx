import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';

const BloodDonor = () => {
  const { t } = useTranslation();
  const [bloodGroup, setBloodGroup] = useState('All');
  const [location, setLocation] = useState('');
  const [requestModal, setRequestModal] = useState({ isOpen: false, donor: null, status: 'idle' });
  const [requestDetails, setRequestDetails] = useState({ patientName: '', hospitalName: '', urgency: 'High' });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const mockDonors = [
    { id: 1, name: 'Suresh Kumar', type: 'Individual Donor', group: 'O+', location: 'Banjara Hills, Hyderabad', distance: '2.5 km', status: 'Available' },
    { id: 2, name: 'Apollo Blood Bank', type: 'Hospital Blood Bank', group: 'A-', location: 'Madhapur, Hyderabad', distance: '4.1 km', status: 'Available' },
    { id: 3, name: 'Ramesh Singh', type: 'Individual Donor', group: 'B+', location: 'Secunderabad', distance: '8.3 km', status: 'Unavailable' },
    { id: 4, name: 'Care Hospital Bank', type: 'Hospital Blood Bank', group: 'O-', location: 'Gachibowli, Hyderabad', distance: '1.2 km', status: 'Available' },
    { id: 5, name: 'Mohammed Ali', type: 'Individual Donor', group: 'AB+', location: 'Kukatpally, Hyderabad', distance: '5.6 km', status: 'Available' },
    { id: 6, name: 'Red Cross Society', type: 'Blood Bank', group: 'O+', location: 'Jubilee Hills, Hyderabad', distance: '3.0 km', status: 'Available' },
    { id: 7, name: 'Yashoda Blood Center', type: 'Hospital Blood Bank', group: 'B-', location: 'Somajiguda, Hyderabad', distance: '3.5 km', status: 'Available' },
    { id: 8, name: 'Anita Patel', type: 'Individual Donor', group: 'A+', location: 'Hitech City, Hyderabad', distance: '1.8 km', status: 'Available' },
    { id: 9, name: 'Vikram Desai', type: 'Individual Donor', group: 'O-', location: 'Begumpet, Hyderabad', distance: '6.2 km', status: 'Available' },
    { id: 10, name: 'Medicover Blood Bank', type: 'Hospital Blood Bank', group: 'AB-', location: 'Madhapur, Hyderabad', distance: '4.5 km', status: 'Available' },
    { id: 11, name: 'Priya Sharma', type: 'Individual Donor', group: 'A-', location: 'Kondapur, Hyderabad', distance: '5.0 km', status: 'Unavailable' },
    { id: 12, name: 'KIMS Blood Bank', type: 'Hospital Blood Bank', group: 'B+', location: 'Secunderabad', distance: '7.8 km', status: 'Available' },
    { id: 13, name: 'Rajesh Reddy', type: 'Individual Donor', group: 'O+', location: 'Ameerpet, Hyderabad', distance: '4.2 km', status: 'Available' },
    { id: 14, name: 'Sneha Gupta', type: 'Individual Donor', group: 'AB+', location: 'KPHB, Hyderabad', distance: '8.1 km', status: 'Available' },
    { id: 15, name: 'AIG Blood Center', type: 'Hospital Blood Bank', group: 'A+', location: 'Gachibowli, Hyderabad', distance: '2.2 km', status: 'Available' },
    { id: 16, name: 'Karthik Iyer', type: 'Individual Donor', group: 'B-', location: 'Tolichowki, Hyderabad', distance: '6.5 km', status: 'Available' },
    { id: 17, name: 'Nizam Institute Bank', type: 'Hospital Blood Bank', group: 'O-', location: 'Panjagutta, Hyderabad', distance: '3.8 km', status: 'Unavailable' },
    { id: 18, name: 'Pooja Verma', type: 'Individual Donor', group: 'A+', location: 'Dilsukhnagar, Hyderabad', distance: '12.4 km', status: 'Available' }
  ];

  const filteredDonors = mockDonors.filter(d => {
    const matchesGroup = bloodGroup === 'All' || d.group === bloodGroup;
    const matchesLocation = location === '' || d.location.toLowerCase().includes(location.toLowerCase());
    return matchesGroup && matchesLocation;
  });

  const handleRequest = (e) => {
    e.preventDefault();
    setRequestModal(prev => ({ ...prev, status: 'processing' }));
    setTimeout(() => {
      setRequestModal(prev => ({ ...prev, status: 'success' }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl text-3xl mb-4 shadow-sm">🩸</div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{t('Blood Donor Finder')}</h1>
            <p className="text-xl text-slate-500">{t('Find emergency blood donors near your location.')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder={t('Search Location...')} 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-6 py-4 rounded-2xl border-none outline-none shadow-sm focus:ring-2 focus:ring-primary-500 w-full md:w-64"
            />
            <select 
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="px-6 py-4 rounded-2xl border-none outline-none shadow-sm focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="All">{t('All Blood Groups')}</option>
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor, idx) => (
            <motion.div 
              key={donor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50 hover:shadow-xl transition-shadow flex flex-col relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center opacity-50 z-0">
                <span className="text-5xl font-black text-rose-200">{donor.group}</span>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm">
                    {donor.group}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ${donor.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {t(donor.status)}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-800 mb-1">{donor.name}</h2>
                <p className="text-sm font-bold text-rose-600 mb-2">{donor.type}</p>
                <p className="text-slate-500 text-sm mb-6">📍 {donor.location} ({donor.distance})</p>

                <button 
                  disabled={donor.status !== 'Available'}
                  onClick={() => setRequestModal({ isOpen: true, donor, status: 'idle' })}
                  className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${donor.status === 'Available' ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-lg shadow-rose-600/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  <span className="text-lg">📞</span> {t('Request Blood')}
                </button>
              </div>
            </motion.div>
          ))}

          {filteredDonors.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <div className="text-6xl mb-4 opacity-50">🩸</div>
               <h3 className="text-2xl font-bold text-slate-700">{t('No donors found')}</h3>
               <p className="text-slate-500">{t('Try adjusting your blood group or location filter.')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {requestModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setRequestModal({ isOpen: false, donor: null, status: 'idle' })}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>

              {requestModal.status === 'idle' && (
                <form onSubmit={handleRequest}>
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🩸</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Request Blood Match')}</h3>
                  <p className="text-slate-500 mb-6">{t('Requesting')} <span className="font-bold text-rose-600">{requestModal.donor?.group}</span> {t('from')} {requestModal.donor?.name}</p>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Patient Name')}</label>
                      <input required type="text" value={requestDetails.patientName} onChange={e => setRequestDetails({...requestDetails, patientName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Hospital Destination')}</label>
                      <input required type="text" value={requestDetails.hospitalName} onChange={e => setRequestDetails({...requestDetails, hospitalName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Urgency Level')}</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none">
                        <option>Critical (Within 2 Hours)</option>
                        <option>High (Today)</option>
                        <option>Moderate (Within 24 Hours)</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all">
                    {t('Send Request')}
                  </button>
                </form>
              )}

              {requestModal.status === 'processing' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-800">{t('Sending Request...')}</h3>
                  <p className="text-slate-500">{t('Contacting donor/blood bank')}</p>
                </div>
              )}

              {requestModal.status === 'success' && (
                <div className="py-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    ✓
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Request Sent!')}</h3>
                  <p className="text-slate-500 mb-6">{t('Your request for')} <span className="font-bold text-rose-600">{requestModal.donor?.group}</span> {t('blood has been received. The donor or blood bank will contact you shortly.')}</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl mb-6 text-left">
                    <p className="text-sm text-slate-500 mb-1">{t('Request ID')}</p>
                    <p className="font-mono font-bold text-slate-900">BLD-{Math.floor(Math.random() * 100000)}</p>
                  </div>

                  <button 
                    onClick={() => setRequestModal({ isOpen: false, donor: null, status: 'idle' })}
                    className="w-full py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    {t('Close')}
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

export default BloodDonor;
