import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gold text-ink hover:brightness-105 active:brightness-95',
  secondary: 'bg-indigo text-cream hover:brightness-110 active:brightness-95',
  ghost: 'bg-transparent text-indigo border border-indigo/30 hover:bg-indigo/5',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`min-h-11 rounded-2xl px-6 py-3 font-body text-lg font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
