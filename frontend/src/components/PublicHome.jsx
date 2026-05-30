import React from 'react';
import { useTranslation } from 'react-i18next';
import { Brand } from './Brand';
import { LanguageSelector } from './LanguageSelector';
import { ArrowRight, ShieldCheck, Stethoscope, Heart, Languages } from 'lucide-react';

export function PublicHome({ user, onNavigate }) {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans leading-normal">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 border-b border-slate-200/80 transition-all duration-300">
        <div className="mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
          <Brand />
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LanguageSelector current={i18n.language} onChange={i18n.changeLanguage} compact />
            
            {user ? (
              <button
                onClick={() => onNavigate(user.role === 'admin' ? '#/admin' : '#/patient')}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition duration-150 cursor-pointer"
                type="button"
              >
                {t('home.goToDashboard')}
                <ArrowRight size={15} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('#/login')}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition duration-150 cursor-pointer"
                  type="button"
                >
                  {t('auth.login')}
                </button>
                <button
                  onClick={() => onNavigate('#/register')}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition duration-150 cursor-pointer"
                  type="button"
                >
                  {t('home.createAccount')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pb-24 lg:pt-20">
        {/* Soft abstract blue glowing background gradient for premium touch */}
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-blue-100/20 blur-3xl" />
        <div className="absolute top-1/3 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-slate-100/40 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-[fadeIn_0.3s_ease-out]">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Hero text content */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <span className="inline-flex max-w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100 mb-6">
                <Heart size={12} className="text-blue-500 fill-blue-500" />
                {t('home.stateOfArt')}
              </span>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1] sm:leading-[1.15]">
                {t('home.title')}
              </h1>
              
              <p className="mt-6 text-base leading-relaxed text-slate-500 sm:text-lg lg:text-xl max-w-2xl font-medium">
                {t('home.subtitle')}
              </p>
              
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {user ? (
                  <button
                    onClick={() => onNavigate(user.role === 'admin' ? '#/admin' : '#/patient')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition duration-150 cursor-pointer"
                    type="button"
                  >
                    {t('home.goToDashboard')}
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('#/register')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition duration-150 cursor-pointer"
                      type="button"
                    >
                      {t('home.bookNow')}
                      <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => onNavigate('#/login')}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 transition duration-150 cursor-pointer"
                      type="button"
                    >
                      {t('auth.login')}
                    </button>
                  </>
                )}
              </div>

              {/* Dynamic stats banner */}
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8 max-w-xl">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{t('home.departmentsCount')}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t('home.departmentsLabel')}</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{t('home.languagesCount')}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t('home.languagesLabel')}</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{t('home.secureCount')}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t('home.secureLabel')}</p>
                </div>
              </div>
            </div>

            {/* Premium Multilingual Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-2xl -z-10" />
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md relative backdrop-blur-sm">
                <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-xl -translate-y-12 translate-x-12" />
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Languages size={18} className="text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">{t('home.aiActive')}</span>
                    </div>
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-[9px] text-blue-400 font-extrabold uppercase tracking-wider">{t('home.instantAdaptation')}</p>
                    <h3 className="text-base font-extrabold mt-1 text-white">{t('home.describeSymptomsComfortably')}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2 font-medium">
                      {t('home.describeSymptomsDesc')}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-2.5">
                    {[
                      { lang: t('languages.en'), text: 'I have a severe headache since morning.', code: 'en' },
                      { lang: t('languages.yo'), text: 'Mo ni iba ati efori latowuro.', code: 'yo' },
                      { lang: t('languages.ha'), text: 'Ina da zazzabi da ciwon kai tun safe.', code: 'ha' },
                      { lang: t('languages.ig'), text: 'Isi na-awa m nke ukwuu kemgbe ụtụtụ.', code: 'ig' }
                    ].map((item) => (
                      <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 p-3 transition duration-150" key={item.code}>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-blue-400">{item.lang}</span>
                          <span className="text-[11px] text-slate-300 truncate mt-0.5 max-w-[200px] italic font-semibold">"{item.text}"</span>
                        </div>
                        <span className="rounded bg-blue-500/20 px-2 py-1 text-[9px] font-extrabold text-blue-400 uppercase tracking-wider">{item.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Structured Hospital Features Grid */}
      <section className="bg-white border-y border-slate-200 py-16 sm:py-20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
              {t('home.designedForHighQuality')}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-500 font-semibold">
              {t('home.designedDesc')}
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:border-blue-200 hover:bg-white transition-all duration-150">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Stethoscope size={24} />
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-900">{t('home.featureSpecialtiesTitle')}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold">
                {t('home.featureSpecialtiesDesc')}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:border-blue-200 hover:bg-white transition-all duration-150">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Languages size={24} />
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-900">{t('home.featureLanguageTitle')}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold">
                {t('home.featureLanguageDesc')}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:border-blue-200 hover:bg-white transition-all duration-150">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-900">{t('home.featureSecurityTitle')}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold">
                {t('home.featureSecurityDesc')}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-8 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>{t('home.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
