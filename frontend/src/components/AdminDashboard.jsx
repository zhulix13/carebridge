import React, { useState, useEffect, useCallback } from 'react';

/* Tracks viewport width and re-renders on resize */
function useWindowWidth() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return w;
}
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ClipboardList,
  FolderOpen,
  BrainCircuit,
  LogOut,
  Menu,
  ChevronRight,
  ShieldAlert,
  Users,
  CalendarDays,
  Building2,
  Stethoscope,
  Bell,
  Plus,
  X,
  Check,
  Trash2,
  TrendingUp,
  Activity,
  Languages,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { api } from '../api';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from './Toast';

/* ─── Sidebar nav items ───────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: 'Management',
    items: [
      { id: 'overview',     label: 'Overview',          icon: LayoutDashboard },
      { id: 'appointments', label: 'Appointments',       icon: ClipboardList },
      { id: 'users',        label: 'All Users',          icon: Users },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { id: 'departments',  label: 'Departments',        icon: FolderOpen },
      { id: 'doctors',      label: 'Doctors',            icon: Stethoscope },
      { id: 'logs',         label: 'Language ML Logs',   icon: BrainCircuit },
    ],
  },
];

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
function AdminSidebar({ user, activeId, onNavigate, onLogout, collapsed, onToggle }) {
  const pathMap = {
    overview:     '#/admin',
    appointments: '#/admin/appointments',
    users:        '#/admin/users',
    departments:  '#/admin/departments',
    doctors:      '#/admin/doctors',
    logs:         '#/admin/logs',
  };

  return (
    <aside
      className={`
        h-full flex flex-col bg-slate-900 border-r border-slate-800
        transition-all duration-300 relative
        ${collapsed ? 'w-[68px]' : 'w-56'}
      `}
    >
      {/* Brand header */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="h-8 w-8 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
          <ShieldAlert size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-white truncate">CareBridge</p>
            <p className="text-[9px] text-blue-400 uppercase tracking-widest font-extrabold">Admin Console</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute -right-3 top-[68px] h-6 w-6 items-center justify-center
          rounded-full bg-blue-600 text-white shadow-sm border border-slate-800 cursor-pointer z-50
          hover:bg-blue-500 transition duration-150"
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <ChevronRight size={12} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-4">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(({ id, label, icon: Icon }) => {
                const active = activeId === id;
                return (
                  <button
                    key={id}
                    onClick={() => onNavigate(pathMap[id])}
                    title={collapsed ? label : undefined}
                    className={`
                      w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left
                      transition duration-150 cursor-pointer
                      ${active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span className="text-xs font-bold truncate">{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout footer */}
      <div className="px-2 pb-4 pt-3 border-t border-slate-800 space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <ShieldAlert size={13} className="text-slate-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-white truncate">{user.full_name}</p>
              <p className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5
            text-rose-400 hover:bg-rose-950/20 hover:text-rose-300
            transition duration-150 cursor-pointer ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span className="text-xs font-bold">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

/* ─── Stat card ───────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, delta }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition duration-150">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-extrabold mt-1.5 text-slate-900">{value ?? '—'}</p>
          {delta !== undefined && (
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp size={11} className="text-blue-500" />
              {delta}
            </p>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Icon size={18} />
        </div>
      </div>
    </article>
  );
}

/* ─── Language bar chart ──────────────────────────────────────────────────── */
function LangBar({ code, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const label = { en: 'English', yo: 'Yorùbá', ha: 'Hausa', ig: 'Igbo' }[code] || code.toUpperCase();
  return (
    <div className="grid grid-cols-[80px_1fr_36px] items-center gap-3">
      <span className="text-[11px] font-bold text-slate-600">{label}</span>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-bold text-slate-700 text-right">{pct}%</span>
    </div>
  );
}

/* ─── Status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    pending:   'bg-slate-50 text-slate-700 border-slate-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-100',
    completed: 'bg-blue-600 text-white border-blue-600',
    cancelled: 'bg-slate-100 text-slate-400 border-slate-200',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider whitespace-nowrap ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
}

/* ─── Modal shell ─────────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl animate-[fadeSlideUp_0.25s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-extrabold text-slate-900">{title}</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer transition">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── Small form field ────────────────────────────────────────────────────── */
function FormField({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-[9px] text-slate-400 italic font-medium">{hint}</p>}
    </div>
  );
}
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition font-bold';

/* ══════════════════════════════════════════════════════════════════════════
   Root Admin Dashboard
   ══════════════════════════════════════════════════════════════════════════ */
export function AdminDashboard({ user, logout, activeSubView, onNavigate }) {
  const { i18n, t } = useTranslation();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth >= 768;

  /* ── Data state ── */
  const [stats, setStats]               = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [allUsers, setAllUsers]         = useState([]);
  const [logs, setLogs]                 = useState([]);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [confirm, setConfirm]           = useState(null);

  /* ── Modal state ── */
  const [deptModal, setDeptModal]       = useState(false);
  const [doctorModal, setDoctorModal]   = useState(false);
  const [schedModal, setSchedModal]     = useState(false);
  const [deptForm, setDeptForm]         = useState({ name: '', description: '' });
  const [doctorForm, setDoctorForm]     = useState({ full_name: '', email: '', password: '', phone: '', department_id: '', specialization: '', bio: '', consultation_fee: 5000 });
  const [schedForm, setSchedForm]       = useState({ doctor_id: '', day_of_week: 1, start_time: '09:00', end_time: '17:00', slot_minutes: 30 });

  const showToast = (type, message) => {
    setToast({
      type,
      title: type === 'ok' ? t('admin.toast.successTitle') : t('admin.toast.errorTitle'),
      message,
    });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch all data ── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, apptsRes, docsRes, deptsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/appointments'),
        api.get('/doctors'),
        api.get('/departments'),
        api.get('/users'),
        api.get('/language-detection-logs'),
      ]);
      setStats(statsRes.data);
      setAppointments(apptsRes.data);
      setDoctors(docsRes.data);
      setDepartments(deptsRes.data);
      setAllUsers(usersRes.data);
      setLogs(logsRes.data);
    } catch {
      showToast('err', t('admin.toast.syncError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [activeSubView, loadAll]);

  /* ── Actions ── */
  const requestApptStatusUpdate = (appointmentId, status) => {
    setConfirm({ type: 'appointmentStatus', appointmentId, status });
  };

  const updateApptStatus = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      showToast('ok', t('admin.toast.appointmentStatus', { status: t(`appointments.status.${newStatus}`) }));
      loadAll();
    } catch (err) {
      showToast('err', err.response?.data?.detail || t('admin.toast.statusError'));
    }
  };

  const confirmAppointmentStatus = async () => {
    const appointmentId = confirm?.appointmentId;
    const status = confirm?.status;
    setConfirm(null);
    if (!appointmentId || !status) return;
    await updateApptStatus(appointmentId, status);
  };

  const deleteDoctor = (doctorId) => {
    setConfirm({ type: 'deleteDoctor', doctorId });
  };

  const confirmDeleteDoctor = async () => {
    const doctorId = confirm?.doctorId;
    setConfirm(null);
    if (!doctorId) return;
    try {
      await api.delete(`/doctors/${doctorId}`);
      showToast('ok', t('admin.toast.doctorDeleted'));
      loadAll();
    } catch (err) {
      showToast('err', err.response?.data?.detail || t('admin.toast.doctorDeleteError'));
    }
  };

  const createDept = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departments', deptForm);
      setDeptModal(false);
      setDeptForm({ name: '', description: '' });
      showToast('ok', t('admin.toast.departmentCreated'));
      loadAll();
    } catch (err) { showToast('err', err.response?.data?.detail || t('admin.toast.genericError')); }
  };

  const createDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctors', doctorForm);
      setDoctorModal(false);
      setDoctorForm({ full_name: '', email: '', password: '', phone: '', department_id: '', specialization: '', bio: '', consultation_fee: 5000 });
      showToast('ok', t('admin.toast.doctorCreated'));
      loadAll();
    } catch (err) { showToast('err', err.response?.data?.detail || t('admin.toast.doctorCreateError')); }
  };

  const createSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctor-schedules', {
        ...schedForm,
        day_of_week: parseInt(schedForm.day_of_week),
        slot_minutes: parseInt(schedForm.slot_minutes),
        start_time: schedForm.start_time + ':00',
        end_time: schedForm.end_time + ':00',
        is_active: true,
      });
      setSchedModal(false);
      showToast('ok', t('admin.toast.scheduleCreated'));
    } catch (err) { showToast('err', err.response?.data?.detail || t('admin.toast.genericError')); }
  };

  const SIDEBAR_W = collapsed ? 68 : 224;
  const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const totalLogs = stats?.total_language_logs || 1;

  const titles = {
    overview: 'Admin Overview', appointments: 'Appointment Registry',
    users: 'All Users', departments: 'Departments',
    doctors: 'Doctors & Schedules', logs: 'Language ML Audit',
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        cancelLabel={t('common.cancel')}
        confirmLabel={t('admin.confirmDeleteDoctorAction')}
        message={t('admin.confirmDeleteDoctorMessage')}
        onCancel={() => setConfirm(null)}
        onConfirm={confirmDeleteDoctor}
        open={confirm?.type === 'deleteDoctor'}
        title={t('admin.confirmDeleteDoctorTitle')}
      />
      <ConfirmModal
        cancelLabel={t('common.cancel')}
        confirmLabel={confirm?.status ? t(`admin.appointmentActions.${confirm.status}.confirm`) : ''}
        message={confirm?.status ? t(`admin.appointmentActions.${confirm.status}.message`) : ''}
        onCancel={() => setConfirm(null)}
        onConfirm={confirmAppointmentStatus}
        open={confirm?.type === 'appointmentStatus'}
        title={confirm?.status ? t(`admin.appointmentActions.${confirm.status}.title`) : ''}
        tone={confirm?.status === 'cancelled' ? 'danger' : 'info'}
      />

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-40">
        <AdminSidebar user={user} activeId={activeSubView} onNavigate={onNavigate}
          onLogout={logout} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Mobile slide-in sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300 flex
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AdminSidebar user={user} activeId={activeSubView}
          onNavigate={p => { onNavigate(p); setMobileOpen(false); }}
          onLogout={logout} collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen transition-all duration-300"
        style={{ marginLeft: isDesktop ? SIDEBAR_W : 0 }}>

        {/* Top Navbar Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-white border-b border-slate-200 px-5 py-3.5 shadow-sm">
          <button onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">{titles[activeSubView]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector current={i18n.language} onChange={i18n.changeLanguage} compact />
            
            <button className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer">
              <Bell size={16} />
            </button>
            
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
              <ShieldAlert size={12} className="text-slate-400" />
              Secure Session
            </span>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* ══ OVERVIEW ═══════════════════════════════════════════════════ */}
          {activeSubView === 'overview' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 text-white border border-slate-800 shadow-sm">
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
                <p className="text-[9px] font-extrabold text-blue-400 uppercase tracking-wider mb-2">Hospital Administration Workspace</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  Welcome, {user?.full_name?.split(' ')[0]} 🏥
                </h2>
                <p className="text-sm text-slate-400 mt-3 max-w-xl leading-relaxed font-medium">
                  Manage department registers, clinician profiles, scheduling timelines, and review the real-time multilingual symptom classification engine audits.
                </p>
              </div>

              {/* KPI metrics cards */}
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <StatCard label="Patients Registered" value={stats?.total_patients} icon={Users} delta="System Total" />
                <StatCard label="Clinicians Active" value={stats?.total_doctors} icon={Stethoscope} />
                <StatCard label="Departments" value={stats?.total_departments} icon={Building2} />
                <StatCard label="Appointments" value={stats?.total_appointments} icon={CalendarDays} />
                <StatCard label="Pending Approval" value={stats?.appointments_by_status?.pending} icon={Activity} delta="Action Required" />
              </div>

              {/* Graphical distribution row */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Appointment breakdown card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-4">Consultation Roster Status</p>
                  <div className="space-y-4">
                    {[
                      { label: 'Pending Approval',   key: 'pending' },
                      { label: 'Confirmed Hours', key: 'confirmed' },
                      { label: 'Completed Visits', key: 'completed' },
                      { label: 'Cancelled / Dismissed', key: 'cancelled' },
                    ].map(({ label, key }) => {
                      const val = stats?.appointments_by_status?.[key] || 0;
                      const total = stats?.total_appointments || 1;
                      const pct = Math.round((val / total) * 100);
                      return (
                        <div key={key} className="grid grid-cols-[100px_1fr_60px] items-center gap-3">
                          <span className="text-xs font-bold text-slate-600">{label}</span>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-700 text-right">{val} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Language model distribution card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">AI Language Classifier Audit</p>
                  <p className="text-[10px] text-slate-400 mb-4 font-semibold">Distribution from {stats?.total_language_logs || 0} recent symptom entries</p>
                  <div className="space-y-4">
                    {['en','yo','ha','ig'].map(code => (
                      <LangBar
                        key={code}
                        code={code}
                        count={stats?.language_breakdown?.[code] || 0}
                        total={totalLogs}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ APPOINTMENTS ════════════════════════════════════════════════ */}
          {activeSubView === 'appointments' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Hospital Consultation Roster</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Confirm, cancel, or sign-off registered patient bookings.</p>
                </div>
                <span className="rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-wider self-start sm:self-center">
                  Pending: {stats?.appointments_by_status?.pending ?? 0}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {['Date & Time','Patient Profile','Specialty','Reason / Symptoms','Language','Status','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">No appointments registered.</td></tr>
                    ) : appointments.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5 font-extrabold text-slate-900 whitespace-nowrap">
                          {new Date(a.appointment_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                          {a.patient_id.slice(0,8)}...
                        </td>
                        <td className="px-4 py-3.5 font-extrabold text-slate-700 whitespace-nowrap">
                          {departments.find(d => d.id === a.department_id)?.name || 'General Clinic'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 max-w-[200px] truncate italic font-medium" title={a.symptoms || a.reason}>
                          "{a.symptoms || a.reason || 'No clinical details'}"
                        </td>
                        <td className="px-4 py-3.5">
                          {a.detected_language ? (
                            <span className="rounded-lg bg-blue-50 border border-blue-100 text-blue-600 font-extrabold px-2 py-0.5 uppercase text-[9px] tracking-wider">
                              {a.detected_language}
                            </span>
                          ) : <span className="text-slate-300 font-bold">—</span>}
                        </td>
                        <td className="px-4 py-3.5"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3.5">
                          {a.status !== 'completed' && a.status !== 'cancelled' && (
                            <div className="flex gap-2">
                              {a.status === 'pending' && (
                                <button onClick={() => requestApptStatusUpdate(a.id, 'confirmed')}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-blue-600 hover:bg-slate-50 cursor-pointer transition shadow-sm" title="Confirm">
                                  <Check size={13} />
                                </button>
                              )}
                              {a.status === 'confirmed' && (
                                <button onClick={() => requestApptStatusUpdate(a.id, 'completed')}
                                  className="p-1.5 rounded-lg border border-blue-200 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition shadow-sm" title="Mark Completed">
                                  <Check size={13} />
                                </button>
                              )}
                              <button onClick={() => requestApptStatusUpdate(a.id, 'cancelled')}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-slate-50 cursor-pointer transition shadow-sm" title="Cancel Booking">
                                  <X size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ALL USERS ════════════════════════════════════════════════════ */}
          {activeSubView === 'users' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Hospital User Registry</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">All registered medical staff, patients, and system administrators.</p>
                </div>
                <span className="rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-wider">
                  Total: {allUsers.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {['Full Name','Email Address','Phone Number','Assigned Role','Language','Status'].map(h => (
                        <th key={h} className="px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">No users registered.</td></tr>
                    ) : allUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5 font-extrabold text-slate-900">{u.full_name}</td>
                        <td className="px-4 py-3.5 text-slate-600 font-semibold">{u.email}</td>
                        <td className="px-4 py-3.5 text-slate-500 font-bold">{u.phone || '—'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`rounded px-2 py-0.5 text-[9px] font-extrabold uppercase border tracking-wider
                            ${u.role === 'admin' ? 'bg-slate-900 text-white border-slate-955'
                              : u.role === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded bg-slate-100 border border-slate-200 text-slate-600 font-extrabold px-1.5 py-0.5 uppercase text-[9px] tracking-wider">
                            {u.preferred_language}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold border uppercase tracking-wider
                            ${u.is_active ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ DEPARTMENTS ══════════════════════════════════════════════════ */}
          {activeSubView === 'departments' && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {departments.length} Medical Department{departments.length !== 1 ? 's' : ''}
                </p>
                <button onClick={() => setDeptModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 text-xs font-bold shadow-sm cursor-pointer transition duration-150">
                  <Plus size={14} />New Department
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map(d => (
                  <article key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition duration-150">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Building2 size={16} />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{d.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">{d.description || 'No clinical description registered.'}</p>
                    <p className="mt-4 text-[9px] font-mono text-slate-300 font-semibold uppercase tracking-wider">ID: {d.id.slice(0,12)}...</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ══ DOCTORS ══════════════════════════════════════════════════════ */}
          {activeSubView === 'doctors' && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{doctors.length} Registered Clinician{doctors.length !== 1 ? 's' : ''}</p>
                <div className="flex gap-2">
                  <button onClick={() => setSchedModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold cursor-pointer transition duration-150">
                    <Plus size={14} />Add Schedule
                  </button>
                  <button onClick={() => setDoctorModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 text-xs font-bold shadow-sm cursor-pointer transition duration-150">
                    <Plus size={14} />New Clinician
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {['Clinician Profile','Department','Specialization','Fee (₦)','Registry Status','Action'].map(h => (
                        <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">No clinicians registered.</td></tr>
                    ) : doctors.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <p className="font-extrabold text-slate-900">{d.full_name}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">{d.id.slice(0,8)}...</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-extrabold">{d.department_name}</td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-blue-50 border border-blue-100 text-blue-700 font-extrabold px-2 py-0.5 text-[9px] tracking-wider uppercase">
                            {d.specialization || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-extrabold text-slate-800">₦{d.consultation_fee?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold border uppercase tracking-wider
                            ${d.is_available ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {d.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteDoctor(d.id)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-slate-50 cursor-pointer transition shadow-sm" title="Remove Roster Profile">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ML LOGS ══════════════════════════════════════════════════════ */}
          {activeSubView === 'logs' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">AI Symptom Language Classifier Logs</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Audit log of ML language identification pipeline inputs and classifications.</p>
                </div>
                <span className="rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Languages size={12} />
                  {logs.length} Audit Entries
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {['Logged Symptom Text','Identified Language','Language Code','Clinical Page Source','Audit Timestamp'].map(h => (
                        <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">No audit logs recorded.</td></tr>
                    ) : logs.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5 max-w-[320px] truncate italic text-slate-700 font-medium" title={l.input_text}>
                          "{l.input_text}"
                        </td>
                        <td className="px-4 py-3.5 font-extrabold text-slate-800 capitalize">{l.detected_language}</td>
                        <td className="px-4 py-3.5">
                          <span className="rounded bg-blue-50 border border-blue-100 text-blue-600 font-extrabold px-2 py-0.5 uppercase text-[9px] tracking-wider">
                            {l.i18n_code}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-bold capitalize">{l.source_page || '—'}</td>
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap font-semibold">
                          {new Date(l.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══ Modals ═══════════════════════════════════════════════════════ */}

      {deptModal && (
        <Modal title="Add New Department" onClose={() => setDeptModal(false)}>
          <form onSubmit={createDept} className="space-y-4">
            <FormField label="Department Name">
              <input required className={fieldClass} placeholder="e.g. Nephrology"
                value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} />
            </FormField>
            <FormField label="Description">
              <textarea rows={3} className={`${fieldClass} resize-none font-medium`}
                placeholder="Specialty overview, referral criteria..."
                value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDeptModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer font-sans">Cancel</button>
              <button type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 text-xs font-bold cursor-pointer transition duration-150 font-sans">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {doctorModal && (
        <Modal title="Register Clinician Profile" onClose={() => setDoctorModal(false)}>
          <form onSubmit={createDoctor} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <FormField label="Full Name">
              <input required className={fieldClass} placeholder="Dr. First Last"
                value={doctorForm.full_name} onChange={e => setDoctorForm({ ...doctorForm, full_name: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email Address">
                <input type="email" required className={fieldClass} placeholder="doctor@hospital.com"
                  value={doctorForm.email} onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })} />
              </FormField>
              <FormField label="Password">
                <input type="password" required className={fieldClass} placeholder="••••••••"
                  value={doctorForm.password} onChange={e => setDoctorForm({ ...doctorForm, password: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone Number">
                <input className={fieldClass} placeholder="e.g. 08012345678"
                  value={doctorForm.phone} onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })} />
              </FormField>
              <FormField label="Department">
                <select required className={fieldClass}
                  value={doctorForm.department_id} onChange={e => setDoctorForm({ ...doctorForm, department_id: e.target.value })}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Specialization">
                <input className={fieldClass} placeholder="e.g. Cardiology"
                  value={doctorForm.specialization} onChange={e => setDoctorForm({ ...doctorForm, specialization: e.target.value })} />
              </FormField>
              <FormField label="Fee (₦)">
                <input type="number" required className={fieldClass}
                  value={doctorForm.consultation_fee} onChange={e => setDoctorForm({ ...doctorForm, consultation_fee: parseFloat(e.target.value) })} />
              </FormField>
            </div>
            <FormField label="Bio">
              <textarea rows={2} className={`${fieldClass} resize-none font-medium`}
                placeholder="Brief clinical experience..."
                value={doctorForm.bio} onChange={e => setDoctorForm({ ...doctorForm, bio: e.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDoctorModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer font-sans">Cancel</button>
              <button type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 text-xs font-bold cursor-pointer transition duration-150 font-sans">Register</button>
            </div>
          </form>
        </Modal>
      )}

      {schedModal && (
        <Modal title="Set Doctor Schedule" onClose={() => setSchedModal(false)}>
          <form onSubmit={createSchedule} className="space-y-4">
            <FormField label="Doctor">
              <select required className={fieldClass}
                value={schedForm.doctor_id} onChange={e => setSchedForm({ ...schedForm, doctor_id: e.target.value })}>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            </FormField>
            <FormField label="Day of Week">
              <select required className={fieldClass}
                value={schedForm.day_of_week} onChange={e => setSchedForm({ ...schedForm, day_of_week: e.target.value })}>
                {DAY_NAMES.map((day, i) => <option key={i} value={i}>{day}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Time">
                <input type="time" required className={fieldClass}
                  value={schedForm.start_time} onChange={e => setSchedForm({ ...schedForm, start_time: e.target.value })} />
              </FormField>
              <FormField label="End Time">
                <input type="time" required className={fieldClass}
                  value={schedForm.end_time} onChange={e => setSchedForm({ ...schedForm, end_time: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Slot Size (minutes)">
              <input type="number" required className={fieldClass}
                value={schedForm.slot_minutes} onChange={e => setSchedForm({ ...schedForm, slot_minutes: e.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setSchedModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer font-sans">Cancel</button>
              <button type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 text-xs font-bold cursor-pointer transition duration-150 font-sans">Save Schedule</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
