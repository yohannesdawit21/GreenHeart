import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardAlert,
  DashboardHeader,
  DashboardSection,
} from '../components/layout/dashboard-ui'
import { btnOutline, btnPrimary } from '../components/layout/buttonStyles'
import { BrandLockup, Logo } from '../components/Logo'
import { MaterialIcon } from '../components/MaterialIcon'
import { useAuth } from '../context/AuthContext'
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../constants/demoAccess'

interface WorkflowStep {
  phase: string
  title: string
  icon: string
  role: string
  path?: string
  steps: string[]
  tip?: string
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    phase: '0',
    title: 'Admin — seed the platform',
    icon: 'admin_panel_settings',
    role: 'Admin',
    path: '/admin',
    steps: [
      'Log in with the demo admin account (see credentials above).',
      'Open Admin → Register Partner to create a partner doctor account.',
      'Save the partner email & password — you will use them in Phase 2.',
      'Optional: force-verify an advisor from Verification overrides (✓ icon).',
    ],
  },
  {
    phase: '1',
    title: 'Doctor applies',
    icon: 'medical_services',
    role: 'Advisor applicant',
    path: '/auth/advisor-apply',
    steps: [
      'Use a second browser / incognito window.',
      'Go to Advisor Apply and submit name, email, password, and bio.',
      'Land on Advisor Hub with “Under review” — online toggle stays off.',
    ],
  },
  {
    phase: '2',
    title: 'Partner verifies doctor (video)',
    icon: 'verified_user',
    role: 'Partner doctor',
    path: '/partner',
    steps: [
      'Log in as the partner doctor you registered in Phase 0.',
      'Open Partner Portal → Start Interview on the applicant.',
      'Share the verification room URL with the doctor applicant.',
      'Partner joins the call and clicks Verify or Reject.',
    ],
    tip: 'Shortcut: Admin can force-verify from /admin without a video call.',
  },
  {
    phase: '3',
    title: 'Patient buys coins',
    icon: 'account_balance_wallet',
    role: 'Patient (client)',
    path: '/wallet',
    steps: [
      'Sign up as a patient on /auth (Looking for Care).',
      'Open Wallet → choose a coin bundle → Buy coins (sandbox).',
      'Confirm balance updates before booking a session.',
    ],
  },
  {
    phase: '4',
    title: 'Discover → live consultation',
    icon: 'videocam',
    role: 'Patient + verified advisor',
    path: '/discover',
    steps: [
      'Advisor: go Online on Advisor Hub (wait for green Live indicator).',
      'Patient: Discover → search or browse → Connect on an online advisor.',
      'Advisor accepts the incoming call → both enter the consultation room.',
      'End session — coins move from patient wallet to advisor earnings.',
    ],
    tip: 'Use 3 separate browser sessions (normal + 2 incognito) so roles stay logged in.',
  },
]

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="list-decimal list-inside space-y-2 font-body-md text-body-md text-on-surface-variant">
      {steps.map((step) => (
        <li key={step} className="leading-relaxed">
          {step}
        </li>
      ))}
    </ol>
  )
}

function GuideContent() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="flex flex-col gap-stack-lg">
      <DashboardAlert variant="info" icon="info" title="Hackathon demo">
        GreenHeart connects verified wellness advisors with patients using coins, semantic discovery, and
        in-app video. Follow the phases below in order — each role has its own dashboard.
      </DashboardAlert>

      <DashboardSection title="Demo admin login">
        <div className="p-stack-lg grid gap-stack-md md:grid-cols-2">
          <div className="bg-surface-container-low rounded-xl p-stack-md border border-outline-variant/50">
            <p className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant mb-2">Email</p>
            <p className="font-mono text-sm text-on-background break-all">{DEMO_ADMIN_EMAIL}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-stack-md border border-outline-variant/50">
            <p className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant mb-2">Password</p>
            <p className="font-mono text-sm text-on-background">{DEMO_ADMIN_PASSWORD}</p>
          </div>
        </div>
        <div className="px-stack-lg pb-stack-lg flex flex-wrap gap-stack-sm">
          {!isAdmin && (
            <Link to="/auth" className={`${btnPrimary} text-sm py-2.5 px-5 inline-flex items-center gap-2`}>
              <MaterialIcon name="login" className="text-sm" />
              Log in as admin
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={`${btnPrimary} text-sm py-2.5 px-5 inline-flex items-center gap-2`}>
              <MaterialIcon name="admin_panel_settings" className="text-sm" />
              Open admin dashboard
            </Link>
          )}
        </div>
      </DashboardSection>

      <DashboardSection
        title="End-to-end workflow"
        badge={
          <span className="text-xs font-label-md text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
            5 phases
          </span>
        }
      >
        <div className="divide-y divide-outline-variant/40">
          {WORKFLOW_STEPS.map((item) => (
            <article key={item.phase} className="p-stack-lg flex flex-col lg:flex-row gap-stack-md">
              <div className="flex items-start gap-stack-md lg:w-72 shrink-0">
                <span className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-label-md flex items-center justify-center shrink-0">
                  {item.phase}
                </span>
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <MaterialIcon name={item.icon} className="text-lg" />
                    <span className="font-label-md text-xs uppercase tracking-wider">{item.role}</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">{item.title}</h3>
                  {item.path && (
                    <Link to={item.path} className="text-sm text-primary hover:underline mt-1 inline-block">
                      {item.path} →
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <StepList steps={item.steps} />
                {item.tip && (
                  <p className="mt-stack-sm text-sm text-on-surface-variant italic flex gap-2">
                    <MaterialIcon name="lightbulb" className="text-secondary shrink-0 text-base" />
                    {item.tip}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Role map">
        <div className="p-stack-lg grid sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[
            { role: 'Admin', path: '/admin', icon: 'admin_panel_settings', desc: 'Register partners, override verification' },
            { role: 'Partner doctor', path: '/partner', icon: 'verified_user', desc: 'Video-verify advisor applicants' },
            { role: 'Advisor', path: '/advisor', icon: 'medical_services', desc: 'Go online, accept patient calls' },
            { role: 'Patient', path: '/discover', icon: 'explore', desc: 'Discover advisors, wallet, consultations' },
          ].map((r) => (
            <Link
              key={r.role}
              to={r.path}
              className="rounded-xl border border-outline-variant p-stack-md hover:border-primary/40 hover:bg-surface-container-low transition-colors"
            >
              <MaterialIcon name={r.icon} className="text-primary mb-2" />
              <p className="font-label-md font-bold text-on-surface">{r.role}</p>
              <p className="text-sm text-on-surface-variant mt-1">{r.desc}</p>
            </Link>
          ))}
        </div>
      </DashboardSection>
    </div>
  )
}

export function WorkflowGuidePage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  if (isAdmin) {
    return (
      <AppShell activeNav="guide" showSearch={false}>
        <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
          <DashboardHeader
            title="Demo workflow guide"
            description="Follow these steps to run the full GreenHeart hackathon demo from admin setup through live consultation."
            action={
              <Link
                to="/admin"
                className={`${btnOutline} text-sm py-3 px-5 inline-flex items-center gap-2 w-full sm:w-auto justify-center`}
              >
                Skip to admin
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </Link>
            }
          />
          <GuideContent />
        </main>
      </AppShell>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      <header className="border-b border-outline-variant bg-surface-container-lowest px-margin-mobile md:px-margin-desktop py-stack-md">
        <div className="max-w-container-max mx-auto flex flex-wrap items-center justify-between gap-stack-md">
          <Link to="/discover">
            <BrandLockup subtitle="Hackathon demo guide" />
          </Link>
          <div className="flex gap-2">
            <Link to="/auth" className={`${btnPrimary} text-sm py-2.5 px-5 inline-flex items-center gap-2`}>
              <MaterialIcon name="login" className="text-sm" />
              Log in
            </Link>
            <Link to="/discover" className={`${btnOutline} text-sm py-2.5 px-5`}>
              Browse as guest
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <div className="flex items-center gap-stack-md">
          <Logo className="w-14 h-14 hidden sm:block" />
          <div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg">How to demo GreenHeart</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-stack-sm max-w-2xl">
              Start with the admin account below, then walk through each phase with separate browser sessions.
            </p>
          </div>
        </div>
        <GuideContent />
        <p className="text-center text-sm text-on-surface-variant pb-stack-lg">
          <Link to="/auth" className="text-primary hover:underline">
            Ready? Log in as admin →
          </Link>
        </p>
      </main>
    </div>
  )
}
