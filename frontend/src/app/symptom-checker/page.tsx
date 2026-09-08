'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SymptomQuestion {
  id: string;
  question: string;
  options: { label: string; riskWeight: number }[];
}

const QUESTIONS: SymptomQuestion[] = [
  {
    id: 'q1',
    question: 'What primary symptoms or concerns are you experiencing?',
    options: [
      { label: 'Unprotected sexual intercourse within the last 72 hours', riskWeight: 3 },
      { label: 'Abnormal discharge, itching, or painful urination', riskWeight: 2 },
      { label: 'General questions about contraception or missed pills', riskWeight: 1 },
      { label: 'Severe lower abdominal pain or abnormal heavy bleeding', riskWeight: 3 },
    ],
  },
  {
    id: 'q2',
    question: 'When did your primary symptom or exposure occur?',
    options: [
      { label: 'Within the last 24 to 72 hours (Critical PEP/EC window)', riskWeight: 3 },
      { label: 'Within the past week', riskWeight: 2 },
      { label: 'More than a month ago', riskWeight: 1 },
      { label: 'Just seeking general educational guidance', riskWeight: 0 },
    ],
  },
  {
    id: 'q3',
    question: 'Are you experiencing any systemic physical distress?',
    options: [
      { label: 'High fever, pelvic pain, or difficulty breathing', riskWeight: 3 },
      { label: 'Mild discomfort or skin irritation', riskWeight: 2 },
      { label: 'No physical pain or fever', riskWeight: 0 },
    ],
  },
];

export default function SymptomCheckerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleSelectOption = (riskWeight: number) => {
    const updatedAnswers = [...answers, riskWeight];
    setAnswers(updatedAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const calculateRiskLevel = () => {
    const totalScore = answers.reduce((acc, curr) => acc + curr, 0);
    if (totalScore >= 7) {
      return {
        level: 'HIGH RISK',
        color: 'text-red-400',
        bg: 'bg-red-950/40 border-red-500/40',
        recommendation:
          'Immediate action recommended. If exposure occurred within 72 hours, initiate HIV PEP or Emergency Contraception promptly. Speak directly with a practitioner or visit an urgent clinic.',
        urgentBtn: true,
      };
    } else if (totalScore >= 4) {
      return {
        level: 'MODERATE RISK',
        color: 'text-amber-400',
        bg: 'bg-amber-950/40 border-amber-500/40',
        recommendation:
          'Medical consultation advised within 24-48 hours. Schedule a standard pass consultation with a verified practitioner to evaluate STI testing or treatment.',
        urgentBtn: false,
      };
    } else {
      return {
        level: 'LOW RISK',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40 border-emerald-500/40',
        recommendation:
          'Low immediate physical risk. Recommended for routine educational Q&A or standard contraception planning.',
        urgentBtn: false,
      };
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-gradient-to-r from-blue-950/40 to-slate-900 space-y-2 text-center">
        <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          🩺 Interactive Triage Tool
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">SRH Symptom Checker</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Answer 3 quick confidential questions to evaluate your health risk and receive recommended next steps based on WHO clinical guidelines.
        </p>
      </div>

      {!completed ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-6">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}% Completed</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Box */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {QUESTIONS[currentStep].question}
            </h3>

            <div className="space-y-3 pt-2">
              {QUESTIONS[currentStep].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option.riskWeight)}
                  className="w-full text-left p-4 rounded-2xl bg-[#162337] hover:bg-blue-900/30 border border-slate-800/80 hover:border-cyan-500/50 transition-all group flex items-center justify-between"
                >
                  <span className="text-xs sm:text-sm text-slate-200 group-hover:text-white font-medium">
                    {option.label}
                  </span>
                  <span className="text-slate-500 group-hover:text-cyan-400 text-sm">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-6">
          {(() => {
            const result = calculateRiskLevel();
            return (
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${result.bg} text-center space-y-2`}>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Assessed Risk Status</span>
                  <h2 className={`text-3xl font-black ${result.color}`}>{result.level}</h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg mx-auto pt-2">
                    {result.recommendation}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href="/book"
                    className="flex-grow py-3.5 px-6 rounded-xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs sm:text-sm shadow-lg shadow-cyan-900/20"
                  >
                    Book Verified Practitioner Session →
                  </Link>
                  {result.urgentBtn && (
                    <a
                      href="tel:114"
                      className="py-3.5 px-6 rounded-xl font-bold text-center bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm"
                    >
                      📞 Dial RBC Hotline 114
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setCurrentStep(0);
                      setAnswers([]);
                      setCompleted(false);
                    }}
                    className="py-3.5 px-5 rounded-xl text-xs font-bold text-slate-400 hover:text-white border border-slate-700/80"
                  >
                    Retake Assessment
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
