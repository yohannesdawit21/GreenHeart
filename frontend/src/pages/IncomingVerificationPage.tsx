import { Navigate, useSearchParams } from 'react-router-dom'

/** Legacy URL — invitations are shown as a modal on Advisor Hub, not a forced redirect. */
export function IncomingVerificationPage() {
  const [searchParams] = useSearchParams()
  const interviewId = searchParams.get('interviewId')

  return (
    <Navigate
      to="/advisor"
      replace
      state={
        interviewId
          ? {
              verificationInvitation: {
                interviewId,
                partnerName: searchParams.get('partnerName') || 'Partner Doctor',
              },
            }
          : undefined
      }
    />
  )
}
