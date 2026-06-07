import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AdvisorCard } from '../components/AdvisorCard'
import { AppShell } from '../components/layout/AppShell'
import { AiGuidedSearchPanel } from '../components/discover/AiGuidedSearchPanel'
import { DiscoverModeTabs } from '../components/discover/DiscoverModeTabs'
import { appShellMainClass, DashboardAlert, DashboardHeader, LoadingSpinner } from '../components/layout/dashboard-ui'
import { btnFilter, btnGhost, btnOutline, btnPrimary } from '../components/layout/buttonStyles'
import { MaterialIcon } from '../components/MaterialIcon'
import { userService } from '../api/user.service'
import { searchService } from '../api/search.service'
import { sessionService } from '../api/session.service'
import { useAuth } from '../context/AuthContext'
import { useWalletBalance } from '../hooks/useWalletBalance'
import { InsufficientFundsAlert } from '../components/InsufficientFundsAlert'
import { WalletBalanceChip } from '../components/WalletBalanceChip'
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
  const [advisorsLoading, setAdvisorsLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [semanticQuery, setSemanticQuery] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [connectError, setConnectError] = useState('')
  const [connectErrorId, setConnectErrorId] = useState<string | null>(null)
  const [insufficientFunds, setInsufficientFunds] = useState(false)
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const isClient = user?.role === 'client'
  const isAiMode = aiPulse || location.pathname.startsWith('/discover/ai')
  const { balance, loading: walletLoading, refresh: refreshWallet } = useWalletBalance(isClient)

  const loadAdvisors = useCallback(async () => {
    setAdvisorsLoading(true)
    setFetchError('')
    try {
      const data = await userService.getAdvisors()
      setAllAdvisors(data.advisors)
    } catch (err) {
      setFetchError(getApiErrorMessage(err, 'Could not load advisors. Please refresh the page.'))
      setAllAdvisors([])
    } finally {
      setAdvisorsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdvisors()
  }, [loadAdvisors])

  useEffect(() => {
    if (isClient) {
      void refreshWallet()
    }
  }, [isClient, refreshWallet])

  useEffect(() => {
    if (!isAiMode) return
    const q = searchParams.get('q')?.trim()
    if (!q || q === semanticQuery) return
    setSearchQuery(q)
    void runSemanticSearch(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from URL ?q=
  }, [isAiMode])

  const runSemanticSearch = useCallback(async (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) {
      setSearchResults(null)
      setSemanticQuery('')
      setSearchError('')
      return
    }

    setSearchLoading(true)
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
      setSearchLoading(false)
    }
  }, [filters.sortId])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    runSemanticSearch(query)
    if (isAiMode) {
      const trimmed = query.trim()
      setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true })
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSemanticQuery('')
    setSearchResults(null)
    setSearchError('')
    setFilters((f) => ({ ...f, sortId: 'online_first' }))
    if (isAiMode) {
      setSearchParams({}, { replace: true })
    }
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
      navigate('/auth', { state: { from: `/advisors/${advisorId}?connect=1` } })
      return
    }
    setConnectError('')
    setConnectErrorId(null)
    setInsufficientFunds(false)
    setConnectingId(advisorId)
    try {
      const data = await sessionService.initiateSession({ advisorId })
      navigate(`/waiting?sessionId=${data.sessionId}`)
    } catch (err: unknown) {
      const code = getApiErrorCode(err)
      const message = getApiErrorMessage(err, 'Could not start session. Please try again.')
      setConnectErrorId(advisorId)
      if (code === 'INSUFFICIENT_FUNDS') {
        setInsufficientFunds(true)
        setConnectError('Insufficient coins — add funds in your wallet first.')
      } else if (code === 'ADVISOR_OFFLINE') {
        setConnectError('This advisor is offline. Try another advisor or check back later.')
      } else if (code === 'ADVISOR_NOT_VERIFIED') {
        setConnectError('This advisor is not verified yet.')
      } else {
        setConnectError(message)
      }
    } finally {
      setConnectingId(null)
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
  const loading = advisorsLoading || searchLoading

  useEffect(() => {
    if (isAiMode && isSearching) {
      mobileSearchRef.current?.focus()
    }
  }, [isAiMode, isSearching])

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

  const mobileSearchPlaceholder = isAiMode
    ? 'Describe what you need help with…'
    : 'Search by need, language, or specialty…'

  const pageTitle = isSearching
    ? 'AI matches'
    : isAiMode
      ? 'Find your match'
      : 'Discover Advisors'

  const pageDescription = isSearching
    ? `Ranked for “${semanticQuery}”. Adjust filters or edit your search anytime.`
    : isAiMode
      ? 'Tell us what you need in plain language — verified advisors matched by AI.'
      : 'Verified wellness advisors — filter by focus, language, and availability.'

  const showAdvisorGrid = !isAiMode || isSearching

  const filterPanel = (
    <div className="flex flex-col gap-stack-md p-stack-md bg-surface-container-low rounded-xl border border-outline-variant md:rounded-xl">
      <div className="flex items-center justify-between md:hidden">
        <h3 className="font-headline-md text-base text-on-background">Filters</h3>
        <button
          type="button"
          onClick={() => setShowFilters(false)}
          className={`${btnGhost} p-2 min-h-[44px] min-w-[44px] flex items-center justify-center`}
          aria-label="Close filters"
        >
          <MaterialIcon name="close" />
        </button>
      </div>

      <label className="flex items-center gap-3 cursor-pointer font-body-md text-body-md text-on-surface min-h-[44px]">
        <input
          type="checkbox"
          checked={filters.onlineOnly}
          onChange={(e) => setFilters((f) => ({ ...f, onlineOnly: e.target.checked }))}
          className="rounded border-outline-variant text-primary focus:ring-primary/30 w-4 h-4"
        />
        <span className="flex items-center gap-2">
          Show only advisors available now
        </span>
      </label>

      <div>
        <p className="font-label-md text-xs uppercase tracking-wide text-outline mb-2">Session rate</p>
        <div className="flex flex-wrap gap-2">
          {RATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, ratePreset: preset.id }))}
              className={`${btnFilter(filters.ratePreset === preset.id)} text-sm py-2 min-h-[40px]`}
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
              className={`${btnFilter(filters.minRating === preset.id)} text-sm py-2 min-h-[40px]`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-label-md text-xs uppercase tracking-wide text-outline mb-2">Languages</p>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto overscroll-contain">
          {LANGUAGE_OPTIONS.slice(0, 24).map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => toggleLanguage(lang.code)}
              className={`${btnFilter(filters.languageCodes.includes(lang.code))} text-sm py-2`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-label-md text-xs uppercase tracking-wide text-outline mb-2">Licensed region</p>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto overscroll-contain">
          {COUNTRY_REGIONS.slice(0, 20).map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => toggleRegion(region.id)}
              className={`${btnFilter(filters.regionIds.includes(region.id))} text-sm py-2`}
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
              className={`${btnFilter(filters.professionTypes.includes(prof.id))} text-sm py-2`}
            >
              {prof.label}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={() => {
            clearAllFilters()
            setShowFilters(false)
          }}
          className={`${btnGhost} text-sm py-2.5 w-full md:w-auto border border-outline-variant`}
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <AppShell
      activeNav="discover"
      searchClassName={isAiMode || isSearching ? 'ai-pulse-active' : ''}
      searchIcon={isAiMode ? 'psychology' : 'search'}
      searchPlaceholder={mobileSearchPlaceholder}
      searchValue={searchQuery}
      onSearchValueChange={setSearchQuery}
      onSearch={handleSearch}
    >
      <main className={`${appShellMainClass} flex flex-col gap-4 sm:gap-stack-lg pb-24 md:pb-stack-lg`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <DiscoverModeTabs />
          {isAiMode && isSearching && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={`${btnGhost} text-sm py-2 px-3 min-h-[44px] self-start sm:self-auto flex items-center gap-1.5`}
            >
              <MaterialIcon name="edit" className="text-base" />
              New search
            </button>
          )}
        </div>

        {/* Mobile search — hidden on AI landing (hero has its own input) */}
        {(!isAiMode || isSearching) && (
        <div className="md:hidden sticky top-16 z-30 -mx-margin-mobile px-margin-mobile py-2 bg-background/95 backdrop-blur-sm border-b border-outline-variant/40">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch(searchQuery)
            }}
          >
            <div className="relative flex-1 min-w-0">
              <MaterialIcon
                name={isAiMode ? 'psychology' : 'search'}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
              />
              <input
                ref={mobileSearchRef}
                className={`w-full bg-surface-container-lowest border border-outline-variant rounded-full py-3 pl-11 pr-10 font-body-md text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm min-h-[48px] ${
                  isAiMode || isSearching ? 'ai-pulse-active' : ''
                }`}
                placeholder={mobileSearchPlaceholder}
                type="search"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-primary p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <MaterialIcon name="close" className="text-[20px]" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className={`${btnPrimary} shrink-0 px-4 min-h-[48px] min-w-[48px] flex items-center justify-center`}
              aria-label={isAiMode ? 'Find AI match' : 'Search advisors'}
            >
              <MaterialIcon name={isAiMode ? 'auto_awesome' : 'search'} />
            </button>
          </form>
        </div>
        )}

        <DashboardHeader
          title={pageTitle}
          description={pageDescription}
          badge={
            !loading ? (
              <div className="flex flex-wrap items-center gap-2">
                {isClient && (
                  <WalletBalanceChip
                    balance={balance?.coinBalance ?? null}
                    escrow={balance?.escrowBalance ?? 0}
                    loading={walletLoading}
                    compact
                  />
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-label-md text-secondary bg-secondary-container/30 px-3 py-1.5 rounded-full">
                  <MaterialIcon name="groups" className="text-[14px]" />
                  {displayedAdvisors.length} result{displayedAdvisors.length === 1 ? '' : 's'}
                  {onlineCount > 0 && ` · ${onlineCount} online`}
                </span>
              </div>
            ) : undefined
          }
        />

        {isAiMode && !isSearching && (
          <AiGuidedSearchPanel
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            loading={searchLoading}
          />
        )}

        {!isAiMode && !isSearching && (
          <section className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low/50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <p className="text-sm text-on-surface-variant flex items-start gap-2">
              <MaterialIcon name="psychology" className="text-primary shrink-0 mt-0.5" />
              <span>
                Not sure who to pick? Switch to <strong className="text-on-background font-label-md">AI Match</strong>{' '}
                and describe your needs in plain language.
              </span>
            </p>
            <Link
              to="/discover/ai"
              className={`${btnPrimary} text-sm px-4 py-2.5 min-h-[44px] w-full sm:w-auto flex items-center justify-center gap-2 shrink-0`}
            >
              Open AI Match
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </section>
        )}

        {isSearching && (
          <section className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <MaterialIcon name="auto_awesome" className="text-on-primary-container filled" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-headline-md text-base text-on-background">AI-ranked results</h4>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-vibrant-coral font-label-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-vibrant-coral pulse-dot" />
                  {displayedAdvisors.length} match{displayedAdvisors.length === 1 ? '' : 'es'}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                Showing advisors best aligned with “{semanticQuery}”. Cards with higher match scores are stronger fits.
              </p>
            </div>
          </section>
        )}

        {fetchError && (
          <DashboardAlert variant="error" icon="error" title="Could not load advisors">
            {fetchError}
            <button type="button" onClick={loadAdvisors} className={`${btnGhost} mt-2 text-sm min-h-[44px]`}>
              Try again
            </button>
          </DashboardAlert>
        )}

        {searchError && (
          <DashboardAlert variant="warning" icon="info" title="Search fallback">
            {searchError}
          </DashboardAlert>
        )}

        {insufficientFunds && <InsufficientFundsAlert />}

        {showAdvisorGrid && (
          <>
        {/* Toolbar: sort + filters */}
        <div className="flex flex-col gap-3 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0 sticky top-[7.25rem] md:top-16 z-20 py-2 md:py-0 bg-background/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
          <div className="flex items-center gap-2">
            <select
              value={filters.sortId}
              onChange={(e) => setFilters((f) => ({ ...f, sortId: e.target.value as DiscoverSortId }))}
              className="flex-1 min-w-0 text-sm bg-surface-container-lowest border border-outline-variant rounded-full px-3 py-2.5 min-h-[44px] focus:outline-none focus:border-primary"
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
              className={`${btnFilter(showFilters || activeFilterCount > 0)} flex items-center gap-1.5 text-sm py-2.5 px-4 min-h-[44px] shrink-0`}
            >
              <MaterialIcon name="tune" className="text-[18px]" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary text-on-primary text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {activePills.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide overscroll-x-contain">
              {activePills.map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={pill.onRemove}
                  className="inline-flex items-center gap-1 bg-primary-container/30 text-on-primary-container text-xs px-3 py-2 rounded-full hover:bg-primary-container/50 shrink-0 min-h-[36px]"
                >
                  {pill.label}
                  <MaterialIcon name="close" className="text-[14px]" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className={`${btnGhost} text-xs py-2 px-3 shrink-0 min-h-[36px]`}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Focus area chips — horizontal scroll with edge fade on mobile */}
        <div className="relative -mx-margin-mobile md:mx-0">
          <p className="font-label-md text-xs uppercase tracking-wide text-on-surface-variant mb-2 px-margin-mobile md:px-0">
            Focus areas
          </p>
          <div className="pointer-events-none absolute left-0 top-6 bottom-2 w-6 bg-linear-to-r from-background to-transparent z-10 md:hidden" />
          <div className="pointer-events-none absolute right-0 top-6 bottom-2 w-6 bg-linear-to-l from-background to-transparent z-10 md:hidden" />
          <div className="flex gap-2 overflow-x-auto pb-2 px-margin-mobile md:px-0 scrollbar-hide overscroll-x-contain snap-x snap-mandatory">
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`${btnFilter(activeFilter === filter.id)} snap-start text-sm py-2.5 min-h-[44px]`}
                title={filter.label}
              >
                {filter.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Filters: bottom sheet on mobile, inline on desktop */}
        {showFilters && (
          <>
            <button
              type="button"
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              aria-label="Close filters"
              onClick={() => setShowFilters(false)}
            />
            <div className="fixed inset-x-0 bottom-[var(--app-bottom-nav-h)] z-50 max-h-[min(75vh,520px)] overflow-y-auto rounded-t-2xl shadow-2xl bg-surface-container-lowest md:static md:z-auto md:max-h-none md:overflow-visible md:shadow-none md:rounded-xl md:bg-transparent">
              {filterPanel}
            </div>
          </>
        )}

        {(searchLoading || (advisorsLoading && !isSearching)) ? (
          <LoadingSpinner label={searchLoading ? 'Finding your best matches…' : 'Loading advisors…'} />
        ) : displayedAdvisors.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-gutter">
            {displayedAdvisors.map((advisor) => (
              <AdvisorCard
                key={advisor.id}
                advisor={advisor}
                showMatchScore={isSearching}
                isConnecting={connectingId === advisor.id}
                connectError={connectErrorId === advisor.id ? connectError : undefined}
                onConnect={() => handleConnect(advisor.id)}
                onViewProfile={() => navigate(`/advisors/${advisor.id}`)}
              />
            ))}
          </section>
        ) : (
          <section className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center bg-surface-container-low rounded-xl border border-outline-variant border-dashed">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-stack-md">
              <MaterialIcon name="search_off" className="text-[28px] sm:text-[32px] text-outline" />
            </div>
            <h3 className="font-headline-md text-lg sm:text-[20px] text-on-background mb-2">No advisors found</h3>
            <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant max-w-md mb-stack-md">
              {isSearching
                ? `No matches for “${semanticQuery}” with the current filters. Try broadening your search or clearing filters.`
                : activeFilterCount > 0
                  ? 'No advisors match your filters. Try removing some filters or including offline advisors.'
                  : 'No verified advisors are available yet. Check back soon.'}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center w-full max-w-xs sm:max-w-none">
              {(isSearching || searchQuery) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={`${btnGhost} text-sm px-4 py-2.5 min-h-[44px] w-full sm:w-auto`}
                >
                  Clear search
                </button>
              )}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className={`${btnOutline} text-sm px-4 py-2.5 min-h-[44px] w-full sm:w-auto`}
                >
                  Clear all filters
                </button>
              )}
              {!isSearching && !searchQuery && (
                <Link
                  to="/discover/ai"
                  className={`${btnPrimary} text-sm px-4 py-2.5 min-h-[44px] w-full sm:w-auto flex items-center justify-center gap-2`}
                >
                  Try AI Match
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </Link>
              )}
            </div>
          </section>
        )}
          </>
        )}
      </main>
    </AppShell>
  )
}

export function DiscoveryAiPage() {
  return <DiscoveryPage aiPulse />
}
