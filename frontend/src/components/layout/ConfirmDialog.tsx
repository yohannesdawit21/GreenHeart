import { MaterialIcon } from '../MaterialIcon'
import { btnDanger, btnOutline, btnPrimary } from './buttonStyles'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  icon?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  icon = 'help',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  const confirmClass = variant === 'danger' ? btnDanger : btnPrimary

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-labelledby="confirm-dialog-title"
        className="bg-surface-container-lowest w-full max-w-md rounded-xl border border-outline-variant shadow-2xl p-stack-lg"
      >
        <div className="flex items-start gap-3 mb-stack-md">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              variant === 'danger' ? 'bg-error-container text-error' : 'bg-primary-container text-primary'
            }`}
          >
            <MaterialIcon name={icon} className="text-xl" />
          </div>
          <div>
            <h2 id="confirm-dialog-title" className="font-headline-md text-lg text-on-background">
              {title}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">{message}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button type="button" onClick={onCancel} className={`${btnOutline} flex-1 py-2.5`}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={`${confirmClass} flex-1 py-2.5`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
