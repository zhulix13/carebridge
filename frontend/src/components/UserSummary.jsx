import { UserRound } from 'lucide-react';

export function UserSummary({ user }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm border border-slate-100">
          <UserRound size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-950">{user.full_name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
