import React from 'react';
import { Login } from './Login';

interface SignupProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
  onLoginSuccess?: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onNotify, onLoginSuccess }) => {
  return <Login initialMode="signup" onNotify={onNotify} onLoginSuccess={onLoginSuccess} />;
};
