/**
 * Structured advisor credential fields — stored in profiles.advisor_credentials (JSONB).
 */

import type { LanguageFluency } from '../advisor/languageOptions.js';

export interface AdvisorLanguage {
  code: string;
  name: string;
  fluency: LanguageFluency;
}

export interface AdvisorCredentials {
  /** Country or licensing jurisdiction (ISO-style id or region key) */
  issuingRegion: string;
  /** Free text when issuingRegion is __other__ */
  issuingRegionOther?: string;
  professionType: string;
  credentialType: string;
  /** Free text when credentialType is __other__ */
  credentialTypeOther?: string;
  issuingBody: string;
  /** Free text when issuingBody is __other__ */
  issuingBodyOther?: string;
  licenseNumber: string;
  degree?: string;
  yearsExperience: number;
  languages: AdvisorLanguage[];
  professionalTitle: string;
  specialtyCategory?: string;
  /** Voluntary board certifications beyond license */
  additionalCertifications?: string;
}

export const OTHER_OPTION = '__other__';

export const EMPTY_ADVISOR_CREDENTIALS: AdvisorCredentials = {
  issuingRegion: '',
  issuingRegionOther: '',
  professionType: '',
  credentialType: '',
  credentialTypeOther: '',
  issuingBody: '',
  issuingBodyOther: '',
  licenseNumber: '',
  degree: '',
  yearsExperience: 0,
  languages: [],
  professionalTitle: '',
  specialtyCategory: '',
  additionalCertifications: '',
};
