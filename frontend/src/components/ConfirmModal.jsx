import { AlertTriangle, X } from 'lucide-react';

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  const danger = tone === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div className="flex gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              danger ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'
            }`}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-950">{title}</p>
              {message && <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>}
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-700" onClick={onCancel} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-end gap-2 p-5">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            disabled={loading}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60 ${
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
