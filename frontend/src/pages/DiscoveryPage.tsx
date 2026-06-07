import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdvisorCard } from '../components/AdvisorCard'
import { AppShell } from '../components/layout/AppShell'
import { appShellMainClass, DashboardAlert, DashboardHeader, LoadingSpinner } from '../components/layout/dashboard-ui'
import { btnFilter, btnGhost, btnPrimary } from '../components/layout/buttonStyles'
import { MaterialIcon } from '../components/MaterialIcon'
import { userService } from '../api/user.service'
import { searchService } from '../api/search.service'
import { sessionService } from '../api/session.service'
import { useAuth } from '../context/AuthContext'
import { getApiErrorCode, getApiErrorMessage } from '../utils/apiError'
import {
  DISCOVER_ALL_FILTER,
  DISCOVER_FILTER_CHIPS,
  filterAdvisors,
  sortAdvisorsForDiscover,
  type DiscoverAdvisor,
  type DiscoverFilterId,
} from '@shared/advisor/discoverUtils'
import type { Advisor } from '../components/AdvisorCard'

interface DiscoveryPageProps {
  aiPulse?: boolean
}

const QUICK_FILTERS = DISCOVER_FILTER_CHIPS

export function DiscoveryPage({ aiPulse = false }: DiscoveryPageProps) {
  const [allAdvisors, setAllAdvisors] = useState<Advisor[]>([])
  const [searchResults, setSearchResults] = useState<Advisor[] | null>(null)
  const [activeFilter, setActiveFilter] = useState<DiscoverFilterId>(DISCOVER_ALL_FILTER)
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [semanticQuery, setSemanticQuery] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [connectError, setConnectError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const loadAdvisors = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const data = await userService.getAdvisors()
      setAllAdvisors(data.advisors)
    } catch (err) {
      setFetchError(getApiErrorMessage(err, 'Could not load advisors. Please refresh the page.'))
      setAllAdvisors([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdvisors()
  }, [loadAdvisors])

  const runSemanticSearch = useCallback(async (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) {
      setSearchResults(null)
      setSemanticQuery('')
      setSearchError('')
      return
    }

    setLoading(true)
    setSearchError('')
    setSemanticQuery(trimmed)
    try {
      const data = await searchService.semanticSearch({ query: trimmed, limit: 25 })
      setSearchResults(
        data.results.map((r) => ({
          ...r,
          featured: r.matchScore > 0.8,
        })),
      )
    } catch (err) {
      setSearchError(getApiErrorMessage(err, 'Search unavailable — showing filtered results instead.'))
      setSearchResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    runSemanticSearch(query)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSemanticQuery('')
    setSearchResults(null)
    setSearchError('')
  }

  const baseList = searchResults ?? allAdvisors

  const displayedAdvisors = useMemo(() => {
    const filtered = filterAdvisors(baseList as DiscoverAdvisor[], {
      categoryId: activeFilter,
      query: searchResults ? undefined : searchQuery.trim() || undefined,
      onlineOnly,
    })
    return sortAdvisorsForDiscover(filtered)
  }, [baseList, activeFilter, onlineOnly, searchQuery, searchResults])

  const handleConnect = async (advisorId: string) => {
    if (!user || user.role !== 'client') {
      navigate('/auth')
      return
    }
    setConnectError('')
    try {
      const data = await sessionService.initiateSession({ advisorId })
      navigate(`/waiting?sessionId=${data.sessionId}`)
    } catch (err: unknown) {
      const code = getApiErrorCode(err)
      const message = getApiErrorMessage(err, 'Could not start session. Please try again.')
      if (code === 'INSUFFICIENT_FUNDS') {
        setConnectError('Insufficient coins — add funds in your wallet first.')
      } else if (code === 'ADVISOR_OFFLINE') {
        setConnectError('This advisor is offline. Try another advisor or check back later.')
      } else if (code === 'ADVISOR_NOT_VERIFIED') {
        setConnectError('This advisor is not verified yet.')
      } else {
        setConnectError(message)
      }
    }
  }

  const activeFilterLabel =
    activeFilter === DISCOVER_ALL_FILTER
      ? undefined
      : DISCOVER_FILTER_CHIPS.find((c) => c.id === activeFilter)?.label

  const isSearching = Boolean(semanticQuery)
  const onlineCount = displayedAdvisors.filter((a) => a.isOnline).length

  return (
    <AppShell
      activeNav="discover"
      searchClassName={aiPulse || isSearching ? 'ai-pulse-active' : ''}
      searchPlaceholder={
        aiPulse ? 'Describe your feelings...' : 'Search by need, language, or specialty...'
      }
      onSearch={handleSearch}
    >
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <div className="relative md:hidden w-full">
          <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className={`w-full bg-surface-container-lowest border border-outline-variant rounded-full py-3 pl-12 pr-10 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm ${aiPulse || isSearching ? 'ai-pulse-active' : ''}`}
            placeholder="Search by need, language, or specialty..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch((e.target as HTMLInputElement).value)
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary p-1"
              aria-label="Clear search"
            >
              <MaterialIcon name="close" className="text-[20px]" />
            </button>
          )}
        </div>

        {(aiPulse || isSearching) && (
          <section className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-stack-md flex items-start sm:items-center gap-stack-md">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <MaterialIcon name="psychology" className="text-on-primary-container" />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-headline-md text-[18px] text-on-background">
                {isSearching ? 'Semantic Search Active' : 'AI Pulse Active'}
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {isSearching
                  ? `AI matched advisors for "${semanticQuery}". ${displayedAdvisors.length} result${displayedAdvisors.length === 1 ? '' : 's'}${activeFilterLabel ? ` in ${activeFilterLabel}` : ''}.`
                  : 'Green Heart AI analyzed your recent logs and prioritized advisors for holistic balance and burnout recovery.'}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-vibrant-coral pulse-dot shrink-0 hidden sm:block" />
          </section>
        )}

        <DashboardHeader
          title={isSearching ? 'Search Results' : 'Discover Advisors'}
          description={
            isSearching
              ? `Specialists matched to "${semanticQuery}"${activeFilterLabel ? ` · filtered by ${activeFilterLabel}` : ''}.`
              : 'Browse verified wellness advisors by focus area, language, and availability. Connect instantly when someone is online.'
          }
          badge={
            !loading && displayedAdvisors.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-label-md text-secondary bg-secondary-container/30 px-3 py-1 rounded-full">
                <MaterialIcon name="groups" className="text-[14px]" />
                {displayedAdvisors.length} advisor{displayedAdvisors.length === 1 ? '' : 's'}
                {onlineCount > 0 && ` · ${onlineCount} online`}
              </span>
            ) : undefined
          }
        />

        {fetchError && (
          <DashboardAlert variant="error" icon="error" title="Could not load advisors">
            {fetchError}
            <button type="button" onClick={loadAdvisors} className={`${btnGhost} mt-2 text-sm`}>
              Try again
            </button>
          </DashboardAlert>
        )}

        {searchError && (
          <DashboardAlert variant="warning" icon="info" title="Search fallback">
            {searchError}
          </DashboardAlert>
        )}

        {connectError && (
          <DashboardAlert variant="error" icon="error">
            {connectError}
          </DashboardAlert>
        )}

        <section className="flex flex-col gap-stack-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
              Focus areas
            </p>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`${btnFilter(showFilters || onlineOnly)} flex items-center gap-1 text-sm py-1.5 px-3`}
            >
              <MaterialIcon name="tune" className="text-[16px]" />
              Filters
              {onlineOnly && <span className="w-1.5 h-1.5 rounded-full bg-vibrant-coral" />}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 p-stack-sm bg-surface-container-low rounded-xl border border-outline-variant">
              <label className="flex items-center gap-2 cursor-pointer font-body-md text-body-md text-on-surface">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary/30"
                />
                Online only
              </label>
              {activeFilter !== DISCOVER_ALL_FILTER && (
                <button
                  type="button"
                  onClick={() => setActiveFilter(DISCOVER_ALL_FILTER)}
                  className={`${btnGhost} text-sm py-1`}
                >
                  Clear focus filter
                </button>
              )}
              {isSearching && (
                <button type="button" onClick={handleClearSearch} className={`${btnGhost} text-sm py-1`}>
                  Clear search
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={btnFilter(activeFilter === filter.id)}
                title={filter.label}
              >
                {filter.shortLabel}
              </button>
            ))}
          </div>
          {activeFilter !== DISCOVER_ALL_FILTER && activeFilterLabel && (
            <p className="font-body-md text-sm text-on-surface-variant">
              Showing advisors in <span className="text-primary font-medium">{activeFilterLabel}</span>
            </p>
          )}
        </section>

        {loading ? (
          <LoadingSpinner label="Finding advisors..." />
        ) : displayedAdvisors.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {displayedAdvisors.map((advisor) => (
              <AdvisorCard
                key={advisor.id}
                advisor={advisor}
                showMatchScore={isSearching}
                onConnect={() => handleConnect(advisor.id)}
                onViewProfile={() => navigate(`/advisors/${advisor.id}`)}
              />
            ))}
          </section>
        ) : (
          <section className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-container-low rounded-xl border border-outline-variant border-dashed">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-stack-md">
              <MaterialIcon name="search_off" className="text-[32px] text-outline" />
            </div>
            <h3 className="font-headline-md text-[20px] text-on-background mb-2">No advisors found</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-stack-md">
              {isSearching
                ? `No matches for "${semanticQuery}"${activeFilterLabel ? ` in ${activeFilterLabel}` : ''}. Try a broader search or clear filters.`
                : onlineOnly
                  ? 'No advisors are online right now. Turn off "Online only" or check back soon.'
                  : activeFilterLabel
                    ? `No verified advisors listed under ${activeFilterLabel} yet. Try another focus area.`
                    : 'No verified advisors are available yet. Check back soon.'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {(isSearching || searchQuery) && (
                <button type="button" onClick={handleClearSearch} className={`${btnGhost} text-sm px-4 py-2`}>
                  Clear search
                </button>
              )}
              {activeFilter !== DISCOVER_ALL_FILTER && (
                <button
                  type="button"
                  onClick={() => setActiveFilter(DISCOVER_ALL_FILTER)}
                  className={`${btnGhost} text-sm px-4 py-2`}
                >
                  Show all focus areas
                </button>
              )}
              {onlineOnly && (
                <button
                  type="button"
                  onClick={() => setOnlineOnly(false)}
                  className={`${btnGhost} text-sm px-4 py-2`}
                >
                  Include offline advisors
                </button>
              )}
            </div>
          </section>
        )}

        <section className="mt-4 mb-2 bg-surface-container-low rounded-xl border border-outline-variant p-stack-md flex flex-col md:flex-row items-center gap-stack-md">
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
            className={`${btnPrimary} text-label-md px-6 py-2 whitespace-nowrap flex items-center gap-2`}
          >
            Start Matching
            <MaterialIcon name="arrow_forward" className="text-[18px]" />
          </button>
        </section>
      </main>
    </AppShell>
  )
}

export function DiscoveryAiPage() {
  return <DiscoveryPage aiPulse />
}
