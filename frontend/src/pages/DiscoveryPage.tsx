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
  DISCOVER_SORT_OPTIONS,
  countActiveDiscoverFilters,
  filterAdvisors,
  sortAdvisorsForDiscover,
  type DiscoverAdvisor,
  type DiscoverFilterId,
  type DiscoverSortId,
} from '@shared/advisor/discoverUtils'
import { COUNTRY_REGIONS, PROFESSION_TYPES } from '@shared/advisor/credentialOptions'
import { LANGUAGE_OPTIONS } from '@shared/advisor/languageOptions'
import type { Advisor } from '../components/AdvisorCard'

interface DiscoveryPageProps {
  aiPulse?: boolean
}

const QUICK_FILTERS = DISCOVER_FILTER_CHIPS
const RATE_PRESETS = [
  { id: 'any', label: 'Any rate', min: undefined as number | undefined, max: undefined as number | undefined },
  { id: 'budget', label: 'Under 15 coins', min: undefined, max: 15 },
  { id: 'mid', label: '15–30 coins', min: 15, max: 30 },
  { id: 'premium', label: '30+ coins', min: 30, max: undefined },
]
const RATING_PRESETS = [
  { id: 0, label: 'Any rating' },
  { id: 3, label: '3+ stars' },
  { id: 4, label: '4+ stars' },
  { id: 4.5, label: '4.5+ stars' },
]

const DEFAULT_FILTERS = {
  onlineOnly: false,
  languageCodes: [] as string[],
  regionIds: [] as string[],
  professionTypes: [] as string[],
  ratePreset: 'any',
  minRating: 0,
  sortId: 'online_first' as DiscoverSortId,
}

export function DiscoveryPage({ aiPulse = false }: DiscoveryPageProps) {
  const [allAdvisors, setAllAdvisors] = useState<Advisor[]>([])
  const [searchResults, setSearchResults] = useState<Advisor[] | null>(null)
  const [activeFilter, setActiveFilter] = useState<DiscoverFilterId>(DISCOVER_ALL_FILTER)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
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
      if (filters.sortId === 'online_first') {
        setFilters((f) => ({ ...f, sortId: 'best_match' }))
      }
    } catch (err) {
      setSearchError(getApiErrorMessage(err, 'Search unavailable — showing filtered results instead.'))
      setSearchResults(null)
    } finally {
      setLoading(false)
    }
  }, [filters.sortId])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    runSemanticSearch(query)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSemanticQuery('')
    setSearchResults(null)
    setSearchError('')
    setFilters((f) => ({ ...f, sortId: 'online_first' }))
  }

  const ratePreset = RATE_PRESETS.find((p) => p.id === filters.ratePreset) ?? RATE_PRESETS[0]

  const filterOptions = useMemo(
    () => ({
      categoryId: activeFilter,
      query: searchResults ? undefined : searchQuery.trim() || undefined,
      onlineOnly: filters.onlineOnly,
      languageCodes: filters.languageCodes,
      regionIds: filters.regionIds,
      professionTypes: filters.professionTypes,
      minRate: ratePreset.min,
      maxRate: ratePreset.max,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
    }),
    [activeFilter, searchQuery, searchResults, filters, ratePreset],
  )

  const baseList = searchResults ?? allAdvisors

  const displayedAdvisors = useMemo(() => {
    const filtered = filterAdvisors(baseList as DiscoverAdvisor[], filterOptions)
    const sortId = searchResults ? filters.sortId : filters.sortId
    return sortAdvisorsForDiscover(filtered, sortId)
  }, [baseList, filterOptions, filters.sortId, searchResults])

  const activeFilterCount = countActiveDiscoverFilters(filterOptions)

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

  const clearAllFilters = () => {
    setActiveFilter(DISCOVER_ALL_FILTER)
    setFilters(DEFAULT_FILTERS)
  }

  const toggleLanguage = (code: string) => {
    setFilters((f) => ({
      ...f,
      languageCodes: f.languageCodes.includes(code)
        ? f.languageCodes.filter((c) => c !== code)
        : [...f.languageCodes, code],
    }))
  }

  const toggleRegion = (id: string) => {
    setFilters((f) => ({
      ...f,
      regionIds: f.regionIds.includes(id) ? f.regionIds.filter((r) => r !== id) : [...f.regionIds, id],
    }))
  }

  const toggleProfession = (id: string) => {
    setFilters((f) => ({
      ...f,
      professionTypes: f.professionTypes.includes(id)
        ? f.professionTypes.filter((p) => p !== id)
        : [...f.professionTypes, id],
    }))
  }

  const activeFilterLabel =
    activeFilter === DISCOVER_ALL_FILTER
      ? undefined
      : DISCOVER_FILTER_CHIPS.find((c) => c.id === activeFilter)?.label

  const isSearching = Boolean(semanticQuery)
  const onlineCount = displayedAdvisors.filter((a) => a.isOnline).length

  const activePills: { key: string; label: string; onRemove: () => void }[] = []
  if (filters.onlineOnly) activePills.push({ key: 'online', label: 'Online only', onRemove: () => setFilters((f) => ({ ...f, onlineOnly: false })) })
  if (activeFilter !== DISCOVER_ALL_FILTER && activeFilterLabel) {
    activePills.push({ key: 'focus', label: activeFilterLabel, onRemove: () => setActiveFilter(DISCOVER_ALL_FILTER) })
  }
  filters.languageCodes.forEach((code) => {
    const lang = LANGUAGE_OPTIONS.find((l) => l.code === code)
    activePills.push({ key: `lang-${code}`, label: lang?.name ?? code, onRemove: () => toggleLanguage(code) })
  })
  filters.regionIds.forEach((id) => {
    const region = COUNTRY_REGIONS.find((r) => r.id === id)
    activePills.push({ key: `region-${id}`, label: region?.label ?? id, onRemove: () => toggleRegion(id) })
  })
  filters.professionTypes.forEach((id) => {
    const prof = PROFESSION_TYPES.find((p) => p.id === id)
    activePills.push({ key: `prof-${id}`, label: prof?.label ?? id, onRemove: () => toggleProfession(id) })
  })
  if (filters.ratePreset !== 'any') {
    const preset = RATE_PRESETS.find((p) => p.id === filters.ratePreset)
    if (preset) activePills.push({ key: 'rate', label: preset.label, onRemove: () => setFilters((f) => ({ ...f, ratePreset: 'any' })) })
  }
  if (filters.minRating > 0) {
    activePills.push({
      key: 'rating',
      label: `${filters.minRating}+ stars`,
      onRemove: () => setFilters((f) => ({ ...f, minRating: 0 })),
    })
  }

  return (
    <AppShell
      activeNav="discover"
      searchClassName={aiPulse || isSearching ? 'ai-pulse-active' : ''}
      searchPlaceholder={
        aiPulse ? 'Describe what you need help with…' : 'Search by need, language, or specialty...'
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
                {isSearching ? 'Semantic Search Active' : 'AI-Guided Discovery'}
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {isSearching
                  ? `AI matched advisors for "${semanticQuery}". ${displayedAdvisors.length} result${displayedAdvisors.length === 1 ? '' : 's'} with your filters applied.`
                  : 'Use the search bar to describe what you need — we match advisors by bio, specialties, and credentials using semantic search.'}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-vibrant-coral pulse-dot shrink-0 hidden sm:block" />
          </section>
        )}

        <DashboardHeader
          title={isSearching ? 'Search Results' : 'Discover Advisors'}
          description={
            isSearching
              ? `Specialists matched to "${semanticQuery}". Refine with filters below.`
              : 'Browse verified wellness advisors by focus area, language, region, and availability.'
          }
          badge={
            !loading ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-label-md text-secondary bg-secondary-container/30 px-3 py-1 rounded-full">
                <MaterialIcon name="groups" className="text-[14px]" />
                {displayedAdvisors.length} result{displayedAdvisors.length === 1 ? '' : 's'}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
              Focus areas
            </p>
            <div className="flex items-center gap-2">
              <select
                value={filters.sortId}
                onChange={(e) => setFilters((f) => ({ ...f, sortId: e.target.value as DiscoverSortId }))}
                className="text-sm bg-surface-container-low border border-outline-variant rounded-full px-3 py-1.5 focus:outline-none focus:border-primary"
                aria-label="Sort advisors"
              >
                {DISCOVER_SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} disabled={opt.id === 'best_match' && !isSearching}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`${btnFilter(showFilters || activeFilterCount > 0)} flex items-center gap-1 text-sm py-1.5 px-3`}
              >
                <MaterialIcon name="tune" className="text-[16px]" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-on-primary text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {activePills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activePills.map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={pill.onRemove}
                  className="inline-flex items-center gap-1 bg-primary-container/30 text-on-primary-container text-xs px-3 py-1 rounded-full hover:bg-primary-container/50"
                >
                  {pill.label}
                  <MaterialIcon name="close" className="text-[14px]" />
                </button>
              ))}
              <button type="button" onClick={clearAllFilters} className={`${btnGhost} text-xs py-1 px-2`}>
                Clear all
              </button>
            </div>
          )}

          {showFilters && (
            <div className="flex flex-col gap-stack-md p-stack-md bg-surface-container-low rounded-xl border border-outline-variant">
              <label className="flex items-center gap-2 cursor-pointer font-body-md text-body-md text-on-surface">
                <input
                  type="checkbox"
                  checked={filters.onlineOnly}
                  onChange={(e) => setFilters((f) => ({ ...f, onlineOnly: e.target.checked }))}
                  className="rounded border-outline-variant text-primary focus:ring-primary/30"
                />
                Online only
              </label>

              <div>
                <p className="font-label-md text-xs uppercase tracking-wide text-outline mb-2">Session rate</p>
                <div className="flex flex-wrap gap-2">
                  {RATE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, ratePreset: preset.id }))}
                      className={btnFilter(filters.ratePreset === preset.id)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-label-md text-xs uppercase tracking-wide text-outline mb-2">Minimum rating</p>
                <div className="flex flex-wrap gap-2">
                  {RATING_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, minRating: preset.id }))}
                      className={btnFilter(filters.minRating === preset.id)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-label-md text-xs uppercase tracking-wide text-outline mb-2">Languages</p>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {LANGUAGE_OPTIONS.slice(0, 24).map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => toggleLanguage(lang.code)}
                      className={btnFilter(filters.languageCodes.includes(lang.code))}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-label-md text-xs uppercase tracking-wide text-outline mb-2">Licensed region</p>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {COUNTRY_REGIONS.slice(0, 20).map((region) => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => toggleRegion(region.id)}
                      className={btnFilter(filters.regionIds.includes(region.id))}
                    >
                      {region.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-label-md text-xs uppercase tracking-wide text-outline mb-2">Profession</p>
                <div className="flex flex-wrap gap-2">
                  {PROFESSION_TYPES.map((prof) => (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => toggleProfession(prof.id)}
                      className={btnFilter(filters.professionTypes.includes(prof.id))}
                    >
                      {prof.label}
                    </button>
                  ))}
                </div>
              </div>
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
                ? `No matches for "${semanticQuery}" with the current filters. Try broadening your search or clearing filters.`
                : activeFilterCount > 0
                  ? 'No advisors match your filters. Try removing some filters or including offline advisors.'
                  : 'No verified advisors are available yet. Check back soon.'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {(isSearching || searchQuery) && (
                <button type="button" onClick={handleClearSearch} className={`${btnGhost} text-sm px-4 py-2`}>
                  Clear search
                </button>
              )}
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearAllFilters} className={`${btnGhost} text-sm px-4 py-2`}>
                  Clear all filters
                </button>
              )}
            </div>
          </section>
        )}

        {!aiPulse && (
          <section className="mt-4 mb-2 bg-surface-container-low rounded-xl border border-outline-variant p-stack-md flex flex-col md:flex-row items-center gap-stack-md">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <MaterialIcon name="psychology" className="text-on-primary-container" />
            </div>
            <div className="grow text-center md:text-left">
              <h4 className="font-headline-md text-[18px] text-on-background">Not sure who to choose?</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Try semantic search — describe your needs in plain language and we will match verified advisors.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/discover/ai')}
              className={`${btnPrimary} text-label-md px-6 py-2 whitespace-nowrap flex items-center gap-2`}
            >
              Try AI search
              <MaterialIcon name="arrow_forward" className="text-[18px]" />
            </button>
          </section>
        )}
      </main>
    </AppShell>
  )
}

export function DiscoveryAiPage() {
  return <DiscoveryPage aiPulse />
}
