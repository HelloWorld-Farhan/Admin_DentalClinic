import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import { Patients } from './pages/Patients';
import { Reception } from './pages/Reception';
import { Billing } from './pages/Billing';
import { Laboratory } from './pages/Laboratory';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import ToastNotification, { ToastMessage } from './components/ToastNotification';

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
    </BrowserRouter>
  );
}
