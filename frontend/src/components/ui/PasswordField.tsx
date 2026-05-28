'use client'

import { useId, useState } from 'react'

interface PasswordFieldProps {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  required?: boolean
  minLength?: number
  placeholder?: string
  describedBy?: string
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  placeholder,
  describedBy,
}: PasswordFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="dg-label mb-0">
          {label}
        </label>
        <button
          type="button"
          className="text-sm font-bold text-[var(--accent-strong)] transition hover:text-[var(--pitch-dark)]"
          aria-pressed={isVisible}
          aria-label={isVisible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? 'Ocultar' : 'Ver'}
        </button>
      </div>

      <input
        id={inputId}
        type={isVisible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="dg-input"
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        aria-describedby={describedBy}
      />
    </div>
  )
}
