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
    path: '/admin/overview',
    accent: 'primary',
    steps: [
      'Log in with the demo admin account (credentials below).',
      'Open **Admin → Overview** — see platform revenue, partner count, and pending applicants.',
      'Go to **Partners → Add partner doctor** and save the login you will use in Phase 2.',
      'Optional shortcut: **Advisors → Verify / Reject** to skip the partner video interview.',
    ],
    tip: 'Overview refreshes marketplace stats (coins earned from advisor withdrawal fees).',
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
      'Complete the 5-step apply wizard (progress auto-saves if you leave and return).',
      'Land on Advisor Hub with **Application submitted** and status “Under review”.',
      'Toggle **Interview availability** to Open (Live dispatch unlocks only after verification).',
      'Stay on Advisor Hub — partners only see **Open for interview** when this toggle is on.',
    ],
  },
  {
    phase: '2',
    title: 'Partner verifies doctor (video)',
    icon: 'verified_user',
    role: 'Partner doctor',
    path: '/partner',
    accent: 'secondary',
    highlight: 'Review application → Accept → Enter room',
    steps: [
      'Log in as the partner doctor created in Phase 0.',
      'Partner Portal lists pending applicants — green **Open for interview** means ready.',
      'Tap **Review application** to read the full credential profile before interviewing.',
      'On the profile page, **Start verification interview** — the doctor gets an accept modal on Advisor Hub.',
      'After the doctor accepts, tap **Enter verification room** (not before accept).',
      'Partner clicks **Verify** or **Reject** in the call to complete the interview.',
    ],
    tip: 'Admin shortcut: force-verify from **Admin → Advisors** without a video call.',
  },
  {
    phase: '3',
    title: 'Patient buys coins',
    icon: 'account_balance_wallet',
    role: 'Patient (client)',
    path: '/wallet',
    accent: 'primary',
    steps: [
      'Sign up as a patient on /auth (**Looking for Care**).',
      'Wallet → choose a coin bundle → **Buy demo coins** (sandbox payment).',
      'Confirm balance updates — you need enough coins for the advisor’s session rate.',
      'Use **Find an advisor** after purchase to go straight to Discover.',
    ],
  },
  {
    phase: '4',
    title: 'Discover → live consultation',
    icon: 'videocam',
    role: 'Patient + verified advisor',
    path: '/discover',
    accent: 'tertiary',
    highlight: 'Escrow → Accept → Review',
    steps: [
      'Verified advisor: toggle **Live dispatch** to Online (green Live in header).',
      'Patient: **Discover** or **/discover/ai** → Connect on an online advisor (guests sign in and return to connect).',
      'Patient lands on the **waiting screen** — coins move to escrow while the advisor’s incoming call rings.',
      'While waiting: **Cancel request** refunds escrow; **View wallet balance** keeps the call active; **Browse other advisors** warns that escrow stays locked.',
      'Advisor **Accept & join** on the incoming call page → both enter the consultation room.',
      'If the patient cancels or the advisor declines, the incoming call dismisses and escrow returns to the patient.',
      'End session — escrow releases to the advisor’s withdrawable earnings.',
      'Patient optional star review at end; history lives under **Reviews** (/reviews).',
    ],
    tip: 'Advisor Hub → **Withdraw earnings** (demo payout). Admin Overview shows the platform fee retained.',
  },
]

interface WaitingActionRow {
  action: string
  patient: string
  advisor: string
  icon: string
}

const WAITING_ROOM_ACTIONS: WaitingActionRow[] = [
  {
    action: 'Cancel request',
    icon: 'cancel',
    patient:
      'Confirm dialog → escrow refunded immediately → redirected to Discover. Session status becomes cancelled.',
    advisor:
      'Incoming call screen closes automatically (“client cancelled”) → returns to Advisor Hub after a moment.',
  },
  {
    action: 'View wallet balance',
    icon: 'account_balance_wallet',
    patient:
      'Opens Wallet — escrow stays locked; request keeps ringing. Banner links **Return to waiting screen**.',
    advisor:
      'No change — still sees the incoming call until accept, decline, or patient cancels.',
  },
  {
    action: 'Browse other advisors',
    icon: 'explore',
    patient:
      'Confirm dialog explains the active request stays open → can open Discover while coins remain in escrow.',
    advisor:
      'No change — incoming call keeps ringing. Patient can connect with another advisor only if they have enough non-escrow coins.',
  },
  {
    action: 'Advisor declines',
    icon: 'call_end',
    patient:
      'Waiting screen shows refund message → **Back to Discover**. Escrow returned to wallet.',
    advisor:
      'Confirm decline → coins refunded to client → returns to Advisor Hub.',
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

function FlowVisual({
  nodes,
}: {
  nodes: { icon: string; label: string; sub: string; arrow?: boolean }[]
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {nodes.map((node, i) =>
          node.arrow ? (
            <MaterialIcon key={`arrow-${i}`} name="arrow_forward" className="text-outline shrink-0" />
          ) : (
            <div
              key={`${node.label}-${i}`}
              className="flex flex-col items-center text-center w-24 sm:w-28 shrink-0 rounded-xl border border-outline-variant/60 bg-surface-container-low p-3"
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

function VerificationFlowVisual() {
  return (
    <FlowVisual
      nodes={[
        { icon: 'toggle_on', label: 'Doctor Open', sub: 'Advisor Hub' },
        { icon: 'arrow_forward', label: '', sub: '', arrow: true },
        { icon: 'groups', label: 'Partner queue', sub: 'Open badge' },
        { icon: 'arrow_forward', label: '', sub: '', arrow: true },
        { icon: 'description', label: 'Review app', sub: 'Full profile' },
        { icon: 'arrow_forward', label: '', sub: '', arrow: true },
        { icon: 'mail', label: 'Start invite', sub: 'Doctor accepts' },
        { icon: 'arrow_forward', label: '', sub: '', arrow: true },
        { icon: 'verified', label: 'Verify call', sub: 'Verify / Reject' },
      ]}
    />
  )
}

function ConsultationFlowVisual() {
  return (
    <FlowVisual
      nodes={[
        { icon: 'explore', label: 'Connect', sub: 'Discover / AI' },
        { icon: 'arrow_forward', label: '', sub: '', arrow: true },
        { icon: 'lock', label: 'Waiting', sub: 'Escrow held' },
        { icon: 'arrow_forward', label: '', sub: '', arrow: true },
        { icon: 'call', label: 'Advisor accepts', sub: 'Incoming call' },
        { icon: 'arrow_forward', label: '', sub: '', arrow: true },
        { icon: 'videocam', label: 'Consultation', sub: 'Live session' },
        { icon: 'arrow_forward', label: '', sub: '', arrow: true },
        { icon: 'rate_review', label: 'Review', sub: '/reviews' },
      ]}
    />
  )
}

function WaitingRoomActionsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm border-collapse">
        <thead>
          <tr className="border-b border-outline-variant/60 text-left">
            <th className="py-3 pr-4 font-label-md text-on-surface-variant w-[28%]">Action</th>
            <th className="py-3 pr-4 font-label-md text-on-surface-variant w-[36%]">Patient (waiting screen)</th>
            <th className="py-3 font-label-md text-on-surface-variant w-[36%]">Advisor (incoming call)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/40">
          {WAITING_ROOM_ACTIONS.map((row) => (
            <tr key={row.action} className="align-top">
              <td className="py-stack-md pr-4">
                <span className="inline-flex items-center gap-2 font-label-md text-on-surface">
                  <MaterialIcon name={row.icon} className="text-primary text-lg shrink-0" />
                  {row.action}
                </span>
              </td>
              <td className="py-stack-md pr-4 text-on-surface-variant leading-relaxed">{row.patient}</td>
              <td className="py-stack-md text-on-surface-variant leading-relaxed">{row.advisor}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
            <Link to="/admin/overview" className={`${btnPrimary} text-sm py-2.5 px-5 inline-flex items-center gap-2`}>
              <MaterialIcon name="dashboard" className="text-sm" />
              Open admin overview
            </Link>
          )}
        </div>
      </DashboardSection>

      <DashboardSection
        title="Advisor Hub toggles — know the difference"
        badge={
          <span className="text-xs font-label-md text-secondary bg-secondary-container/25 px-3 py-1 rounded-full border border-secondary/20">
            Pending vs verified
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
              <span className="text-on-surface-variant">
                Partner can <strong className="text-on-surface">Review application</strong> and start interview
              </span>
            </div>
            <div className="flex gap-2 items-start rounded-lg bg-surface-container-low p-stack-sm border border-outline-variant/40">
              <span className="inline-flex items-center gap-1 text-on-surface-variant shrink-0">
                <span className="w-2 h-2 rounded-full bg-outline-variant" />
                Closed for interview
              </span>
              <span className="text-on-surface-variant">Still in queue — start interview disabled until Open</span>
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
                icon: 'description',
                title: 'Review application',
                body: 'Partner opens the full applicant profile before sending a verification invite — no blind interviews.',
              },
              {
                icon: 'notifications',
                title: 'Accept modal',
                body: 'Doctor stays on /advisor. A dialog appears — Accept & join or Decline. Enter room only after accept.',
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

      <DashboardSection title="Patient consultation flow">
        <div className="p-stack-lg flex flex-col gap-stack-md">
          <ConsultationFlowVisual />
          <div className="grid md:grid-cols-3 gap-gutter">
            {[
              {
                icon: 'lock',
                title: 'Escrow on Connect',
                body: 'Session coins move from wallet to escrow on the waiting page. Cancel or advisor decline refunds escrow before the call starts.',
              },
              {
                icon: 'call',
                title: 'Incoming consultation',
                body: 'Advisor gets a calm incoming-call screen — Accept & join or Decline (client coins refunded). Patient cancel dismisses the call on the advisor side.',
              },
              {
                icon: 'payments',
                title: 'Earnings & platform fee',
                body: 'Completed sessions credit the advisor. Demo withdraw on Advisor Hub; Admin Overview tracks platform fee coins.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-outline-variant/50 p-stack-md bg-surface-bright/50"
              >
                <MaterialIcon name={card.icon} className="text-primary mb-2" />
                <p className="font-label-md text-sm text-on-surface mb-1">{card.title}</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Waiting room — what each button does"
        badge={
          <span className="text-xs font-label-md text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
            Patient + advisor
          </span>
        }
      >
        <div className="p-stack-lg flex flex-col gap-stack-md">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            After Connect, the patient waits at <code className="text-xs bg-surface-container px-1.5 py-0.5 rounded">/waiting</code>{' '}
            while the advisor is routed to the incoming call screen. Leaving the waiting page without cancelling does{' '}
            <strong className="text-on-surface font-semibold">not</strong> stop the ring — only{' '}
            <strong className="text-on-surface font-semibold">Cancel request</strong> ends the session and frees escrow.
          </p>
          <WaitingRoomActionsTable />
          <DashboardAlert variant="warning" icon="info" title="Demo tip">
            If the patient browses Discover while a request is still ringing, connecting with another advisor requires
            enough coins beyond what is already in escrow. Cancel the first request first for a clean demo.
          </DashboardAlert>
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
        <div className="p-stack-lg flex flex-col gap-stack-md">
          <p className="text-sm text-on-surface-variant">
            Use three separate browser sessions (normal window + two incognito profiles) so admin/partner, advisor, and
            patient stay logged in at once.
          </p>
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
              path: '/admin/overview',
              icon: 'dashboard',
              desc: 'Platform revenue, partners, advisor registry, verification overrides',
            },
            {
              role: 'Partner doctor',
              path: '/partner',
              icon: 'verified_user',
              desc: 'Review applications, then verify via video when applicant is Open',
            },
            {
              role: 'Advisor',
              path: '/advisor',
              icon: 'medical_services',
              desc: 'Open for interview → Live dispatch → earnings & demo withdraw',
            },
            {
              role: 'Patient',
              path: '/discover',
              icon: 'explore',
              desc: 'Discover, AI match, wallet, consultations, reviews (/reviews)',
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
            description="Full hackathon walkthrough: admin overview, partner review & verification, escrow consultations, and reviews."
            badge={
              <span className="inline-flex items-center gap-2 bg-secondary-container/25 border border-secondary/30 text-secondary px-3 py-1.5 rounded-lg font-label-md text-xs">
                <MaterialIcon name="menu_book" className="text-sm" />
                Matches current app
              </span>
            }
            action={
              <Link
                to="/admin/overview"
                className={`${btnOutline} text-sm py-3 px-5 inline-flex items-center gap-2 w-full sm:w-auto justify-center`}
              >
                Skip to admin overview
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
                Admin overview, partner application review, verification interviews, escrow consultations, optional
                reviews, and advisor demo payouts — step by step.
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
