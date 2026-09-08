'use client';

import React, { useState } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'What is the maximum time window to start HIV PEP after potential exposure?',
    options: ['24 Hours', '48 Hours', '72 Hours', '7 Days'],
    correctIndex: 2,
    explanation: 'PEP must be started within 72 hours max following potential exposure, ideally within the first 24 hours.',
  },
  {
    question: 'Do modern birth control pills cause permanent infertility?',
    options: ['Yes, always', 'No, fertility returns after stopping', 'Only if taken for >1 year', 'Yes, if under 20'],
    correctIndex: 1,
    explanation: 'Myth Debunked! Modern birth control pills do not cause permanent infertility; normal fertility returns after stopping.',
  },
];

export default function LearnPage() {
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (optionIdx: number) => {
    if (quizAnswered) return;
    setSelectedOption(optionIdx);
    setQuizAnswered(true);
    if (optionIdx === QUIZ_QUESTIONS[activeQuizIndex].correctIndex) {
      setScore(score + 1);
    }
  };

  const currentQ = QUIZ_QUESTIONS[activeQuizIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 space-y-2">
        <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          🎓 Youth Health Education Hub
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Learning Center & Interactive Quizzes</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Test your health knowledge, unlock achievement badges, and learn factual SRH information certified by WHO & RBC guidelines.
        </p>
      </div>

      {/* Interactive Quiz Module */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            Quiz Question {activeQuizIndex + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span className="text-xs font-bold text-amber-400">Score: {score} Badges Earned 🏆</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">{currentQ.question}</h3>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isCorrect = idx === currentQ.correctIndex;
              const isSelected = idx === selectedOption;

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm ${
                    quizAnswered
                      ? isCorrect
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : isSelected
                        ? 'bg-red-950/60 border-red-500 text-red-200'
                        : 'bg-[#162337] border-slate-800 text-slate-400'
                      : 'bg-[#162337] border-slate-800 hover:border-cyan-500/50 text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 space-y-2 animate-fade-in">
              <span className="font-bold text-cyan-400 block uppercase text-[10px]">Medical Explanation:</span>
              <p>{currentQ.explanation}</p>

              {activeQuizIndex < QUIZ_QUESTIONS.length - 1 && (
                <button
                  onClick={() => {
                    setActiveQuizIndex(activeQuizIndex + 1);
                    setSelectedOption(null);
                    setQuizAnswered(false);
                  }}
                  className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Next Question →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
