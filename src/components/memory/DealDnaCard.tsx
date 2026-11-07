import React from 'react';
import {
  Brain,
  Shield,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Battery,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';
import type { DealDnaProfile } from '../../types/hindsight';

interface DealDnaCardProps {
  dealDna: DealDnaProfile | null;
  isLoading?: boolean;
}

export const DealDnaCard: React.FC<DealDnaCardProps> = ({ dealDna, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center animate-pulse">
        <Brain className="w-8 h-8 mx-auto text-indigo-400 mb-2 animate-bounce" />
        <p className="text-slate-300 text-sm font-medium">Recalling and synthesizing Deal DNA from Hindsight memory...</p>
      </div>
    );
  }

  if (!dealDna) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center">
        <Brain className="w-8 h-8 mx-auto text-slate-500 mb-2" />
        <p className="text-slate-300 text-sm font-medium">No Deal DNA memories accumulated yet.</p>
        <p className="text-slate-500 text-xs mt-1">Start shopping or run Session 1 to establish your memory bank.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">DEAL DNA PROFILE</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {dealDna.memoryCount} Memories Retained
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Bank: <span className="text-indigo-300">{dealDna.bankId}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-slate-500" />
              Last updated: {new Date(dealDna.lastUpdated).toLocaleTimeString()}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 justify-end mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Strict Per-User Isolated Memory
            </span>
          </div>
        </div>
      </div>

      {/* Grid of DNA Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preferred & Disliked Brands */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Brand Affinities</h4>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 block mb-1.5 flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> Preferred Brands:
              </span>
              {dealDna.preferredBrands.length > 0 ? (
                dealDna.preferredBrands.map((b, idx) => (
                  <div key={idx} className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-2.5 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{b.brand}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                        {b.confidence}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 italic">"{b.evidence}"</p>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500">No explicit brand preferences recorded yet.</span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-semibold text-rose-400 block mb-1.5 flex items-center gap-1">
                <ThumbsDown className="w-3 h-3" /> Rejected Brands / Alternatives:
              </span>
              {dealDna.rejectedBrands.length > 0 ? (
                dealDna.rejectedBrands.map((b, idx) => (
                  <div key={idx} className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-2.5 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-200">{b.brand}</span>
                      <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Avoided</span>
                    </div>
                    <p className="text-xs text-rose-300/90 mt-1">{b.reason}</p>
                    <p className="text-[11px] text-slate-400 mt-1 italic">Evidence: "{b.evidence}"</p>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500">No brand rejections recorded.</span>
              )}
            </div>
          </div>
        </div>

        {/* Budget Dynamics & Flexibility */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Budget & Flexibility</h4>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Typical Budget Cap</span>
                <span className="text-lg font-bold text-white">₹{dealDna.typicalBudget.max.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Price Flexibility</span>
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {dealDna.typicalBudget.flexibility}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2 italic">"{dealDna.typicalBudget.evidence}"</p>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-semibold text-amber-400 block mb-1.5 flex items-center gap-1">
              <Battery className="w-3 h-3" /> Critical Feature Priorities:
            </span>
            {dealDna.criticalFeatures.length > 0 ? (
              dealDna.criticalFeatures.map((f, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-100">{f.feature}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      {f.priority} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 italic">"{f.evidence}"</p>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500">No feature priorities retained yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Observed Patterns & Adaptive Negotiation History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Observed Patterns */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Observed Purchasing Patterns</h4>
          </div>

          {dealDna.observedPurchasingPatterns.length > 0 ? (
            <ul className="space-y-2">
              {dealDna.observedPurchasingPatterns.map((p, idx) => (
                <li key={idx} className="text-xs text-slate-300 bg-purple-950/20 border border-purple-500/20 rounded-lg p-2.5 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">Observing patterns as sessions progress...</p>
          )}

          <div className="mt-4">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recently Learned Preferences</h5>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {dealDna.recentlyLearnedPreferences.map((pref, idx) => (
                <div key={idx} className="text-[11px] text-slate-300 flex items-center justify-between bg-slate-800/40 px-2 py-1.5 rounded border border-slate-800">
                  <span className="truncate max-w-[70%]">{pref.text}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                    pref.type === 'explicit'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {pref.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Negotiation History & Learnings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Negotiation Intelligence & Outcomes</h4>
          </div>

          {dealDna.negotiationExperiences.length > 0 ? (
            <div className="space-y-3">
              {dealDna.negotiationExperiences.map((neg, idx) => (
                <div key={idx} className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{neg.productName}</span>
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                      {neg.discountPct}% Discount
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-2 mb-2 font-mono">
                    <span className="line-through text-slate-500">₹{neg.initialPrice}</span>
                    <span className="text-emerald-400 font-bold">₹{neg.finalPrice}</span>
                    <span className="text-slate-400">({neg.outcome})</span>
                  </div>
                  <p className="text-xs text-amber-200/90 bg-amber-900/20 p-2 rounded border border-amber-500/20">
                    <span className="font-semibold text-white">Strategy:</span> {neg.strategyUsed}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    <span className="font-semibold text-slate-300">Learnings:</span> {neg.keyLearnings}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No verified negotiation outcomes recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
