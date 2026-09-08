'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';

interface Question {
  id: string;
  content: string;
  answer: string;
  publishedAt: string;
}

export default function AnonymousQA() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Submit Q&A state
  const [questionText, setQuestionText] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/published`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: questionText }),
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setQuestionText('');
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex-grow space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">Confidential Answers</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Anonymous Q&A Board</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Ask sensitive SRH or HIV questions with 100% privacy. No usernames, logins, or IP tracking. Answered questions are generalized before being posted to this search board.
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search Q&A database..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Q&A List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel h-36 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredQuestions.length > 0 ? (
            <div className="space-y-4">
              {filteredQuestions.map((q) => (
                <div key={q.id} className="glass-panel rounded-2xl p-6 space-y-4 bg-[#0f172a]/70 border-slate-800/80">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Question:</span>
                    <p className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                      {"\"" + q.content + "\""}
                    </p>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Verified Expert Answer:</span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {q.answer}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 text-right">
                    Answered on {new Date(q.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              No matching answered questions found. Ask a new one!
            </div>
          )}
        </div>

        {/* Submit Question Box */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border-slate-800/80">
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">Confidential Form</span>
          <h3 className="text-lg font-bold text-white">Ask an Anonymous Question</h3>
          <p className="text-slate-400 text-xs leading-normal">
            Your question is encrypted immediately. No user metadata, transaction logs, or IP data is kept. Our verified experts review and publish responses safely.
          </p>

          <form onSubmit={handleQuestionSubmit} className="space-y-3 pt-2">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. 'How long after possible exposure should I get tested for HIV? Does the window period change if I took PEP?'"
              rows={5}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              required
            />

            {submitSuccess && (
              <p className="text-xs text-teal-300 font-semibold leading-normal">
                ✓ Received. Submitter identity metadata successfully scrubbed. The answer will appear on this board once reviewed.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-teal-600 text-white transition-opacity disabled:opacity-50 shadow-md shadow-teal-900/20"
            >
              {submitting ? 'Submitting...' : 'Submit Question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
