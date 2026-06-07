import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardAlert,
  DashboardSection,
  EmptyState,
  LoadingSpinner,
} from '../components/layout/dashboard-ui'
import { btnOutline, btnPrimary } from '../components/layout/buttonStyles'
import { MaterialIcon } from '../components/MaterialIcon'
import { verificationService } from '../api/verification.service'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { getApiErrorMessage } from '../utils/apiError'
import {
  getPendingPartnerInterview,
  patchPendingPartnerInterview,
  setPendingPartnerInterview,
  type PendingPartnerInterview,
} from '../utils/partnerInterviewStorage'
import type { ApplicantDto } from '@shared/contracts/verification.api'
import type {
  VerificationInterviewAcceptedPayload,
  VerificationInterviewDeclinedPayload,
} from '@shared/contracts/socket.events'
import { credentialPreview } from '../utils/advisorApplicationBio'
import { getProfessionLabel } from '@shared/advisor/credentialOptions'

export function PartnerDashboardPage() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [applicants, setApplicants] = useState<ApplicantDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pendingInterview, setPendingInterviewState] = useState<PendingPartnerInterview | null>(() =>
    getPendingPartnerInterview(),
  )
  const navigate = useNavigate()

  const loadApplicants = () => {
    verificationService
      .getApplicants()
      .then((data) => setApplicants(data.applicants))
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Failed to load applicants. Please try again.')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadApplicants()
    const refresh = setInterval(loadApplicants, 5000)
    return () => clearInterval(refresh)
  }, [])

  useEffect(() => {
    if (!socket || user?.role !== 'partner_doctor') return

    const onAccepted = (payload: VerificationInterviewAcceptedPayload) => {
      const current = getPendingPartnerInterview()
      if (current?.interviewId !== payload.interviewId) return
      const next = patchPendingPartnerInterview({ accepted: true })
      if (next) setPendingInterviewState(next)
    }

    const onDeclined = (payload: VerificationInterviewDeclinedPayload) => {
      const current = getPendingPartnerInterview()
      if (current?.interviewId !== payload.interviewId) return
      const next = patchPendingPartnerInterview({ declined: true })
      if (next) setPendingInterviewState(next)
    }

    socket.on('verification_interview_accepted', onAccepted)
    socket.on('verification_interview_declined', onDeclined)
    return () => {
      socket.off('verification_interview_accepted', onAccepted)
      socket.off('verification_interview_declined', onDeclined)
    }
  }, [socket, user?.role])

  const handleEnterRoom = () => {
    if (!pendingInterview?.accepted) return
    navigate(`/verification/${pendingInterview.interviewId}`)
  }

  const handleDismissPending = () => {
    setPendingPartnerInterview(null)
    setPendingInterviewState(null)
    loadApplicants()
  }

  const renderAvailabilityBadge = (applicant: ApplicantDto) => {
    if (!applicant.isOnline) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-outline-variant" />
          Closed for interview
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-secondary font-medium">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        Open for interview
      </span>
    )
  }

  return (
    <AppShell activeNav="partner" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Partner portal"
          description="Review advisor applications in full, then run verification video interviews."
          badge={
            <span className="inline-flex items-center gap-2 bg-secondary-container/25 border border-secondary/30 text-secondary px-3 py-1.5 rounded-lg font-label-md text-xs">
              <MaterialIcon name="verified_user" className="text-sm" />
              Authorized medical partner
            </span>
          }
        />

        <DashboardAlert variant="info" icon="info">
          Open each application to review credentials and session details before starting an interview. Applicants must
          toggle <strong>Open for interview</strong> on Advisor Hub first.
        </DashboardAlert>

        {pendingInterview && (
          <DashboardAlert
            variant={pendingInterview.declined ? 'error' : pendingInterview.accepted ? 'success' : 'warning'}
            icon={
              pendingInterview.declined
                ? 'cancel'
                : pendingInterview.accepted
                  ? 'check_circle'
                  : 'hourglass_top'
            }
            title={
              pendingInterview.declined
                ? `${pendingInterview.applicantUsername} declined`
                : pendingInterview.accepted
                  ? `${pendingInterview.applicantUsername} accepted`
                  : `Waiting for ${pendingInterview.applicantUsername}`
            }
          >
            <div className="flex flex-col gap-stack-md mt-2">
              {pendingInterview.declined ? (
                <p>The applicant declined this verification request. You can start a new interview when they are ready.</p>
              ) : pendingInterview.accepted ? (
                <p>The doctor accepted — enter the verification room to begin the credential interview.</p>
              ) : (
                <p>Invitation sent. Waiting for the applicant to accept on Advisor Hub.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {!pendingInterview.declined && pendingInterview.accepted && (
                  <button type="button" onClick={handleEnterRoom} className={`${btnPrimary} text-sm px-4 py-2.5`}>
                    <MaterialIcon name="videocam" className="text-sm inline mr-1" />
                    Enter verification room
                  </button>
                )}
                <Link
                  to={`/partner/applicants/${pendingInterview.applicantId}`}
                  className={`${btnOutline} text-sm px-4 py-2.5 inline-flex items-center gap-1`}
                >
                  <MaterialIcon name="description" className="text-sm" />
                  View application
                </Link>
                <button type="button" onClick={handleDismissPending} className={`${btnOutline} text-sm px-4 py-2.5`}>
                  Dismiss
                </button>
              </div>
            </div>
          </DashboardAlert>
        )}

        {loadError && (
          <DashboardAlert variant="error" icon="error">
            {loadError}
            <button type="button" onClick={loadApplicants} className={`${btnOutline} mt-2 text-sm px-4 py-2`}>
              Try again
            </button>
          </DashboardAlert>
        )}

        <DashboardSection
          title="Applicant queue"
          badge={
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-xs">
              {applicants.length} pending
            </span>
          }
        >
          {loading ? (
            <LoadingSpinner label="Loading applicants…" />
          ) : applicants.length === 0 ? (
            <EmptyState
              icon="person_add"
              title="Queue is empty"
              description="New advisor applications will appear here when doctors complete the apply flow."
            />
          ) : (
            <>
              <div className="md:hidden divide-y divide-outline-variant/40">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="p-stack-lg flex flex-col gap-stack-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-on-background truncate">{applicant.username}</p>
                        <p className="text-sm text-on-surface-variant truncate">{applicant.email}</p>
                        <div className="mt-2">{renderAvailabilityBadge(applicant)}</div>
                      </div>
                      <span className="text-xs text-on-surface-variant shrink-0">
                        {applicant.coinRatePerSession} coins
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant line-clamp-2">
                      {credentialPreview(applicant.bio, applicant.credentials) || 'No credentials listed'}
                    </p>
                    {applicant.credentials?.professionType && (
                      <p className="text-xs text-outline">
                        {getProfessionLabel(applicant.credentials.professionType)}
                      </p>
                    )}
                    {applicant.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {applicant.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="text-[10px] bg-surface-container px-2 py-0.5 rounded uppercase">
                            {tag}
                          </span>
                        ))}
                        {applicant.tags.length > 4 && (
                          <span className="text-[10px] text-on-surface-variant">+{applicant.tags.length - 4}</span>
                        )}
                      </div>
                    )}
                    <Link
                      to={`/partner/applicants/${applicant.id}`}
                      className={`${btnPrimary} text-sm py-3 px-4 w-full flex items-center justify-center gap-2`}
                    >
                      <MaterialIcon name="description" className="text-sm" />
                      Review application
                    </Link>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/50">
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Applicant</th>
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Summary</th>
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Rate</th>
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-surface border-b border-outline-variant/30">
                        <td className="py-stack-md px-stack-lg align-top">
                          <div className="font-bold">{applicant.username}</div>
                          <div className="text-on-surface-variant text-sm">{applicant.email}</div>
                          <div className="mt-2">{renderAvailabilityBadge(applicant)}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {applicant.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] bg-surface-container px-2 py-0.5 rounded uppercase">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-stack-md px-stack-lg align-top max-w-md">
                          <p className="text-sm text-on-surface-variant line-clamp-2">
                            {credentialPreview(applicant.bio, applicant.credentials) || 'No credentials listed'}
                          </p>
                          {applicant.credentials?.professionType && (
                            <p className="text-[10px] text-outline mt-1">
                              {getProfessionLabel(applicant.credentials.professionType)}
                            </p>
                          )}
                        </td>
                        <td className="py-stack-md px-stack-lg align-top text-sm whitespace-nowrap">
                          {applicant.coinRatePerSession} coins
                        </td>
                        <td className="py-stack-md px-stack-lg text-right align-middle">
                          <Link
                            to={`/partner/applicants/${applicant.id}`}
                            className={`${btnPrimary} text-xs py-2.5 px-4 inline-flex items-center gap-2`}
                          >
                            <MaterialIcon name="description" className="text-sm" />
                            Review application
                          </Link>
                        </td>
                      </tr>
                    ))}
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
