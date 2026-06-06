import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardAlert,
  DashboardSection,
  EmptyState,
  LoadingSpinner,
} from '../components/layout/dashboard-ui'
import { btnPrimary } from '../components/layout/buttonStyles'
import { MaterialIcon } from '../components/MaterialIcon'
import { verificationService } from '../api/verification.service'
import type { ApplicantDto } from '@shared/contracts/verification.api'

export function PartnerDashboardPage() {
  const [applicants, setApplicants] = useState<ApplicantDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    verificationService
      .getApplicants()
      .then((data) => setApplicants(data.applicants))
      .catch(() => setError('Failed to load applicants. Ensure you are logged in as a partner doctor.'))
      .finally(() => setLoading(false))
  }, [])

  const handleStartInterview = async (applicantId: string) => {
    setError('')
    try {
      const data = await verificationService.startInterview({ applicantId })
      navigate(`/verification/${data.interviewId}`)
    } catch {
      setError('Could not start interview. Please try again.')
    }
  }

  return (
    <AppShell activeNav="partner" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Partner portal"
          description="Review advisor applications and run verification video interviews."
          badge={
            <span className="inline-flex items-center gap-2 bg-secondary-container/25 border border-secondary/30 text-secondary px-3 py-1.5 rounded-lg font-label-md text-xs">
              <MaterialIcon name="verified_user" className="text-sm" />
              Authorized medical partner
            </span>
          }
        />

        <DashboardAlert variant="info" icon="info">
          After starting an interview, share the verification room URL with the applicant so they can join the call.
        </DashboardAlert>

        {error && (
          <DashboardAlert variant="error" icon="error">
            {error}
          </DashboardAlert>
        )}

        <DashboardSection
          title="Applicant queue"
          badge={
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-xs">
              {applicants.length} pending
            </span>
          }
        >
          {loading ? (
            <LoadingSpinner label="Loading applicants…" />
          ) : applicants.length === 0 ? (
            <EmptyState
              icon="person_add"
              title="Queue is empty"
              description="When doctors apply at /auth/advisor-apply, they will appear here for review."
            />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-outline-variant/40">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="p-stack-lg flex flex-col gap-stack-md">
                    <div>
                      <p className="font-bold text-on-background">{applicant.username}</p>
                      <p className="text-sm text-on-surface-variant">{applicant.email}</p>
                    </div>
                    <p className="text-sm text-on-surface-variant italic line-clamp-3">"{applicant.bio}"</p>
                    {applicant.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {applicant.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-surface-container px-2 py-0.5 rounded uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStartInterview(applicant.id)}
                      className={`${btnPrimary} text-sm py-3 px-4 w-full flex items-center justify-center gap-2`}
                    >
                      <MaterialIcon name="videocam" className="text-sm" />
                      Start interview
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/50">
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Applicant</th>
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Bio</th>
                      <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-surface border-b border-outline-variant/30">
                        <td className="py-stack-md px-stack-lg align-top">
                          <div className="font-bold">{applicant.username}</div>
                          <div className="text-on-surface-variant text-sm">{applicant.email}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {applicant.tags.map((tag) => (
                              <span key={tag} className="text-[10px] bg-surface-container px-2 py-0.5 rounded uppercase">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-stack-md px-stack-lg align-top max-w-md">
                          <p className="line-clamp-3 text-sm italic text-on-surface-variant">"{applicant.bio}"</p>
                        </td>
                        <td className="py-stack-md px-stack-lg text-right align-middle">
                          <button
                            type="button"
                            onClick={() => handleStartInterview(applicant.id)}
                            className={`${btnPrimary} text-xs py-2.5 px-4 inline-flex items-center gap-2`}
                          >
                            <MaterialIcon name="videocam" className="text-sm" />
                            Start interview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DashboardSection>
      </main>
    </AppShell>
  )
}
