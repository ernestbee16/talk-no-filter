'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';

interface Slot {
  startTime: string;
  endTime: string;
  expert: {
    name: string;
    specialty: string;
  };
}

interface Booking {
  id: string;
  slotId: string;
  serviceType: string;
  status: string;
  videoRoomUrl: string | null;
  createdAt: string;
  slot: Slot | null;
}

export default function UserDashboard() {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400">
          Please log in using your Mobile Money phone number to access your booked consultations list.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex-grow space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white">My Consultation Room</h2>
          <p className="text-slate-400 text-xs mt-1">
            Logged in as pseudonymous handset ID: <span className="text-slate-200">{user?.phone}</span>
          </p>
        </div>

        {/* Wallet Credit Summary */}
        <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2 text-xs">
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Standard passes</span>
            <span className="text-amber-400 font-black text-sm">{user?.wallet?.sessionCredits || 0} credits</span>
          </div>
          <span className="text-slate-700 text-lg">|</span>
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Platinum time</span>
            <span className="text-teal-400 font-black text-sm">{user?.wallet?.minuteBalance || 0} mins</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-teal-400">
          Scheduled Consultations
        </h3>

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 glass-panel rounded-xl animate-pulse"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
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
                  className="glass-panel rounded-xl p-6 bg-[#0f172a]/70 border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-teal-400/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-300">
                        Consultation with:
                      </span>
                      <span className="text-sm font-bold text-white">
                        {booking.slot?.expert.name || 'Assigned Expert'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-0.5">
                      <div>Specialty: {booking.slot?.expert.specialty || 'General Practitioner'}</div>
                      <div>Type: <span className="uppercase font-semibold text-blue-300 text-[10px]">{booking.serviceType.replace('_', ' ')}</span></div>
                      <div>Date: <span className="text-slate-300 font-medium">{formattedDate} at {formattedTime}</span></div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                      booking.status === 'confirmed'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 animate-pulse'
                        : 'border-slate-800/80 bg-slate-900/60 text-slate-400'
                    }`}>
                      {booking.status}
                    </span>

                    {active && (
                      <Link
                        href={`/room/${booking.id}`}
                        className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-md shadow-teal-900/20 transition-all transform hover:-translate-y-0.5"
                      >
                        Enter Room 📞
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-8 text-center space-y-4 border-slate-800/80">
            <p className="text-xs text-slate-500 italic">No consultations scheduled yet.</p>
            <Link
              href="/book"
              className="inline-block bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              Book a Pass Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
