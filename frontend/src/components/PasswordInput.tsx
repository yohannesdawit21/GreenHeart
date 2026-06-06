import { useState } from 'react'
import { MaterialIcon } from './MaterialIcon'

interface PasswordInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  required,
  minLength,
  autoComplete = 'current-password',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 pr-12 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
        placeholder={placeholder}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary rounded-full transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <MaterialIcon name={visible ? 'visibility_off' : 'visibility'} className="text-[20px]" />
      </button>
    </div>
  )
}
