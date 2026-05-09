import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import { 
  Shield, FileText, Hospital, HelpCircle, ChevronRight, Search, 
  Plus, Download, AlertCircle, Clock, ArrowLeft, CheckCircle, 
  XCircle, AlertTriangle, Send, Lock, User, Calendar, Receipt
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const InsuranceAssistance = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('coverage');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyData, setPolicyData] = useState({
    policyName: '',
    policyNumber: '',
    validUntil: '',
    coverageAmount: '',
    provider: '',
    notes: ''
  });
  const [policyError, setPolicyError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const insuranceProviders = [
    { name: 'Star Health Insurance', status: 'Partnered', icon: '⭐', coverage: '₹5 Lakh - ₹50 Lakh' },
    { name: 'HDFC ERGO', status: 'Partnered', icon: '🏦', coverage: '₹3 Lakh - ₹1 Crore' },
    { name: 'ICICI Lombard', status: 'Partnered', icon: '💎', coverage: '₹2 Lakh - ₹75 Lakh' },
    { name: 'Care Health', status: 'Partnered', icon: '❤️', coverage: '₹3 Lakh - ₹60 Lakh' },
    { name: 'Niva Bupa', status: 'Partnered', icon: '🛡️', coverage: '₹5 Lakh - ₹1 Crore' },
    { name: 'Aditya Birla', status: 'Available', icon: '🏢', coverage: '₹2 Lakh - ₹50 Lakh' },
    { name: 'Bajaj Allianz', status: 'Available', icon: '🎯', coverage: '₹1.5 Lakh - ₹50 Lakh' },
    { name: 'Reliance', status: 'Available', icon: '📊', coverage: '₹3 Lakh - ₹75 Lakh' },
  ];

  const recentClaims = [
    { id: 'CLM-9021', type: 'Hospitalization', amount: '₹45,000', status: 'Approved', date: 'Oct 24, 2023' },
    { id: 'CLM-8842', type: 'Medicine Reimbursement', amount: '₹2,400', status: 'Processing', date: 'Nov 02, 2023' },
  ];

  const myPolicies = [
    { id: 1, name: 'Family Health Plus', provider: 'Star Health', number: 'POL-2023-8956', validUntil: '2025-06-15', coverage: '₹10 Lakh', status: 'Active' },
    { id: 2, name: 'Critical Illness Cover', provider: 'ICICI Lombard', number: 'POL-2022-4521', validUntil: '2024-12-31', coverage: '₹5 Lakh', status: 'Active' },
  ];

  const handleCreatePolicy = () => {
    if (!token || !user) {
      setPolicyError('Please login to create policy notes');
      return;
    }

    if (!policyData.policyName || !policyData.policyNumber || !policyData.validUntil) {
      setPolicyError('Please fill in all required fields');
      return;
    }

    // Validate date
    const validDate = new Date(policyData.validUntil);
    if (validDate < new Date()) {
      setPolicyError('Policy validity date must be in the future');
      return;
    }

    // Success
    setSuccessMessage('Policy note created successfully!');
    setPolicyError('');
    setShowPolicyModal(false);
    setPolicyData({
      policyName: '',
      policyNumber: '',
      validUntil: '',
      coverageAmount: '',
      provider: '',
      notes: ''
    });
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredProviders = insuranceProviders.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <BackButton />

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black">{t('Health Insurance Assistance')}</h1>
                <p className="text-blue-200">{t('Manage your health policies and claims')}</p>
              </div>
            </div>
            
            <p className="text-white/80 max-w-xl mt-4">
              {t('Track your insurance claims, manage policy documents, and get help with cashless treatments from our partnered providers.')}
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => setActiveTab('coverage')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'coverage' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {t('Providers')}
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'claims' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {t('My Claims')}
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'policies' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {t('My Policies')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="mt-8"
        >
          {/* Providers Tab */}
          {activeTab === 'coverage' && (
            <motion.div variants={fadeUp}>
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900">{t('Insurance Providers')}</h2>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('Search providers...')}
                      className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {filteredProviders.map((provider, index) => (
                    <motion.div
                      key={index}
                      variants={fadeUp}
                      whileHover={{ y: -4 }}
                      className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl">
                            {provider.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{provider.name}</h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${provider.status === 'Partnered' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {provider.status}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 mt-3">Coverage: {provider.coverage}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Claims Tab */}
          {activeTab === 'claims' && (
            <motion.div variants={fadeUp}>
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50">
                <h2 className="text-2xl font-black text-slate-900 mb-6">{t('Recent Claims')}</h2>
                
                <div className="space-y-4">
                  {recentClaims.map((claim, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${claim.status === 'Approved' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                          {claim.status === 'Approved' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{claim.type}</p>
                          <p className="text-sm text-slate-500">{claim.id} • {claim.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{claim.amount}</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  {t('File New Claim')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <motion.div variants={fadeUp}>
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900">{t('My Policy Notes')}</h2>
                  <button
                    onClick={() => {
                      if (!token || !user) {
                        setPolicyError('Please login to create policy notes');
                        return;
                      }
                      setShowPolicyModal(true);
                      setPolicyError('');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    {t('Add Policy')}
                  </button>
                </div>

                {policyError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    {policyError}
                    {!token && (
                      <button 
                        onClick={() => navigate('/login')}
                        className="ml-auto text-sm font-semibold underline"
                      >
                        {t('Login here')}
                      </button>
                    )}
                  </motion.div>
                )}

                <div className="space-y-4">
                  {myPolicies.map((policy, index) => (
                    <div key={index} className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{policy.name}</h3>
                            <p className="text-sm text-slate-500">{policy.provider} • {policy.number}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          {policy.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Valid until: {policy.validUntil}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          Coverage: {policy.coverage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {myPolicies.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('No policies yet')}</h3>
                    <p className="text-slate-500">{t('Add your first policy note to track your insurance')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Add Policy Modal */}
        <AnimatePresence>
          {showPolicyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
              onClick={() => setShowPolicyModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black">{t('Add Policy Note')}</h2>
                    <button onClick={() => setShowPolicyModal(false)} className="p-2 hover:bg-white/20 rounded-xl">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-blue-200 text-sm mt-1">{t('Keep track of your insurance policies')}</p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Policy Name')} *</label>
                    <input
                      type="text"
                      value={policyData.policyName}
                      onChange={(e) => setPolicyData({ ...policyData, policyName: e.target.value })}
                      placeholder={t('e.g., Family Health Plus')}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Policy Number')} *</label>
                      <input
                        type="text"
                        value={policyData.policyNumber}
                        onChange={(e) => setPolicyData({ ...policyData, policyNumber: e.target.value })}
                        placeholder={t('POL-XXX-XXXX')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Valid Until')} *</label>
                      <input
                        type="date"
                        value={policyData.validUntil}
                        onChange={(e) => setPolicyData({ ...policyData, validUntil: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Provider')}</label>
                      <input
                        type="text"
                        value={policyData.provider}
                        onChange={(e) => setPolicyData({ ...policyData, provider: e.target.value })}
                        placeholder={t('Insurance company')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Coverage')}</label>
                      <input
                        type="text"
                        value={policyData.coverageAmount}
                        onChange={(e) => setPolicyData({ ...policyData, coverageAmount: e.target.value })}
                        placeholder={t('₹5 Lakh')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Notes')}</label>
                    <textarea
                      value={policyData.notes}
                      onChange={(e) => setPolicyData({ ...policyData, notes: e.target.value })}
                      placeholder={t('Any additional notes...')}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  {policyError && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {policyError}
                    </motion.div>
                  )}

                  <button
                    onClick={handleCreatePolicy}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {t('Save Policy Note')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InsuranceAssistance;