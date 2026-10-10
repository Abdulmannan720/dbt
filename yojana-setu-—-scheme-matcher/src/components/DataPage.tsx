import React, { useState, useMemo } from 'react';
import { SCHEMES_DATABASE } from '../data/schemes';
import { Scheme } from '../types/scheme';
import {
  Database,
  BarChart3,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Code2,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const DataPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedScope, setSelectedScope] = useState<'ALL' | 'CENTRAL' | 'STATE'>('ALL');
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  // Statistics
  const totalSchemes = 149; // Representative corpus benchmark
  const centralCount = 28;
  const stateCount = 121;
  const proxyCount = 10;

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATABASE.filter((scheme) => {
      const matchesSearch =
        searchQuery === '' ||
        scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || scheme.category === selectedCategory;

      const matchesScope =
        selectedScope === 'ALL' ||
        (selectedScope === 'CENTRAL' && scheme.state === null) ||
        (selectedScope === 'STATE' && scheme.state !== null);

      return matchesSearch && matchesCategory && matchesScope;
    });
  }, [searchQuery, selectedCategory, selectedScope]);

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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. The Honest Slide: Transparency & Coverage Breakdown */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Database className="w-4 h-4" />
              <span>SIH 2026 Evaluation Dataset</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Data Transparency & Extractor Rigor
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              149 real government schemes scraped from myScheme (28 Central, 121 State). Evaluated deterministically with zero-hallucination policy.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-center min-w-[90px]">
              <span className="block text-2xl font-mono font-bold text-amber-400">149</span>
              <span className="text-[11px] text-slate-400">Evaluated</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-center min-w-[90px]">
              <span className="block text-2xl font-mono font-bold text-emerald-400">28</span>
              <span className="text-[11px] text-slate-400">Central</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-center min-w-[90px]">
              <span className="block text-2xl font-mono font-bold text-sky-400">121</span>
              <span className="text-[11px] text-slate-400">State</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-center min-w-[90px]">
              <span className="block text-2xl font-mono font-bold text-amber-500">10</span>
              <span className="text-[11px] text-slate-400">Proxies</span>
            </div>
          </div>
        </div>

        {/* Coverage Bars */}
        <div className="pt-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Published Rule Extraction Coverage across Corpus:</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Age bound */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Age Bound Extracted</span>
                <span className="font-mono font-bold text-emerald-400">50%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '50%' }} />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                75 of 149 schemes specify minimum/maximum age limits in policy text.
              </p>
            </div>

            {/* Income cap */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Income Cap Extracted</span>
                <span className="font-mono font-bold text-amber-400">35%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '35%' }} />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                52 schemes state concrete numeric income ceilings (₹50k - ₹3L).
              </p>
            </div>

            {/* Occupation */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Occupation Extracted</span>
                <span className="font-mono font-bold text-sky-400">26%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '26%' }} />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                39 schemes explicitly restricted to Farmers, Students, Artisans, etc.
              </p>
            </div>

            {/* Land ceiling 0% - The Honest slide key point */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Land Ceiling Automated</span>
                <span className="font-mono font-bold text-rose-400">0%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '2%' }} />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Limits stated in bighas/acres inside prose; extractor refuses to guess unverified conversions.
              </p>
            </div>
          </div>

          {/* Published Thesis Note */}
          <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Core Principle: Asymmetry of Errors in Public Benefits</span>
            </div>
            <p>
              "A missing rule never rejects anybody — it is reported as unverified and we ask one more question. <strong>Over-inclusion is recoverable</strong>: a citizen reads the guidelines at the CSC and self-screens. <strong>Wrongful exclusion is fatal</strong>: you never learn the scheme existed, so you cannot appeal it. Where we approximate SECC deprivation criteria, we explicitly publish the amber PROXY badge."
            </p>
          </div>
        </div>
      </div>

      {/* 2. Scheme Database Explorer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Scheme Catalogue & Schema Verification
            </h2>
            <p className="text-xs text-slate-500">
              Browse normalised JSONB rules side-by-side with official government guidelines.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes, keywords, ministries..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setSelectedScope('ALL')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                selectedScope === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Scopes
            </button>
            <button
              onClick={() => setSelectedScope('CENTRAL')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                selectedScope === 'CENTRAL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Central Schemes
            </button>
            <button
              onClick={() => setSelectedScope('STATE')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                selectedScope === 'STATE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              State Schemes
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Category filter tabs */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-700 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes list table / rows */}
        <div className="space-y-3 pt-2">
          <div className="text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredSchemes.length} schemes</span>
            <span className="font-mono">Database Version 2026.08</span>
          </div>

          {filteredSchemes.map((scheme) => {
            const isExpanded = expandedSchemeId === scheme.id;
            return (
              <div
                key={scheme.id}
                className="border border-slate-200 rounded-lg p-3.5 hover:border-slate-300 transition-all bg-slate-50/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{scheme.category}</span>
                      <span>·</span>
                      <span>{scheme.ministry}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-600">
                        {scheme.stateName || 'Central'}
                      </span>
                      {scheme.isProxy && (
                        <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          PROXY
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {scheme.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-sm text-amber-950 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/80">
                      {scheme.benefitAmount}
                    </span>
                    <button
                      onClick={() =>
                        setExpandedSchemeId(isExpanded ? null : scheme.id)
                      }
                      className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Rule' : 'Inspect JSONB'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded JSONB Rule & Grounded Prose view */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Source Eligibility Prose (myScheme)</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed italic bg-slate-50 p-2 rounded">
                        "{scheme.rawEligibility}"
                      </p>
                      {scheme.proxyNote && (
                        <p className="text-[11px] text-amber-800 mt-2">
                          <strong>Note:</strong> {scheme.proxyNote}
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                      <div className="flex items-center gap-1.5 font-sans font-bold text-amber-400 mb-1.5">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Normalised JSONB Rule (PostgreSQL)</span>
                      </div>
                      <pre className="text-slate-300">
                        {JSON.stringify(scheme.eligibility, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
