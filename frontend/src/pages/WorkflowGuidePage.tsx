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
  accent: 'primary' | 'secondary' | 'tertiary'
  steps: string[]
  tip?: string
  highlight?: string
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    phase: '0',
    title: 'Admin — seed the platform',
    icon: 'admin_panel_settings',
    role: 'Admin',
    path: '/admin',
    accent: 'primary',
    steps: [
      'Log in with the demo admin account (credentials below).',
      'Admin → Register Partner to create a partner doctor account.',
      'Save the partner email and password — you need them in Phase 2.',
      'Optional shortcut: force-verify an advisor from Verification overrides.',
    ],
  },
  {
    phase: '1',
    title: 'Doctor applies & opens for interview',
    icon: 'medical_services',
    role: 'Advisor applicant',
    path: '/auth/advisor-apply',
    accent: 'secondary',
    highlight: 'Interview availability → Open',
    steps: [
      'Use a second browser or incognito window.',
      'Apply at Advisor Apply with name, email, password, and bio.',
      'Land on Advisor Hub with status “Under review”.',
      'Toggle Interview availability to Open (not Live dispatch — that unlocks after verification).',
      'Wait on Advisor Hub — partners only see you when the toggle is Open.',
    ],
  },
  {
    phase: '2',
    title: 'Partner verifies doctor (video)',
    icon: 'verified_user',
    role: 'Partner doctor',
    path: '/partner',
    accent: 'secondary',
    highlight: 'Open for interview → Accept dialog',
    steps: [
      'Log in as the partner doctor from Phase 0.',
      'Partner Portal lists all applicants; green Open for interview means ready.',
      'Start interview is enabled only when the applicant toggled Open.',
      'Doctor gets an accept modal on Advisor Hub (not a forced redirect).',
      'Partner enters the room and waits; doctor accepts → both join the call.',
      'Partner clicks Verify or Reject to complete the interview.',
    ],
    tip: 'Admin shortcut: force-verify from /admin without a video call.',
  },
  {
    phase: '3',
    title: 'Patient buys coins',
    icon: 'account_balance_wallet',
    role: 'Patient (client)',
    path: '/wallet',
    accent: 'primary',
    steps: [
      'Sign up as a patient on /auth (Looking for Care).',
      'Wallet → choose a coin bundle → Buy coins (sandbox payment).',
      'Confirm balance updates before booking a session.',
    ],
  },
  {
    phase: '4',
    title: 'Discover → live consultation',
    icon: 'videocam',
    role: 'Patient + verified advisor',
    path: '/discover',
    accent: 'tertiary',
    highlight: 'Live dispatch → Online',
    steps: [
      'Verified advisor: toggle Live dispatch to Online (wait for green Live in header).',
      'Patient: Discover → browse or search → Connect on an online advisor.',
      'Advisor accepts the incoming call → both enter the consultation room.',
      'End session — coins move from patient wallet to advisor earnings.',
    ],
    tip: 'Use 3 browser sessions (normal + 2 incognito) so each role stays logged in.',
  },
]

const ACCENT_STYLES = {
  primary: {
    ring: 'ring-primary/30',
    bg: 'bg-primary-container/20',
    text: 'text-primary',
    badge: 'bg-primary-container text-on-primary-container',
  },
  secondary: {
    ring: 'ring-secondary/30',
    bg: 'bg-secondary-container/20',
    text: 'text-secondary',
    badge: 'bg-secondary-container/30 text-on-secondary-container',
  },
  tertiary: {
    ring: 'ring-tertiary/30',
    bg: 'bg-tertiary-container/20',
    text: 'text-tertiary',
    badge: 'bg-tertiary-container/30 text-on-tertiary-container',
  },
} as const

function renderStepText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-on-surface font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3 text-on-surface-variant leading-relaxed">
          <span className="shrink-0 w-6 h-6 rounded-full bg-surface-container text-xs font-label-md flex items-center justify-center text-on-surface-variant mt-0.5">
            {index + 1}
          </span>
          <span className="font-body-md text-body-md min-w-0">{renderStepText(step)}</span>
        </li>
      ))}
    </ol>
  )
}

function TogglePreview({
  mode,
  title,
  subtitle,
  labelOn,
  labelOff,
  isOn,
  icon,
}: {
  mode: 'interview' | 'dispatch'
  title: string
  subtitle: string
  labelOn: string
  labelOff: string
  isOn: boolean
  icon: string
}) {
  return (
    <div
      className={`rounded-xl border p-stack-md flex flex-col gap-stack-sm ${
        mode === 'interview'
          ? 'border-secondary/30 bg-secondary-container/10'
          : 'border-primary/30 bg-primary-container/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            mode === 'interview' ? 'bg-secondary/15 text-secondary' : 'bg-primary/15 text-primary'
          }`}
        >
          <MaterialIcon name={icon} className="text-xl" />
        </span>
        <div className="min-w-0">
          <p className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant">{title}</p>
          <p className="text-sm text-on-surface mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-outline-variant/40">
        <span className={`text-sm font-label-md ${isOn ? 'text-secondary' : 'text-outline'}`}>
          {isOn ? labelOn : labelOff}
        </span>
        <div
          className={`relative w-14 h-7 rounded-full shrink-0 ${isOn ? 'bg-secondary' : 'bg-surface-variant'}`}
          aria-hidden
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              isOn ? 'left-8' : 'left-1'
            }`}
          />
        </div>
      </div>
    </div>
  )
}

function VerificationFlowVisual() {
  const nodes = [
    { icon: 'toggle_on', label: 'Doctor toggles Open', sub: 'Advisor Hub' },
    { icon: 'arrow_forward', label: '', sub: '' },
    { icon: 'groups', label: 'Partner sees queue', sub: 'Open for interview' },
    { icon: 'arrow_forward', label: '', sub: '' },
    { icon: 'videocam', label: 'Start interview', sub: 'Accept modal' },
    { icon: 'arrow_forward', label: '', sub: '' },
    { icon: 'verified', label: 'Video call', sub: 'Verify / Reject' },
  ]

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {nodes.map((node, i) =>
          node.icon === 'arrow_forward' ? (
            <MaterialIcon key={`arrow-${i}`} name="arrow_forward" className="text-outline shrink-0" />
          ) : (
            <div
              key={node.label}
              className="flex flex-col items-center text-center w-28 shrink-0 rounded-xl border border-outline-variant/60 bg-surface-container-low p-3"
            >
              <MaterialIcon name={node.icon} className="text-secondary text-2xl mb-1" />
              <p className="text-xs font-label-md text-on-surface leading-tight">{node.label}</p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">{node.sub}</p>
            </div>
          ),
        )}
      </div>
    </div>
  )
}

function GuideContent() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="flex flex-col gap-stack-lg">
      <DashboardAlert variant="info" icon="info" title="Hackathon demo">
        GreenHeart connects verified wellness advisors with patients using coins, semantic discovery, and in-app
        video. Follow the phases in order — use separate browser sessions for each role.
      </DashboardAlert>

      <DashboardSection title="Demo admin login">
        <div className="p-stack-lg grid gap-stack-md md:grid-cols-2">
          <div className="bg-surface-container-low rounded-xl p-stack-md border border-outline-variant/50 flex gap-3">
            <MaterialIcon name="mail" className="text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant mb-1">Email</p>
              <p className="font-mono text-sm text-on-background break-all">{DEMO_ADMIN_EMAIL}</p>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-stack-md border border-outline-variant/50 flex gap-3">
            <MaterialIcon name="key" className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant mb-1">Password</p>
              <p className="font-mono text-sm text-on-background">{DEMO_ADMIN_PASSWORD}</p>
            </div>
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
        title="Advisor Hub toggles — know the difference"
        badge={
          <span className="text-xs font-label-md text-secondary bg-secondary-container/25 px-3 py-1 rounded-full border border-secondary/20">
            New in verification flow
          </span>
        }
      >
        <div className="p-stack-lg flex flex-col gap-stack-lg">
          <p className="text-sm text-on-surface-variant max-w-3xl">
            The same toggle area on Advisor Hub changes meaning once the doctor is verified. During application review,
            it controls interview availability for partners. After approval, it becomes live dispatch for patient calls.
          </p>
          <div className="grid md:grid-cols-2 gap-gutter">
            <TogglePreview
              mode="interview"
              title="Interview availability"
              subtitle="Pending applicant — appear in partner queue when Open"
              labelOn="Open"
              labelOff="Closed"
              isOn={true}
              icon="verified_user"
            />
            <TogglePreview
              mode="dispatch"
              title="Live dispatch"
              subtitle="Verified advisor — appear on Discover when Online"
              labelOn="Online"
              labelOff="Offline"
              isOn={true}
              icon="sensors"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-gutter text-sm">
            <div className="flex gap-2 items-start rounded-lg bg-surface-container-low p-stack-sm border border-outline-variant/40">
              <span className="inline-flex items-center gap-1 text-secondary font-medium shrink-0">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Open for interview
              </span>
              <span className="text-on-surface-variant">Partner can start verification call</span>
            </div>
            <div className="flex gap-2 items-start rounded-lg bg-surface-container-low p-stack-sm border border-outline-variant/40">
              <span className="inline-flex items-center gap-1 text-on-surface-variant shrink-0">
                <span className="w-2 h-2 rounded-full bg-outline-variant" />
                Closed for interview
              </span>
              <span className="text-on-surface-variant">Listed in queue but Start interview disabled</span>
            </div>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection title="Verification call flow">
        <div className="p-stack-lg flex flex-col gap-stack-md">
          <VerificationFlowVisual />
          <div className="grid md:grid-cols-3 gap-gutter">
            {[
              {
                icon: 'notifications',
                title: 'Accept modal',
                body: 'Doctor stays on /advisor. A dialog appears — Accept & join or Decline. No forced redirect.',
              },
              {
                icon: 'hourglass_top',
                title: 'Partner waits in room',
                body: 'Partner enters the verification room first and sees a waiting overlay until the doctor accepts.',
              },
              {
                icon: 'thumb_up',
                title: 'Verify or reject',
                body: 'After the call, partner clicks Verify to approve the advisor or Reject to decline.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-outline-variant/50 p-stack-md bg-surface-bright/50"
              >
                <MaterialIcon name={card.icon} className="text-secondary mb-2" />
                <p className="font-label-md text-sm text-on-surface mb-1">{card.title}</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
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
          {WORKFLOW_STEPS.map((item) => {
            const accent = ACCENT_STYLES[item.accent]
            return (
              <article key={item.phase} className="p-stack-lg">
                <div className="flex flex-col xl:flex-row gap-stack-lg">
                  <div className={`xl:w-80 shrink-0 rounded-xl p-stack-md ring-1 ${accent.ring} ${accent.bg}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`w-11 h-11 rounded-full font-label-md flex items-center justify-center shrink-0 ${accent.badge}`}
                      >
                        {item.phase}
                      </span>
                      <div className="min-w-0">
                        <div className={`flex items-center gap-1.5 ${accent.text} mb-0.5`}>
                          <MaterialIcon name={item.icon} className="text-lg" />
                          <span className="font-label-md text-[10px] uppercase tracking-wider">{item.role}</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-on-surface leading-snug">{item.title}</h3>
                      </div>
                    </div>
                    {item.highlight && (
                      <p className="text-xs font-label-md text-on-surface-variant mb-2 flex items-center gap-1">
                        <MaterialIcon name="flag" className="text-sm text-secondary" />
                        Key: {item.highlight}
                      </p>
                    )}
                    {item.path && (
                      <Link
                        to={item.path}
                        className={`${btnOutline} text-xs py-2 px-3 inline-flex items-center gap-1.5 w-full justify-center`}
                      >
                        Open {item.path}
                        <MaterialIcon name="open_in_new" className="text-sm" />
                      </Link>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <StepList steps={item.steps} />
                    {item.tip && (
                      <div className="mt-stack-md flex gap-2 rounded-lg bg-primary-container/10 border border-primary/20 p-stack-sm">
                        <MaterialIcon name="lightbulb" className="text-secondary shrink-0 text-base mt-0.5" />
                        <p className="text-sm text-on-surface-variant">{item.tip}</p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </DashboardSection>

      <DashboardSection title="Browser setup tip">
        <div className="p-stack-lg">
          <div className="grid sm:grid-cols-3 gap-gutter">
            {[
              { window: 'Window 1', role: 'Admin + Partner', icon: 'desktop_windows', iconClass: 'text-primary' },
              { window: 'Window 2', role: 'Doctor applicant', icon: 'person', iconClass: 'text-secondary' },
              { window: 'Window 3', role: 'Patient', icon: 'explore', iconClass: 'text-tertiary' },
            ].map((w) => (
              <div
                key={w.window}
                className="rounded-xl border border-dashed border-outline-variant p-stack-md text-center"
              >
                <MaterialIcon name={w.icon} className={`${w.iconClass} text-3xl mb-2`} />
                <p className="font-label-md text-sm text-on-surface">{w.window}</p>
                <p className="text-xs text-on-surface-variant mt-1">{w.role}</p>
              </div>
            ))}
          </div>
        </div>
      </DashboardSection>

      <DashboardSection title="Role map">
        <div className="p-stack-lg grid sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[
            {
              role: 'Admin',
              path: '/admin',
              icon: 'admin_panel_settings',
              desc: 'Register partners, override verification',
            },
            {
              role: 'Partner doctor',
              path: '/partner',
              icon: 'verified_user',
              desc: 'Queue shows Open for interview — start verify call',
            },
            {
              role: 'Advisor',
              path: '/advisor',
              icon: 'medical_services',
              desc: 'Open for interview → then Live dispatch when verified',
            },
            {
              role: 'Patient',
              path: '/discover',
              icon: 'explore',
              desc: 'Discover advisors, wallet, consultations',
            },
          ].map((r) => (
            <Link
              key={r.role}
              to={r.path}
              className="group rounded-xl border border-outline-variant p-stack-md hover:border-primary/40 hover:bg-surface-container-low hover:shadow-sm transition-all"
            >
              <span className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center mb-3 group-hover:bg-primary-container/30 transition-colors">
                <MaterialIcon name={r.icon} className="text-primary" />
              </span>
              <p className="font-label-md font-bold text-on-surface">{r.role}</p>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{r.desc}</p>
              <span className="text-xs text-primary mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Go to {r.path}
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </span>
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
            description="Full hackathon walkthrough: admin setup, interview availability, partner verification, and live consultations."
            badge={
              <span className="inline-flex items-center gap-2 bg-secondary-container/25 border border-secondary/30 text-secondary px-3 py-1.5 rounded-lg font-label-md text-xs">
                <MaterialIcon name="menu_book" className="text-sm" />
                Updated verification flow
              </span>
            }
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
      <header className="border-b border-outline-variant bg-surface-container-lowest px-margin-mobile md:px-margin-desktop py-stack-md sticky top-0 z-30 backdrop-blur-md bg-surface-container-lowest/95">
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
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-container/15 via-surface-container-lowest to-secondary-container/10 p-stack-lg md:p-stack-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-stack-lg">
            <Logo className="w-16 h-16 hidden sm:block shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 text-xs font-label-md uppercase tracking-wider text-secondary mb-2">
                <MaterialIcon name="auto_stories" className="text-sm" />
                Demo guide
              </span>
              <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg">How to demo GreenHeart</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-stack-sm max-w-2xl">
                Interview availability, partner verification with accept dialog, then live patient consultations — step
                by step.
              </p>
            </div>
            <Link
              to="/auth"
              className={`${btnPrimary} text-sm py-3 px-6 inline-flex items-center justify-center gap-2 shrink-0`}
            >
              <MaterialIcon name="login" />
              Start with admin login
            </Link>
          </div>
        </div>
        <GuideContent />
      </main>
    </div>
  )
}
