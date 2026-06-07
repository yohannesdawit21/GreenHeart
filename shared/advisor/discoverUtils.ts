/**
 * Discover page helpers — filter chips, sorting, and advisor display summaries.
 */

import type { AdvisorCardDto } from '../contracts/users.api.js';
import {
  SPECIALTIES_BY_CATEGORY,
  getProfessionLabel,
  getSpecialtyCategoryLabel,
  resolveCredentialTypeDisplay,
  type SpecialtyCategoryId,
} from './credentialOptions.js';
import { formatLanguagesList } from './languageUtils.js';

export type DiscoverAdvisor = AdvisorCardDto & {
  featured?: boolean;
  matchScore?: number;
};

export const DISCOVER_ALL_FILTER = 'all' as const;
export type DiscoverFilterId = SpecialtyCategoryId | typeof DISCOVER_ALL_FILTER;

/** Short labels for horizontal filter chips on Discover. */
export const DISCOVER_FILTER_CHIPS: { id: DiscoverFilterId; label: string; shortLabel: string }[] = [
  { id: DISCOVER_ALL_FILTER, label: 'All advisors', shortLabel: 'All' },
  { id: 'mental_health', label: 'Mental health & emotional wellbeing', shortLabel: 'Mental health' },
  { id: 'relationships', label: 'Relationships & family', shortLabel: 'Relationships' },
  { id: 'trauma_grief', label: 'Trauma, grief & crisis', shortLabel: 'Trauma & grief' },
  { id: 'behavioral', label: 'Behavioral health & addiction', shortLabel: 'Addiction' },
  { id: 'wellness', label: 'Wellness, lifestyle & prevention', shortLabel: 'Wellness' },
  { id: 'holistic', label: 'Holistic & integrative approaches', shortLabel: 'Holistic' },
  { id: 'maternal_reproductive', label: 'Maternal & reproductive health', shortLabel: 'Maternal' },
  { id: 'chronic_illness', label: 'Chronic illness & disability support', shortLabel: 'Chronic illness' },
  { id: 'faith_spiritual', label: 'Faith-based & spiritual care', shortLabel: 'Faith-based' },
  { id: 'workplace_career', label: 'Workplace wellness & career', shortLabel: 'Workplace' },
  { id: 'identity_affirming', label: 'LGBTQ+ & identity-affirming care', shortLabel: 'LGBTQ+' },
  { id: 'youth_adolescent', label: 'Youth, teens & young adults', shortLabel: 'Youth' },
  { id: 'elder_aging', label: 'Elder care & aging', shortLabel: 'Elder care' },
  { id: 'community_cultural', label: 'Community & cultural healing', shortLabel: 'Community' },
];

/** Keyword hints for matching legacy bios/tags to a category when specialtyCategory is unset. */
const CATEGORY_KEYWORDS: Partial<Record<SpecialtyCategoryId, readonly string[]>> = {
  mental_health: ['anxiety', 'depression', 'stress', 'burnout', 'mental health', 'mood', 'adhd', 'ocd'],
  relationships: ['relationship', 'couples', 'marriage', 'family', 'parenting', 'communication'],
  trauma_grief: ['trauma', 'ptsd', 'grief', 'loss', 'crisis', 'emdr', 'domestic violence'],
  behavioral: ['addiction', 'substance', 'eating disorder', 'anger', 'recovery', 'behavioral'],
  wellness: ['wellness', 'mindfulness', 'nutrition', 'work-life', 'health coaching', 'preventive'],
  holistic: ['holistic', 'integrative', 'somatic', 'cbt', 'dbt', 'act', 'mind-body', 'spiritual wellness'],
  maternal_reproductive: ['maternal', 'pregnancy', 'postpartum', 'fertility', 'reproductive', 'perinatal'],
  chronic_illness: ['chronic', 'disability', 'pain', 'diabetes', 'hiv', 'cancer support', 'long-term illness'],
  faith_spiritual: ['faith', 'spiritual', 'pastoral', 'religious', 'chaplain', 'islamic counseling'],
  workplace_career: ['workplace', 'career', 'occupational', 'executive', 'professional stress', 'job'],
  identity_affirming: ['lgbtq', 'queer', 'trans', 'gender', 'identity', 'affirming', 'inclusive'],
  youth_adolescent: ['youth', 'adolescent', 'teen', 'young adult', 'school', 'child'],
  elder_aging: ['elder', 'aging', 'geriatric', 'dementia', 'caregiver', 'senior'],
  community_cultural: ['community', 'cultural', 'ancestral', 'african', 'diaspora', 'refugee', 'collective healing'],
};

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

/** True when advisor matches a primary focus category (credentials, tags, bio, or keywords). */
export function advisorMatchesCategory(advisor: DiscoverAdvisor, categoryId: DiscoverFilterId): boolean {
  if (categoryId === DISCOVER_ALL_FILTER) return true;

  const credCategory = advisor.credentials?.specialtyCategory;
  if (credCategory === categoryId) return true;

  const categoryLabel = normalize(getSpecialtyCategoryLabel(categoryId));
  const haystack = [
    advisor.bio,
    ...advisor.tags,
    credCategory ? getSpecialtyCategoryLabel(credCategory) : '',
  ]
    .filter(Boolean)
    .map(normalize)
    .join(' ');

  if (haystack.includes(categoryLabel)) return true;

  const categorySpecialties = SPECIALTIES_BY_CATEGORY[categoryId as SpecialtyCategoryId] ?? [];
  if (categorySpecialties.some((s) => advisor.tags.some((t) => normalize(t) === normalize(s)))) {
    return true;
  }

  const keywords = CATEGORY_KEYWORDS[categoryId as SpecialtyCategoryId] ?? [];
  return keywords.some((kw) => haystack.includes(kw));
}

/** Client-side text filter across bio, tags, credentials, and focus area. */
export function advisorMatchesQuery(advisor: DiscoverAdvisor, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;

  const parts = [
    advisor.username,
    advisor.bio,
    ...advisor.tags,
    advisor.credentials?.professionalTitle,
    advisor.credentials?.specialtyCategory
      ? getSpecialtyCategoryLabel(advisor.credentials.specialtyCategory)
      : '',
    advisor.credentials?.professionType ? getProfessionLabel(advisor.credentials.professionType) : '',
    advisor.credentials?.languages?.length
      ? formatLanguagesList(advisor.credentials.languages)
      : '',
  ].filter((p): p is string => Boolean(p));

  return parts.some((p) => normalize(p).includes(q));
}

export function filterAdvisors(
  advisors: DiscoverAdvisor[],
  options: { categoryId?: DiscoverFilterId; query?: string; onlineOnly?: boolean },
): DiscoverAdvisor[] {
  const categoryId = options.categoryId ?? DISCOVER_ALL_FILTER;
  const query = options.query?.trim() ?? '';

  return advisors.filter((advisor) => {
    if (options.onlineOnly && !advisor.isOnline) return false;
    if (!advisorMatchesCategory(advisor, categoryId)) return false;
    if (query && !advisorMatchesQuery(advisor, query)) return false;
    return true;
  });
}

/** Online first, then match score / featured, then rating. */
export function sortAdvisorsForDiscover(advisors: DiscoverAdvisor[]): DiscoverAdvisor[] {
  return [...advisors].sort((a, b) => {
    const onlineA = a.isOnline ? 1 : 0;
    const onlineB = b.isOnline ? 1 : 0;
    if (onlineA !== onlineB) return onlineB - onlineA;

    const scoreA = a.matchScore ?? (a.featured ? 0.85 : 0);
    const scoreB = b.matchScore ?? (b.featured ? 0.85 : 0);
    if (scoreA !== scoreB) return scoreB - scoreA;

    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    if (ratingA !== ratingB) return ratingB - ratingA;

    return a.username.localeCompare(b.username);
  });
}

export function getAdvisorFocusLabel(advisor: DiscoverAdvisor): string | undefined {
  const categoryId = advisor.credentials?.specialtyCategory;
  if (categoryId) return getSpecialtyCategoryLabel(categoryId);
  return undefined;
}

export function getAdvisorCredentialSummary(advisor: DiscoverAdvisor): string | undefined {
  const creds = advisor.credentials;
  if (!creds) return undefined;

  const parts: string[] = [];
  if (creds.professionalTitle?.trim()) {
    parts.push(creds.professionalTitle.trim());
  } else if (creds.professionType) {
    parts.push(getProfessionLabel(creds.professionType));
  }
  if (creds.credentialType?.trim()) {
    parts.push(
      resolveCredentialTypeDisplay(creds.credentialType, creds.credentialTypeOther),
    );
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function getAdvisorLanguagesSummary(advisor: DiscoverAdvisor): string | undefined {
  const langs = advisor.credentials?.languages;
  if (!langs?.length) return undefined;
  return formatLanguagesList(langs);
}
