export function SectionTitle({ icon: Icon, title, text, compact = false }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
        <Icon size={compact ? 18 : 21} />
      </div>
      <div>
        <h1 className={`${compact ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-slate-950`}>{title}</h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
