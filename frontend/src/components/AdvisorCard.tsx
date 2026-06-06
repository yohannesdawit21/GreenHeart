import { MaterialIcon } from './MaterialIcon'
import type { AdvisorCardDto } from '@shared/contracts/users.api'

export type Advisor = AdvisorCardDto & {
  reviews?: number
  status?: string
  statusType?: 'available' | 'scheduled'
  featured?: boolean
}

interface AdvisorCardProps {
  advisor: Advisor
  onConnect?: () => void
}

export function AdvisorCard({ advisor, onConnect }: AdvisorCardProps) {
  const name = advisor.username
  const title = advisor.bio.split('.')[0] || advisor.bio.slice(0, 60)
  const rating = advisor.rating || 5.0
  const reviews = advisor.reviewCount || 0
  const tags = advisor.tags?.length ? advisor.tags : ['Wellness']
  const description = advisor.bio
  const price = advisor.coinRatePerSession
  const isOnline = advisor.isOnline
  const featured = advisor.featured || isOnline

  return (
    <article
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-stack-md flex flex-col gap-stack-md relative overflow-hidden group ${
        featured ? 'shadow-ambient ring-1 ring-primary/10' : 'shadow-sm hover:shadow-ambient transition-shadow duration-300'
      }`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          {advisor.avatarUrl ? (
            <img
              alt={`${name} profile`}
              className="w-16 h-16 rounded-full object-cover border-2 border-surface-container-lowest shadow-sm"
              src={advisor.avatarUrl}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary border border-primary/20">
              <MaterialIcon name="person" className="text-[32px]" />
            </div>
          )}
          <div>
            <h3 className="font-headline-md text-[20px] leading-tight text-on-background">{name}</h3>
            <p className="font-label-md text-label-md text-on-surface-variant line-clamp-1">{title}</p>
            <div className="flex items-center gap-1 mt-1">
              <MaterialIcon name="star" className="text-[14px] text-primary" filled />
              <span className="font-label-md text-[12px] text-on-surface-variant">
                {rating.toFixed(1)} ({reviews} reviews)
              </span>
            </div>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 shrink-0 ${
            isOnline
              ? 'bg-secondary-container/30 border border-secondary/30'
              : 'bg-surface-container-low border border-outline-variant'
          }`}
        >
          {isOnline && <div className="w-2 h-2 rounded-full bg-secondary pulse-dot" />}
          <span className="font-label-md text-[10px] uppercase text-on-surface-variant tracking-wider">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 relative z-10">
        {tags.slice(0, 4).map((tag: string) => (
          <span key={tag} className="bg-surface-container px-2 py-1 rounded font-label-md text-[12px] text-on-surface">
            {tag}
          </span>
        ))}
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 relative z-10">{description}</p>
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-outline-variant relative z-10 gap-2">
        <div className="font-label-md text-label-md text-on-surface-variant">
          <span className="font-bold text-on-background">{price}</span> coins / session
        </div>
        <button
          type="button"
          onClick={onConnect}
          disabled={!isOnline}
          className={`font-label-md text-label-md px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
            isOnline
              ? 'bg-primary hover:bg-on-primary-fixed-variant text-on-primary shadow-sm'
              : 'bg-surface-container text-outline cursor-not-allowed'
          }`}
        >
          {isOnline ? 'Connect' : 'Offline'}
          {isOnline && <MaterialIcon name="videocam" className="text-[18px]" />}
        </button>
      </div>
    </article>
  )
}
