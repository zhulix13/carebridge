import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './hooks/useAuth';
import { PublicHome } from './components/PublicHome';
import { AuthScreen } from './components/AuthScreen';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminDashboard } from './components/AdminDashboard';

/* Patient sub-views */
const PATIENT_ROUTES = {
  '#/patient':           'overview',
  '#/book':              'book',
  '#/my-appointments':   'appointments',
  '#/notifications':      'notifications',
  '#/profile':           'profile',
};

/* Admin sub-views */
const ADMIN_ROUTES = {
  '#/admin':               'overview',
  '#/admin/appointments':  'appointments',
  '#/admin/users':         'users',
  '#/admin/departments':   'departments',
  '#/admin/doctors':       'doctors',
  '#/admin/logs':          'logs',
};

function App() {
  const { user, isLoggedIn, isAdmin, isPatient, login, logout } = useAuth();
  const [hash, setHash] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (target) => {
    window.location.hash = target;
    setHash(target);
  };

  /* Auto-redirect guards */
  useEffect(() => {
    if (!isLoggedIn) {
      const isProtected = Object.keys(PATIENT_ROUTES).includes(hash) || Object.keys(ADMIN_ROUTES).includes(hash);
      if (isProtected) navigate('#/login');
      return;
    }

    /* Authenticated: redirect away from public auth pages */
    if (hash === '#/login' || hash === '#/register') {
      navigate(isAdmin ? '#/admin' : '#/patient');
      return;
    }

    /* Role cross-access guards */
    if (hash.startsWith('#/admin') && !isAdmin) { navigate('#/patient'); return; }
    if (Object.keys(PATIENT_ROUTES).includes(hash) && isAdmin) { navigate('#/admin'); return; }
  }, [isLoggedIn, isAdmin, isPatient, hash]);

  /* ── Render ── */

  /* Auth screens */
  if (hash === '#/login' && !isLoggedIn) {
    return <AuthScreen type="login" onSwitch={() => navigate('#/register')}
      onAuth={data => { login(data); navigate(data.user.role === 'admin' ? '#/admin' : '#/patient'); }} />;
  }
  if (hash === '#/register' && !isLoggedIn) {
    return <AuthScreen type="register" onSwitch={() => navigate('#/login')}
      onAuth={data => { login(data); navigate('#/patient'); }} />;
  }

  /* Admin portal */
  if (hash.startsWith('#/admin') && isLoggedIn && isAdmin) {
    const subView = ADMIN_ROUTES[hash] || 'overview';
    return <AdminDashboard user={user} logout={() => { logout(); navigate('#/'); }}
      activeSubView={subView} onNavigate={navigate} />;
  }

  /* Patient portal */
  if (Object.keys(PATIENT_ROUTES).includes(hash) && isLoggedIn && isPatient) {
    const subView = PATIENT_ROUTES[hash] || 'overview';
    return <PatientDashboard user={user} logout={() => { logout(); navigate('#/'); }}
      activeSubView={subView} onNavigate={navigate} />;
  }

  /* Public homepage */
  return <PublicHome user={user} onNavigate={navigate} />;
}

export default App;
