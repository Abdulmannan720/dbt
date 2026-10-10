import React from 'react';
import { CriterionCheck } from '../types/scheme';
import { Check, X, HelpCircle, AlertTriangle } from 'lucide-react';

interface CriterionChipProps {
  check: CriterionCheck;
}

export const CriterionChip: React.FC<CriterionChipProps> = ({ check }) => {
  const getBadgeStyle = () => {
    switch (check.result) {
      case 'PASS':
        return {
          icon: <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
          textColor: 'text-emerald-900',
          bg: 'bg-emerald-50/70 border-emerald-200/80',
          badgeText: 'PASS',
        };
      case 'FAIL':
        return {
          icon: <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
          textColor: 'text-rose-900',
          bg: 'bg-rose-50/70 border-rose-200/80',
          badgeText: 'FAIL',
        };
      case 'UNKNOWN':
      default:
        return {
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
          textColor: 'text-slate-700',
          bg: 'bg-slate-100/70 border-slate-200/80',
          badgeText: 'UNVERIFIED',
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div
      className={`p-2 rounded-md border text-xs flex items-start gap-2 ${style.bg}`}
      title={check.reason}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-900">{check.name}:</span>
          <span className="text-[11px] font-mono font-bold text-slate-600">
            {style.badgeText}
          </span>
          {check.isProxy && (
            <span className="text-[10px] text-amber-700 font-medium flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>approx</span>
            </span>
          )}
        </div>
        <p className={`text-[11px] ${style.textColor} leading-tight mt-0.5`}>
          {check.reason}
        </p>
      </div>
    </div>
  );
};
