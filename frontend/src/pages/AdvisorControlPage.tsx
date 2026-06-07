import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardAlert,
  DashboardSection,
  StatCard,
  LoadingSpinner,
  EmptyState,
} from '../components/layout/dashboard-ui'
import { btnGhost, btnPrimary, btnToggle } from '../components/layout/buttonStyles'
import { MaterialIcon } from '../components/MaterialIcon'
import {
  VerificationInvitationModal,
  type VerificationInvitation,
} from '../components/verification/VerificationInvitationModal'
import { sessionService } from '../api/session.service'
import { walletService } from '../api/wallet.service'
import { verificationService } from '../api/verification.service'
import { useAuth } from '../context/AuthContext'
import { useWalletBalance } from '../hooks/useWalletBalance'
import { useSocket } from '../context/SocketContext'
import { getApiErrorCode, getApiErrorMessage } from '../utils/apiError'
import {
  markIncomingCallPermissionRequested,
  requestAdvisorNotificationPermission,
  shouldRequestIncomingCallPermission,
} from '../utils/notifications'

const INTENDED_ONLINE_KEY = 'gh_advisor_intended_online'
import type { TransactionDto } from '@shared/contracts/wallet.api'
import type { VerificationInterviewStartedPayload } from '@shared/contracts/socket.events'

export function AdvisorControlPage() {
  const { user } = useAuth()
  const { connected, socket } = useSocket()
  const navigate = useNavigate()
  const location = useLocation()
  const [online, setOnline] = useState(false)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const { balance, loading: walletLoading, error: walletLoadError, refresh: refreshWallet } = useWalletBalance(true)
  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawMessage, setWithdrawMessage] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [presenceError, setPresenceError] = useState('')
  const [pendingInvitation, setPendingInvitation] = useState<VerificationInvitation | null>(null)
  const [dismissedInterviewId, setDismissedInterviewId] = useState<string | null>(null)
  const [restoringPresence, setRestoringPresence] = useState(false)

  const verificationStatus = user?.profile?.verificationStatus
  const awaitingVerification =
    verificationStatus !== 'verified' && verificationStatus !== 'rejected'

  const showInvitation = useCallback(
    (invitation: VerificationInvitation, options?: { force?: boolean }) => {
      if (!options?.force && dismissedInterviewId === invitation.interviewId) return
      setPendingInvitation(invitation)
    },
    [dismissedInterviewId],
  )

  useEffect(() => {
    const state = location.state as { verificationInvitation?: VerificationInvitation } | null
    if (state?.verificationInvitation) {
      showInvitation(state.verificationInvitation)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate, showInvitation])

  useEffect(() => {
    walletService
      .getTransactions()
      .then((tx) => setTransactions(tx.transactions))
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Could not load earnings history.')))
      .finally(() => setTransactionsLoading(false))
  }, [])

  useEffect(() => {
    if (walletLoadError) {
      setLoadError((prev) => prev || walletLoadError)
    }
  }, [walletLoadError])

  const loading = walletLoading || transactionsLoading
  const completedSessions = transactions.filter((tx) => tx.type === 'escrow_release' && tx.amountCoins > 0).length
  const totalEarnings = balance?.withdrawableBalance ?? 0

  const refreshTransactions = () => {
    return walletService
      .getTransactions()
      .then((tx) => setTransactions(tx.transactions))
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Could not load earnings history.')))
  }

  const handleWithdraw = async (amount: number) => {
    setWithdrawing(true)
    setWithdrawError('')
    setWithdrawMessage('')
    try {
      const result = await walletService.withdraw({ amountCoins: amount })
      setWithdrawMessage(`Demo payout of ${amount} coins processed. Reference: ${result.transaction.id.slice(0, 8)}…`)
      setWithdrawAmount('')
      await Promise.all([refreshWallet(), refreshTransactions()])
    } catch (err) {
      const code = getApiErrorCode(err)
      if (code === 'INSUFFICIENT_FUNDS') {
        setWithdrawError('Not enough withdrawable balance for that amount.')
      } else {
        setWithdrawError(getApiErrorMessage(err, 'Withdrawal failed.'))
      }
    } finally {
      setWithdrawing(false)
    }
  }

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseInt(withdrawAmount, 10)
    if (!Number.isInteger(amount) || amount <= 0) {
      setWithdrawError('Enter a whole number of coins to withdraw.')
      return
    }
    void handleWithdraw(amount)
  }

  useEffect(() => {
    if (verificationStatus === 'verified' && user?.id) {
      const sessionIntended = sessionStorage.getItem(INTENDED_ONLINE_KEY) === '1'
      sessionService
        .getMyPresence()
        .then((data) => {
          setOnline(data.online || data.intendedOnline || sessionIntended)
        })
        .catch(() => setOnline(sessionIntended))
    } else if (verificationStatus === 'pending_review') {
      verificationService
        .getInterviewAvailability()
        .then((data) => setInterviewOpen(data.available))
        .catch(() => setInterviewOpen(false))
    }
  }, [verificationStatus, user?.id])

  useEffect(() => {
    if (verificationStatus !== 'verified' || !user?.id || !connected) return

    const restoreIfNeeded = async () => {
      const sessionIntended = sessionStorage.getItem(INTENDED_ONLINE_KEY) === '1'
      try {
        const presence = await sessionService.getMyPresence()
        const shouldBeOnline = presence.intendedOnline || sessionIntended
        if (!shouldBeOnline || presence.online) {
          setOnline(presence.online || shouldBeOnline)
          return
        }
        setRestoringPresence(true)
        await sessionService.updatePresence({ online: true })
        setOnline(true)
      } catch (err) {
        if (sessionIntended) {
          setPresenceError(getApiErrorMessage(err, 'Could not restore online status after reconnect.'))
        }
      } finally {
        setRestoringPresence(false)
      }
    }

    void restoreIfNeeded()
  }, [verificationStatus, user?.id, connected])

  useEffect(() => {
    if (!awaitingVerification) return

    const checkPendingInterview = async () => {
      try {
        const data = await verificationService.getMyInterview()
        if (data.interviewId) {
          showInvitation({
            interviewId: data.interviewId,
            partnerName: data.partnerName ?? 'Partner Doctor',
          })
        }
      } catch {
        /* polling fallback — ignore transient errors */
      }
    }

    void checkPendingInterview()
    const poll = setInterval(checkPendingInterview, 8000)
    return () => clearInterval(poll)
  }, [awaitingVerification, showInvitation])

  useEffect(() => {
    if (!socket || !awaitingVerification) return

    const onInterviewStarted = (payload: VerificationInterviewStartedPayload) => {
      setDismissedInterviewId(null)
      showInvitation(
        {
          interviewId: payload.interviewId,
          partnerName: payload.partnerName,
        },
        { force: true },
      )
    }

    socket.on('verification_interview_started', onInterviewStarted)
    return () => {
      socket.off('verification_interview_started', onInterviewStarted)
    }
  }, [socket, awaitingVerification, showInvitation])

  const handlePresenceToggle = async () => {
    if (verificationStatus !== 'verified') return
    setPresenceError('')
    const newStatus = !online
    try {
      if (newStatus && shouldRequestIncomingCallPermission()) {
        await requestAdvisorNotificationPermission()
        markIncomingCallPermissionRequested()
      }
      await sessionService.updatePresence({ online: newStatus })
      setOnline(newStatus)
      if (newStatus) {
        sessionStorage.setItem(INTENDED_ONLINE_KEY, '1')
      } else {
        sessionStorage.removeItem(INTENDED_ONLINE_KEY)
      }
    } catch (err: unknown) {
      const code = getApiErrorCode(err)
      const message = getApiErrorMessage(err, 'Could not update online status.')
      if (code === 'ADVISOR_NOT_VERIFIED') {
        setPresenceError('You must be verified before going online.')
      } else if (code === 'SOCKET_NOT_CONNECTED' || !connected) {
        setPresenceError('Wait for the Live indicator in the header, then try again.')
      } else {
        setPresenceError(message)
      }
    }
  }

  const handleInterviewAvailabilityToggle = async () => {
    if (verificationStatus !== 'pending_review') return
    setPresenceError('')
    const newStatus = !interviewOpen
    try {
      await verificationService.updateInterviewAvailability(newStatus)
      setInterviewOpen(newStatus)
    } catch (err: unknown) {
      const code = getApiErrorCode(err)
      const message = getApiErrorMessage(err, 'Could not update interview availability.')
      if (code === 'SOCKET_NOT_CONNECTED' || !connected) {
        setPresenceError('Wait for the Live indicator in the header, then try again.')
      } else {
        setPresenceError(message)
      }
    }
  }

  const isVerified = verificationStatus === 'verified'
  const isPendingReview = verificationStatus === 'pending_review'
  const toggleEnabled = isVerified || isPendingReview
  const toggleOn = isVerified ? online : interviewOpen
  const handleToggle = isVerified ? handlePresenceToggle : handleInterviewAvailabilityToggle

  const handleDownloadCsv = () => {
    if (transactions.length === 0) return
    const header = 'Date,Type,Amount (Coins)\n'
    const rows = transactions.map((tx) => `${new Date(tx.timestamp).toISOString()},${tx.type},${tx.amountCoins}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'greenheart-activity.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell activeNav="advisor" showSearch={false}>
      {pendingInvitation && (
        <VerificationInvitationModal
          invitation={pendingInvitation}
          onAccepted={(interviewId) => {
            setPendingInvitation(null)
            navigate(`/verification/${interviewId}`)
          }}
          onDeclined={() => {
            setPendingInvitation(null)
            setDismissedInterviewId(pendingInvitation.interviewId)
          }}
          onDismiss={() => {
            setDismissedInterviewId(pendingInvitation.interviewId)
            setPendingInvitation(null)
          }}
        />
      )}

      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Advisor Hub"
          description="Manage your availability, earnings, and incoming patient sessions."
        />

        {awaitingVerification && verificationStatus === 'pending_review' && dismissedInterviewId && !pendingInvitation && (
          <DashboardAlert variant="info" icon="notifications" title="Verification request pending">
            <div className="flex flex-col sm:flex-row sm:items-center gap-stack-sm mt-1">
              <span>A partner doctor is waiting for your response.</span>
              <button
                type="button"
                className={`${btnPrimary} text-xs px-4 py-2 w-full sm:w-auto`}
                onClick={() => {
                  setDismissedInterviewId(null)
                  void verificationService.getMyInterview().then((data) => {
                    if (data.interviewId) {
                      showInvitation(
                        {
                          interviewId: data.interviewId,
                          partnerName: data.partnerName ?? 'Partner Doctor',
                        },
                        { force: true },
                      )
                    }
                  })
                }}
              >
                View invitation
              </button>
            </div>
          </DashboardAlert>
        )}

        {awaitingVerification && verificationStatus === 'pending_review' && (
          <DashboardAlert variant="warning" icon="hourglass_top" title="Application under review">
            {pendingInvitation ? (
              <>A verification interview request is waiting — use the dialog above to accept or decline.</>
            ) : interviewOpen ? (
              'You are visible to partner doctors as open for verification interviews.'
            ) : connected ? (
              'Toggle open below so partner doctors can start your verification interview.'
            ) : (
              'Connecting to realtime server… Then toggle open when you are ready for a verification call.'
            )}
          </DashboardAlert>
        )}

        {verificationStatus === 'rejected' && (
          <DashboardAlert variant="error" icon="cancel" title="Application rejected">
            Contact support if you believe this was an error.
          </DashboardAlert>
        )}

        {verificationStatus === 'verified' && (
          <DashboardAlert variant="success" icon="verified" title="Verified advisor">
            You are approved to receive patients. Toggle online when you are ready for calls.
          </DashboardAlert>
        )}

        {loadError && (
          <DashboardAlert variant="error" icon="error">
            {loadError}
          </DashboardAlert>
        )}

        {presenceError && (
          <DashboardAlert variant="error" icon="error">
            {presenceError}
          </DashboardAlert>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-md shadow-sm">
          <div>
            <p className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant">
              {isVerified ? 'Live dispatch' : 'Interview availability'}
            </p>
            <p className="text-sm text-on-surface-variant mt-1">
              {!toggleEnabled
                ? 'Complete verification to manage patient availability.'
                : !connected || restoringPresence
                  ? restoringPresence ? 'Restoring your online status…' : 'Connecting to realtime server…'
                  : isVerified
                    ? toggleOn
                      ? 'You are visible to patients on Discover'
                      : 'Go online to appear as available for consultations'
                    : toggleOn
                      ? 'Partners can see you as ready for a verification interview'
                      : 'Open to appear in the partner applicant queue as available'}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className={`text-sm font-label-md ${toggleOn ? 'text-secondary' : 'text-outline'}`}>
              {isVerified ? (toggleOn ? 'Online' : 'Offline') : toggleOn ? 'Open' : 'Closed'}
            </span>
            <button
              type="button"
              disabled={!toggleEnabled || !connected || restoringPresence}
              aria-pressed={toggleOn}
              onClick={handleToggle}
              className={`w-14 h-7 ${btnToggle} shrink-0 ${
                toggleOn ? 'bg-secondary' : 'bg-surface-variant'
              } ${!toggleEnabled || !connected ? 'opacity-40' : ''}`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                  toggleOn ? 'left-8' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <StatCard
            icon="account_balance_wallet"
            label="Total earnings"
            accent="secondary"
            value={loading ? '…' : `${totalEarnings} coins`}
            hint="Settled after completed sessions"
          />
          <StatCard
            icon="check_circle"
            label="Sessions completed"
            accent="primary"
            value={loading ? '…' : `${completedSessions}`}
            hint="Paid consultations"
          />
          <StatCard
            icon="payments"
            label="Session rate"
            accent="tertiary"
            value={`${user?.profile?.coinRatePerSession ?? 0} coins`}
            hint="Per consultation"
          />
        </div>

        {verificationStatus === 'verified' && (
          <DashboardSection title="Withdraw earnings">
            <DashboardAlert variant="info" icon="info" title="Demo payouts only">
              Withdrawals simulate paying out settled session earnings. No real money is transferred — for demonstration only.
            </DashboardAlert>

            <div className="mt-stack-md flex flex-col sm:flex-row sm:items-end gap-stack-md">
              <div className="grow">
                <p className="text-sm text-on-surface-variant mb-2">
                  Available to withdraw:{' '}
                  <span className="font-label-md text-on-surface">{loading ? '…' : `${totalEarnings} coins`}</span>
                </p>
                <form onSubmit={handleWithdrawSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    min={1}
                    max={totalEarnings || undefined}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount in coins"
                    className="w-full sm:max-w-xs bg-surface border border-outline-variant rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    disabled={withdrawing || totalEarnings <= 0}
                  />
                  <button
                    type="submit"
                    disabled={withdrawing || totalEarnings <= 0}
                    className={`${btnPrimary} px-6 py-2.5 whitespace-nowrap disabled:opacity-50`}
                  >
                    {withdrawing ? 'Processing…' : 'Withdraw coins'}
                  </button>
                  <button
                    type="button"
                    disabled={withdrawing || totalEarnings <= 0}
                    onClick={() => void handleWithdraw(totalEarnings)}
                    className={`${btnGhost} px-4 py-2.5 whitespace-nowrap disabled:opacity-50`}
                  >
                    Withdraw all
                  </button>
                </form>
              </div>
            </div>

            {withdrawMessage && (
              <div className="mt-stack-md">
                <DashboardAlert variant="success" icon="check_circle">
                  {withdrawMessage}
                </DashboardAlert>
              </div>
            )}
            {withdrawError && (
              <div className="mt-stack-md">
                <DashboardAlert variant="error" icon="error">
                  {withdrawError}
                </DashboardAlert>
              </div>
            )}
          </DashboardSection>
        )}

        <DashboardSection
          title="Recent activity"
          badge={
            transactions.length > 0 ? (
              <button
                type="button"
                onClick={handleDownloadCsv}
                className={`${btnGhost} text-sm flex items-center gap-1 px-2 py-1`}
              >
                <MaterialIcon name="download" className="text-[18px]" />
                CSV
              </button>
            ) : undefined
          }
        >
          {loading ? (
            <LoadingSpinner />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon="history"
              title="No sessions yet"
              description="Go online to receive patient calls. Activity will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Date</th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Type</th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface border-b border-outline-variant/30">
                      <td className="py-stack-sm px-stack-lg">{new Date(tx.timestamp).toLocaleDateString()}</td>
                      <td className="py-stack-sm px-stack-lg text-on-surface-variant capitalize text-sm">
                        {tx.type.replace(/_/g, ' ')}
                      </td>
                      <td
                        className={`py-stack-sm px-stack-lg text-right font-label-md ${
                          tx.amountCoins > 0 ? 'text-secondary' : 'text-error'
                        }`}
                      >
                        {tx.amountCoins > 0 ? '+' : ''}
                        {tx.amountCoins}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>
      </main>
    </AppShell>
  )
}
