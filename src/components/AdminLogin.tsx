import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Shield,
  AlertTriangle,
  UserCog,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole, AdminSession, User } from '../App';

interface AdminLoginProps {
  onLogin: (role: UserRole, sessionData?: AdminSession) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const { loading, error, user, login } = useAuth();
  const [adminCredentials, setAdminCredentials] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const { email, password } = adminCredentials;

    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    try {
      const profile = await login(email, password);
      if (!profile) return;
      const userData = profile as User;

      if (!userData.isActive) {
        setLoginError('User account is disabled.');
        return;
      }

      const adminSession: AdminSession = {
        user: {
          ...userData,
          lastLogin: new Date().toISOString()
        },
        loginTime: new Date().toISOString()
      };

      onLogin('admin', adminSession);
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <>
      <div className="text-center mb-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
          <UserCog className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="font-medium">User Access</h3>
        <p className="text-sm text-gray-600">For platform management and analytics</p>
      </div>

      <form onSubmit={handleAdminSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center space-x-2">
            <UserCog className="w-4 h-4 text-gray-500" />
            <span>Email</span>
          </Label>
          <Input
            id="email"
            type="text"
            placeholder="Enter admin email"
            value={adminCredentials.email}
            onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span>Password</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter admin password"
            value={adminCredentials.password}
            onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="h-12"
            required
          />
        </div>

        {(loginError || error) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{loginError || (error || '')}</p>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg" disabled={loading}>
          <UserCog className="mr-2 h-4 w-4" />
          Access Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </>
  );
}