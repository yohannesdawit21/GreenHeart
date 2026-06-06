import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RoomErrorScreen } from '../components/layout/dashboard-ui'
import { VerificationRoomSession } from '../components/verification/VerificationRoomSession'
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

  if (connectionError || !token || !url || !interviewId) {
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
    <VerificationRoomSession
      interviewId={interviewId}
      token={token}
      url={url}
      roomName={roomName}
      isInterviewer={isInterviewer}
      backPath={backPath}
    />
  )
}
