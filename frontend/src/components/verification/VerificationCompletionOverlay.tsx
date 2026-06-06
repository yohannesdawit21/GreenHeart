import { MaterialIcon } from '../MaterialIcon'
import { btnPrimary } from '../layout/buttonStyles'

interface VerificationCompletionOverlayProps {
  outcome: 'pass' | 'fail'
  role: 'partner_doctor' | 'advisor'
  onContinue: () => void
}

export function VerificationCompletionOverlay({
  outcome,
  role,
  onContinue,
}: VerificationCompletionOverlayProps) {
  const isVerified = outcome === 'pass'
  const isPartner = role === 'partner_doctor'

  const title = isVerified
    ? isPartner
      ? 'Applicant verified'
      : "You're verified!"
    : isPartner
      ? 'Application rejected'
      : 'Verification not approved'

  const subtitle = isVerified
    ? isPartner
      ? 'The interview is complete. The doctor can now go online for patient sessions.'
      : 'Welcome to GreenHeart. Toggle Live dispatch when you are ready for patient calls.'
    : isPartner
      ? 'The applicant has been notified. They may reapply later.'
      : 'Your application was not approved at this time. Contact support if you have questions.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/95 backdrop-blur-md p-margin-mobile">
      {isVerified && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-2 h-2 rounded-full opacity-80"
              style={{
                left: `${(i * 17) % 100}%`,
                top: '-5%',
                backgroundColor: i % 3 === 0 ? '#5cb8a8' : i % 3 === 1 ? '#7dd3c0' : '#f4d35e',
                animation: `verification-confetti ${1.2 + (i % 5) * 0.15}s ease-out ${i * 0.05}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`relative text-center max-w-md w-full rounded-2xl border p-stack-xl shadow-2xl ${
          isVerified
            ? 'border-secondary/40 bg-gradient-to-b from-secondary-container/30 to-surface-container-lowest'
            : 'border-error/30 bg-gradient-to-b from-error-container/20 to-surface-container-lowest'
        }`}
      >
        <div
          className={`mx-auto mb-stack-lg w-24 h-24 rounded-full flex items-center justify-center ${
            isVerified
              ? 'bg-secondary text-on-secondary animate-[verification-pop_0.6s_ease-out]'
              : 'bg-error-container text-on-error-container'
          }`}
        >
          <MaterialIcon
            name={isVerified ? 'verified' : 'cancel'}
            filled
            className="text-5xl"
          />
        </div>

        <h2
          className={`font-headline-lg text-headline-lg mb-stack-sm ${
            isVerified ? 'text-secondary' : 'text-error'
          }`}
        >
          {title}
        </h2>
        <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-stack-lg">
          {subtitle}
        </p>

        {isVerified && !isPartner && (
          <div className="flex items-center justify-center gap-2 text-secondary text-sm font-label-md mb-stack-lg animate-pulse">
            <MaterialIcon name="sensors" className="text-base" />
            Live dispatch is now unlocked on Advisor Hub
          </div>
        )}

        <p className="text-xs text-on-surface-variant mb-stack-md">Ending call for both participants…</p>

        <button type="button" onClick={onContinue} className={`${btnPrimary} w-full sm:w-auto px-8 py-3`}>
          Continue
        </button>
      </div>

      <style>{`
        @keyframes verification-pop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes verification-confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
