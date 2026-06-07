import { useRef, useEffect } from 'react'
import { MaterialIcon } from '../MaterialIcon'
import { btnGhost, btnPrimary } from '../layout/buttonStyles'
import { AI_SEARCH_EXAMPLES } from '../../constants/aiSearchExamples'

interface AiGuidedSearchPanelProps {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onSearch: (query: string) => void
  loading?: boolean
}

export function AiGuidedSearchPanel({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  loading = false,
}: AiGuidedSearchPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        textareaRef.current?.focus()
      } else {
        mobileInputRef.current?.focus()
      }
    }, 300)
    return () => window.clearTimeout(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary-container/20 via-surface-container-lowest to-secondary-container/15 p-5 sm:p-8">
      <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-label-md uppercase tracking-wider mb-4">
          <MaterialIcon name="auto_awesome" className="text-sm filled" />
          Semantic matching
        </div>

        <h2 className="font-headline-md text-xl sm:text-2xl text-on-background mb-2">
          Describe what you need — we&apos;ll find the right advisor
        </h2>
        <p className="text-sm sm:text-body-md text-on-surface-variant mb-6 max-w-lg mx-auto">
          Write in plain language. Our AI reads bios, credentials, and specialties to rank verified advisors
          who fit your situation.
        </p>

        <p className="md:hidden text-sm text-on-surface-variant mb-3 text-left">
          Describe your situation below or tap an example to get started.
        </p>

        <form onSubmit={handleSubmit} className="md:hidden text-left mb-5">
          <div className="relative">
            <MaterialIcon name="psychology" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
            <input
              ref={mobileInputRef}
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="What do you need help with?"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-3 pl-11 pr-4 text-base min-h-[48px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ai-pulse-active"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className={`${btnPrimary} w-full mt-2 py-3 min-h-[48px] flex items-center justify-center gap-2`}
          >
            {loading ? 'Matching…' : 'Find my match'}
            {!loading && <MaterialIcon name="arrow_forward" className="text-sm" />}
          </button>
        </form>

        <form onSubmit={handleSubmit} className="text-left mb-6 hidden md:block">
          <label htmlFor="ai-guided-search" className="sr-only">
            Describe what you need help with
          </label>
          <div className="relative">
            <MaterialIcon
              name="psychology"
              className="absolute left-4 top-4 text-primary pointer-events-none"
            />
            <textarea
              id="ai-guided-search"
              ref={textareaRef}
              rows={3}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="e.g. I need someone experienced with anxiety who speaks French and offers evening sessions…"
              className="w-full min-h-[112px] resize-y bg-surface-container-lowest border border-outline-variant rounded-xl py-3.5 pl-12 pr-4 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm ai-pulse-active"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className={`${btnPrimary} w-full sm:w-auto px-6 py-3 min-h-[48px] flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Matching…
                </>
              ) : (
                <>
                  Find my match
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </>
              )}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                className={`${btnGhost} w-full sm:w-auto py-3 min-h-[48px]`}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        <div className="text-left">
          <p className="text-xs font-label-md uppercase tracking-wide text-outline mb-3">Try an example</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {AI_SEARCH_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                disabled={loading}
                onClick={() => {
                  onSearchQueryChange(example.query)
                  onSearch(example.query)
                }}
                className={`${btnGhost} text-sm px-3 py-2 min-h-[40px] rounded-full border border-outline-variant/80 bg-surface-container-lowest/80 hover:border-primary/40 hover:bg-surface-container`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <ol className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-sm text-on-surface-variant">
          <li className="flex gap-3 items-start">
            <span className="shrink-0 w-7 h-7 rounded-full bg-primary-container/30 text-primary font-label-md flex items-center justify-center text-xs">
              1
            </span>
            <span>Describe your needs, language, or focus area in your own words.</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="shrink-0 w-7 h-7 rounded-full bg-primary-container/30 text-primary font-label-md flex items-center justify-center text-xs">
              2
            </span>
            <span>Review AI-ranked matches with match scores and filters.</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="shrink-0 w-7 h-7 rounded-full bg-primary-container/30 text-primary font-label-md flex items-center justify-center text-xs">
              3
            </span>
            <span>Connect instantly with a verified online advisor.</span>
          </li>
        </ol>
      </div>
    </section>
  )
}
