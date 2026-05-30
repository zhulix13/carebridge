import { UserRound, Stethoscope, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionTitle } from './SectionTitle';

export function DoctorList({ doctors }) {
  const { t } = useTranslation();
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionTitle icon={Stethoscope} title={t('doctors.title')} text={t('doctors.subtitle')} compact />
      
      <div className="mt-6 grid gap-4">
        {doctors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <UserRound className="mx-auto text-slate-300 mb-2" size={24} />
            <p className="text-xs text-slate-500 font-semibold">{t('doctors.empty')}</p>
          </div>
        ) : (
          doctors.map((doctor) => {
            const initials = doctor.full_name
              ? doctor.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'DR';

            return (
              <article 
                className="group rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:bg-white hover:border-blue-200 hover:shadow-sm" 
                key={doctor.id}
              >
                <div className="flex items-start gap-3">
                  {/* Doctor avatar circle */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs">
                    {initials}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {doctor.full_name}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {doctor.department_name}
                    </p>
                    
                    {doctor.specialization && (
                      <span className="inline-flex mt-2 rounded-lg bg-blue-50/50 border border-blue-100/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {doctor.specialization}
                      </span>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Consultation Fee
                      </span>
                      <span className="text-xs font-extrabold text-slate-800">
                        ₦{doctor.consultation_fee?.toLocaleString() || '5,000'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
}

