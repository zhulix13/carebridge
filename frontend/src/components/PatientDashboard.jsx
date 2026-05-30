import React, { useState, useEffect } from "react";

/* Tracks viewport width and re-renders on resize */
function useWindowWidth() {
  const [w, setW] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  UserCircle2,
  LogOut,
  Menu,
  ChevronRight,
  Heart,
  Clock,
  Sparkles,
  FileText,
  Bell,
} from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { BookingView } from "./BookingView";
import { AppointmentsView } from "./AppointmentsView";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "book", label: "Book Appointment", icon: CalendarCheck },
  { id: "appointments", label: "My Appointments", icon: CalendarDays },
  { id: "profile", label: "My Profile", icon: UserCircle2 },
];

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({
  user,
  activeId,
  onNavigate,
  onLogout,
  collapsed,
  onToggle,
}) {
  const { t } = useTranslation();
  return (
    <aside
      className={`
        h-full flex flex-col
        bg-slate-900 border-r border-slate-800 transition-all duration-300 relative
        ${collapsed ? "w-[68px]" : "w-56"}
      `}
    >
      {/* Brand */}
      <div
        className={`flex items-center gap-2.5 px-4 py-5 border-b border-slate-800
        ${collapsed ? "justify-center" : ""}`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm text-white">
          <Heart size={16} className="fill-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-white leading-tight truncate">
              CareBridge
            </p>
            <p className="text-[9px] text-blue-400 uppercase tracking-widest font-extrabold truncate">
              Hospital Portal
            </p>
          </div>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute -right-3 top-[68px] h-6 w-6 items-center justify-center
          rounded-full bg-blue-600 text-white shadow-sm border border-slate-800 cursor-pointer z-50
          hover:bg-blue-500 transition duration-150"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronRight
          size={12}
          className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
        />
      </button>

      {/* Nav section */}
      {!collapsed && (
        <p className="px-4 pt-5 pb-1.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
          {t('nav.menu')}
        </p>
      )}
      {collapsed && <div className="pt-5" />}

      <nav className="flex-1 px-2 overflow-y-auto space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeId === id;
          const path =
            id === "overview"
              ? "#/patient"
              : id === "book"
                ? "#/book"
                : id === "appointments"
                  ? "#/my-appointments"
                  : "#/profile";
          return (
            <button
              key={id}
              onClick={() => onNavigate(path)}
              title={collapsed ? t(`nav.${id}`) : undefined}
              className={`
                w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition duration-150 cursor-pointer group
                ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && (
                <span className="text-xs font-bold truncate">{t(`nav.${id}`)}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-2 pb-4 border-t border-slate-800 pt-3 space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <UserCircle2 size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-white truncate">
                {user.full_name}
              </p>
              <p className="text-[9px] text-slate-500 capitalize font-semibold">
                {user.role}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? t('nav.logout') : undefined}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-rose-400
            hover:bg-rose-950/20 hover:text-rose-300 transition duration-150 cursor-pointer
            ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span className="text-xs font-bold">{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}

/* ─── Overview page ───────────────────────────────────────────────────────── */
function Overview({ user }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Hero gradient card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 text-white border border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold text-blue-400 border border-blue-500/20 mb-4">
            <Sparkles size={11} />
            {t('patient.systemTitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {t('patient.greeting')}, {user?.full_name?.split(" ")[0]} 👋
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-xl leading-relaxed font-medium">
            {t('patient.systemDesc')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-center">
              <p className="text-lg font-extrabold text-white">4</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                {t('patient.languages')}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-center">
              <p className="text-lg font-extrabold text-white">10+</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                {t('patient.departments')}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-center">
              <p className="text-lg font-extrabold text-white">24/7</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                {t('patient.support')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info cards row - fully responsive and clinical */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Wellness */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition duration-150">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Heart size={16} />
            </div>
            <p className="text-sm font-extrabold text-slate-900">
              {t('patient.wellnessTitle')}
            </p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            {t('patient.wellnessDesc')}
          </p>
          <p className="mt-4 text-[9px] font-extrabold text-blue-600 uppercase tracking-wider">
            {t('patient.clinicalTeam')}
          </p>
        </div>

        {/* Clinic Hours */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition duration-150">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Clock size={16} />
            </div>
            <p className="text-sm font-extrabold text-slate-900">
              {t('patient.operatingHours')}
            </p>
          </div>
          <div className="space-y-2.5 text-xs text-slate-500 font-semibold">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-700">{t('patient.outpatientClinic')}</span>
              <span>{t('patient.monFriHours')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-700">{t('patient.pediatricClinic')}</span>
              <span>{t('patient.tueThuHours')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">{t('patient.emergencyCare')}</span>
              <span className="text-blue-600 font-extrabold">{t('patient.hours247')}</span>
            </div>
          </div>
        </div>

        {/* AI Feature */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition duration-150 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileText size={16} />
            </div>
            <p className="text-sm font-extrabold text-slate-900">
              {t('patient.langDetectionTitle')}
            </p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            {t('patient.langDetectionDesc')}
          </p>
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {["EN", "YO", "HA", "IG"].map((c) => (
              <span
                key={c}
                className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[9px] font-extrabold text-slate-500"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile page ────────────────────────────────────────────────────────── */
function ProfileView({ user }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    phone: user?.phone || "",
    preferred_language: user?.preferred_language || "en",
  });
  const [msg, setMsg] = useState("");
  const langLabels = { en: "English", yo: "Yorùbá", ha: "Hausa", ig: "Igbo" };

  const save = (e) => {
    e.preventDefault();
    i18n.changeLanguage(form.preferred_language);
    setMsg(t('patient.savePreferencesSuccess'));
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="max-w-xl animate-[fadeIn_0.2s_ease-out]">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header strip */}
        <div className="bg-slate-900 px-6 py-6 text-white border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <UserCircle2 size={24} className="text-slate-300" />
            </div>
            <div>
              <p className="text-base font-extrabold leading-tight">
                {user?.full_name}
              </p>
              <p className="text-xs text-slate-400 capitalize font-bold mt-0.5">
                {user?.role} · {user?.email}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={save} className="p-6 space-y-5">
          {/* Read-only fields */}
          {[
            { label: t('auth.fullName'), value: user?.full_name },
            { label: t('auth.email'), value: user?.email },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                {f.label}
              </label>
              <input
                disabled
                value={f.value || ""}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
          ))}

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              {t('auth.phone')}
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition"
              placeholder="+234..."
            />
          </div>

          {/* Language Selection Dropdown-like Buttons */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              {t('patient.preferredLanguage')}
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(langLabels).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setForm({ ...form, preferred_language: code })}
                  className={`rounded-xl px-4 py-2 text-xs font-bold border transition cursor-pointer
                    ${
                      form.preferred_language === code
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {msg && <p className="text-xs font-bold text-blue-600">{msg}</p>}
            <button
              type="submit"
              className="ml-auto rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition duration-150 cursor-pointer"
            >
              {t('patient.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Root Patient Dashboard ──────────────────────────────────────────────── */
export function PatientDashboard({ user, logout, activeSubView, onNavigate }) {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth >= 768;
  const SIDEBAR_W = collapsed ? 68 : 224; // px

  const titles = {
    overview: t('nav.overview'),
    book: t('nav.book'),
    appointments: t('nav.appointments'),
    profile: t('nav.profile'),
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Desktop Sidebar (always visible on desktop) ── */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-40">
        <Sidebar
          user={user}
          activeId={activeSubView}
          onNavigate={onNavigate}
          onLogout={logout}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300 flex
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          user={user}
          activeId={activeSubView}
          onNavigate={(p) => {
            onNavigate(p);
            setMobileOpen(false);
          }}
          onLogout={logout}
          collapsed={false}
          onToggle={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Main Workspace Area ── */}
      <div
        className="flex flex-col flex-1 min-w-0 min-h-screen transition-all duration-300"
        style={{ marginLeft: isDesktop ? SIDEBAR_W : 0 }}
      >
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-white border-b border-slate-200 px-5 py-3.5 shadow-sm">
          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <Menu size={18} />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
              {titles[activeSubView] || "Patient Portal"}
            </h1>
          </div>

          {/* Right Header Navigation Panel */}
          <div className="flex items-center gap-2">
            <LanguageSelector
              current={i18n.language}
              onChange={i18n.changeLanguage}
              compact
            />

            <button className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer relative">
              <Bell size={16} />
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                <UserCircle2 size={13} className="text-white" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-700 max-w-[120px] truncate">
                {user?.full_name}
              </span>
              <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeSubView === "overview" && <Overview user={user} />}
          {activeSubView === "book" && <BookingView />}
          {activeSubView === "appointments" && <AppointmentsView />}
          {activeSubView === "profile" && <ProfileView user={user} />}
        </main>
      </div>
    </div>
  );
}
