import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdvisorCard, advisors } from '../components/AdvisorCard'
import { AppShell } from '../components/layout/AppShell'
import { MaterialIcon } from '../components/MaterialIcon'

const filters = ['Mental Health', 'Relationship', 'Burnout Care']

interface DiscoveryPageProps {
  aiPulse?: boolean
}

export function DiscoveryPage({ aiPulse = false }: DiscoveryPageProps) {
  const [activeFilter, setActiveFilter] = useState(filters[0])
  const navigate = useNavigate()

  return (
    <AppShell
      activeNav="discover"
      searchClassName={aiPulse ? 'ai-pulse-active' : ''}
      searchPlaceholder={aiPulse ? 'Describe your feelings...' : 'Describe what you are feeling inside...'}
    >
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <div className="relative md:hidden w-full">
          <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className={`w-full bg-surface-container-lowest border border-outline-variant rounded-full py-3 pl-12 pr-4 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm ${aiPulse ? 'ai-pulse-active' : ''}`}
            placeholder="Describe your feelings..."
            type="text"
          />
        </div>

        {aiPulse && (
          <section className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-stack-md flex items-center gap-stack-md">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <MaterialIcon name="psychology" className="text-on-primary-container" />
            </div>
            <div className="flex-grow">
              <h4 className="font-headline-md text-[18px] text-on-background">AI Pulse Active</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Green Heart AI analyzed your recent logs and prioritized advisors for holistic balance and burnout recovery.
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-vibrant-coral pulse-dot shrink-0" />
          </section>
        )}

        <section className="flex flex-col gap-stack-sm">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background">
            Discover Advisors
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Our AI has analyzed your recent logs and suggests connecting with specialists who focus on holistic balance
            and burnout recovery.
          </p>
        </section>

        <section className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md transition-colors border ${
                activeFilter === filter
                  ? 'bg-primary text-on-primary border-transparent'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-primary border-outline-variant'
              }`}
            >
              {filter}
            </button>
          ))}
          <button
            type="button"
            className="whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-primary font-label-md text-label-md transition-colors border border-outline-variant flex items-center gap-1"
          >
            <MaterialIcon name="tune" className="text-[18px]" />
            Filters
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {advisors.map((advisor) => (
            <AdvisorCard
              key={advisor.id}
              advisor={advisor}
              onConnect={() => navigate('/consultation')}
            />
          ))}
        </section>

        <section className="mt-8 bg-surface-container-low rounded-xl border border-outline-variant p-stack-md flex flex-col md:flex-row items-center gap-stack-md">
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <MaterialIcon name="psychology" className="text-on-primary-container" />
          </div>
          <div className="grow text-center md:text-left">
            <h4 className="font-headline-md text-[18px] text-on-background">Not sure who to choose?</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Let our Green Heart AI matching engine ask you a few quick questions to find your ideal professional fit.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/discover/ai')}
            className="bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Start Matching
          </button>
        </section>
      </main>
    </AppShell>
  )
}

export function DiscoveryAiPage() {
  return <DiscoveryPage aiPulse />
}
