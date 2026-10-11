import React from 'react';
import { Volume2, RotateCcw, ShieldCheck, Database, LogIn, CheckCircle2, Lock, LogOut } from 'lucide-react';
import { AuthenticatedUser } from './LoginPage';

interface HeaderProps {
  activeTab: 'matcher' | 'data' | 'tracker' | 'login';
  setActiveTab: (tab: 'matcher' | 'data' | 'tracker' | 'login') => void;
  currentUser: AuthenticatedUser | null;
  onLogout: () => void;
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
  currentUser,
  onLogout,
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
              onClick={() => setActiveTab(currentUser ? 'matcher' : 'login')}
              className="text-left group cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <ShieldCheck className="w-5 h-5 text-sky-200" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-800 transition-colors block leading-tight">
                  DBT Rakshak
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:block">
                  Direct Benefit Transfer & Eligibility Guard
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 single-line clean text navigation links (DBT Portal FIRST) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {/* 1. DBT Portal FIRST */}
            <button
              onClick={() => setActiveTab('login')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'border-blue-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>DBT Portal</span>
              {currentUser ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Authenticated" />
              ) : (
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                  Login Gateway
                </span>
              )}
            </button>

            {/* 2. Find My Schemes (Unlocked after login) */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setActiveTab('login');
                } else {
                  setActiveTab('matcher');
                }
              }}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matcher'
                  ? 'border-blue-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              } ${!currentUser ? 'text-slate-400 hover:text-slate-600' : ''}`}
              title={!currentUser ? 'Login required to access Scheme Discovery' : 'Find My Schemes'}
            >
              <span>Find My Schemes</span>
              {!currentUser && <Lock className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* 3. Corpus & Transparency (Unlocked after login) */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setActiveTab('login');
                } else {
                  setActiveTab('data');
                }
              }}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'data'
                  ? 'border-blue-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              } ${!currentUser ? 'text-slate-400 hover:text-slate-600' : ''}`}
              title={!currentUser ? 'Login required to access Corpus Data' : 'Corpus & Transparency'}
            >
              <span>Corpus & Transparency</span>
              {!currentUser && <Lock className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* 4. Tracked Applications (Unlocked after login) */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setActiveTab('login');
                } else {
                  setActiveTab('tracker');
                }
              }}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tracker'
                  ? 'border-blue-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              } ${!currentUser ? 'text-slate-400 hover:text-slate-600' : ''}`}
              title={!currentUser ? 'Login required to access Application Tracker' : 'Tracked Applications'}
            >
              <span>Tracked Applications</span>
              {!currentUser && <Lock className="w-3.5 h-3.5 text-slate-400" />}
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

            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="View DBT Profile & Beneficiary Ledger"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline truncate max-w-[120px]">{currentUser.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                </button>
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Logout from DBT Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0062d2] hover:bg-[#0052b3] active:scale-95 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}

            {currentUser && (
              <>
                <button
                  onClick={onReset}
                  title="Reset profile to start fresh"
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={onStartVoice}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-200" />
                  <span>Voice</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
