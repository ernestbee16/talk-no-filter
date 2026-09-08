'use client';

import React, { useState } from 'react';

interface Medication {
  id: string;
  name: string;
  category: 'contraception' | 'pep_prep' | 'sti_treatment';
  purpose: string;
  dosageGuidance: string;
  sideEffects: string[];
  whoWarning: string;
}

const MEDICATIONS: Medication[] = [
  {
    id: '1',
    name: 'Levonorgestrel (Emergency Contraceptive Pill)',
    category: 'contraception',
    purpose: 'Emergency pregnancy prevention following unprotected sex or barrier failure.',
    dosageGuidance: 'Single 1.5 mg tablet taken as soon as possible within 72 hours of intercourse.',
    sideEffects: ['Temporary nausea', 'Fatigue', 'Slightly altered next menstrual cycle timing'],
    whoWarning: 'Does not terminate an existing pregnancy. Does not protect against STIs or HIV.',
  },
  {
    id: '2',
    name: 'Tenofovir / Emtricitabine (PrEP)',
    category: 'pep_prep',
    purpose: 'Pre-Exposure Prophylaxis for daily HIV acquisition risk reduction.',
    dosageGuidance: 'One tablet daily with or without food. Continuous adherence required for optimal efficacy.',
    sideEffects: ['Mild gastrointestinal upset during initial 2 weeks', 'Headache'],
    whoWarning: 'Requires baseline negative HIV antibody test before starting and periodic kidney function screening.',
  },
  {
    id: '3',
    name: 'TLD (Tenofovir/Lamivudine/Dolutegravir) - PEP Regimen',
    category: 'pep_prep',
    purpose: 'Post-Exposure Prophylaxis for emergency HIV exposure within 72 hours.',
    dosageGuidance: 'Once daily for 28 continuous days without missing doses.',
    sideEffects: ['Insomnia', 'Mild dizziness', 'Headache'],
    whoWarning: 'Must be initiated within 72 hours max following potential exposure.',
  },
  {
    id: '4',
    name: 'Azithromycin & Ceftriaxone',
    category: 'sti_treatment',
    purpose: 'Dual antibiotic therapy for Gonorrhea and Chlamydia infections.',
    dosageGuidance: 'Administered under direct medical supervision at health facilities.',
    sideEffects: ['Mild stomach discomfort', 'Nausea'],
    whoWarning: 'Both partners must complete full treatment course to prevent reinfection.',
  },
];

export default function MedicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'contraception' | 'pep_prep' | 'sti_treatment'>('all');

  const filteredMedications = MEDICATIONS.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) || med.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || med.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 space-y-2">
        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          💊 Clinical Medication Directory
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Medication & Treatment Library</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Search educational clinical guides for emergency contraceptives, HIV PEP/PrEP formulations, and STI antibiotic treatments aligned with WHO guidelines.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border-slate-800/80 bg-[#101C2C] flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search medication name or purpose (e.g. PEP, Levonorgestrel)..."
          className="flex-grow bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <div className="flex space-x-2">
          {(['all', 'contraception', 'pep_prep', 'sti_treatment'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] font-bold px-3 py-2 rounded-xl transition-colors uppercase ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700/80'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Medication Cards List */}
      <div className="space-y-4">
        {filteredMedications.map((med) => (
          <div
            key={med.id}
            className="glass-panel p-6 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-4 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-3">
              <h3 className="text-lg font-bold text-white">{med.name}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
                {med.category.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Primary Clinical Purpose</span>
                <p className="text-slate-200 leading-relaxed">{med.purpose}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Educational Dosage Guidance</span>
                <p className="text-slate-200 leading-relaxed">{med.dosageGuidance}</p>
              </div>
            </div>

            {/* WHO Warning Box */}
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
              <span className="text-base">⚠️</span>
              <div>
                <strong className="block text-[10px] uppercase font-bold text-amber-400">WHO Clinical Caution:</strong>
                <span>{med.whoWarning}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
