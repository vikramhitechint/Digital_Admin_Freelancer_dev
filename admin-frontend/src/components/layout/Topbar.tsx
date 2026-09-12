import React from 'react';
import { Link as LinkIcon, Lock } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="w-full bg-[#080e1c] border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0 z-50">
      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>ZERO-TRUST IMMUTABLE AUDIT LOGS v4.18.2</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 flex items-center space-x-1">
          <LinkIcon className="text-blue-400 w-3 h-3" />
          <span>HASH CHAIN: WORM-STORAGE (WRITE ONCE, READ MANY)</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">ENCLAVE HSM: <span className="text-blue-300">0x7F9B...881E-STRICT</span></span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-amber-400/90 flex items-center space-x-1">
          <Lock className="w-3 h-3" />
          <span>READ-ONLY PROTOCOL: MUTATION ATTEMPTS REJECTED</span>
        </span>
        <span className="text-slate-600">|</span>
        <span>BLOCK #19,482,904</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">UTC {new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
    </div>
  );
}
