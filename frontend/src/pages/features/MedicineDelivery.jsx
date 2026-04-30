import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { apiUrl, authHeaders } from '../../config/api';

const MedicineDelivery = () => {
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' or 'tracking'
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [orderModal, setOrderModal] = useState({ isOpen: false, rx: null, status: 'idle' });
  const [address, setAddress] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rxRes, ordRes] = await Promise.all([
        axios.get(apiUrl('/prescriptions/patient'), { headers: authHeaders(token) }).catch(() => ({ data: [] })),
        axios.get(apiUrl('/orders/patient'), { headers: authHeaders(token) }).catch(() => ({ data: { orders: [] } }))
      ]);

      const rxList = Array.isArray(rxRes.data) ? rxRes.data : rxRes.data.prescriptions || [];
      setPrescriptions(rxList);
      setOrders(ordRes.data.orders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!orderModal.rx || !address.trim()) return;
    
    setOrderModal(prev => ({ ...prev, status: 'processing' }));
    try {
      await axios.post(apiUrl('/orders'), {
        prescriptionId: orderModal.rx._id,
        address: address,
        medicines: orderModal.rx.medicines
      }, { headers: authHeaders(token) });
      
      setOrderModal(prev => ({ ...prev, status: 'success' }));
      fetchData(); // refresh orders
    } catch (error) {
      console.error('Error creating order:', error);
      alert(t('Failed to create order'));
      setOrderModal(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const getStatusStep = (status) => {
    switch(status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Out for Delivery': return 3;
      case 'Completed': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl text-4xl mb-6 shadow-sm">🛵</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('Medicine Delivery')}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t('Order medicines directly from your doctor\'s prescription and track delivery live.')}</p>
        </div>

        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm border border-white/50 ${activeTab === 'prescriptions' ? 'bg-emerald-600 text-white shadow-emerald-600/20 shadow-lg' : 'bg-white/80 backdrop-blur-md text-slate-500 hover:bg-emerald-50'}`}
          >
            {t('My Prescriptions')}
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm border border-white/50 relative ${activeTab === 'tracking' ? 'bg-emerald-600 text-white shadow-emerald-600/20 shadow-lg' : 'bg-white/80 backdrop-blur-md text-slate-500 hover:bg-emerald-50'}`}
          >
            {t('Live Tracking')}
            {orders.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">{orders.length}</span>}
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
            {activeTab === 'prescriptions' && (
              <div>
                {loading ? (
                  <div className="text-center py-20 text-slate-500 font-bold">{t('Loading prescriptions...')}</div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-20 bg-white/60 rounded-[32px] border border-white/50 shadow-sm">
                    <div className="text-6xl mb-4 opacity-50">📋</div>
                    <h3 className="text-2xl font-bold text-slate-700">{t('No Prescriptions Found')}</h3>
                    <p className="text-slate-500">{t('You can only order medicines if a doctor has prescribed them to you.')}</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {prescriptions.map((rx, i) => (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} key={rx._id} className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg uppercase">Rx</span>
                          <span className="text-xs text-slate-500 font-bold">{new Date(rx.createdAt || rx.date).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Dr. {rx.doctorId?.userId?.fullName || 'Doctor'}</h3>
                        <p className="text-sm text-slate-500 mb-4 flex-grow">{rx.diagnosis?.disease || 'General Checkup'}</p>
                        
                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medicines ({rx.medicines?.length || 0})</p>
                           <ul className="text-sm text-slate-700 space-y-1">
                             {rx.medicines?.map((m, idx) => (
                               <li key={idx}>• {m.name} - {m.dosage}</li>
                             ))}
                           </ul>
                        </div>
                        
                        <button 
                          onClick={() => setOrderModal({ isOpen: true, rx, status: 'idle' })}
                          className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg active:scale-95"
                        >
                          {t('Order Delivery')}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tracking' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {orders.length === 0 && !loading ? (
                  <div className="text-center py-20 bg-white/60 rounded-[32px] border border-white/50 shadow-sm">
                    <h3 className="text-2xl font-bold text-slate-700">{t('No Active Orders')}</h3>
                  </div>
                ) : (
                  orders.map((order, i) => {
                    const step = getStatusStep(order.status);
                    return (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i*0.1 }} key={order._id} className="bg-white/70 backdrop-blur-md p-8 rounded-[32px] border border-white/50 shadow-sm">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID: {order._id.substring(0,8)}</p>
                            <h3 className="text-xl font-black text-slate-900">{order.medicines?.length} Medicines</h3>
                          </div>
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status}
                          </span>
                        </div>

                        {order.status === 'Cancelled' ? (
                          <div className="py-10 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">❌</div>
                            <h3 className="text-xl font-bold text-slate-800">{t('Order Cancelled')}</h3>
                            <p className="text-slate-500 mt-2">{t('This delivery request was cancelled by the administrator.')}</p>
                          </div>
                        ) : (
                          <div className="relative pt-10 pb-8">
                           {/* Bike Animation */}
                           // FIXED CODE

                         <motion.div 
                           className="absolute top-0 text-5xl z-20"
                           initial={{ left: '0%' }}
                           animate={{ left: `${(step - 1) * 33}%` }}
                           transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                               >
                                 🛵
                               </motion.div>
                           
                           {/* Progress Line */}
                           <div className="absolute top-12 left-0 w-full h-1 bg-slate-200 rounded-full z-0 overflow-hidden">
                             <motion.div 
                               className="h-full bg-emerald-500"
                               initial={{ width: '0%' }}
                               animate={{ width: `${(step - 1) * 33}%` }}
                               transition={{ duration: 0.5 }}
                             />
                           </div>

                           <div className="relative z-10 flex justify-between">
                             {['Pending Admin', 'Confirmed', 'Out for Delivery', 'Completed'].map((label, idx) => (
                               <div key={label} className="flex flex-col items-center">
                                 <div className={`w-4 h-4 rounded-full mb-2 ${step > idx ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                 <span className={`text-xs font-bold ${step > idx ? 'text-slate-900' : 'text-slate-400'}`}>{t(label)}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                        )}

                        {order.status === 'Pending' && (
                          <div className="mt-4 bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-bold text-center">
                            Waiting for Admin to review and confirm the prescription.
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {orderModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setOrderModal({ isOpen: false, rx: null, status: 'idle' })}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>

              {orderModal.status === 'idle' && (
                <form onSubmit={handleOrder}>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">📦</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Delivery Details')}</h3>
                  <p className="text-slate-500 mb-6">{t('Ordering')} <span className="font-bold text-emerald-600">{orderModal.rx?.medicines?.length}</span> {t('medicines.')}</p>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('Complete Delivery Address')}</label>
                      <textarea required rows="4" placeholder={t('House No, Street, Landmark, Pincode...')} value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all">
                    {t('Confirm Order (Cash on Delivery)')}
                  </button>
                </form>
              )}

              {orderModal.status === 'processing' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-800">{t('Placing Order...')}</h3>
                </div>
              )}

              {orderModal.status === 'success' && (
                <div className="py-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    ✓
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Order Placed!')}</h3>
                  <p className="text-slate-500 mb-6">{t('Your order is Pending Admin Confirmation. Check Live Tracking.')}</p>
                  
                  <button 
                    onClick={() => {
                      setOrderModal({ isOpen: false, rx: null, status: 'idle' });
                      setActiveTab('tracking');
                    }}
                    className="w-full py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    {t('Go to Tracking')}
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

export default MedicineDelivery;
