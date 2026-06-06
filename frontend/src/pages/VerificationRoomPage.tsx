import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { MaterialIcon } from '../components/MaterialIcon'
import { verificationService } from '../api/verification.service'
import { useAuth } from '../context/AuthContext'

export function VerificationRoomPage() {
  const navigate = useNavigate()
  const { interviewId } = useParams<{ interviewId: string }>()
  const { user } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFinishing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!interviewId) {
      navigate('/partner')
      return
    }

    const fetchToken = async () => {
      try {
        const data = await verificationService.getInterviewToken(interviewId)
        setToken(data.token)
        setUrl(data.livekitUrl)
        setRoomName(data.roomName)
      } catch (err) {
        console.error('Failed to get verification token', err)
        navigate('/partner')
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [interviewId, navigate])

  const handleCompleteInterview = async (outcome: 'pass' | 'fail') => {
    if (!interviewId) return
    setIsProcessing(true)
    try {
      await verificationService.completeInterview(interviewId, { outcome })
      navigate('/partner')
    } catch (err) {
      console.error('Failed to complete interview', err)
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-midnight h-screen w-screen flex items-center justify-center text-on-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p>Connecting to Secure Verification Room...</p>
        </div>
      </div>
    )
  }

  if (!token || !url) return null

  const isInterviewer = user?.role === 'partner_doctor' || user?.role === 'admin'

  return (
    <div className="bg-midnight h-screen w-screen overflow-hidden text-on-primary font-body-md relative">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={url}
        onDisconnected={() => navigate(isInterviewer ? '/partner' : '/advisor')}
        data-lk-theme="default"
        style={{ height: '100dvh' }}
      >
        <div className="absolute top-0 w-full z-20 flex justify-between items-center px-margin-desktop py-stack-md glass-panel-dark">
          <div className="flex items-center gap-stack-sm">
            <MaterialIcon name="verified_user" className="text-secondary" />
            <span className="font-label-md text-label-md text-on-primary">Verification Session: {roomName}</span>
          </div>
          
          {isInterviewer && (
            <div className="flex items-center gap-stack-md">
              <button 
                type="button" 
                disabled={isFinishing}
                onClick={() => handleCompleteInterview('fail')}
                className="bg-error/20 hover:bg-error border border-error text-white font-label-md text-xs px-4 py-2 rounded-lg transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <MaterialIcon name="thumb_down" className="text-sm" />
                FAIL / REJECT
              </button>
              <button 
                type="button" 
                disabled={isFinishing}
                onClick={() => handleCompleteInterview('pass')}
                className="bg-secondary hover:bg-secondary/80 text-on-secondary font-label-md text-xs px-6 py-2 rounded-lg transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <MaterialIcon name="thumb_up" className="text-sm" />
                PASS / VERIFY
              </button>
            </div>
          )}

          {!isInterviewer && (
            <div className="flex items-center gap-stack-sm">
              <span className="font-label-md text-label-md text-secondary animate-pulse">Waiting for partner's assessment...</span>
            </div>
          )}
        </div>

        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
