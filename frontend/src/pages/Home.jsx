import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { apiUrl, authHeaders } from '../config/api';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const { t } = useTranslation();
  const [appointmentCount, setAppointmentCount] = useState(0);

  const featureCards = useMemo(() => [
    {
      eyebrow: t('Privacy First'),
      title: t('Secure & Private'),
      desc: t('Your health data is encrypted and protected'),
    },
    {
      eyebrow: t('Fast Support'),
      title: t('Simple Tracking'),
      desc: t('Keep your care journey organized in one place'),
    },
    {
      eyebrow: t('Remote Care'),
      title: t('Trusted Access'),
      desc: t('Connect with doctors and follow your care updates easily'),
    },
  ], [t]);

  const premiumFeatures = useMemo(() => [
    { to: '/features/health-records', icon: '📁', title: t('Digital Health Records'), desc: t('Patients can securely access prescriptions, reports, and medical history anytime.'), color: 'text-blue-600', bg: 'bg-blue-100/50' },
    { to: '/features/home-sample-collection', icon: '🏠', title: t('Home Sample Collection'), desc: t('Lab tests can be done from home with doorstep sample pickup service.'), color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
    { to: '/features/medicine-delivery', icon: '💊', title: t('Medicine Delivery Service'), desc: t('Prescribed medicines delivered directly to the patient’s home.'), color: 'text-rose-600', bg: 'bg-rose-100/50' },
    { to: '/features/ambulance', icon: '🚑', title: t('Emergency Ambulance Service'), desc: t('Quick ambulance support available for urgent medical situations.'), color: 'text-red-600', bg: 'bg-red-100/50' },
    { to: '/features/health-packages', icon: '💰', title: t('Affordable Health Packages'), desc: t('Special low-cost health checkup plans for families and senior citizens.'), color: 'text-teal-600', bg: 'bg-teal-100/50' },
    { to: '/features/insurance-assistance', icon: '🛡️', title: t('Health Insurance Assistance'), desc: t('Help for insurance claims and cashless treatment process.'), color: 'text-cyan-600', bg: 'bg-cyan-100/50' },
    { to: '/features/live-bed-availability', icon: '🛏️', title: t('Live Bed Availability'), desc: t('Patients can check hospital bed availability in real time.'), color: 'text-sky-600', bg: 'bg-sky-100/50' },
    { to: '/features/blood-donor-finder', icon: '🩸', title: t('Blood Donor Finder'), desc: t('Emergency blood donor search system for urgent needs.'), color: 'text-rose-600', bg: 'bg-rose-100/50' },
  ], [t]);

  useEffect(() => {
    const fetchPatientAppointments = async () => {
      if (user?.role !== 'patient' || !token) {
        setAppointmentCount(0);
        return;
      }

      try {
        const response = await axios.get(apiUrl('/appointments/patient'), {
          headers: authHeaders(token),
        });
        setAppointmentCount(response.data.appointments?.length || 0);
      } catch (error) {
        console.error('Error fetching appointment count:', error);
        setAppointmentCount(0);
      }
    };

    fetchPatientAppointments();
  }, [token, user?.role]);

  const quickActions = useMemo(() => {
    if (user?.role !== 'patient') {
      return [];
    }

    const actions = [
      {
        title: t('Explore Doctors'),
        desc: t('Find the best doctor for your needs'),
        cta: t('Explore Doctors'),
        to: '/explore-doctors',
        accent: 'from-slate-900 to-slate-700',
      },
      {
        title: t('My Appointments'),
        desc: t('Track booking ID and status'),
        cta: t('My Appointments'),
        to: '/my-appointments',
        accent: 'from-amber-500 to-orange-500',
      },
      {
        title: t('Prescription'),
        desc: t('Access your prescriptions anytime'),
        cta: t('Prescription'),
        to: '/prescription',
        accent: 'from-emerald-500 to-teal-500',
      },
      
      {
        title: t('Help'),
        desc: t('Get support and answers to your questions'),
        cta: t('Get Help'),
        to: '/help',
        accent: 'from-slate-900 to-slate-700',
      },
      {
        title: t('About'),
        desc: t('Learn more about our platform'),
        cta: t('About Us'),
        to: '/about',
        accent: 'from-slate-900 to-slate-700',
      },
    ];

    return actions;
  }, [t, user?.role]);

  const showQuickActions = quickActions.length > 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -45, 0], x: [0, -80, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Immersive Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-5 py-2 bg-white/40 backdrop-blur-md rounded-full text-xs md:text-sm font-bold text-primary-600 shadow-sm mb-8 border border-white/50">
                🚀 {t('Your Health, Simplified')}
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none mb-8 text-slate-900">
                {t('Modern Care for')} <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent animate-gradient-x">
                  {t('Modern Life')}
                </span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12 px-4">
                {appointmentCount > 0
                  ? t('Your appointments, doctors, and prescriptions stay organized in one smooth experience.')
                  : t('Connect with top doctors, manage prescriptions, and track your health journey in one beautiful platform.')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
                <Link to="/explore-doctors" className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-primary-600 text-white font-black text-lg shadow-2xl shadow-primary-500/30 transition-all hover:scale-105 hover:bg-primary-700 active:scale-95">
                  {t('Explore Doctors')}
                </Link>
                <Link to="/my-appointments" className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-white/60 backdrop-blur-md text-slate-900 font-black text-lg border border-white/50 shadow-xl transition-all hover:scale-105 hover:bg-white/80 active:scale-95">
                  {t('My Appointments')}
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Hero Visuals */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary-100/30 rounded-full pointer-events-none z-0">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="w-full h-full border border-dashed border-primary-200/20 rounded-full" />
          </div>
        </section>

        {/* Feature Section */}
        <section >
         </section>

        {/* Premium Features Section */}
        <section className="max-w-7xl mx-auto mb-24 px-4 md:px-8">

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {premiumFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-sm transition-all hover:shadow-xl hover:bg-white/80 flex flex-col group cursor-pointer"
              >
                <Link to={feature.to} className="flex flex-col h-full">
                  <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm flex-grow">{feature.desc}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Quick Actions Grid */}
        {showQuickActions && (
          <section className="max-w-7xl mx-auto mb-32 px-4 md:px-8">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-primary-600 mb-2">⚡ {t('Quick Access')}</p>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">{t('Continue Your Journey')}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {quickActions.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -12 }}
                  className="bg-white/60 backdrop-blur-md rounded-[32px] border border-white/50 p-8 shadow-sm transition-all hover:shadow-2xl hover:bg-white/80 flex flex-col group relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${item.accent}`} />
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-2xl text-white mb-6 shadow-lg shadow-primary-500/20 group-hover:rotate-12 transition-transform`}>
                    {index === 0 ? '🩺' : index === 1 ? '📅' : index === 2 ? '💊' : index === 3 ? '❓' : 'ℹ️'}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-500 mb-8 flex-grow leading-relaxed">{item.desc}</p>
                  <Link to={item.to} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-center transition-all hover:bg-primary-600 hover:shadow-lg active:scale-95">
                    {item.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto mb-20 px-4">
          <motion.div 
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-slate-900 to-primary-900 rounded-[48px] p-10 md:p-20 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary-600/10 blur-[120px] rounded-full" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{t('Ready to experience')} <br />{t('the future of care?')}</h2>
              <Link to="/explore-doctors" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-full font-black text-xl hover:scale-105 transition-all active:scale-95 shadow-2xl">
                {t('Get Started Now')} <span>→</span>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Home;
