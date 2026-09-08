'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';

interface Webinar {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  recordingUrl: string | null;
}

export default function Webinars() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  // RSVP Form States
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [phone, setPhone] = useState('');
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState('');
  const [rsvpError, setRsvpError] = useState('');

  // Simulated Player state
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/webinars`);
      if (res.ok) {
        const data = await res.json();
        setWebinars(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebinar || !phone.trim()) return;
    
    setSubmittingRsvp(true);
    setRsvpSuccess('');
    setRsvpError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/webinars/${selectedWebinar.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setRsvpSuccess(data.message);
        setPhone('');
        setTimeout(() => {
          setSelectedWebinar(null);
          setRsvpSuccess('');
        }, 4000);
      } else {
        const err = await res.json();
        setRsvpError(err.error || 'Failed to complete RSVP.');
      }
    } catch (err) {
      console.error(err);
      setRsvpError('Connection issue.');
    } finally {
      setSubmittingRsvp(false);
    }
  };

  // Filter webinars into Upcoming vs. Past (Archive)
  const now = new Date();
  const upcoming = webinars.filter((w) => new Date(w.scheduledAt) >= now);
  
  // Past webinars (or anything with a recordingUrl)
  const past = webinars.filter((w) => new Date(w.scheduledAt) < now || w.recordingUrl !== null);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex-grow space-y-12">
      {/* Page Header */}
      <div>
        <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">Free Educational Info Sessions</span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Live Webinars & Masterclasses</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-xl">
          Learn about sexual health, HIV prevention, and wellness directly from experts. Standard webinars do not require logging in. Register to receive SMS/WhatsApp reminders.
        </p>
      </div>

      {/* Simulated Video Player Box */}
      {playingVideoUrl && (
        <div className="glass-panel rounded-2xl overflow-hidden bg-black p-4 space-y-4 animate-fade-in border-teal-500/30">
          <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
            <span className="text-teal-400 font-bold uppercase tracking-wider">🎥 Now Playing Recording</span>
            <button
              onClick={() => setPlayingVideoUrl(null)}
              className="text-slate-400 hover:text-white"
            >
              Close Player ✕
            </button>
          </div>
          
          <div className="aspect-video bg-slate-950 flex items-center justify-center relative rounded-lg border border-slate-800/80">
            {/* Mock Video screen */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/30 rounded-full flex items-center justify-center mx-auto text-teal-400 text-2xl animate-pulse">
                ▶
              </div>
              <p className="text-xs text-slate-400">Simulating webinar video streaming archive... (Standard MP4 player wrapper)</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Section 1: Upcoming Webinars */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider border-b border-slate-800/80 pb-2">
            🗓 Scheduled Live Sessions
          </h3>

          {loading ? (
            <div className="space-y-4">
              <div className="h-32 glass-panel rounded-xl animate-pulse"></div>
            </div>
          ) : upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map((w) => {
                const dateObj = new Date(w.scheduledAt);
                const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateString = dateObj.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

                return (
                  <div key={w.id} className="glass-panel rounded-xl p-6 space-y-4 bg-[#0f172a]/70 border-slate-800/80">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-extrabold text-white text-base leading-snug">{w.title}</h4>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{w.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-md shrink-0">
                        Live
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-800/80 pt-4">
                      <div>
                        <span className="block font-semibold text-slate-300">Starts: {timeString}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{dateString}</span>
                      </div>
                      <button
                        onClick={() => {
                          setRsvpSuccess('');
                          setRsvpError('');
                          setSelectedWebinar(w);
                        }}
                        className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-md shadow-teal-900/20"
                      >
                        Register Free (SMS alert)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No live webinars currently scheduled.</p>
          )}
        </div>

        {/* Section 2: Historical Recordings Archive */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider border-b border-slate-800/80 pb-2">
            📂 Recorded Playbacks
          </h3>

          {loading ? (
            <div className="space-y-4">
              <div className="h-32 glass-panel rounded-xl animate-pulse"></div>
            </div>
          ) : past.length > 0 ? (
            <div className="space-y-4">
              {past.map((w) => {
                const dateObj = new Date(w.scheduledAt);
                const dateString = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <div key={w.id} className="glass-panel rounded-xl p-6 space-y-4 bg-[#0f172a]/70 border-slate-800/80">
                    <div>
                      <h4 className="font-bold text-white text-sm">{w.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">{w.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-3">
                      <span>Streamed on {dateString}</span>
                      <button
                        onClick={() => setPlayingVideoUrl(w.recordingUrl || 'https://sample.mp4')}
                        className="text-teal-400 hover:text-teal-300 font-bold flex items-center space-x-1"
                      >
                        <span>Play Video</span> <span>▶</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic font-medium">No webinar playbacks in the archive yet.</p>
          )}
        </div>
      </div>

      {/* RSVP Slide-in Modal */}
      {selectedWebinar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070c]/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm glass-panel border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6 relative shadow-2xl shadow-teal-950/40">
            <button
              onClick={() => setSelectedWebinar(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-base font-black text-white">RSVP for Webinar</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {"\"" + selectedWebinar.title + "\""}
              </p>
            </div>

            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-300 font-semibold uppercase tracking-wider mb-2">
                  Enter phone number for SMS reminders
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +250 788 123 456"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {rsvpSuccess && <p className="text-xs text-teal-400 font-semibold">{rsvpSuccess}</p>}
              {rsvpError && <p className="text-xs text-rose-400 font-semibold">{rsvpError}</p>}

              <button
                type="submit"
                disabled={submittingRsvp}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:opacity-95 shadow-md shadow-teal-900/30"
              >
                {submittingRsvp ? 'Confirming...' : 'Confirm RSVP'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
