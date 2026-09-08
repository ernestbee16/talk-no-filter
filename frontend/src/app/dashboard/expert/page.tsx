'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';

interface Slot {
  startTime: string;
  endTime: string;
}

interface Booking {
  id: string;
  userId: string;
  slotId: string;
  serviceType: string;
  status: string;
  videoRoomUrl: string | null;
  notes: string;
  slot: Slot | null;
}

export default function ExpertDashboard() {
  const { token, expert, isExpert } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // New slot form state
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [slotSubmitting, setSlotSubmitting] = useState(false);
  const [slotSuccess, setSlotSuccess] = useState(false);

  // Notes state
  const [editingNotes, setEditingNotes] = useState<{ [bookingId: string]: string }>({});
  const [savingNotes, setSavingNotes] = useState<{ [bookingId: string]: boolean }>({});

  useEffect(() => {
    if (token && isExpert) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isExpert]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/expert-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);

        // Prepopulate notes state
        const notesMap: { [id: string]: string } = {};
        data.forEach((b: Booking) => {
          notesMap[b.id] = b.notes || '';
        });
        setEditingNotes(notesMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate || !slotTime) return;

    setSlotSubmitting(true);
    setSlotSuccess(false);

    try {
      const startDateTime = new Date(`${slotDate}T${slotTime}`);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutes after

      const res = await fetch(`${API_BASE_URL}/api/experts/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      if (res.ok) {
        setSlotSuccess(true);
        setSlotDate('');
        setSlotTime('');
        setTimeout(() => setSlotSuccess(false), 5000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create slot.');
      }
    } catch (e) {
      console.error(e);
      alert('Network issue.');
    } finally {
      setSlotSubmitting(false);
    }
  };

  const handleSaveNotes = async (bookingId: string) => {
    const notesContent = editingNotes[bookingId] || '';
    setSavingNotes((prev) => ({ ...prev, [bookingId]: true }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          notes: notesContent,
        }),
      });

      if (res.ok) {
        alert('Notes saved and encrypted at rest successfully.');
      } else {
        alert('Failed to save notes.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  if (!token || !isExpert) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-4">
        <div className="text-4xl">🔐</div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400">
          This portal is restricted to verified practitioners. Please sign in as an expert using the navigation login modal.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left 2 Columns: Consultations List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <h2 className="text-2xl font-black text-white">Practitioner Consultation Board</h2>
          <p className="text-xs text-slate-400 mt-1">
            Expert: <span className="text-blue-300 font-semibold">{expert?.name}</span> ({expert?.specialty})
          </p>
        </div>

        {loading ? (
          <div className="h-48 glass-panel rounded-2xl animate-pulse"></div>
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const start = booking.slot ? new Date(booking.slot.startTime) : null;
              const formattedDate = start
                ? start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
                : '';
              const formattedTime = start
                ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              const active = booking.status === 'confirmed';

              return (
                <div
                  key={booking.id}
                  className="glass-panel rounded-2xl p-6 bg-[#0f172a]/70 border-slate-800/80 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Schedule
                      </span>
                      <span className="text-sm font-bold text-slate-200">
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-400">
                        Type: <span className="uppercase text-[10px] text-teal-400 font-bold">{booking.serviceType.replace('_', ' ')}</span>
                      </span>
                      {active && (
                        <Link
                          href={`/room/${booking.id}`}
                          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-teal-900/20"
                        >
                          Join Consultation 📞
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Encryption notes field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">
                        🔒 Secure Clinical Notes (Encrypted at Rest)
                      </span>
                      <button
                        onClick={() => handleSaveNotes(booking.id)}
                        disabled={savingNotes[booking.id]}
                        className="text-teal-400 hover:text-teal-300 font-bold text-xs"
                      >
                        {savingNotes[booking.id] ? 'Saving...' : 'Save & Encrypt'}
                      </button>
                    </div>
                    <textarea
                      value={editingNotes[booking.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingNotes((prev) => ({ ...prev, [booking.id]: val }));
                      }}
                      placeholder="Enter sensitive consult notes here. These are encrypted using AES-256-GCM and will never be shared with other clients or unverified admins."
                      rows={3}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-xs italic py-12">No client bookings scheduled with you yet.</p>
        )}
      </div>

      {/* Right Column: Manage Availability Slots */}
      <div className="space-y-6">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border-slate-800/80">
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">
            Planner
          </span>
          <h3 className="text-lg font-bold text-white">Add Availability Slots</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Open up new slots for youth to book. Each slot is set for 30 minutes duration.
          </p>

          <form onSubmit={handleAddSlot} className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Start Time
              </label>
              <input
                type="time"
                required
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            {slotSuccess && (
              <p className="text-xs text-teal-400 font-semibold">
                ✓ Availability slot added successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={slotSubmitting}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:opacity-95 shadow-md shadow-teal-900/30"
            >
              {slotSubmitting ? 'Creating...' : 'Add Slot'}
            </button>
          </form>
        </div>

        {/* Quick link for Q&A Moderation */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 bg-blue-950/20 border-blue-500/20">
          <h4 className="text-sm font-bold text-white">Anonymous Q&A queue</h4>
          <p className="text-xs text-slate-400 leading-normal">
            Moderate incoming questions, answer queries, and sanitize logs for publication.
          </p>
          <Link
            href="/dashboard/admin"
            className="inline-block bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-200 text-xs font-bold px-4 py-2 rounded-lg"
          >
            Moderate Q&A Board &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
