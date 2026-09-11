'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { API_BASE_URL } from '@/config/api';

export default function Navigation() {
  const pathname = usePathname();
  const { token, user, isExpert, login, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isExpertLoginMode, setIsExpertLoginMode] = useState(false);
  
  // Multilingual state switcher
  const [language, setLanguage] = useState<'en' | 'rw' | 'fr' | 'sw'>('en');

  // 2-Step OTP Authentication states
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [expertId, setExpertId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setOtpNotice('');
    setSubmitting(true);

    try {
      if (isExpertLoginMode) {
        if (!expertId.trim()) {
          setLoginError('Expert ID is required');
          setSubmitting(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/auth/expert-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expertId: expertId.trim() }),
        });

        if (res.ok) {
          const data = await res.json();
          login(data.token, data.expert, true);
          setShowLoginModal(false);
          setExpertId('');
        } else {
          const errData = await res.json();
          setLoginError(errData.error || 'Failed to authenticate expert');
        }
      } else {
        if (authStep === 'phone') {
          if (!phoneNumber.trim()) {
            setLoginError('Phone number is required');
            setSubmitting(false);
            return;
          }

          const res = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneNumber.trim() }),
          });

          if (res.ok) {
            const data = await res.json();
            setAuthStep('otp');
            if (data.testOtp) {
              setOtpNotice(`Secure SMS OTP dispatched to ${phoneNumber}. (Use verification code: ${data.testOtp})`);
            } else {
              setOtpNotice(`SMS OTP sent to ${phoneNumber}. Enter 6-digit code.`);
            }
          } else {
            const errData = await res.json();
            setLoginError(errData.error || 'Failed to dispatch SMS OTP');
          }
        } else {
          if (!otpCode.trim()) {
            setLoginError('Enter 6-digit OTP code');
            setSubmitting(false);
            return;
          }

          const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneNumber.trim(), code: otpCode.trim() }),
          });

          if (res.ok) {
            const data = await res.json();
            login(data.token, data.user, false);
            setShowLoginModal(false);
            setPhoneNumber('');
            setOtpCode('');
            setAuthStep('phone');
          } else {
            const errData = await res.json();
            setLoginError(errData.error || 'Invalid OTP code. Use 123456 for sandbox bypass.');
          }
        }
      }
    } catch (e) {
      console.error(e);
      setLoginError('Server connection issue.');
    } finally {
      setSubmitting(false);
    }
  };

  const mainNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'AI Assistant 🤖', path: '/ai-assistant' },
    { name: 'Symptom Triage 🩺', path: '/symptom-checker' },
    { name: 'Emergency 🚨', path: '/emergency' },
    { name: 'HIV & PEP 🔴', path: '/hiv-resources' },
    { name: 'Clinics 📍', path: '/clinic-locator' },
    { name: 'Book Session', path: '/book' },
    { name: 'Myth Hub', path: '/myth-facts' },
    { name: 'Q&A', path: '/qa' },
    { name: 'Learn 🎓', path: '/learn' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#07131F]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />

          {/* Desktop Nav links */}
          <nav className="hidden lg:flex space-x-4 text-xs font-semibold">
            {mainNavLinks.map((link) => {
              const active = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`transition-colors duration-200 ${
                    active ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher & Auth actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Multilingual Selector */}
            <div className="flex bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-[10px] font-bold">
              {(['en', 'rw', 'fr', 'sw'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded uppercase ${
                    language === lang ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {token ? (
              <div className="flex items-center space-x-3">
                {isExpert ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Verified Expert
                    </span>
                    <Link
                      href="/dashboard/expert"
                      className="text-xs text-cyan-400 hover:underline font-bold"
                    >
                      Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs">
                      <span className="text-amber-400 font-bold">{user?.wallet?.sessionCredits || 0}★</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-cyan-400 font-bold">{user?.wallet?.minuteBalance || 0}m</span>
                    </div>
                    <Link
                      href="/dashboard/user"
                      className="text-xs text-blue-300 hover:underline font-semibold"
                    >
                      My Passes
                    </Link>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-red-400 px-2.5 py-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginError('');
                  setOtpNotice('');
                  setAuthStep('phone');
                  setShowLoginModal(true);
                }}
                className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-95 px-4 py-2 rounded-xl transition-all shadow-lg shadow-cyan-900/20"
              >
                Join / Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6 fill-none stroke-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown menu */}
        {isOpen && (
          <div className="lg:hidden glass-panel border-t border-slate-800/80 bg-[#07131F]/95 px-4 py-4 space-y-3">
            <div className="flex space-x-1 pb-2 border-b border-slate-800 text-[11px] font-bold">
              {(['en', 'rw', 'fr', 'sw'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded uppercase ${
                    language === lang ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {mainNavLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-slate-300 hover:text-white font-medium text-xs py-1"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-slate-800/80" />
            {token ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-center py-2 text-xs border border-red-500/20 text-red-400 rounded-xl"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLoginModal(true);
                }}
                className="w-full text-center py-2.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl"
              >
                Join / Sign In
              </button>
            )}
          </div>
        )}
      </header>

      {/* 2-Step Auth Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070c]/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md glass-panel border border-slate-700/80 rounded-3xl p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black text-white mb-2 tracking-wide">
              {isExpertLoginMode
                ? 'Verify Expert Portal'
                : authStep === 'phone'
                ? 'Safe & Private Access'
                : 'Enter SMS OTP Code'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {isExpertLoginMode
                ? 'Sign in to access consult schedules, client notes, and moderate forums.'
                : authStep === 'phone'
                ? 'No passwords required. Enter your mobile handset number to receive a secure SMS OTP.'
                : `Enter the 6-digit code dispatched to ${phoneNumber}`}
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {isExpertLoginMode ? (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Select Verified Rwandan Health Practitioner
                  </label>
                  <select
                    value={expertId}
                    onChange={(e) => setExpertId(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Practitioner Account --</option>
                    <option value="expert1">expert1 — Dr. Keza Aline (HIV Prevention & Care Specialist)</option>
                    <option value="expert2">expert2 — Dr. Ntwari Jean (Youth SRH Consultant)</option>
                    <option value="expert3">expert3 — Dr. Uwase Marie (Adolescent Gynaecologist)</option>
                    <option value="expert4">expert4 — Dr. Mugisha Eric (Clinical Psychologist & Mental Health)</option>
                    <option value="expert5">expert5 — Dr. Umutoni Divine (Sexual & Reproductive Health)</option>
                  </select>
                  
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Or type custom identifier
                    </label>
                    <input
                      type="text"
                      value={expertId}
                      onChange={(e) => setExpertId(e.target.value)}
                      placeholder="e.g. expert1"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
              ) : authStep === 'phone' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Mobile Number (MTN MoMo or Airtel Money RWF)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +250 788 123 456"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    6-Digit SMS Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 482910 (or 123456 test bypass)"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm text-center tracking-widest font-mono text-lg focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              )}

              {otpNotice && (
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 font-medium">
                  {otpNotice}
                </div>
              )}

              {loginError && <p className="text-xs text-red-400 font-semibold">{loginError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-95 transition-opacity disabled:opacity-50 text-sm shadow-lg shadow-cyan-900/30"
              >
                {submitting
                  ? 'Processing...'
                  : isExpertLoginMode
                  ? 'Verify Expert Access'
                  : authStep === 'phone'
                  ? 'Send SMS OTP Code 📲'
                  : 'Verify OTP & Log In ✓'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <button
                onClick={() => {
                  setLoginError('');
                  setOtpNotice('');
                  setIsExpertLoginMode(!isExpertLoginMode);
                }}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                {isExpertLoginMode ? 'Switch to Standard User SMS Login' : 'Log in as Verified Expert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
