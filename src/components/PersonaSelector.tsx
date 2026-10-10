import React from 'react';
import { DEMO_PERSONAS } from '../data/personas';
import { DemoPersona } from '../types/scheme';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface PersonaSelectorProps {
  selectedPersonaId: string | null;
  onSelectPersona: (persona: DemoPersona) => void;
  onClear: () => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersonaId,
  onSelectPersona,
  onClear,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            Try a ready-made persona
          </h2>
          <span className="text-xs text-slate-500">
            · 1-click test scenarios from SIH demo script
          </span>
        </div>
        {selectedPersonaId && (
          <button
            onClick={onClear}
            className="text-xs text-amber-700 hover:text-amber-800 font-medium underline self-start sm:self-auto cursor-pointer"
          >
            Clear persona (Start blank)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {DEMO_PERSONAS.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => onSelectPersona(persona)}
              className={`p-3 rounded-lg text-left transition-all border cursor-pointer relative ${
                isSelected
                  ? 'bg-amber-50/80 border-amber-600 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                  {persona.name}, {persona.age}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {persona.tagline}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-amber-900/90 font-medium flex items-center justify-between">
                <span>Top match:</span>
                <span className="truncate ml-1 font-semibold">
                  {persona.expectedTopScheme.split('(')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
