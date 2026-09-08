'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';

interface UserWallet {
  sessionCredits: number;
  minuteBalance: number;
}

interface UserData {
  id: string;
  phone: string;
  wallet?: UserWallet;
}

interface ExpertData {
  id: string;
  name: string;
  specialty: string;
  verified: boolean;
}

interface AuthContextType {
  token: string | null;
  user: UserData | null;
  expert: ExpertData | null;
  isExpert: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: (token: string, data: any, isExpert: boolean) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [expert, setExpert] = useState<ExpertData | null>(null);
  const [isExpert, setIsExpert] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve credentials from localStorage on mount
    const savedToken = localStorage.getItem('tnf_token');
    const savedRole = localStorage.getItem('tnf_role');
    const savedData = localStorage.getItem('tnf_user_data');

    if (savedToken && savedData) {
      setToken(savedToken);
      if (savedRole === 'expert') {
        setExpert(JSON.parse(savedData));
        setIsExpert(true);
      } else {
        setUser(JSON.parse(savedData));
        setIsExpert(false);
      }
    }
    setLoading(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const login = (newToken: string, data: any, roleIsExpert: boolean) => {
    setToken(newToken);
    localStorage.setItem('tnf_token', newToken);
    localStorage.setItem('tnf_role', roleIsExpert ? 'expert' : 'user');
    localStorage.setItem('tnf_user_data', JSON.stringify(data));

    if (roleIsExpert) {
      setExpert(data);
      setUser(null);
      setIsExpert(true);
    } else {
      setUser(data);
      setExpert(null);
      setIsExpert(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setExpert(null);
    setIsExpert(false);
    localStorage.removeItem('tnf_token');
    localStorage.removeItem('tnf_role');
    localStorage.removeItem('tnf_user_data');
  };

  const refreshUserData = async () => {
    if (!token || isExpert || !user) return;
    try {
      // Fetch user bookings/profile from backend to get updated wallet state
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: user.phone }),
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        localStorage.setItem('tnf_user_data', JSON.stringify(result.user));
      }
    } catch (e) {
      console.error('Failed to sync wallet data', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f16] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, expert, isExpert, login, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
