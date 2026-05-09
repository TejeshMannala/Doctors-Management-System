import React, { useContext, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import {
  Shield,
  FileText,
  ChevronRight,
  Search,
  Plus,
  Clock,
  Calendar,
  Receipt,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Building2,
  Phone,
  Landmark,
  CircleHelp,
  BadgeCheck,
  Wallet,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const insuranceProviders = [
  {
    id: 'star-health',
    name: 'Star Health Insurance',
    status: 'Partnered',
    icon: 'SH',
    coverage: 'Rs 5 Lakh - Rs 50 Lakh',
    claimType: 'Cashless + reimbursement',
    support: '1800-425-2255',
    responseTime: 'Pre-authorization in 2 to 6 hours',
    hospitals: ['Apollo Hospitals', 'Yashoda Hospitals', 'KIMS Hospitals'],
    banks: ['HDFC Bank', 'ICICI Bank', 'Axis Bank'],
    documents: ['Health card', 'Hospital estimate', 'Doctor advice', 'ID proof'],
    guidance:
      'Best for family floater plans and routine hospitalization support with broad cashless access.',
  },
  {
    id: 'hdfc-ergo',
    name: 'HDFC ERGO',
    status: 'Partnered',
    icon: 'HE',
    coverage: 'Rs 3 Lakh - Rs 1 Crore',
    claimType: 'Cashless + reimbursement',
    support: '022-6234-6234',
    responseTime: 'Claim updates in 24 hours',
    hospitals: ['AIG Hospitals', 'CARE Hospitals', 'Continental Hospitals'],
    banks: ['HDFC Bank', 'State Bank of India', 'Kotak Mahindra Bank'],
    documents: ['Policy number', 'Admission note', 'Bills', 'Cancelled cheque'],
    guidance:
      'Useful when you want high sum insured and fast reimbursement tracking for major procedures.',
  },
  {
    id: 'icici-lombard',
    name: 'ICICI Lombard',
    status: 'Partnered',
    icon: 'IL',
    coverage: 'Rs 2 Lakh - Rs 75 Lakh',
    claimType: 'Cashless + reimbursement',
    support: '1800-2666',
    responseTime: 'Document review in 3 working days',
    hospitals: ['Medicover Hospitals', 'KIMS Hospitals', 'Sunshine Hospitals'],
    banks: ['ICICI Bank', 'Axis Bank', 'Punjab National Bank'],
    documents: ['Claim form', 'Discharge summary', 'Prescriptions', 'Invoice copies'],
    guidance:
      'A good option for planned treatments because the document checklist is straightforward and well supported.',
  },
  {
    id: 'care-health',
    name: 'Care Health',
    status: 'Partnered',
    icon: 'CH',
    coverage: 'Rs 3 Lakh - Rs 60 Lakh',
    claimType: 'Cashless + reimbursement',
    support: '1800-102-4499',
    responseTime: 'Cashless desk usually responds the same day',
    hospitals: ['CARE Hospitals', 'Yashoda Hospitals', 'Rainbow Hospitals'],
    banks: ['State Bank of India', 'HDFC Bank', 'Bank of Baroda'],
    documents: ['Member ID', 'KYC', 'Investigation reports', 'Final bill'],
    guidance:
      'Helpful for families who need maternity and hospitalization support with decent partner hospital coverage.',
  },
  {
    id: 'niva-bupa',
    name: 'Niva Bupa',
    status: 'Partnered',
    icon: 'NB',
    coverage: 'Rs 5 Lakh - Rs 1 Crore',
    claimType: 'Cashless + reimbursement',
    support: '1860-500-8888',
    responseTime: 'Most requests acknowledged within a few hours',
    hospitals: ['Apollo Hospitals', 'Aster Prime', 'CARE Hospitals'],
    banks: ['ICICI Bank', 'Yes Bank', 'HDFC Bank'],
    documents: ['e-card', 'Doctor note', 'Admission form', 'Bank details'],
    guidance:
      'Suitable for users who want high coverage and smoother digital claim status updates.',
  },
  {
    id: 'aditya-birla',
    name: 'Aditya Birla Health',
    status: 'Available',
    icon: 'AB',
    coverage: 'Rs 2 Lakh - Rs 50 Lakh',
    claimType: 'Mostly reimbursement support',
    support: '1800-270-7000',
    responseTime: 'Usually 3 to 5 working days',
    hospitals: ['Partner hospital network varies by city'],
    banks: ['Axis Bank', 'HDFC Bank', 'Union Bank'],
    documents: ['Policy copy', 'Bills', 'Doctor certificate', 'Bank proof'],
    guidance:
      'Useful when you need wellness-linked plans and are comfortable following reimbursement steps carefully.',
  },
];

const claimGuideSteps = [
  {
    title: 'Check your policy first',
    detail:
      'Confirm that the illness, surgery, room rent, waiting period, and sum insured are covered before admission or payment.',
  },
  {
    title: 'Choose cashless or reimbursement',
    detail:
      'Use cashless at a network hospital when possible. Use reimbursement if you paid yourself or the hospital is outside the network.',
  },
  {
    title: 'Keep all documents safely',
    detail:
      'Save doctor advice, admission note, discharge summary, bills, medicine slips, lab reports, ID proof, and cancelled cheque.',
  },
  {
    title: 'Inform the insurer quickly',
    detail:
      'For planned admission, tell the insurer before treatment. For emergencies, inform them as early as possible after admission.',
  },
  {
    title: 'Submit the claim form correctly',
    detail:
      'Make sure the policy number, patient details, diagnosis, bank details, and signatures are complete so the claim is not delayed.',
  },
  {
    title: 'Track approval and respond fast',
    detail:
      'If the insurer asks for extra documents, send them quickly. Delays usually happen because one paper or signature is missing.',
  },
];

const smartTips = [
  'Prefer a network hospital if you want a smoother cashless claim experience.',
  'Room rent limits can reduce claim payout even when the treatment is covered.',
  'Always keep original bills and discharge summary until the claim is settled.',
  'If you are unsure, call the insurer helpline before paying large hospital bills.',
];

const initialPolicies = [
  {
    id: 1,
    name: 'Family Health Plus',
    provider: 'Star Health',
    number: 'POL-2023-8956',
    validUntil: '2027-06-15',
    coverage: 'Rs 10 Lakh',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Critical Illness Cover',
    provider: 'ICICI Lombard',
    number: 'POL-2024-4521',
    validUntil: '2026-12-31',
    coverage: 'Rs 5 Lakh',
    status: 'Active',
  },
];

const recentClaims = [
  {
    id: 'CLM-9021',
    type: 'Hospitalization',
    amount: 'Rs 45,000',
    status: 'Approved',
    date: 'Oct 24, 2025',
  },
  {
    id: 'CLM-8842',
    type: 'Medicine Reimbursement',
    amount: 'Rs 2,400',
    status: 'Processing',
    date: 'Nov 02, 2025',
  },
];

const InsuranceAssistance = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('coverage');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showClaimGuide, setShowClaimGuide] = useState(false);
  const [policyError, setPolicyError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [myPolicies, setMyPolicies] = useState(initialPolicies);
  const [policyData, setPolicyData] = useState({
    policyName: '',
    policyNumber: '',
    validUntil: '',
    coverageAmount: '',
    provider: '',
    notes: '',
  });

  const filteredProviders = useMemo(
    () =>
      insuranceProviders.filter((provider) =>
        [provider.name, provider.claimType, provider.guidance]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const handleCreatePolicy = () => {
    if (!token || !user) {
      setPolicyError('Please login to save policy details');
      return;
    }

    if (!policyData.policyName || !policyData.policyNumber || !policyData.validUntil) {
      setPolicyError('Please fill in all required fields');
      return;
    }

    const validDate = new Date(policyData.validUntil);
    if (Number.isNaN(validDate.getTime()) || validDate < new Date(new Date().toDateString())) {
      setPolicyError('Policy validity date must be today or a future date');
      return;
    }

    const providerName = policyData.provider || 'Self added policy';

    setMyPolicies((current) => [
      {
        id: Date.now(),
        name: policyData.policyName,
        provider: providerName,
        number: policyData.policyNumber,
        validUntil: policyData.validUntil,
        coverage: policyData.coverageAmount || 'Not added',
        status: 'Active',
      },
      ...current,
    ]);

    setSuccessMessage('Policy saved successfully');
    setPolicyError('');
    setShowPolicyModal(false);
    setPolicyData({
      policyName: '',
      policyNumber: '',
      validUntil: '',
      coverageAmount: '',
      provider: '',
      notes: '',
    });

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-20 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 left-20 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <BackButton />

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-white shadow-lg"
            >
              <CheckCircle className="h-5 w-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-700 p-8 text-white"
        >
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black md:text-4xl">{t('Health Insurance Assistance')}</h1>
                <p className="text-blue-100">
                  {t('Understand coverage, compare providers, and file claims with confidence')}
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-white/85">
              {t(
                'This page now helps users choose an insurer, understand reimbursement banks, and follow a clear claim process even if they are new to health insurance.'
              )}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab('coverage')}
                className={`rounded-xl px-6 py-3 font-semibold transition-all ${
                  activeTab === 'coverage' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {t('Providers')}
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`rounded-xl px-6 py-3 font-semibold transition-all ${
                  activeTab === 'claims' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {t('My Claims')}
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className={`rounded-xl px-6 py-3 font-semibold transition-all ${
                  activeTab === 'policies' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {t('My Policies')}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="mt-8 grid gap-8 xl:grid-cols-[1.75fr_1fr]"
        >
          <div className="space-y-8">
            {activeTab === 'coverage' && (
              <motion.div variants={fadeUp} className="space-y-8">
                <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-md">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-black text-slate-900">{t('Insurance Providers')}</h2>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('Search providers, claim type, or help topic...')}
                        className="rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredProviders.map((provider) => (
                      <motion.button
                        key={provider.id}
                        type="button"
                        variants={fadeUp}
                        whileHover={{ y: -4 }}
                        onClick={() => setSelectedProvider(provider)}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left transition-all hover:border-blue-200 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white">
                              {provider.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">{provider.name}</h3>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                  provider.status === 'Partnered'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {provider.status}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="mt-3 text-sm text-slate-600">Coverage: {provider.coverage}</p>
                        <p className="mt-1 text-sm text-slate-500">{provider.claimType}</p>
                        <p className="mt-3 line-clamp-2 text-sm text-slate-500">{provider.guidance}</p>
                      </motion.button>
                    ))}
                  </div>

                  {filteredProviders.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                      {t('No providers matched your search. Try insurer name, claim type, or coverage amount.')}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-md">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                      <CircleHelp className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">{t('Insurance Guide for Patients')}</h2>
                      <p className="text-slate-500">
                        {t('Simple advice for users who do not know which insurance to use or how to claim it')}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {claimGuideSteps.map((step, index) => (
                      <div key={step.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                            {index + 1}
                          </div>
                          <h3 className="font-bold text-slate-900">{step.title}</h3>
                        </div>
                        <p className="text-sm leading-6 text-slate-600">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'claims' && (
              <motion.div variants={fadeUp} className="space-y-8">
                <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-md">
                  <h2 className="mb-6 text-2xl font-black text-slate-900">{t('Recent Claims')}</h2>

                  <div className="space-y-4">
                    {recentClaims.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              claim.status === 'Approved' ? 'bg-emerald-100' : 'bg-amber-100'
                            }`}
                          >
                            {claim.status === 'Approved' ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-amber-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{claim.type}</p>
                            <p className="text-sm text-slate-500">
                              {claim.id} • {claim.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{claim.amount}</p>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              claim.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowClaimGuide(true)}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    {t('Open Claim Help')}
                  </button>
                </div>

                <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-md">
                  <h2 className="mb-5 text-2xl font-black text-slate-900">{t('Common Claim Mistakes')}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      'Missing discharge summary',
                      'Bank details not matching policy holder name',
                      'Claim informed too late',
                      'Original invoices not attached',
                    ].map((mistake) => (
                      <div key={mistake} className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{mistake}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'policies' && (
              <motion.div variants={fadeUp} className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-md">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-black text-slate-900">{t('My Policy Notes')}</h2>
                  <button
                    onClick={() => {
                      if (!token || !user) {
                        setPolicyError('Please login to create policy notes');
                        return;
                      }
                      setPolicyError('');
                      setShowPolicyModal(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
                  >
                    <Plus className="h-5 w-5" />
                    {t('Add Policy')}
                  </button>
                </div>

                {policyError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    {policyError}
                    {!token && (
                      <button onClick={() => navigate('/login')} className="ml-auto text-sm font-semibold underline">
                        {t('Login here')}
                      </button>
                    )}
                  </motion.div>
                )}

                <div className="space-y-4">
                  {myPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                            <Receipt className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{policy.name}</h3>
                            <p className="text-sm text-slate-500">
                              {policy.provider} • {policy.number}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {policy.status}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Valid until: {policy.validUntil}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          Coverage: {policy.coverage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-8">
            <motion.div variants={fadeUp} className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-md">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Landmark className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{t('Reimbursement Banks')}</h2>
                  <p className="text-sm text-slate-500">{t('Common bank accounts accepted for claim payout')}</p>
                </div>
              </div>

              <div className="space-y-3">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank'].map((bank) => (
                  <div key={bank} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{bank}</p>
                        <p className="text-xs text-slate-500">NEFT and reimbursement friendly</p>
                      </div>
                    </div>
                    <BadgeCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-md">
              <h2 className="mb-5 text-xl font-black text-slate-900">{t('What is Useful Before Claiming?')}</h2>
              <div className="space-y-3">
                {smartTips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <Wallet className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <p className="text-sm leading-6 text-slate-600">{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-md">
              <h2 className="mb-5 text-xl font-black text-slate-900">{t('Quick Help')}</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                  <p>{t('Call your insurer helpline and keep your policy number ready before hospital admission.')}</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                  <p>{t('Ask the hospital insurance desk whether your treatment is eligible for cashless approval.')}</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <Receipt className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                  <p>{t('If you paid yourself, keep original bills and bank details ready for reimbursement.')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showPolicyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
              onClick={() => setShowPolicyModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black">{t('Add Policy Note')}</h2>
                    <button onClick={() => setShowPolicyModal(false)} className="rounded-xl p-2 hover:bg-white/20">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-blue-200">{t('Keep track of your insurance policies')}</p>
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">{t('Policy Name')} *</label>
                    <input
                      type="text"
                      value={policyData.policyName}
                      onChange={(e) => setPolicyData({ ...policyData, policyName: e.target.value })}
                      placeholder={t('e.g., Family Health Plus')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">{t('Policy Number')} *</label>
                      <input
                        type="text"
                        value={policyData.policyNumber}
                        onChange={(e) => setPolicyData({ ...policyData, policyNumber: e.target.value })}
                        placeholder={t('POL-XXX-XXXX')}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">{t('Valid Until')} *</label>
                      <input
                        type="date"
                        value={policyData.validUntil}
                        onChange={(e) => setPolicyData({ ...policyData, validUntil: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">{t('Provider')}</label>
                      <input
                        type="text"
                        value={policyData.provider}
                        onChange={(e) => setPolicyData({ ...policyData, provider: e.target.value })}
                        placeholder={t('Insurance company')}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">{t('Coverage')}</label>
                      <input
                        type="text"
                        value={policyData.coverageAmount}
                        onChange={(e) => setPolicyData({ ...policyData, coverageAmount: e.target.value })}
                        placeholder={t('Rs 5 Lakh')}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">{t('Notes')}</label>
                    <textarea
                      value={policyData.notes}
                      onChange={(e) => setPolicyData({ ...policyData, notes: e.target.value })}
                      placeholder={t('Any additional notes...')}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {policyError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      {policyError}
                    </motion.div>
                  )}

                  <button
                    onClick={handleCreatePolicy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    <Send className="h-5 w-5" />
                    {t('Save Policy Note')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {selectedProvider && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
              onClick={() => setSelectedProvider(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-sm font-black">
                        {selectedProvider.icon}
                      </div>
                      <h2 className="text-2xl font-black">{selectedProvider.name}</h2>
                      <p className="mt-1 text-sm text-blue-100">{selectedProvider.guidance}</p>
                    </div>
                    <button onClick={() => setSelectedProvider(null)} className="rounded-xl p-2 hover:bg-white/10">
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coverage</p>
                      <p className="mt-1 font-bold text-slate-900">{selectedProvider.coverage}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Claim mode</p>
                      <p className="mt-1 font-bold text-slate-900">{selectedProvider.claimType}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Helpline</p>
                      <p className="mt-1 flex items-center gap-2 font-bold text-slate-900">
                        <Phone className="h-4 w-4 text-blue-600" />
                        {selectedProvider.support}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">{selectedProvider.responseTime}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Partner hospitals
                      </p>
                      <div className="space-y-2">
                        {selectedProvider.hospitals.map((hospital) => (
                          <div key={hospital} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                            {hospital}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Reimbursement banks
                      </p>
                      <div className="space-y-2">
                        {selectedProvider.banks.map((bank) => (
                          <div key={bank} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                            {bank}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 rounded-2xl bg-blue-50 p-5">
                    <p className="mb-3 text-sm font-bold text-blue-900">Documents usually needed</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedProvider.documents.map((doc) => (
                        <div key={doc} className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm text-slate-700">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                          {doc}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showClaimGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
              onClick={() => setShowClaimGuide(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black">{t('How to Claim Insurance')}</h2>
                      <p className="mt-1 text-sm text-blue-100">
                        {t('A simple explanation for users who are new to insurance claims')}
                      </p>
                    </div>
                    <button onClick={() => setShowClaimGuide(false)} className="rounded-xl p-2 hover:bg-white/20">
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  {claimGuideSteps.map((step, index) => (
                    <div key={step.title} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-900">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                    </div>
                  ))}
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
