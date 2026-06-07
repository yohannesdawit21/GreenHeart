import { MaterialIcon } from './MaterialIcon'
import { btnCoral, btnSoft } from './layout/buttonStyles'
import {
  getAdvisorCredentialSummary,
  getAdvisorFocusLabel,
  getAdvisorLanguagesSummary,
  type DiscoverAdvisor,
} from '@shared/advisor/discoverUtils'
import { parseAdvisorApplicationBio } from '../utils/advisorApplicationBio'

export type Advisor = DiscoverAdvisor

interface AdvisorCardProps {
  advisor: Advisor
  onConnect?: () => void
  onViewProfile?: () => void
  showMatchScore?: boolean
  isConnecting?: boolean
  connectError?: string
}

export function AdvisorCard({
  advisor,
  onConnect,
  onViewProfile,
  showMatchScore,
  isConnecting = false,
  connectError,
}: AdvisorCardProps) {
  const parsed = parseAdvisorApplicationBio(advisor.bio, advisor.credentials)
  const name = advisor.username
  const title = parsed.professionalTitle ?? parsed.professionType ?? advisor.bio.split('.')[0]
  const hasReviews = (advisor.reviewCount ?? 0) > 0 && advisor.rating != null
  const tags = advisor.tags.slice(0, 4)
  const extraTags = advisor.tags.length - tags.length
  const description = parsed.approach ?? advisor.bio
  const price = advisor.coinRatePerSession
  const isOnline = advisor.isOnline ?? false
  const image = advisor.avatarUrl
  const featured = advisor.featured || (advisor.matchScore != null && advisor.matchScore > 0.8)
  const focusLabel = getAdvisorFocusLabel(advisor)
  const credentialSummary = getAdvisorCredentialSummary(advisor)
  const languagesSummary = getAdvisorLanguagesSummary(advisor)
  const canConnect = isOnline && Boolean(onConnect)

  return (
    <article
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-4 sm:p-stack-md flex flex-col gap-3 sm:gap-stack-md relative overflow-hidden group h-full ${
        featured ? 'shadow-ambient border-primary/20' : 'shadow-sm hover:shadow-ambient transition-shadow duration-300'
      } ${isConnecting ? 'opacity-80 pointer-events-none' : ''}`}
    >
      {featured && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
      )}

      <div className="flex items-start justify-between relative z-10 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {image ? (
            <img
              alt={`${name} profile`}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-surface-container-lowest shadow-sm shrink-0"
              src={image}
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
              <MaterialIcon name="person" className="text-[28px] sm:text-[32px]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-headline-md text-lg sm:text-[20px] leading-tight text-on-background truncate">{name}</h3>
            <p className="font-label-md text-label-md text-on-surface-variant line-clamp-1 text-sm sm:text-base">{title}</p>
            {credentialSummary && (
              <p className="font-label-md text-[11px] text-outline line-clamp-1 mt-0.5">{credentialSummary}</p>
            )}
            {hasReviews && (
              <div className="flex items-center gap-1 mt-1">
                <MaterialIcon name="star" className="text-[14px] text-primary shrink-0" />
                <span className="font-label-md text-[12px] text-on-surface-variant">
                  {advisor.rating!.toFixed(1)} ({advisor.reviewCount} review{advisor.reviewCount === 1 ? '' : 's'})
                </span>
              </div>
            )}
          </div>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 shrink-0 ${
            isOnline
              ? 'bg-secondary-container/40 border border-secondary/30'
              : 'bg-surface-container-low border border-outline-variant'
          }`}
          title={isOnline ? 'Available for instant connection' : 'Currently offline'}
        >
          {isOnline && <div className="w-2 h-2 rounded-full bg-vibrant-coral pulse-dot" />}
          <span
            className={`font-label-md text-[10px] uppercase tracking-wider ${
              isOnline ? 'text-secondary' : 'text-on-surface-variant'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {(focusLabel || languagesSummary) && (
        <div className="flex flex-col gap-1 relative z-10 text-[12px]">
          {focusLabel && (
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <MaterialIcon name="medical_services" className="text-[14px] text-primary shrink-0" />
              <span className="line-clamp-1">{focusLabel}</span>
            </div>
          )}
          {languagesSummary && (
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <MaterialIcon name="translate" className="text-[14px] text-primary shrink-0" />
              <span className="line-clamp-1">{languagesSummary}</span>
            </div>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 relative z-10">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-surface-container px-2 py-1 rounded-full font-label-md text-[11px] text-on-surface"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="bg-surface-container px-2 py-1 rounded-full font-label-md text-[11px] text-outline">
              +{extraTags} more
            </span>
          )}
        </div>
      )}

      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 relative z-10 flex-grow">
        {description}
      </p>

      {showMatchScore && advisor.matchScore != null && (
        <div className="flex items-center gap-1 text-[11px] text-primary relative z-10">
          <MaterialIcon name="auto_awesome" className="text-[14px]" />
          <span>{Math.round(advisor.matchScore * 100)}% match</span>
        </div>
      )}

      <div className="mt-auto pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant relative z-10 gap-3">
        <div className="font-label-md text-label-md text-on-surface-variant min-w-0 text-center sm:text-left">
          <span className="font-bold text-on-background text-base sm:text-inherit">{price}</span>
          <span className="text-sm sm:text-inherit"> coins / session</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:shrink-0">
          {onViewProfile && (
            <button
              type="button"
              onClick={onViewProfile}
              disabled={isConnecting}
              className={`${btnSoft} text-label-md px-4 py-2.5 min-h-[44px] w-full sm:w-auto justify-center flex items-center`}
            >
              View profile
            </button>
          )}
          {canConnect ? (
            <button
              type="button"
              onClick={onConnect}
              disabled={isConnecting}
              className={`${btnCoral} text-label-md px-4 py-2.5 min-h-[44px] w-full sm:w-auto justify-center flex items-center gap-2`}
            >
              {isConnecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  Connect
                  <MaterialIcon name="videocam" className="text-[18px]" />
                </>
              )}
            </button>
          ) : !onViewProfile ? (
            <button
              type="button"
              disabled
              className={`${btnSoft} text-label-md px-4 py-2.5 min-h-[44px] w-full sm:w-auto opacity-60 cursor-not-allowed`}
            >
              Offline
            </button>
          ) : null}
        </div>
        {connectError && (
          <p className="text-error text-xs sm:text-sm mt-1 w-full text-right sm:text-left">{connectError}</p>
        )}
      </div>
    </article>
  )
}
