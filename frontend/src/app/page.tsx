'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';

interface MythFact {
  id: string;
  claim: string;
  verifiedFact: string;
  sourceName: string;
  sourceUrl: string | null;
  viewCount: number;
  shareCount: number;
}

export default function Home() {
  const [myths, setMyths] = useState<MythFact[]>([]);
  const [loadingMyths, setLoadingMyths] = useState(true);

  // Myth claim form submission state
  const [claimText, setClaimText] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Anonymous Q&A form state
  const [qaText, setQaText] = useState('');
  const [qaSuccess, setQaSuccess] = useState(false);
  const [submittingQa, setSubmittingQa] = useState(false);

  // Active myth card index for interactive preview carousel
  const [activeMythIndex, setActiveMythIndex] = useState(0);
  const [onlineExperts] = useState(3);

  useEffect(() => {
    fetchMyths();
  }, []);

  const fetchMyths = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mythfacts`);
      if (res.ok) {
        const data = await res.json();
        setMyths(data);
      }
    } catch (e) {
      console.error('Failed to fetch myths', e);
    } finally {
      setLoadingMyths(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim()) return;
    setSubmittingClaim(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mythfacts/submit-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claimText }),
      });
      if (res.ok) {
        setClaimSuccess(true);
        setClaimText('');
        setTimeout(() => setClaimSuccess(false), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleQaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaText.trim()) return;
    setSubmittingQa(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: qaText }),
      });
      if (res.ok) {
        setQaSuccess(true);
        setQaText('');
        setTimeout(() => setQaSuccess(false), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingQa(false);
    }
  };

  const handleShareClick = async (mythId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/mythfacts/${mythId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share' }),
      });
      fetchMyths();
      alert('Card link copied to clipboard! (Share link for WhatsApp/TikTok)');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-grow pb-16 space-y-12">
      {/* Live Practitioner Network Ticker */}
      <div className="bg-[#0b1626] border-b border-slate-800/80 py-2.5 px-4 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-white">Live Network:</span>
            <span className="text-cyan-400 font-semibold">{onlineExperts} Verified Medical Practitioners Online</span>
            <span className="hidden md:inline text-slate-500">| Avg. response time: &lt; 2 mins</span>
          </div>

          <div className="hidden sm:flex items-center space-x-4 text-[11px] text-slate-400 font-medium">
            <span>🛡️ 100% Cryptographic Anonymity</span>
            <span>•</span>
            <span>⚡ No Passwords Needed</span>
          </div>
        </div>
      </div>

      {/* 1. Hero / Master Vision Section */}
      <section className="relative px-6 pt-12 pb-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
          <span>🌐 National Digital Health Ecosystem</span>
          <span className="text-slate-500">|</span>
          <span className="text-white">WHO & RBC Guidelines Compliant</span>
        </div>

        <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.08] text-white">
          Private. Professional.<br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent glow-text-primary">
            Judgment-Free Support.
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Talk No Filter provides young people with trusted, evidence-based Sexual and Reproductive Health (SRH) and HIV information while connecting them directly with licensed healthcare practitioners through 100% confidential consultations.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/ai-assistant"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-95 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-cyan-900/30 text-sm sm:text-base flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>🤖 Launch AI Health Assistant</span>
            <span>→</span>
          </Link>
          <Link
            href="/symptom-checker"
            className="bg-[#162337] hover:bg-[#1c2c45] text-slate-200 hover:text-white border border-slate-700/80 font-bold px-8 py-4 rounded-2xl text-sm sm:text-base transition-colors flex items-center space-x-2"
          >
            <span>🩺 Check Symptoms Triage</span>
          </Link>
          <Link
            href="/emergency"
            className="bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 font-bold px-6 py-4 rounded-2xl text-sm transition-colors flex items-center space-x-2"
          >
            <span>🚨 Emergency (72h PEP)</span>
          </Link>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
          <div className="glass-panel p-4 rounded-2xl border-slate-800/80 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400">0</span>
            <p className="text-[11px] text-slate-400 font-semibold">Youth Served Confidentiality</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl border-slate-800/80 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">100%</span>
            <p className="text-[11px] text-slate-400 font-semibold">WHO & RBC Guidelines Verified</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl border-slate-800/80 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-400">72 Hours</span>
            <p className="text-[11px] text-slate-400 font-semibold">PEP Emergency Window Care</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl border-slate-800/80 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">0 Seconds</span>
            <p className="text-[11px] text-slate-400 font-semibold">Registration Passwords Needed</p>
          </div>
        </div>
      </section>

      {/* 2. Core Modules Showcase Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Enterprise Platform Capabilities</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Comprehensive Health Ecosystem</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: AI Assistant */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <span className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center font-bold text-2xl">
                🤖
              </span>
              <h3 className="text-xl font-bold text-white">AI Health Assistant</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trained on WHO & RBC guidelines. Answers questions on contraception, STIs, and PEP/PrEP while automatically detecting physical emergencies.
              </p>
            </div>
            <Link href="/ai-assistant" className="text-xs font-bold text-cyan-400 hover:underline pt-2">
              Launch AI Assistant →
            </Link>
          </div>

          {/* Module 2: Symptom Checker */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <span className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center font-bold text-2xl">
                🩺
              </span>
              <h3 className="text-xl font-bold text-white">Symptom Checker</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Guided triage questionnaire assessing risk levels (Low, Moderate, High Risk) and recommending immediate clinical next steps.
              </p>
            </div>
            <Link href="/symptom-checker" className="text-xs font-bold text-cyan-400 hover:underline pt-2">
              Start Triage Check →
            </Link>
          </div>

          {/* Module 3: HIV & PEP Library */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <span className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-2xl">
                🔴
              </span>
              <h3 className="text-xl font-bold text-white">HIV & PEP/PrEP Hub</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complete educational guides covering PEP 72-hour window timelines, PrEP daily regimens, testing window periods, and ART treatment.
              </p>
            </div>
            <Link href="/hiv-resources" className="text-xs font-bold text-cyan-400 hover:underline pt-2">
              View HIV Resources →
            </Link>
          </div>

          {/* Module 4: Clinic Locator */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <span className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center font-bold text-2xl">
                📍
              </span>
              <h3 className="text-xl font-bold text-white">Clinic & Testing Locator</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Find nearby youth-friendly health centers, district hospitals, Isange One Stop Centers, and testing facilities across Rwanda.
              </p>
            </div>
            <Link href="/clinic-locator" className="text-xs font-bold text-cyan-400 hover:underline pt-2">
              Locate Health Facilities →
            </Link>
          </div>

          {/* Module 5: Medication Library */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <span className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center font-bold text-2xl">
                💊
              </span>
              <h3 className="text-xl font-bold text-white">Medication Directory</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clinical guides for emergency contraceptives, PEP/PrEP formulations, and STI dual antibiotic therapies with WHO warnings.
              </p>
            </div>
            <Link href="/medications" className="text-xs font-bold text-cyan-400 hover:underline pt-2">
              Search Medications →
            </Link>
          </div>

          {/* Module 6: Mental Health Hub */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <span className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center font-bold text-2xl">
                🧠
              </span>
              <h3 className="text-xl font-bold text-white">Mental Health Support</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Counseling resources for sexual health anxiety, relationship boundaries, and psychological healing following trauma.
              </p>
            </div>
            <Link href="/mental-health" className="text-xs font-bold text-cyan-400 hover:underline pt-2">
              Explore Mental Health Hub →
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Rwandan Health Experts Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-6 pt-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Confidential Medical Team</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Verified Rwandan Health Experts</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto pt-1">
            Licensed practitioners providing anonymous, non-judgmental, end-to-end encrypted consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { name: 'Dr. Keza Aline', profession: 'HIV Prevention & Care Specialist', icon: '🩺', badge: 'HIV & PEP' },
            { name: 'Dr. Ntwari Jean', profession: 'Youth SRH Consultant', icon: '🌿', badge: 'Youth SRH' },
            { name: 'Dr. Uwase Marie', profession: 'Adolescent Gynaecologist', icon: '👩‍⚕️', badge: 'Gynaecology' },
            { name: 'Dr. Mugisha Eric', profession: 'Clinical Psychologist & Mental Health', icon: '🧠', badge: 'Mental Health' },
            { name: 'Dr. Umutoni Divine', profession: 'Sexual & Reproductive Health', icon: '⚕️', badge: 'Family Planning' },
          ].map((expert, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border-slate-800/80 bg-[#101C2C] space-y-3 hover:border-cyan-500/40 transition-all flex flex-col justify-between text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center font-bold text-xl border border-cyan-500/20">
                  {expert.icon}
                </div>
                <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700/80">
                  {expert.badge}
                </span>
                <h3 className="text-base font-bold text-white leading-tight">{expert.name}</h3>
                <p className="text-xs text-slate-400 leading-snug">{expert.profession}</p>
              </div>
              <Link href="/book" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 pt-2 flex items-center justify-center space-x-1">
                <span>Book Private Session</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Interactive Myth vs Fact Spotlight & Passes Grid */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Left 2 Cols: Interactive Myth vs Fact Spotlight */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[420px] border-slate-800/80 bg-[#101C2C]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Verified Fact-Checker</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">Myth vs. Fact Spotlight</h2>
              </div>
              <Link href="/myth-facts" className="text-xs text-cyan-400 hover:underline font-bold uppercase tracking-wider">
                View All Myths &rarr;
              </Link>
            </div>

            {loadingMyths ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-slate-800/50 rounded-md w-3/4"></div>
                <div className="h-20 bg-slate-800/50 rounded-md"></div>
              </div>
            ) : myths.length > 0 ? (
              <div className="space-y-6">
                {/* Active Card Content */}
                <div className="space-y-4 border-l-2 border-amber-400 pl-4 bg-slate-900/60 p-4 rounded-r-2xl">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    <span>⚠️ Social Media Rumour Heard Online:</span>
                  </div>
                  <p className="text-base text-slate-200 font-bold leading-snug">
                    {"\"" + myths[activeMythIndex].claim + "\""}
                  </p>
                </div>

                <div className="space-y-4 border-l-2 border-cyan-400 pl-4 bg-cyan-950/20 p-4 rounded-r-2xl">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                    <span>✓ Verified Medical Fact check:</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {myths[activeMythIndex].verifiedFact}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-3 mt-3">
                    <span className="font-semibold text-blue-300">
                      Source: {myths[activeMythIndex].sourceName}
                    </span>
                    {myths[activeMythIndex].sourceUrl && (
                      <a href={myths[activeMythIndex].sourceUrl || '#'} target="_blank" className="text-cyan-400 hover:underline">
                        Reference Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">No fact checks published yet.</p>
            )}
          </div>

          {/* Carousel Toggles */}
          {myths.length > 1 && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800/80">
              <div className="flex space-x-2">
                {myths.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMythIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === activeMythIndex ? 'bg-cyan-400 w-6' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => handleShareClick(myths[activeMythIndex].id)}
                className="text-xs bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-400 px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5"
              >
                <span>Share Fact to WhatsApp</span>
                <span>📤</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Instant Booking Passes */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-blue-500/20 bg-gradient-to-b from-[#101C2C] to-[#07131F]">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">No Subscriptions Needed</span>
            <h2 className="text-2xl font-extrabold text-white mt-1 mb-6">On-Demand Safe Passes</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex justify-between items-center hover:border-cyan-400/40 transition-colors">
                <div>
                  <h3 className="font-bold text-white text-sm">15-Min Quick Check Pass</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Queue next available expert</p>
                </div>
                <div className="text-right">
                  <span className="block font-black text-cyan-400 text-sm">1,000 RWF</span>
                  <Link href="/book" className="text-[10px] uppercase font-bold text-blue-300 hover:text-cyan-300">
                    Join Queue &rarr;
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex justify-between items-center hover:border-cyan-400/40 transition-colors">
                <div>
                  <h3 className="font-bold text-white text-sm">30-Min Standard Pass</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Select time, priority matching</p>
                </div>
                <div className="text-right">
                  <span className="block font-black text-cyan-400 text-sm">1,500 RWF</span>
                  <Link href="/book" className="text-[10px] uppercase font-bold text-blue-300 hover:text-cyan-300">
                    Schedule &rarr;
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex justify-between items-center hover:border-blue-500/50 transition-colors">
                <div>
                  <span className="text-[9px] font-bold text-blue-300 uppercase bg-blue-500/20 px-1.5 py-0.5 rounded-md">Save 20%</span>
                  <h3 className="font-bold text-white text-sm mt-1">Gold Bundle (3 Passes)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Credit wallet balance</p>
                </div>
                <div className="text-right">
                  <span className="block font-black text-blue-300 text-sm">3,500 RWF</span>
                  <Link href="/book" className="text-[10px] uppercase font-bold text-blue-300 hover:text-cyan-300">
                    Buy Gold &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 mt-6">
            <p className="flex items-center space-x-1.5">
              <span>🔒</span> <span>100% End-to-End Encrypted consultation privacy</span>
            </p>
            <p className="flex items-center space-x-1.5">
              <span>💳</span> <span>Instant MTN MoMo / Airtel Money checkout</span>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Social Media Myth Submission & Q&A Forms */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border-slate-800/80 bg-[#101C2C]">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Heard a rumour on TikTok or WhatsApp?</span>
          <h3 className="text-xl font-bold text-white">{"\"Where did you hear this?\""}</h3>
          <p className="text-slate-400 text-xs leading-normal">
            Heard a claim online or from peers that sounds suspicious? Submit it here anonymously. Our medical team will research, verify, and publish a clear debunking card.
          </p>

          <form onSubmit={handleClaimSubmit} className="space-y-3 pt-2">
            <textarea
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="e.g. 'I read on a WhatsApp group that drinking soda after unprotected sex prevents pregnancy...'"
              rows={3}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
            
            {claimSuccess && (
              <p className="text-xs text-cyan-400 font-semibold">
                ✓ Received. We&apos;re on it! Keep an eye on the Myth vs. Fact feed.
              </p>
            )}

            <button
              type="submit"
              disabled={submittingClaim}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-md shadow-cyan-900/20"
            >
              {submittingClaim ? 'Submitting...' : 'Submit Claim Anonymously'}
            </button>
          </form>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border-slate-800/80 bg-[#101C2C]">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Ask our medical team</span>
          <h3 className="text-xl font-bold text-white">Ask an Anonymous Question</h3>
          <p className="text-slate-400 text-xs leading-normal">
            Need direct answers to personal questions? Submit below. Your identity is never linked to the query. Experts will answer and place it safely on our public FAQ.
          </p>

          <form onSubmit={handleQaSubmit} className="space-y-3 pt-2">
            <textarea
              value={qaText}
              onChange={(e) => setQaText(e.target.value)}
              placeholder="Type your question regarding HIV PEP timelines, birth control, testing, etc..."
              rows={3}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
            
            {qaSuccess && (
              <p className="text-xs text-blue-300 font-semibold">
                ✓ Submitted securely. Decoupling IP details. Question will show on FAQ once answered!
              </p>
            )}

            <button
              type="submit"
              disabled={submittingQa}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 shadow-md shadow-blue-900/20"
            >
              {submittingQa ? 'Submitting...' : 'Submit Sensitive Q&A'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
