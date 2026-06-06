import { useEffect, useState } from 'react'
import { useRemoteParticipants } from '@livekit/components-react'
import { MaterialIcon } from '../MaterialIcon'
import { useSocket } from '../../context/SocketContext'
import type {
  VerificationInterviewAcceptedPayload,
  VerificationInterviewDeclinedPayload,
} from '@shared/contracts/socket.events'

export function PartnerWaitingOverlay({ interviewId }: { interviewId: string }) {
  const remoteParticipants = useRemoteParticipants()
  const { socket } = useSocket()
  const [doctorAccepted, setDoctorAccepted] = useState(false)
  const [doctorDeclined, setDoctorDeclined] = useState(false)

  useEffect(() => {
    if (!socket) return

    const onAccepted = (payload: VerificationInterviewAcceptedPayload) => {
      if (payload.interviewId === interviewId) setDoctorAccepted(true)
    }

    const onDeclined = (payload: VerificationInterviewDeclinedPayload) => {
      if (payload.interviewId === interviewId) setDoctorDeclined(true)
    }

    socket.on('verification_interview_accepted', onAccepted)
    socket.on('verification_interview_declined', onDeclined)
    return () => {
      socket.off('verification_interview_accepted', onAccepted)
      socket.off('verification_interview_declined', onDeclined)
    }
  }, [socket, interviewId])

  if (remoteParticipants.length > 0) return null

  if (doctorDeclined) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-midnight/80 backdrop-blur-sm px-4">
        <div className="glass-panel-dark rounded-xl p-stack-lg max-w-md text-center border border-error/40">
          <MaterialIcon name="cancel" className="text-error text-4xl mb-stack-sm" />
          <p className="font-label-md text-on-primary">The applicant declined this verification interview.</p>
          <p className="text-sm text-on-surface-variant mt-2">Leave the room and try again from Partner Portal.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-midnight/70 backdrop-blur-sm px-4 pointer-events-none">
      <div className="glass-panel-dark rounded-xl p-stack-lg max-w-md text-center border border-secondary/30">
        <MaterialIcon
          name={doctorAccepted ? 'videocam' : 'hourglass_top'}
          className={`text-secondary text-4xl mb-stack-sm ${doctorAccepted ? '' : 'animate-pulse'}`}
        />
        <p className="font-label-md text-on-primary">
          {doctorAccepted
            ? 'Doctor accepted — they are joining the room…'
            : 'Waiting for the doctor to accept your verification invitation…'}
        </p>
        {!doctorAccepted && (
          <p className="text-sm text-on-surface-variant mt-2">
            They should see an accept prompt on Advisor Hub.
          </p>
        )}
      </div>
    </div>
  )
}
