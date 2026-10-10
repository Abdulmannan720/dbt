import React, { useState } from 'react';
import { MatchEvaluation } from '../types/scheme';
import { CriterionChip } from './CriterionChip';
import {
  ExternalLink,
  FileCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

interface SchemeCardProps {
  evaluation: MatchEvaluation;
  onOpenApply: (evaluation: MatchEvaluation) => void;
  isTopMatch?: boolean;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  evaluation,
  onOpenApply,
  isTopMatch = false,
}) => {
  const { scheme, isNearMiss, checks, passedCount, unknownCount, failedCount } =
    evaluation;
  const [showAllChecks, setShowAllChecks] = useState(false);
  const [showProxyDetail, setShowProxyDetail] = useState(false);

  const checksList = Object.values(checks);
  const visibleChecks = showAllChecks ? checksList : checksList.slice(0, 4);

  return (
    <div
      className={`rounded-xl border transition-all relative ${
        isTopMatch
          ? 'bg-white border-amber-400 shadow-md ring-1 ring-amber-300/60'
          : isNearMiss
          ? 'bg-slate-50/80 border-slate-300'
          : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
      }`}
    >
      {/* Top Banner for Top Match or Near Miss */}
      {isTopMatch && (
        <div className="bg-amber-600 text-white text-[11px] font-semibold px-4 py-1 rounded-t-xl flex items-center justify-between">
          <span>TOP RECOMMENDED MATCH</span>
          <span className="font-mono">{passedCount} criteria passed</span>
        </div>
      )}
      {isNearMiss && !isTopMatch && (
        <div className="bg-rose-600/90 text-white text-[11px] font-semibold px-4 py-1 rounded-t-xl flex items-center justify-between">
          <span>NEAR MISS (1 CRITERION SHORT)</span>
          <span>Review failed criterion</span>
        </div>
      )}

      <div className="p-4 sm:p-5 space-y-4">
        {/* Metadata Header: Category · Ministry · Scope */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">{scheme.category}</span>
            <span aria-hidden="true">·</span>
            <span>{scheme.ministry}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-600">
              {scheme.stateName || 'Central / All States'}
            </span>
          </div>

          {/* Amber PROXY Badge */}
          {scheme.isProxy && (
            <button
              onClick={() => setShowProxyDetail(!showProxyDetail)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold text-[11px] cursor-pointer transition-colors"
              title="Click to learn why this scheme is marked as an approximation"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>PROXY RULE</span>
              <span className="text-[10px] font-normal underline">(Why?)</span>
            </button>
          )}
        </div>

        {/* Proxy Explanation Box */}
        {showProxyDetail && scheme.proxyNote && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Honest Caveat: Deprivation Proxy Approximation</span>
            </div>
            <p className="leading-relaxed">{scheme.proxyNote}</p>
            <p className="text-[11px] text-amber-800 italic">
              "We would rather show an honest 'maybe' than a confident lie about someone's legal entitlement."
            </p>
          </div>
        )}

        {/* Scheme Name & Benefit */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {scheme.name}
            </h3>
          </div>
          <div className="shrink-0 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-lg text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
              Direct Benefit
            </span>
            <span className="text-base sm:text-lg font-extrabold text-amber-950 font-mono tabular-nums">
              {scheme.benefitAmount}
            </span>
          </div>
        </div>

        {/* Short benefit summary */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {scheme.benefitDescription}
        </p>

        {/* Individual Criteria Checks */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Eligibility Breakdown by Criteria:</span>
            <span className="text-slate-500 font-mono text-[11px]">
              {passedCount} Passed · {unknownCount} Unverified
              {failedCount > 0 ? ` · ${failedCount} Failed` : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visibleChecks.map((check) => (
              <CriterionChip key={check.criterion} check={check} />
            ))}
          </div>

          {checksList.length > 4 && (
            <button
              onClick={() => setShowAllChecks(!showAllChecks)}
              className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>
                {showAllChecks
                  ? 'Show fewer criteria'
                  : `Show all ${checksList.length} criteria`}
              </span>
              {showAllChecks ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{scheme.documentsRequired.length} documents required</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={scheme.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => onOpenApply(evaluation)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Help Me Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
