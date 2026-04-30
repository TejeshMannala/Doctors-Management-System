import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { API_URL } from '../config/api';
import { formatDateTime } from '../utils/locale';

const Help = () => {
  const { user, token } = useContext(AuthContext);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeReply, setActiveReply] = useState(null);
  const [showFeedbackHistory, setShowFeedbackHistory] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchFeedbackHistory = async () => {
    if (!token) return;

    setFetching(true);
    try {
      const response = await axios.get(`${API_URL}/support/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const records = response.data.feedbacks || [];
      setFeedbacks(records);

      const latestUnreadReply = records.find(
        (feedback) => feedback.adminReply?.trim() && feedback.userReplySeen === false
      );

      if (latestUnreadReply) {
        setActiveReply(latestUnreadReply);
      }
    } catch (error) {
      console.error('Failed to load feedback history:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFeedbackHistory();
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;

    const intervalId = window.setInterval(() => {
      fetchFeedbackHistory();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [token]);

  const handleReplyModalClose = async () => {
    if (!activeReply || !token) {
      setActiveReply(null);
      return;
    }

    try {
      await axios.put(
        `${API_URL}/support/feedback/${activeReply._id}/seen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback._id === activeReply._id
            ? {
                ...feedback,
                userReplySeen: true,
                userReplySeenAt: new Date().toISOString(),
              }
            : feedback
        )
      );
    } catch (error) {
      console.error('Failed to mark admin reply as seen:', error);
    } finally {
      setActiveReply(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setStatus(t('Please login to send feedback.'));
      return;
    }

    if (!subject || !message) {
      setStatus(t('Please fill in both fields.'));
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/support/feedback`,
        { subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus(t('Feedback sent successfully. Support will contact you soon.'));
      setSubject('');
      setMessage('');
      fetchFeedbackHistory();
    } catch (error) {
      setStatus(error.response?.data?.message || t('Unable to send feedback.'));
    } finally {
      setLoading(false);
    }
  };

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
    hidden: { opacity: 0, y: 25, scale: 0.95 },
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
      y: [-8, 8, -8],
      rotate: [-1, 1, -1],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const supportFeatures = [
    
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-blue-50/30 to-purple-50/20"
        style={{ y }}
      />

      {/* Floating Elements */}
      <motion.div
        className="fixed top-16 left-12 w-28 h-28 bg-gradient-to-r from-emerald-200/40 to-blue-200/40 rounded-full blur-2xl"
        variants={floatingVariants}
        animate="animate"
        style={{
          x: mousePosition.x * 0.6,
          y: mousePosition.y * 0.6,
        }}
      />
      <motion.div
        className="fixed top-32 right-16 w-20 h-20 bg-gradient-to-r from-purple-200/40 to-pink-200/40 rounded-full blur-2xl"
        variants={floatingVariants}
        animate="animate"
        style={{
          x: mousePosition.x * -0.4,
          y: mousePosition.y * -0.4,
          transition: { delay: 1.5 },
        }}
      />
      <motion.div
        className="fixed bottom-24 left-1/3 w-16 h-16 bg-gradient-to-r from-yellow-200/40 to-orange-200/40 rounded-full blur-2xl"
        variants={floatingVariants}
        animate="animate"
        style={{
          x: mousePosition.x * 0.3,
          y: mousePosition.y * 0.3,
          transition: { delay: 3 },
        }}
      />

      <div className="relative z-10 min-h-screen py-8">
        {/* Animated Modal for Admin Reply */}
        <AnimatePresence>
          {activeReply && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white/95 p-8 shadow-2xl backdrop-blur-xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xl"
                >
                  💬
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-500"
                >
                  {t('Admin Reply')}
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 text-center text-xl font-black text-slate-900"
                >
                  {activeReply.subject}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 text-center text-sm leading-7 text-slate-600"
                >
                  {t('Support has replied to your message.')}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 rounded-[24px] border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-teal-50 p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                    {t('Message from admin')}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {activeReply.adminReply}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 flex justify-end"
                >
                  <motion.button
                    type="button"
                    className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReplyModalClose}
                  >
                    {t('Close')}
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
              className="relative overflow-hidden rounded-[40px] border border-white/60 bg-gradient-to-br from-white/95 via-white/90 to-emerald-50/50 p-12 shadow-2xl backdrop-blur-xl"
            >
              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-[40px] bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 p-[2px]">
                <div className="h-full w-full rounded-[38px] bg-white/96" />
              </div>

              <div className="relative text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 text-4xl shadow-lg"
                >
                  🆘
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm font-bold uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600"
                >
                  {t('Help & Support')}
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 text-5xl font-black tracking-tight text-slate-900 md:text-6xl"
                >
                  <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Need Assistance?
                  </span>
                  <br />
                  <span className="text-slate-800">We're Here to Help</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600"
                >
                  {t('Get instant support for any technical issues or questions you may have. Our team is ready to assist you 24/7.')}
                </motion.p>
              </div>
            </motion.section>

            {/* Features Grid */}
            <motion.section
              variants={itemVariants}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {supportFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                  }}
                  className={`group relative overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br ${feature.bgColor} p-6 shadow-lg backdrop-blur-sm`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="relative">
                    <motion.div
                      animate={{
                        rotate: [0, 8, -8, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.7,
                        ease: "easeInOut",
                      }}
                      className="text-3xl mb-4"
                    >
                      {feature.icon}
                    </motion.div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>

                    <p className="text-sm leading-6 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.section>

            {/* Main Content */}
            <motion.section
              variants={itemVariants}
              className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
            >
              {/* Feedback History */}
              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <motion.div
                  variants={itemVariants}
                  className="relative overflow-hidden rounded-[36px] border border-white/80 bg-gradient-to-br from-white/95 to-slate-50/90 p-8 shadow-xl backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-emerald-500/5 to-purple-500/5" />

                  <div className="relative">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-between mb-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          📋
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-900">{t('Feedback History')}</h2>
                          <p className="text-sm text-slate-600">{t('Review your previous support requests here.')}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFeedbackHistory(!showFeedbackHistory)}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <span>{showFeedbackHistory ? '👁️' : '👁️‍🗨️'}</span>
                        {showFeedbackHistory ? t('Hide History') : t('Show History')}
                      </motion.button>
                    </motion.div>

                    <AnimatePresence>
                      {showFeedbackHistory && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          {fetching ? (
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="rounded-2xl bg-slate-50 p-6 text-center"
                            >
                              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                              <p className="text-slate-600">{t('Loading your feedback history...')}</p>
                            </motion.div>
                          ) : feedbacks.length === 0 ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-r from-slate-50 to-blue-50/50 p-6 text-center"
                            >
                              <div className="text-4xl mb-3">📝</div>
                              <p className="text-slate-600">
                                {t('No feedback yet. Send a message and support will reach out.')}
                              </p>
                            </motion.div>
                          ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              {feedbacks.map((feedback, index) => (
                                <motion.div
                                  key={feedback._id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.02 }}
                                  className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm"
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-slate-900">{feedback.subject}</h3>
                                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                                        {formatDateTime(feedback.createdAt, i18n.resolvedLanguage)}
                                      </p>
                                      <p className="mt-3 text-sm leading-7 text-slate-600">{feedback.message}</p>
                                    </div>
                                    <motion.span
                                      whileHover={{ scale: 1.1 }}
                                      className="inline-flex rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-sm"
                                    >
                                      {t(feedback.status)}
                                    </motion.span>
                                  </div>

                                  <AnimatePresence>
                                    {feedback.adminReply?.trim() && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-4 overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-teal-50 p-4"
                                      >
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                                          {t('Admin Reply')}
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                          {feedback.adminReply}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>

              {/* Support Form */}
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-[36px] border border-white/80 bg-gradient-to-br from-white/95 to-blue-50/50 p-8 shadow-xl backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5" />

                <div className="relative">
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 mb-6"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
                      ✉️
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">{t('Send Feedback')}</h2>
                      <p className="text-sm text-slate-600">
                        {user
                          ? t('Share your issue and our support team will follow up.')
                          : t('Please login to send feedback and get support.')}
                      </p>
                    </div>
                  </motion.div>

                  {user ? (
                    <motion.form
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        className="space-y-2"
                      >
                        <label htmlFor="subject" className="block text-sm font-bold text-slate-700">
                          {t('Subject')}
                        </label>
                        <input
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder={t('Describe your issue')}
                          className="w-full rounded-[16px] border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </motion.div>

                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        className="space-y-2"
                      >
                        <label htmlFor="message" className="block text-sm font-bold text-slate-700">
                          {t('Message')}
                        </label>
                        <textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows="6"
                          placeholder={t('Your feedback helps us fix the problem')}
                          className="w-full rounded-[16px] border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                        />
                      </motion.div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full rounded-[20px] bg-gradient-to-r from-blue-500 to-purple-600 py-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            {t('Submitting...')}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span>📤</span>
                            {t('Send Feedback')}
                          </div>
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {status && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className={`rounded-2xl border px-4 py-3 text-sm ${
                              status.includes('successfully')
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-red-200 bg-red-50 text-red-800'
                            }`}
                          >
                            {status}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-[24px] border border-dashed border-slate-300 bg-gradient-to-r from-slate-50 to-blue-50/50 p-8 text-center"
                    >
                      <div className="text-4xl mb-4">🔐</div>
                      <p className="text-slate-600 font-medium">
                        {t('Please login to send feedback and get support.')}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 text-sm font-bold text-white shadow-lg"
                      >
                        {t('Login')}
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Help;
