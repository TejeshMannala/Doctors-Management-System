import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Package, Clock, CheckCircle, Truck, X } from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../utils/ThemeContext';
import Toast from '../components/Toast';

const MedicineOrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { theme } = useTheme();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/admin');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showToast('Failed to load medicine orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/admin/${orderId}`, { status: newStatus });
      if (response.data.success) {
        showToast(`Order marked as ${newStatus}`);
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      showToast('Failed to update order status', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Out for Delivery': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredOrders = orders.filter(order => 
    order.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Medicine Orders</h1>
          <p className="text-slate-500 mt-1">Manage prescription delivery requests</p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by Patient or Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full sm:w-[320px] pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500' 
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
               <Package size={48} className="mx-auto text-slate-300 mb-4" />
               <p className="text-xl font-bold">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-[32px] border p-6 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</p>
                    <p className="font-mono text-sm font-bold">{order._id.substring(0,8)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="mb-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-black">{order.patientId?.fullName || 'Unknown Patient'}</h3>
                    <p className="text-sm text-slate-500">{order.patientId?.email}</p>
                  </div>

                  <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-slate-400 mt-0.5" />
                      <p className="text-sm font-medium">{order.address}</p>
                    </div>
                  </div>

                  <div>
                     <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{order.medicines?.length || 0} Medicines</p>
                     <ul className="text-sm space-y-1">
                       {order.medicines?.slice(0,3).map((m, idx) => (
                         <li key={idx} className="font-medium flex justify-between">
                            <span>{m.name}</span>
                            <span className="text-slate-500">{m.dosage}</span>
                         </li>
                       ))}
                       {order.medicines?.length > 3 && (
                         <li className="text-indigo-500 font-bold mt-1">+ {order.medicines.length - 3} more</li>
                       )}
                     </ul>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {order.status === 'Pending' && (
                    <>
                      <button onClick={() => updateStatus(order._id, 'Confirmed')} className="py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all">
                         Confirm
                      </button>
                      <button onClick={() => updateStatus(order._id, 'Cancelled')} className="py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 active:scale-95 transition-all border border-red-100">
                         Cancel
                      </button>
                    </>
                  )}
                  {order.status === 'Confirmed' && (
                    <>
                      <button onClick={() => updateStatus(order._id, 'Out for Delivery')} className="col-span-2 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all">
                         <Truck size={18} /> Dispatch Delivery
                      </button>
                    </>
                  )}
                  {order.status === 'Out for Delivery' && (
                    <>
                      <button onClick={() => updateStatus(order._id, 'Completed')} className="col-span-2 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all">
                         <CheckCircle size={18} /> Mark Completed
                      </button>
                    </>
                  )}
                  {order.status === 'Completed' && (
                    <div className="col-span-2 py-3 text-center text-emerald-600 font-black tracking-wide">
                       DELIVERY COMPLETED
                    </div>
                  )}
                  {order.status === 'Cancelled' && (
                    <div className="col-span-2 py-3 text-center text-red-600 font-black tracking-wide">
                       ORDER CANCELLED
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MedicineOrdersTable;
