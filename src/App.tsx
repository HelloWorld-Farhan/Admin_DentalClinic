import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ToastNotification, { ToastMessage } from './components/ToastNotification';
import { RotateCw } from 'lucide-react';

// Lazy-loaded routes for ultra-fast, lightweight bundle size & smooth navigation
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Doctors = lazy(() => import('./pages/Doctors'));
const Patients = lazy(() => import('./pages/Patients').then((m) => ({ default: m.Patients })));
const Reception = lazy(() => import('./pages/Reception').then((m) => ({ default: m.Reception })));
const Billing = lazy(() => import('./pages/Billing').then((m) => ({ default: m.Billing })));
const Laboratory = lazy(() => import('./pages/Laboratory').then((m) => ({ default: m.Laboratory })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then((m) => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));

// Sleek, modern healthcare loading fallback
function WorkspaceLoader() {
  return (
    <div className="flex items-center justify-center min-h-[360px] w-full p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-teal-600/10 border border-teal-500/20 flex items-center justify-center shadow-xs">
          <RotateCw className="w-5 h-5 text-teal-600 animate-spin" />
        </div>
        <span className="text-xs font-bold text-slate-500 tracking-wide">
          Loading Clinical Module...
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_auth');
  };

  const handleNotify = (
    title: string,
    message: string,
    type: 'critical' | 'financial' | 'triage' | 'system'
  ) => {
    const toastType: 'success' | 'error' | 'info' =
      type === 'critical' ? 'error' : type === 'financial' ? 'info' : 'success';
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type: toastType, title, description: message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  return (
    <BrowserRouter>
      <ToastNotification toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      <Suspense fallback={<WorkspaceLoader />}>
        <Routes>
          {/* Auth routes - Always opens firstly when accessing portal */}
          <Route path="/login" element={<Login onNotify={handleNotify} onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<Signup onNotify={handleNotify} onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/forgot-password" element={<ForgotPassword onNotify={handleNotify} />} />

          {/* Protected Admin App under Layout - Only accessible after Login */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Dashboard onNotify={handleNotify} />} />
            <Route path="doctors" element={<Doctors onNotify={handleNotify} />} />
            <Route path="patients" element={<Patients onNotify={handleNotify} />} />
            <Route path="reception" element={<Reception onNotify={handleNotify} />} />
            <Route path="billing" element={<Billing onNotify={handleNotify} />} />
            <Route path="laboratory" element={<Laboratory onNotify={handleNotify} />} />
          </Route>

          {/* Direct URL Aliases to match Stitch paths */}
          <Route path="/doctors" element={isAuthenticated ? <Navigate to="/dashboard/doctors" replace /> : <Navigate to="/login" replace />} />
          <Route path="/patients" element={isAuthenticated ? <Navigate to="/dashboard/patients" replace /> : <Navigate to="/login" replace />} />
          <Route path="/reception" element={isAuthenticated ? <Navigate to="/dashboard/reception" replace /> : <Navigate to="/login" replace />} />
          <Route path="/receptionists" element={isAuthenticated ? <Navigate to="/dashboard/reception" replace /> : <Navigate to="/login" replace />} />
          <Route path="/billing" element={isAuthenticated ? <Navigate to="/dashboard/billing" replace /> : <Navigate to="/login" replace />} />
          <Route path="/billing-team" element={isAuthenticated ? <Navigate to="/dashboard/billing" replace /> : <Navigate to="/login" replace />} />
          <Route path="/laboratory" element={isAuthenticated ? <Navigate to="/dashboard/laboratory" replace /> : <Navigate to="/login" replace />} />

          {/* Default route - ALWAYS opens Login first! */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
