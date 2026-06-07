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
import { AdminPlatformStats } from '../../components/admin/AdminPlatformStats'
import { ConfirmDialog } from '../../components/layout/ConfirmDialog'
import { AdvisorApplicationDetails } from '../../components/admin/AdvisorApplicationDetails'
import { verificationService } from '../../api/verification.service'
import { getApiErrorMessage } from '../../utils/apiError'
import { credentialPreview } from '../../utils/advisorApplicationBio'
import { getProfessionLabel, PROFESSION_TYPES } from '@shared/advisor/credentialOptions'
import type { ApplicantDto, VerificationStatus } from '@shared/contracts/verification.api'

type StatusFilter = 'all' | VerificationStatus
type ProfessionFilter = 'all' | string

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
  const [professionFilter, setProfessionFilter] = useState<ProfessionFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmOverride, setConfirmOverride] = useState<{
    id: string
    username: string
    status: VerificationStatus
  } | null>(null)

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
    let list = advisors
    if (filter !== 'all') {
      list = list.filter((a) => a.verificationStatus === filter)
    }
    if (professionFilter !== 'all') {
      list = list.filter((a) => a.credentials?.professionType === professionFilter)
    }
    return list
  }, [advisors, filter, professionFilter])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: advisors.length }
    for (const a of advisors) {
      c[a.verificationStatus] = (c[a.verificationStatus] ?? 0) + 1
    }
    return c
  }, [advisors])

  const handleOverride = async (advisorId: string, status: VerificationStatus) => {
    setOverrideError('')
    setConfirmOverride(null)
    try {
      await verificationService.overrideStatus(advisorId, { status })
      await loadAdvisors()
    } catch (err) {
      setOverrideError(getApiErrorMessage(err, 'Failed to update verification status.'))
    }
  }

  return (
    <AppShell activeNav="admin-advisors" showSearch={false}>
      <ConfirmDialog
        open={Boolean(confirmOverride)}
        title={confirmOverride?.status === 'verified' ? 'Verify this advisor?' : 'Reject this advisor?'}
        message={
          confirmOverride
            ? `This will set ${confirmOverride.username} to "${confirmOverride.status.replace('_', ' ')}". This action affects Discover visibility.`
            : ''
        }
        confirmLabel={confirmOverride?.status === 'verified' ? 'Verify' : 'Reject'}
        variant={confirmOverride?.status === 'verified' ? 'primary' : 'danger'}
        icon={confirmOverride?.status === 'verified' ? 'verified' : 'cancel'}
        onConfirm={() => {
          if (confirmOverride) void handleOverride(confirmOverride.id, confirmOverride.status)
        }}
        onCancel={() => setConfirmOverride(null)}
      />
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Advisor doctors"
          description="Read-only registry of all advisor applications and verified providers. Override status when needed."
        />

        <AdminSubNav />

        <AdminPlatformStats />

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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-on-surface-variant font-label-md">Profession:</span>
          <select
            value={professionFilter}
            onChange={(e) => setProfessionFilter(e.target.value)}
            className="text-xs border border-outline-variant rounded-lg px-3 py-1.5 bg-surface-container-lowest"
          >
            <option value="all">All professions</option>
            {PROFESSION_TYPES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
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
            <>
            <div className="md:hidden divide-y divide-outline-variant/40">
              {filtered.map((a) => (
                <div key={a.id} className="p-stack-lg flex flex-col gap-stack-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-on-surface">{a.username}</p>
                      <p className="text-xs text-on-surface-variant">{a.email}</p>
                    </div>
                    <VerificationStatusPill status={a.verificationStatus} />
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    {credentialPreview(a.bio, a.credentials) || '—'}
                  </p>
                  <p className="text-sm">{a.coinRatePerSession} coins / session</p>
                  {a.verificationStatus === 'pending_review' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmOverride({ id: a.id, username: a.username, status: 'verified' })}
                        className={`${btnSuccess} text-xs px-3 py-2 flex-1`}
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmOverride({ id: a.id, username: a.username, status: 'rejected' })}
                        className={`${btnDanger} text-xs px-3 py-2 flex-1`}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
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
                      Credentials
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
                          <td className="py-stack-md px-stack-lg max-w-[220px]">
                            <p className="text-xs text-on-surface-variant line-clamp-2" title={credentialPreview(a.bio, a.credentials)}>
                              {credentialPreview(a.bio, a.credentials) || '—'}
                            </p>
                            {a.credentials?.professionType && (
                              <p className="text-[10px] text-outline mt-1">
                                {getProfessionLabel(a.credentials.professionType)}
                              </p>
                            )}
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
                                  onClick={() =>
                                    setConfirmOverride({ id: a.id, username: a.username, status: 'verified' })
                                  }
                                  className={`${btnSuccess} text-xs px-3 py-2 inline-flex items-center gap-1`}
                                >
                                  <MaterialIcon name="verified" className="text-sm" />
                                  Verify
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmOverride({ id: a.id, username: a.username, status: 'rejected' })
                                  }
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
                                    Application from registration
                                  </p>
                                  <AdvisorApplicationDetails bio={a.bio} credentials={a.credentials} />
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
                                    <div className="flex flex-wrap gap-1">
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
                                        <span className="text-sm">None listed</span>
                                      )}
                                    </div>
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
            </>
          )}
        </DashboardSection>
      </main>
    </AppShell>
  )
}
