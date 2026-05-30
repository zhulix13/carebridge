import { Activity, CalendarDays, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Metric } from './Metric';

export function DashboardHome({ user }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-sky-600">{t('dashboard.welcome')}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{user.full_name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t('dashboard.summary')}</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={CalendarDays} label={t('dashboard.bookFast')} value={t('dashboard.bookFastValue')} />
        <Metric icon={Languages} label={t('dashboard.languageAware')} value={t('dashboard.languageAwareValue')} />
        <Metric icon={Activity} label={t('dashboard.realtime')} value={t('dashboard.realtimeValue')} />
      </div>
    </div>
  );
}
