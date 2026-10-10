import React, { useState } from 'react';
import { MatchEvaluation, ApplicantProfile } from '../types/scheme';
import { getStateShortName } from '../data/states';
import {
  X,
  Printer,
  ExternalLink,
  CheckSquare,
  Square,
  BookmarkCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface ApplicationPackModalProps {
  evaluation: MatchEvaluation | null;
  profile: ApplicantProfile;
  personaName?: string;
  onClose: () => void;
  onTrackApplication: (schemeId: string, schemeName: string) => void;
}

export const ApplicationPackModal: React.FC<ApplicationPackModalProps> = ({
  evaluation,
  profile,
  personaName = 'Citizen Applicant',
  onClose,
  onTrackApplication,
}) => {
  if (!evaluation) return null;
  const { scheme } = evaluation;

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [isTracked, setIsTracked] = useState(false);

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [doc]: !prev[doc],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTrack = () => {
    onTrackApplication(scheme.id, scheme.name);
    setIsTracked(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3 no-print">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>OFFICIAL APPLICATION PACK & CSC ASSISTANCE</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {scheme.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 print:p-0">
          {/* Printable Header Banner */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold">DBT RAKSHAK — CSC BENEFICIARY SUMMARY</h1>
                <p className="text-xs text-slate-600">
                  Government Scheme Discovery & Common Service Centre (CSC) Operator Dossier
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold">Date: {new Date().toLocaleDateString('en-IN')}</p>
                <p>Status: Pre-Screened Eligible</p>
              </div>
            </div>
          </div>

          {/* Applicant Pre-Screening Summary Sheet */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Verified Applicant Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Name / Identifier</span>
                <span className="font-semibold text-slate-900">{personaName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Age & Gender</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {profile.age ?? 'Not stated'} yrs · {profile.gender ?? 'Any'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">State / Domicile</span>
                <span className="font-semibold text-slate-900">
                  {getStateShortName(profile.state)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Social Category</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {profile.socialCategory ?? 'General'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Occupation</span>
                <span className="font-semibold text-slate-900">
                  {profile.occupation ? profile.occupation.replace('_', ' ') : 'Not stated'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Annual Income</span>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">
                  {profile.annualIncome
                    ? `₹${profile.annualIncome.toLocaleString('en-IN')}`
                    : 'Under ceiling'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Landholding</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {profile.landHolding != null ? `${profile.landHolding} ha` : '0 ha'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Entitlement Benefit</span>
                <span className="font-bold text-amber-900 font-mono tabular-nums">
                  {scheme.benefitAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Proxy Caveat note if applicable */}
          {scheme.isProxy && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>CSC Operator Notice:</strong> This scheme approximates SECC deprivation
                via income criteria. Please inspect the citizen's BPL/NFSA ration card or SECC survey
                number before submitting the electronic application.
              </div>
            </div>
          )}

          {/* Document Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Mandatory Document Checklist
              </h3>
              <span className="text-xs text-slate-500">
                Tick items as gathered for CSC visit
              </span>
            </div>
            <div className="space-y-2">
              {scheme.documentsRequired.map((doc, idx) => {
                const isChecked = !!checkedDocs[doc];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDoc(doc)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs flex items-center gap-3 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="flex-1">{doc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Where & How to Apply */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-700">
              3. Next Steps to Avail Benefit
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
              <li>
                <strong>Option A (Self-apply):</strong> Visit the official portal at{' '}
                <a
                  href={scheme.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-800 font-semibold underline"
                >
                  {scheme.portalUrl}
                </a>{' '}
                with your Aadhaar-linked mobile number for OTP verification.
              </li>
              <li>
                <strong>Option B (Assisted via CSC Operator):</strong> Carry this printed dossier
                and original documents to your nearest Common Service Centre (CSC). The operator will scan documents and submit the form on your behalf.
              </li>
              <li>
                <strong>Toll-free Helpline:</strong> For grievance and queries, call{' '}
                <span className="font-mono font-bold text-slate-900">{scheme.helpline}</span>.
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 no-print rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTrack}
              disabled={isTracked}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isTracked
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800 cursor-default'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              <span>{isTracked ? 'Saved to Tracker' : 'Save / Track Application'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print This Summary (CSC Format)</span>
            </button>
            <a
              href={scheme.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Go to Online Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
