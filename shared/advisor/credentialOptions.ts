/**
 * Advisor credential dropdown options — shared by apply wizard, settings, and backend validation.
 */

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

export const US_REGIONS = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
] as const;

export const INTERNATIONAL_REGIONS = [
  'Canada — Provincial/Territorial Board',
  'United Kingdom — HCPC / BACP',
  'European Union — National regulatory body',
  'Australia — AHPRA',
  'Other international jurisdiction',
] as const;

export const ALL_REGIONS = [...US_REGIONS, ...INTERNATIONAL_REGIONS] as const;

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

export const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'Mandarin Chinese',
  'Cantonese',
  'French',
  'Arabic',
  'Hindi',
  'Portuguese',
  'Russian',
  'Tagalog',
  'Vietnamese',
  'Korean',
  'German',
  'Italian',
  'American Sign Language (ASL)',
] as const;

export const SPECIALTY_CATEGORIES = [
  { id: 'mental_health', label: 'Mental health & emotional wellbeing' },
  { id: 'relationships', label: 'Relationships & family' },
  { id: 'trauma_grief', label: 'Trauma, grief & crisis' },
  { id: 'behavioral', label: 'Behavioral health & addiction' },
  { id: 'wellness', label: 'Wellness, lifestyle & prevention' },
  { id: 'holistic', label: 'Holistic & integrative approaches' },
] as const;

export type SpecialtyCategoryId = (typeof SPECIALTY_CATEGORIES)[number]['id'];

export const SPECIALTIES_BY_CATEGORY: Record<SpecialtyCategoryId, readonly string[]> = {
  mental_health: [
    'Anxiety',
    'Depression',
    'Stress management',
    'Sleep disorders',
    'Burnout',
    'Self-esteem',
    'ADHD support',
    'OCD',
    'Bipolar support',
  ],
  relationships: [
    'Couples counseling',
    'Marriage therapy',
    'Family therapy',
    'Parenting',
    'Communication skills',
    'Conflict resolution',
    'Divorce / separation',
  ],
  trauma_grief: [
    'Trauma / PTSD',
    'EMDR-informed care',
    'Grief & loss',
    'Crisis support',
    'Domestic violence recovery',
  ],
  behavioral: [
    'Addiction recovery',
    'Substance use',
    'Eating disorders',
    'Anger management',
    'Behavioral change',
  ],
  wellness: [
    'Mindfulness',
    'Nutrition counseling',
    'Weight management',
    'Chronic illness support',
    'Work-life balance',
    'Health coaching',
    'Preventive care',
  ],
  holistic: [
    'Integrative therapy',
    'Somatic approaches',
    'CBT',
    'DBT-informed skills',
    'Acceptance & Commitment (ACT)',
    'Mind-body connection',
    'Spiritual wellness',
  ],
};

export const SESSION_RATE_OPTIONS = [50, 75, 100, 125, 150, 175, 200] as const;

export const YEARS_EXPERIENCE_OPTIONS = Array.from({ length: 41 }, (_, i) => i) as readonly number[];

export function getCredentialTypesForProfession(professionType: string): readonly string[] {
  return CREDENTIAL_TYPES_BY_PROFESSION[professionType as ProfessionTypeId] ?? [];
}

export function getIssuingBodiesForCredential(credentialType: string): readonly string[] {
  return ISSUING_BODIES_BY_CREDENTIAL[credentialType] ?? ['State or national licensing authority'];
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
