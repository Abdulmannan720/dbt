import React from 'react';
import { Volume2, RotateCcw, ShieldCheck, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: 'matcher' | 'data' | 'tracker';
  setActiveTab: (tab: 'matcher' | 'data' | 'tracker') => void;
  onReset: () => void;
  onStartVoice: () => void;
  onOpenDatabase: () => void;
  dbStatus?: {
    status: 'connected' | 'needs_password' | 'error' | 'disconnected';
    host: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onReset,
  onStartVoice,
  onOpenDatabase,
  dbStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('matcher')}
              className="text-left group cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <ShieldCheck className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors block leading-tight">
                  DBT Rakshak
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:block">
                  Direct Benefit Transfer & Eligibility Guard
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('matcher')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer ${
                activeTab === 'matcher'
                  ? 'border-amber-600 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Find My Schemes
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer ${
                activeTab === 'data'
                  ? 'border-amber-600 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Corpus & Data Transparency
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer ${
                activeTab === 'tracker'
                  ? 'border-amber-600 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Tracked Applications
            </button>
            <a
              href="https://myscheme.gov.in"
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap shrink-0 text-slate-500 hover:text-slate-900 transition-colors py-1"
            >
              myScheme Portal ↗
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Database button */}
            <button
              onClick={onOpenDatabase}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Supabase PostgreSQL database details"
            >
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Supabase</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.status === 'connected'
                    ? 'bg-emerald-500'
                    : dbStatus?.status === 'needs_password'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
            </button>

            <button
              onClick={onReset}
              title="Reset profile to start fresh"
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onStartVoice}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-amber-200" />
              <span>Voice Search</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
