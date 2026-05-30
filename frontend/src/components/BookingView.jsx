import { CalendarCheck, Clock, Sparkles, Stethoscope, CalendarDays, Activity, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import { DoctorList } from './DoctorList';
import { Field } from './Field';
import { SectionTitle } from './SectionTitle';
import { LanguageDetectionBanner } from './LanguageDetectionBanner';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from './Toast';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50';
const dayNames = ['common.monday', 'common.tuesday', 'common.wednesday', 'common.thursday', 'common.friday', 'common.saturday', 'common.sunday'];

function todayValue() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

export function BookingView() {
  const { t, i18n } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ department_id: '', doctor_id: '', appointment_day: '', appointment_date: '', reason: '', symptoms: '' });
  const [schedules, setSchedules] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [deptOpen, setDeptOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);

  useEffect(() => {
    const handleClose = () => {
      setDeptOpen(false);
      setDoctorOpen(false);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);
  
  const { detected, detectNow } = useLanguageDetection(form.symptoms, true, {
    debounceMs: 700,
    sourcePage: 'booking_typing',
  });
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    async function load() {
      const [departmentResponse, doctorResponse] = await Promise.all([
        api.get('/departments'),
        api.get('/doctors')
      ]);
      setDepartments(departmentResponse.data);
      setDoctors(doctorResponse.data);
    }
    load().catch(() => setMessage(t('booking.loadError')));
  }, [t]);

  useEffect(() => {
    if (!form.symptoms || form.symptoms.trim().length < 10) {
      setBannerDismissed(false);
    }
  }, [form.symptoms]);

  const filteredDoctors = useMemo(
    () => doctors.filter((doctor) => !form.department_id || doctor.department_id === form.department_id),
    [doctors, form.department_id],
  );

  const selectedDeptName = departments.find(d => d.id === form.department_id)?.name || t('booking.selectDepartment');
  const selectedDoctor = filteredDoctors.find(d => d.id === form.doctor_id);
  const selectedDoctorName = selectedDoctor ? `${selectedDoctor.full_name} (${selectedDoctor.specialization || t('booking.general')})` : t('booking.noDoctors');

  useEffect(() => {
    if (filteredDoctors.length && !filteredDoctors.some((doctor) => doctor.id === form.doctor_id)) {
      setForm((current) => ({ ...current, doctor_id: filteredDoctors[0].id, appointment_date: '' }));
    }
  }, [filteredDoctors, form.doctor_id]);

  useEffect(() => {
    if (!form.doctor_id) {
      setSchedules([]);
      return undefined;
    }

    let active = true;
    api.get('/doctor-schedules', { params: { doctor_id: form.doctor_id } })
      .then(({ data }) => {
        if (active) setSchedules(data.filter((schedule) => schedule.is_active));
      })
      .catch(() => {
        if (active) setSchedules([]);
      });

    return () => {
      active = false;
    };
  }, [form.doctor_id]);

  useEffect(() => {
    if (!form.doctor_id || !form.appointment_day) {
      setAvailableSlots([]);
      return undefined;
    }

    let active = true;
    setSlotsLoading(true);
    setForm((current) => ({ ...current, appointment_date: '' }));

    api.get(`/doctors/${form.doctor_id}/available-slots`, { params: { slot_date: form.appointment_day } })
      .then(({ data }) => {
        if (active) setAvailableSlots(data);
      })
      .catch(() => {
        if (active) setAvailableSlots([]);
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form.doctor_id, form.appointment_day]);

  async function bookAppointment() {
    setMessage('');
    setLoading(true);
    try {
      const finalDetection = form.symptoms.trim().length >= 10
        ? await detectNow(form.symptoms, { shouldLog: true, sourcePage: 'booking_submit' })
        : detected;
      await api.post('/appointments', {
        doctor_id: form.doctor_id,
        department_id: form.department_id,
        appointment_date: form.appointment_date,
        reason: form.reason,
        symptoms: form.symptoms,
        detected_language: finalDetection?.detected_language || null,
        language_source: finalDetection?.detected_language ? 'auto' : 'manual',
      });
      setToast({ type: 'success', title: t('booking.toastSuccessTitle'), message: t('booking.success') });
      setForm((current) => ({ ...current, appointment_day: '', appointment_date: '', reason: '', symptoms: '' }));
      setAvailableSlots([]);
      setBannerDismissed(false);
    } catch (err) {
      setToast({ type: 'error', title: t('booking.toastErrorTitle'), message: err.response?.data?.detail || t('booking.error') });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    setConfirmOpen(true);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        cancelLabel={t('common.cancel')}
        confirmLabel={loading ? t('common.loading') : t('booking.confirmSubmit')}
        loading={loading}
        message={t('booking.confirmMessage')}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={bookAppointment}
        open={confirmOpen}
        title={t('booking.confirmTitle')}
        tone="info"
      />

      {/* Dynamic Language Switcher Toast/Banner */}
      {!bannerDismissed && detected && detected.i18n_code && detected.i18n_code !== i18n.language && (
        <LanguageDetectionBanner
          detectedCode={detected.i18n_code}
          currentCode={i18n.language}
          onAccept={(code) => {
            i18n.changeLanguage(code);
            setBannerDismissed(true);
          }}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Structured Patient Clinical Planner */}
      <section className="space-y-6">
        
        {/* Header summary panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionTitle icon={CalendarCheck} title={t('booking.title')} text={t('booking.subtitle')} />
        </div>

        <form onSubmit={submit} className="space-y-6">
          
          {/* Step 1: Clinical Specialization Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-extrabold text-blue-600">1</span>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Clinical Speciality</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('booking.department')}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeptOpen(!deptOpen);
                      setDoctorOpen(false);
                    }}
                    className={`${inputClass} flex items-center justify-between text-left cursor-pointer hover:border-blue-300 font-bold`}
                  >
                    <span className="truncate">{selectedDeptName}</span>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${deptOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {deptOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white py-1 shadow-lg max-h-60 overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, department_id: '', doctor_id: '', appointment_day: '', appointment_date: '' });
                          setDeptOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {t('booking.selectDepartment')}
                      </button>
                      {departments.map((department) => (
                        <button
                          key={department.id}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, department_id: department.id, doctor_id: '', appointment_day: '', appointment_date: '' });
                            setDeptOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors ${
                            form.department_id === department.id 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {department.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              
              <Field label={t('booking.doctor')}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDoctorOpen(!doctorOpen);
                      setDeptOpen(false);
                    }}
                    className={`${inputClass} flex items-center justify-between text-left cursor-pointer hover:border-blue-300 font-bold`}
                  >
                    <span className="truncate">{selectedDoctorName}</span>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${doctorOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {doctorOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white py-1 shadow-lg max-h-60 overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
                      {filteredDoctors.length === 0 ? (
                        <div className="px-4 py-3 text-xs font-bold text-slate-400 text-center">
                          {t('booking.noDoctors')}
                        </div>
                      ) : (
                        filteredDoctors.map((doctor) => (
                          <button
                            key={doctor.id}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, doctor_id: doctor.id, appointment_day: '', appointment_date: '' });
                              setDoctorOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors ${
                              form.doctor_id === doctor.id 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {doctor.full_name} ({doctor.specialization || t('booking.general')})
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </Field>
            </div>
          </div>

          {/* Step 2: Date & Available Scheduling Slots */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-extrabold text-blue-600">2</span>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Date & Available Hours</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('booking.date')}>
                <input className={inputClass} type="date" min={todayValue()} value={form.appointment_day} onChange={(event) => setForm({ ...form, appointment_day: event.target.value, appointment_date: '' })} required />
              </Field>
              
              <Field label={t('booking.reason')}>
                <input className={inputClass} placeholder={t('booking.reasonPlaceholder')} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
              </Field>
            </div>

            {/* Doctor availability timeline info box */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Clock size={15} className="text-blue-600" />
                {t('booking.availableHours')}
              </div>

              {schedules.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {schedules.map((schedule) => (
                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 inline-flex items-center gap-1.5" key={schedule.id}>
                      <CalendarDays size={12} className="text-blue-500" />
                      {t(dayNames[schedule.day_of_week])}: {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                    </span>
                  ))}
                </div>
              )}

              {/* Time slot picker workspace */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                {!form.doctor_id || !form.appointment_day ? (
                  <p className="text-xs font-semibold text-slate-400 italic">{t('booking.pickDateForSlots')}</p>
                ) : slotsLoading ? (
                  <p className="text-xs font-semibold text-slate-500 animate-pulse">{t('booking.loadingSlots')}</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs font-bold text-rose-600">{t('booking.noSlots')}</p>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select Consultation Hour</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {availableSlots.map((slot) => (
                        <button
                          className={`rounded-lg border px-3 py-2.5 text-xs font-bold transition duration-150 cursor-pointer ${
                            form.appointment_date === slot.appointment_date
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50/50'
                          }`}
                          key={slot.appointment_date}
                          onClick={() => setForm({ ...form, appointment_date: slot.appointment_date })}
                          type="button"
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Diagnostic Symptom Notes & Translation ML Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-extrabold text-blue-600">3</span>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Clinical Symptoms & Language Profiling</h2>
            </div>

            <Field label={t('booking.symptoms')}>
              <textarea 
                className={`${inputClass} resize-none`} 
                rows="5" 
                value={form.symptoms} 
                onChange={(event) => setForm({ ...form, symptoms: event.target.value })} 
                placeholder={t('booking.symptomsPlaceholder')} 
              />
            </Field>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 mt-2">
              {/* Clinical Language detector logger */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Sparkles size={14} className="text-blue-500" />
                {detected?.detected_language ? (
                  <span className="text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
                    {t('booking.detected')}: <span className="font-extrabold uppercase bg-blue-600 text-white rounded px-1.5 py-0.5 text-[10px]">{detected.detected_language}</span>
                  </span>
                ) : (
                  <span className="italic text-slate-400 font-medium">{t('booking.waiting')}</span>
                )}
              </div>
              
              <button 
                className="rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-6 py-3.5 text-xs font-bold text-white shadow-sm transition duration-150 cursor-pointer disabled:opacity-60 shrink-0" 
                disabled={loading || !form.appointment_date} 
                type="submit"
              >
                {loading ? t('common.loading') : t('booking.submit')}
              </button>
            </div>
          </div>
        </form>

        {message && (
          <p className={`rounded-xl px-4 py-3 text-xs font-bold border leading-normal ${
            message === t('booking.success')
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
              : 'bg-rose-50 text-rose-800 border-rose-100'
          }`}>
            {message}
          </p>
        )}
      </section>

      {/* Right Column: Expert Clinician Profiles */}
      <DoctorList doctors={filteredDoctors} />
    </div>
  );
}

