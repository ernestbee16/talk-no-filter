'use client';

import React, { useState } from 'react';

interface Clinic {
  id: string;
  name: string;
  district: string;
  type: string;
  services: string[];
  hours: string;
  phone: string;
}

const CLINICS: Clinic[] = [
  {
    id: '1',
    name: 'Kacyiru District Hospital (Youth Corner)',
    district: 'Gasabo, Kigali',
    type: 'District Hospital',
    services: ['PEP Available', 'PrEP Center', 'Free HIV Testing', 'Youth SRH Corner'],
    hours: '24/7 Emergency & OPD (8am - 5pm)',
    phone: '+250 788 123 001',
  },
  {
    id: '2',
    name: 'Muhima Hospital (Maternity & SRH)',
    district: 'Nyarugenge, Kigali',
    type: 'Specialized Hospital',
    services: ['Emergency Contraception', 'PEP Available', 'STIs Screening', 'Counseling'],
    hours: '24/7 Emergency',
    phone: '+250 788 123 002',
  },
  {
    id: '3',
    name: 'Remera Health Center',
    district: 'Gasabo, Kigali',
    type: 'Health Center',
    services: ['Free HIV Testing', 'PrEP Distribution', 'Contraceptive Implants'],
    hours: 'Mon - Fri: 7:00 AM - 5:00 PM',
    phone: '+250 788 123 003',
  },
  {
    id: '4',
    name: 'Isange One Stop Center (Kigali)',
    district: 'Kacyiru, Kigali',
    type: 'Crisis & GBV Center',
    services: ['24/7 GBV Care', 'Forensic & PEP', 'Psychological Support', 'Legal Aid'],
    hours: '24/7 Open',
    phone: '+250 788 123 004',
  },
  {
    id: '5',
    name: 'CHUK University Teaching Hospital',
    district: 'Nyarugenge, Kigali',
    type: 'National Referral Hospital',
    services: ['24/7 PEP Trauma Unit', 'Advanced HIV Care', 'Specialized SRH'],
    hours: '24/7 Emergency',
    phone: '+250 788 384 000',
  },
  {
    id: '6',
    name: 'Huye University Teaching Hospital (CHUB)',
    district: 'Huye, Southern Province',
    type: 'Referral Hospital',
    services: ['Youth SRH Services', 'PEP Emergency', 'Confidential HIV Testing'],
    hours: '24/7 Emergency',
    phone: '+250 788 123 500',
  },
  {
    id: '7',
    name: 'Musanze Youth SRH Center',
    district: 'Musanze, Northern Province',
    type: 'Youth Friendly Clinic',
    services: ['Free Condoms & Contraception', 'PrEP Center', 'Youth Peer Support'],
    hours: 'Mon - Sat: 8:00 AM - 6:00 PM',
    phone: '+250 788 123 600',
  },
  {
    id: '8',
    name: 'Rubavu District Hospital',
    district: 'Rubavu, Western Province',
    type: 'District Hospital',
    services: ['PEP Available', 'STIs Management', 'HIV Voluntary Counseling'],
    hours: '24/7 Open',
    phone: '+250 788 123 700',
  },
];

export default function ClinicLocatorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredClinics = CLINICS.filter((clinic) => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'all' || clinic.services.some((s) => s.toLowerCase().includes(filterType.toLowerCase()));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 space-y-2">
        <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          📍 Youth-Friendly Facility Directory
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Clinic & Testing Locator</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Find verified RBC health centers, district hospitals, Isange One Stop Centers, and youth-friendly clinics offering PEP, PrEP, and confidential HIV testing in Rwanda.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border-slate-800/80 bg-[#101C2C] flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by hospital name or district (e.g. Gasabo, Kacyiru)..."
          className="flex-grow bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Services</option>
          <option value="pep">PEP Available</option>
          <option value="prep">PrEP Center</option>
          <option value="gbv">GBV & Crisis Care</option>
        </select>
      </div>

      {/* Clinics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClinics.map((clinic) => (
          <div
            key={clinic.id}
            className="glass-panel p-6 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-400/10 px-2.5 py-0.5 rounded">
                  {clinic.type}
                </span>
                <span className="text-[11px] text-slate-400">{clinic.hours}</span>
              </div>
              <h3 className="text-base font-bold text-white">{clinic.name}</h3>
              <p className="text-xs text-slate-400">📍 {clinic.district}</p>

              {/* Service Badges */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {clinic.services.map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                  >
                    ✓ {srv}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <a
                href={`tel:${clinic.phone}`}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>📞 {clinic.phone}</span>
              </a>
              <span className="text-[10px] text-slate-500 font-mono">Verified RBC Facility</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
