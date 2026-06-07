import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardAlert,
  DashboardSection,
  LoadingSpinner,
} from '../../components/layout/dashboard-ui'
import { StickyActionBar } from '../../components/layout/StickyActionBar'
import { btnOutline, btnPrimary } from '../../components/layout/buttonStyles'
import { MaterialIcon } from '../../components/MaterialIcon'
import { AdvisorApplicationDetails } from '../../components/admin/AdvisorApplicationDetails'
import { verificationService } from '../../api/verification.service'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getApiErrorMessage } from '../../utils/apiError'
import { credentialPreview } from '../../utils/advisorApplicationBio'
import {
  getPendingPartnerInterview,
  patchPendingPartnerInterview,
  setPendingPartnerInterview,
  type PendingPartnerInterview,
} from '../../utils/partnerInterviewStorage'
import { getProfessionLabel } from '@shared/advisor/credentialOptions'
import type { ApplicantDto } from '@shared/contracts/verification.api'
import type {
  VerificationInterviewAcceptedPayload,
  VerificationInterviewDeclinedPayload,
} from '@shared/contracts/socket.events'

function AvailabilityBadge({ isOnline }: { isOnline?: boolean }) {
  if (!isOnline) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-outline-variant" />
        Closed for interview
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-secondary font-medium bg-secondary-container/25 border border-secondary/30 px-3 py-1 rounded-full">
      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
      Open for interview
    </span>
  )
}

export function PartnerApplicantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()

  const [applicant, setApplicant] = useState<ApplicantDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [starting, setStarting] = useState(false)
  const [pendingInterview, setPendingInterviewState] = useState<PendingPartnerInterview | null>(() =>
    getPendingPartnerInterview(),
  )

  const setPendingInterview = (data: PendingPartnerInterview | null) => {
    setPendingPartnerInterview(data)
    setPendingInterviewState(data)
  }

  const loadApplicant = () => {
    if (!id) return
    verificationService
      .getApplicant(id)
      .then((data) => {
        setApplicant(data.applicant)
        setLoadError('')
      })
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Applicant not found or no longer pending.')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadApplicant()
    const refresh = setInterval(loadApplicant, 8000)
    return () => clearInterval(refresh)
  }, [id])

  useEffect(() => {
    if (!socket || user?.role !== 'partner_doctor') return

    const onAccepted = (_payload: VerificationInterviewAcceptedPayload) => {
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

  const handleStartInterview = async () => {
    if (!applicant) return
    setActionError('')
    setStarting(true)
    try {
      const data = await verificationService.startInterview({ applicantId: applicant.id })
      const pending: PendingPartnerInterview = {
        interviewId: data.interviewId,
        applicantId: applicant.id,
        applicantUsername: data.applicantUsername,
        applicantOnline: data.applicantOnline,
        accepted: false,
        declined: false,
      }
      setPendingInterview(pending)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not start interview. Please try again.'))
    } finally {
      setStarting(false)
    }
  }

  const handleEnterRoom = () => {
    if (!pendingInterview?.accepted) return
    navigate(`/verification/${pendingInterview.interviewId}`)
  }

  if (loading) {
    return (
      <AppShell activeNav="partner" showSearch={false}>
        <LoadingSpinner label="Loading application…" />
      </AppShell>
    )
  }

  if (!applicant || loadError) {
    return (
      <AppShell activeNav="partner" showSearch={false}>
        <main className={`${appShellMainClass} max-w-2xl`}>
          <DashboardAlert variant="error" icon="error">
            {loadError || 'Applicant not found'}
          </DashboardAlert>
          <Link to="/partner" className={`${btnOutline} inline-flex items-center gap-2 mt-stack-lg text-sm px-4 py-2.5`}>
            <MaterialIcon name="arrow_back" className="text-sm" />
            Back to queue
          </Link>
        </main>
      </AppShell>
    )
  }

  const summary = credentialPreview(applicant.bio, applicant.credentials)
  const professionLabel = applicant.credentials?.professionType
    ? getProfessionLabel(applicant.credentials.professionType)
    : undefined
  const interviewActive = Boolean(pendingInterview && !pendingInterview.declined)

  return (
    <AppShell activeNav="partner" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg pb-32 md:pb-stack-lg`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-stack-md">
          <div className="flex flex-col gap-stack-sm min-w-0">
            <Link
              to="/partner"
              className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary w-fit"
            >
              <MaterialIcon name="arrow_back" className="text-base" />
              Applicant queue
            </Link>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-background">{applicant.username}</h1>
              <p className="text-on-surface-variant mt-1">{applicant.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <AvailabilityBadge isOnline={applicant.isOnline} />
              {professionLabel && (
                <span className="text-xs bg-surface-container text-on-surface-variant px-3 py-1 rounded-full">
                  {professionLabel}
                </span>
              )}
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
            <p className="text-sm text-on-surface-variant">
              Applied{' '}
              {new Date(applicant.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm font-label-md text-on-surface">{applicant.coinRatePerSession} coins / session</p>
          </div>
        </div>

        {summary && (
          <p className="text-on-surface-variant text-sm md:text-base leading-relaxed border-l-4 border-secondary/40 pl-stack-md">
            {summary}
          </p>
        )}

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
                <p>They declined this verification request. You can try again when they reopen for interview.</p>
              ) : pendingInterview.accepted ? (
                <p>They accepted — enter the verification room to begin the credential interview.</p>
              ) : (
                <p>Invitation sent. The applicant must accept before you join the video room.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {!pendingInterview.declined && pendingInterview.accepted && (
                  <button type="button" onClick={handleEnterRoom} className={`${btnPrimary} text-sm px-4 py-2.5`}>
                    <MaterialIcon name="videocam" className="text-sm inline mr-1" />
                    Enter verification room
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPendingInterview(null)}
                  className={`${btnOutline} text-sm px-4 py-2.5`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </DashboardAlert>
        )}

        <div className="grid lg:grid-cols-3 gap-stack-lg">
          <div className="lg:col-span-2 flex flex-col gap-stack-lg">
            <DashboardSection title="Application & credentials">
              <AdvisorApplicationDetails bio={applicant.bio} credentials={applicant.credentials} />
            </DashboardSection>
          </div>

          <aside className="flex flex-col gap-stack-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg space-y-stack-md">
              <h2 className="font-label-md text-sm uppercase tracking-wide text-on-surface-variant">Session details</h2>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Proposed rate</p>
                <p className="font-stat-md text-on-surface">{applicant.coinRatePerSession} coins</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Applied on</p>
                <p className="text-sm text-on-surface">
                  {new Date(applicant.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-2">Focus areas ({applicant.tags.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {applicant.tags.length > 0 ? (
                    applicant.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wide bg-surface-container px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-on-surface-variant">None listed</span>
                  )}
                </div>
              </div>
            </div>

            <DashboardAlert variant="info" icon="checklist">
              <strong>Before you start:</strong> confirm license details, years of experience, languages, and focus
              areas match what the applicant submitted.
            </DashboardAlert>

            <div className="hidden md:flex flex-col gap-2">
              <button
                type="button"
                disabled={starting || !applicant.isOnline || interviewActive}
                onClick={handleStartInterview}
                className={`${btnPrimary} w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40`}
              >
                <MaterialIcon name="videocam" />
                {starting ? 'Starting…' : 'Start verification interview'}
              </button>
              {!applicant.isOnline && (
                <p className="text-xs text-on-surface-variant text-center">
                  Applicant must toggle open for interview first.
                </p>
              )}
              {actionError && <p className="text-error text-sm text-center">{actionError}</p>}
            </div>
          </aside>
        </div>
      </main>

      <StickyActionBar>
        {!applicant.isOnline && (
          <p className="text-xs text-center text-on-surface-variant">Applicant must open for interview on Advisor Hub.</p>
        )}
        {actionError && <p className="text-error text-xs text-center">{actionError}</p>}
        <button
          type="button"
          disabled={starting || !applicant.isOnline || interviewActive}
          onClick={handleStartInterview}
          className={`${btnPrimary} w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-40`}
        >
          <MaterialIcon name="videocam" />
          {starting ? 'Starting…' : 'Start verification interview'}
        </button>
      </StickyActionBar>
    </AppShell>
  )
}
