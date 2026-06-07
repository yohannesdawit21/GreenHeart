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
}

export function AdvisorCard({ advisor, onConnect, onViewProfile, showMatchScore }: AdvisorCardProps) {
  const parsed = parseAdvisorApplicationBio(advisor.bio, advisor.credentials)
  const name = advisor.username
  const title = parsed.professionalTitle ?? parsed.professionType ?? advisor.bio.split('.')[0]
  const rating = advisor.rating ?? 5.0
  const reviews = advisor.reviewCount ?? 0
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

  return (
    <article
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-stack-md flex flex-col gap-stack-md relative overflow-hidden group h-full ${
        featured ? 'shadow-ambient border-primary/20' : 'shadow-sm hover:shadow-ambient transition-shadow duration-300'
      }`}
    >
      {featured && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
      )}

      <div className="flex items-start justify-between relative z-10 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {image ? (
            <img
              alt={`${name} profile`}
              className="w-16 h-16 rounded-full object-cover border-2 border-surface-container-lowest shadow-sm shrink-0"
              src={image}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
              <MaterialIcon name="person" className="text-[32px]" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-headline-md text-[20px] leading-tight text-on-background truncate">{name}</h3>
            <p className="font-label-md text-label-md text-on-surface-variant line-clamp-1">{title}</p>
            {credentialSummary && (
              <p className="font-label-md text-[11px] text-outline line-clamp-1 mt-0.5">{credentialSummary}</p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <MaterialIcon name="star" className="text-[14px] text-primary shrink-0" />
              <span className="font-label-md text-[12px] text-on-surface-variant">
                {rating.toFixed(1)} ({reviews} reviews)
              </span>
            </div>
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

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-outline-variant relative z-10 gap-2">
        <div className="font-label-md text-label-md text-on-surface-variant min-w-0">
          <span className="font-bold text-on-background">{price}</span> coins / session
        </div>
        {featured && isOnline ? (
          <button
            type="button"
            onClick={onConnect}
            className={`${btnCoral} text-label-md px-4 py-2 flex items-center gap-2 shrink-0`}
          >
            Connect
            <MaterialIcon name="arrow_forward" className="text-[18px]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onViewProfile ?? onConnect}
            className={`${btnSoft} text-label-md px-4 py-2 shrink-0`}
          >
            View Profile
          </button>
        )}
      </div>
    </article>
  )
}
