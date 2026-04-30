import React, { useContext, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { getDefaultRouteForRole } from '../utils/roleRedirect';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { login, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isAdminMode = location.pathname === '/admin/login';

  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = t('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('Please enter a valid email address');
    }
    if (!formData.password) {
      errors.password = t('Password is required');
    } else if (formData.password.length < 6) {
      errors.password = t('Password must be at least 6 characters');
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
    const result = await login(formData.email, formData.password);
    if (result.success) {
      if (isAdminMode && result.user?.role !== 'admin') {
        logout();
        setError(t('Only admin users can login on the admin page.'));
        setLoading(false);
        return;
      }
      if (!isAdminMode && result.user?.role === 'admin') {
        logout();
        setError(t('Admin users must login from the admin login page.'));
        setLoading(false);
        return;
      }
      setSuccess(t('Login successful! Redirecting...'));
      setTimeout(() => {
        navigate(getDefaultRouteForRole(result.user?.role));
      }, 900);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-primary-400 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-400 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white rounded-[40px] p-10 md:p-14 shadow-2xl relative z-10"
      >
        <motion.div variants={itemVariants} className="mb-10 text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
            {isAdminMode ? t('Admin Access') : t('Welcome Back')}
          </h1>
          <p className="text-slate-500 font-medium">
            {isAdminMode ? t('Secure administrative dashboard') : t('Please enter your details to sign in')}
          </p>
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            variants={itemVariants}
            className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold rounded-2xl"
          >
            ✅ {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div variants={itemVariants}>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1" htmlFor="email">
              {t('Email Address')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('Enter your email address')}
              className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl text-slate-900 font-medium outline-none transition-all focus:bg-white focus:ring-4 focus:ring-primary-500/10 ${validationErrors.email ? 'border-red-500' : 'border-slate-100 focus:border-primary-500'}`}
              required
            />
            {validationErrors.email && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{validationErrors.email}</p>}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1" htmlFor="password">
              {t('Password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('Enter your password')}
              className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl text-slate-900 font-medium outline-none transition-all focus:bg-white focus:ring-4 focus:ring-primary-500/10 ${validationErrors.password ? 'border-red-500' : 'border-slate-100 focus:border-primary-500'}`}
              required
            />
            {validationErrors.password && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{validationErrors.password}</p>}
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 py-6 rounded-2xl text-white text-xl font-black shadow-xl shadow-primary-500/30 transition-all hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('Logging in...') : isAdminMode ? t('Login as Admin') : t('Sign In')}
          </motion.button>
        </form>

        <motion.div variants={itemVariants} className="mt-12 text-center">
          {isAdminMode ? (
            <Link to="/login" className="text-primary-600 font-bold hover:underline">
              {t('Go back to user login')}
            </Link>
          ) : (
            <p className="text-slate-500 font-medium">
              {t("Don't have an account?")}{' '}
              <Link to="/signup" className="text-primary-600 font-black hover:underline ml-1">
                {t('Create account')}
              </Link>
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
