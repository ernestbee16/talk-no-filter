'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  href?: string;
}

export default function Logo({
  size = 'md',
  showSubtitle = false,
  className = '',
  href = '/',
}: LogoProps) {
  const sizeMap = {
    sm: { img: 28, text: 'text-base sm:text-lg', gap: 'space-x-2' },
    md: { img: 36, text: 'text-lg sm:text-xl', gap: 'space-x-3' },
    lg: { img: 48, text: 'text-2xl sm:text-3xl', gap: 'space-x-4' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex items-center ${currentSize.gap} group ${className}`}>
      {/* Icon Container with subtle glow & border */}
      <div className="relative flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-900/90 border border-slate-700/60 p-1 group-hover:border-teal-400/50 transition-all duration-300 shadow-md shadow-teal-900/20">
        <Image
          src="/logo.png"
          alt="Talk No Filter Logo"
          width={currentSize.img}
          height={currentSize.img}
          className="rounded-lg object-contain transform group-hover:scale-105 transition-transform duration-300"
          priority
        />
        {/* Glow indicator */}
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-teal-400 opacity-20 blur-sm group-hover:opacity-40 transition-opacity -z-10" />
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span className={`font-black tracking-wider bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent ${currentSize.text}`}>
          TALK NO FILTER
        </span>
        {showSubtitle && (
          <span className="text-[10px] sm:text-xs font-medium tracking-widest text-teal-400/90 uppercase -mt-0.5">
            Verified Health & Confidential Support
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
