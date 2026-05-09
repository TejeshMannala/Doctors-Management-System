import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { apiUrl, authHeaders } from '../config/api';
import { 
  Calendar, Pill, FileText, Clock, Heart, 
  Shield, Stethoscope, Activity, ArrowRight,
  Sparkles, Star, Users, CheckCircle
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const floating = {
  animate: {
    y: [-10, 10, -10],
    rotate: [0, 5, -5, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
};

const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: { duration: 2, repeat: Infinity }
  }
};

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const { t } = useTranslation();
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const premiumFeatures = useMemo(() => [
    { to: '/features/health-records', icon: FileText, title: t('Digital Health Records'), desc: t('Securely access prescriptions, reports & medical history'), color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', iconBg: 'bg-blue-500' },
    { to: '/features/home-sample-collection', icon: Activity, title: t('Home Sample Collection'), desc: t('Lab tests from home with doorstep pickup'), color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', iconBg: 'bg-emerald-500' },
    { to: '/features/medicine-delivery', icon: Pill, title: t('Medicine Delivery'), desc: t('Medicines delivered to your doorstep'), color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', iconBg: 'bg-rose-500' },
    { to: '/features/ambulance', icon: Heart, title: t('Emergency Ambulance'), desc: t('Quick ambulance support for emergencies'), color: 'from-red-500 to-orange-500', bg: 'bg-red-50', iconBg: 'bg-red-500' },
    { to: '/features/health-packages', icon: Star, title: t('Health Packages'), desc: t('Affordable checkup plans for families'), color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50', iconBg: 'bg-amber-500' },
    { to: '/features/insurance-assistance', icon: Shield, title: t('Insurance Assistance'), desc: t('Help with claims & cashless treatment'), color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', iconBg: 'bg-violet-500' },
    { to: '/features/live-bed-availability', icon: Calendar, title: t('Bed Availability'), desc: t('Real-time hospital bed updates'), color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50', iconBg: 'bg-sky-500' },
    { to: '/features/blood-donor-finder', icon: Users, title: t('Blood Donor Finder'), desc: t('Emergency blood donor search'), color: 'from-red-400 to-rose-500', bg: 'bg-red-50', iconBg: 'bg-red-400' },
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
        setAppointmentCount(0);
      }
    };
    fetchPatientAppointments();
  }, [token, user?.role]);

  const quickActions = useMemo(() => {
    if (user?.role !== 'patient') return [];
    return [
      { title: t('Explore Doctors'), desc: t('Find the best doctor'), cta: t('Browse'), to: '/explore-doctors', icon: Stethoscope, color: 'from-indigo-500 to-purple-500' },
      { title: t('My Appointments'), desc: t('Track your bookings'), cta: t('View'), to: '/my-appointments', icon: Calendar, color: 'from-amber-500 to-orange-500' },
      { title: t('Prescription'), desc: t('Access prescriptions'), cta: t('View'), to: '/prescription', icon: FileText, color: 'from-emerald-500 to-teal-500' },
      { title: t('Need Help?'), desc: t('Get support'), cta: t('Contact'), to: '/help', icon: Shield, color: 'from-slate-500 to-slate-700' },
    ];
  }, [t, user?.role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 80, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-100/20 rounded-full" 
        />
      </div>

      {/* Floating Icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 3 + i * 0.5, 
              repeat: Infinity, 
              delay: i * 0.5 
            }}
            className={`absolute text-4xl opacity-20 ${['top-20% left-10%', 'top-40% right-20%', 'bottom-30% left-20%', 'bottom-20% right-10%', 'top-60% left-30%', 'top-80% right-30%'][i]}`}
          >
            {['💊', '🏥', '🩺', '💉', '🫀', '🏨'][i]}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative pt-28 pb-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full border border-blue-100/50 shadow-lg shadow-blue-500/10">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">{t('Your Health, Simplified')}</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-10"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight mb-6">
              <span className="text-slate-900">{t('Modern Care')} </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t('For Modern Life')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {appointmentCount > 0
                ? t('Welcome back! Continue managing your health journey with ease.')
                : t('Connect with top doctors, manage prescriptions, and track your health in one beautiful platform.')}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Link 
              to="/explore-doctors"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Stethoscope className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t('Find a Doctor')}</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/my-appointments"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-md text-slate-700 font-bold rounded-2xl border border-slate-200/50 shadow-lg hover:bg-white hover:shadow-xl transition-all"
            >
              <Calendar className="w-5 h-5 text-slate-500" />
              <span>{t('My Appointments')}</span>
            </Link>
          </motion.div>
        </div>

        {/* Decorative Circle */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-blue-200/30 rounded-full pointer-events-none"
        />
      </motion.section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
            {t('All Your Healthcare Needs')}
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            {t('Everything you need to manage your health in one place')}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {premiumFeatures.map((feature, idx) => (
            <Link to={feature.to} key={idx}>
              <motion.div
                variants={fadeUp}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                whileHover={{ y: -8 }}
                className={`relative group bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 ${hoveredFeature === idx ? 'ring-2 ring-blue-500/30' : ''}`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.color.replace('from-', 'text-').split(' ')[0]}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>

                {/* Arrow */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: hoveredFeature === idx ? 1 : 0,
                  x: hoveredFeature === idx ? 0 : -10
                }}
                className="absolute bottom-6 right-6"
              >
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </motion.div>

              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color.replace('from-', 'from-').replace('to-', '/30 to-')} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
            </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/50 rounded-full mb-4">
              <span className="text-amber-600 font-semibold text-sm">⚡ {t('Quick Access')}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900">
              {t('Continue Your Journey')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                {/* Gradient Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.color}`} />
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{action.title}</h3>
                <p className="text-slate-500 text-sm mb-6">{action.desc}</p>

                <Link 
                  to={action.to}
                  className={`inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r ${action.color} text-white font-semibold rounded-xl text-sm group-hover:gap-3 transition-all`}
                >
                  {action.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-[40px] p-10 md:p-16 text-center overflow-hidden"
        >
          {/* Decorative Elements */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" 
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-8"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80 font-medium">{t('Start your health journey today')}</span>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              {t('Ready to experience')} <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('the future of care?')}
              </span>
            </h2>

            <Link 
              to="/explore-doctors"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl shadow-2xl hover:scale-105 hover:shadow-white/20 transition-all"
            >
              {t('Get Started Now')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">MedCare</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 MedCare. {t('Your Health, Simplified')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;