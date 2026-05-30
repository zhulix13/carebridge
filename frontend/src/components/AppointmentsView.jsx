import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { SectionTitle } from './SectionTitle';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from './Toast';

function todayValue() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

export function AppointmentsView() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [reschedule, setReschedule] = useState({ appointment: null, date: '', selectedSlot: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await api.get('/appointments');
    setAppointments(data);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => {
      setLoading(false);
      setMessage(t('appointments.loadError'));
    });
  }, [t]);

  async function loadSlots(appointment, date) {
    if (!appointment || !date) {
      setAvailableSlots([]);
      return;
    }

    setSlotsLoading(true);
    setAvailableSlots([]);
    try {
      const { data } = await api.get(`/doctors/${appointment.doctor_id}/available-slots`, { params: { slot_date: date } });
      setAvailableSlots(data);
    } catch {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function cancel(id) {
    setMessage('');
    try {
      await api.patch(`/appointments/${id}/cancel`);
      setToast({ type: 'success', title: t('appointments.cancelSuccessTitle'), message: t('appointments.cancelSuccess') });
      await load();
    } catch (err) {
      setToast({ type: 'error', title: t('appointments.actionErrorTitle'), message: err.response?.data?.detail || t('appointments.cancelError') });
    }
  }

  function beginReschedule(appointment) {
    const currentDate = appointment.appointment_date.slice(0, 10);
    setMessage('');
    setReschedule({ appointment, date: currentDate, selectedSlot: '' });
    loadSlots(appointment, currentDate);
  }

  async function submitReschedule() {
    if (!reschedule.appointment || !reschedule.selectedSlot) return;

    setMessage('');
    try {
      await api.patch(`/appointments/${reschedule.appointment.id}/reschedule`, {
        appointment_date: reschedule.selectedSlot,
      });
      setReschedule({ appointment: null, date: '', selectedSlot: '' });
      setAvailableSlots([]);
      setToast({ type: 'success', title: t('appointments.rescheduleSuccessTitle'), message: t('appointments.rescheduleSuccess') });
      await load();
    } catch (err) {
      setToast({ type: 'error', title: t('appointments.actionErrorTitle'), message: err.response?.data?.detail || t('appointments.rescheduleError') });
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        cancelLabel={t('common.close')}
        confirmLabel={t('appointments.confirmCancelAction')}
        message={t('appointments.confirmCancelMessage')}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const next = confirm;
          setConfirm(null);
          if (next?.type === 'cancel') await cancel(next.id);
        }}
        open={confirm?.type === 'cancel'}
        title={t('appointments.confirmCancelTitle')}
      />
      <SectionTitle icon={CalendarDays} title={t('appointments.title')} text={t('appointments.subtitle')} />
      
      <div className="mt-6 grid gap-4">
        {loading ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-8 text-center">
            <p className="text-sm font-semibold text-slate-500">{t('common.loading')}</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-8 text-center">
            <CalendarDays className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-semibold text-slate-500">{t('appointments.empty')}</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <article 
              className="grid gap-4 rounded-xl border border-slate-100 bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 p-5 sm:grid-cols-[1fr_auto] sm:items-center transition duration-200" 
              key={appointment.id}
            >
              <div>
                <p className="font-extrabold text-slate-900 text-base">
                  {new Date(appointment.appointment_date).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {appointment.doctor_name || t('appointments.unknownDoctor')}
                  {appointment.doctor_specialization ? ` - ${appointment.doctor_specialization}` : ''}
                </p>
                <p className="text-sm text-slate-500">{appointment.department_name || t('appointments.unknownDepartment')}</p>
                
                {appointment.reason && (
                  <p className="mt-1.5 text-sm text-slate-700 font-medium">
                    <span className="text-xs uppercase font-bold text-slate-400 mr-1.5">{t('appointments.reason')}:</span>
                    {appointment.reason}
                  </p>
                )}
                
                {appointment.symptoms && (
                  <p className="mt-1 text-sm text-slate-600 italic">
                    <span className="text-xs uppercase font-bold text-slate-400 mr-1.5 not-italic">{t('appointments.notes')}:</span>
                    "{appointment.symptoms}"
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border uppercase tracking-wider ${
                    appointment.status === 'confirmed'
                      ? 'bg-sky-50 text-sky-700 border-sky-100'
                      : appointment.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : appointment.status === 'cancelled'
                      ? 'bg-rose-50 text-rose-700 border-rose-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {t(`appointments.status.${appointment.status}`)}
                  </span>
                  
                  {appointment.detected_language && (
                    <span className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200">
                      {t('appointments.detectedLanguage')}: {appointment.detected_language}
                    </span>
                  )}
                </div>

                {reschedule.appointment?.id === appointment.id && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t('appointments.newDate')}
                    </label>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100/50 sm:w-56"
                      min={todayValue()}
                      onChange={(event) => {
                        const nextDate = event.target.value;
                        setReschedule({ appointment, date: nextDate, selectedSlot: '' });
                        loadSlots(appointment, nextDate);
                      }}
                      type="date"
                      value={reschedule.date}
                    />

                    <div className="mt-3">
                      {slotsLoading ? (
                        <p className="text-sm font-medium text-slate-500">{t('booking.loadingSlots')}</p>
                      ) : availableSlots.length === 0 ? (
                        <p className="text-sm font-medium text-rose-700">{t('booking.noSlots')}</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {availableSlots.map((slot) => (
                            <button
                              className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                                reschedule.selectedSlot === slot.appointment_date
                                  ? 'border-sky-600 bg-sky-600 text-white'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300'
                              }`}
                              key={slot.appointment_date}
                              onClick={() => setReschedule((current) => ({ ...current, selectedSlot: slot.appointment_date }))}
                              type="button"
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50" disabled={!reschedule.selectedSlot} onClick={submitReschedule} type="button">
                        {t('appointments.saveReschedule')}
                      </button>
                      <button className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600" onClick={() => setReschedule({ appointment: null, date: '', selectedSlot: '' })} type="button">
                        {t('appointments.closeReschedule')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <button 
                    className="rounded-xl border border-sky-200 bg-white hover:bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-700 transition duration-200 cursor-pointer shadow-sm" 
                    onClick={() => beginReschedule(appointment)} 
                    type="button"
                  >
                    {t('appointments.reschedule')}
                  </button>
                  <button 
                    className="rounded-xl border border-rose-200 bg-white hover:bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition duration-200 cursor-pointer shadow-sm" 
                    onClick={() => setConfirm({ type: 'cancel', id: appointment.id })} 
                    type="button"
                  >
                    {t('appointments.cancel')}
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {message && (
        <p className="mt-4 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-semibold text-rose-800">
          {message}
        </p>
      )}
    </section>
  );
}
