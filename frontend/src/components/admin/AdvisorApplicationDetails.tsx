import { MaterialIcon } from '../MaterialIcon'
import { parseAdvisorApplicationBio } from '../../utils/advisorApplicationBio'

function DetailField({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">{label}</p>
      <p className="text-sm text-on-surface whitespace-pre-wrap">{value}</p>
    </div>
  )
}

export function AdvisorApplicationDetails({ bio }: { bio: string }) {
  const parsed = parseAdvisorApplicationBio(bio)

  if (!parsed.rawBio) {
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
        Registration application (text credentials — no file uploads in current flow)
      </div>
      <div className="grid sm:grid-cols-2 gap-stack-md bg-surface-container-lowest rounded-lg border border-outline-variant/40 p-stack-sm">
        <DetailField label="Professional title" value={parsed.professionalTitle} />
        <DetailField label="Years of experience" value={parsed.yearsExperience ? `${parsed.yearsExperience} years` : undefined} />
        <div className="sm:col-span-2">
          <DetailField label="License & certifications" value={parsed.credentials} />
        </div>
        <div className="sm:col-span-2">
          <DetailField label="Approach & who they help" value={parsed.approach} />
        </div>
      </div>
    </div>
  )
}
