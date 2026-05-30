import { Stethoscope } from 'lucide-react';

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
        <Stethoscope size={22} />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight text-slate-950">CareBridge</p>
        <p className="text-xs font-medium text-slate-500">Multilingual appointments</p>
      </div>
    </div>
  );
}
