import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { MaterialIcon } from '../components/MaterialIcon'
import { btnDangerSolid } from '../components/layout/buttonStyles'
import { FormError, RoomErrorScreen } from '../components/layout/dashboard-ui'
import { TwoPartyVideoLayout } from '../components/livekit/TwoPartyVideoLayout'
import { ReviewModal } from '../components/ReviewModal'
import { sessionService } from '../api/session.service'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'

const TOKEN_POLL_INTERVAL_MS = 1500
const TOKEN_POLL_MAX_ATTEMPTS = 20

export function ConsultationRoomPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const { user } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState('')
  const [endError, setEndError] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [advisorName, setAdvisorName] = useState<string>()
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!sessionId) return
    sessionService
      .getSessionStatus(sessionId)
      .then((status) => {
        if (status.advisorName) setAdvisorName(status.advisorName)
        setDurationMinutes(status.durationMinutes)
      })
      .catch(() => undefined)
  }, [sessionId])

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchTokenWithRetry = useCallback(async (id: string) => {
    for (let attempt = 0; attempt < TOKEN_POLL_MAX_ATTEMPTS; attempt++) {
      try {
        const status = await sessionService.getSessionStatus(id)
        if (status.status === 'active') {
          const data = await sessionService.getLiveKitToken(id)
          return data
        }
        if (status.status === 'declined' || status.status === 'cancelled') {
          throw new Error('Session was declined or cancelled.')
        }
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, '')
        if (message.includes('not active') || message.includes('declined') || message.includes('cancelled')) {
          if (attempt < TOKEN_POLL_MAX_ATTEMPTS - 1) {
            await new Promise((r) => setTimeout(r, TOKEN_POLL_INTERVAL_MS))
            continue
          }
        }
        throw err
      }
      await new Promise((r) => setTimeout(r, TOKEN_POLL_INTERVAL_MS))
    }
    throw new Error('Session is not active yet. Please try again from your advisor hub or waiting screen.')
  }, [])

  useEffect(() => {
    if (!sessionId) {
      navigate('/discover')
      return
    }

    const load = async () => {
      try {
        const data = await fetchTokenWithRetry(sessionId)
        setToken(data.token)
        setUrl(data.url)
        setRoomName(data.roomName)
      } catch (err) {
        setConnectionError(getApiErrorMessage(err, 'Could not join the consultation room.'))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [sessionId, navigate, fetchTokenWithRetry])

  const finishSession = async () => {
    if (!sessionId) return
    try {
      const result = await sessionService.endSession(sessionId)
      setSessionEnded(true)
      if (user?.role === 'client' && result.status === 'completed') {
        setShowReview(true)
        return
      }
    } catch (err) {
      setEndError(getApiErrorMessage(err, 'Session ended locally, but we could not update the server.'))
    }
    navigate(user?.role === 'advisor' ? '/advisor' : '/discover')
  }

  const handleReviewDone = () => {
    setShowReview(false)
    navigate('/discover')
  }

  if (loading) {
    return (
      <div className="bg-midnight h-screen w-screen flex items-center justify-center text-on-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p>Connecting to consultation room…</p>
        </div>
      </div>
    )
  }

  if (connectionError || !token || !url) {
    return (
      <RoomErrorScreen
        title="Consultation unavailable"
        message={connectionError || 'Could not join the consultation room.'}
        backLabel="Back to Discover"
        onBack={() => navigate('/discover')}
      />
    )
  }

  if (sessionEnded && showReview && sessionId) {
    return (
      <ReviewModal
        sessionId={sessionId}
        advisorName={advisorName}
        onSubmitted={handleReviewDone}
        onSkip={handleReviewDone}
      />
    )
  }

  return (
    <div className="bg-midnight h-screen w-screen overflow-hidden text-on-primary font-body-md relative">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={url}
        onDisconnected={() => void finishSession()}
        data-lk-theme="default"
        style={{ height: '100dvh' }}
      >
        <div className="absolute top-0 w-full z-20 flex flex-col gap-stack-sm px-margin-desktop py-stack-md glass-panel-dark safe-top">
          <div className="flex justify-between items-center gap-stack-sm">
            <div className="flex items-center gap-stack-sm min-w-0">
              <MaterialIcon name="videocam" className="text-tertiary-fixed shrink-0" />
              <div className="min-w-0">
                <span className="font-label-md text-label-md text-on-primary truncate block">
                  {advisorName ? `Session with ${advisorName}` : `Consultation: ${roomName}`}
                </span>
                <span className="text-xs text-on-primary/70">
                  {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')} · {durationMinutes} min booked
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void finishSession()}
              className={`${btnDangerSolid} text-label-md px-4 py-2 rounded-full flex items-center gap-2 shrink-0`}
            >
              <MaterialIcon name="call_end" className="text-sm" />
              END SESSION
            </button>
          </div>
          {endError && <FormError>{endError}</FormError>}
        </div>

        <TwoPartyVideoLayout headerOffset="5rem" />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
