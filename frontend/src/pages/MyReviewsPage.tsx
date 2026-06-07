import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardSection,
  EmptyState,
  LoadingSpinner,
} from '../components/layout/dashboard-ui'
import { MaterialIcon } from '../components/MaterialIcon'
import { reviewsService } from '../api/reviews.service'
import { getApiErrorMessage } from '../utils/apiError'
import { useEffect, useState } from 'react'
import type { ClientReviewDto } from '@shared/contracts/reviews.api'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <MaterialIcon
          key={value}
          name="star"
          filled={value <= rating}
          className={`text-base ${value <= rating ? 'text-primary' : 'text-outline-variant'}`}
        />
      ))}
    </div>
  )
}

export function MyReviewsPage() {
  const [reviews, setReviews] = useState<ClientReviewDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    reviewsService
      .getMyReviews()
      .then((data) => setReviews(data.reviews))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load your reviews.')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell activeNav="reviews" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg max-w-2xl`}>
        <DashboardHeader
          title="My reviews"
          description="Feedback you've shared after completed advisor sessions."
        />

        {loading ? (
          <LoadingSpinner label="Loading reviews…" />
        ) : error ? (
          <EmptyState icon="error" title="Could not load reviews" description={error} />
        ) : reviews.length === 0 ? (
          <EmptyState
            icon="rate_review"
            title="No reviews yet"
            description="After a completed consultation, you'll be invited to rate your advisor."
          />
        ) : (
          <DashboardSection title={`${reviews.length} review${reviews.length === 1 ? '' : 's'}`}>
            <div className="divide-y divide-outline-variant/40">
              {reviews.map((review) => (
                <article key={review.id} className="py-stack-lg flex flex-col gap-stack-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/advisors/${review.advisorId}`}
                        className="font-label-md text-on-surface hover:text-primary"
                      >
                        {review.advisorName}
                      </Link>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {new Date(review.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <StarRow rating={review.rating} />
                  </div>
                  {review.comment ? (
                    <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{review.comment}</p>
                  ) : (
                    <p className="text-sm text-outline italic">No written comment</p>
                  )}
                </article>
              ))}
            </div>
          </DashboardSection>
        )}
      </main>
    </AppShell>
  )
}
