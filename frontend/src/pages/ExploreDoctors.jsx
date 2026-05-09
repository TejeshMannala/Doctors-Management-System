import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import BackButton from '../components/BackButton';
import { apiUrl } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { 
  Search, X, Star, Clock, Award, Mail, Phone, MapPin, Calendar, ChevronRight,
  Stethoscope, Filter, Sparkles, User, AlertTriangle, FileText, Heart, Brain,
  Bone, Eye, Baby, Pill, Activity, Thermometer, HeartPulse, HandMetal, ArrowLeft
} from 'lucide-react';

const getSpecializationStyle = (specialization) => {
  const styles = {
    'Cardiology': { bg: 'from-rose-500 to-red-600', icon: Heart },
    'Neurology': { bg: 'from-purple-500 to-indigo-600', icon: Brain },
    'Orthopedics': { bg: 'from-amber-500 to-orange-600', icon: Bone },
    'Ophthalmology': { bg: 'from-cyan-500 to-blue-600', icon: Eye },
    'Pediatrics': { bg: 'from-pink-500 to-rose-600', icon: Baby },
    'Dermatology': { bg: 'from-yellow-500 to-amber-600', icon: Activity },
    'General Medicine': { bg: 'from-blue-500 to-indigo-600', icon: Stethoscope },
    'Internal Medicine': { bg: 'from-emerald-500 to-teal-600', icon: Activity },
    'Gynecology': { bg: 'from-fuchsia-500 to-pink-600', icon: Heart },
    'ENT': { bg: 'from-violet-500 to-purple-600', icon: Brain },
    'Psychiatry': { bg: 'from-indigo-500 to-blue-600', icon: Brain },
    'Urology': { bg: 'from-teal-500 to-cyan-600', icon: Activity },
    'Gastroenterology': { bg: 'from-orange-500 to-amber-600', icon: Activity },
    'Pulmonology': { bg: 'from-slate-500 to-gray-600', icon: Activity },
    'Oncology': { bg: 'from-red-600 to-rose-700', icon: Heart },
    'Nephrology': { bg: 'from-blue-600 to-indigo-700', icon: Activity },
    'Endocrinology': { bg: 'from-amber-600 to-yellow-700', icon: Thermometer },
    'Rheumatology': { bg: 'from-rose-500 to-pink-600', icon: HandMetal },
    'Anesthesiology': { bg: 'from-sky-500 to-blue-600', icon: Activity },
    'Radiology': { bg: 'from-slate-400 to-gray-500', icon: Activity },
  };
  
  const specKey = Object.keys(styles).find(k => 
    specialization?.toLowerCase().includes(k.toLowerCase())
  );
  
  return styles[specKey] || { bg: 'from-blue-500 to-indigo-600', icon: Stethoscope };
};

const getSpecializationImage = (specialization) => {
  const images = {
    'Cardiology': '/doctors/cardiology.jpg',
    'Neurology': '/doctors/neurology.jpg',
    'Orthopedics': '/doctors/orthopedics.jpg',
    'Ophthalmology': '/doctors/ophthalmology.jpg',
    'Pediatrics': '/doctors/pediatrics.jpg',
    'Dermatology': '/doctors/dermatology.jpg',
    'General Medicine': '/doctors/general.jpg',
    'Internal Medicine': '/doctors/internal.jpg',
    'Gynecology': '/doctors/gynecology.jpg',
    'ENT': '/doctors/ent.jpg',
    'Psychiatry': '/doctors/psychiatry.jpg',
    'Urology': '/doctors/urology.jpg',
    'Gastroenterology': '/doctors/gastro.jpg',
    'Pulmonology': '/doctors/pulmonology.jpg',
    'Oncology': '/doctors/oncology.jpg',
    'Nephrology': '/doctors/nephrology.jpg',
    'Endocrinology': '/doctors/endocrinology.jpg',
    'Rheumatology': '/doctors/rheumatology.jpg',
    'Anesthesiology': '/doctors/anesthesia.jpg',
    'Radiology': '/doctors/radiology.jpg',
  };
  
  const specKey = Object.keys(images).find(k => 
    specialization?.toLowerCase().includes(k.toLowerCase())
  );
  
  return images[specKey] || '/default-doctor.png';
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const ExploreDoctors = () => {
  const { user, token } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showGuardModal, setShowGuardModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedDoctor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedDoctor]);

  useEffect(() => {
    if (location.state?.bookingGuardMessage) {
      setShowGuardModal(true);
    }
  }, [location.state]);

  useEffect(() => {
    let filtered = doctors;

    if (nameFilter.trim()) {
      const query = nameFilter.trim().toLowerCase();
      filtered = filtered.filter((doctor) => {
        const fullName = doctor.userId?.fullName?.toLowerCase() || '';
        return fullName.includes(query);
      });
    }

    if (specializationFilter) {
      filtered = filtered.filter((doctor) => doctor.specialization === specializationFilter);
    }

    if (experienceFilter) {
      const minExp = parseInt(experienceFilter, 10);
      filtered = filtered.filter((doctor) => doctor.experience >= minExp);
    }

    if (feeFilter) {
      const maxFee = parseInt(feeFilter, 10);
      filtered = filtered.filter((doctor) => doctor.consultationFee <= maxFee);
    }

    setFilteredDoctors(filtered);
  }, [doctors, nameFilter, specializationFilter, experienceFilter, feeFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(apiUrl('/doctors'));
      const data = response.data;
      
      if (data.success && data.doctors) {
        console.log('Doctors data sample:', data.doctors.slice(0, 2).map(d => ({
          name: d.userId?.fullName,
          profileImage: d.userId?.profileImage,
          specialization: d.specialization
        })));
        setDoctors(data.doctors);
        setFilteredDoctors(data.doctors);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message);
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (doctorId) => {
    if (!token || !user) {
      navigate('/login', { state: { from: { pathname: `/book-appointment/${doctorId}` } } });
      return;
    }
    localStorage.setItem('preferredDoctorId', doctorId);
    navigate('/patient-details');
  };

  const clearFilters = () => {
    setNameFilter('');
    setSpecializationFilter('');
    setExperienceFilter('');
    setFeeFilter('');
  };

  const specializations = [...new Set(doctors.map((doctor) => doctor.specialization))].filter(Boolean);

  const hasActiveFilters = nameFilter || specializationFilter || experienceFilter || feeFilter;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-5 md:py-7">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" 
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-5">
        <BackButton />

        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>{t('Error loading doctors')}: {error}</span>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-md md:p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-600">🏥 {t('Find Your Doctor')}</span>
          </div>
          <h1 className="mb-2 text-2xl font-black text-slate-900 md:text-3xl">{t('Explore Doctors')}</h1>
          <p className="text-slate-600">{t('Find the best doctor for your needs')}</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 rounded-3xl border border-white/50 bg-white/80 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-md md:p-5"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-slate-700 font-semibold mb-4 lg:hidden"
          >
            <Filter className="w-5 h-5" />
            {t('Filters')} {hasActiveFilters && <span className="text-blue-600">({t('Active')})</span>}
            <ChevronRight className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
          </button>

          <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${showFilters ? '' : 'hidden lg:grid'}`}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder={t('Search by name...')}
              />
            </div>

            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">{t('All Specializations')}</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">{t('All Experience')}</option>
              <option value="0">0+ {t('years')}</option>
              <option value="5">5+ {t('years')}</option>
              <option value="10">10+ {t('years')}</option>
              <option value="15">15+ {t('years')}</option>
            </select>

            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">{t('Any Fee')}</option>
              <option value="500">Under ₹500</option>
              <option value="1000">Under ₹1000</option>
              <option value="1500">Under ₹1500</option>
              <option value="2000">Under ₹2000</option>
            </select>
          </div>

          {hasActiveFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex items-center justify-between"
            >
              <div className="flex flex-wrap gap-2">
                {nameFilter && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {nameFilter} <button onClick={() => setNameFilter('')} className="ml-1">×</button>
                  </span>
                )}
                {specializationFilter && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {specializationFilter} <button onClick={() => setSpecializationFilter('')} className="ml-1">×</button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-red-500 transition-colors"
              >
                {t('Clear All')}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Doctors Grid */}
        <div className="mt-8">
          {filteredDoctors.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/50 bg-white/80 p-8 text-center shadow-lg md:p-10"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('No doctors found')}</h3>
              <p className="text-slate-500">{t('Try adjusting your filters to see more results')}</p>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {t('Clear Filters')}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor._id}
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  className="group overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-lg shadow-slate-200/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-gray-200">
                    <img
                      src={doctor.userId?.profileImage || getSpecializationImage(doctor.specialization)}
                      alt={doctor.userId?.fullName || 'Doctor'}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                      onError={(e) => { e.target.src = getSpecializationImage(doctor.specialization); }}
                    />
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-1 shadow-lg">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-slate-900">{Number(doctor.rating || 4.5).toFixed(1)}</span>
                    </div>
                    {doctor.isAvailable && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                        Available
                      </div>
                    )}
                  </div>

                  <div className="p-4 md:p-5">
                    <div className="mb-3">
                      <h3 className="text-lg font-black text-slate-900 mb-1">{doctor.userId?.fullName || 'Doctor'}</h3>
                      <p className="text-blue-600 font-semibold text-sm">{doctor.specialization}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{doctor.experience} {t('years exp')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>₹{doctor.consultationFee}</span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
                      {doctor.bio || t('Experienced healthcare professional dedicated to patient care.')}
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button 
                        onClick={() => setSelectedDoctor(doctor)}
                        className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        {t('View Details')}
                      </button>
                      <button 
                        onClick={() => handleBookNow(doctor._id)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
                      >
                        {t('Book Now')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Doctor Detail Modal */}
        <AnimatePresence>
          {selectedDoctor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
              onClick={() => setSelectedDoctor(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative mx-2 max-h-[85vh] w-full max-w-xs overflow-y-auto rounded-2xl bg-white shadow-2xl sm:mx-4 sm:max-w-lg lg:max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-gray-200 sm:h-56 lg:h-64">
                  <img
                    src={selectedDoctor.userId?.profileImage || getSpecializationImage(selectedDoctor.specialization)}
                    alt={selectedDoctor.userId?.fullName || 'Doctor'}
                    className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                    onError={(e) => { e.target.src = getSpecializationImage(selectedDoctor.specialization); }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
                  
                  {/* Back Button - Left Side */}
                  <button 
                    onClick={() => setSelectedDoctor(null)}
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-md rounded-full text-slate-700 hover:bg-white transition-colors shadow-md"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-xs font-semibold">Back</span>
                  </button>
                  
                  {/* Close Button - Right Side */}
                  <button 
                    onClick={() => setSelectedDoctor(null)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-700 hover:bg-white transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="text-lg font-black text-white drop-shadow-lg sm:text-xl">{selectedDoctor.userId?.fullName || selectedDoctor.name || 'Doctor'}</h2>
                    <p className="text-blue-200 text-sm font-medium">{selectedDoctor.specialization}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-amber-100 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                        <span className="font-bold text-amber-700 text-sm">{Number(selectedDoctor.rating || 4.5).toFixed(1)}</span>
                      </div>
                      {selectedDoctor.isAvailable && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Available</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-bold text-blue-600 uppercase">Experience</span>
                      </div>
                      <p className="text-lg font-black text-slate-900">{selectedDoctor.experience || 0} <span className="text-xs font-medium text-slate-500">years</span></p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-600 uppercase">Fee</span>
                      </div>
                      <p className="text-lg font-black text-slate-900">₹{selectedDoctor.consultationFee || 500}</p>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Qualification</p>
                      <p className="font-semibold text-slate-900 text-sm">{selectedDoctor.qualification || 'Not specified'}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">About</p>
                      <p className="text-slate-600 text-sm">{selectedDoctor.bio || 'Experienced healthcare professional dedicated to patient care and wellness.'}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Email</p>
                      <p className="text-slate-600 text-sm">{selectedDoctor.userId?.email || 'Not available'}</p>
                    </div>
                    {selectedDoctor.userId?.phone && (
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <p className="text-xs font-bold text-slate-500 uppercase">Phone</p>
                        </div>
                        <p className="font-semibold text-slate-700 text-sm">{selectedDoctor.userId?.phone || 'Not available'}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDoctor(null);
                      handleBookNow(selectedDoctor._id);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 sm:text-base"
                  >
                    {t('Book Now')}
                  </button>
                </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Guard Modal */}
        <AnimatePresence>
          {showGuardModal && location.state?.bookingGuardMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-lg bg-white rounded-3xl p-8 shadow-2xl"
              >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 text-center mb-2">{t('Booking Notice')}</h2>
                <p className="text-slate-600 text-center mb-6">{location.state.bookingGuardMessage}</p>
                <button
                  onClick={() => setShowGuardModal(false)}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  {t('Got it')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExploreDoctors;
