'use client';

import React from 'react';
import Link from 'next/link';

export default function MentalHealthPage() {
  const topics = [
    {
      title: 'Sexual Health Anxiety & Stigma',
      icon: '🧠',
      desc: 'Managing fear, anxiety, and panic related to potential exposure, STI testing results, or reproductive health stigma.',
    },
    {
      title: 'Consent & Relationship Boundaries',
      icon: '🤝',
      desc: 'Understanding relationship dynamics, clear mutual consent, communication, and emotional safety.',
    },
    {
      title: 'Trauma & GBV Psychological Healing',
      icon: '💜',
      desc: 'Confidential psychological support for survivors of sexual assault, coercion, or relationship abuse.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 space-y-3">
        <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          🧠 Confidential Psychological Support
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Mental Health & Well-being Hub</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Sexual health is deeply connected with emotional and psychological well-being. Access judgment-free counseling, anxiety management tools, and trauma recovery guidance.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topics.map((t, idx) => (
          <div
            key={idx}
            className="glass-panel p-6 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-3 hover:border-purple-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center text-xl font-bold">
                {t.icon}
              </span>
              <h3 className="text-lg font-bold text-white leading-snug">{t.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.desc}</p>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <Link href="/book" className="text-xs font-bold text-purple-400 hover:underline">
                Book Confidential Counselor →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 24/7 Crisis Hotline Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-purple-500/30 bg-[#162337] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">In Need of Immediate Psychological Support?</h3>
          <p className="text-xs text-slate-300">
            Connect with trained counselors 24/7. 100% confidential and free of judgment.
          </p>
        </div>

        <div className="flex space-x-3 shrink-0">
          <a
            href="tel:114"
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-purple-950/40"
          >
            📞 Dial Hotline 114
          </a>
        </div>
      </div>
    </div>
  );
}
