import React, { useState, useEffect } from 'react';
import { Database, Check, Copy, ExternalLink, X, RefreshCw, AlertCircle } from 'lucide-react';
import {
  initSupabaseClient,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
  isSupabaseConnected,
} from '../../supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [url, setUrl] = useState<string>('');
  const [anonKey, setAnonKey] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'schema'>('connect');

  useEffect(() => {
    try {
      setUrl(localStorage.getItem('dealmate_supabase_url') || (import.meta.env.VITE_SUPABASE_URL as string) || '');
      setAnonKey(localStorage.getItem('dealmate_supabase_anon_key') || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '');
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      localStorage.setItem('dealmate_supabase_url', url.trim());
      localStorage.setItem('dealmate_supabase_anon_key', anonKey.trim());
    } catch {
      // ignore
    }

    initSupabaseClient(url, anonKey);
    const res = await testSupabaseConnection(url, anonKey);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Supabase Integration</h3>
              <p className="text-xs text-slate-400">Connect DealMate database, deals & orders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill */}
        <div className="my-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs">
          <span className="text-slate-400 font-medium">Connection Status:</span>
          <span
            className={`px-2 py-0.5 rounded-full font-semibold flex items-center gap-1.5 ${
              isSupabaseConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {isSupabaseConnected ? 'Connected' : 'Using Local Fallback'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-800 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            API Credentials
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1-Click SQL Schema
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm">
          {activeTab === 'connect' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Supabase Anon / Public Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleSaveAndTest}
                  disabled={isTesting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing Connection...
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" /> Save & Test Supabase
                    </>
                  )}
                </button>

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1 transition-colors"
                >
                  Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-300 font-medium">
                  Copy & Paste into Supabase SQL Editor:
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

