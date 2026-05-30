export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      {children}
    </label>
  );
}
