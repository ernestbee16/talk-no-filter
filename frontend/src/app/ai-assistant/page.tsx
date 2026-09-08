'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isEmergency?: boolean;
  emergencyContacts?: { name: string; phone: string; note: string }[] | null;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am the Talk No Filter AI Health Assistant, trained on World Health Organization (WHO) and Rwanda Biomedical Centre (RBC) guidelines. How can I help you today?',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'How does HIV PEP work and what is the 72-hour window?',
    'Are birth control pills safe or do they cause infertility?',
    'What should I do if I missed a pill?',
    'Where can I get confidential HIV testing in Kigali?',
  ];

  const handleSendPrompt = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: prompt.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'ai',
            text: data.response,
            isEmergency: data.isEmergency,
            emergencyContacts: data.emergencyContacts,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'ai',
            text: 'I am unable to reach the health knowledge base right now. Please try again shortly or consult a practitioner directly.',
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: 'Server connection issue. Please ensure backend server is active.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 space-y-3">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <span>🤖 WHO & RBC Evidence-Based Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">AI Health Assistant</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Ask questions about Sexual & Reproductive Health, HIV PEP/PrEP, or contraception. Trained strictly on verified WHO & RBC medical guidance. 100% private and confidential.
        </p>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {samplePrompts.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(sample)}
            className="shrink-0 bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs px-3.5 py-2 rounded-xl transition-all"
          >
            💡 {sample}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="glass-panel rounded-3xl border-slate-800/80 bg-[#101C2C] flex flex-col h-[500px]">
        {/* Messages list */}
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-900/20'
                    : msg.isEmergency
                    ? 'bg-red-950/90 text-red-100 border border-red-500/40 rounded-bl-none animate-pulse'
                    : 'bg-[#162337] text-slate-200 border border-slate-800/80 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Emergency Hotline Button Box */}
                {msg.isEmergency && msg.emergencyContacts && (
                  <div className="mt-4 pt-3 border-t border-red-500/30 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-red-300 tracking-wider">Direct Toll-Free Emergency Support:</span>
                    <div className="flex flex-wrap gap-2">
                      {msg.emergencyContacts.map((contact, i) => (
                        <a
                          key={i}
                          href={`tel:${contact.phone}`}
                          className="inline-flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <span>📞 {contact.name}: {contact.phone}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 mt-1">
                {msg.sender === 'user' ? 'You' : 'AI Health Assistant'}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-cyan-400 text-xs">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span>Analyzing medical guidelines...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="p-3 sm:p-4 border-t border-slate-800/80 flex gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask a medical or reproductive health question..."
            className="flex-grow bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl disabled:opacity-40 transition-opacity"
          >
            Ask AI
          </button>
        </form>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center space-y-1">
        <p className="text-[11px] text-slate-400">
          ⚠️ <strong>Medical Disclaimer:</strong> The AI Assistant provides educational information based on WHO & RBC guidelines. It does not issue clinical diagnoses.
        </p>
        <Link href="/book" className="text-[11px] text-cyan-400 hover:underline font-semibold">
          Book a 1:1 confidential session with a licensed practitioner →
        </Link>
      </div>
    </div>
  );
}
