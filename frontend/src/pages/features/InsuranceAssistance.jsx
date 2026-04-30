import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';

const InsuranceAssistance = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('guidelines');
  const [verificationState, setVerificationState] = useState('idle'); // idle, checking, verified, failed
  const [policyDetails, setPolicyDetails] = useState({ provider: '', policyNumber: '' });

  const providers = ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health', 'Niva Bupa', 'Aditya Birla'];

  const handleVerify = (e) => {
    e.preventDefault();
    if (!policyDetails.provider || !policyDetails.policyNumber) return;
    
    setVerificationState('checking');
    setTimeout(() => {
      // Mock validation
      if (policyDetails.policyNumber.length > 5) {
        setVerificationState('verified');
      } else {
        setVerificationState('failed');
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-100 text-cyan-600 rounded-3xl text-4xl mb-6 shadow-sm">🛡️</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('Health Insurance Assistance')}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t('Verify your coverage, get pre-approvals, and manage cashless treatments seamlessly.')}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm border border-white/50 ${activeTab === 'guidelines' ? 'bg-cyan-600 text-white shadow-cyan-600/20 shadow-lg' : 'bg-white/80 backdrop-blur-md text-slate-500 hover:bg-cyan-50'}`}
          >
            {t('How to Apply')}
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm border border-white/50 ${activeTab === 'verify' ? 'bg-cyan-600 text-white shadow-cyan-600/20 shadow-lg' : 'bg-white/80 backdrop-blur-md text-slate-500 hover:bg-cyan-50'}`}
          >
            {t('Verify Policy')}
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm border border-white/50 ${activeTab === 'claims' ? 'bg-cyan-600 text-white shadow-cyan-600/20 shadow-lg' : 'bg-white/80 backdrop-blur-md text-slate-500 hover:bg-cyan-50'}`}
          >
            {t('Active Claims')}
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
            {activeTab === 'guidelines' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-8 md:p-12 border border-white/50 shadow-xl">
                  <h3 className="text-3xl font-black text-slate-900 mb-8 text-center">{t('Guidelines: How to Apply for Cashless Insurance')}</h3>
                  
                  <div className="space-y-8">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 flex-shrink-0 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-xl font-black">1</div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">{t('Verify Your Policy')}</h4>
                        <p className="text-slate-600 leading-relaxed">{t('Navigate to the "Verify Policy" tab. Select your insurance provider from the list and enter your exact Policy Number or Member ID. Our system will securely check your active coverage and eligible amount.')}</p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="w-12 h-12 flex-shrink-0 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-xl font-black">2</div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">{t('Get Doctor\'s Recommendation')}</h4>
                        <p className="text-slate-600 leading-relaxed">{t('Once your policy is active, you must have a valid prescription or admission note from one of our doctors recommending the specific treatment or surgery.')}</p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="w-12 h-12 flex-shrink-0 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-xl font-black">3</div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">{t('Submit Pre-Authorization Form')}</h4>
                        <p className="text-slate-600 leading-relaxed">{t('Our hospital TPA (Third Party Administrator) desk will fill out the pre-authorization form and send it to your insurance provider. You can track this under the "Active Claims" tab. Approval usually takes 2-4 hours.')}</p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="w-12 h-12 flex-shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-black">✓</div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">{t('Start Treatment')}</h4>
                        <p className="text-slate-600 leading-relaxed">{t('Once the claim shows as "Approved", you can proceed with your cashless treatment without paying out of pocket (subject to your policy\'s co-pay rules).')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 text-center">
                    <button onClick={() => setActiveTab('verify')} className="px-10 py-4 bg-slate-900 text-white font-black text-lg rounded-2xl hover:bg-cyan-600 shadow-lg active:scale-95 transition-all">
                      {t('I Understand, Verify Policy')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verify' && (
              <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-8 md:p-12 border border-white/50 shadow-xl max-w-3xl mx-auto">
                {verificationState === 'idle' && (
                  <form onSubmit={handleVerify} className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">{t('Check Cashless Eligibility')}</h3>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('Select Insurance Provider')}</label>
                      <select 
                        required
                        value={policyDetails.provider}
                        onChange={e => setPolicyDetails({...policyDetails, provider: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none bg-white shadow-sm"
                      >
                        <option value="">{t('Choose Provider...')}</option>
                        {providers.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('Policy Number / Member ID')}</label>
                      <input 
                        required
                        type="text" 
                        value={policyDetails.policyNumber}
                        onChange={e => setPolicyDetails({...policyDetails, policyNumber: e.target.value})}
                        placeholder="e.g. POL123456789"
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm text-lg uppercase tracking-wider font-mono" 
                      />
                    </div>

                    <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black text-lg rounded-2xl hover:bg-cyan-600 shadow-lg active:scale-95 transition-all mt-4">
                      {t('Verify Coverage')}
                    </button>
                  </form>
                )}

                {verificationState === 'checking' && (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 border-4 border-slate-100 border-t-cyan-500 rounded-full animate-spin mx-auto mb-8 shadow-sm"></div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Verifying Policy...')}</h3>
                    <p className="text-slate-500 text-lg">{t('Connecting with')} {policyDetails.provider} {t('database')}</p>
                  </div>
                )}

                {verificationState === 'verified' && (
                  <div className="py-10 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
                      ✓
                    </motion.div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">{t('Policy Active & Verified')}</h3>
                    <p className="text-slate-500 mb-8">{t('You are eligible for cashless treatments at our network hospitals.')}</p>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left mb-8 shadow-sm">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{t('Provider')}</p>
                          <p className="font-black text-slate-900 text-lg">{policyDetails.provider}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{t('Coverage Left')}</p>
                          <p className="font-black text-emerald-600 text-lg">₹4,50,000</p>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => setVerificationState('idle')} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-cyan-600 transition-colors shadow-lg">
                      {t('Start Cashless Pre-Approval')}
                    </button>
                  </div>
                )}

                {verificationState === 'failed' && (
                  <div className="py-10 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
                      ✕
                    </motion.div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">{t('Verification Failed')}</h3>
                    <p className="text-slate-500 mb-8">{t('We could not verify this policy number. Please check the details and try again.')}</p>
                    <button onClick={() => setVerificationState('idle')} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                      {t('Try Again')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'claims' && (
              <div className="max-w-4xl mx-auto space-y-6">
                 <div className="bg-white/70 backdrop-blur-md p-8 rounded-[32px] border border-white/50 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">⏳</div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 mb-1">CLM-992817</h4>
                        <p className="text-slate-500">Knee Replacement Surgery • Apollo Hospitals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-xl text-sm mb-2">Pending TPA Approval</span>
                      <p className="font-black text-slate-900 text-lg">₹1,25,000</p>
                    </div>
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InsuranceAssistance;
