import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell, appShellMainClass } from '../components/layout/AppShell'
import { MaterialIcon } from '../components/MaterialIcon'
import { verificationService } from '../api/verification.service'
import type { ApplicantDto } from '@shared/contracts/verification.api'

export function PartnerDashboardPage() {
  const [applicants, setApplicants] = useState<ApplicantDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const data = await verificationService.getApplicants()
        setApplicants(data.applicants)
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Could not load applicants')
      } finally {
        setLoading(false)
      }
    }
    fetchApplicants()
  }, [])

  const handleStartInterview = async (applicantId: string) => {
    try {
      const data = await verificationService.startInterview({ applicantId })
      navigate(`/verification/${data.interviewId}`)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Could not start interview')
    }
  }

  return (
    <AppShell activeNav="partner" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-stack-md">
          <div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background">Medical Partner Portal</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Review and verify new advisor applications.</p>
          </div>
          <div className="bg-secondary-container/20 border border-secondary-container px-4 py-2 rounded-lg flex items-center gap-2">
            <MaterialIcon name="verified_user" className="text-secondary" />
            <span className="font-label-md text-label-md text-secondary font-bold">Authorized Medical Partner</span>
          </div>
        </header>

        {error && (
          <div className="bg-error-container/30 border border-error text-on-error-container p-stack-md rounded-lg">
            {error}
          </div>
        )}

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-stack-lg py-stack-md border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface">Applicant Queue</h3>
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-label-md">
              {applicants.length} Pending
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Applicant</th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Bio & Credentials</th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {applicants.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-surface transition-colors border-b border-outline-variant/30">
                      <td className="py-stack-md px-stack-lg align-top">
                        <div className="font-bold">{applicant.username}</div>
                        <div className="text-on-surface-variant text-sm">{applicant.email}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {applicant.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-surface-container px-2 py-0.5 rounded uppercase tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-stack-md px-stack-lg align-top max-w-md">
                        <p className="line-clamp-3 text-sm italic">"{applicant.bio}"</p>
                      </td>
                      <td className="py-stack-md px-stack-lg text-right align-middle">
                        <button
                          type="button"
                          onClick={() => handleStartInterview(applicant.id)}
                          className="bg-primary text-on-primary font-label-md text-xs py-2 px-4 rounded-lg hover:bg-on-primary-fixed-variant transition-colors inline-flex items-center gap-2"
                        >
                          <MaterialIcon name="videocam" className="text-sm" />
                          START INTERVIEW
                        </button>
                      </td>
                    </tr>
                  ))}
                  {applicants.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-20 text-center text-on-surface-variant">
                        The applicant queue is currently empty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  )
}
