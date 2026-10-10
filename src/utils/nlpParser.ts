import { ApplicantProfile, Gender, SocialCategory, Occupation } from '../types/scheme';
import { INDIAN_STATES } from '../data/states';

interface ExtractionResult {
  patch: Partial<ApplicantProfile>;
  extractedFields: string[];
  rawTranscript: string;
}

const ENGLISH_NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  twentyfive: 25,
  thirty: 30,
  forty: 40,
  fortyone: 41,
  fortytwo: 42,
  fortyfive: 45,
  fifty: 50,
  sixty: 60,
  sixtyseven: 67,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

export function extractProfileFromText(text: string): ExtractionResult {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const patch: Partial<ApplicantProfile> = {};
  const extractedFields: string[] = [];

  // 1. Age extraction
  let matchedAge: number | null = null;

  const digitAgeMatch = clean.match(
    /(?:age|aged|years?|yrs|old)\s*[:=]?\s*(\d{1,2})|(\d{1,2})\s*(?:years?\s*old|yrs|years)/i,
  );
  if (digitAgeMatch) {
    const num = parseInt(digitAgeMatch[1] || digitAgeMatch[2], 10);
    if (num >= 5 && num <= 110) {
      matchedAge = num;
    }
  }

  if (matchedAge == null) {
    for (const [word, val] of Object.entries(ENGLISH_NUMBER_WORDS)) {
      const regex = new RegExp(`(?:i am|age|aged)?\\s*${word}\\s*(?:years|years old|yrs)`, 'i');
      if (regex.test(lower)) {
        matchedAge = val;
        break;
      }
    }
  }

  // Also standalone check e.g. "age is 41" or "41 year old"
  if (matchedAge == null) {
    const directMatch = lower.match(/\b(1[5-9]|[2-8][0-9]|90)\b/);
    if (directMatch && (lower.includes('age') || lower.includes('old') || lower.includes('year'))) {
      matchedAge = parseInt(directMatch[1], 10);
    }
  }

  if (matchedAge != null) {
    patch.age = matchedAge;
    extractedFields.push('age');
  }

  // 2. State extraction
  for (const st of INDIAN_STATES) {
    const isStateMatch =
      lower.includes(st.name.toLowerCase()) ||
      st.aliases.some((alias) => lower.includes(alias.toLowerCase()));

    if (isStateMatch) {
      patch.state = st.code;
      extractedFields.push('state');
      break;
    }
  }

  // 3. Occupation extraction
  if (
    lower.includes('farmer') ||
    lower.includes('farming') ||
    lower.includes('agriculture') ||
    lower.includes('cultivator')
  ) {
    patch.occupation = 'FARMER';
    extractedFields.push('occupation');
  } else if (
    lower.includes('student') ||
    lower.includes('college') ||
    lower.includes('school') ||
    lower.includes('studying')
  ) {
    patch.occupation = 'STUDENT';
    patch.isStudent = true;
    extractedFields.push('occupation');
    if (!extractedFields.includes('isStudent')) extractedFields.push('isStudent');
  } else if (
    lower.includes('artisan') ||
    lower.includes('craftsman') ||
    lower.includes('carpenter') ||
    lower.includes('blacksmith') ||
    lower.includes('weaver') ||
    lower.includes('potter')
  ) {
    patch.occupation = 'ARTISAN';
    extractedFields.push('occupation');
  } else if (
    lower.includes('daily wage') ||
    lower.includes('labourer') ||
    lower.includes('laborer') ||
    lower.includes('worker') ||
    lower.includes('construction worker')
  ) {
    patch.occupation = 'DAILY_WAGE';
    extractedFields.push('occupation');
  } else if (
    lower.includes('vendor') ||
    lower.includes('street vendor') ||
    lower.includes('shopkeeper') ||
    lower.includes('self employed')
  ) {
    patch.occupation = 'SELF_EMPLOYED';
    extractedFields.push('occupation');
  } else if (
    lower.includes('homemaker') ||
    lower.includes('housewife')
  ) {
    patch.occupation = 'HOMEMAKER';
    extractedFields.push('occupation');
  } else if (
    lower.includes('unemployed') ||
    lower.includes('jobless') ||
    lower.includes('looking for job')
  ) {
    patch.occupation = 'UNEMPLOYED';
    extractedFields.push('occupation');
  } else if (
    lower.includes('salaried') ||
    lower.includes('private job') ||
    lower.includes('employee')
  ) {
    patch.occupation = 'SALARIED';
    extractedFields.push('occupation');
  }

  // 4. Land holding
  let land: number | null = null;
  if (lower.includes('1.25 hectare') || lower.includes('1.25 ha') || lower.includes('1.25 hectares')) {
    land = 1.25;
  } else if (lower.includes('1.5 hectare') || lower.includes('1.5 ha')) {
    land = 1.5;
  } else if (lower.includes('2 hectare') || lower.includes('2 ha')) {
    land = 2.0;
  } else if (lower.includes('no land') || lower.includes('landless') || lower.includes('zero land')) {
    land = 0;
  } else {
    const digitLandMatch = lower.match(
      /(\d+(?:\.\d+)?)\s*(?:hectares?|ha|acres?)/i,
    );
    if (digitLandMatch) {
      const val = parseFloat(digitLandMatch[1]);
      if (/acres?/i.test(digitLandMatch[0])) {
        // Convert acres to hectares (1 acre ≈ 0.404686 ha)
        land = Math.round(val * 0.404686 * 100) / 100;
      } else {
        land = val;
      }
    }
  }

  if (land != null) {
    patch.landHolding = land;
    extractedFields.push('landHolding');
  }

  // 5. Income
  let income: number | null = null;
  if (lower.includes('50000') || lower.includes('50,000') || lower.includes('fifty thousand')) {
    income = 50000;
  } else if (lower.includes('45000') || lower.includes('45,000') || lower.includes('forty five thousand')) {
    income = 45000;
  } else if (
    lower.includes('1.5 lakh') ||
    lower.includes('150000') ||
    lower.includes('1,50,000') ||
    lower.includes('one and half lakh')
  ) {
    income = 150000;
  } else if (
    lower.includes('1.8 lakh') ||
    lower.includes('180000') ||
    lower.includes('1,80,000')
  ) {
    income = 180000;
  } else if (lower.includes('2.5 lakh') || lower.includes('250000') || lower.includes('2,50,000')) {
    income = 250000;
  } else if (lower.includes('1 lakh') || lower.includes('100000') || lower.includes('1,00,000') || lower.includes('one lakh')) {
    income = 100000;
  } else if (lower.includes('70000') || lower.includes('70,000') || lower.includes('seventy thousand')) {
    income = 70000;
  } else if (lower.includes('80000') || lower.includes('80,000') || lower.includes('eighty thousand')) {
    income = 80000;
  } else if (lower.includes('95000') || lower.includes('95,000') || lower.includes('ninety five thousand')) {
    income = 95000;
  } else {
    const digitIncomeMatch = clean.match(
      /(?:₹|rs\.?|inr|income)\s*[:=]?\s*(\d[\d,]*)/i,
    );
    if (digitIncomeMatch) {
      const raw = digitIncomeMatch[1].replace(/,/g, '');
      const parsed = parseInt(raw, 10);
      if (parsed >= 10000 && parsed <= 5000000) {
        income = parsed;
      }
    }
  }

  if (income != null) {
    patch.annualIncome = income;
    extractedFields.push('annualIncome');
  }

  // 6. Widow status
  if (
    lower.includes('widow') ||
    lower.includes('husband passed away') ||
    lower.includes('husband died')
  ) {
    patch.isWidow = true;
    patch.gender = 'FEMALE';
    extractedFields.push('isWidow');
    if (!extractedFields.includes('gender')) extractedFields.push('gender');
  }

  // 7. Disability status
  if (
    lower.includes('disabled') ||
    lower.includes('disability') ||
    lower.includes('handicapped') ||
    lower.includes('pwd') ||
    lower.includes('differently abled')
  ) {
    patch.hasDisability = true;
    extractedFields.push('hasDisability');
  }

  // 8. Social Category
  if (lower.includes('sc category') || lower.includes('scheduled caste') || lower.includes('sc student') || lower.includes('belong to sc')) {
    patch.socialCategory = 'SC';
    extractedFields.push('socialCategory');
  } else if (lower.includes('st category') || lower.includes('scheduled tribe') || lower.includes('belong to st')) {
    patch.socialCategory = 'ST';
    extractedFields.push('socialCategory');
  } else if (lower.includes('obc') || lower.includes('other backward class')) {
    patch.socialCategory = 'OBC';
    extractedFields.push('socialCategory');
  } else if (lower.includes('general category') || lower.includes('open category')) {
    patch.socialCategory = 'GENERAL';
    extractedFields.push('socialCategory');
  }

  // 9. Gender if not already set by widow
  if (patch.gender == null) {
    if (
      lower.includes('female') ||
      lower.includes('woman') ||
      lower.includes('girl') ||
      lower.includes('mother') ||
      lower.includes('lady')
    ) {
      patch.gender = 'FEMALE';
      extractedFields.push('gender');
    } else if (
      lower.includes('male') ||
      lower.includes('man') ||
      lower.includes('boy') ||
      lower.includes('father') ||
      lower.includes('son')
    ) {
      patch.gender = 'MALE';
      extractedFields.push('gender');
    }
  }

  // 10. BPL
  if (
    lower.includes('bpl') ||
    lower.includes('ration card') ||
    lower.includes('antyodaya') ||
    lower.includes('below poverty line')
  ) {
    patch.isBPL = true;
    extractedFields.push('isBPL');
  }

  return {
    patch,
    extractedFields,
    rawTranscript: clean,
  };
}

/**
 * Merges a newly extracted patch into existing profile.
 * CRITICAL RULE: Null or undefined fields in the patch NEVER overwrite already known profile fields!
 */
export function mergeProfile(
  current: ApplicantProfile,
  patch: Partial<ApplicantProfile>,
): ApplicantProfile {
  const updated: ApplicantProfile = { ...current };

  for (const [key, value] of Object.entries(patch)) {
    if (value !== null && value !== undefined) {
      (updated as any)[key] = value;
    }
  }

  return updated;
}
