import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';
import { formatDate } from '../utils/locale';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [paymentMap, setPaymentMap] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAppointment, setSuccessAppointment] = useState(null);
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (location.state?.bookingSuccess && location.state?.appointment) {
      setShowSuccessModal(true);
      setSuccessAppointment(location.state.appointment);
    }
  }, [location.state]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(apiUrl('/appointments/patient'), {
        headers: authHeaders(token),
      });
      const appointmentsList = response.data.appointments || [];
      setAppointments(appointmentsList);
      fetchPaymentsForAppointments(appointmentsList);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  const fetchPaymentsForAppointments = async (appointmentsList) => {
    const results = await Promise.all(
      appointmentsList.map(async (appointment) => {
        try {
          const response = await axios.get(apiUrl(`/payments/appointment/${appointment._id}`), {
            headers: authHeaders(token),
          });
          return [appointment._id, response.data.payment];
        } catch (error) {
          return [appointment._id, null];
        }
      })
    );

    setPaymentMap(Object.fromEntries(results));
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(apiUrl(`/appointments/${appointmentId}/cancel`), {
          headers: authHeaders(token),
        });
        fetchAppointments();
      } catch (error) {
        console.error('Error canceling appointment:', error);
      }
    }
  };

  const handleJoinCall = () => {
    alert('Joining video call...');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <BackButton />

        {showSuccessModal && successAppointment && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-sky-600/90 px-4">
            <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white text-center shadow-2xl">
              <div className="relative bg-gradient-to-b from-sky-50 to-white px-8 pb-8 pt-10">
                <div className="absolute right-6 top-6 text-3xl font-light text-slate-400">×</div>
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-emerald-500 shadow-[0_18px_50px_-18px_rgba(16,185,129,0.7)]">
                  <span className="text-8xl font-black text-white">✓</span>
                </div>
                <div className="mt-6 text-4xl font-black tracking-tight text-slate-900">
                  {t('Successfully')}
                </div>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-600">
                  {t('Your appointment has been confirmed successfully.')}
                </p>
              </div>

              <div className="px-8 pb-8">
                <div className="rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-700">
                  <p><strong>{t('Appointment ID')}:</strong> {successAppointment._id}</p>
                  <p><strong>{t('Status')}:</strong> {t(successAppointment.status)}</p>
                  <p><strong>{t('Date & Time')}:</strong> {formatDate(successAppointment.date, i18n.resolvedLanguage)} {successAppointment.timeSlot}</p>
                </div>

                <div className="mt-8">
                  <button
                    className="w-full rounded-none rounded-b-[24px] bg-sky-300 px-6 py-4 text-2xl font-black text-white transition hover:bg-sky-400"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    {t('Oke')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('My Appointments')}</h1>
          <p className="mt-2 text-slate-600">{t('View the booking ID, doctor details, and appointment status for each visit.')}</p>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-[28px] bg-white p-12 text-center shadow-sm">
            <p className="text-slate-600">{t('No appointments booked yet.')}</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {appointments.map((appointment, index) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="rounded-[28px] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">{t('Booking ID')}</p>
                      <p className="text-lg font-bold text-slate-900">{appointment._id}</p>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                      <p><strong>{t('Doctor')}:</strong> {appointment.doctorId?.userId?.fullName || 'Doctor'}</p>
                      <p><strong>{t('Specialization')}:</strong> {appointment.doctorId?.specialization || 'General'}</p>
                      <p><strong>{t('Date & Time')}:</strong> {formatDate(appointment.date, i18n.resolvedLanguage)} {appointment.timeSlot}</p>
                      <p><strong>{t('Consultation Fee')}:</strong> Rs. {appointment.doctorId?.consultationFee || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="min-w-[220px] rounded-2xl bg-slate-50 p-4">
                    <p className="mb-2 text-sm"><strong>{t('Status')}:</strong> {appointment.status}</p>
                    <p className="mb-2 text-sm">
                      <strong>{t('Payment Status')}:</strong>{' '}
                      {paymentMap[appointment._id]?.status
                        ? paymentMap[appointment._id].status
                        : appointment.isPaid
                          ? 'Paid'
                          : 'Pending'}
                    </p>
                    <p className="mb-4 text-xs text-slate-500">
                      {paymentMap[appointment._id]?.paymentDate
                        ? `${t('Updated')} ${formatDate(paymentMap[appointment._id].paymentDate, i18n.resolvedLanguage)}`
                        : t('Payment will appear after admin review')}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {appointment.status === 'pending' && (
                        <button className="btn-outline" onClick={() => handleCancel(appointment._id)}>
                          {t('Cancel appointment')}
                        </button>
                      )}
                      {appointment.status === 'confirmed' &&
                        new Date(appointment.date).toDateString() === new Date().toDateString() && (
                          <button className="btn-primary" onClick={handleJoinCall}>
                            {t('Join Video Call')}
                          </button>
                        )}
                      {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                        <button className="btn-secondary" onClick={() => navigate('/prescription')}>
                          {t('View Prescription')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
