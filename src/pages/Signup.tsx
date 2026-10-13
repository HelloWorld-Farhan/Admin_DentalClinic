import React from 'react';
import { Login } from './Login';

interface SignupProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
}

export const Signup: React.FC<SignupProps> = ({ onNotify }) => {
  return <Login initialMode="signup" onNotify={onNotify} />;
};
