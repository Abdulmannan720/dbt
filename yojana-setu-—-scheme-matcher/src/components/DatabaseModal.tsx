import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Server,
  Globe,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface DbStatusResponse {
  configured: boolean;
  status: 'connected' | 'needs_password' | 'error' | 'disconnected';
  host: string;
  port: number;
  database: string;
  user: string;
  supabaseUrl: string;
  supabaseRestUrl?: string;
  message: string;
  lastChecked: string;
  tableCount?: number;
  connectionStringPreview?: string;
}

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: DbStatusResponse) => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [dbStatus, setDbStatus] = useState<DbStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
        if (onStatusChange) onStatusChange(data);
      }
    } catch (e) {
      console.warn('Failed to fetch DB status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setSubmitting(true);
    setTestError(null);
    try {
      const res = await fetch('/api/db/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassword('');
        setDbStatus(data.dbStatus);
        if (onStatusChange) onStatusChange(data.dbStatus);
      } else {
        setTestError(data.error || 'Failed to update database credentials');
      }
    } catch (err: any) {
      setTestError(err.message || 'Connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunTestQuery = async () => {
    setTestError(null);
    setTestResult(null);
    try {
      const res = await fetch('/api/db/test-query', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setTestResult(data.result);
      } else {
        setTestError(data.error || 'Query failed');
      }
    } catch (err: any) {
      setTestError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Supabase PostgreSQL Connection
              </h2>
              <p className="text-xs text-slate-500">
                Project: yojana setu · db.mbfouhyodhwbyqrzujuj.supabase.co
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              dbStatus?.status === 'connected'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : dbStatus?.status === 'needs_password'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            {dbStatus?.status === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="font-bold text-sm">
                {dbStatus?.status === 'connected'
                  ? 'Connected to Supabase PostgreSQL'
                  : dbStatus?.status === 'needs_password'
                  ? 'Supabase Configured — Password Required'
                  : 'Database Connection Error'}
              </div>
              <p className="leading-relaxed text-xs">
                {dbStatus?.message || 'Checking database parameters...'}
              </p>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Connection Details Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Connection Specifications
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>
                <span className="text-slate-500 font-sans text-[11px] block">Host:</span>
                <span className="font-bold text-slate-900 text-xs">
                  db.mbfouhyodhwbyqrzujuj.supabase.co
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[11px] block">Port:</span>
                <span className="text-slate-900 text-xs">5432 (SSL enabled)</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[11px] block">Database:</span>
                <span className="text-slate-900 text-xs">postgres</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[11px] block">User:</span>
                <span className="text-slate-900 text-xs">postgres</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-sans text-[11px] block">REST API Endpoint:</span>
                <span className="text-slate-900 text-xs break-all">
                  {dbStatus?.supabaseRestUrl || 'https://mbfouhyodhwbyqrzujuj.supabase.co/rest/v1/'}
                </span>
              </div>
            </div>
          </div>

          {/* Enter Password Form */}
          <form
            onSubmit={handleUpdatePassword}
            className="p-4 bg-white border border-slate-200 rounded-xl space-y-3"
          >
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>Enter Supabase Database Password</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Your connection string currently has the placeholder <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-800">[YOUR-PASSWORD]</code>. Enter your Supabase project database password below to establish live connection:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Supabase DB password..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
              <button
                type="submit"
                disabled={submitting || !password.trim()}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
              >
                {submitting ? 'Connecting...' : 'Connect Now'}
              </button>
            </div>
            {testError && (
              <p className="text-rose-600 text-xs bg-rose-50 p-2 rounded border border-rose-200">
                {testError}
              </p>
            )}
          </form>

          {/* Test Live Query */}
          {dbStatus?.status === 'connected' && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-700" />
                  <span>Verify Live SQL Execution</span>
                </span>
                <button
                  onClick={handleRunTestQuery}
                  className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-medium hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Run Query (SELECT NOW())
                </button>
              </div>
              {testResult && (
                <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* Supabase Dashboard Link */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
            <span>Supabase Dashboard URL:</span>
            <a
              href="https://supabase.com/dashboard/project/mbfouhyodhwbyqrzujuj"
              target="_blank"
              rel="noreferrer"
              className="text-amber-800 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Open Supabase Project</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
