'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/config/api';

interface Question {
  id: string;
  content: string;
  answer: string;
  status: string;
  submittedAt: string;
}

interface MythDraft {
  id: string;
  claim: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { token, isExpert } = useAuth();

  // Moderate states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myths, setMyths] = useState<MythDraft[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [qaAnswers, setQaAnswers] = useState<{ [id: string]: string }>({});
  const [qaEditedQuestions, setQaEditedQuestions] = useState<{ [id: string]: string }>({});
  
  const [mythFactText, setMythFactText] = useState<{ [id: string]: string }>({});
  const [mythSourceText, setMythSourceText] = useState<{ [id: string]: string }>({});
  const [mythSourceUrl, setMythSourceUrl] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    if (token && isExpert) {
      fetchQueues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isExpert]);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      // Fetch Q&A queue
      const resQa = await fetch(`${API_BASE_URL}/api/questions/moderation-queue`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (resQa.ok) {
        const data = await resQa.json();
        setQuestions(data);
        
        const ansMap: { [id: string]: string } = {};
        const qMap: { [id: string]: string } = {};
        data.forEach((q: Question) => {
          ansMap[q.id] = q.answer || '';
          qMap[q.id] = q.content || '';
        });
        setQaAnswers(ansMap);
        setQaEditedQuestions(qMap);
      }

      // Fetch Myth queue
      const resMyth = await fetch(`${API_BASE_URL}/api/mythfacts/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (resMyth.ok) {
        const data = await resMyth.json();
        setMyths(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnswer = async (questionId: string) => {
    const answer = qaAnswers[questionId] || '';
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ questionId, answer }),
      });
      if (res.ok) {
        alert('Answer updated successfully.');
        fetchQueues();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishQuestion = async (questionId: string) => {
    const content = qaEditedQuestions[questionId] || '';
    const answer = qaAnswers[questionId] || '';
    
    if (!content.trim() || !answer.trim()) {
      alert('Answer and Question content are required to publish FAQ.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ questionId, content, answer }),
      });
      if (res.ok) {
        alert('Question published to public FAQ.');
        fetchQueues();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishMythFact = async (draftId: string, originalClaim: string) => {
    const verifiedFact = mythFactText[draftId] || '';
    const sourceName = mythSourceText[draftId] || '';
    const sourceUrl = mythSourceUrl[draftId] || '';

    if (!verifiedFact.trim() || !sourceName.trim()) {
      alert('Verified fact text and reliable source attribution are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/mythfacts/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          draftId,
          claim: originalClaim,
          verifiedFact,
          sourceName,
          sourceUrl,
        }),
      });

      if (res.ok) {
        alert('Myth vs. Fact card published successfully!');
        fetchQueues();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!token || !isExpert) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-4">
        <div className="text-4xl">🔐</div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400">
          This moderation board is restricted to verified clinical professionals.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex-grow space-y-12 animate-fade-in">
      {/* Overview Analytics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 bg-[#0f172a]/70 border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Platform Revenue</span>
          <span className="text-xl font-black text-teal-400 block mt-1">14,500 RWF</span>
        </div>
        <div className="glass-panel rounded-xl p-4 bg-[#0f172a]/70 border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Sessions</span>
          <span className="text-xl font-black text-slate-100 block mt-1">8 passes</span>
        </div>
        <div className="glass-panel rounded-xl p-4 bg-[#0f172a]/70 border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Platinum Subs</span>
          <span className="text-xl font-black text-blue-300 block mt-1">2 members</span>
        </div>
        <div className="glass-panel rounded-xl p-4 bg-[#0f172a]/70 border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Questions</span>
          <span className="text-xl font-black text-amber-400 block mt-1">{questions.length} items</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Anonymous Q&A Moderation Queue */}
        <div className="space-y-6">
          <div className="border-b border-slate-800/80 pb-2">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              📥 Anonymous Q&A Inbox
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Generalize questions to clean personal identifiers (names, locations) before publishing.
            </p>
          </div>

          {loading ? (
            <div className="h-32 glass-panel rounded-xl animate-pulse"></div>
          ) : questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="glass-panel rounded-xl p-6 bg-[#0f172a]/70 border-slate-800/80 space-y-4">
                  {/* Edit Question Panel */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Question Text (Generalize if necessary):
                    </label>
                    <textarea
                      value={qaEditedQuestions[q.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQaEditedQuestions((prev) => ({ ...prev, [q.id]: val }));
                      }}
                      rows={2}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Reply Field */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-teal-400 uppercase tracking-wider">
                      Your Medical Response:
                    </label>
                    <textarea
                      value={qaAnswers[q.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQaAnswers((prev) => ({ ...prev, [q.id]: val }));
                      }}
                      placeholder="Write your clinical answer here..."
                      rows={3}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 text-xs">
                    <button
                      onClick={() => handleSaveAnswer(q.id)}
                      className="bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={() => handlePublishQuestion(q.id)}
                      className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-md shadow-teal-900/20"
                    >
                      Publish FAQ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic">Q&A moderation queue is currently empty.</p>
          )}
        </div>

        {/* Right Column: Myth vs. Fact Review Queue */}
        <div className="space-y-6">
          <div className="border-b border-slate-800/80 pb-2">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              📥 User Myth Claims Inbox
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Debunk claims submitted by youth and attach verifiable clinical source links.
            </p>
          </div>

          {loading ? (
            <div className="h-32 glass-panel rounded-xl animate-pulse"></div>
          ) : myths.length > 0 ? (
            <div className="space-y-6">
              {myths.map((m) => (
                <div key={m.id} className="glass-panel rounded-xl p-6 bg-[#0f172a]/70 border-slate-800/80 space-y-4">
                  <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-amber-400 block uppercase text-[9px] tracking-wider">Submitted Claim:</span>
                    <p className="text-slate-300 italic font-semibold">{"\"" + m.claim + "\""}</p>
                  </div>

                  {/* Fact Response */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Verified Fact Check Content:
                    </label>
                    <textarea
                      value={mythFactText[m.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMythFactText((prev) => ({ ...prev, [m.id]: val }));
                      }}
                      placeholder="e.g. 'This is false. The virus cannot survive in...'"
                      rows={3}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Credible Source */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Source Name (e.g. RBC, WHO)
                      </label>
                      <input
                        type="text"
                        value={mythSourceText[m.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMythSourceText((prev) => ({ ...prev, [m.id]: val }));
                        }}
                        placeholder="World Health Organization"
                        className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Reference URL
                      </label>
                      <input
                        type="url"
                        value={mythSourceUrl[m.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMythSourceUrl((prev) => ({ ...prev, [m.id]: val }));
                        }}
                        placeholder="https://..."
                        className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => handlePublishMythFact(m.id, m.claim)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-blue-900/20"
                    >
                      Publish Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic">No user-submitted claims currently pending review.</p>
          )}
        </div>
      </div>
    </div>
  );
}
