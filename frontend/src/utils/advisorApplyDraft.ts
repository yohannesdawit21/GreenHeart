const DRAFT_KEY = 'gh_advisor_apply_draft'

import type { AdvisorCredentials } from '@shared/contracts/models.advisor'

export interface AdvisorApplyDraft {
  step: number
  email: string
  username: string
  credentials: AdvisorCredentials
  selectedTags: string[]
  coinRatePerSession: number
  approach: string
  savedAt: string
}

export function loadAdvisorApplyDraft(): AdvisorApplyDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AdvisorApplyDraft
  } catch {
    return null
  }
}

export function saveAdvisorApplyDraft(draft: Omit<AdvisorApplyDraft, 'savedAt'>): void {
  localStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({ ...draft, savedAt: new Date().toISOString() }),
  )
}

export function clearAdvisorApplyDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
}
