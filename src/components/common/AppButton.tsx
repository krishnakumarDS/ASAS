import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface AppButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'error'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  component?: 'button' | 'label'
}

export default function AppButton({ variant = 'outlined', color = 'primary', size = 'medium', fullWidth, loading, startIcon, endIcon, component = 'button', disabled, className = '', children, ...rest }: AppButtonProps) {
  const base = variant === 'contained' ? (color === 'error' ? 'liquid-btn danger' : 'liquid-btn') : variant === 'outlined' ? (color === 'error' ? 'danger-btn' : 'secondary-btn') : 'secondary-btn'
  const cls = `${base} ${size === 'small' ? 'btn-sm' : size === 'large' ? 'btn-lg' : ''} ${fullWidth ? 'btn-block' : ''} ${className}`.trim()
  const content = (
    <>
      {loading ? <span className="spinner" aria-hidden /> : startIcon}
      {children}
      {endIcon}
    </>
  )
  if (component === 'label') return <label className={cls} style={rest.style}>{content}</label>
  return <button {...rest} className={cls} disabled={disabled || loading} aria-busy={loading || undefined}>{content}</button>
}
