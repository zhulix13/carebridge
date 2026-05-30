import { Activity, CalendarCheck, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Navigation({ activeView, onChange }) {
  const { t } = useTranslation();
  const items = [
    { id: 'home', label: t('nav.home'), icon: Activity },
    { id: 'book', label: t('nav.book'), icon: CalendarCheck },
    { id: 'appointments', label: t('nav.appointments'), icon: CalendarDays },
  ];
  return (
    <nav className="grid gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeView === item.id;
        return (
          <button
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition-all duration-200 ${
              active
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-900/10'
                : 'text-slate-700 hover:bg-sky-50/50 hover:text-sky-700'
            }`}
            key={item.id}
            onClick={() => onChange(item.id)}
            type="button"
          >
            <Icon size={17} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
