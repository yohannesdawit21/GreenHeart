import { useNavigate, useSearchParams } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { btnDanger, btnSecondary } from '../components/layout/buttonStyles'
import { sessionService } from '../api/session.service'
import { useState } from 'react'

export function IncomingCallPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const clientName = searchParams.get('clientName') || 'Unknown Client'
  const duration = searchParams.get('duration') || '30'
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAccept = async () => {
    if (!sessionId) return
    setIsProcessing(true)
    try {
      await sessionService.acceptSession(sessionId)
      navigate(`/consultation?sessionId=${sessionId}`)
    } catch (err) {
      console.error('Failed to accept session', err)
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    if (!sessionId) return
    setIsProcessing(true)
    try {
      await sessionService.declineSession(sessionId)
      navigate('/advisor')
    } catch (err) {
      console.error('Failed to decline session', err)
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md h-screen w-screen overflow-hidden relative">
      <div className="absolute inset-0 z-0 p-8 grid grid-cols-12 gap-gutter opacity-40 grayscale">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-surface-container-lowest h-full rounded-lg border border-outline-variant" />
        </div>
        <div className="col-span-12 md:col-span-9 grid grid-rows-3 gap-gutter">
          <div className="row-span-1 bg-surface-container-lowest rounded-lg border border-outline-variant p-stack-md flex items-center justify-between">
            <div className="w-1/3 h-8 bg-surface-container rounded" />
            <div className="w-1/4 h-8 bg-surface-container rounded" />
          </div>
          <div className="row-span-2 grid grid-cols-2 gap-gutter">
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-stack-md" />
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-stack-md" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-40 bg-[#121d24]/85 backdrop-blur-md flex items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="bg-inverse-surface border-2 border-surface-container-lowest rounded-xl shadow-[0_24px_48px_-12px_rgba(13,92,96,0.15)] w-full max-w-[600px] p-stack-lg relative overflow-hidden flex flex-col items-center text-center">
          <div className="mb-stack-lg flex flex-col items-center">
            <MaterialIcon name="warning" filled className="text-error text-5xl mb-stack-sm pulse-ring rounded-full" />
            <h2 className="font-headline-lg text-headline-lg text-error text-pulse-coral tracking-widest mt-stack-md">
              INCOMING LIVE ENCOUNTER DISPATCH
            </h2>
            <p className="font-body-lg text-body-lg text-surface-variant mt-stack-sm">
              Priority Signal Detected. Immediate Response Required.
            </p>
          </div>

          <div className="bg-surface-variant/10 border border-outline/30 rounded-lg p-stack-md w-full mb-stack-lg text-left grid grid-cols-2 gap-gutter">
            <div>
              <p className="font-label-md text-label-md text-outline mb-unit">Subject</p>
              <p className="font-body-md text-body-md text-surface-container-lowest font-mono uppercase">{clientName}</p>
            </div>
            <div>
              <p className="font-label-md text-label-md text-outline mb-unit">Duration</p>
              <p className="font-body-md text-body-md text-surface-container-lowest">{duration} Minutes</p>
            </div>
            <div className="col-span-2">
              <p className="font-label-md text-label-md text-outline mb-unit">Signal Type</p>
              <div className="flex items-center gap-stack-sm text-error">
                <MaterialIcon name="vital_signs" filled />
                <span className="font-body-md text-body-md font-semibold">Elevated Stress Response - Class III</span>
              </div>
            </div>
          </div>

          <div className="flex w-full gap-stack-md mt-auto">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDecline}
              className={`${btnDanger} flex-1 py-4 px-6 text-label-md uppercase tracking-wider flex items-center justify-center gap-stack-sm`}
            >
              <MaterialIcon name="close" />
              DECLINE
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleAccept}
              className={`${btnSecondary} flex-1 py-4 px-6 text-label-md uppercase tracking-wider flex items-center justify-center gap-stack-sm shadow-lg`}
            >
              <MaterialIcon name="call" />
              ACCEPT
            </button>
          </div>

          <div className="absolute bottom-0 left-0 h-1 bg-surface-variant/30 w-full">
            <div className="h-full bg-error w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
