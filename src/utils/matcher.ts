import {
  ApplicantProfile,
  CheckResult,
  CriterionCheck,
  MatchEvaluation,
  NextQuestion,
  Scheme,
} from '../types/scheme';
import { getStateShortName } from '../data/states';

export function evaluateScheme(
  scheme: Scheme,
  profile: ApplicantProfile,
): MatchEvaluation {
  const checks: Record<string, CriterionCheck> = {};
  const failedCriteria: string[] = [];
  const unverifiedCriteria: string[] = [];

  // 1. Age
  const rule = scheme.eligibility;
  if (rule.minAge != null || rule.maxAge != null) {
    if (profile.age == null) {
      checks.age = {
        criterion: 'age',
        name: 'Age Requirement',
        result: 'UNKNOWN',
        reason: `Age not specified yet (requires ${
          rule.minAge != null ? `min ${rule.minAge}` : ''
        }${rule.minAge != null && rule.maxAge != null ? ', ' : ''}${
          rule.maxAge != null ? `max ${rule.maxAge}` : ''
        } yrs)`,
      };
      unverifiedCriteria.push('age');
    } else if (rule.minAge != null && profile.age < rule.minAge) {
      checks.age = {
        criterion: 'age',
        name: 'Age Requirement',
        result: 'FAIL',
        reason: `Age ${profile.age} is below minimum requirement of ${rule.minAge} years`,
      };
      failedCriteria.push('age');
    } else if (rule.maxAge != null && profile.age > rule.maxAge) {
      checks.age = {
        criterion: 'age',
        name: 'Age Requirement',
        result: 'FAIL',
        reason: `Age ${profile.age} exceeds maximum age limit of ${rule.maxAge} years`,
      };
      failedCriteria.push('age');
    } else {
      checks.age = {
        criterion: 'age',
        name: 'Age Requirement',
        result: 'PASS',
        reason: `Age ${profile.age} meets bounds (${rule.minAge ?? 0}–${
          rule.maxAge ?? '∞'
        } years)`,
      };
    }
  } else {
    checks.age = {
      criterion: 'age',
      name: 'Age Requirement',
      result: 'PASS',
      reason: 'No age barrier for this scheme',
    };
  }

  // 2. Gender
  if (rule.gender && rule.gender !== '*') {
    if (!profile.gender) {
      checks.gender = {
        criterion: 'gender',
        name: 'Gender Requirement',
        result: 'UNKNOWN',
        reason: `Gender not stated (scheme is for ${rule.gender.toLowerCase()})`,
      };
      unverifiedCriteria.push('gender');
    } else if (profile.gender === rule.gender) {
      checks.gender = {
        criterion: 'gender',
        name: 'Gender Requirement',
        result: 'PASS',
        reason: `Gender (${profile.gender.toLowerCase()}) matches requirement`,
      };
    } else {
      checks.gender = {
        criterion: 'gender',
        name: 'Gender Requirement',
        result: 'FAIL',
        reason: `Restricted to ${rule.gender.toLowerCase()} applicants`,
      };
      failedCriteria.push('gender');
    }
  } else {
    checks.gender = {
      criterion: 'gender',
      name: 'Gender Requirement',
      result: 'PASS',
      reason: 'Open to all genders',
    };
  }

  // 3. State / Territory
  if (rule.states && rule.states !== '*') {
    if (!profile.state) {
      checks.state = {
        criterion: 'state',
        name: 'State Domicile',
        result: 'UNKNOWN',
        reason: `State not specified (scheme covers ${
          Array.isArray(rule.states)
            ? rule.states.map((s) => getStateShortName(s)).join(', ')
            : 'selected states'
        })`,
      };
      unverifiedCriteria.push('state');
    } else if (
      Array.isArray(rule.states) &&
      rule.states.includes(profile.state)
    ) {
      checks.state = {
        criterion: 'state',
        name: 'State Domicile',
        result: 'PASS',
        reason: `Resident of ${getStateShortName(profile.state)} (eligible)`,
      };
    } else {
      checks.state = {
        criterion: 'state',
        name: 'State Domicile',
        result: 'FAIL',
        reason: `Restricted to residents of ${
          Array.isArray(rule.states)
            ? rule.states.map((s) => getStateShortName(s)).join(', ')
            : 'specific state'
        }`,
      };
      failedCriteria.push('state');
    }
  } else {
    checks.state = {
      criterion: 'state',
      name: 'State Domicile',
      result: 'PASS',
      reason: 'Central scheme / Pan-India coverage',
    };
  }

  // 4. Social Category
  if (rule.socialCategory && rule.socialCategory !== '*') {
    if (!profile.socialCategory) {
      checks.socialCategory = {
        criterion: 'socialCategory',
        name: 'Social Category',
        result: 'UNKNOWN',
        reason: `Category not stated (restricted to ${
          Array.isArray(rule.socialCategory)
            ? rule.socialCategory.join(', ')
            : 'specific category'
        })`,
      };
      unverifiedCriteria.push('socialCategory');
    } else if (
      Array.isArray(rule.socialCategory) &&
      rule.socialCategory.includes(profile.socialCategory)
    ) {
      checks.socialCategory = {
        criterion: 'socialCategory',
        name: 'Social Category',
        result: 'PASS',
        reason: `Category ${profile.socialCategory} qualifies for benefit`,
      };
    } else {
      checks.socialCategory = {
        criterion: 'socialCategory',
        name: 'Social Category',
        result: 'FAIL',
        reason: `Reserved for ${
          Array.isArray(rule.socialCategory)
            ? rule.socialCategory.join(', ')
            : 'selected categories'
        }`,
      };
      failedCriteria.push('socialCategory');
    }
  } else {
    checks.socialCategory = {
      criterion: 'socialCategory',
      name: 'Social Category',
      result: 'PASS',
      reason: 'No caste or social category restriction',
    };
  }

  // 5. Occupation
  if (rule.occupation && rule.occupation !== '*') {
    if (!profile.occupation) {
      checks.occupation = {
        criterion: 'occupation',
        name: 'Occupation',
        result: 'UNKNOWN',
        reason: `Occupation not provided (targets ${
          Array.isArray(rule.occupation)
            ? rule.occupation.map((o) => o.replace('_', ' ').toLowerCase()).join(', ')
            : 'specific trades'
        })`,
      };
      unverifiedCriteria.push('occupation');
    } else if (
      Array.isArray(rule.occupation) &&
      rule.occupation.includes(profile.occupation)
    ) {
      checks.occupation = {
        criterion: 'occupation',
        name: 'Occupation',
        result: 'PASS',
        reason: `Occupation (${profile.occupation.replace('_', ' ').toLowerCase()}) matches target beneficiaries`,
      };
    } else {
      checks.occupation = {
        criterion: 'occupation',
        name: 'Occupation',
        result: 'FAIL',
        reason: `Targets ${
          Array.isArray(rule.occupation)
            ? rule.occupation.map((o) => o.replace('_', ' ').toLowerCase()).join(', ')
            : 'different occupation'
        }`,
      };
      failedCriteria.push('occupation');
    }
  } else {
    checks.occupation = {
      criterion: 'occupation',
      name: 'Occupation',
      result: 'PASS',
      reason: 'Open to all occupations',
    };
  }

  // 6. Annual Income (with proxy awareness)
  if (rule.maxAnnualIncome != null) {
    if (profile.annualIncome == null) {
      checks.income = {
        criterion: 'annualIncome',
        name: scheme.isProxy ? 'Income (SECC Proxy)' : 'Annual Income',
        result: 'UNKNOWN',
        reason: `Annual income not stated (ceiling is ₹${rule.maxAnnualIncome.toLocaleString(
          'en-IN',
        )}${scheme.isProxy ? ' - proxy rule' : ''})`,
        isProxy: scheme.isProxy,
      };
      unverifiedCriteria.push('annualIncome');
    } else if (profile.annualIncome <= rule.maxAnnualIncome) {
      checks.income = {
        criterion: 'annualIncome',
        name: scheme.isProxy ? 'Income (SECC Proxy)' : 'Annual Income',
        result: 'PASS',
        reason: `Income ₹${profile.annualIncome.toLocaleString(
          'en-IN',
        )} is within ceiling of ₹${rule.maxAnnualIncome.toLocaleString('en-IN')}`,
        isProxy: scheme.isProxy,
      };
    } else {
      checks.income = {
        criterion: 'annualIncome',
        name: scheme.isProxy ? 'Income (SECC Proxy)' : 'Annual Income',
        result: 'FAIL',
        reason: `Income ₹${profile.annualIncome.toLocaleString(
          'en-IN',
        )} exceeds ceiling of ₹${rule.maxAnnualIncome.toLocaleString('en-IN')}`,
        isProxy: scheme.isProxy,
      };
      failedCriteria.push('annualIncome');
    }
  } else {
    checks.income = {
      criterion: 'annualIncome',
      name: 'Annual Income',
      result: 'PASS',
      reason: 'No income ceiling specified',
    };
  }

  // 7. Land Holding
  if (rule.maxLandHolding != null) {
    if (profile.landHolding == null) {
      checks.land = {
        criterion: 'landHolding',
        name: 'Landholding Ceiling',
        result: 'UNKNOWN',
        reason: `Landholding not provided (ceiling is ${rule.maxLandHolding} hectares)`,
      };
      unverifiedCriteria.push('landHolding');
    } else if (profile.landHolding <= rule.maxLandHolding) {
      checks.land = {
        criterion: 'landHolding',
        name: 'Landholding Ceiling',
        result: 'PASS',
        reason: `Land ${profile.landHolding} ha is within ${rule.maxLandHolding} ha ceiling`,
      };
    } else {
      checks.land = {
        criterion: 'landHolding',
        name: 'Landholding Ceiling',
        result: 'FAIL',
        reason: `Landholding ${profile.landHolding} ha exceeds maximum limit of ${rule.maxLandHolding} ha`,
      };
      failedCriteria.push('landHolding');
    }
  } else {
    checks.land = {
      criterion: 'landHolding',
      name: 'Landholding Ceiling',
      result: 'PASS',
      reason: 'No land ownership constraint',
    };
  }

  // 8. Widow Status
  if (rule.requiresWidow) {
    if (profile.isWidow == null) {
      checks.widow = {
        criterion: 'isWidow',
        name: 'Widow Status',
        result: 'UNKNOWN',
        reason: 'Marital/widow status not stated (scheme is exclusively for widows)',
      };
      unverifiedCriteria.push('isWidow');
    } else if (profile.isWidow === true) {
      checks.widow = {
        criterion: 'isWidow',
        name: 'Widow Status',
        result: 'PASS',
        reason: 'Widow criteria confirmed',
      };
    } else {
      checks.widow = {
        criterion: 'isWidow',
        name: 'Widow Status',
        result: 'FAIL',
        reason: 'Scheme is exclusively for widows',
      };
      failedCriteria.push('isWidow');
    }
  }

  // 9. Disability Status
  if (rule.requiresDisability) {
    if (profile.hasDisability == null) {
      checks.disability = {
        criterion: 'hasDisability',
        name: 'Disability Status',
        result: 'UNKNOWN',
        reason: 'Disability status not stated (scheme requires >= 40% certified disability)',
      };
      unverifiedCriteria.push('hasDisability');
    } else if (profile.hasDisability === true) {
      checks.disability = {
        criterion: 'hasDisability',
        name: 'Disability Status',
        result: 'PASS',
        reason: 'Differently abled criterion satisfied',
      };
    } else {
      checks.disability = {
        criterion: 'hasDisability',
        name: 'Disability Status',
        result: 'FAIL',
        reason: 'Reserved for persons with certified disabilities',
      };
      failedCriteria.push('hasDisability');
    }
  }

  // 10. Student Status
  if (rule.isStudentOnly) {
    if (profile.isStudent == null) {
      checks.student = {
        criterion: 'isStudent',
        name: 'Student Status',
        result: 'UNKNOWN',
        reason: 'Student status not specified (scheme is for active students)',
      };
      unverifiedCriteria.push('isStudent');
    } else if (profile.isStudent === true) {
      checks.student = {
        criterion: 'isStudent',
        name: 'Student Status',
        result: 'PASS',
        reason: 'Active student status confirmed',
      };
    } else {
      checks.student = {
        criterion: 'isStudent',
        name: 'Student Status',
        result: 'FAIL',
        reason: 'Scheme strictly for enrolled students',
      };
      failedCriteria.push('isStudent');
    }
  }

  // Aggregate results
  const passedCount = Object.values(checks).filter(
    (c) => c.result === 'PASS',
  ).length;
  const failedCount = failedCriteria.length;
  const unknownCount = unverifiedCriteria.length;

  return {
    scheme,
    isEligible: failedCount === 0,
    isNearMiss: failedCount === 1,
    passedCount,
    failedCount,
    unknownCount,
    checks,
    failedCriteria,
    unverifiedCriteria,
  };
}

export function evaluateAllSchemes(
  schemes: Scheme[],
  profile: ApplicantProfile,
  includeNearMisses: boolean = false,
): {
  eligibleMatches: MatchEvaluation[];
  nearMissMatches: MatchEvaluation[];
  nextQuestion: NextQuestion | null;
} {
  const evaluations = schemes.map((s) => evaluateScheme(s, profile));

  // Eligible matches: 0 failed criteria
  const eligibleMatches = evaluations
    .filter((e) => e.isEligible)
    .sort((a, b) => {
      // 1. Zero unknown count first (definite matches)
      if (a.unknownCount === 0 && b.unknownCount > 0) return -1;
      if (b.unknownCount === 0 && a.unknownCount > 0) return 1;
      // 2. Highest passed criteria count
      return b.passedCount - a.passedCount;
    });

  // Near misses: exactly 1 failed criteria
  const nearMissMatches = evaluations
    .filter((e) => e.isNearMiss)
    .sort((a, b) => b.passedCount - a.passedCount);

  // Compute highest impact next question across in-play schemes (0 fails and >= 1 unknown)
  const nextQuestion = computeNextQuestion(eligibleMatches);

  return {
    eligibleMatches,
    nearMissMatches,
    nextQuestion,
  };
}

export function computeNextQuestion(
  inPlayEvaluations: MatchEvaluation[],
): NextQuestion | null {
  const candidateSchemes = inPlayEvaluations.filter((e) => e.unknownCount > 0);
  if (candidateSchemes.length === 0) return null;

  const countByField: Record<string, number> = {};
  for (const evaluation of candidateSchemes) {
    for (const field of evaluation.unverifiedCriteria) {
      countByField[field] = (countByField[field] || 0) + 1;
    }
  }

  // Find field with highest count
  let maxField: keyof ApplicantProfile | null = null;
  let maxCount = 0;

  for (const [field, count] of Object.entries(countByField)) {
    if (count > maxCount) {
      maxCount = count;
      maxField = field as keyof ApplicantProfile;
    }
  }

  if (!maxField) return null;

  const QUESTION_BANK: Record<
    keyof ApplicantProfile,
    { en: string; hint: string }
  > = {
    age: {
      en: 'What is your current age?',
      hint: 'e.g. 41 or 67',
    },
    gender: {
      en: 'What is your gender?',
      hint: 'Male, Female, or Transgender',
    },
    state: {
      en: 'Which Indian state or union territory do you live in?',
      hint: 'e.g. Bihar, Madhya Pradesh, Uttar Pradesh',
    },
    occupation: {
      en: 'What is your primary occupation or source of livelihood?',
      hint: 'e.g. Farmer, Student, Artisan, Daily wage',
    },
    annualIncome: {
      en: 'What is your total annual household income approximately?',
      hint: 'e.g. ₹50,000 or ₹1,50,000',
    },
    landHolding: {
      en: 'How much agricultural land does your family own (in hectares or acres)?',
      hint: 'e.g. 1.25 hectares (approx 3 acres)',
    },
    socialCategory: {
      en: 'What is your social caste category?',
      hint: 'General, OBC, SC, or ST',
    },
    isStudent: {
      en: 'Are you currently enrolled in school or higher education?',
      hint: 'Yes or No',
    },
    isWidow: {
      en: 'Are you a widow or single woman household head?',
      hint: 'Yes or No',
    },
    hasDisability: {
      en: 'Do you have a recognized physical or sensory disability (>= 40%)?',
      hint: 'Yes or No',
    },
    isBPL: {
      en: 'Do you hold a BPL, Antyodaya, or NFSA ration card?',
      hint: 'Yes or No',
    },
  };

  const q = QUESTION_BANK[maxField];
  return {
    field: maxField,
    question: q.en,
    settlesSchemeCount: maxCount,
    hint: q.hint,
  };
}
