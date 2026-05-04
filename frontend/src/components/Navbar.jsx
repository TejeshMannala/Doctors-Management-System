import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  const navLinks = [{ to: '/', label: t('Home') }];

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const isActive = (to) => location.pathname === to;

  const navLinkClass = (to) =>
    `rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
      isActive(to)
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
        : 'text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm'
    }`;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-[100] border-b border-white/50 bg-slate-50/80 backdrop-blur-2xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform duration-200 group">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-inner bg-white border border-slate-100">
            <img src="/images/logo.png" alt="MedCare Logo" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">
            Med<span className="text-primary-600">Care</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 lg:flex bg-slate-200/40 p-1.5 rounded-full backdrop-blur-sm">
          {navLinks.map((item) => (
            <Link key={item.to} to={item.to} className={navLinkClass(item.to)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm hover:shadow-md transition-shadow">
            <LanguageSelector />
          </div>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 leading-none mb-1">{user.fullName}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-600">{user.role}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="bg-slate-900 text-white text-xs font-black px-5 py-2.5 rounded-xl hover:bg-primary-600 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
              >
                {t('Logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-primary-600 text-white text-sm font-black px-8 py-3 rounded-2xl hover:bg-primary-700 transition-all active:scale-95 shadow-xl shadow-primary-500/30">
              {t('Sign In')}
            </Link>
          )}
        </div>

        {/* Professional Animated Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="relative z-[110] flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition-all active:scale-90 lg:hidden"
        >
          <div className="relative flex h-5 w-5 flex-col items-center justify-center gap-1.5">
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block h-0.5 w-5 rounded-full bg-slate-900"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              className="block h-0.5 w-5 rounded-full bg-slate-900"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block h-0.5 w-5 rounded-full bg-slate-900"
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-md lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[105] w-[85%] max-w-sm border-l border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-2xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="mb-12 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                    M
                  </div>
                  <span className="text-xl font-black text-slate-900 tracking-tight">MedCare</span>
                </div>

                <nav className="flex flex-col gap-3">
                  {navLinks.map((item, idx) => (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={item.to}
                        onClick={closeMobile}
                        className={`block rounded-2xl px-6 py-4 text-base font-black transition-all ${
                          isActive(item.to)
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="mt-auto space-y-6">
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('Language Settings')}</p>
                    <LanguageSelector />
                  </div>

                  {user ? (
                    <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-2xl shadow-slate-900/20">
                      <div className="mb-6">
                        <p className="text-lg font-black leading-none mb-1">{user.fullName}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">{user.role}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-2xl bg-white py-4 text-sm font-black text-slate-900 transition-all active:scale-95 hover:bg-primary-50"
                      >
                        {t('Logout')}
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="block w-full rounded-3xl bg-primary-600 py-5 text-center text-lg font-black text-white shadow-2xl shadow-primary-500/30 transition-all active:scale-95"
                    >
                      {t('Sign In')}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
