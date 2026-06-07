export interface PendingPartnerInterview {
  interviewId: string
  applicantId: string
  applicantUsername: string
  applicantOnline: boolean
  accepted: boolean
  declined: boolean
}

const STORAGE_KEY = 'greenheart_partner_pending_interview'

export function getPendingPartnerInterview(): PendingPartnerInterview | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PendingPartnerInterview
  } catch {
    return null
  }
}

export function setPendingPartnerInterview(data: PendingPartnerInterview | null): void {
  if (!data) {
    sessionStorage.removeItem(STORAGE_KEY)
    return
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function patchPendingPartnerInterview(
  patch: Partial<PendingPartnerInterview>,
): PendingPartnerInterview | null {
  const current = getPendingPartnerInterview()
  if (!current) return null
  const next = { ...current, ...patch }
  setPendingPartnerInterview(next)
  return next
}
