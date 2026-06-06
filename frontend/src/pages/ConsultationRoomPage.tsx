import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { MaterialIcon } from '../components/MaterialIcon'
import { sessionService } from '../api/session.service'

export function ConsultationRoomPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const [token, setToken] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
        console.error('Failed to get LiveKit token', err)
        navigate('/discover')
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
        console.error('Failed to end session', err)
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

  if (!token || !url) {
    return null
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
        <div className="absolute top-0 w-full z-20 flex justify-between items-center px-margin-desktop py-stack-md glass-panel-dark">
          <div className="flex items-center gap-stack-sm">
            <MaterialIcon name="videocam" className="text-tertiary-fixed" />
            <span className="font-label-md text-label-md text-on-primary">Consultation Room: {roomName}</span>
          </div>
          
          <div className="flex items-center gap-stack-sm">
            <button 
              type="button" 
              onClick={handleEndSession}
              className="bg-error hover:bg-error/80 text-white font-label-md text-label-md px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg"
            >
              <MaterialIcon name="call_end" className="text-sm" />
              END SESSION
            </button>
          </div>
        </div>

        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
