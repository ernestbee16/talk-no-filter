'use client';

import React from 'react';
import Link from 'next/link';

export default function HivResourcesPage() {
  const sections = [
    {
      title: 'HIV Post-Exposure Prophylaxis (PEP)',
      tag: 'Emergency Treatment (Within 72h)',
      desc: 'PEP is a 28-day antiretroviral treatment course for individuals who may have been exposed to HIV within the last 72 hours.',
      points: [
        'Must be initiated within 72 hours max (ideal <24h).',
        '28-day uninterrupted daily dose regimen.',
        'Available at RBC district hospitals & certified health posts.',
        'Requires baseline HIV testing prior to initiation.',
      ],
      link: '/emergency',
      linkText: 'Check PEP Timeline Calculator →',
    },
    {
      title: 'HIV Pre-Exposure Prophylaxis (PrEP)',
      tag: 'Daily Prevention Strategy',
      desc: 'PrEP is a daily pill or long-acting injection that reduces the risk of acquiring HIV from sex by over 99%.',
      points: [
        'Taken daily by HIV-negative individuals at ongoing risk.',
        'Requires HIV negative test prior to initiation & every 3 months.',
        'Distributed free of charge across public healthcare clinics in Rwanda.',
        'Does not prevent STIs—pair with condoms for dual protection.',
      ],
      link: '/book',
      linkText: 'Consult a Practitioner for PrEP Rx →',
    },
    {
      title: 'HIV Testing & Window Periods',
      tag: 'Accuracy & Detection Timelines',
      desc: 'Understanding the window period—the time between HIV exposure and when a test can detect the virus.',
      points: [
        'Rapid Antibody Tests: 23 to 90 days window period.',
        '4th Gen Antigen/Antibody Lab Test: 18 to 45 days window period.',
        'NAT / Viral Load Test: Detectable within 10 to 33 days after exposure.',
        'Re-testing recommended at 3 months for conclusive verification.',
      ],
      link: '/clinic-locator',
      linkText: 'Find Nearby Testing Clinics →',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 space-y-3">
        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          🔴 Verified WHO & RBC Clinical Library
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">HIV Prevention, PEP & PrEP Resources</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Accurate, evidence-based guidance regarding HIV transmission, emergency post-exposure prophylaxis (PEP), pre-exposure prophylaxis (PrEP), and testing window periods in Rwanda.
        </p>
      </div>

      {/* Sections Grid */}
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-4 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-white">{sec.title}</h2>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
                {sec.tag}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{sec.desc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {sec.points.map((pt, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <Link href={sec.link} className="text-xs font-bold text-cyan-400 hover:underline">
                {sec.linkText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
