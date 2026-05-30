export function Metric({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <Icon className="text-sky-600" size={22} />
      <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
    </article>
  );
}
