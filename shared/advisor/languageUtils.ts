import type { AdvisorLanguage } from '../contracts/models.advisor.js';
import {
  FLUENCY_LABELS,
  getLanguageByCode,
  slugifyLanguageName,
  type LanguageFluency,
} from './languageOptions.js';

export function formatLanguageEntry(lang: AdvisorLanguage): string {
  const fluency = FLUENCY_LABELS[lang.fluency as LanguageFluency] ?? lang.fluency;
  return `${lang.name} (${fluency})`;
}

export function formatLanguagesList(languages: AdvisorLanguage[]): string {
  return languages.map(formatLanguageEntry).join(', ');
}

/** Normalize legacy string[] or partial objects from JSONB */
export function normalizeAdvisorLanguages(raw: unknown): AdvisorLanguage[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): AdvisorLanguage | null => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (!trimmed) return null;
        return { code: slugifyLanguageName(trimmed), name: trimmed, fluency: 'fluent' };
      }
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        const name = String(o.name ?? '').trim();
        const code = String(o.code ?? slugifyLanguageName(name)).trim();
        const fluency = String(o.fluency ?? 'fluent') as AdvisorLanguage['fluency'];
        if (!name && !code) return null;
        const known = getLanguageByCode(code);
        return {
          code: code || slugifyLanguageName(name),
          name: name || known?.name || code,
          fluency: ['native', 'fluent', 'conversational', 'basic'].includes(fluency)
            ? fluency
            : 'fluent',
        };
      }
      return null;
    })
    .filter((l): l is AdvisorLanguage => l !== null);
}

export function createEmptyLanguageRow(): AdvisorLanguage {
  return { code: '', name: '', fluency: 'fluent' };
}
