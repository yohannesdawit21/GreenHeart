import type { AdvisorCredentials, AdvisorLanguage } from '@shared/contracts/models.advisor';
import {
  getProfessionLabel,
  getSpecialtyCategoryLabel,
  resolveCredentialTypeDisplay,
  resolveIssuingBodyDisplay,
  resolveRegionDisplay,
} from '@shared/advisor/credentialOptions';
import { formatLanguagesList } from '@shared/advisor/languageUtils';
import { buildAdvisorBioFromCredentials } from '@shared/advisor/buildAdvisorBio';

export type { AdvisorCredentials };

/** Parsed fields from advisor apply form (stored in profiles.bio or advisor_credentials). */
export interface ParsedAdvisorApplication {
  professionalTitle?: string
  professionType?: string
  credentialType?: string
  issuingBody?: string
  issuingRegion?: string
  licenseNumber?: string
  degree?: string
  yearsExperience?: string
  languages?: AdvisorLanguage[]
  languagesDisplay?: string
  specialtyCategory?: string
  additionalCertifications?: string
  credentials?: string
  approach?: string
  rawBio: string
  isStructured: boolean
}

export function buildAdvisorBio(
  credentials: AdvisorCredentials,
  approach: string,
): string {
  return buildAdvisorBioFromCredentials(credentials, approach);
}

export function parseAdvisorApplicationBio(
  bio: string,
  credentials?: AdvisorCredentials,
): ParsedAdvisorApplication {
  if (credentials?.professionalTitle || credentials?.credentialType) {
    return {
      professionalTitle: credentials.professionalTitle,
      professionType: getProfessionLabel(credentials.professionType),
      credentialType: resolveCredentialTypeDisplay(
        credentials.credentialType,
        credentials.credentialTypeOther,
      ),
      issuingBody: resolveIssuingBodyDisplay(credentials.issuingBody, credentials.issuingBodyOther),
      issuingRegion: resolveRegionDisplay(credentials.issuingRegion, credentials.issuingRegionOther),
      licenseNumber: credentials.licenseNumber,
      degree: credentials.degree,
      yearsExperience:
        credentials.yearsExperience > 0 ? String(credentials.yearsExperience) : undefined,
      languages: credentials.languages,
      languagesDisplay: formatLanguagesList(credentials.languages),
      specialtyCategory: credentials.specialtyCategory
        ? getSpecialtyCategoryLabel(credentials.specialtyCategory)
        : undefined,
      additionalCertifications: credentials.additionalCertifications,
      approach: bio.includes('\n---\n') ? bio.split('\n---\n').slice(1).join('\n---\n').trim() : bio.trim() || undefined,
      rawBio: bio,
      isStructured: true,
    };
  }

  const rawBio = bio?.trim() ?? ''
  if (!rawBio) {
    return { rawBio: '', isStructured: false }
  }

  const [headerPart, ...rest] = rawBio.split('\n---\n')
  const approach = rest.join('\n---\n').trim() || undefined

  let professionalTitle: string | undefined
  let professionType: string | undefined
  let credentialType: string | undefined
  let issuingBody: string | undefined
  let issuingRegion: string | undefined
  let licenseNumber: string | undefined
  let degree: string | undefined
  let yearsExperience: string | undefined
  let languagesDisplay: string | undefined
  let specialtyCategory: string | undefined
  let additionalCertifications: string | undefined
  let credentialsLine: string | undefined
  let isStructured = false

  for (const line of headerPart.split('\n')) {
    if (line.startsWith('Title: ')) {
      professionalTitle = line.slice(7).trim()
      isStructured = true
    } else if (line.startsWith('Profession: ')) {
      professionType = line.slice(12).trim()
      isStructured = true
    } else if (line.startsWith('Credential: ')) {
      credentialType = line.slice(12).trim()
      isStructured = true
    } else if (line.startsWith('Issuing body: ')) {
      issuingBody = line.slice(14).trim()
      isStructured = true
    } else if (line.startsWith('Region: ')) {
      issuingRegion = line.slice(8).trim()
      isStructured = true
    } else if (line.startsWith('License #: ')) {
      licenseNumber = line.slice(11).trim()
      isStructured = true
    } else if (line.startsWith('Degree: ')) {
      degree = line.slice(8).trim()
      isStructured = true
    } else if (line.startsWith('Credentials: ')) {
      credentialsLine = line.slice(13).trim()
      isStructured = true
    } else if (line.startsWith('Experience: ')) {
      yearsExperience = line.slice(12).replace(/ years$/, '').trim()
      isStructured = true
    } else if (line.startsWith('Languages: ')) {
      languagesDisplay = line.slice(11).trim()
      isStructured = true
    } else if (line.startsWith('Focus area: ')) {
      specialtyCategory = line.slice(12).trim()
      isStructured = true
    } else if (line.startsWith('Additional certifications: ')) {
      additionalCertifications = line.slice(27).trim()
      isStructured = true
    }
  }

  if (!isStructured) {
    return { approach: rawBio, rawBio, isStructured: false }
  }

  return {
    professionalTitle,
    professionType,
    credentialType: credentialType ?? credentialsLine,
    issuingBody,
    issuingRegion,
    licenseNumber,
    degree,
    credentials: credentialsLine,
    yearsExperience,
    languagesDisplay,
    specialtyCategory,
    additionalCertifications,
    approach,
    rawBio,
    isStructured: true,
  }
}

export function credentialPreview(
  bio: string,
  credentials?: AdvisorCredentials,
): string {
  const parsed = parseAdvisorApplicationBio(bio, credentials)
  return (
    parsed.credentialType ??
    parsed.credentials ??
    parsed.professionalTitle ??
    (parsed.isStructured ? '—' : parsed.rawBio.slice(0, 80))
  )
}
