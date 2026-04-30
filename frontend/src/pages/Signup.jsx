import React, { useContext, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { getDefaultRouteForRole } from '../utils/roleRedirect';

const Signup = () => {
  const { user, register } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = t('Full name is required');
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = t('Name must be at least 3 characters');
    }
    if (!formData.email.trim()) {
      errors.email = t('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('Please enter a valid email address');
    }
    if (!formData.password) {
      errors.password = t('Password is required');
    } else if (formData.password.length < 6) {
      errors.password = t('Password must be at least 6 characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = t('Password must contain uppercase, lowercase, and number');
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = t('Please confirm your password');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('Passwords do not match');
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    const result = await register(
      formData.fullName,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.role
    );
    if (result.success) {
      setSuccess(t('Account created successfully! Redirecting...'));
      setTimeout(() => {
        navigate(getDefaultRouteForRole(result.user?.role));
      }, 900);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 30, repeat: Infinity }} className="absolute -top-40 -left-40 w-[600px] h-[600px] border-2 border-dashed border-primary-400 rounded-full blur-[2px]" />
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }} transition={{ duration: 35, repeat: Infinity }} className="absolute -bottom-40 -right-40 w-[600px] h-[600px] border-2 border-dashed border-indigo-400 rounded-full blur-[2px]" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-2xl bg-white/90 backdrop-blur-2xl border border-white rounded-[40px] p-10 md:p-14 shadow-2xl relative z-10">
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">{t('Create Account')}</h1>
          <p className="text-slate-500 font-medium">{t('Join our community and book appointments instantly')}</p>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
            ⚠️ {error}
          </motion.div>
        )}

        {success && (
          <motion.div variants={itemVariants} className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold rounded-2xl">
            ✅ {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <motion.div variants={itemVariants} className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('Full Name')}</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className={`w-full bg-slate-50 border px-6 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 font-bold outline-none transition-all ${validationErrors.fullName ? 'border-red-500' : 'border-slate-100 focus:border-primary-500'}`} required />
            {validationErrors.fullName && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{validationErrors.fullName}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('Email Address')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className={`w-full bg-slate-50 border px-6 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 font-bold outline-none transition-all ${validationErrors.email ? 'border-red-500' : 'border-slate-100 focus:border-primary-500'}`} required />
            {validationErrors.email && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{validationErrors.email}</p>}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('Password')}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={`w-full bg-slate-50 border px-6 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 font-bold outline-none transition-all ${validationErrors.password ? 'border-red-500' : 'border-slate-100 focus:border-primary-500'}`} required />
            {validationErrors.password && <p className="text-red-500 text-[10px] mt-2 font-bold leading-tight">{validationErrors.password}</p>}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('Confirm Password')}</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={`w-full bg-slate-50 border px-6 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 font-bold outline-none transition-all ${validationErrors.confirmPassword ? 'border-red-500' : 'border-slate-100 focus:border-primary-500'}`} required />
            {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{validationErrors.confirmPassword}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('I am a')}</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 font-bold outline-none transition-all">
              <option value="patient">{t('Patient')}</option>
              <option value="doctor">{t('Doctor')}</option>
            </select>
          </motion.div>

          <motion.button variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className="md:col-span-2 bg-primary-600 py-6 rounded-2xl text-white text-xl font-black shadow-xl shadow-primary-500/30 transition-all hover:bg-primary-700 disabled:opacity-50">
            {loading ? t('Creating Account...') : t('Get Started')}
          </motion.button>
        </form>

        <motion.div variants={itemVariants} className="mt-10 text-center">
          <p className="text-slate-500 font-medium">
            {t('Already have an account?')}{' '}
            <Link to="/login" className="text-primary-600 font-black hover:underline cursor-pointer ml-1">{t('Sign In')}</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
