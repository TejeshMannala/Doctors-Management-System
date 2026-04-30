import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';

const pageTransition = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerGroup = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardTransition = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const formatDisplayDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
};

const getAppointmentProblem = (appointment, t) =>
  appointment?.healthInfo?.problemDescription || appointment?.symptoms || t('Not provided');

const StatPill = ({ label, value, tone = 'light' }) => {
  const toneClass =
    tone === 'dark'
      ? 'border-white/10 bg-slate-950 text-white'
      : tone === 'mint'
        ? 'border-emerald-200/80 bg-emerald-50 text-emerald-900'
        : 'border-sky-200/80 bg-sky-50 text-slate-900';

  return (
    <motion.div
      variants={cardTransition}
      className={`rounded-[28px] border p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] ${toneClass}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
    </motion.div>
  );
};

const InfoTile = ({ label, value, className = '' }) => (
  <div className={`rounded-[24px] border border-white/70 bg-white/70 p-4 backdrop-blur ${className}`}>
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
  </div>
);

const Prescription = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', instruction: '' }]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState({
    disease: '',
    symptoms: [],
    severity: 'Mild',
    description: '',
  });
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNearbyCare, setShowNearbyCare] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pharmacyAvailability, setPharmacyAvailability] = useState([]);
  const [showPharmacies, setShowPharmacies] = useState(false);
  const [pharmacyLoading, setPharmacyLoading] = useState(false);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const { user, token } = useContext(AuthContext);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchDoctorAppointments();
    } else {
      fetchPatientPrescriptions();
    }
  }, [user?.role, token]);

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiUrl('/appointments/doctor'), {
        headers: authHeaders(token),
      });
      const appointmentsList = Array.isArray(response.data)
        ? response.data
        : response.data.appointments || [];
      setAppointments(appointmentsList);
      const preselectedAppointmentId = location.state?.appointmentId;
      if (preselectedAppointmentId) {
        const matchedAppointment = appointmentsList.find(
          (appointment) => appointment._id === preselectedAppointmentId
        );
        if (matchedAppointment) {
          setSelectedAppointment(matchedAppointment);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiUrl('/prescriptions/patient'), {
        headers: authHeaders(token),
      });

      console.log('Prescriptions API Response:', response.data);

      // Handle response - backend returns array directly
      const prescriptionsList = Array.isArray(response.data)
        ? response.data
        : response.data.prescriptions || [];

      console.log('Parsed prescriptions:', prescriptionsList);
      setAppointments(prescriptionsList);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', instruction: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const handleFileChange = (e) => {
    setReports(e.target.files[0]);
  };

  const handleSubmitPrescription = async () => {
    if (!selectedAppointment) return;

    if (medicines.some((medicine) => !medicine.name || !medicine.dosage)) {
      alert(t('Please fill in medicine name and dosage'));
      return;
    }

    if (!diagnosis.disease) {
      alert(t('Please specify the disease/diagnosis'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('appointmentId', selectedAppointment._id);
      formData.append('medicines', JSON.stringify(medicines));
      formData.append('diagnosis', JSON.stringify(diagnosis));
      formData.append('notes', prescriptionNotes);
      if (reports) {
        formData.append('reports', reports);
      }

      await axios.post(apiUrl('/prescriptions'), formData, {
        headers: {
          ...authHeaders(token),
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        resetForm();
        fetchDoctorAppointments();
        navigate('/doctor-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting prescription:', error);
      alert(error.response?.data?.message || t('Error submitting prescription'));
    }
  };

  const resetForm = () => {
    setSelectedAppointment(null);
    setMedicines([{ name: '', dosage: '', duration: '', instruction: '' }]);
    setDiagnosis({
      disease: '',
      symptoms: [],
      severity: 'Mild',
      description: '',
    });
    setPrescriptionNotes('');
    setReports(null);
    setShowSuccessModal(false);
    setCurrentSymptom('');
  };

  const checkPharmacyAvailability = async (prescriptionId) => {
    // Navigate to pharmacy locator with the prescription ID
    navigate('/pharmacy-locator', { state: { prescriptionId } });
  };

  const addSymptom = (symptom) => {
    if (symptom.trim() && !diagnosis.symptoms.includes(symptom)) {
      setDiagnosis({
        ...diagnosis,
        symptoms: [...diagnosis.symptoms, symptom],
      });
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (index) => {
    setDiagnosis({
      ...diagnosis,
      symptoms: diagnosis.symptoms.filter((_, i) => i !== index),
    });
  };

  const downloadPDF = (appointment) => {
    const doc = `${t('PRESCRIPTION')}
============================
${t('Date')}: ${new Date().toLocaleDateString()}

${t('DOCTOR INFORMATION')}
${t('Doctor')}: ${appointment.doctorId?.userId?.fullName}
${t('Specialization')}: ${appointment.doctorId?.specialization || t('General')}

${t('PATIENT INFORMATION')}
${t('Patient')}: ${appointment.patientId?.fullName}
${t('Age')}: ${appointment.appointmentId?.patientDetails?.age || 'N/A'}
${t('Gender')}: ${t(appointment.appointmentId?.patientDetails?.gender) || 'N/A'}

${t('DIAGNOSIS & DISEASE')}
${t('Disease')}: ${appointment.diagnosis?.disease || t('Not specified')}
${t('Symptoms')}: ${appointment.diagnosis?.symptoms?.join(', ') || t('Not specified')}
${t('Severity')}: ${t(appointment.diagnosis?.severity) || t('Not specified')}
${t('Description')}: ${appointment.diagnosis?.description || t('No description')}

${t('APPOINTMENT')}
${t('Date')}: ${new Date(appointment.appointmentId?.date).toLocaleDateString()}
${t('Time')}: ${appointment.appointmentId?.timeSlot}
${t('Problem')}: ${appointment.appointmentId?.symptoms?.description || t('General Checkup')}

${t('Medicines')}
${appointment.medicines
        ?.map(
          (medicine, index) => `${index + 1}. ${medicine.name}
   ${t('Dosage')}: ${medicine.dosage}
   ${t('Duration')}: ${medicine.duration}
   ${t('Instructions')}: ${medicine.instructions || medicine.instruction}`
        )
        .join('\n\n')}

${t('DOCTOR\'S NOTES')}
${appointment.notes || t('No additional notes')}
    `.trim();

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(doc));
    element.setAttribute('download', `prescription_${appointment._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = (appointment) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Prescription</title></head>
        <body>
          <h1>${t('Medical Prescription')}</h1>
          <p><strong>${t('Doctor')}</strong>: ${appointment.doctorId?.userId?.fullName || ''}</p>
          <p><strong>${t('Patient')}</strong>: ${appointment.patientId?.fullName || ''}</p>
          <p><strong>${t('Date')}</strong>: ${new Date(appointment.appointmentId?.date).toLocaleDateString()}</p>
          <p><strong>${t('Time')}</strong>: ${appointment.appointmentId?.timeSlot || ''}</p>
          <hr />
          ${appointment.medicines
        ?.map(
          (medicine) =>
            `<p><strong>${medicine.name}</strong> - ${medicine.dosage} - ${medicine.duration} - ${medicine.instructions || medicine.instruction}</p>`
        )
        .join('')}
          <p><strong>${t('Notes')}</strong>: ${appointment.notes || ''}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_50%,#eff6ff_100%)]">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-28">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-slate-600">{t('Loading...')}</p>
          </div>
        </div>
      </div>
    );
  }

  const doctorMode = user?.role === 'doctor';
  const totalMedicineItems = appointments.reduce(
    (total, appointment) => total + (appointment.medicines?.length || 0),
    0
  );

  if (doctorMode) {
    return (
      <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f5fbff_0%,#eef8ff_32%,#f8fafc_100%)] py-8">
        <div className="mx-auto max-w-7xl px-4">
          <BackButton />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerGroup}
            className="relative mt-4"
          >
            <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-blue-200/40 blur-3xl" />

            <motion.section
              variants={pageTransition}
              className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96)_0%,rgba(15,118,110,0.92)_46%,rgba(125,211,252,0.85)_100%)] p-8 text-white shadow-[0_35px_90px_-35px_rgba(15,23,42,0.75)] sm:p-10"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_30%)]" />
              <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-100">
                    {t('Create Prescription')}
                  </p>
                  <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
                    {t('Turn every consultation into a clean, confident care plan.')}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-50/88">
                    {t('Review the patient, write medicines clearly, attach reports, and finish with notes that feel personal and useful.')}
                  </p>
                </div>

                <motion.div
                  variants={staggerGroup}
                  className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
                >
                  <StatPill label={t('Appointments')} value={appointments.length} />
                  <StatPill label={t('Medicine Entries')} value={medicines.length} tone="mint" />
                  <StatPill
                    label={t('Current Mode')}
                    value={selectedAppointment ? t('Writing') : t('Select patient')}
                    tone="dark"
                  />
                </motion.div>
              </div>
            </motion.section>

            <AnimatePresence>
              {showSuccessModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.96 }}
                    transition={{ duration: 0.28 }}
                    className="w-full max-w-md rounded-[32px] border border-white/70 bg-white p-8 text-center shadow-2xl"
                  >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-700">
                      OK
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-slate-900">
                      {t('Prescription Submitted!')}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {t('Your prescription has been saved successfully.')}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!selectedAppointment ? (
                <motion.section
                  key="doctor-list"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -16 }}
                  variants={staggerGroup}
                  className="mt-8"
                >
                  {appointments.length === 0 ? (
                    <motion.div
                      variants={cardTransition}
                      className="rounded-[32px] border border-white/70 bg-white/85 p-12 text-center shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur"
                    >
                      <p className="text-lg font-semibold text-slate-900">{t('No appointments found')}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {t('Accepted appointments will appear here when patients are ready for prescriptions.')}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {appointments.map((appointment, index) => (
                        <motion.article
                          key={appointment._id}
                          variants={cardTransition}
                          whileHover={{ y: -8, rotate: index % 2 === 0 ? -0.4 : 0.4 }}
                          className="group relative overflow-hidden rounded-[32px] border border-white/75 bg-white/88 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.2)] backdrop-blur"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#06b6d4_0%,#2563eb_45%,#14b8a6_100%)]" />
                          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-100 transition duration-300 group-hover:scale-125" />

                          <div className="relative">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                                  {t('Patient Queue')}
                                </p>
                                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                                  {appointment.patientId?.fullName}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                  {formatDisplayDate(appointment.date)} at {appointment.timeSlot || 'N/A'}
                                </p>
                              </div>
                              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                                {t('Ready')}
                              </span>
                            </div>

                            <div className="mt-6 grid gap-3">
                              <InfoTile label={t('Problem')} value={getAppointmentProblem(appointment, t)} />
                              <div className="grid gap-3 sm:grid-cols-2">
                                <InfoTile
                                  label={t('Severity')}
                                  value={appointment.healthInfo?.severity || t('Not provided')}
                                />
                                <InfoTile
                                  label={t('Status')}
                                  value={appointment.status || t('Pending')}
                                />
                              </div>
                            </div>

                            <button
                              className="btn-primary mt-6 w-full"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              {t('Add Prescription')}
                            </button>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  )}
                </motion.section>
              ) : (
                <motion.section
                  key="doctor-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
                >
                  <div className="space-y-6">
                    <div className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] p-6 text-white shadow-[0_24px_80px_-25px_rgba(15,23,42,0.55)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                        {t('Prescription Focus')}
                      </p>
                      <h2 className="mt-3 text-3xl font-black tracking-tight">
                        {t('Prescription for')} {selectedAppointment.patientId?.fullName}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {t('Use this panel to review the patient snapshot before you confirm treatment.')}
                      </p>
                      <button
                        className="btn-secondary mt-6"
                        onClick={() => setSelectedAppointment(null)}
                      >
                        {t('Back')}
                      </button>
                    </div>

                    <motion.div
                      variants={staggerGroup}
                      initial="hidden"
                      animate="visible"
                      className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur"
                    >
                      <motion.div variants={cardTransition}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                          {t('Patient Information')}
                        </p>
                        <div className="mt-5 grid gap-3">
                          <InfoTile label={t('Name')} value={selectedAppointment.patientId?.fullName} />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <InfoTile
                              label={t('Age')}
                              value={selectedAppointment.patientDetails?.age || t('Not provided')}
                            />
                            <InfoTile
                              label={t('Gender')}
                              value={selectedAppointment.patientDetails?.gender || t('Not provided')}
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <InfoTile
                              label={t('Date of Appointment')}
                              value={formatDisplayDate(selectedAppointment.date)}
                            />
                            <InfoTile
                              label={t('Time')}
                              value={selectedAppointment.timeSlot || 'N/A'}
                            />
                          </div>
                          <InfoTile
                            label={t('Problem')}
                            value={getAppointmentProblem(selectedAppointment, t)}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerGroup}
                    className="rounded-[32px] border border-white/70 bg-white/86 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur sm:p-8"
                  >
                    <motion.div variants={cardTransition} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">
                          {t('Patient Assessment')}
                        </p>
                        <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                          {t('Diagnosis & Disease')}
                        </h3>
                      </div>
                    </motion.div>

                    <motion.div variants={cardTransition} className="mt-6 space-y-5">
                      <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5">
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          {t('Disease/Diagnosis')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('e.g., Fever, Cough, Hypertension...')}
                          value={diagnosis.disease}
                          onChange={(e) => setDiagnosis({ ...diagnosis, disease: e.target.value })}
                          className="form-input w-full"
                        />
                      </div>

                      <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5">
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          {t('Symptoms')}
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder={t('Add symptom...')}
                            value={currentSymptom}
                            onChange={(e) => setCurrentSymptom(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSymptom(currentSymptom);
                              }
                            }}
                            className="form-input flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => addSymptom(currentSymptom)}
                            className="btn-secondary px-4"
                          >
                            {t('Add')}
                          </button>
                        </div>
                        {diagnosis.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {diagnosis.symptoms.map((symptom, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-700"
                              >
                                {symptom}
                                <button
                                  type="button"
                                  onClick={() => removeSymptom(index)}
                                  className="text-cyan-500 hover:text-cyan-700"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5">
                          <label className="block text-sm font-bold text-slate-900 mb-2">
                            {t('Severity')}
                          </label>
                          <select
                            value={diagnosis.severity}
                            onChange={(e) => setDiagnosis({ ...diagnosis, severity: e.target.value })}
                            className="form-input w-full"
                          >
                            <option value="Mild">{t('Mild')}</option>
                            <option value="Moderate">{t('Moderate')}</option>
                            <option value="Severe">{t('Severe')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5">
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          {t('Description')}
                        </label>
                        <textarea
                          placeholder={t('Additional diagnosis details...')}
                          value={diagnosis.description}
                          onChange={(e) => setDiagnosis({ ...diagnosis, description: e.target.value })}
                          className="form-input w-full min-h-[100px] resize-y"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={cardTransition} className="flex items-center justify-between gap-4 mt-8">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">
                          {t('Treatment Builder')}
                        </p>
                        <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                          {t('Medicines')}
                        </h3>
                      </div>
                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                        {medicines.length} {t('items')}
                      </span>
                    </motion.div>

                    <motion.div variants={cardTransition} className="mt-6 space-y-4">
                      {medicines.map((medicine, index) => (
                        <motion.div
                          key={index}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5"
                        >
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {t('Medicine')} {index + 1}
                            </p>
                            {medicines.length > 1 && (
                              <button
                                type="button"
                                className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                                onClick={() => handleRemoveMedicine(index)}
                              >
                                {t('Remove')}
                              </button>
                            )}
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <input
                              type="text"
                              placeholder={t('Medicine Name')}
                              value={medicine.name}
                              onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                              className="form-input"
                            />
                            <input
                              type="text"
                              placeholder={t('Dosage (e.g., 1-0-1)')}
                              value={medicine.dosage}
                              onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                              className="form-input"
                            />
                            <input
                              type="text"
                              placeholder={t('Duration (e.g., 5 days)')}
                              value={medicine.duration}
                              onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                              className="form-input"
                            />
                            <input
                              type="text"
                              placeholder={t('Instructions (Before/After food)')}
                              value={medicine.instruction}
                              onChange={(e) => handleMedicineChange(index, 'instruction', e.target.value)}
                              className="form-input"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div variants={cardTransition}>
                      <button className="btn-secondary mt-5" onClick={handleAddMedicine}>
                        {t('Add Medicine')}
                      </button>
                    </motion.div>

                    <motion.div variants={cardTransition} className="mt-8">
                      <h3 className="text-xl font-bold text-slate-900">
                        {t('Doctor Notes & Advice')}
                      </h3>
                      <textarea
                        placeholder={t('e.g., Take rest, drink water, avoid spicy food...')}
                        value={prescriptionNotes}
                        onChange={(e) => setPrescriptionNotes(e.target.value)}
                        className="form-input mt-4 min-h-[160px] resize-y"
                        rows="6"
                      />
                    </motion.div>

                    <motion.div variants={cardTransition} className="mt-8">
                      <h3 className="text-xl font-bold text-slate-900">
                        {t('Upload Reports')} ({t('Optional')})
                      </h3>
                      <div className="mt-4 rounded-[24px] border border-dashed border-cyan-200 bg-cyan-50/60 p-4">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept="application/pdf,image/*"
                          className="form-input"
                        />
                        {reports && (
                          <p className="mt-3 text-sm font-medium text-emerald-700">
                            {t('Selected file')}: {reports.name}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={cardTransition}
                      className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end"
                    >
                      <button
                        className="btn-secondary"
                        onClick={() => setSelectedAppointment(null)}
                      >
                        {t('Cancel')}
                      </button>
                      <button className="btn-primary" onClick={handleSubmitPrescription}>
                        {t('Submit Prescription')}
                      </button>
                    </motion.div>
                  </motion.div>
                </motion.section>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fcfcff_0%,#eff6ff_32%,#f8fafc_100%)] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <BackButton />

        <motion.div initial="hidden" animate="visible" variants={staggerGroup} className="relative mt-4">
          <div className="pointer-events-none absolute left-0 top-8 h-44 w-44 rounded-full bg-amber-200/35 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-0 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />

          <motion.section
            variants={pageTransition}
            className="relative overflow-hidden rounded-[36px] border border-white/75 bg-[linear-gradient(135deg,rgba(255,251,235,0.95)_0%,rgba(255,255,255,0.92)_46%,rgba(224,242,254,0.94)_100%)] p-8 shadow-[0_24px_60px_-28px_rgba(37,99,235,0.28)] sm:p-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_30%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-700">
                  {t('My Prescriptions')}
                </p>
                <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                </p>
              </div>

              <motion.div variants={staggerGroup} className="grid gap-4 sm:grid-cols-2">
                {/* Stat pills removed per user request */}
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            variants={staggerGroup}
            className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <motion.div
              variants={cardTransition}
              className="overflow-hidden rounded-[32px] border border-white/75 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#38bdf8_100%)] p-6 text-white shadow-[0_24px_80px_-25px_rgba(15,23,42,0.55)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-100">
                    {t('Nearby Care')}
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight">
                    {t('Need nearby medical stores?')}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-sky-50/90">
                    {t('Location suggestions stay hidden until you choose to open them.')}
                  </p>
                </div>
                <button
                  className="btn-primary bg-white text-slate-950 hover:bg-slate-100"
                  onClick={() => setShowNearbyCare((current) => !current)}
                >
                  {showNearbyCare ? t('Hide Nearby Care') : t('Show Nearby Care')}
                </button>
              </div>

              <AnimatePresence initial={false}>
                {showNearbyCare && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 rounded-[28px] border border-white/20 bg-white/10 p-5 backdrop-blur">
                      <p className="text-sm leading-7 text-sky-50/90">
                        {t('Use the pharmacy locator to check medicine availability, directions, and nearby medical support.')}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          className="btn-primary bg-white text-slate-950 hover:bg-slate-100"
                          onClick={() => {
                            if (appointments.length > 0) {
                              navigate('/pharmacy-locator', { state: { prescriptionId: appointments[0]._id } });
                            } else {
                              navigate('/pharmacy-locator');
                            }
                          }}
                        >
                          {t('Open Pharmacy Locator')}
                        </button>
                        <button
                          className="btn-outline border-white/40 bg-white/10 text-white hover:bg-white/20"
                          onClick={() => navigate('/explore-doctors')}
                        >
                          {t('Explore Doctors')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              variants={cardTransition}
              className="rounded-[32px] border border-white/75 bg-white/85 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">
                {t('Quick View')}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoTile label={t('Prescription Count')} value={appointments.length} />
                <InfoTile label={t('Medication Items')} value={totalMedicineItems} />
                <InfoTile
                  label={t('Latest Visit')}
                  value={appointments[0]?.appointmentId?.date ? formatDisplayDate(appointments[0].appointmentId.date) : 'N/A'}
                  className="sm:col-span-2"
                />
              </div>
            </motion.div>
          </motion.section>

          {appointments.length === 0 ? (
            <motion.div
              variants={cardTransition}
              className="mt-8 rounded-[32px] border border-white/70 bg-white/85 p-12 text-center shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur"
            >
              <p className="text-lg font-semibold text-slate-900">{t('No prescriptions yet')}</p>
              <p className="mt-2 text-sm text-slate-500">
                {t('Your doctor will add prescriptions here after consultation.')}
              </p>
            </motion.div>
          ) : (
            <motion.section variants={staggerGroup} className="mt-8 grid gap-5">
              {/* Latest Prescription */}
              {appointments.length > 0 && (
                <motion.article
                  key={appointments[0]._id}
                  variants={cardTransition}
                  whileHover={{ y: -6 }}
                  className="overflow-hidden rounded-[32px] border border-white/75 bg-white/88 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.2)] backdrop-blur border-l-8 border-l-blue-500"
                >
                  <div className="bg-blue-500/10 px-6 py-2 border-b border-blue-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{t('Latest Prescription')}</span>
                    <span className="text-[10px] font-medium text-slate-500">{formatDisplayDate(appointments[0].appointmentId?.date)}</span>
                  </div>
                  <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-6 lg:border-b-0 lg:border-r">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">
                            {t('Prescription')}
                          </p>
                          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                            {appointments[0].doctorId?.userId?.fullName}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">
                            {appointments[0].doctorId?.specialization || t('General')}
                          </p>
                        </div>
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                          {t('Latest')}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <InfoTile
                          label={t('Date')}
                          value={formatDisplayDate(appointments[0].appointmentId?.date)}
                        />
                        <InfoTile label={t('Time')} value={appointments[0].appointmentId?.timeSlot || 'N/A'} />
                        <InfoTile
                          label={t('Medicines')}
                          value={`${appointments[0].medicines?.length || 0} ${t('items')}`}
                        />
                        <InfoTile
                          label={t('Disease')}
                          value={appointments[0].diagnosis?.disease || t('Not specified')}
                        />
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button className="btn-secondary" onClick={() => downloadPDF(appointments[0])}>
                          {t('Download')}
                        </button>
                        <button className="btn-primary" onClick={() => handlePrint(appointments[0])}>
                          {t('Print')}
                        </button>
                        <button
                          className="btn-primary bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => checkPharmacyAvailability(appointments[0]._id)}
                          disabled={pharmacyLoading}
                        >
                          {pharmacyLoading ? t('Checking...') : t('Find Pharmacies')}
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                        {t('Diagnosis & Disease')}
                      </p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            {t('Disease')}
                          </p>
                          <p className="mt-2 text-lg font-bold text-slate-900">
                            {appointments[0].diagnosis?.disease || t('Not specified')}
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            {t('Severity')}
                          </p>
                          <p className="mt-2 text-lg font-bold text-slate-900">
                            {appointments[0].diagnosis?.severity || t('Not specified')}
                          </p>
                        </div>
                      </div>

                      {appointments[0].diagnosis?.symptoms && appointments[0].diagnosis.symptoms.length > 0 && (
                        <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            {t('Symptoms')}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {appointments[0].diagnosis.symptoms.map((symptom, idx) => (
                              <span
                                key={idx}
                                className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                        {t('Medication Plan')}
                      </p>
                      <div className="mt-5 space-y-4">
                        {appointments[0].medicines?.length ? (
                          appointments[0].medicines.map((medicine, medicineIndex) => (
                            <div
                              key={`${appointments[0]._id}-${medicineIndex}`}
                              className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 transition-all hover:border-sky-200 hover:shadow-md"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                                      {medicineIndex + 1}
                                    </span>
                                    <h4 className="text-xl font-black tracking-tight text-slate-900">{medicine.name}</h4>
                                  </div>

                                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-slate-50 p-3">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('Dosage / Day')}</p>
                                      <p className="mt-1 text-sm font-black text-slate-700">{medicine.dosage}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-3">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('Duration')}</p>
                                      <p className="mt-1 text-sm font-black text-slate-700">{medicine.duration}</p>
                                    </div>
                                    <div className="rounded-2xl bg-sky-50 p-3 sm:col-span-1 col-span-2">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">{t('Consumption')}</p>
                                      <p className="mt-1 text-sm font-bold text-sky-800">{medicine.instructions || medicine.instruction || t('As directed')}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-[24px] border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                            {t('No medicines listed')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              )}

              {/* History Toggle */}
              {appointments.length > 1 && (
                <div className="flex justify-center mt-4">
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/60 border border-white/80 text-slate-900 font-black tracking-tight shadow-lg hover:bg-white hover:scale-105 transition-all"
                  >
                    {showHistory ? t('Hide Previous Prescriptions') : t('View Previous Prescriptions')}
                    <span className="text-blue-500">{showHistory ? '↑' : '↓'}</span>
                  </button>
                </div>
              )}

              {/* Previous Prescriptions */}
              <AnimatePresence>
                {showHistory && appointments.slice(1).map((appointment, index) => (
                  <motion.article
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="overflow-hidden rounded-[32px] border border-white/75 bg-white/70 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.15)] backdrop-blur opacity-90 grayscale-[0.2] hover:grayscale-0 transition-all"
                  >
                    <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                      <div className="border-b border-slate-100 p-6 lg:border-b-0 lg:border-r">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                              {t('Prescription')} {index + 2}
                            </p>
                            <h3 className="mt-3 text-xl font-black tracking-tight text-slate-800">
                              {appointment.doctorId?.userId?.fullName}
                            </h3>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <InfoTile label={t('Date')} value={formatDisplayDate(appointment.appointmentId?.date)} />
                          <InfoTile label={t('Disease')} value={appointment.diagnosis?.disease || t('Not specified')} />
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <button className="btn-secondary py-2 text-xs" onClick={() => downloadPDF(appointment)}>
                            {t('Download')}
                          </button>
                          <button className="btn-primary py-2 text-xs bg-slate-700 hover:bg-slate-800" onClick={() => handlePrint(appointment)}>
                            {t('Print')}
                          </button>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50/30">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{t('Quick Med Summary')}</p>
                         <div className="flex flex-wrap gap-2">
                           {appointment.medicines?.map((med, mIdx) => (
                             <span key={mIdx} className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600">
                               {med.name}
                             </span>
                           ))}
                           {(!appointment.medicines || appointment.medicines.length === 0) && <span className="text-xs text-slate-400 italic">{t('No medicines')}</span>}
                         </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.section>
          )}

          <AnimatePresence>
            {showPharmacies && pharmacyAvailability.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <motion.div
                  variants={cardTransition}
                  className="overflow-hidden rounded-[32px] border border-white/75 bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_50%,#a7f3d0_100%)] p-6 shadow-[0_24px_60px_-30px_rgba(16,185,129,0.2)]"
                >
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
                        {t('Pharmacy Availability')}
                      </p>
                      <h2 className="mt-3 text-3xl font-black tracking-tight text-emerald-950">
                        {t('Available Pharmacies')}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowPharmacies(false)}
                      className="text-emerald-700 hover:text-emerald-900 text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pharmacyAvailability
                      .sort((a, b) => b.availabilityPercentage - a.availabilityPercentage)
                      .map((pharmacy, idx) => {
                        const isFullyAvailable = pharmacy.availabilityPercentage === 100;
                        return (
                          <motion.div
                            key={idx}
                            variants={cardTransition}
                            className="group relative overflow-hidden rounded-[32px] border border-emerald-200/60 bg-white p-6 shadow-lg transition-all hover:shadow-xl"
                          >
                            <div className={`absolute top-0 left-0 w-full h-1 ${isFullyAvailable ? 'bg-emerald-500' : 'bg-amber-400'}`} />

                            <div className="flex items-start justify-between gap-3 mb-5">
                              <div>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                                  {pharmacy.pharmacyName}
                                </h3>
                                {isFullyAvailable ? (
                                  <p className="text-sm font-medium text-slate-600 mt-2 flex items-center gap-2">
                                    <span className="text-emerald-600">📍</span>
                                    {pharmacy.address?.street}, {pharmacy.address?.city}
                                  </p>
                                ) : (
                                  <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 border border-amber-100">
                                    <p className="text-xs font-bold text-amber-800 flex items-center gap-2">
                                      ⚠️ {t('Location hidden - Partial stock')}
                                    </p>
                                    <p className="text-[10px] text-amber-600 mt-1">{t('Call pharmacy to verify availability before visiting')}</p>
                                  </div>
                                )}
                              </div>
                              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl font-black text-lg ${isFullyAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {pharmacy.availabilityPercentage}%
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                              <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('Owner')}</p>
                                <p className="mt-1 text-sm font-bold text-slate-700">{pharmacy.ownerName || 'Apollo Group'}</p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('License ID')}</p>
                                <p className="mt-1 text-sm font-bold text-slate-700">{pharmacy.licenseId || `LIC-${pharmacy.pharmacyName.slice(0, 3).toUpperCase()}-24`}</p>
                              </div>
                            </div>

                            <div className="mb-5 space-y-3 bg-slate-50 rounded-[24px] p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('Medicine Status')}</span>
                                <span className={`text-xs font-black ${isFullyAvailable ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {pharmacy.availableMedicines.length}/{pharmacy.availableMedicines.length + pharmacy.unavailableMedicines.length} {t('Ready')}
                                </span>
                              </div>

                              <div className="space-y-2">
                                {pharmacy.availableMedicines.map((med, mIdx) => (
                                  <div key={mIdx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="text-emerald-500 text-[10px]">●</span>
                                      <span className="font-medium text-slate-700">{med.name}</span>
                                    </div>
                                    <span className="font-black text-slate-900">₹{med.cost}</span>
                                  </div>
                                ))}
                                {pharmacy.unavailableMedicines.map((med, mIdx) => (
                                  <div key={mIdx} className="flex items-center justify-between text-sm opacity-50">
                                    <div className="flex items-center gap-2">
                                      <span className="text-red-400 text-[10px]">●</span>
                                      <span className="font-medium text-slate-500 line-through">{med.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-red-600 uppercase">{t('Out of Stock')}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                                <span className="text-sm font-bold text-slate-900">{t('Estimated Total')}</span>
                                <span className="text-xl font-black text-emerald-700">₹{pharmacy.totalCost.toFixed(2)}</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <a href={`tel:${pharmacy.phone}`} className="flex-1 btn-primary bg-emerald-600 py-3 text-sm flex items-center justify-center gap-2">
                                  📞 {t('Call Now')}
                                </a>
                                {isFullyAvailable && (
                                  <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${pharmacy.address.latitude},${pharmacy.address.longitude}`, '_blank')} className="flex-1 btn-secondary border-emerald-200 text-emerald-700 py-3 text-sm flex items-center justify-center gap-2">
                                    🗺️ {t('Directions')}
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] text-center text-slate-400 mt-1">
                                {t('Hours')}: {pharmacy.openingTime} - {pharmacy.closingTime}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>

                  {pharmacyAvailability.length === 0 && (
                    <div className="rounded-[24px] border border-dashed border-emerald-300 bg-emerald-50/50 p-8 text-center">
                      <p className="text-emerald-700 font-semibold">
                        {t('No pharmacies found with complete medicine availability')}
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Prescription;
