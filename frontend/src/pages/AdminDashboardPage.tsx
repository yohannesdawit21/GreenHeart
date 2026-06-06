import { useState, useEffect } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { MaterialIcon } from '../components/MaterialIcon'
import { verificationService } from '../api/verification.service'
import type { PartnerDoctorDto, ApplicantDto } from '@shared/contracts/verification.api'

export function AdminDashboardPage() {
  const [partners, setPartners] = useState<PartnerDoctorDto[]>([])
  const [applicants, setApplicants] = useState<ApplicantDto[]>([])
  const [_loading, setLoading] = useState(true)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  
  // Partner registration form
  const [partnerEmail, setPartnerEmail] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [partnerPass, setPartnerPass] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, aData] = await Promise.all([
          verificationService.getPartners(),
          verificationService.getApplicants()
        ])
        setPartners(pData.partners)
        setApplicants(aData.applicants)
      } catch (err) {
        console.error('Failed to fetch admin data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await verificationService.registerPartner({
        email: partnerEmail,
        username: partnerName,
        password: partnerPass
      })
      const pData = await verificationService.getPartners()
      setPartners(pData.partners)
      setShowPartnerModal(false)
      setPartnerEmail('')
      setPartnerName('')
      setPartnerPass('')
    } catch (err) {
      console.error('Failed to register partner', err)
    }
  }

  const handleOverride = async (applicantId: string, status: any) => {
    try {
      await verificationService.overrideStatus(applicantId, { status })
      const aData = await verificationService.getApplicants()
      setApplicants(aData.applicants)
    } catch (err) {
      console.error('Failed to override status', err)
    }
  }

  return (
    <AppShell activeNav="advisor" showSearch={false}>
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background">System Administration</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Platform-wide governance and partner management.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPartnerModal(true)}
            className="bg-primary text-on-primary font-label-md text-xs py-3 px-6 rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2"
          >
            <MaterialIcon name="person_add" className="text-sm" />
            REGISTER PARTNER
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Medical Partners Section */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-stack-lg py-stack-md border-b border-outline-variant bg-surface-bright flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">Medical Partners</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Partner</th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Registered</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {partners.map(p => (
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
          </section>

          {/* Verification Overrides Section */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-stack-lg py-stack-md border-b border-outline-variant bg-surface-bright flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">Verification Overrides</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant">Applicant</th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-label-md text-on-surface-variant text-right">Status / Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {applicants.map(a => (
                    <tr key={a.id} className="hover:bg-surface border-b border-outline-variant/30">
                      <td className="py-stack-sm px-stack-lg">
                        <div className="font-bold">{a.username}</div>
                        <div className="text-on-surface-variant text-xs">{a.verificationStatus}</div>
                      </td>
                      <td className="py-stack-sm px-stack-lg text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleOverride(a.id, 'verified')}
                            className="p-1 hover:bg-secondary/10 text-secondary rounded transition-colors"
                            title="Force Verify"
                          >
                            <MaterialIcon name="verified" className="text-[18px]" />
                          </button>
                          <button
                            onClick={() => handleOverride(a.id, 'rejected')}
                            className="p-1 hover:bg-error/10 text-error rounded transition-colors"
                            title="Force Reject"
                          >
                            <MaterialIcon name="cancel" className="text-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Register Partner Modal (Simple Overlay) */}
        {showPartnerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-xl border border-outline-variant shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-stack-lg">
                <h2 className="font-display-md text-display-md mb-stack-sm">Register Partner Doctor</h2>
                <form onSubmit={handleRegisterPartner} className="flex flex-col gap-stack-md">
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-unit">Full Name</label>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2"
                      value={partnerName}
                      onChange={e => setPartnerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-unit">Email</label>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2"
                      type="email"
                      value={partnerEmail}
                      onChange={e => setPartnerEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-unit">Password</label>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2"
                      type="password"
                      value={partnerPass}
                      onChange={e => setPartnerPass(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-stack-sm mt-4">
                    <button
                      type="button"
                      onClick={() => setShowPartnerModal(false)}
                      className="flex-1 py-3 border border-outline-variant rounded-lg font-label-md"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-label-md"
                    >
                      REGISTER
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
