import { useState, useEffect } from 'react'
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
import { sessionService } from '../api/session.service'
import { getApiErrorMessage } from '../utils/apiError'

export function ConsultationRoomPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const [token, setToken] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState('')
  const [endError, setEndError] = useState('')

  useEffect(() => {
    if (!sessionId) {
      navigate('/discover')
      return
    }

    const fetchToken = async () => {
      try {
        const data = await sessionService.getLiveKitToken(sessionId)
        setToken(data.token)
        setUrl(data.url)
        setRoomName(data.roomName)
      } catch (err) {
        setConnectionError(getApiErrorMessage(err, 'Could not join the consultation room.'))
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [sessionId, navigate])

  const handleEndSession = async () => {
    if (sessionId) {
      try {
        await sessionService.endSession(sessionId)
      } catch (err) {
        setEndError(getApiErrorMessage(err, 'Session ended locally, but we could not update the server.'))
      }
    }
    navigate('/discover')
  }

  if (loading) {
    return (
      <div className="bg-midnight h-screen w-screen flex items-center justify-center text-on-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p>Initializing Secure Connection...</p>
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

  return (
    <div className="bg-midnight h-screen w-screen overflow-hidden text-on-primary font-body-md relative">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={url}
        onDisconnected={handleEndSession}
        data-lk-theme="default"
        style={{ height: '100dvh' }}
      >
        <div className="absolute top-0 w-full z-20 flex flex-col gap-stack-sm px-margin-desktop py-stack-md glass-panel-dark safe-top">
          <div className="flex justify-between items-center gap-stack-sm">
            <div className="flex items-center gap-stack-sm min-w-0">
              <MaterialIcon name="videocam" className="text-tertiary-fixed shrink-0" />
              <span className="font-label-md text-label-md text-on-primary truncate">
                Consultation Room: {roomName}
              </span>
            </div>

            <button
              type="button"
              onClick={handleEndSession}
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
