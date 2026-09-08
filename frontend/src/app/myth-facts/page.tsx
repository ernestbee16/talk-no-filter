'use client';

import React, { useState, useEffect } from 'react';
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

export default function MythFactsHub() {
  const [cards, setCards] = useState<MythFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Submit Claim state
  const [claimText, setClaimText] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mythfacts`);
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mythfacts/submit-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claimText }),
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setClaimText('');
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareClick = async (cardId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/mythfacts/${cardId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share' }),
      });
      fetchCards(); // reload
      
      // Copy to clipboard simulation
      const shareUrl = `${window.location.origin}/myth-facts?card=${cardId}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Debunking link copied! Share this directly on WhatsApp/TikTok to fight peer rumours.');
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCards = cards.filter((card) =>
    card.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.verifiedFact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex-grow space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">Rumour Buster</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Myth vs. Fact Hub</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Social media forwards and peer warnings can be dangerous. We check local claims against medical resources and publish clear corrections.
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search verified facts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel h-48 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredCards.map((card) => (
                <div key={card.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between border-slate-800/80 bg-[#0f172a]/70">
                  {/* Claim header (amber alert style) */}
                  <div className="p-6 bg-amber-950/20 border-b border-slate-800/80 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                      <span>⚠️ Claim circulating on social media:</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                      {"\"" + card.claim + "\""}
                    </h3>
                  </div>

                  {/* Fact section (teal/blue style) */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                      <span>✓ Verified Fact check:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {card.verifiedFact}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500 pt-4 border-t border-slate-800/80">
                      <div className="flex items-center space-x-1 font-semibold text-blue-300">
                        <span>Source:</span>
                        <span className="bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{card.sourceName}</span>
                      </div>
                      
                      {card.sourceUrl && (
                        <a
                          href={card.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:underline inline-flex items-center space-x-1"
                        >
                          <span>Official resource</span> <span>↗</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Interactive Footer */}
                  <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex space-x-4">
                      <span>👁 {card.viewCount} views</span>
                      <span>🔄 {card.shareCount} shares</span>
                    </div>
                    <button
                      onClick={() => handleShareClick(card.id)}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center space-x-1"
                    >
                      <span>Share to WhatsApp</span> <span>📤</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              No matching verified facts found.
            </div>
          )}
        </div>

        {/* Submission Panel */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border-slate-800/80">
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">Fact-Checking Queue</span>
          <h3 className="text-lg font-bold text-white">{"\"Where did you hear this?\""}</h3>
          <p className="text-slate-400 text-xs leading-normal">
            Heard something from peers or family that doesn&apos;t sound right? Paste the claim below. Our certified experts will investigate, look up reliable studies, and create a card.
          </p>

          <form onSubmit={handleClaimSubmit} className="space-y-3 pt-2">
            <textarea
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="e.g. 'I read on a WhatsApp forward that taking birth control pills with hot milk increases efficacy...'"
              rows={4}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              required
            />

            {submitSuccess && (
              <p className="text-xs text-teal-400 font-semibold">
                ✓ Received anonymously. We will review and verify!
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-teal-600 text-white transition-opacity disabled:opacity-50 shadow-md shadow-teal-900/20"
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
