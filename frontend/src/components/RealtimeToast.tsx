'use client';

import React, { useState, useEffect } from 'react';

interface ToastActivity {
  id: string;
  icon: string;
  badge: string;
  message: string;
  timeAgo: string;
}

const MOCK_ACTIVITIES: ToastActivity[] = [
  {
    id: '1',
    icon: '⚡',
    badge: 'Confidential Q&A',
    message: 'Practitioner answered question regarding HIV PEP 72-hour window.',
    timeAgo: '12 seconds ago',
  },
  {
    id: '2',
    icon: '✓',
    badge: 'Rumour Debunked',
    message: '148 youth read verified fact check on birth control myths.',
    timeAgo: '1 minute ago',
  },
  {
    id: '3',
    icon: '🔒',
    badge: 'Private Consult',
    message: 'Anonymous 15-minute quick check session completed safely.',
    timeAgo: '3 minutes ago',
  },
  {
    id: '4',
    icon: '🎓',
    badge: 'Live Masterclass',
    message: '34 youth registered for upcoming Youth SRH webinar.',
    timeAgo: '5 minutes ago',
  },
];

export default function RealtimeToast() {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show toast after 2 seconds initial delay
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Cycle toasts every 7 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentActivityIndex((prev) => (prev + 1) % MOCK_ACTIVITIES.length);
        setIsVisible(true);
      }, 500);
    }, 8000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const current = MOCK_ACTIVITIES[currentActivityIndex];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm glass-panel border border-slate-700/80 bg-[#0f172a]/90 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-teal-950/40 animate-fade-in transition-all duration-300">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-sm text-teal-400">
          {current.icon}
        </div>

        <div className="flex-grow space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {current.badge}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{current.timeAgo}</span>
          </div>

          <p className="text-xs text-slate-200 leading-snug font-medium">
            {current.message}
          </p>

          <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-time platform activity</span>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-500 hover:text-slate-300 text-xs p-1"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
