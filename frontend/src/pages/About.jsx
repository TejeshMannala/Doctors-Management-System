import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

const About = () => {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const highlights = [
    {
      title: t('Appointments'),
      description: t('Manage bookings and appointment updates in a simple patient-friendly flow.'),
      icon: '📅',
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'from-blue-50 to-cyan-50',
    },
    {
      title: t('Doctors'),
      description: t('Connect patients with verified doctors across trusted specializations.'),
      icon: '👨‍⚕️',
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'from-emerald-50 to-teal-50',
    },
    {
      title: t('Support'),
      description: t('Reach the support team quickly whenever you face a technical issue.'),
      icon: '🛟',
      color: 'from-purple-500 to-indigo-400',
      bgColor: 'from-purple-50 to-indigo-50',
    },
  ];

  const stats = [
    { number: '10K+', label: t('Happy Patients'), icon: '😊' },
    { number: '500+', label: t('Expert Doctors'), icon: '👩‍⚕️' },
    { number: '24/7', label: t('Support'), icon: '⏰' },
    { number: '99%', label: t('Satisfaction'), icon: '⭐' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20"
        style={{ y }}
      />

      {/* Floating Elements */}
      <motion.div
        className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
        style={{
          x: mousePosition.x * 0.5,
          y: mousePosition.y * 0.5,
        }}
      />
      <motion.div
        className="fixed top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
        style={{
          x: mousePosition.x * -0.3,
          y: mousePosition.y * -0.3,
          transition: { delay: 1 },
        }}
      />
      <motion.div
        className="fixed bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-emerald-200/30 to-teal-200/30 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
        style={{
          x: mousePosition.x * 0.2,
          y: mousePosition.y * 0.2,
          transition: { delay: 2 },
        }}
      />

      <div className="relative z-10 min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4">
          <BackButton />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mt-6 space-y-12"
          >
            {/* Hero Section */}
            <motion.section
              variants={itemVariants}
              className="relative overflow-hidden rounded-[40px] border border-white/60 bg-gradient-to-br from-white/90 via-white/80 to-blue-50/50 p-12 shadow-2xl backdrop-blur-xl"
            >
              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-[40px] bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-emerald-400/20 p-[2px]">
                <div className="h-full w-full rounded-[38px] bg-white/95" />
              </div>

              <div className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-4xl shadow-lg"
                  >
                    🏥
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm font-bold uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {t('About MedCare')}
                  </motion.p>

                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-4 text-5xl font-black tracking-tight text-slate-900 md:text-6xl"
                  >
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                      Revolutionizing
                    </span>
                    <br />
                    <span className="text-slate-800">Healthcare Access</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600"
                  >
                    {t('Experience the future of healthcare management with our intuitive platform designed for patients, doctors, and administrators.')}
                  </motion.p>
                </motion.div>
              </div>
            </motion.section>

            {/* Stats Section */}
            <motion.section
              variants={itemVariants}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)",
                  }}
                  className="group relative overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br from-white/90 to-slate-50/90 p-6 shadow-lg backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5,
                        ease: "easeInOut",
                      }}
                      className="text-3xl mb-3"
                    >
                      {stat.icon}
                    </motion.div>

                    <motion.h3
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                      className="text-3xl font-black text-slate-900 mb-1"
                    >
                      {stat.number}
                    </motion.h3>

                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.section>

            {/* Features Section */}
            <motion.section
              variants={itemVariants}
              className="grid gap-8 lg:grid-cols-2"
            >
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 p-8 text-white shadow-2xl"
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative">
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100"
                  >
                    {t('Our Mission')}
                  </motion.p>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 text-3xl font-black leading-tight"
                  >
                    Healthcare access made
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                      easier for everyone
                    </span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 text-lg leading-8 text-blue-50"
                  >
                    {t('MedCare bridges the gap between patients and healthcare providers, creating a seamless experience that prioritizes your health and convenience.')}
                  </motion.p>
                </div>

                {/* Animated shapes */}
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl"
                />
                <motion.div
                  animate={{
                    rotate: -360,
                    scale: [1.2, 1, 1.2],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-yellow-300/20 blur-xl"
                />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <motion.div
                  variants={itemVariants}
                  className="rounded-[32px] border border-white/80 bg-gradient-to-br from-white/90 to-slate-50/90 p-8 shadow-xl backdrop-blur-sm"
                >
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500"
                  >
                    {t('One Unified Platform')}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-xl font-bold text-slate-900 leading-relaxed"
                  >
                    {t('Explore doctors, book appointments, view prescriptions, and reach support from one seamless experience.')}
                  </motion.p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="grid gap-4 md:grid-cols-2"
                >
                  {highlights.map((item, index) => (
                    <motion.div
                      key={item.title}
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.03,
                        y: -5,
                      }}
                      className={`relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br ${item.bgColor} p-6 shadow-lg backdrop-blur-sm`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 hover:opacity-5 transition-opacity duration-300`} />

                      <motion.div
                        animate={{
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: index * 0.8,
                          ease: "easeInOut",
                        }}
                        className="text-3xl mb-4"
                      >
                        {item.icon}
                      </motion.div>

                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {item.title}
                      </h3>

                      <p className="text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.section>

            {/* Contact Section */}
            <motion.section
              variants={itemVariants}
              className="relative overflow-hidden rounded-[36px] border border-white/60 bg-gradient-to-r from-white/95 via-blue-50/50 to-purple-50/50 p-8 shadow-xl backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5" />

              <div className="relative text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-2xl shadow-lg"
                >
                  💬
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-black text-slate-900 mb-4"
                >
                  {t('Need Help?')}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mx-auto max-w-2xl text-lg leading-8 text-slate-600 mb-8"
                >
                  {t('Our support team is here to help you with any technical issues or questions you may have.')}
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span>📞</span>
                  {t('Contact Support')}
                </motion.button>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
