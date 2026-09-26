import type { ReactNode } from 'react'

export function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-8 text-center">
      {children}
    </main>
  )
}
