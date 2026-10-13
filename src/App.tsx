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
        {/* Auth routes */}
        <Route path="/login" element={<Login onNotify={handleNotify} />} />
        <Route path="/signup" element={<Signup onNotify={handleNotify} />} />
        <Route path="/forgot-password" element={<ForgotPassword onNotify={handleNotify} />} />

        {/* Protected Admin App under Layout */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard onNotify={handleNotify} />} />
          <Route path="doctors" element={<Doctors onNotify={handleNotify} />} />
          <Route path="patients" element={<Patients onNotify={handleNotify} />} />
          <Route path="reception" element={<Reception onNotify={handleNotify} />} />
          <Route path="billing" element={<Billing onNotify={handleNotify} />} />
          <Route path="laboratory" element={<Laboratory onNotify={handleNotify} />} />
        </Route>

        {/* Direct URL Aliases to match Stitch paths */}
        <Route path="/doctors" element={<Navigate to="/dashboard/doctors" replace />} />
        <Route path="/patients" element={<Navigate to="/dashboard/patients" replace />} />
        <Route path="/reception" element={<Navigate to="/dashboard/reception" replace />} />
        <Route path="/receptionists" element={<Navigate to="/dashboard/reception" replace />} />
        <Route path="/billing" element={<Navigate to="/dashboard/billing" replace />} />
        <Route path="/billing-team" element={<Navigate to="/dashboard/billing" replace />} />
        <Route path="/laboratory" element={<Navigate to="/dashboard/laboratory" replace />} />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
