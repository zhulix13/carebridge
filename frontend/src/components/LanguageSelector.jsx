export function LanguageSelector({ current, onChange, compact = false }) {
  const languages = [
    ['en', 'EN'],
    ['yo', 'YO'],
    ['ha', 'HA'],
    ['ig', 'IG'],
  ];
  return (
    <div className={`flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 ${compact ? 'text-[10px]' : ''}`}>
      {languages.map(([code, label]) => (
        <button
          className={`rounded-md px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-bold transition-all duration-200 ${
            current === code
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-900/10'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
          key={code}
          onClick={() => onChange(code)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
