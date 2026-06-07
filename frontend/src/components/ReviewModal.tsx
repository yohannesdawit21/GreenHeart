import { useState } from 'react'
import { MaterialIcon } from './MaterialIcon'
import { btnGhost, btnPrimary } from './layout/buttonStyles'
import { FormError } from './layout/dashboard-ui'
import { reviewsService } from '../api/reviews.service'
import { getApiErrorMessage } from '../utils/apiError'

interface ReviewModalProps {
  sessionId: string
  advisorName?: string
  onSubmitted: () => void
  onSkip: () => void
}

export function ReviewModal({ sessionId, advisorName, onSubmitted, onSkip }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await reviewsService.submitReview({
        sessionId,
        rating,
        comment: comment.trim() || undefined,
      })
      onSubmitted()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit your review. Please try again.'))
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#121d24]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-labelledby="review-modal-title"
        className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-ambient w-full max-w-md p-stack-lg"
      >
        <div className="flex items-start gap-3 mb-stack-md">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <MaterialIcon name="rate_review" className="text-on-primary-container" />
          </div>
          <div>
            <h2 id="review-modal-title" className="font-headline-md text-[20px] text-on-background">
              How was your session?
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant mt-1">
              {advisorName
                ? `Share feedback for ${advisorName} — it helps others find the right advisor.`
                : 'Your feedback helps others find the right advisor.'}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-stack-md">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-1 rounded-full hover:bg-surface-container transition-colors"
              aria-label={`Rate ${value} stars`}
            >
              <MaterialIcon
                name="star"
                filled={value <= rating}
                className={`text-3xl ${value <= rating ? 'text-primary' : 'text-outline-variant'}`}
              />
            </button>
          ))}
        </div>

        <textarea
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-sm min-h-[96px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Optional comment (what went well, what could improve)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
        />

        {error && <FormError className="mt-stack-sm">{error}</FormError>}

        <div className="flex flex-col-reverse sm:flex-row gap-2 mt-stack-md">
          <button type="button" onClick={onSkip} className={`${btnGhost} flex-1 py-2.5`} disabled={submitting}>
            Skip for now
          </button>
          <button type="button" onClick={handleSubmit} className={`${btnPrimary} flex-1 py-2.5`} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  )
}
