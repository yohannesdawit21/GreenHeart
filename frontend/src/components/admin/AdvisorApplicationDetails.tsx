import { MaterialIcon } from '../MaterialIcon'
import { parseAdvisorApplicationBio } from '../../utils/advisorApplicationBio'
import type { AdvisorCredentials } from '@shared/contracts/models.advisor'

function DetailField({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">{label}</p>
      <p className="text-sm text-on-surface whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function LanguageList({
  languagesDisplay,
  languages,
}: {
  languagesDisplay?: string
  languages?: AdvisorCredentials['languages']
}) {
  const text =
    languagesDisplay ??
    (languages?.length
      ? languages.map((l) => `${l.name} (${l.fluency})`).join(', ')
      : undefined)
  if (!text?.trim()) return null
  return <DetailField label="Languages" value={text} />
}

export function AdvisorApplicationDetails({
  bio,
  credentials,
}: {
  bio: string
  credentials?: AdvisorCredentials
}) {
  const parsed = parseAdvisorApplicationBio(bio, credentials)

  if (!parsed.rawBio && !credentials) {
    return <p className="text-sm text-on-surface-variant italic">No application details provided.</p>
  }

  if (!parsed.isStructured) {
    return (
      <pre className="whitespace-pre-wrap font-body-md text-on-surface-variant bg-surface-container-lowest rounded-lg border border-outline-variant/40 p-stack-sm text-xs leading-relaxed">
        {parsed.rawBio}
      </pre>
    )
  }

  return (
    <div className="space-y-stack-sm">
      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
        <MaterialIcon name="description" className="text-base text-secondary" />
        Structured application — credentials verified during partner interview
      </div>
      <div className="grid sm:grid-cols-2 gap-stack-md bg-surface-container-lowest rounded-lg border border-outline-variant/40 p-stack-sm">
        <DetailField label="Professional title" value={parsed.professionalTitle} />
        <DetailField label="Profession type" value={parsed.professionType} />
        <DetailField label="Credential / license type" value={parsed.credentialType} />
        <DetailField label="Years of experience" value={parsed.yearsExperience ? `${parsed.yearsExperience} years` : undefined} />
        <DetailField label="Issuing body" value={parsed.issuingBody} />
        <DetailField label="Country / region" value={parsed.issuingRegion} />
        <DetailField label="License number" value={parsed.licenseNumber} />
        <DetailField label="Degree" value={parsed.degree} />
        <LanguageList languagesDisplay={parsed.languagesDisplay} languages={parsed.languages} />
        <DetailField label="Primary focus area" value={parsed.specialtyCategory} />
        <div className="sm:col-span-2">
          <DetailField label="Additional certifications" value={parsed.additionalCertifications} />
        </div>
        <div className="sm:col-span-2">
          <DetailField label="Approach & who they help" value={parsed.approach} />
        </div>
      </div>
    </div>
  )
}
