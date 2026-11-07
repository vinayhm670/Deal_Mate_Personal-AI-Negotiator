import React, { useState, useEffect } from 'react';
import {
  X,
  Brain,
  Sparkles,
  Activity,
  History,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Zap,
  Play,
  RotateCcw,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { hindsightClient } from '../../services/hindsightClientService';
import { DealDnaCard } from './DealDnaCard';
import type {
  DealDnaProfile,
  HindsightActivityEntry,
  HindsightConnectionStatus,
} from '../../types/hindsight';

interface MemoryIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDemoSession?: (query: string) => void;
}

export const MemoryIntelligenceModal: React.FC<MemoryIntelligenceModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDemoSession,
}) => {
  const [activeTab, setActiveTab] = useState<'deal_dna' | 'activity' | 'demo_runner' | 'reflect'>('deal_dna');
  const [status, setStatus] = useState<HindsightConnectionStatus>(hindsightClient.getStatus());
  const [dealDna, setDealDna] = useState<DealDnaProfile | null>(null);
  const [activity, setActivity] = useState<HindsightActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reflectionQuery, setReflectionQuery] = useState(
    'Synthesize the user shopping patterns, brand affinities, and negotiation responsiveness.'
  );
  const [reflectionResult, setReflectionResult] = useState<string>('');
  const [isReflecting, setIsReflecting] = useState(false);
  const [demoStepStatus, setDemoStepStatus] = useState<{
    step1: 'idle' | 'running' | 'done';
    step2: 'idle' | 'running' | 'done';
    step3: 'idle' | 'running' | 'done';
    log: string[];
  }>({
    step1: 'idle',
    step2: 'idle',
    step3: 'idle',
    log: [],
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [currentStatus, profile, logs] = await Promise.all([
        hindsightClient.checkHealth(),
        hindsightClient.getDealDNA(),
        hindsightClient.getActivity(),
      ]);
      setStatus(currentStatus);
      setDealDna(profile);
      setActivity(logs);
    } catch (e) {
      console.warn('Failed to load Hindsight dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = hindsightClient.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsub();
  }, []);

  const handleRunReflection = async () => {
    if (!reflectionQuery.trim()) return;
    setIsReflecting(true);
    setReflectionResult('');
    try {
      const res = await hindsightClient.reflect(reflectionQuery);
      if (res.success && res.reflectionText) {
        setReflectionResult(res.reflectionText);
      } else {
        setReflectionResult(
          `Reflection completed. (Reason: ${res.message || 'No memories found for synthesis'}).`
        );
      }
      // Refresh activity log
      const logs = await hindsightClient.getActivity();
      setActivity(logs);
    } catch (err: any) {
      setReflectionResult(`Reflection call failed: ${err?.message}`);
    } finally {
      setIsReflecting(false);
    }
  };

  const handleSeedDemoSession1 = async () => {
    setDemoStepStatus((prev) => ({
      ...prev,
      step1: 'running',
      log: [...prev.log, '⏳ Retaining Session 1 preferences in Hindsight persistent memory...'],
    }));

    const success = await hindsightClient.seedDemoSession('headphones_sony');
    await loadData();

    setDemoStepStatus((prev) => ({
      ...prev,
      step1: 'done',
      log: [
        ...prev.log,
        success
          ? '✅ Session 1 retained: "Wireless headphones under ₹3,000, Sony preference, battery > appearance + alternative brand rejected."'
          : '⚠️ Could not reach Hindsight service. (Ensure Hindsight daemon is active).',
      ],
    }));
  };

  const handleLaunchFreshSession2 = () => {
    setDemoStepStatus((prev) => ({
      ...prev,
      step2: 'done',
      log: [
        ...prev.log,
        '🚀 Launching Session 2 with fresh context: Querying "Find me good headphones" (Hindsight Recall will automatically apply Sony + under ₹3,000 + battery priority without re-prompting!).',
      ],
    }));

    if (onNavigateToDemoSession) {
      onClose();
      onNavigateToDemoSession('Find me good headphones');
    }
  };

  const handleResetMemories = async () => {
    await hindsightClient.seedDemoSession('clear');
    await loadData();
    setDemoStepStatus({
      step1: 'idle',
      step2: 'idle',
      step3: 'idle',
      log: ['🔄 Cleared memory activity and reset test state.'],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">HINDSIGHT MEMORY INTELLIGENCE</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  DEAL DNA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Persistent Long-Term Agent Memory & Adaptive Shopping Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Pill */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              status.connected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${status.connected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{status.connected ? `ONLINE (${status.apiVersion || '0.8.2'})` : 'STANDBY'}</span>
              {status.latencyMs !== undefined && (
                <span className="text-[10px] text-slate-400 font-mono">({status.latencyMs}ms)</span>
              )}
            </div>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-900/40 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('deal_dna')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'deal_dna'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            Deal DNA Profile
          </button>

          <button
            onClick={() => setActiveTab('demo_runner')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'demo_runner'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-400" />
            90-Second Judge Demo
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'activity'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Memory Activity ({activity.length})
          </button>

          <button
            onClick={() => setActiveTab('reflect')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'reflect'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Reflect Synthesizer
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: Deal DNA Profile */}
          {activeTab === 'deal_dna' && (
            <DealDnaCard dealDna={dealDna} isLoading={isLoading} />
          )}

          {/* Tab 2: 90-Second Judge Demo Runner */}
          {activeTab === 'demo_runner' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  Official 90-Second Hackathon Judge Demonstration Workflow
                </h3>
                <p className="text-xs text-slate-300">
                  Follow this verified 3-step sequence to demonstrate genuine Hindsight persistent memory,
                  cross-session recall, Deal DNA personalization, and adaptive negotiation.
                </p>
              </div>

              {/* 3 Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        Step 1 · Session 1
                      </span>
                      {demoStepStatus.step1 === 'done' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1.5">User Preference & Dislike</h4>
                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                      User requests: <span className="text-blue-300">"Wireless headphones under ₹3,000, Sony brand, battery &gt; appearance."</span> Later rejects generic alternative.
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      Action: Calls Hindsight <code className="text-indigo-300">retain()</code> to commit preferences to the user's isolated bank.
                    </p>
                  </div>

                  <button
                    onClick={handleSeedDemoSession1}
                    disabled={demoStepStatus.step1 === 'running'}
                    className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-2"
                  >
                    {demoStepStatus.step1 === 'running' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    Run Session 1 (Retain)
                  </button>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Step 2 · Session 2
                      </span>
                      {demoStepStatus.step2 === 'done' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1.5">Fresh Session Recall</h4>
                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                      Start fresh session without chat history. User simply enters: <span className="text-emerald-300">"Find me good headphones."</span>
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      Action: Calls Hindsight <code className="text-indigo-300">recall()</code>. Automatically prioritizes Sony, under ₹3,000, and long battery life!
                    </p>
                  </div>

                  <button
                    onClick={handleLaunchFreshSession2}
                    className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Launch Fresh Session 2 (Recall)
                  </button>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Step 3 · Negotiation
                      </span>
                      {demoStepStatus.step3 === 'done' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1.5">Adaptive Negotiation</h4>
                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                      Agent uses memory-backed strategy (Brand & Longevity Leverage) to negotiate down from ₹3,299 to ₹2,850 (14% discount).
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      Action: Retains settled deal outcome into Hindsight for future negotiations.
                    </p>
                  </div>

                  <button
                    onClick={handleResetMemories}
                    className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Demo State
                  </button>
                </div>
              </div>

              {/* Demo Log Console */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-900 text-slate-400">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    Demo Execution Log
                  </span>
                  <span>Bank: {dealDna?.bankId || 'dealmate_user_demo'}</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {demoStepStatus.log.length > 0 ? (
                    demoStepStatus.log.map((line, idx) => (
                      <div key={idx} className="text-slate-300">
                        {line}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600">Click "Run Session 1" to start the 90-second demonstration sequence.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Activity Feed */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hindsight API Activity Log ({activity.length} events)
                </h3>
                <span className="text-xs text-slate-500 font-mono">Real-time operation auditor</span>
              </div>

              {activity.length > 0 ? (
                <div className="space-y-2">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                              item.operation === 'RETAIN'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : item.operation === 'RECALL'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {item.operation}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              item.status === 'SUCCESS'
                                ? 'text-emerald-400'
                                : item.status === 'OFFLINE'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {item.durationMs}ms
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-mono">"{item.queryOrContent}"</p>
                        <p className="text-[11px] text-slate-400">{item.resultSummary}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No Hindsight API activity recorded yet.</p>
                  <p className="text-xs mt-1">Retain or recall operations will be logged here in real-time.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Reflect Synthesizer */}
          {activeTab === 'reflect' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Hindsight Reflection Engine
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Trigger an autonomous agentic reflection loop over your memory bank to synthesize cross-session
                  shopping patterns, brand affinities, and negotiation responsiveness.
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={reflectionQuery}
                    onChange={(e) => setReflectionQuery(e.target.value)}
                    placeholder="Enter reflection prompt..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleRunReflection}
                    disabled={isReflecting || !reflectionQuery.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isReflecting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    Run Reflection
                  </button>
                </div>
              </div>

              {reflectionResult && (
                <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                    Synthesized Agent Reflection
                  </span>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {reflectionResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
