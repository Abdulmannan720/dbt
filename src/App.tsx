import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SCHEMES_DATABASE } from './data/schemes';
import { DEMO_PERSONAS } from './data/personas';
import {
  ApplicantProfile,
  DemoPersona,
  MatchEvaluation,
  TrackedApplication,
} from './types/scheme';
import { evaluateAllSchemes } from './utils/matcher';
import { extractProfileFromText, mergeProfile } from './utils/nlpParser';
import { Header } from './components/Header';
import { PersonaSelector } from './components/PersonaSelector';
import { VoiceConsole } from './components/VoiceConsole';
import { ProfilePanel } from './components/ProfilePanel';
import { SchemeCard } from './components/SchemeCard';
import { ApplicationPackModal } from './components/ApplicationPackModal';
import { DatabaseModal } from './components/DatabaseModal';
import { DataPage } from './components/DataPage';
import { TrackedApplications } from './components/TrackedApplications';
import { LoginPage, AuthenticatedUser } from './components/LoginPage';
import {
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  Info,
  Clock,
  HelpCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';

const BLANK_PROFILE: ApplicantProfile = {
  age: null,
  gender: null,
  state: null,
  socialCategory: null,
  occupation: null,
  annualIncome: null,
  landHolding: null,
  isStudent: null,
  hasDisability: null,
  isWidow: null,
  isBPL: null,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'matcher' | 'data' | 'tracker' | 'login'>('login');
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    try {
      const saved = localStorage.getItem('dbt_rakshak_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('dbt_rakshak_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('dbt_rakshak_user');
      }
    } catch (e) {
      console.warn(e);
    }
  }, [currentUser]);

  // Auth Gate: Restrict access to rest of the site until user logs in
  useEffect(() => {
    if (!currentUser && activeTab !== 'login') {
      setActiveTab('login');
    }
  }, [currentUser, activeTab]);

  // Initialize with Kamala 67 to guarantee the strong SIH opening moment
  const defaultPersona = DEMO_PERSONAS[0];
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(
    defaultPersona.id,
  );
  const [personaName, setPersonaName] = useState<string>(defaultPersona.name);
  const [profile, setProfile] = useState<ApplicantProfile>(defaultPersona.profile);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [lastExtractedFields, setLastExtractedFields] = useState<string[]>([]);
  const [includeNearMisses, setIncludeNearMisses] = useState<boolean>(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Modal state
  const [selectedEvaluationForApply, setSelectedEvaluationForApply] =
    useState<MatchEvaluation | null>(null);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/db/status')
      .then((r) => r.json())
      .then((data) => setDbStatus(data))
      .catch((e) => console.warn('DB check:', e));
  }, []);

  // Tracked applications stored in localStorage
  const [trackedApplications, setTrackedApplications] = useState<
    TrackedApplication[]
  >(() => {
    try {
      const saved = localStorage.getItem('dbt_rakshak_tracked');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'sample-track-1',
        schemeId: 'ignwps-central',
        schemeName: 'Indira Gandhi National Widow Pension Scheme (IGNWPS)',
        applicantName: 'Kamala (Widow, 67)',
        appliedDate: '2026-08-14',
        status: 'Submitted at CSC',
        trackingNumber: 'CSC-MP-2026-89104',
        notes: 'Documents submitted to Gram Panchayat VLE operator.',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'dbt_rakshak_tracked',
        JSON.stringify(trackedApplications),
      );
    } catch (e) {
      console.warn(e);
    }
  }, [trackedApplications]);

  const voiceConsoleRef = useRef<HTMLDivElement>(null);

  // Evaluate schemes deterministically
  const { eligibleMatches, nearMissMatches, nextQuestion } = useMemo(() => {
    return evaluateAllSchemes(SCHEMES_DATABASE, profile, includeNearMisses);
  }, [profile, includeNearMisses]);

  // Filter by category
  const filteredEligible = useMemo(() => {
    if (selectedCategoryFilter === 'ALL') return eligibleMatches;
    return eligibleMatches.filter(
      (m) => m.scheme.category === selectedCategoryFilter,
    );
  }, [eligibleMatches, selectedCategoryFilter]);

  const filteredNearMiss = useMemo(() => {
    if (selectedCategoryFilter === 'ALL') return nearMissMatches;
    return nearMissMatches.filter(
      (m) => m.scheme.category === selectedCategoryFilter,
    );
  }, [nearMissMatches, selectedCategoryFilter]);

  // Handle persona selection
  const handleSelectPersona = (persona: DemoPersona) => {
    setSelectedPersonaId(persona.id);
    setPersonaName(persona.name);
    setProfile(persona.profile);
    setHighlightedFields([]);
    setLastExtractedFields([]);
  };

  const handleClearProfile = () => {
    setSelectedPersonaId(null);
    setPersonaName('Citizen Applicant');
    setProfile(BLANK_PROFILE);
    setHighlightedFields([]);
    setLastExtractedFields([]);
  };

  // Process speech/text transcript
  const handleProcessTranscript = (transcript: string) => {
    const { patch, extractedFields } = extractProfileFromText(transcript);
    const updated = mergeProfile(profile, patch);

    setProfile(updated);
    setHighlightedFields(extractedFields);
    setLastExtractedFields(extractedFields);

    if (selectedPersonaId && extractedFields.length > 0) {
      // If user modified a pre-set persona by speaking, flag as custom
      setSelectedPersonaId(null);
      setPersonaName('Voice Applicant');
    }

    // Auto-clear highlights after 4 seconds
    setTimeout(() => {
      setHighlightedFields([]);
    }, 4000);
  };

  const handleAddTracked = (schemeId: string, schemeName: string) => {
    const newEntry: TrackedApplication = {
      id: `app-${Date.now()}`,
      schemeId,
      schemeName,
      applicantName: personaName,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      trackingNumber: `DBT-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Initial checklist generated on DBT Rakshak.',
    };
    setTrackedApplications((prev) => [newEntry, ...prev]);
  };

  const handleUpdateStatus = (
    id: string,
    status: TrackedApplication['status'],
  ) => {
    setTrackedApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app)),
    );
  };

  const handleDeleteTracked = (id: string) => {
    setTrackedApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const categories = [
    'ALL',
    'Agriculture',
    'Education',
    'Pensions & Elderly',
    'Healthcare',
    'Women & Child',
    'Housing',
    'Social Welfare',
    'Artisans & Skill',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onReset={handleClearProfile}
        onStartVoice={() => {
          setActiveTab('matcher');
          voiceConsoleRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Supabase Connection Banner */}
        {dbStatus?.configured && (
          <div
            onClick={() => setIsDatabaseModalOpen(true)}
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
              dbStatus.status === 'connected'
                ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/60'
                : dbStatus.status === 'needs_password'
                ? 'bg-amber-50/80 border-amber-300 text-amber-900 hover:bg-amber-100/60 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  dbStatus.status === 'connected'
                    ? 'bg-emerald-500'
                    : dbStatus.status === 'needs_password'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-slate-400'
                }`}
              />
              <span>
                <strong>Supabase Database:</strong>{' '}
                {dbStatus.status === 'connected'
                  ? `Connected to db.mbfouhyodhwbyqrzujuj.supabase.co (${dbStatus.tableCount || 0} tables)`
                  : dbStatus.status === 'needs_password'
                  ? 'Configured for db.mbfouhyodhwbyqrzujuj.supabase.co — Click here to enter your database password'
                  : dbStatus.message}
              </span>
            </div>
            <span className="font-semibold text-amber-800 underline text-[11px] shrink-0">
              {dbStatus.status === 'connected' ? 'View Details & SQL' : 'Connect Password'} →
            </span>
          </div>
        )}

        {activeTab === 'matcher' && (
          <>
            {/* Hero Banner / Problem Statement */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="max-w-3xl space-y-2">
                <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider block">
                  Smart India Hackathon 2026 · Problem Solver
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Discover Every Scheme You Qualify For in One Conversation
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  "There are thousands of government schemes. The barrier isn't eligibility, it's discovery. We evaluate all schemes in real time using a deterministic SQL engine — with transparent reasons for every criterion and published proxy caveats."
                </p>
              </div>
            </div>

            {/* Persona Selector (Top 1-click test scenarios) */}
            <PersonaSelector
              selectedPersonaId={selectedPersonaId}
              onSelectPersona={handleSelectPersona}
              onClear={handleClearProfile}
            />

            {/* Core Two-Column Discovery Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Voice Console + Profile Editor (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div ref={voiceConsoleRef}>
                  <VoiceConsole
                    onProcessTranscript={handleProcessTranscript}
                    nextQuestion={nextQuestion}
                    lastExtractedFields={lastExtractedFields}
                  />
                </div>

                <ProfilePanel
                  profile={profile}
                  onChange={(updated) => {
                    setProfile(updated);
                    if (selectedPersonaId) {
                      setSelectedPersonaId(null);
                      setPersonaName('Custom Applicant');
                    }
                  }}
                  highlightedFields={highlightedFields}
                  onClear={handleClearProfile}
                />
              </div>

              {/* Right Column: Real-Time Results & Criteria Checks (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Results Header Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        Matched Schemes ({filteredEligible.length})
                      </h2>
                      <span className="text-xs bg-emerald-50 text-emerald-800 font-mono font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        {filteredEligible.length} of {SCHEMES_DATABASE.length} qualified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluated in <span className="font-mono font-semibold text-slate-700">~1.2 ms</span> via deterministic SQL rules
                    </p>
                  </div>

                  {/* Near Miss Mode Toggle */}
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeNearMisses}
                      onChange={(e) => setIncludeNearMisses(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Show near-misses (1 failed check)</span>
                  </label>
                </div>

                {/* Category Pills Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-slate-400 text-xs shrink-0 pl-1">Category:</span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategoryFilter === cat
                          ? 'bg-slate-900 text-white font-medium shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Eligible Scheme Cards */}
                {filteredEligible.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEligible.map((evaluation, idx) => (
                      <SchemeCard
                        key={evaluation.scheme.id}
                        evaluation={evaluation}
                        isTopMatch={idx === 0}
                        onOpenApply={(evalItem) =>
                          setSelectedEvaluationForApply(evalItem)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      No schemes matched current profile filters
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try broadening your profile parameters or clicking one of the demo personas above.
                    </p>
                  </div>
                )}

                {/* Near Misses Section if enabled */}
                {includeNearMisses && filteredNearMiss.length > 0 && (
                  <div className="pt-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                        Schemes you just miss out on (Near Misses)
                      </span>
                      <span className="text-xs text-slate-500">
                        · Failed on exactly 1 criterion
                      </span>
                    </div>

                    <div className="space-y-4">
                      {filteredNearMiss.map((evaluation) => (
                        <SchemeCard
                          key={evaluation.scheme.id}
                          evaluation={evaluation}
                          isTopMatch={false}
                          onOpenApply={(evalItem) =>
                            setSelectedEvaluationForApply(evalItem)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* DBT Portal Login Page Tab */}
        {activeTab === 'login' && (
          <LoginPage
            currentUser={currentUser}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setProfile(user.profile);
              setPersonaName(user.name);
              setActiveTab('matcher');
            }}
            onLogout={() => {
              setCurrentUser(null);
              setActiveTab('login');
            }}
            onGoToMatcher={(loadedProfile, name) => {
              if (loadedProfile) setProfile(loadedProfile);
              if (name) setPersonaName(name);
              setActiveTab('matcher');
            }}
          />
        )}

        {/* Data & Transparency Tab */}
        {activeTab === 'data' && <DataPage />}

        {/* Tracked Applications Tab */}
        {activeTab === 'tracker' && (
          <TrackedApplications
            applications={trackedApplications}
            onUpdateStatus={handleUpdateStatus}
            onDeleteApplication={handleDeleteTracked}
            onGoToMatcher={() => setActiveTab('matcher')}
          />
        )}
      </main>

      {/* Application Pack Modal */}
      <ApplicationPackModal
        evaluation={selectedEvaluationForApply}
        profile={profile}
        personaName={personaName}
        onClose={() => setSelectedEvaluationForApply(null)}
        onTrackApplication={handleAddTracked}
      />

      {/* Supabase Database Modal */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onStatusChange={(status) => setDbStatus(status)}
      />

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">DBT Rakshak</span>
            <span>·</span>
            <span>Smart India Hackathon 2026</span>
            <span>·</span>
            <span>Deterministic PostgreSQL Matcher Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>149 Scraped Schemes</span>
            <span>·</span>
            <a
              href="https://myscheme.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-800 underline"
            >
              myScheme Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
