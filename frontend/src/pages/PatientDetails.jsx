import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';
import { 
  User, Calendar, Phone, Mail, FileText, AlertCircle, 
  Thermometer, Clock, AlertTriangle, Pill, CheckCircle,
  ChevronDown, Search, X
} from 'lucide-react';

const PatientDetails = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    email: '',
    problemDescription: '',
    symptoms: [],
    duration: '',
    severity: '',
    hasMedicalHistory: false,
    medicalHistoryDetails: '',
    currentMedications: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSymptoms, setShowSymptoms] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const symptomOptions = [
    'Fever', 'Cold', 'Cough', 'Headache', 'Stomach pain', 'Skin issues', 'Body pain', 'Joint pain',
    'Chest pain', 'Breathing difficulty', 'Fatigue', 'Nausea', 'Dizziness', 'Sore throat',
    'Runny nose', 'Muscle aches', 'Back pain', 'Diarrhea', 'Constipation', 'Vomiting',
    'Loss of appetite', 'Weight loss', 'Weight gain', 'Insomnia', 'Excessive sleepiness',
    'Night sweats', 'Chills', 'Swelling', 'Rash', 'Itching', 'Redness', 'Blurred vision',
    'Ear pain', 'Hearing loss', 'Tinnitus', 'Nosebleed', 'Dry mouth', 'Bad breath',
    'Toothache', 'Gum swelling', 'Difficulty swallowing', 'Heartburn', 'Bloating', 'Gas',
    'Indigestion', 'Frequent urination', 'Painful urination', 'Blood in urine', 'Pelvic pain',
    'Irregular periods', 'Menstrual cramps', 'Breast pain', 'Lumps', 'Hair loss', 'Nail changes',
    'Brittle nails', 'Dry skin', 'Oily skin', 'Acne', 'Eczema', 'Psoriasis', 'Sneezing',
    'Wheeziness', 'Shortness of breath', 'Palpitations', 'High blood pressure', 'Low blood pressure',
    'Fainting', 'Tremors', 'Numbness', 'Tingling', 'Weakness', 'Paralysis', 'Confusion',
    'Memory loss', 'Mood swings', 'Anxiety', 'Depression', 'Irritability', 'Panic attacks',
    'Hallucinations', 'Seizures', 'Slurred speech', 'Difficulty walking', 'Loss of balance',
    'Neck pain', 'Shoulder pain', 'Elbow pain', 'Wrist pain', 'Finger pain', 'Hip pain',
    'Knee pain', 'Ankle pain', 'Foot pain', 'Heel pain', 'Toe pain', 'Cold hands', 'Cold feet',
    'Hot flashes', 'Eye irritation', 'Others'
  ];

  const filteredSymptoms = symptomOptions.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const severityOptions = [
    { value: 'Mild', color: 'emerald', icon: '😊' },
    { value: 'Moderate', color: 'amber', icon: '😐' },
    { value: 'Severe', color: 'rose', icon: '😰' }
  ];

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSymptomChange = (symptom) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((entry) => entry !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) nextErrors.fullName = t('Full name is required');
    if (!formData.age || formData.age < 1 || formData.age > 120) nextErrors.age = t('Valid age is required');
    if (!formData.gender) nextErrors.gender = t('Gender is required');
    if (!formData.mobileNumber || !/^\d{10}$/.test(formData.mobileNumber)) {
      nextErrors.mobileNumber = t('Valid 10-digit mobile number is required');
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = t('Please enter a valid email address');
    }
    if (!formData.problemDescription.trim()) nextErrors.problemDescription = t('Problem description is required');
    if (!formData.severity) nextErrors.severity = t('Severity level is required');

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(apiUrl('/appointments/patient-details'), formData, {
        headers: authHeaders(token),
      });

      if (response.data.success) {
        localStorage.setItem('patientData', JSON.stringify(response.data.patientData));

        const preferredDoctorId = localStorage.getItem('preferredDoctorId');
        setSavedMessage(
          preferredDoctorId
            ? t('Patient details saved successfully. Redirecting to booking confirmation...')
            : t('Patient details saved successfully. Redirecting to doctors page...')
        );

        window.setTimeout(() => {
          navigate(preferredDoctorId ? `/book-appointment/${preferredDoctorId}` : '/recommend-doctors');
        }, 1400);
      }
    } catch (error) {
      console.error('Error collecting patient details:', error.response?.data || error.message || error);
      setErrors({ submit: error.response?.data?.message || t('Failed to save patient details. Please try again.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 font-sans">
      <div className="mx-auto max-w-4xl px-4">
        <BackButton />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-xl border border-slate-100"
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-10">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t('Patient Details')}</h2>
              </div>
              <p className="text-blue-100 text-lg font-medium">
                {t('Enter your health information to help us serve you better')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <AnimatePresence>
              {savedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 flex items-center gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <span className="text-emerald-800 font-semibold">{savedMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-10"
            >
              {/* Personal Information Section */}
              <motion.div variants={itemVariants} className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{t('Personal Information')}</h3>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('Full Name')} *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.fullName ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
                        placeholder={t('Enter patient full name')}
                      />
                    </div>
                    {errors.fullName && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-500 text-sm mt-2 font-medium flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />{errors.fullName}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('Age')} *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.age ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
                        placeholder={t('Age')}
                        min="1"
                        max="120"
                      />
                    </div>
                    {errors.age && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-500 text-sm mt-2 font-medium flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />{errors.age}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('Gender')} *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer ${errors.gender ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
                      >
                        <option value="">{t('Select Gender')}</option>
                        <option value="Male">{t('Male')}</option>
                        <option value="Female">{t('Female')}</option>
                        <option value="Other">{t('Other')}</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.gender && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-500 text-sm mt-2 font-medium flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />{errors.gender}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('Mobile Number')} *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.mobileNumber ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
                        placeholder={t('10-digit mobile number')}
                        maxLength="10"
                      />
                    </div>
                    {errors.mobileNumber && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-500 text-sm mt-2 font-medium flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />{errors.mobileNumber}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('Email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        placeholder={t('patient@example.com')}
                      />
                    </div>
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-500 text-sm mt-2 font-medium flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />{errors.email}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Problem Details Section */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{t('Problem Details')}</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('Problem Description')} *</label>
                    <textarea
                      name="problemDescription"
                      value={formData.problemDescription}
                      onChange={handleInputChange}
                      className={`w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none h-32 ${errors.problemDescription ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
                      placeholder={t('Describe the symptoms and health problem in detail...')}
                    />
                    {errors.problemDescription && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-500 text-sm mt-2 font-medium flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />{errors.problemDescription}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <motion.button
                      type="button"
                      onClick={() => setShowSymptoms(!showSymptoms)}
                      className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Thermometer className="w-5 h-5 text-slate-600" />
                        <span className="font-bold text-slate-700">{t('Select Symptoms')}</span>
                        {formData.symptoms.length > 0 && (
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                            {formData.symptoms.length} selected
                          </span>
                        )}
                      </div>
                      <motion.div
                        animate={{ rotate: showSymptoms ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {showSymptoms && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4">
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <input
                                type="text"
                                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                placeholder={t('Search symptoms...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2">
                              {filteredSymptoms.map((symptom, index) => (
                                <motion.label
                                  key={symptom}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.02 }}
                                  className={`flex items-center gap-2 cursor-pointer rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                                    formData.symptoms.includes(symptom)
                                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                      : 'border-slate-100 bg-white text-slate-600 hover:border-blue-300 hover:shadow-sm'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.symptoms.includes(symptom)}
                                    onChange={() => handleSymptomChange(symptom)}
                                    className="hidden"
                                  />
                                  <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${
                                    formData.symptoms.includes(symptom) ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                                  }`}>
                                    {formData.symptoms.includes(symptom) && <CheckCircle className="w-3 h-3 text-white" />}
                                  </div>
                                  {t(symptom)}
                                </motion.label>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('Duration')}</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          placeholder={t('Example: 3 days')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('Severity')} *</label>
                      <div className="grid grid-cols-3 gap-3">
                        {severityOptions.map((level) => (
                          <motion.button
                            key={level.value}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, severity: level.value }));
                              if (errors.severity) setErrors(prev => ({ ...prev, severity: '' }));
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-2xl border-2 font-bold transition-all ${
                              formData.severity === level.value
                                ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-700 shadow-lg`
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-2xl mb-1 block">{level.icon}</span>
                            <span className="text-sm">{t(level.value)}</span>
                          </motion.button>
                        ))}
                      </div>
                      {errors.severity && (
                        <motion.p 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-rose-500 text-sm mt-2 font-medium flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />{errors.severity}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="hasMedicalHistory"
                          checked={formData.hasMedicalHistory}
                          onChange={handleInputChange}
                          className="w-6 h-6 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        {formData.hasMedicalHistory && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <span className="font-bold text-slate-700">{t('I have previous medical history')}</span>
                    </label>
                  </motion.div>

                  <AnimatePresence>
                    {formData.hasMedicalHistory && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('Medical History Details')}</label>
                        <textarea
                          name="medicalHistoryDetails"
                          value={formData.medicalHistoryDetails}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none h-24"
                          placeholder={t('Enter previous medical history details, surgeries, chronic conditions, etc.')}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('Current Medications')}</label>
                    <div className="relative">
                      <Pill className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <textarea
                        name="currentMedications"
                        value={formData.currentMedications}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-slate-900 font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none h-24"
                        placeholder={t('List any medications you are currently taking')}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-2xl border-2 border-rose-200 bg-rose-50 px-6 py-4 flex items-center gap-3"
              >
                <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                <span className="text-rose-800 font-semibold">{errors.submit}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-5 text-lg font-black text-white shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  {t('Saving patient details...')}
                </span>
              ) : (
                t('Save And Continue')
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDetails;