import { useState } from 'react'
import { MaterialIcon } from '../MaterialIcon'
import { btnDanger, btnSecondary } from '../layout/buttonStyles'
import { FormError } from '../layout/dashboard-ui'
import { verificationService } from '../../api/verification.service'
import { getApiErrorMessage } from '../../utils/apiError'

export interface VerificationInvitation {
  interviewId: string
  partnerName: string
}

interface VerificationInvitationModalProps {
  invitation: VerificationInvitation
  onAccepted: (interviewId: string) => void
  onDeclined: () => void
  onDismiss?: () => void
}

export function VerificationInvitationModal({
  invitation,
  onAccepted,
  onDeclined,
  onDismiss,
}: VerificationInvitationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleAccept = async () => {
    setIsProcessing(true)
    setError('')
    try {
      await verificationService.acceptInterview(invitation.interviewId)
      onAccepted(invitation.interviewId)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept the verification interview. Please try again.'))
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    setIsProcessing(true)
    setError('')
    try {
      await verificationService.declineInterview(invitation.interviewId)
      onDeclined()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not decline the interview. Please try again.'))
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#121d24]/85 backdrop-blur-md flex items-center justify-center p-margin-mobile md:p-margin-desktop">
      <div className="bg-inverse-surface border-2 border-secondary/40 rounded-xl shadow-[0_24px_48px_-12px_rgba(13,92,96,0.15)] w-full max-w-[600px] p-stack-lg relative overflow-hidden flex flex-col items-center text-center">
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            disabled={isProcessing}
            className="absolute top-3 right-3 text-surface-variant hover:text-surface-container-lowest p-1"
            aria-label="Dismiss for now"
          >
            <MaterialIcon name="close" />
          </button>
        )}

        <div className="mb-stack-lg flex flex-col items-center">
          <MaterialIcon name="verified_user" filled className="text-secondary text-5xl mb-stack-sm pulse-ring rounded-full" />
          <h2 className="font-headline-lg text-headline-lg text-secondary tracking-widest mt-stack-md">
            VERIFICATION INTERVIEW REQUEST
          </h2>
          <p className="font-body-lg text-body-lg text-surface-variant mt-stack-sm">
            A partner doctor wants to verify your credentials via video call.
          </p>
        </div>

        <div className="bg-surface-variant/10 border border-outline/30 rounded-lg p-stack-md w-full mb-stack-lg text-left grid grid-cols-2 gap-gutter">
          <div>
            <p className="font-label-md text-label-md text-outline mb-unit">Partner doctor</p>
            <p className="font-body-md text-body-md text-surface-container-lowest font-mono uppercase">
              {invitation.partnerName}
            </p>
          </div>
          <div>
            <p className="font-label-md text-label-md text-outline mb-unit">Session type</p>
            <p className="font-body-md text-body-md text-surface-container-lowest">Credential verification</p>
          </div>
          <div className="col-span-2">
            <p className="font-label-md text-label-md text-outline mb-unit">What happens next</p>
            <div className="flex items-center gap-stack-sm text-secondary">
              <MaterialIcon name="videocam" filled />
              <span className="font-body-md text-body-md font-semibold text-left">
                Accept to join the secure verification room. The partner will review your application live.
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-stack-md mt-auto flex-col">
          {error && <FormError>{error}</FormError>}
          <div className="flex w-full gap-stack-md">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDecline}
              className={`${btnDanger} flex-1 py-4 px-6 text-label-md uppercase tracking-wider flex items-center justify-center gap-stack-sm`}
            >
              <MaterialIcon name="close" />
              Decline
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleAccept}
              className={`${btnSecondary} flex-1 py-4 px-6 text-label-md uppercase tracking-wider flex items-center justify-center gap-stack-sm shadow-lg`}
            >
              <MaterialIcon name="videocam" />
              Accept &amp; join
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 bg-surface-variant/30 w-full">
          <div className="h-full bg-secondary w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
