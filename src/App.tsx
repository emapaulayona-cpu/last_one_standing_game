import { useEffect } from 'react'
import { he } from './content/he'

function App() {
  const locale = he

  useEffect(() => {
    document.documentElement.lang = locale.code
    document.documentElement.dir = locale.dir
  }, [locale])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-950 text-slate-50">
      <h1 className="text-4xl font-bold">{locale.strings.appTitle}</h1>
    </main>
  )
}

export default App
