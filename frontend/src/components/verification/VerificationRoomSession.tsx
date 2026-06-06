import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { MaterialIcon } from '../components/MaterialIcon'
import { btnDangerSolid, btnSecondary } from '../components/layout/buttonStyles'
import { FormError } from '../components/layout/dashboard-ui'
import { TwoPartyVideoLayout } from '../components/livekit/TwoPartyVideoLayout'
import { PartnerWaitingOverlay } from '../components/livekit/PartnerWaitingOverlay'
import { VerificationCompletionOverlay } from '../components/verification/VerificationCompletionOverlay'
import { verificationService } from '../api/verification.service'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { getApiErrorMessage } from '../utils/apiError'
import type { VerificationInterviewCompletedPayload } from '@shared/contracts/socket.events'

interface VerificationRoomContentProps {
  interviewId: string
  roomName: string | null
  isInterviewer: boolean
  backPath: string
}

function VerificationRoomContent({
  interviewId,
  roomName,
  isInterviewer,
  backPath,
}: VerificationRoomContentProps) {
  const room = useRoomContext()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const { socket } = useSocket()
  const [actionError, setActionError] = useState('')
  const [isFinishing, setIsProcessing] = useState(false)
  const [completion, setCompletion] = useState<'pass' | 'fail' | null>(null)
  const completingRef = useRef(false)

  const role = user?.role === 'partner_doctor' ? 'partner_doctor' : 'advisor'

  const endCallForBoth = useCallback(
    async (outcome: 'pass' | 'fail') => {
      if (completingRef.current) return
      completingRef.current = true

      if (outcome === 'pass' && !isInterviewer) {
        await refreshUser().catch(() => undefined)
      }

      room.disconnect(true)
      setCompletion(outcome)
    },
    [isInterviewer, refreshUser, room],
  )

  useEffect(() => {
    if (!socket || isInterviewer) return

    const onCompleted = (payload: VerificationInterviewCompletedPayload) => {
      if (payload.interviewId !== interviewId) return
      void endCallForBoth(payload.outcome)
    }

    socket.on('verification_interview_completed', onCompleted)
    return () => {
      socket.off('verification_interview_completed', onCompleted)
    }
  }, [socket, interviewId, isInterviewer, endCallForBoth])

  const handleCompleteInterview = async (outcome: 'pass' | 'fail') => {
    if (!isInterviewer) return
    setIsProcessing(true)
    setActionError('')
    try {
      await verificationService.completeInterview(interviewId, { outcome })
      await endCallForBoth(outcome)
    } catch (err) {
      completingRef.current = false
      setActionError(getApiErrorMessage(err, 'Could not save the interview result. Please try again.'))
      setIsProcessing(false)
    }
  }

  const handleContinue = () => {
    navigate(backPath, { replace: true })
  }

  return (
    <>
      {completion && (
        <VerificationCompletionOverlay outcome={completion} role={role} onContinue={handleContinue} />
      )}

      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-stack-sm px-4 md:px-margin-desktop py-3 md:py-stack-md glass-panel-dark safe-top">
        <div className="flex items-center gap-stack-sm min-w-0">
          <MaterialIcon name="verified_user" className="text-secondary shrink-0" />
          <span className="font-label-md text-label-md text-on-primary truncate">
            Verification: {roomName}
          </span>
        </div>

        {isInterviewer && !completion && (
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

        {!isInterviewer && !completion && (
          <span className="font-label-md text-sm text-secondary animate-pulse text-center sm:text-left">
            Waiting for partner assessment…
          </span>
        )}
      </div>

      {!completion && (
        <>
          <TwoPartyVideoLayout headerOffset="5.5rem" />
          {isInterviewer && <PartnerWaitingOverlay interviewId={interviewId} />}
        </>
      )}
      <RoomAudioRenderer />
    </>
  )
}

export interface VerificationRoomSessionProps {
  interviewId: string
  token: string
  url: string
  roomName: string | null
  isInterviewer: boolean
  backPath: string
}

export function VerificationRoomSession({
  interviewId,
  token,
  url,
  roomName,
  isInterviewer,
  backPath,
}: VerificationRoomSessionProps) {
  const navigate = useNavigate()
  const unexpectedDisconnectRef = useRef(false)

  return (
    <div className="bg-midnight h-[100dvh] w-full overflow-hidden text-on-primary font-body-md relative">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={url}
        onDisconnected={() => {
          if (!unexpectedDisconnectRef.current) {
            navigate(backPath, { replace: true })
          }
        }}
        data-lk-theme="default"
        style={{ height: '100dvh' }}
      >
        <VerificationRoomContent
          interviewId={interviewId}
          roomName={roomName}
          isInterviewer={isInterviewer}
          backPath={backPath}
        />
      </LiveKitRoom>
    </div>
  )
}
