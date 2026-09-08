'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function EmergencyPage() {
  const [exposureHours, setExposureHours] = useState<number>(12);

  const remainingPepHours = Math.max(0, 72 - exposureHours);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Critical Warning Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-red-500/40 bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/40 space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
          <span>🚨 Emergency & Crisis Care Center</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Need Immediate Help?</h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
          If you have experienced unprotected sexual exposure within the last 72 hours, sexual assault, or severe medical distress, immediate care is available free of judgment.
        </p>

        {/* Call Now Hotlines */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="tel:114"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-red-950/50 transition-all"
          >
            <span>📞 Call RBC Health Line: Dial 114</span>
          </a>
          <a
            href="tel:3580"
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl border border-slate-700/80"
          >
            <span>⚖️ GBV Support (Isange): Dial 3580</span>
          </a>
        </div>
      </div>

      {/* 72-Hour HIV PEP Countdown Calculator */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">⏱️ Interactive Timeline Tool</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">72-Hour HIV PEP Window Calculator</h2>
          <p className="text-xs text-slate-300">
            Post-Exposure Prophylaxis (PEP) must be started within 72 hours of potential HIV exposure. Drag the slider to calculate your remaining window:
          </p>
        </div>

        <div className="space-y-4 bg-[#162337] p-6 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300">
            <span>Hours Since Potential Exposure:</span>
            <span className="text-cyan-400 text-base">{exposureHours} Hours Ago</span>
          </div>

          <input
            type="range"
            min={1}
            max={96}
            value={exposureHours}
            onChange={(e) => setExposureHours(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0h (Immediate)</span>
            <span>24h (Optimal)</span>
            <span>72h (Deadline)</span>
            <span>96h (Over Window)</span>
          </div>

          {/* Calculator Status Box */}
          <div
            className={`p-4 rounded-xl border text-center ${
              remainingPepHours > 48
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : remainingPepHours > 0
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}
          >
            {remainingPepHours > 0 ? (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider block">Remaining Window to Start PEP</span>
                <p className="text-2xl font-black">{remainingPepHours} Hours Remaining</p>
                <p className="text-xs leading-normal">
                  {remainingPepHours > 48
                    ? 'Optimal treatment window. Visit any district hospital or request an emergency pass consultation.'
                    : 'Time critical! Visit your nearest health facility immediately to receive PEP.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider block">72-Hour Standard PEP Window Exceeded</span>
                <p className="text-sm font-bold">
                  Standard PEP is most effective within 72 hours. However, consult a doctor immediately for baseline testing and guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Care Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contraception Card */}
        <div className="glass-panel p-6 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-3">
          <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center font-bold text-lg">
            💊
          </div>
          <h3 className="text-lg font-bold text-white">Emergency Contraception (EC)</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Emergency contraceptive pills (e.g. Levonorgestrel) prevent pregnancy if taken within 72–120 hours after unprotected sex. Best taken as early as possible.
          </p>
          <div className="pt-2">
            <Link
              href="/medications"
              className="text-xs text-cyan-400 hover:underline font-bold inline-flex items-center space-x-1"
            >
              <span>View Emergency Contraception Medication Guide</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Sexual Assault Support Card */}
        <div className="glass-panel p-6 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-3">
          <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center font-bold text-lg">
            🛡️
          </div>
          <h3 className="text-lg font-bold text-white">Isange One Stop Center Support</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Rwanda’s Isange One Stop Centers provide free medical, forensic, legal, and psychological care to victims of gender-based violence and sexual trauma.
          </p>
          <div className="pt-2">
            <a
              href="tel:3580"
              className="text-xs text-purple-400 hover:underline font-bold inline-flex items-center space-x-1"
            >
              <span>Call Free GBV Helpline: Dial 3580</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
