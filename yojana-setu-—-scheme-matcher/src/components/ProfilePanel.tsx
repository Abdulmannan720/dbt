import React from 'react';
import { ApplicantProfile, Gender, SocialCategory, Occupation } from '../types/scheme';
import { INDIAN_STATES } from '../data/states';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ProfilePanelProps {
  profile: ApplicantProfile;
  onChange: (updated: ApplicantProfile) => void;
  highlightedFields: string[];
  onClear: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  profile,
  onChange,
  highlightedFields,
  onClear,
}) => {
  const updateField = <K extends keyof ApplicantProfile>(
    field: K,
    val: ApplicantProfile[K],
  ) => {
    onChange({
      ...profile,
      [field]: val,
    });
  };

  const isHighlighted = (fieldName: string) =>
    highlightedFields.includes(fieldName);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            Applicant Profile
          </h2>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
          title="Clear all fields"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear form</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
        {/* Age */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isHighlighted('age')
              ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-400'
              : 'border-slate-200 bg-slate-50/40'
          }`}
        >
          <label className="block font-medium text-slate-700 mb-1">
            Age (Years)
          </label>
          <input
            type="number"
            min={0}
            max={110}
            value={profile.age ?? ''}
            onChange={(e) =>
              updateField(
                'age',
                e.target.value === '' ? null : parseInt(e.target.value, 10),
              )
            }
            placeholder="e.g. 41 or 67"
            className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Gender */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isHighlighted('gender')
              ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-400'
              : 'border-slate-200 bg-slate-50/40'
          }`}
        >
          <label className="block font-medium text-slate-700 mb-1">
            Gender
          </label>
          <select
            value={profile.gender ?? ''}
            onChange={(e) =>
              updateField('gender', (e.target.value || null) as Gender | null)
            }
            className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">Not Specified</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="TRANSGENDER">Transgender</option>
          </select>
        </div>

        {/* State */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isHighlighted('state')
              ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-400'
              : 'border-slate-200 bg-slate-50/40'
          }`}
        >
          <label className="block font-medium text-slate-700 mb-1">
            State / UT
          </label>
          <select
            value={profile.state ?? ''}
            onChange={(e) => updateField('state', e.target.value || null)}
            className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All States (Central)</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Social Category */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isHighlighted('socialCategory')
              ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-400'
              : 'border-slate-200 bg-slate-50/40'
          }`}
        >
          <label className="block font-medium text-slate-700 mb-1">
            Social Category
          </label>
          <select
            value={profile.socialCategory ?? ''}
            onChange={(e) =>
              updateField(
                'socialCategory',
                (e.target.value || null) as SocialCategory | null,
              )
            }
            className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">Not Specified</option>
            <option value="GENERAL">General</option>
            <option value="OBC">OBC (Other Backward Classes)</option>
            <option value="SC">SC (Scheduled Caste)</option>
            <option value="ST">ST (Scheduled Tribe)</option>
          </select>
        </div>

        {/* Occupation */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isHighlighted('occupation')
              ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-400'
              : 'border-slate-200 bg-slate-50/40'
          }`}
        >
          <label className="block font-medium text-slate-700 mb-1">
            Occupation
          </label>
          <select
            value={profile.occupation ?? ''}
            onChange={(e) =>
              updateField(
                'occupation',
                (e.target.value || null) as Occupation | null,
              )
            }
            className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">Not Specified</option>
            <option value="FARMER">Farmer / Cultivator</option>
            <option value="STUDENT">Student</option>
            <option value="ARTISAN">Artisan / Craftsperson</option>
            <option value="DAILY_WAGE">Daily Wage Worker</option>
            <option value="SELF_EMPLOYED">Street Vendor / Small Business</option>
            <option value="HOMEMAKER">Homemaker</option>
            <option value="UNEMPLOYED">Unemployed</option>
            <option value="SALARIED">Salaried Employee</option>
          </select>
        </div>

        {/* Annual Income */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isHighlighted('annualIncome')
              ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-400'
              : 'border-slate-200 bg-slate-50/40'
          }`}
        >
          <label className="block font-medium text-slate-700 mb-1">
            Annual Household Income
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-xs">
              ₹
            </span>
            <input
              type="number"
              step="1000"
              value={profile.annualIncome ?? ''}
              onChange={(e) =>
                updateField(
                  'annualIncome',
                  e.target.value === '' ? null : parseInt(e.target.value, 10),
                )
              }
              placeholder="e.g. 50000 or 150000"
              className="w-full pl-6 pr-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Landholding */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isHighlighted('landHolding')
              ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-400'
              : 'border-slate-200 bg-slate-50/40'
          }`}
        >
          <label className="block font-medium text-slate-700 mb-1">
            Landholding (Hectares)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.05"
              min={0}
              max={50}
              value={profile.landHolding ?? ''}
              onChange={(e) =>
                updateField(
                  'landHolding',
                  e.target.value === '' ? null : parseFloat(e.target.value),
                )
              }
              placeholder="e.g. 1.25"
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-slate-500 text-[11px] shrink-0">Hectares</span>
          </div>
        </div>

        {/* Special Status Toggles */}
        <div className="sm:col-span-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-wrap gap-2.5 items-center">
          <span className="text-slate-600 font-medium mr-1">
            Specific Attributes:
          </span>

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs cursor-pointer select-none transition-colors ${
              profile.isWidow
                ? 'bg-amber-100 border-amber-400 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={profile.isWidow === true}
              onChange={(e) => updateField('isWidow', e.target.checked ? true : false)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Widow</span>
          </label>

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs cursor-pointer select-none transition-colors ${
              profile.hasDisability
                ? 'bg-amber-100 border-amber-400 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={profile.hasDisability === true}
              onChange={(e) =>
                updateField('hasDisability', e.target.checked ? true : false)
              }
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Differently Abled (PwD)</span>
          </label>

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs cursor-pointer select-none transition-colors ${
              profile.isStudent
                ? 'bg-amber-100 border-amber-400 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={profile.isStudent === true}
              onChange={(e) =>
                updateField('isStudent', e.target.checked ? true : false)
              }
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Enrolled Student</span>
          </label>

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs cursor-pointer select-none transition-colors ${
              profile.isBPL
                ? 'bg-amber-100 border-amber-400 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={profile.isBPL === true}
              onChange={(e) => updateField('isBPL', e.target.checked ? true : false)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>BPL / Ration Card</span>
          </label>
        </div>
      </div>
    </div>
  );
};
