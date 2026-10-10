export type Gender = 'MALE' | 'FEMALE' | 'TRANSGENDER';
export type SocialCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST';
export type Occupation =
  | 'FARMER'
  | 'STUDENT'
  | 'DAILY_WAGE'
  | 'ARTISAN'
  | 'SELF_EMPLOYED'
  | 'SALARIED'
  | 'HOMEMAKER'
  | 'UNEMPLOYED';

export type CheckResult = 'PASS' | 'FAIL' | 'UNKNOWN';

export interface CriterionCheck {
  criterion: string;
  name: string;
  result: CheckResult;
  reason: string;
  isProxy?: boolean;
}

export interface EligibilityRule {
  minAge?: number | null;
  maxAge?: number | null;
  gender?: Gender | '*' | null;
  states?: string[] | '*' | null; // e.g. ['IN-MP'] or '*'
  socialCategory?: SocialCategory[] | '*' | null;
  occupation?: Occupation[] | '*' | null;
  maxAnnualIncome?: number | null;
  maxLandHolding?: number | null; // in hectares
  requiresDisability?: boolean | null;
  isStudentOnly?: boolean | null;
  requiresWidow?: boolean | null;
  requiresBPL?: boolean | null;
}

export interface Scheme {
  id: string;
  slug: string;
  name: string;
  ministry: string;
  category:
    | 'Agriculture'
    | 'Education'
    | 'Pensions & Elderly'
    | 'Healthcare'
    | 'Women & Child'
    | 'Social Welfare'
    | 'Housing'
    | 'Artisans & Skill';
  state: string | null; // null = Central
  stateName?: string;
  benefitAmount: string;
  benefitDescription: string;
  eligibility: EligibilityRule;
  rawEligibility: string;
  isProxy: boolean;
  proxyNote?: string;
  documentsRequired: string[];
  portalUrl: string;
  helpline: string;
  sourceUrl: string;
}

export interface ApplicantProfile {
  age: number | null;
  gender: Gender | null;
  state: string | null; // ISO e.g. 'IN-MP', 'IN-BR', 'IN-UP'
  socialCategory: SocialCategory | null;
  occupation: Occupation | null;
  annualIncome: number | null;
  landHolding: number | null; // hectares
  isStudent: boolean | null;
  hasDisability: boolean | null;
  isWidow: boolean | null;
  isBPL: boolean | null;
}

export interface MatchEvaluation {
  scheme: Scheme;
  isEligible: boolean;
  isNearMiss: boolean;
  passedCount: number;
  failedCount: number;
  unknownCount: number;
  checks: Record<string, CriterionCheck>;
  failedCriteria: string[];
  unverifiedCriteria: string[];
}

export interface NextQuestion {
  field: keyof ApplicantProfile;
  question: string;
  settlesSchemeCount: number;
  hint?: string;
}

export interface DemoPersona {
  id: string;
  name: string;
  age: number;
  tagline: string;
  profile: ApplicantProfile;
  expectedTopScheme: string;
  highlightNote: string;
}

export interface TrackedApplication {
  id: string;
  schemeId: string;
  schemeName: string;
  applicantName: string;
  appliedDate: string;
  status: 'Draft' | 'Submitted at CSC' | 'Document Verification' | 'Approved' | 'Disbursed';
  trackingNumber: string;
  notes: string;
}
