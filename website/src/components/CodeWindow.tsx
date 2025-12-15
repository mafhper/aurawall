import React from 'react';

interface CodeWindowProps {
  filename?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable code window component with macOS-style title bar
 * Used for displaying code snippets across the promo site
 */
export default function CodeWindow({ filename, children, className = '' }: CodeWindowProps) {
  return (
    <div className={`w-full bg-black/80 rounded-xl border border-white/10 font-mono text-xs md:text-sm text-zinc-400 shadow-2xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="w-3 h-3 rounded-full bg-red-500/50"/>
        <div className="w-3 h-3 rounded-full bg-yellow-500/50"/>
        <div className="w-3 h-3 rounded-full bg-green-500/50"/>
        {filename && <span className="ml-4 text-xs text-zinc-600">{filename}</span>}
      </div>
      <div className="p-6 overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_code]:break-words">
        {children}
      </div>
    </div>
  );
}
