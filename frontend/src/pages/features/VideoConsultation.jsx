import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';

const VideoConsultation = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent),_radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent),_#f8fbff] font-sans text-slate-900 pb-20 relative overflow-hidden">
      <div className="p-4 relative z-10">
        <BackButton />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[40px] p-10 md:p-16 shadow-2xl text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-24 h-24 bg-primary-100 rounded-3xl mx-auto flex items-center justify-center text-5xl mb-8 shadow-inner"
          >
            🎥
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{t('Video Consultation')}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
            {t('Consult with top doctors online through high-quality video calls from anywhere.')}
          </p>

          <div className="bg-primary-50 border border-primary-100 rounded-3xl p-8 max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-primary-800 mb-2">{t('Coming Soon')}</h3>
            <p className="text-primary-600/80">{t('We are currently building this feature to provide you with the best experience. Stay tuned!')}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoConsultation;
