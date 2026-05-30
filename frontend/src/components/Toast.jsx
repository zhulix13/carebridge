import { CheckCircle2, X, XCircle } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const ok = toast.type === 'success' || toast.type === 'ok';
  const Icon = ok ? CheckCircle2 : XCircle;

  return (
    <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
        ok ? 'border-emerald-200' : 'border-rose-200'
      }`}>
        <Icon className={ok ? 'text-emerald-600' : 'text-rose-600'} size={20} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{toast.title}</p>
          {toast.message && <p className="mt-1 text-sm text-slate-600">{toast.message}</p>}
        </div>
        <button className="text-slate-400 hover:text-slate-700" onClick={onClose} type="button">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
