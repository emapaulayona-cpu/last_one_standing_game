import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'mint' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

// Each variant is a "candy button": an inner top highlight, an inner bottom shadow for
// roundness, a solid "step" shadow that gives it a pressable 3D edge, and a soft blurred drop
// shadow. :active shortens the step and nudges the button down, so it visibly presses on tap.
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gold text-ink ' +
    'shadow-[inset_0_2px_0_rgba(255,255,255,0.75),inset_0_-3px_4px_rgba(170,110,10,0.3),0_5px_0_var(--color-gold-shadow),0_9px_14px_rgba(160,110,20,0.3)] ' +
    'active:translate-y-1 active:shadow-[inset_0_2px_0_rgba(255,255,255,0.75),inset_0_-3px_4px_rgba(170,110,10,0.3),0_2px_0_var(--color-gold-shadow),0_3px_6px_rgba(160,110,20,0.3)]',
  secondary:
    'bg-indigo text-cream ' +
    'shadow-[inset_0_2px_0_rgba(255,255,255,0.2),inset_0_-3px_4px_rgba(20,15,60,0.35),0_5px_0_var(--color-indigo-dark),0_9px_14px_rgba(20,15,60,0.3)] ' +
    'active:translate-y-1 active:shadow-[inset_0_2px_0_rgba(255,255,255,0.2),inset_0_-3px_4px_rgba(20,15,60,0.35),0_2px_0_var(--color-indigo-dark),0_3px_6px_rgba(20,15,60,0.3)]',
  mint:
    'bg-mint text-[#0e3b2c] ' +
    'shadow-[inset_0_2px_0_rgba(255,255,255,0.5),inset_0_-3px_4px_rgba(20,90,65,0.3),0_5px_0_var(--color-mint-shadow),0_9px_14px_rgba(20,90,65,0.3)] ' +
    'active:translate-y-1 active:shadow-[inset_0_2px_0_rgba(255,255,255,0.5),inset_0_-3px_4px_rgba(20,90,65,0.3),0_2px_0_var(--color-mint-shadow),0_3px_6px_rgba(20,90,65,0.3)]',
  ghost:
    'bg-surface text-indigo ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_3px_0_var(--color-indigo-soft),0_5px_8px_rgba(69,59,168,0.15)] ' +
    'active:translate-y-1 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_0_var(--color-indigo-soft),0_2px_4px_rgba(69,59,168,0.15)]',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`min-h-11 rounded-full px-6 py-3 font-body text-lg font-semibold transition-all disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
