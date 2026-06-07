/**
 * Structured advisor credential fields — stored in profiles.advisor_credentials (JSONB).
 */

export interface AdvisorCredentials {
  professionType: string;
  credentialType: string;
  issuingBody: string;
  issuingRegion: string;
  licenseNumber: string;
  degree?: string;
  yearsExperience: number;
  languages: string[];
  professionalTitle: string;
  specialtyCategory?: string;
  /** Voluntary board certifications beyond license */
  additionalCertifications?: string;
}

export const EMPTY_ADVISOR_CREDENTIALS: AdvisorCredentials = {
  professionType: '',
  credentialType: '',
  issuingBody: '',
  issuingRegion: '',
  licenseNumber: '',
  degree: '',
  yearsExperience: 0,
  languages: [],
  professionalTitle: '',
  specialtyCategory: '',
  additionalCertifications: '',
};
