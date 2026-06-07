import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { btnDanger, btnSecondary } from '../components/layout/buttonStyles'
import { ConfirmDialog } from '../components/layout/ConfirmDialog'
import { FormError } from '../components/layout/dashboard-ui'
import { sessionService } from '../api/session.service'
import { useSocket } from '../context/SocketContext'
import { getApiErrorMessage } from '../utils/apiError'

export function IncomingCallPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const clientName = searchParams.get('clientName') || 'A client'
  const duration = searchParams.get('duration') || '30'
  const { socket } = useSocket()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [endedMessage, setEndedMessage] = useState('')
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      navigate('/advisor')
      return
    }

    const dismiss = (message: string) => {
      setEndedMessage(message)
      setIsProcessing(false)
      setShowDeclineConfirm(false)
    }

    const onCallProcessing = (payload: { sessionId: string; status: string }) => {
      if (payload.sessionId !== sessionId) return
      if (payload.status === 'cancelled') {
        dismiss(`${clientName} cancelled the request. Returning to Advisor Hub.`)
      }
    }

    socket?.on('call_processing', onCallProcessing)

    const poll = setInterval(async () => {
      try {
        const status = await sessionService.getSessionStatus(sessionId)
        if (status.status === 'cancelled') {
          dismiss(`${clientName} cancelled the request. Returning to Advisor Hub.`)
        }
        if (status.status === 'declined' || status.status === 'completed' || status.status === 'active') {
          clearInterval(poll)
        }
      } catch {
        /* ignore transient errors */
      }
    }, 2000)

    return () => {
      socket?.off('call_processing', onCallProcessing)
      clearInterval(poll)
    }
  }, [sessionId, socket, navigate, clientName])

  useEffect(() => {
    if (!endedMessage) return
    const timer = setTimeout(() => navigate('/advisor'), 2500)
    return () => clearTimeout(timer)
  }, [endedMessage, navigate])

  const handleAccept = async () => {
    if (!sessionId) return
    setIsProcessing(true)
    setError('')
    try {
      await sessionService.acceptSession(sessionId)
      navigate(`/consultation?sessionId=${sessionId}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept the call. Please try again.'))
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    if (!sessionId) return
    setIsProcessing(true)
    setError('')
    try {
      await sessionService.declineSession(sessionId)
      navigate('/advisor')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not decline the call. Please try again.'))
      setIsProcessing(false)
    } finally {
      setShowDeclineConfirm(false)
    }
  }

  if (endedMessage) {
    return (
      <div className="bg-background text-on-background font-body-md min-h-[100dvh] w-full flex items-center justify-center p-margin-mobile">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-ambient w-full max-w-md p-stack-lg text-center">
          <MaterialIcon name="call_end" filled className="text-on-surface-variant text-5xl mb-stack-md mx-auto" />
          <p className="font-body-lg text-body-lg text-on-surface">{endedMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-[100dvh] w-full flex items-center justify-center p-margin-mobile pb-[max(1rem,env(safe-area-inset-bottom))]">
      <ConfirmDialog
        open={showDeclineConfirm}
        title="Decline this session?"
        message="The client's coins will be refunded. They can connect with you or another advisor again."
        confirmLabel="Decline session"
        cancelLabel="Keep ringing"
        variant="danger"
        icon="call_end"
        onConfirm={() => void handleDecline()}
        onCancel={() => setShowDeclineConfirm(false)}
      />

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-ambient w-full max-w-md p-stack-lg text-center">
        <div className="w-16 h-16 rounded-full bg-secondary-container/30 border border-secondary/30 flex items-center justify-center mx-auto mb-stack-md animate-pulse">
          <MaterialIcon name="videocam" className="text-secondary text-3xl" />
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-background">Incoming consultation</h1>
        <p className="text-on-surface-variant mt-2">{clientName} would like to connect with you.</p>

        <div className="mt-stack-lg bg-surface-container rounded-xl p-stack-md text-left grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">Client</p>
            <p className="font-label-md text-on-surface">{clientName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">Duration</p>
            <p className="font-label-md text-on-surface">{duration} minutes</p>
          </div>
        </div>

        {error && (
          <div className="mt-stack-md">
            <FormError>{error}</FormError>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-stack-lg">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setShowDeclineConfirm(true)}
            className={`${btnDanger} flex-1 py-3 flex items-center justify-center gap-2`}
          >
            <MaterialIcon name="close" className="text-sm" />
            Decline
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleAccept}
            className={`${btnSecondary} flex-1 py-3 flex items-center justify-center gap-2`}
          >
            <MaterialIcon name="call" className="text-sm" />
            {isProcessing ? 'Joining…' : 'Accept & join'}
          </button>
        </div>
      </div>
    </div>
  )
}
