/**
 * Advisor language options — African languages featured first, then major world languages.
 * Fluency scale aligned with healthcare professional profiles (Native → Basic).
 */

export const FLUENCY_LEVELS = [
  { id: 'native', label: 'Native / bilingual' },
  { id: 'fluent', label: 'Fluent' },
  { id: 'conversational', label: 'Conversational' },
  { id: 'basic', label: 'Basic' },
] as const;

export type LanguageFluency = (typeof FLUENCY_LEVELS)[number]['id'];

export interface LanguageOption {
  code: string;
  name: string;
  /** Featured African languages appear first in UI */
  group: 'africa' | 'world' | 'other';
}

/** Prominent African languages + major world languages for wellness platforms */
export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  // Africa — featured
  { code: 'am', name: 'Amharic', group: 'africa' },
  { code: 'sw', name: 'Swahili', group: 'africa' },
  { code: 'ha', name: 'Hausa', group: 'africa' },
  { code: 'yo', name: 'Yoruba', group: 'africa' },
  { code: 'ig', name: 'Igbo', group: 'africa' },
  { code: 'zu', name: 'Zulu', group: 'africa' },
  { code: 'xh', name: 'Xhosa', group: 'africa' },
  { code: 'om', name: 'Oromo', group: 'africa' },
  { code: 'so', name: 'Somali', group: 'africa' },
  { code: 'ti', name: 'Tigrinya', group: 'africa' },
  { code: 'sn', name: 'Shona', group: 'africa' },
  { code: 'wo', name: 'Wolof', group: 'africa' },
  { code: 'ff', name: 'Fulani (Fula)', group: 'africa' },
  { code: 'ln', name: 'Lingala', group: 'africa' },
  { code: 'rw', name: 'Kinyarwanda', group: 'africa' },
  { code: 'lg', name: 'Luganda', group: 'africa' },
  { code: 'tw', name: 'Twi', group: 'africa' },
  { code: 'ee', name: 'Ewe', group: 'africa' },
  { code: 'bm', name: 'Bambara', group: 'africa' },
  { code: 'ber', name: 'Berber / Tamazight', group: 'africa' },
  { code: 'ar-af', name: 'Arabic (North / East Africa)', group: 'africa' },
  { code: 'af', name: 'Afrikaans', group: 'africa' },
  { code: 'st', name: 'Sesotho (Southern Sotho)', group: 'africa' },
  { code: 'tn', name: 'Setswana', group: 'africa' },
  { code: 'nso', name: 'Sepedi (Northern Sotho)', group: 'africa' },
  { code: 'pcm', name: 'Nigerian Pidgin', group: 'africa' },
  { code: 'ki', name: 'Kikuyu', group: 'africa' },
  { code: 'ny', name: 'Chichewa / Nyanja', group: 'africa' },
  { code: 'mg', name: 'Malagasy', group: 'africa' },
  { code: 'ts', name: 'Tsonga', group: 'africa' },
  { code: 've', name: 'Venda', group: 'africa' },
  { code: 'nd', name: 'Ndebele', group: 'africa' },
  // Major world languages
  { code: 'en', name: 'English', group: 'world' },
  { code: 'es', name: 'Spanish', group: 'world' },
  { code: 'fr', name: 'French', group: 'world' },
  { code: 'pt', name: 'Portuguese', group: 'world' },
  { code: 'ar', name: 'Arabic', group: 'world' },
  { code: 'zh', name: 'Mandarin Chinese', group: 'world' },
  { code: 'yue', name: 'Cantonese', group: 'world' },
  { code: 'hi', name: 'Hindi', group: 'world' },
  { code: 'ur', name: 'Urdu', group: 'world' },
  { code: 'bn', name: 'Bengali', group: 'world' },
  { code: 'ru', name: 'Russian', group: 'world' },
  { code: 'de', name: 'German', group: 'world' },
  { code: 'it', name: 'Italian', group: 'world' },
  { code: 'ja', name: 'Japanese', group: 'world' },
  { code: 'ko', name: 'Korean', group: 'world' },
  { code: 'vi', name: 'Vietnamese', group: 'world' },
  { code: 'tl', name: 'Tagalog / Filipino', group: 'world' },
  { code: 'tr', name: 'Turkish', group: 'world' },
  { code: 'fa', name: 'Persian (Farsi)', group: 'world' },
  { code: 'he', name: 'Hebrew', group: 'world' },
  { code: 'nl', name: 'Dutch', group: 'world' },
  { code: 'pl', name: 'Polish', group: 'world' },
  { code: 'uk', name: 'Ukrainian', group: 'world' },
  { code: 'th', name: 'Thai', group: 'world' },
  { code: 'id', name: 'Indonesian', group: 'world' },
  { code: 'ms', name: 'Malay', group: 'world' },
  { code: 'asl', name: 'American Sign Language (ASL)', group: 'world' },
  { code: 'other', name: 'Other / not listed', group: 'other' },
] as const;

export const FLUENCY_LABELS: Record<LanguageFluency, string> = {
  native: 'Native / bilingual',
  fluent: 'Fluent',
  conversational: 'Conversational',
  basic: 'Basic',
};

export function getLanguageByCode(code: string): LanguageOption | undefined {
  return LANGUAGE_OPTIONS.find((l) => l.code === code);
}

export function getFluencyLabel(fluency: LanguageFluency): string {
  return FLUENCY_LABELS[fluency] ?? fluency;
}

export function slugifyLanguageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
}
