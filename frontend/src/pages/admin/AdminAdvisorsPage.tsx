import { useState, useEffect, useCallback, useMemo, Fragment } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardAlert,
  DashboardSection,
  EmptyState,
  LoadingSpinner,
  VerificationStatusPill,
} from '../../components/layout/dashboard-ui'
import { btnDanger, btnSuccess } from '../../components/layout/buttonStyles'
import { MaterialIcon } from '../../components/MaterialIcon'
import { AdminSubNav } from '../../components/admin/AdminSubNav'
import { verificationService } from '../../api/verification.service'
import { getApiErrorMessage } from '../../utils/apiError'
import type { ApplicantDto, VerificationStatus } from '@shared/contracts/verification.api'

type StatusFilter = 'all' | VerificationStatus

const FILTER_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'verified', label: 'Verified' },
  { id: 'pending_review', label: 'Pending' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'suspended', label: 'Suspended' },
]

export function AdminAdvisorsPage() {
  const [advisors, setAdvisors] = useState<ApplicantDto[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [overrideError, setOverrideError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadAdvisors = useCallback(async () => {
    try {
      const data = await verificationService.getAdminAdvisors()
      setAdvisors(data.applicants)
      setPageError('')
    } catch (err) {
      setPageError(getApiErrorMessage(err, 'Failed to load advisors.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAdvisors()
  }, [loadAdvisors])

  const filtered = useMemo(() => {
    if (filter === 'all') return advisors
    return advisors.filter((a) => a.verificationStatus === filter)
  }, [advisors, filter])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: advisors.length }
    for (const a of advisors) {
      c[a.verificationStatus] = (c[a.verificationStatus] ?? 0) + 1
    }
    return c
  }, [advisors])

  const handleOverride = async (advisorId: string, status: VerificationStatus) => {
    setOverrideError('')
    try {
      await verificationService.overrideStatus(advisorId, { status })
      await loadAdvisors()
    } catch (err) {
      setOverrideError(getApiErrorMessage(err, 'Failed to update verification status.'))
    }
  }

  return (
    <AppShell activeNav="admin-advisors" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Advisor doctors"
          description="Read-only registry of all advisor applications and verified providers. Override status when needed."
        />

        <AdminSubNav />

        {pageError && (
          <DashboardAlert variant="error" icon="error">
            {pageError}
          </DashboardAlert>
        )}
        {overrideError && (
          <DashboardAlert variant="error" icon="error">
            {overrideError}
          </DashboardAlert>
        )}

        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-full border font-label-md transition-colors ${
                filter === tab.id
                  ? 'bg-primary-container text-on-primary-container border-primary/30'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary/30'
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-70">({counts[tab.id] ?? 0})</span>
            </button>
          ))}
        </div>

        <DashboardSection
          title="Advisor registry"
          badge={
            <span className="bg-secondary-container/30 text-on-secondary-container px-3 py-1 rounded-full font-label-md text-xs">
              {filtered.length} shown
            </span>
          }
        >
          {loading ? (
            <LoadingSpinner label="Loading advisors…" />
          ) : filtered.length === 0 ? (
            <EmptyState icon="person_search" title="No advisors in this filter" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low/50">
                    <th className="py-stack-sm px-stack-lg text-xs uppercase tracking-wide text-on-surface-variant font-label-md w-8" />
                    <th className="py-stack-sm px-stack-lg text-xs uppercase tracking-wide text-on-surface-variant font-label-md">
                      Advisor
                    </th>
                    <th className="py-stack-sm px-stack-lg text-xs uppercase tracking-wide text-on-surface-variant font-label-md">
                      Status
                    </th>
                    <th className="py-stack-sm px-stack-lg text-xs uppercase tracking-wide text-on-surface-variant font-label-md">
                      Specialties
                    </th>
                    <th className="py-stack-sm px-stack-lg text-xs uppercase tracking-wide text-on-surface-variant font-label-md">
                      Rate
                    </th>
                    <th className="py-stack-sm px-stack-lg text-xs uppercase tracking-wide text-on-surface-variant font-label-md">
                      Applied
                    </th>
                    <th className="py-stack-sm px-stack-lg text-xs uppercase tracking-wide text-on-surface-variant font-label-md text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const expanded = expandedId === a.id
                    return (
                      <Fragment key={a.id}>
                        <tr className="border-b border-outline-variant/30 hover:bg-surface-container-low/30">
                          <td className="py-stack-md px-stack-lg">
                            <button
                              type="button"
                              onClick={() => setExpandedId(expanded ? null : a.id)}
                              className="text-on-surface-variant hover:text-primary p-1"
                              aria-label={expanded ? 'Collapse' : 'Expand profile'}
                            >
                              <MaterialIcon
                                name={expanded ? 'expand_less' : 'expand_more'}
                                className="text-xl"
                              />
                            </button>
                          </td>
                          <td className="py-stack-md px-stack-lg">
                            <div className="font-bold text-on-surface">{a.username}</div>
                            <div className="text-xs text-on-surface-variant font-mono mt-0.5">{a.email}</div>
                          </td>
                          <td className="py-stack-md px-stack-lg">
                            <VerificationStatusPill status={a.verificationStatus} />
                          </td>
                          <td className="py-stack-md px-stack-lg">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {a.tags.length > 0 ? (
                                a.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] uppercase bg-surface-container px-2 py-0.5 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-on-surface-variant">—</span>
                              )}
                            </div>
                          </td>
                          <td className="py-stack-md px-stack-lg text-sm whitespace-nowrap">
                            {a.coinRatePerSession} coins
                          </td>
                          <td className="py-stack-md px-stack-lg text-sm text-on-surface-variant whitespace-nowrap">
                            {new Date(a.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-stack-md px-stack-lg">
                            {a.verificationStatus === 'pending_review' ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOverride(a.id, 'verified')}
                                  className={`${btnSuccess} text-xs px-3 py-2 inline-flex items-center gap-1`}
                                >
                                  <MaterialIcon name="verified" className="text-sm" />
                                  Verify
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOverride(a.id, 'rejected')}
                                  className={`${btnDanger} text-xs px-3 py-2 inline-flex items-center gap-1`}
                                >
                                  <MaterialIcon name="cancel" className="text-sm" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div className="text-right text-xs text-on-surface-variant">View only</div>
                            )}
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-surface-container-low/30 border-b border-outline-variant/30">
                            <td colSpan={7} className="px-stack-lg py-stack-md">
                              <div className="grid md:grid-cols-2 gap-stack-md text-sm">
                                <div>
                                  <p className="font-label-md text-xs uppercase tracking-wide text-on-surface-variant mb-2">
                                    Profile & credentials
                                  </p>
                                  <pre className="whitespace-pre-wrap font-body-md text-on-surface-variant bg-surface-container-lowest rounded-lg border border-outline-variant/40 p-stack-sm text-xs leading-relaxed max-h-48 overflow-y-auto">
                                    {a.bio || 'No bio provided.'}
                                  </pre>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">User ID</p>
                                    <p className="font-mono text-xs break-all">{a.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">
                                      Session rate
                                    </p>
                                    <p>{a.coinRatePerSession} coins per consultation</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">
                                      Specialties ({a.tags.length})
                                    </p>
                                    <p>{a.tags.join(', ') || 'None listed'}</p>
                                  </div>
                                  {a.verificationStatus === 'verified' && (
                                    <div className="flex items-center gap-2 text-secondary text-sm">
                                      <MaterialIcon name="check_circle" className="text-base" />
                                      Cleared for patient consultations on Discover
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>
      </main>
    </AppShell>
  )
}
