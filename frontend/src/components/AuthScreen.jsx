import { ShieldCheck, ArrowRight, Languages, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { Brand } from './Brand';
import { Field } from './Field';
import { LanguageSelector } from './LanguageSelector';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50';

export function AuthScreen({ type, onSwitch, onAuth }) {
  const { t, i18n } = useTranslation();
  const isLogin = type === 'login';
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [symptomIndex, setSymptomIndex] = useState(0);

  const showcaseSymptoms = [
    { lang: 'English', text: 'I have a severe headache and high body temperature.', code: 'en' },
    { lang: 'Yorùbá', text: 'Mo ni iba ati efori latowuro.', code: 'yo' },
    { lang: 'Hausa', text: 'Ina da zazzabi da ciwon kai tun safe.', code: 'ha' },
    { lang: 'Igbo', text: 'Isi na-awa m nke ukwuu kemgbe ụtụtụ.', code: 'ig' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSymptomIndex((prev) => (prev + 1) % showcaseSymptoms.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(endpoint, payload);
      onAuth(data);
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Top Header with Compact Language Selection for non-English speakers */}
      <header className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <LanguageSelector current={i18n.language} onChange={i18n.changeLanguage} compact={false} />
      </header>

      {/* Main visual wrapper */}
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden grid lg:grid-cols-[1fr_1fr] min-h-[600px] animate-[fadeIn_0.3s_ease-out]">
        
        {/* Left Side: Auth Form */}
        <section className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
          <div>
            <Brand />
            
            <div className="mt-8">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
              </h1>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
              </p>
            </div>

            <form className="mt-8 grid gap-4" onSubmit={submit}>
              {!isLogin && (
                <Field label={t('auth.fullName')}>
                  <input className={inputClass} value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required placeholder="e.g. John Doe" />
                </Field>
              )}
              <Field label={t('auth.email')}>
                <input className={inputClass} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required placeholder="you@hospital.com" />
              </Field>
              {!isLogin && (
                <Field label={t('auth.phone')}>
                  <input className={inputClass} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="e.g. +234 800 000 0000" />
                </Field>
              )}
              <Field label={t('auth.password')}>
                <input className={inputClass} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} placeholder="••••••••" />
              </Field>

              {error && (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 border border-rose-100 leading-normal">
                  {String(error)}
                </p>
              )}

              <button className="mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition duration-150 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2" disabled={loading} type="submit">
                {loading ? t('common.loading') : isLogin ? t('auth.login') : t('auth.register')}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition duration-150 cursor-pointer text-left" onClick={onSwitch} type="button">
              {isLogin ? t('auth.needAccount') : t('auth.haveAccount')}
            </button>
            <span className="text-xs text-slate-400 font-semibold">CareBridge v1.4</span>
          </div>
        </section>

        {/* Right Side: Professional Hospital Clinical Roster & Translation Preview */}
        <section className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 lg:p-12 text-white border-l border-slate-800 relative">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />
          
          <div className="relative space-y-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400">
              <ShieldCheck size={26} />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight">{t('auth.sideTitle')}</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{t('auth.sideText')}</p>
            </div>

            {/* Premium Slate-Blue Symptom Carousel Demonstration */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 shadow-inner space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Languages size={15} className="text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Language Classification active</span>
                </div>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <div className="space-y-3">
                {showcaseSymptoms.map((item, idx) => {
                  const isActive = idx === symptomIndex;
                  return (
                    <div 
                      key={item.lang} 
                      className={`flex items-center justify-between rounded-lg p-3 transition-all duration-300 border ${
                        isActive 
                          ? 'bg-blue-600/10 border-blue-500/30' 
                          : 'bg-slate-900/40 border-transparent opacity-40'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[11px] font-bold text-slate-400">{item.lang}</p>
                        <p className="text-xs text-slate-200 mt-1 italic truncate font-medium">"{item.text}"</p>
                      </div>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Standard compliance block */}
          <div className="relative mt-8 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
              <span>Secure Patient Protocol</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
              <span>Clinical Registry System</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

