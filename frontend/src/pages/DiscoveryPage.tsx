import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdvisorCard } from '../components/AdvisorCard'
import { AppShell } from '../components/layout/AppShell'
import { appShellMainClass } from '../components/layout/dashboard-ui'
import { MaterialIcon } from '../components/MaterialIcon'
import { userService } from '../api/user.service'
import { searchService } from '../api/search.service'
import { sessionService } from '../api/session.service'
import { useAuth } from '../context/AuthContext'
import type { Advisor } from '../components/AdvisorCard'

const filters = ['Mental Health', 'Relationship', 'Burnout Care']

interface DiscoveryPageProps {
  aiPulse?: boolean
}

export function DiscoveryPage({ aiPulse = false }: DiscoveryPageProps) {
  const [activeFilter, setActiveFilter] = useState(filters[0])
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [connectError, setConnectError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchAdvisors = useCallback(async (query?: string) => {
    setLoading(true)
    try {
      if (query) {
        const data = await searchService.semanticSearch({ query })
        setAdvisors(data.results.map((r: any) => ({ ...r, featured: r.matchScore > 0.8 })))
      } else {
        const data = await userService.getAdvisors()
        setAdvisors(data.advisors)
      }
    } catch (err) {
      console.error('Failed to fetch advisors', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdvisors()
  }, [fetchAdvisors])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    fetchAdvisors(query)
  }

  const handleConnect = async (advisorId: string) => {
    if (!user || user.role !== 'client') {
      navigate('/auth')
      return
    }
    setConnectError('')
    try {
      const data = await sessionService.initiateSession({ advisorId })
      navigate(`/waiting?sessionId=${data.sessionId}`)
    } catch (err: any) {
      const code = err.response?.data?.error?.code as string | undefined
      const message = err.response?.data?.error?.message as string | undefined
      if (code === 'INSUFFICIENT_FUNDS') {
        setConnectError('Insufficient coins — add funds in your wallet first.')
      } else if (code === 'ADVISOR_OFFLINE') {
        setConnectError('This advisor is offline. Try another advisor or check back later.')
      } else if (code === 'ADVISOR_NOT_VERIFIED') {
        setConnectError('This advisor is not verified yet.')
      } else {
        setConnectError(message || 'Could not start session. Please try again.')
      }
    }
  }

  return (
    <AppShell
      activeNav="discover"
      searchClassName={aiPulse || searchQuery ? 'ai-pulse-active' : ''}
      searchPlaceholder={aiPulse ? 'Describe your feelings...' : 'Describe what you are feeling inside...'}
      onSearch={handleSearch}
    >
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <div className="relative md:hidden w-full">
          <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className={`w-full bg-surface-container-lowest border border-outline-variant rounded-full py-3 pl-12 pr-4 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm ${aiPulse || searchQuery ? 'ai-pulse-active' : ''}`}
            placeholder="Describe your feelings..."
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch((e.target as HTMLInputElement).value)
              }
            }}
          />
        </div>

        {(aiPulse || searchQuery) && (
          <section className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-stack-md flex items-center gap-stack-md">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <MaterialIcon name="psychology" className="text-on-primary-container" />
            </div>
            <div className="flex-grow">
              <h4 className="font-headline-md text-[18px] text-on-background">
                {searchQuery ? 'Semantic Search Active' : 'AI Pulse Active'}
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {searchQuery 
                  ? `AI found ${advisors.length} advisors matching your query: "${searchQuery}"`
                  : 'Green Heart AI analyzed your recent logs and prioritized advisors for holistic balance and burnout recovery.'
                }
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-vibrant-coral pulse-dot shrink-0" />
          </section>
        )}

        <section className="flex flex-col gap-stack-sm">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background">
            {searchQuery ? 'Search Results' : 'Discover Advisors'}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            {searchQuery 
              ? `Showing specialized advisors who can help with "${searchQuery}".`
              : 'Our AI has analyzed your recent logs and suggests connecting with specialists who focus on holistic balance and burnout recovery.'
            }
          </p>
        </section>

        {connectError && (
          <div className="bg-error-container/20 border border-error text-on-error-container p-stack-md rounded-lg flex items-center gap-stack-sm">
            <MaterialIcon name="error" filled className="text-error shrink-0" />
            <p className="font-body-md text-body-md">{connectError}</p>
          </div>
        )}

        <section className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter)
                handleSearch(filter)
              }}
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
            onClick={() => handleSearch(activeFilter)}
            className="whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-primary font-label-md text-label-md transition-colors border border-outline-variant flex items-center gap-1"
            title="Re-apply current filters"
          >
            <MaterialIcon name="tune" className="text-[18px]" />
            Filters
          </button>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {advisors.map((advisor) => (
              <AdvisorCard
                key={advisor.id}
                advisor={advisor}
                onConnect={() => handleConnect(advisor.id)}
                onViewProfile={() => navigate(`/advisors/${advisor.id}`)}
              />
            ))}
            {advisors.length === 0 && (
              <div className="col-span-full text-center py-20 text-on-surface-variant">
                No advisors found. Try a different search query.
              </div>
            )}
          </section>
        )}

        <section className="mt-8 mb-2 bg-surface-container-low rounded-xl border border-outline-variant p-stack-md flex flex-col md:flex-row items-center gap-stack-md">
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
