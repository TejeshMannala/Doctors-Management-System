import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';

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

  const severityOptions = ['Mild', 'Moderate', 'Severe'];

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

  // Tailwind Inline Styles
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
  const inputClass = "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500";
  const errorInputClass = "border-red-500 focus:ring-red-500";
  const errorTextClass = "text-red-500 text-sm mt-1";

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="mx-auto max-w-4xl px-4">
        <BackButton />

        <div className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-sm border border-slate-100">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-7">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{t('Patient Details')}</h2>
            <p className="mt-2 text-primary-100 opacity-90">
              {t('Enter the patient problem first. After saving, you can proceed to booking confirmation.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <AnimatePresence>
              {savedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
                >
                  {savedMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-10">
              <h3 className="mb-6 text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-2">{t('Personal Information')}</h3>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('Full Name')} *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.fullName ? errorInputClass : ''}`}
                    placeholder={t('Enter patient full name')}
                  />
                  {errors.fullName && <p className={errorTextClass}>{errors.fullName}</p>}
                </div>

                <div>
                  <label className={labelClass}>{t('Age')} *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.age ? errorInputClass : ''}`}
                    placeholder={t('Age')}
                    min="1"
                    max="120"
                  />
                  {errors.age && <p className={errorTextClass}>{errors.age}</p>}
                </div>

                <div>
                  <label className={labelClass}>{t('Gender')} *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.gender ? errorInputClass : ''}`}
                  >
                    <option value="">{t('Select Gender')}</option>
                    <option value="Male">{t('Male')}</option>
                    <option value="Female">{t('Female')}</option>
                    <option value="Other">{t('Other')}</option>
                  </select>
                  {errors.gender && <p className={errorTextClass}>{errors.gender}</p>}
                </div>

                <div>
                  <label className={labelClass}>{t('Mobile Number')} *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.mobileNumber ? errorInputClass : ''}`}
                    placeholder={t('10-digit mobile number')}
                    maxLength="10"
                  />
                  {errors.mobileNumber && <p className={errorTextClass}>{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className={labelClass}>{t('Email')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder={t('patient@example.com')}
                  />
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="mb-6 text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-2">{t('Problem Details')}</h3>
              <div className="space-y-8">
                <div>
                  <label className={labelClass}>{t('Problem Description')} *</label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleInputChange}
                    className={`${inputClass} h-32 resize-none ${errors.problemDescription ? errorInputClass : ''}`}
                    placeholder={t('Describe the symptoms and health problem')}
                  />
                  {errors.problemDescription && <p className={errorTextClass}>{errors.problemDescription}</p>}
                </div>

                <div>
                  <label className={labelClass}>{t('Symptoms List')} (Searchable)</label>
                  <div className="mb-4">
                    <input
                      type="text"
                      className={inputClass}
                      placeholder={t('Search symptoms...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="grid h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-5 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSymptoms.map((symptom) => (
                      <label
                        key={symptom}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          formData.symptoms.includes(symptom)
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                            : 'border-slate-100 bg-white text-slate-600 hover:border-primary-300 hover:shadow-sm'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.symptoms.includes(symptom)}
                          onChange={() => handleSymptomChange(symptom)}
                          className="h-5 w-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500 transition-colors"
                        />
                        {t(symptom)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t('Duration')}</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder={t('Example: 3 days')}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t('Severity')} *</label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className={`${inputClass} ${errors.severity ? errorInputClass : ''}`}
                    >
                      <option value="">{t('Select Severity')}</option>
                      {severityOptions.map((level) => (
                        <option key={level} value={level}>
                          {t(level)}
                        </option>
                      ))}
                    </select>
                    {errors.severity && <p className={errorTextClass}>{errors.severity}</p>}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100/50 transition-colors">
                    <input
                      type="checkbox"
                      name="hasMedicalHistory"
                      checked={formData.hasMedicalHistory}
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    {t('Previous medical history available')}
                  </label>
                </div>

                {formData.hasMedicalHistory && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <label className={labelClass}>{t('Medical History Details')}</label>
                    <textarea
                      name="medicalHistoryDetails"
                      value={formData.medicalHistoryDetails}
                      onChange={handleInputChange}
                      className={`${inputClass} h-24 resize-none`}
                      placeholder={t('Enter previous medical history details')}
                    />
                  </motion.div>
                )}

                <div>
                  <label className={labelClass}>{t('Current Medications')}</label>
                  <textarea
                    name="currentMedications"
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    className={`${inputClass} h-24 resize-none`}
                    placeholder={t('Enter current medications')}
                  />
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-700">
                ⚠️ {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-primary-600 py-5 text-lg font-black text-white shadow-xl shadow-primary-500/20 transition-all duration-300 hover:bg-primary-700 hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? t('Saving patient details...') : t('Save And Continue')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
