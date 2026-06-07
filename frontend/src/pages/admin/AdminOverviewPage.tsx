import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardSection,
  LoadingSpinner,
  StatCard,
} from '../../components/layout/dashboard-ui'
import { MaterialIcon } from '../../components/MaterialIcon'
import { AdminSubNav } from '../../components/admin/AdminSubNav'
import { AdminPlatformStats } from '../../components/admin/AdminPlatformStats'
import { verificationService } from '../../api/verification.service'
import { getApiErrorMessage } from '../../utils/apiError'

export function AdminOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [partnerCount, setPartnerCount] = useState(0)
  const [advisorCounts, setAdvisorCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    Promise.all([verificationService.getPartners(), verificationService.getAdminAdvisors()])
      .then(([partnersData, advisorsData]) => {
        setPartnerCount(partnersData.partners.length)
        const counts: Record<string, number> = { all: advisorsData.applicants.length }
        for (const a of advisorsData.applicants) {
          counts[a.verificationStatus] = (counts[a.verificationStatus] ?? 0) + 1
        }
        setAdvisorCounts(counts)
        setError('')
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load dashboard data.')))
      .finally(() => setLoading(false))
  }, [])

  const pendingApplicants = advisorCounts.pending_review ?? 0
  const verifiedAdvisors = advisorCounts.verified ?? 0

  const quickLinks = useMemo(
    () => [
      {
        to: '/admin/partners',
        icon: 'verified_user',
        label: 'Manage partners',
        hint: `${partnerCount} registered`,
      },
      {
        to: '/admin/advisors',
        icon: 'medical_services',
        label: 'Advisor registry',
        hint: `${pendingApplicants} pending review`,
      },
      {
        to: '/workflow',
        icon: 'menu_book',
        label: 'Demo workflow guide',
        hint: 'Hackathon walkthrough',
      },
    ],
    [partnerCount, pendingApplicants],
  )

  return (
    <AppShell activeNav="admin-overview" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Platform overview"
          description="Marketplace revenue, verification queue, and quick admin actions."
        />

        <AdminSubNav />

        {error && (
          <p className="text-sm text-error bg-error-container/20 border border-error/20 rounded-xl px-stack-lg py-stack-md">
            {error}
          </p>
        )}

        <AdminPlatformStats />

        {loading ? (
          <LoadingSpinner label="Loading operational stats…" />
        ) : (
          <div className="grid sm:grid-cols-3 gap-stack-md">
            <StatCard
              icon="group"
              label="Partner doctors"
              value={partnerCount.toLocaleString()}
              hint="Authorized to run verification interviews"
              accent="primary"
            />
            <StatCard
              icon="hourglass_top"
              label="Pending applicants"
              value={pendingApplicants.toLocaleString()}
              hint="Awaiting partner verification"
              accent="tertiary"
            />
            <StatCard
              icon="verified"
              label="Verified advisors"
              value={verifiedAdvisors.toLocaleString()}
              hint="Visible on Discover when online"
              accent="secondary"
            />
          </div>
        )}

        <DashboardSection title="Quick actions">
          <div className="grid sm:grid-cols-3 gap-stack-md">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg hover:border-primary/30 hover:shadow-ambient transition-all flex flex-col gap-2"
              >
                <MaterialIcon name={link.icon} className="text-primary text-2xl" />
                <span className="font-label-md text-on-surface">{link.label}</span>
                <span className="text-xs text-on-surface-variant">{link.hint}</span>
              </Link>
            ))}
          </div>
        </DashboardSection>
      </main>
    </AppShell>
  )
}
