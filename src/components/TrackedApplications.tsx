import React, { useState } from 'react';
import { TrackedApplication } from '../types/scheme';
import {
  BookmarkCheck,
  Clock,
  CheckCircle,
  FileText,
  Trash2,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface TrackedApplicationsProps {
  applications: TrackedApplication[];
  onUpdateStatus: (id: string, status: TrackedApplication['status']) => void;
  onDeleteApplication: (id: string) => void;
  onGoToMatcher: () => void;
}

export const TrackedApplications: React.FC<TrackedApplicationsProps> = ({
  applications,
  onUpdateStatus,
  onDeleteApplication,
  onGoToMatcher,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = applications.filter((app) =>
    filterStatus === 'ALL' ? true : app.status === filterStatus,
  );

  const statuses: TrackedApplication['status'][] = [
    'Draft',
    'Submitted at CSC',
    'Document Verification',
    'Approved',
    'Disbursed',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <BookmarkCheck className="w-4 h-4" />
            <span>Beneficiary Application Registry</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Tracked Scheme Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor submission status, CSC tracking numbers, and disbursement milestones.
          </p>
        </div>

        <button
          onClick={onGoToMatcher}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Discover More Schemes</span>
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            No tracked applications yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you find a scheme you qualify for, click "Help Me Apply" and "Save / Track Application" to monitor it here.
          </p>
          <button
            onClick={onGoToMatcher}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Find Eligible Schemes Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium mr-1">Filter by status:</span>
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  filterStatus === 'ALL'
                    ? 'bg-amber-700 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({applications.length})
              </button>
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded cursor-pointer ${
                    filterStatus === st
                      ? 'bg-amber-700 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="p-4 border border-slate-200 rounded-lg bg-slate-50/40 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {app.schemeName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      · Ref: {app.trackingNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Applicant: <strong>{app.applicantName}</strong> · Saved on {app.appliedDate}
                  </p>
                  {app.notes && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      Notes: {app.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={app.status}
                    onChange={(e) =>
                      onUpdateStatus(
                        app.id,
                        e.target.value as TrackedApplication['status'],
                      )
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => onDeleteApplication(app.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                    title="Remove from tracking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
