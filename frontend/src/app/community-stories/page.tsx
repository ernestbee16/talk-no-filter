'use client';

import React, { useState } from 'react';

interface Story {
  id: string;
  category: string;
  excerpt: string;
  reactions: number;
}

const INITIAL_STORIES: Story[] = [
  {
    id: '1',
    category: 'HIV PEP Emergency Recovery',
    excerpt:
      'I was terrified after a broken condom incident at 2 AM. I used Talk No Filter to get a 15-minute quick pass and learned about the 72-hour PEP window. The practitioner at Kacyiru Hospital was non-judgmental and gave me PEP free of stigma. My 3-month test came back negative!',
    reactions: 42,
  },
  {
    id: '2',
    category: 'Contraception Myth Relief',
    excerpt:
      'My friends in my WhatsApp group kept telling me birth control implants cause stomach tumors. I posted on the Myth Hub here and received a clear WHO-backed explanation. Knowing the truth allowed me to choose a safe implant at my local health center.',
    reactions: 38,
  },
];

export default function CommunityStoriesPage() {
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);

  const handleReact = (id: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, reactions: s.reactions + 1 } : s))
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 space-y-2">
        <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          🤍 Peer Support & Empowerment
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Anonymous Community Stories</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Real, anonymous stories from young people across Rwanda who overcame health anxiety, accessed PEP/PrEP, and found non-judgmental care.
        </p>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="glass-panel p-6 rounded-3xl border-slate-800/80 bg-[#101C2C] space-y-3 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                {story.category}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">100% Anonymous Youth Story</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              &quot;{story.excerpt}&quot;
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => handleReact(story.id)}
                className="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 text-xs px-3 py-1.5 rounded-xl transition-all"
              >
                <span>💙 Support Story</span>
                <span className="font-bold text-cyan-400">({story.reactions})</span>
              </button>

              <span className="text-[10px] text-slate-500">Zero public profiles or tracking</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
