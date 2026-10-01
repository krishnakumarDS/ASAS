import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { small?: boolean; danger?: boolean }

export default function IconButton({ small, danger, className = '', ...rest }: Props) {
  return <button type="button" {...rest} className={`ghost-btn ${small ? 'sm' : ''} ${danger ? 'danger' : ''} ${className}`.trim()} />
}
