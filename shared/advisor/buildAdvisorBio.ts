import type { AdvisorCredentials } from '../contracts/models.advisor.js';
import { getProfessionLabel, getSpecialtyCategoryLabel } from './credentialOptions.js';

/** Build searchable bio text from structured credentials + narrative approach. */
export function buildAdvisorBioFromCredentials(
  credentials: AdvisorCredentials,
  approach: string,
): string {
  const header: string[] = [];

  if (credentials.professionalTitle.trim()) {
    header.push(`Title: ${credentials.professionalTitle.trim()}`);
  }
  if (credentials.professionType) {
    header.push(`Profession: ${getProfessionLabel(credentials.professionType)}`);
  }
  if (credentials.credentialType.trim()) {
    header.push(`Credential: ${credentials.credentialType.trim()}`);
  }
  if (credentials.issuingBody.trim()) {
    header.push(`Issuing body: ${credentials.issuingBody.trim()}`);
  }
  if (credentials.issuingRegion.trim()) {
    header.push(`Region: ${credentials.issuingRegion.trim()}`);
  }
  if (credentials.licenseNumber.trim()) {
    header.push(`License #: ${credentials.licenseNumber.trim()}`);
  }
  if (credentials.degree?.trim()) {
    header.push(`Degree: ${credentials.degree.trim()}`);
  }
  if (credentials.yearsExperience > 0) {
    header.push(`Experience: ${credentials.yearsExperience} years`);
  }
  if (credentials.languages.length > 0) {
    header.push(`Languages: ${credentials.languages.join(', ')}`);
  }
  if (credentials.specialtyCategory) {
    header.push(`Focus area: ${getSpecialtyCategoryLabel(credentials.specialtyCategory)}`);
  }
  if (credentials.additionalCertifications?.trim()) {
    header.push(`Additional certifications: ${credentials.additionalCertifications.trim()}`);
  }

  const narrative = approach.trim();
  if (header.length === 0) return narrative;
  if (!narrative) return header.join('\n');
  return `${header.join('\n')}\n---\n${narrative}`;
}

/** Flatten credentials for semantic search embedding text. */
export function credentialsToSearchText(credentials: AdvisorCredentials | undefined): string {
  if (!credentials) return '';
  const parts = [
    credentials.professionalTitle,
    getProfessionLabel(credentials.professionType),
    credentials.credentialType,
    credentials.issuingBody,
    credentials.issuingRegion,
    credentials.degree,
    credentials.additionalCertifications,
    credentials.languages.join(', '),
    credentials.specialtyCategory ? getSpecialtyCategoryLabel(credentials.specialtyCategory) : '',
  ].filter(Boolean);
  return parts.join('. ');
}
