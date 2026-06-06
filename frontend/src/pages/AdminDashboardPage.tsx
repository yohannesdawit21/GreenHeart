import { useState, useEffect } from 'react'
import { AppShell } from '../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardAlert,
  DashboardSection,
  EmptyState,
  FormError,
  LoadingSpinner,
  VerificationStatusPill,
} from '../components/layout/dashboard-ui'
import { btnDanger, btnIconDanger, btnIconSuccess, btnOutline, btnPrimary, btnSuccess } from '../components/layout/buttonStyles'
import { MaterialIcon } from '../components/MaterialIcon'
import { verificationService } from '../api/verification.service'
import { getApiErrorMessage } from '../utils/apiError'
import type { PartnerDoctorDto, ApplicantDto, VerificationStatus } from '@shared/contracts/verification.api'

export function AdminDashboardPage() {
  const [partners, setPartners] = useState<PartnerDoctorDto[]>([])
  const [applicants, setApplicants] = useState<ApplicantDto[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [modalError, setModalError] = useState('')
  const [overrideError, setOverrideError] = useState('')
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [partnerPass, setPartnerPass] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, aData] = await Promise.all([
          verificationService.getPartners(),
          verificationService.getAdminAdvisors(),
        ])
        setPartners(pData.partners)
        setApplicants(aData.applicants)
      } catch (err) {
        setPageError(getApiErrorMessage(err, 'Failed to load admin data.'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    try {
      await verificationService.registerPartner({
        email: partnerEmail,
        username: partnerName,
        password: partnerPass,
      })
      const pData = await verificationService.getPartners()
      setPartners(pData.partners)
      setShowPartnerModal(false)
      setModalError('')
      setPartnerEmail('')
      setPartnerName('')
      setPartnerPass('')
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Failed to register partner doctor.'))
    }
  }

  const handleOverride = async (applicantId: string, status: VerificationStatus) => {
    setOverrideError('')
    try {
      await verificationService.overrideStatus(applicantId, { status })
      const aData = await verificationService.getAdminAdvisors()
      setApplicants(aData.applicants)
    } catch (err) {
      setOverrideError(getApiErrorMessage(err, 'Failed to update verification status.'))
    }
  }

  const openPartnerModal = () => {
    setModalError('')
    setShowPartnerModal(true)
  }

  return (
    <AppShell activeNav="admin" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Administration"
          description="Register partner doctors and manage advisor verification."
          action={
            <button
              type="button"
              onClick={openPartnerModal}
              className={`${btnPrimary} text-sm py-3 px-6 flex items-center justify-center gap-2 w-full sm:w-auto`}
            >
              <MaterialIcon name="person_add" className="text-sm" />
              Register partner
            </button>
          }
        />

        {pageError && (
          <DashboardAlert variant="error" icon="error">
            {pageError}
          </DashboardAlert>
        )}

        {loading ? (
          <LoadingSpinner label="Loading admin data…" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            <DashboardSection
              title="Medical partners"
              badge={
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-xs">
                  {partners.length} registered
                </span>
              }
            >
              {partners.length === 0 ? (
                <EmptyState
                  icon="group"
                  title="No partner doctors yet"
                  description="Register a partner so they can verify advisor applicants."
                />
              ) : (
                <>
                  <div className="md:hidden divide-y divide-outline-variant/40">
                    {partners.map((p) => (
                      <div key={p.id} className="p-stack-lg">
                        <p className="font-bold">{p.username}</p>
                        <p className="text-sm text-on-surface-variant">{p.email}</p>
                        <p className="text-xs text-on-surface-variant mt-2">
                          Joined {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/50">
                          <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Partner</th>
                          <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partners.map((p) => (
                          <tr key={p.id} className="hover:bg-surface border-b border-outline-variant/30">
                            <td className="py-stack-sm px-stack-lg">
                              <div className="font-bold">{p.username}</div>
                              <div className="text-on-surface-variant text-xs">{p.email}</div>
                            </td>
                            <td className="py-stack-sm px-stack-lg text-on-surface-variant text-sm">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </DashboardSection>

            <DashboardSection title="Verification overrides">
              {overrideError && (
                <div className="px-margin-mobile md:px-stack-lg pt-stack-md">
                  <FormError>{overrideError}</FormError>
                </div>
              )}
              {applicants.length === 0 ? (
                <EmptyState icon="person_search" title="No advisors yet" description="Advisor applications will appear here." />
              ) : (
                <>
                  <div className="md:hidden divide-y divide-outline-variant/40">
                    {applicants.map((a) => (
                      <div key={a.id} className="p-stack-lg flex flex-col gap-stack-md">
                        <div>
                          <p className="font-bold">{a.username}</p>
                          <div className="mt-1">
                            <VerificationStatusPill status={a.verificationStatus} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOverride(a.id, 'verified')}
                            className={`${btnSuccess} flex-1 py-2.5 text-sm flex items-center justify-center gap-1`}
                          >
                            <MaterialIcon name="verified" className="text-[18px]" />
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOverride(a.id, 'rejected')}
                            className={`${btnDanger} flex-1 py-2.5 text-sm flex items-center justify-center gap-1`}
                          >
                            <MaterialIcon name="cancel" className="text-[18px]" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/50">
                          <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant">Advisor</th>
                          <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map((a) => (
                          <tr key={a.id} className="hover:bg-surface border-b border-outline-variant/30">
                            <td className="py-stack-sm px-stack-lg">
                              <div className="font-bold">{a.username}</div>
                              <div className="mt-1">
                                <VerificationStatusPill status={a.verificationStatus} />
                              </div>
                            </td>
                            <td className="py-stack-sm px-stack-lg">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOverride(a.id, 'verified')}
                                  className={btnIconSuccess}
                                  title="Force verify"
                                >
                                  <MaterialIcon name="verified" className="text-[20px]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOverride(a.id, 'rejected')}
                                  className={btnIconDanger}
                                  title="Force reject"
                                >
                                  <MaterialIcon name="cancel" className="text-[20px]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </DashboardSection>
          </div>
        )}

        {showPartnerModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-xl border border-outline-variant shadow-2xl my-auto">
              <div className="p-stack-lg">
                <h2 className="font-headline-md text-headline-md mb-stack-sm">Register partner doctor</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md">
                  Partner doctors review and verify advisor applicants via video interview.
                </p>
                <form onSubmit={handleRegisterPartner} className="flex flex-col gap-stack-md">
                  {modalError && <FormError>{modalError}</FormError>}
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-unit">Full name</label>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-unit">Email</label>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5"
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-unit">Password</label>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5"
                      type="password"
                      value={partnerPass}
                      onChange={(e) => setPartnerPass(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-stack-sm pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPartnerModal(false)
                        setModalError('')
                      }}
                      className={`${btnOutline} flex-1 py-3`}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={`${btnPrimary} flex-1 py-3`}>
                      Register
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  )
}
