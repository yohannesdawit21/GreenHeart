import type { AdvisorCredentials, AdvisorLanguage } from '../../shared/types/contracts.js';

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

const FLUENCY_LABELS: Record<string, string> = {
  native: 'Native / bilingual',
  fluent: 'Fluent',
  conversational: 'Conversational',
  basic: 'Basic',
};

const OTHER = '__other__';

function professionLabel(id: string): string {
  return PROFESSION_LABELS[id] ?? id;
}

function categoryLabel(id: string): string {
  return CATEGORY_LABELS[id] ?? id;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
}

function normalizeAdvisorLanguages(raw: unknown): AdvisorLanguage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): AdvisorLanguage | null => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (!trimmed) return null;
        return { code: slugify(trimmed), name: trimmed, fluency: 'fluent' };
      }
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        const name = String(o.name ?? '').trim();
        const code = String(o.code ?? slugify(name)).trim();
        const fluency = String(o.fluency ?? 'fluent');
        if (!name && !code) return null;
        return {
          code: code || slugify(name),
          name: name || code,
          fluency: ['native', 'fluent', 'conversational', 'basic'].includes(fluency)
            ? (fluency as AdvisorLanguage['fluency'])
            : 'fluent',
        };
      }
      return null;
    })
    .filter((l): l is AdvisorLanguage => l !== null);
}

function formatLanguagesList(languages: AdvisorLanguage[]): string {
  return languages
    .map((l) => `${l.name} (${FLUENCY_LABELS[l.fluency] ?? l.fluency})`)
    .join(', ');
}

function resolveOther(value: string, other?: string): string {
  if (value === OTHER || value === 'Other / not listed') return other?.trim() || 'Other / not listed';
  return value;
}

export function buildAdvisorBioFromCredentials(
  credentials: AdvisorCredentials,
  approach: string,
): string {
  const header: string[] = [];

  if (credentials.professionalTitle.trim()) header.push(`Title: ${credentials.professionalTitle.trim()}`);
  if (credentials.professionType) header.push(`Profession: ${professionLabel(credentials.professionType)}`);
  if (credentials.credentialType.trim()) {
    header.push(`Credential: ${resolveOther(credentials.credentialType, credentials.credentialTypeOther)}`);
  }
  if (credentials.issuingBody.trim()) {
    header.push(`Issuing body: ${resolveOther(credentials.issuingBody, credentials.issuingBodyOther)}`);
  }
  if (credentials.issuingRegion.trim()) {
    header.push(`Region: ${resolveOther(credentials.issuingRegion, credentials.issuingRegionOther)}`);
  }
  if (credentials.licenseNumber.trim()) header.push(`License #: ${credentials.licenseNumber.trim()}`);
  if (credentials.degree?.trim()) header.push(`Degree: ${credentials.degree.trim()}`);
  if (credentials.yearsExperience > 0) header.push(`Experience: ${credentials.yearsExperience} years`);
  if (credentials.languages.length > 0) header.push(`Languages: ${formatLanguagesList(credentials.languages)}`);
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
    resolveOther(credentials.credentialType, credentials.credentialTypeOther),
    resolveOther(credentials.issuingBody, credentials.issuingBodyOther),
    resolveOther(credentials.issuingRegion, credentials.issuingRegionOther),
    credentials.degree,
    credentials.additionalCertifications,
    formatLanguagesList(credentials.languages),
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
    issuingRegion: String(c.issuingRegion ?? ''),
    issuingRegionOther: c.issuingRegionOther ? String(c.issuingRegionOther) : undefined,
    professionType: String(c.professionType ?? ''),
    credentialType: String(c.credentialType ?? ''),
    credentialTypeOther: c.credentialTypeOther ? String(c.credentialTypeOther) : undefined,
    issuingBody: String(c.issuingBody ?? ''),
    issuingBodyOther: c.issuingBodyOther ? String(c.issuingBodyOther) : undefined,
    licenseNumber: String(c.licenseNumber ?? ''),
    degree: c.degree ? String(c.degree) : undefined,
    yearsExperience: Number(c.yearsExperience) || 0,
    languages: normalizeAdvisorLanguages(c.languages),
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
