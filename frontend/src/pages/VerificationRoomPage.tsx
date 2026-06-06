import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { MaterialIcon } from '../components/MaterialIcon'
import { btnDangerSolid, btnSecondary } from '../components/layout/buttonStyles'
import { FormError, RoomErrorScreen } from '../components/layout/dashboard-ui'
import { verificationService } from '../api/verification.service'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/apiError'

export function VerificationRoomPage() {
  const navigate = useNavigate()
  const { interviewId } = useParams<{ interviewId: string }>()
  const { user } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isFinishing, setIsProcessing] = useState(false)

  const isInterviewer = user?.role === 'partner_doctor'
  const backPath = isInterviewer ? '/partner' : '/advisor'

  useEffect(() => {
    if (!interviewId) {
      navigate(backPath)
      return
    }

    const fetchToken = async () => {
      try {
        const data = await verificationService.getInterviewToken(interviewId)
        setToken(data.token)
        setUrl(data.livekitUrl)
        setRoomName(data.roomName)
      } catch (err) {
        setConnectionError(getApiErrorMessage(err, 'Could not connect to the verification room.'))
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [interviewId, navigate, backPath])

  const handleCompleteInterview = async (outcome: 'pass' | 'fail') => {
    if (!interviewId) return
    setIsProcessing(true)
    setActionError('')
    try {
      await verificationService.completeInterview(interviewId, { outcome })
      navigate(backPath)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not save the interview result. Please try again.'))
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

  if (connectionError || !token || !url) {
    return (
      <RoomErrorScreen
        title="Verification room unavailable"
        message={connectionError || 'Could not connect to the verification room.'}
        backLabel={isInterviewer ? 'Back to Partner Portal' : 'Back to Advisor Hub'}
        onBack={() => navigate(backPath)}
      />
    )
  }

  return (
    <div className="bg-midnight h-[100dvh] w-full overflow-hidden text-on-primary font-body-md relative">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={url}
        onDisconnected={() => navigate(backPath)}
        data-lk-theme="default"
        style={{ height: '100dvh' }}
      >
        <div className="absolute top-0 left-0 right-0 z-20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-stack-sm px-4 md:px-margin-desktop py-3 md:py-stack-md glass-panel-dark safe-top">
          <div className="flex items-center gap-stack-sm min-w-0">
            <MaterialIcon name="verified_user" className="text-secondary shrink-0" />
            <span className="font-label-md text-label-md text-on-primary truncate">
              Verification: {roomName}
            </span>
          </div>

          {isInterviewer && (
            <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto shrink-0">
              {actionError && (
                <div className="w-full sm:max-w-sm">
                  <FormError>{actionError}</FormError>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isFinishing}
                  onClick={() => handleCompleteInterview('fail')}
                  className={`${btnDangerSolid} text-xs px-4 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto`}
                >
                  <MaterialIcon name="thumb_down" className="text-sm" />
                  Reject
                </button>
                <button
                  type="button"
                  disabled={isFinishing}
                  onClick={() => handleCompleteInterview('pass')}
                  className={`${btnSecondary} text-xs px-4 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto`}
                >
                  <MaterialIcon name="thumb_up" className="text-sm" />
                  Verify
                </button>
              </div>
            </div>
          )}

          {!isInterviewer && (
            <span className="font-label-md text-sm text-secondary animate-pulse text-center sm:text-left">
              Waiting for partner assessment…
            </span>
          )}
        </div>

        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
