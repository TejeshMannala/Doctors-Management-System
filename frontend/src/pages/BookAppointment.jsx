import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';
import { formatDate } from '../utils/locale';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalReports, setMedicalReports] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingBlockMessage, setBookingBlockMessage] = useState('');
  const [showBookingBlockModal, setShowBookingBlockModal] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const { user, token } = useContext(AuthContext);
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

  const genderOptions = ['Male', 'Female', 'Other'];

  const validateForm = () => {
    const newErrors = {};

    if (!date) newErrors.date = t('Date is required');
    if (!timeSlot) newErrors.timeSlot = t('Time slot is required');
    if (!problemDescription.trim()) newErrors.problemDescription = t('Problem description is mandatory');
    if (!severity) newErrors.severity = t('Severity level is required');
    if (!age) newErrors.age = t('Age is required');
    if (!gender) newErrors.gender = t('Gender is required');
    if (!mobileNumber) newErrors.mobileNumber = t('Mobile number is required');

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = t('Cannot book appointment for past date');
    }

    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      newErrors.mobileNumber = t('Mobile number must be 10 digits');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!token) {
      setBookingBlockMessage('');
      return;
    }

    const fetchActiveAppointment = async () => {
      setCheckingBooking(true);
      try {
        const response = await axios.get(apiUrl('/appointments/patient'), {
          headers: authHeaders(token),
        });

        const activeAppointment = (response.data.appointments || []).find((appointment) =>
          ['pending', 'confirmed'].includes(appointment.status)
        );

        if (activeAppointment) {
          setBookingBlockMessage(
            `${t('You already have an active appointment')} (${activeAppointment.status}) ${t('on')} ${formatDate(activeAppointment.date)}. ${t('Please complete or cancel it before booking another one.')}`
          );
          setShowBookingBlockModal(true);
        } else {
          setBookingBlockMessage('');
          setShowBookingBlockModal(false);
        }
      } catch (error) {
        console.error('Error checking active appointment:', error);
      } finally {
        setCheckingBooking(false);
      }
    };

    fetchActiveAppointment();
  }, [token, t]);

  useEffect(() => {
    if (date) {
      fetchAvailableSlots();
    }
  }, [date]);

  const fetchDoctor = async () => {
    try {
      const response = await axios.get(apiUrl(`/doctors/${doctorId}`), {
        headers: authHeaders(token),
      });
      setDoctor(response.data.doctor || response.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(apiUrl(`/doctors/${doctorId}/slots?date=${date}`), {
        headers: authHeaders(token),
      });
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleSymptomChange = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bookingBlockMessage) {
      setShowBookingBlockModal(true);
      setErrors({ submit: bookingBlockMessage });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const appointmentPayload = {
        doctorId,
        date,
        timeSlot,
        symptoms: {
          description: problemDescription,
          selectedSymptoms,
          duration,
          severity,
          medications,
          allergies
        },
        patientId: user._id,
        patientDetails: {
          age: parseInt(age),
          gender,
          mobileNumber
        }
      };

      const response = await axios.post(apiUrl('/appointments'), appointmentPayload, {
        headers: authHeaders(token),
      });
      setAppointmentData({
        ...response.data,
        date: date
      });
      setBookingSuccess(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({ submit: error.response?.data?.message || t('Error booking appointment') });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!doctor) return <div className="flex items-center justify-center min-h-screen text-slate-500 font-bold">{t('Loading...')}</div>;

  if (bookingSuccess && appointmentData) {
    return (
      <div className="min-h-screen bg-primary-600 px-4 py-16 flex items-center justify-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-xl overflow-hidden rounded-[40px] bg-white text-center shadow-2xl"
        >
          <div className="relative bg-gradient-to-b from-slate-50 to-white px-10 pb-10 pt-12">
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/30">
              <span className="text-[100px] font-black text-white leading-none">✓</span>
            </div>
            <div className="mt-10 text-5xl font-black tracking-tight text-slate-900">
              {t('Success!')}
            </div>
            <p className="mx-auto mt-6 max-w-sm text-lg leading-relaxed text-slate-600">
              {t('Your appointment has been confirmed successfully.')}
            </p>
          </div>

          <div className="px-10 pb-12">
            <div className="rounded-3xl bg-slate-50 p-6 text-left space-y-4 border border-slate-100">
              <p className="flex justify-between">
                <span className="text-slate-500 font-medium">{t('Appointment ID')}</span>
                <span className="font-bold text-slate-900">#{appointmentData._id.slice(-6)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500 font-medium">{t('Doctor')}</span>
                <span className="font-bold text-slate-900">{doctor.userId?.fullName}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500 font-medium">{t('Date & Time')}</span>
                <span className="font-bold text-slate-900">{new Date(appointmentData.date).toLocaleDateString()} @ {appointmentData.timeSlot}</span>
              </p>
            </div>

            <button
              className="mt-12 w-full rounded-2xl bg-primary-600 py-6 text-2xl font-black text-white shadow-xl shadow-primary-500/30 transition-all hover:bg-primary-700 hover:scale-[1.02] active:scale-95"
              onClick={() => navigate('/my-appointments')}
            >
              {t('View My Appointments')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Tailwind Constants
  const labelClass = "mb-2 block text-sm font-bold text-slate-700 uppercase tracking-wide";
  const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10";
  const sectionClass = "mb-10 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm";
  const sectionTitleClass = "text-xl font-black text-slate-900 mb-8 flex items-center gap-3";

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 mb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BackButton />
          <h1 className="text-xl font-black tracking-tight">{t('Book Appointment')}</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Doctor Spotlight */}
        <div className="relative mb-12 overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-600 to-indigo-700 p-8 text-white shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-white/20 shadow-xl bg-white/10 shrink-0">
              <img 
                src={doctor.photo || '/default-doctor.png'} 
                alt={doctor.userId?.fullName}
                className="h-full w-full object-cover"
                onError={(e) => {e.target.src = '/default-doctor.png'}}
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-black leading-none mb-2">{doctor.userId?.fullName}</h2>
              <p className="text-primary-100 font-bold mb-4 opacity-90">🩺 {doctor.specialization}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10">⭐ {doctor.rating || 4.5}</div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10">💼 {doctor.experience} {t('Years')}</div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10">💰 ₹{doctor.consultationFee}</div>
              </div>
            </div>
          </div>
          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Schedule Section */}
          <section className={sectionClass}>
            <h3 className={sectionTitleClass}><span className="text-2xl">📅</span> {t('Schedule Date & Time')}</h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="form-group">
                <label className={labelClass}>{t('Pick a Date')} *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`${inputClass} ${errors.date ? 'border-red-500 bg-red-50' : ''}`}
                  required
                />
                {errors.date && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{errors.date}</p>}
              </div>

              <div className="form-group">
                <label className={labelClass}>{t('Available Slots')} *</label>
                {!date ? (
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 text-sm font-medium italic border border-dashed border-slate-200">
                    {t('Select a date to view slots')}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 text-sm font-bold border border-amber-100">
                    {t('No slots found for this date')}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`py-3 px-4 rounded-xl text-sm font-black transition-all ${
                          timeSlot === slot 
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-95' 
                            : 'bg-white border border-slate-100 text-slate-700 hover:border-primary-300'
                        }`}
                        onClick={() => setTimeSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
                {errors.timeSlot && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{errors.timeSlot}</p>}
              </div>
            </div>
          </section>

          {/* Personal Details Section */}
          <section className={sectionClass}>
            <h3 className={sectionTitleClass}><span className="text-2xl">👤</span> {t('Patient Information')}</h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>{t('Patient Full Name')}</label>
                <input type="text" value={user?.fullName || ''} readOnly className={`${inputClass} bg-slate-50 cursor-not-allowed border-transparent font-bold`} />
              </div>

              <div className="form-group">
                <label className={labelClass}>{t('Age')} *</label>
                <input 
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="30"
                  className={`${inputClass} ${errors.age ? 'border-red-500' : ''}`}
                />
                {errors.age && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{errors.age}</p>}
              </div>

              <div className="form-group">
                <label className={labelClass}>{t('Gender')} *</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`${inputClass} ${errors.gender ? 'border-red-500' : ''}`}
                >
                  <option value="">{t('Select')}</option>
                  {genderOptions.map(g => <option key={g} value={g}>{t(g)}</option>)}
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{errors.gender}</p>}
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>{t('Mobile Number')} *</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">+91</span>
                  <input 
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className={`${inputClass} pl-16 ${errors.mobileNumber ? 'border-red-500' : ''}`}
                    placeholder="9999999999"
                  />
                </div>
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{errors.mobileNumber}</p>}
              </div>
            </div>
          </section>

          {/* Health Details Section */}
          <section className={sectionClass}>
            <h3 className={sectionTitleClass}><span className="text-2xl">🔬</span> {t('Health Overview')}</h3>
            <div className="space-y-8">
              <div className="form-group">
                <label className={labelClass}>{t('Describe Your Symptoms')} *</label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder={t('Example: Persistent headache and slight fever since yesterday...')}
                  className={`${inputClass} h-32 resize-none ${errors.problemDescription ? 'border-red-500' : ''}`}
                  required
                />
                {errors.problemDescription && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{errors.problemDescription}</p>}
              </div>

              <div className="form-group">
                <label className={labelClass}>{t('Tag Common Symptoms')} ({t('Optional')})</label>
                <div className="mb-4">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-3 text-sm focus:border-primary-500 outline-none"
                    placeholder={t('Search symptoms...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid h-64 overflow-y-auto rounded-3xl border border-slate-100 bg-slate-50/30 p-5 gap-3 sm:grid-cols-2 lg:grid-cols-3 custom-scrollbar">
                  {filteredSymptoms.map(symptom => (
                    <label 
                      key={symptom} 
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm font-bold transition-all ${
                        selectedSymptoms.includes(symptom) 
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' 
                          : 'border-white bg-white text-slate-500 hover:border-primary-100'
                      }`}
                    >
                      <span>{t(symptom)}</span>
                      <input
                        type="checkbox"
                        checked={selectedSymptoms.includes(symptom)}
                        onChange={() => handleSymptomChange(symptom)}
                        className="h-5 w-5 rounded-lg border-slate-300 text-primary-600"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="form-group">
                  <label className={labelClass}>{t('Severity')} *</label>
                  <div className="flex gap-4 flex-wrap">
                    {['Mild', 'Moderate', 'Severe'].map(lvl => (
                      <label key={lvl} className={`flex-1 min-w-[100px] cursor-pointer transition-all ${severity === lvl.toLowerCase() ? 'scale-95' : ''}`}>
                        <input
                          type="radio"
                          name="severity"
                          value={lvl.toLowerCase()}
                          checked={severity === lvl.toLowerCase()}
                          onChange={(e) => setSeverity(e.target.value)}
                          className="hidden"
                        />
                        <div className={`p-4 rounded-2xl border-2 text-center font-black text-sm uppercase tracking-wider ${
                          severity === lvl.toLowerCase() 
                            ? 'border-primary-600 bg-primary-50 text-primary-700' 
                            : 'border-slate-50 bg-white text-slate-400 hover:border-slate-200'
                        }`}>
                          {t(lvl)}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.severity && <p className="text-red-500 text-xs mt-2 font-bold uppercase">{errors.severity}</p>}
                </div>

                <div className="form-group">
                  <label className={labelClass}>{t('Duration')}</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass}>
                    <option value="">{t('Select')}</option>
                    <option value="1-day">{t('1 Day')}</option>
                    <option value="2-3-days">{t('2-3 Days')}</option>
                    <option value="1-week">{t('1 Week')}</option>
                    <option value="more-than-1-week">{t('Chronic')}</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Card */}
          <div className="mb-10 overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">{t('Checkout')}</h3>
              <div className="text-slate-500 text-2xl font-black">VISA • MC • UPI</div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-slate-500 font-bold mb-1">{t('Total Consultation Fee')}</p>
                <div className="text-5xl font-black">₹{doctor.consultationFee}</div>
              </div>
              <div className="h-14 w-14 rounded-full bg-primary-600 flex items-center justify-center text-3xl">💳</div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full rounded-[32px] bg-primary-600 py-6 text-xl font-black text-white shadow-2xl shadow-primary-500/30 transition-all hover:bg-primary-700 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || checkingBooking || Boolean(bookingBlockMessage)}
          >
            {checkingBooking ? t('Checking Status...') : isSubmitting ? t('Confirming...') : t('Book Appointment Now')}
          </button>
        </form>
      </div>

      {/* Booking Block Modal */}
      <AnimatePresence>
        {showBookingBlockModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl rounded-[40px] bg-white p-10 text-center shadow-3xl"
            >
              <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-primary-50">
                <div className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center text-5xl text-white shadow-xl">!</div>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">{t('Active Appointment')}</h2>
              <p className="text-xl leading-relaxed text-slate-500 font-medium">
                {bookingBlockMessage}
              </p>
              <button
                type="button"
                className="mt-10 w-full rounded-2xl bg-slate-900 py-5 text-lg font-black text-white transition-all hover:bg-slate-800"
                onClick={() => setShowBookingBlockModal(false)}
              >
                {t('Got it, thanks!')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookAppointment;
