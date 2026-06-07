import type { AdvisorCredentials } from '../../shared/types/contracts.js';

const PROFESSION_LABELS: Record<string, string> = {
  psychologist: 'Psychologist (PhD / PsyD)',
  licensed_counselor: 'Licensed Professional Counselor',
  clinical_social_worker: 'Clinical Social Worker',
  marriage_family_therapist: 'Marriage & Family Therapist',
  psychiatrist: 'Psychiatrist (MD / DO)',
  psychiatric_nurse: 'Psychiatric Nurse Practitioner',
  substance_abuse_counselor: 'Substance Use / Addiction Counselor',
  wellness_coach: 'Wellness / Health Coach',
  holistic_practitioner: 'Holistic / Integrative Practitioner',
  nutritionist: 'Registered Dietitian / Nutritionist',
  other: 'Other licensed or certified professional',
};

const CATEGORY_LABELS: Record<string, string> = {
  mental_health: 'Mental health & emotional wellbeing',
  relationships: 'Relationships & family',
  trauma_grief: 'Trauma, grief & crisis',
  behavioral: 'Behavioral health & addiction',
  wellness: 'Wellness, lifestyle & prevention',
  holistic: 'Holistic & integrative approaches',
};

function professionLabel(id: string): string {
  return PROFESSION_LABELS[id] ?? id;
}

function categoryLabel(id: string): string {
  return CATEGORY_LABELS[id] ?? id;
}

export function buildAdvisorBioFromCredentials(
  credentials: AdvisorCredentials,
  approach: string,
): string {
  const header: string[] = [];

  if (credentials.professionalTitle.trim()) header.push(`Title: ${credentials.professionalTitle.trim()}`);
  if (credentials.professionType) header.push(`Profession: ${professionLabel(credentials.professionType)}`);
  if (credentials.credentialType.trim()) header.push(`Credential: ${credentials.credentialType.trim()}`);
  if (credentials.issuingBody.trim()) header.push(`Issuing body: ${credentials.issuingBody.trim()}`);
  if (credentials.issuingRegion.trim()) header.push(`Region: ${credentials.issuingRegion.trim()}`);
  if (credentials.licenseNumber.trim()) header.push(`License #: ${credentials.licenseNumber.trim()}`);
  if (credentials.degree?.trim()) header.push(`Degree: ${credentials.degree.trim()}`);
  if (credentials.yearsExperience > 0) header.push(`Experience: ${credentials.yearsExperience} years`);
  if (credentials.languages.length > 0) header.push(`Languages: ${credentials.languages.join(', ')}`);
  if (credentials.specialtyCategory) header.push(`Focus area: ${categoryLabel(credentials.specialtyCategory)}`);
  if (credentials.additionalCertifications?.trim()) {
    header.push(`Additional certifications: ${credentials.additionalCertifications.trim()}`);
  }

  const narrative = approach.trim();
  if (header.length === 0) return narrative;
  if (!narrative) return header.join('\n');
  return `${header.join('\n')}\n---\n${narrative}`;
}

export function credentialsToSearchText(credentials: AdvisorCredentials | undefined | null): string {
  if (!credentials) return '';
  return [
    credentials.professionalTitle,
    professionLabel(credentials.professionType),
    credentials.credentialType,
    credentials.issuingBody,
    credentials.issuingRegion,
    credentials.degree,
    credentials.additionalCertifications,
    credentials.languages.join(', '),
    credentials.specialtyCategory ? categoryLabel(credentials.specialtyCategory) : '',
  ]
    .filter(Boolean)
    .join('. ');
}

export function parseAdvisorCredentials(raw: unknown): AdvisorCredentials | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const c = raw as Record<string, unknown>;
  if (!c.professionType && !c.credentialType && !c.professionalTitle) return undefined;
  return {
    professionType: String(c.professionType ?? ''),
    credentialType: String(c.credentialType ?? ''),
    issuingBody: String(c.issuingBody ?? ''),
    issuingRegion: String(c.issuingRegion ?? ''),
    licenseNumber: String(c.licenseNumber ?? ''),
    degree: c.degree ? String(c.degree) : undefined,
    yearsExperience: Number(c.yearsExperience) || 0,
    languages: Array.isArray(c.languages) ? c.languages.map(String) : [],
    professionalTitle: String(c.professionalTitle ?? ''),
    specialtyCategory: c.specialtyCategory ? String(c.specialtyCategory) : undefined,
    additionalCertifications: c.additionalCertifications ? String(c.additionalCertifications) : undefined,
  };
}

export function isEmptyCredentials(credentials: AdvisorCredentials | undefined): boolean {
  if (!credentials) return true;
  return !(
    credentials.professionType ||
    credentials.credentialType ||
    credentials.professionalTitle ||
    credentials.licenseNumber
  );
}
