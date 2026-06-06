import { MaterialIcon } from './MaterialIcon'

export interface Advisor {
  id: string
  name: string
  title: string
  rating: number
  reviews: number
  tags: string[]
  description: string
  price: number
  status: string
  statusType: 'available' | 'scheduled'
  image?: string
  featured?: boolean
}

interface AdvisorCardProps {
  advisor: Advisor
  onConnect?: () => void
}

export function AdvisorCard({ advisor, onConnect }: AdvisorCardProps) {
  return (
    <article
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-stack-md flex flex-col gap-stack-md relative overflow-hidden group ${
        advisor.featured ? 'shadow-ambient' : 'shadow-sm hover:shadow-ambient transition-shadow duration-300'
      }`}
    >
      {advisor.featured && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
      )}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          {advisor.image ? (
            <img
              alt={`${advisor.name} profile`}
              className="w-16 h-16 rounded-full object-cover border-2 border-surface-container-lowest shadow-sm"
              src={advisor.image}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <MaterialIcon name="person" className="text-[32px]" />
            </div>
          )}
          <div>
            <h3 className="font-headline-md text-[20px] leading-tight text-on-background">{advisor.name}</h3>
            <p className="font-label-md text-label-md text-on-surface-variant">{advisor.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <MaterialIcon name="star" className="text-[14px] text-primary" />
              <span className="font-label-md text-[12px] text-on-surface-variant">
                {advisor.rating} ({advisor.reviews} reviews)
              </span>
            </div>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 ${
            advisor.statusType === 'available'
              ? 'bg-surface-bright border border-outline-variant'
              : 'bg-surface-container-low border border-outline-variant'
          }`}
        >
          {advisor.statusType === 'available' && (
            <div className="w-2 h-2 rounded-full bg-vibrant-coral pulse-dot" />
          )}
          <span className="font-label-md text-[10px] uppercase text-on-surface-variant tracking-wider">
            {advisor.status}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 relative z-10">
        {advisor.tags.map((tag) => (
          <span key={tag} className="bg-surface-container px-2 py-1 rounded font-label-md text-[12px] text-on-surface">
            {tag}
          </span>
        ))}
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 relative z-10">{advisor.description}</p>
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-outline-variant relative z-10">
        <div className="font-label-md text-label-md text-on-surface-variant">
          <span className="font-bold text-on-background">${advisor.price}</span> / session
        </div>
        {advisor.featured ? (
          <button
            type="button"
            onClick={onConnect}
            className="bg-vibrant-coral hover:bg-[#ff5252] text-white font-label-md text-label-md px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            Connect Instantly
            <MaterialIcon name="arrow_forward" className="text-[18px]" />
          </button>
        ) : (
          <button
            type="button"
            className="bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-label-md text-label-md px-4 py-2 rounded-lg transition-colors border border-transparent"
          >
            View Profile
          </button>
        )}
      </div>
    </article>
  )
}

export const advisors: Advisor[] = [
  {
    id: '1',
    name: 'Dr. Elena Vance',
    title: 'Clinical Psychologist',
    rating: 4.9,
    reviews: 120,
    tags: ['Anxiety', 'Burnout', 'CBT'],
    description:
      'Specializing in high-stress professionals, Dr. Vance uses cognitive restructuring to build resilience and restore work-life harmony.',
    price: 150,
    status: 'Available Now',
    statusType: 'available',
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAt8R0usj5KFo8VZtxk78SLfPCrKPJVP7pSyMQqkjMu7BxaSyBrry3xD7QqAcMB0zLy2Fbk6U7cmUS2UcUyFiqjj-618Ylf75EsIEW5IMjvrqmhp6MlgyejnxDK6YSwPqgVwsjnTzX2tLwQ3hgGYNdz-sSY72OXbQG18S4_oXF8woIFsSNbNslpyU0gnD58UnPa_ERxqttjfBSWA6WzqlK4z99nwu-Kj0R2dLNFz1xO2XFBp32gxft2isn0ow_lmw0CFtZoeF4I1jJs',
  },
  {
    id: '2',
    name: 'Dr. Marcus Chen',
    title: 'Holistic Therapist',
    rating: 4.8,
    reviews: 85,
    tags: ['Relationship', 'Mediation'],
    description:
      'Focuses on interpersonal dynamics and communication strategies to foster healthy, sustainable relationships.',
    price: 130,
    status: 'Next: 2:00 PM',
    statusType: 'scheduled',
  },
  {
    id: '3',
    name: 'Sarah Jenkins, LCSW',
    title: 'Social Worker',
    rating: 4.9,
    reviews: 210,
    tags: ['Trauma', 'Grief'],
    description:
      'Provides a safe, grounding space for processing complex emotions using mindfulness and narrative therapy.',
    price: 110,
    status: 'Next: Tomorrow',
    statusType: 'scheduled',
  },
]
