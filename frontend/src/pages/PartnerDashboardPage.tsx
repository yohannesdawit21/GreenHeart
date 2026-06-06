import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import type { ApplicantDto } from '@shared/contracts/verification.api'
import type {
  VerificationInterviewAcceptedPayload,
  VerificationInterviewDeclinedPayload,
} from '@shared/contracts/socket.events'

interface PendingInterview {
  interviewId: string
  applicantId: string
  applicantUsername: string
  applicantOnline: boolean
  accepted: boolean
  declined: boolean
}

export function PartnerDashboardPage() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [applicants, setApplicants] = useState<ApplicantDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [rowErrorId, setRowErrorId] = useState('')
  const [startingId, setStartingId] = useState('')
  const [pendingInterview, setPendingInterview] = useState<PendingInterview | null>(null)
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
  }, [])

  useEffect(() => {
    if (!socket || user?.role !== 'partner_doctor') return

    const onAccepted = (payload: VerificationInterviewAcceptedPayload) => {
      setPendingInterview((prev) =>
        prev?.interviewId === payload.interviewId ? { ...prev, accepted: true } : prev,
      )
    }

    const onDeclined = (payload: VerificationInterviewDeclinedPayload) => {
      setPendingInterview((prev) =>
        prev?.interviewId === payload.interviewId ? { ...prev, declined: true } : prev,
      )
    }

    socket.on('verification_interview_accepted', onAccepted)
    socket.on('verification_interview_declined', onDeclined)
    return () => {
      socket.off('verification_interview_accepted', onAccepted)
      socket.off('verification_interview_declined', onDeclined)
    }
  }, [socket, user?.role])

  const handleStartInterview = async (applicant: ApplicantDto) => {
    setActionError('')
    setRowErrorId('')
    setStartingId(applicant.id)
    try {
      const data = await verificationService.startInterview({ applicantId: applicant.id })
      setPendingInterview({
        interviewId: data.interviewId,
        applicantId: applicant.id,
        applicantUsername: data.applicantUsername,
        applicantOnline: data.applicantOnline,
        accepted: false,
        declined: false,
      })
    } catch (err) {
      setRowErrorId(applicant.id)
      setActionError(getApiErrorMessage(err, 'Could not start interview. Please try again.'))
    } finally {
      setStartingId('')
    }
  }

  const handleEnterRoom = () => {
    if (!pendingInterview) return
    navigate(`/verification/${pendingInterview.interviewId}`)
  }

  const handleDismissPending = () => {
    setPendingInterview(null)
    loadApplicants()
  }

  const renderOnlineBadge = (applicant: ApplicantDto) => {
    if (!applicant.isOnline) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-outline-variant" />
          Offline
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-secondary font-medium">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        On Advisor Hub
      </span>
    )
  }

  return (
    <AppShell activeNav="partner" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Partner portal"
          description="Review advisor applications and run verification video interviews."
          badge={
            <span className="inline-flex items-center gap-2 bg-secondary-container/25 border border-secondary/30 text-secondary px-3 py-1.5 rounded-lg font-label-md text-xs">
              <MaterialIcon name="verified_user" className="text-sm" />
              Authorized medical partner
            </span>
          }
        />

        <DashboardAlert variant="info" icon="info">
          Start an interview to send a verification request. The applicant must accept before joining the video room.
          Online applicants show a green status on the queue.
        </DashboardAlert>

        {pendingInterview && (
          <DashboardAlert
            variant={pendingInterview.declined ? 'error' : pendingInterview.accepted ? 'success' : 'warning'}
            icon={
              pendingInterview.declined
                ? 'cancel'
                : pendingInterview.accepted
                  ? 'check_circle'
                  : pendingInterview.applicantOnline
                    ? 'person'
                    : 'hourglass_top'
            }
            title={
              pendingInterview.declined
                ? `${pendingInterview.applicantUsername} declined`
                : pendingInterview.accepted
                  ? `${pendingInterview.applicantUsername} accepted`
                  : `Interview started — ${pendingInterview.applicantUsername}`
            }
          >
            <div className="flex flex-col gap-stack-md mt-2">
              {pendingInterview.declined ? (
                <p>The applicant declined this verification request. You can start a new interview when they are ready.</p>
              ) : pendingInterview.accepted ? (
                <p>The doctor accepted and is joining the verification room. Enter the room to begin the interview.</p>
              ) : pendingInterview.applicantOnline ? (
                <p>
                  <strong>{pendingInterview.applicantUsername} is on Advisor Hub</strong> — invitation sent. Waiting
                  for them to accept.
                </p>
              ) : (
                <p>
                  <strong>{pendingInterview.applicantUsername} is not online</strong> — invitation queued. They will
                  see the accept prompt when they sign in to Advisor Hub.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {!pendingInterview.declined && (
                  <button type="button" onClick={handleEnterRoom} className={`${btnPrimary} text-sm px-4 py-2.5`}>
                    <MaterialIcon name="videocam" className="text-sm inline mr-1" />
                    Enter verification room
                  </button>
                )}
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
              description="When doctors apply at /auth/advisor-apply, they will appear here for review."
            />
          ) : (
            <>
              <div className="md:hidden divide-y divide-outline-variant/40">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="p-stack-lg flex flex-col gap-stack-md">
                    <div>
                      <p className="font-bold text-on-background">{applicant.username}</p>
                      <p className="text-sm text-on-surface-variant">{applicant.email}</p>
                      <div className="mt-1">{renderOnlineBadge(applicant)}</div>
                    </div>
                    <p className="text-sm text-on-surface-variant italic line-clamp-3">"{applicant.bio}"</p>
                    {applicant.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {applicant.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-surface-container px-2 py-0.5 rounded uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={startingId === applicant.id}
                      onClick={() => handleStartInterview(applicant)}
                      className={`${btnPrimary} text-sm py-3 px-4 w-full flex items-center justify-center gap-2`}
                    >
                      <MaterialIcon name="videocam" className="text-sm" />
                      {startingId === applicant.id ? 'Starting…' : 'Start interview'}
                    </button>
                    {rowErrorId === applicant.id && actionError && (
                      <p className="text-error text-sm">{actionError}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/50">
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Applicant</th>
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Bio</th>
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-surface border-b border-outline-variant/30">
                        <td className="py-stack-md px-stack-lg align-top">
                          <div className="font-bold">{applicant.username}</div>
                          <div className="text-on-surface-variant text-sm">{applicant.email}</div>
                          <div className="mt-2">{renderOnlineBadge(applicant)}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {applicant.tags.map((tag) => (
                              <span key={tag} className="text-[10px] bg-surface-container px-2 py-0.5 rounded uppercase">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-stack-md px-stack-lg align-top max-w-md">
                          <p className="line-clamp-3 text-sm italic text-on-surface-variant">"{applicant.bio}"</p>
                        </td>
                        <td className="py-stack-md px-stack-lg text-right align-middle">
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              disabled={startingId === applicant.id}
                              onClick={() => handleStartInterview(applicant)}
                              className={`${btnPrimary} text-xs py-2.5 px-4 inline-flex items-center gap-2`}
                            >
                              <MaterialIcon name="videocam" className="text-sm" />
                              {startingId === applicant.id ? 'Starting…' : 'Start interview'}
                            </button>
                            {rowErrorId === applicant.id && actionError && (
                              <p className="text-error text-xs max-w-xs text-right">{actionError}</p>
                            )}
                          </div>
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
