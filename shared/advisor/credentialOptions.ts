/**
 * Advisor credential dropdown options — shared by apply wizard, settings, and backend validation.
 */

import {
  COUNTRY_REGIONS,
  OTHER_OPTION as CATALOG_OTHER,
  REGION_CREDENTIAL_TYPES,
  REGION_ISSUING_BODIES,
  getRegionLabel,
} from './credentialCatalog.js';
import { LANGUAGE_OPTIONS } from './languageOptions.js';

export { LANGUAGE_OPTIONS } from './languageOptions.js';
export { FLUENCY_LEVELS } from './languageOptions.js';
export {
  COUNTRY_REGIONS,
  US_STATE_REGIONS,
  getRegionLabel,
  isUsRegion,
} from './credentialCatalog.js';

export const OTHER_OPTION = CATALOG_OTHER;

/** @deprecated Use COUNTRY_REGIONS — kept for backward compatibility */
export const ALL_REGIONS = COUNTRY_REGIONS.map((r) => r.label);

export const PROFESSION_TYPES = [
  { id: 'psychologist', label: 'Psychologist (PhD / PsyD)' },
  { id: 'licensed_counselor', label: 'Licensed Professional Counselor' },
  { id: 'clinical_social_worker', label: 'Clinical Social Worker' },
  { id: 'marriage_family_therapist', label: 'Marriage & Family Therapist' },
  { id: 'psychiatrist', label: 'Psychiatrist (MD / DO)' },
  { id: 'psychiatric_nurse', label: 'Psychiatric Nurse Practitioner' },
  { id: 'substance_abuse_counselor', label: 'Substance Use / Addiction Counselor' },
  { id: 'wellness_coach', label: 'Wellness / Health Coach' },
  { id: 'holistic_practitioner', label: 'Holistic / Integrative Practitioner' },
  { id: 'nutritionist', label: 'Registered Dietitian / Nutritionist' },
  { id: 'other', label: 'Other licensed or certified professional' },
] as const;

export type ProfessionTypeId = (typeof PROFESSION_TYPES)[number]['id'];

/** Global default credential types by profession (US/international baseline) */
export const CREDENTIAL_TYPES_BY_PROFESSION: Record<ProfessionTypeId, readonly string[]> = {
  psychologist: [
    'Licensed Psychologist (LP)',
    'PhD in Clinical Psychology',
    'PsyD (Doctor of Psychology)',
    'CPQ (Certificate of Professional Qualification)',
  ],
  licensed_counselor: [
    'LPC — Licensed Professional Counselor',
    'LMHC — Licensed Mental Health Counselor',
    'LCPC — Licensed Clinical Professional Counselor',
    'LPCC — Licensed Professional Clinical Counselor',
    'LCMHC — Licensed Clinical Mental Health Counselor',
  ],
  clinical_social_worker: [
    'LCSW — Licensed Clinical Social Worker',
    'LICSW — Licensed Independent Clinical Social Worker',
    'LSW / LMSW (pre-licensure)',
  ],
  marriage_family_therapist: [
    'LMFT — Licensed Marriage and Family Therapist',
    'LCMFT — Licensed Clinical Marriage and Family Therapist',
  ],
  psychiatrist: ['MD — Board-certified Psychiatrist', 'DO — Osteopathic Psychiatrist'],
  psychiatric_nurse: [
    'PMHNP — Psychiatric Mental Health Nurse Practitioner',
    'APRN — Advanced Practice Registered Nurse (Psychiatric)',
  ],
  substance_abuse_counselor: [
    'LCADC — Licensed Clinical Alcohol and Drug Counselor',
    'CADC — Certified Alcohol and Drug Counselor',
    'MAC — Master Addiction Counselor',
  ],
  wellness_coach: [
    'NBHWC — National Board Certified Health & Wellness Coach',
    'ICF PCC / ACC — Professional Certified Coach',
    'ACE Health Coach Certification',
    'Wellcoaches Certified Coach',
  ],
  holistic_practitioner: [
    'NCC — National Certified Counselor (holistic focus)',
    'Integrative Mental Health Certification',
    'Ayurvedic Wellness Practitioner',
    'Functional Medicine Health Coach',
  ],
  nutritionist: [
    'RD — Registered Dietitian',
    'RDN — Registered Dietitian Nutritionist',
    'CDN — Certified Dietitian-Nutritionist',
  ],
  other: ['State-licensed professional', 'Board-certified specialist', 'Other certification'],
};

export const ISSUING_BODIES_BY_CREDENTIAL: Record<string, readonly string[]> = {
  'Licensed Psychologist (LP)': [
    'State Psychology Licensing Board',
    'Association of State and Provincial Psychology Boards (ASPPB)',
  ],
  'PhD in Clinical Psychology': ['State Psychology Licensing Board', 'APA-accredited program + state board'],
  'PsyD (Doctor of Psychology)': ['State Psychology Licensing Board', 'APA-accredited program + state board'],
  'CPQ (Certificate of Professional Qualification)': ['Association of State and Provincial Psychology Boards (ASPPB)'],
  'LPC — Licensed Professional Counselor': ['State Counseling / Behavioral Health Board'],
  'LMHC — Licensed Mental Health Counselor': ['State Mental Health Counselors Board'],
  'LCPC — Licensed Clinical Professional Counselor': ['State Professional Counselors Board'],
  'LPCC — Licensed Professional Clinical Counselor': ['State Board of Behavioral Sciences'],
  'LCMHC — Licensed Clinical Mental Health Counselor': ['State Board of Mental Health Practice'],
  'LCSW — Licensed Clinical Social Worker': ['State Social Work Licensing Board'],
  'LICSW — Licensed Independent Clinical Social Worker': ['State Social Work Licensing Board'],
  'LSW / LMSW (pre-licensure)': ['State Social Work Board (associate / provisional)'],
  'LMFT — Licensed Marriage and Family Therapist': ['State Marriage & Family Therapy Board'],
  'LCMFT — Licensed Clinical Marriage and Family Therapist': ['State Marriage & Family Therapy Board'],
  'MD — Board-certified Psychiatrist': ['State Medical Board', 'American Board of Psychiatry and Neurology (ABPN)'],
  'DO — Osteopathic Psychiatrist': ['State Medical Board', 'American Osteopathic Board of Neurology & Psychiatry'],
  'PMHNP — Psychiatric Mental Health Nurse Practitioner': [
    'State Board of Nursing',
    'American Nurses Credentialing Center (ANCC)',
  ],
  'APRN — Advanced Practice Registered Nurse (Psychiatric)': ['State Board of Nursing'],
  'LCADC — Licensed Clinical Alcohol and Drug Counselor': ['State Substance Abuse Certification Board'],
  'CADC — Certified Alcohol and Drug Counselor': ['State Substance Abuse Certification Board', 'NAADAC'],
  'MAC — Master Addiction Counselor': ['NAADAC — National Association for Addiction Professionals'],
  'NBHWC — National Board Certified Health & Wellness Coach': ['National Board for Health & Wellness Coaching (NBHWC)'],
  'ICF PCC / ACC — Professional Certified Coach': ['International Coaching Federation (ICF)'],
  'ACE Health Coach Certification': ['American Council on Exercise (ACE)'],
  'Wellcoaches Certified Coach': ['Wellcoaches School of Coaching'],
  'NCC — National Certified Counselor (holistic focus)': ['National Board for Certified Counselors (NBCC)'],
  'Integrative Mental Health Certification': ['Integrative Psychiatry Institute / similar program'],
  'Ayurvedic Wellness Practitioner': ['National Ayurvedic Medical Association (NAMA)'],
  'Functional Medicine Health Coach': ['Functional Medicine Coaching Academy (FMCA)'],
  'RD — Registered Dietitian': ['Commission on Dietetic Registration (CDR)'],
  'RDN — Registered Dietitian Nutritionist': ['Commission on Dietetic Registration (CDR)'],
  'CDN — Certified Dietitian-Nutritionist': ['State Office of Professions / Dietetics Board'],
  'State-licensed professional': ['State licensing authority'],
  'Board-certified specialist': ['Relevant specialty board'],
  'Other certification': ['Certifying organization (specify in license number field)'],
};

export const DEGREE_OPTIONS = [
  'PhD — Doctor of Philosophy (Psychology)',
  'PsyD — Doctor of Psychology',
  'MD — Doctor of Medicine',
  'DO — Doctor of Osteopathic Medicine',
  'MSW — Master of Social Work',
  'MA / MS — Counseling Psychology',
  'MEd — Counseling Education',
  'DNP — Doctor of Nursing Practice',
  'MPH — Master of Public Health',
  'RD / RDN — Dietetics',
  'Coach certification (non-degree)',
  'Other graduate degree',
] as const;

export const SPECIALTY_CATEGORIES = [
  { id: 'mental_health', label: 'Mental health & emotional wellbeing' },
  { id: 'relationships', label: 'Relationships & family' },
  { id: 'trauma_grief', label: 'Trauma, grief & crisis' },
  { id: 'behavioral', label: 'Behavioral health & addiction' },
  { id: 'wellness', label: 'Wellness, lifestyle & prevention' },
  { id: 'holistic', label: 'Holistic & integrative approaches' },
  { id: 'maternal_reproductive', label: 'Maternal & reproductive health' },
  { id: 'chronic_illness', label: 'Chronic illness & disability support' },
  { id: 'faith_spiritual', label: 'Faith-based & spiritual care' },
  { id: 'workplace_career', label: 'Workplace wellness & career' },
  { id: 'identity_affirming', label: 'LGBTQ+ & identity-affirming care' },
  { id: 'youth_adolescent', label: 'Youth, teens & young adults' },
  { id: 'elder_aging', label: 'Elder care & aging' },
  { id: 'community_cultural', label: 'Community & cultural healing' },
] as const;

export type SpecialtyCategoryId = (typeof SPECIALTY_CATEGORIES)[number]['id'];

export const SPECIALTIES_BY_CATEGORY: Record<SpecialtyCategoryId, readonly string[]> = {
  mental_health: [
    'Anxiety', 'Depression', 'Stress management', 'Sleep disorders', 'Burnout',
    'Self-esteem', 'ADHD support', 'OCD', 'Bipolar support', 'Panic attacks',
    'Social anxiety', 'Emotional regulation', 'Loneliness & isolation',
  ],
  relationships: [
    'Couples counseling', 'Marriage therapy', 'Family therapy', 'Parenting',
    'Communication skills', 'Conflict resolution', 'Divorce / separation',
    'Blended families', 'Co-parenting', 'Intimacy & connection', 'Infidelity recovery',
  ],
  trauma_grief: [
    'Trauma / PTSD', 'EMDR-informed care', 'Grief & loss', 'Crisis support',
    'Domestic violence recovery', 'Sexual assault recovery', 'Childhood trauma',
    'Complex trauma (C-PTSD)', 'Disaster & emergency trauma', 'Bereavement counseling',
  ],
  behavioral: [
    'Addiction recovery', 'Substance use', 'Eating disorders', 'Anger management',
    'Behavioral change', 'Gambling recovery', 'Harm reduction', 'Relapse prevention',
    'Dual diagnosis support', 'Smoking cessation',
  ],
  wellness: [
    'Mindfulness', 'Nutrition counseling', 'Weight management', 'Work-life balance',
    'Health coaching', 'Preventive care', 'Sleep hygiene', 'Exercise & movement',
    'Stress resilience', 'Women\'s wellness', 'Men\'s wellness',
  ],
  holistic: [
    'Integrative therapy', 'Somatic approaches', 'CBT', 'DBT-informed skills',
    'Acceptance & Commitment (ACT)', 'Mind-body connection', 'Spiritual wellness',
    'Art & expressive therapy', 'Nature-based therapy', 'Breathwork & meditation',
    'Traditional healing integration', 'Ayurvedic wellness',
  ],
  maternal_reproductive: [
    'Pregnancy & prenatal support', 'Postpartum depression & anxiety', 'Birth trauma',
    'Fertility & conception support', 'Miscarriage & pregnancy loss', 'Breastfeeding support',
    'New parent adjustment', 'Perinatal mood disorders', 'Menopause transition',
  ],
  chronic_illness: [
    'Chronic pain management', 'Diabetes support', 'HIV/AIDS support', 'Cancer support',
    'Autoimmune conditions', 'Disability adjustment', 'Long COVID recovery',
    'Sickle cell support', 'Hypertension & heart health', 'Caregiver burnout',
  ],
  faith_spiritual: [
    'Christian counseling', 'Islamic counseling', 'Pastoral care', 'Interfaith support',
    'Spiritual crisis & doubt', 'Grief & faith integration', 'Moral injury',
    'Prayer & meditation guidance', 'Religious trauma recovery',
  ],
  workplace_career: [
    'Workplace burnout', 'Executive coaching', 'Career transitions', 'Leadership stress',
    'Remote work isolation', 'Workplace conflict', 'Imposter syndrome',
    'Professional identity', 'Return-to-work support', 'Entrepreneur wellness',
  ],
  identity_affirming: [
    'LGBTQ+ affirming care', 'Gender identity exploration', 'Coming out support',
    'Trans-affirming therapy', 'Queer relationship support', 'Minority stress',
    'Cultural identity', 'Intersectional wellness', 'Body image & dysphoria',
  ],
  youth_adolescent: [
    'Teen anxiety & depression', 'School stress & bullying', 'College transition',
    'Peer pressure', 'Self-harm support', 'Family conflict (youth)', 'Identity development',
    'Social media & digital wellness', 'Young adult life skills',
  ],
  elder_aging: [
    'Aging & life transitions', 'Dementia & memory support', 'Caregiver support (elder)',
    'End-of-life planning', 'Loneliness in older adults', 'Retirement adjustment',
    'Age-related grief', 'Senior mental health', 'Intergenerational family issues',
  ],
  community_cultural: [
    'Community trauma healing', 'Cultural identity & belonging', 'Diaspora & migration stress',
    'Refugee & displacement support', 'Ancestral & traditional healing', 'Collective grief',
    'Racial trauma & healing', 'Ubuntu / communal wellness', 'Group & circle facilitation',
    'Conflict-affected communities', 'Post-conflict recovery',
  ],
};

export const SESSION_RATE_OPTIONS = [50, 75, 100, 125, 150, 175, 200] as const;

export const YEARS_EXPERIENCE_OPTIONS = Array.from({ length: 41 }, (_, i) => i) as readonly number[];

const OTHER_LABEL = 'Other / not listed';

function withOtherOption(options: readonly string[]): readonly string[] {
  if (options.some((o) => o === OTHER_OPTION || o === OTHER_LABEL)) return options;
  return [...options, OTHER_OPTION];
}

export function isOtherSelection(value: string): boolean {
  return value === OTHER_OPTION || value === OTHER_LABEL;
}

/** Country/Region → Profession → credential types */
export function getCredentialTypesForRegionProfession(
  regionId: string,
  professionType: string,
): readonly string[] {
  if (!professionType) return [];

  const regional = REGION_CREDENTIAL_TYPES[regionId]?.[professionType as ProfessionTypeId];
  const global = CREDENTIAL_TYPES_BY_PROFESSION[professionType as ProfessionTypeId] ?? [];

  const merged = regional ? [...new Set([...regional, ...global])] : [...global];
  return withOtherOption(merged);
}

/** @deprecated Use getCredentialTypesForRegionProfession */
export function getCredentialTypesForProfession(professionType: string): readonly string[] {
  return getCredentialTypesForRegionProfession('us', professionType);
}

/** Region + credential type → issuing bodies */
export function getIssuingBodiesForRegionCredential(
  regionId: string,
  credentialType: string,
): readonly string[] {
  if (!credentialType || isOtherSelection(credentialType)) return [OTHER_OPTION];

  const regional = REGION_ISSUING_BODIES[regionId]?.[credentialType];
  const global = ISSUING_BODIES_BY_CREDENTIAL[credentialType];
  const bodies = regional ?? global ?? ['National or regional licensing authority'];

  return withOtherOption(bodies);
}

/** @deprecated Use getIssuingBodiesForRegionCredential */
export function getIssuingBodiesForCredential(credentialType: string): readonly string[] {
  return getIssuingBodiesForRegionCredential('us', credentialType);
}

export function getSpecialtiesForCategory(categoryId: string): readonly string[] {
  return SPECIALTIES_BY_CATEGORY[categoryId as SpecialtyCategoryId] ?? [];
}

export function getProfessionLabel(professionType: string): string {
  return PROFESSION_TYPES.find((p) => p.id === professionType)?.label ?? professionType;
}

export function getSpecialtyCategoryLabel(categoryId: string): string {
  return SPECIALTY_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export function resolveRegionDisplay(regionId: string, other?: string): string {
  if (isOtherSelection(regionId)) return other?.trim() || OTHER_LABEL;
  const label = getRegionLabel(regionId);
  if (regionId === 'us' && other?.trim()) return `${label} — ${other.trim()}`;
  return label;
}

export function resolveCredentialTypeDisplay(credentialType: string, other?: string): string {
  if (isOtherSelection(credentialType)) return other?.trim() || OTHER_LABEL;
  return credentialType;
}

export function resolveIssuingBodyDisplay(issuingBody: string, other?: string): string {
  if (isOtherSelection(issuingBody)) return other?.trim() || OTHER_LABEL;
  return issuingBody;
}

export function getLanguagesByGroup() {
  return {
    africa: LANGUAGE_OPTIONS.filter((l) => l.group === 'africa'),
    world: LANGUAGE_OPTIONS.filter((l) => l.group === 'world'),
    other: LANGUAGE_OPTIONS.filter((l) => l.group === 'other'),
  };
}

export function getRegionsByGroup() {
  return {
    africa: COUNTRY_REGIONS.filter((r) => r.group === 'africa'),
    americas: COUNTRY_REGIONS.filter((r) => r.group === 'americas'),
    europe: COUNTRY_REGIONS.filter((r) => r.group === 'europe'),
    asia_pacific: COUNTRY_REGIONS.filter((r) => r.group === 'asia_pacific'),
    middle_east: COUNTRY_REGIONS.filter((r) => r.group === 'middle_east'),
    other: COUNTRY_REGIONS.filter((r) => r.group === 'other'),
  };
}
