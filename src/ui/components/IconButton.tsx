import type { ButtonHTMLAttributes } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

// A round "candy button" for a single icon/glyph — same bevel language as Button, sized to a
// 44px touch target.
export function IconButton({ className = '', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`flex size-11 items-center justify-center rounded-full bg-surface text-xl text-gold-shadow transition-all active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-3px_3px_rgba(200,160,90,0.25),0_3px_0_var(--color-gold-soft),0_5px_8px_rgba(140,110,40,0.25)] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-3px_3px_rgba(200,160,90,0.25),0_1px_0_var(--color-gold-soft),0_2px_4px_rgba(140,110,40,0.25)] ${className}`}
      {...props}
    />
  )
}
