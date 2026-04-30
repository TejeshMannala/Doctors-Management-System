import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';
import { supportedLanguages } from '../../utils/locale';

const MultiLanguage = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl text-4xl mb-6 shadow-sm">🌐</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('Multi-language Support')}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t('Experience healthcare in your preferred language.')}</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[40px] p-10 md:p-16 shadow-2xl text-center">
          <h3 className="text-2xl font-bold mb-8 text-slate-800">{t('Select Your Preferred Language')}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {supportedLanguages.map(lang => (
              <motion.button
                key={lang.code}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLanguageChange(lang.code)}
                className={`py-4 px-6 rounded-2xl font-bold text-lg border-2 transition-all ${i18n.resolvedLanguage === lang.code ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-transparent bg-white text-slate-600 hover:border-indigo-200'}`}
              >
                {lang.label}
              </motion.button>
            ))}
          </div>

          <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-3xl text-left">
            <h4 className="font-bold text-indigo-800 mb-4 uppercase tracking-wider text-sm">{t('Live Translation Preview')}</h4>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
                <span className="text-xs text-slate-400 block mb-1">Greeting</span>
                <span className="text-lg font-medium text-slate-800">{t('Welcome to MedCare')}</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
                <span className="text-xs text-slate-400 block mb-1">Action</span>
                <span className="text-lg font-medium text-slate-800">{t('Book Appointment')}</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
                <span className="text-xs text-slate-400 block mb-1">Status</span>
                <span className="text-lg font-medium text-slate-800">{t('Available')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiLanguage;
