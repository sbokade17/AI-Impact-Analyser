import { useEffect, useState } from 'react'
import { Settings, FileSearch, LayoutDashboard, Activity, Moon, Sun, Presentation, Loader as Loader2 } from 'lucide-react'
import SetupScreen from './screens/SetupScreen'
import AnalysisScreen from './screens/AnalysisScreen'
import ReportScreen from './screens/ReportScreen'
import { mockReport } from './data/mockReport'
import { generatePresentation } from './pptx/generatePresentation'

// Lazy-load pptxgenjs only when generating
let _pptxgen: typeof import('pptxgenjs') | null = null
async function getPptxGen() {
  if (!_pptxgen) _pptxgen = await import('pptxgenjs')
  return _pptxgen.default
}

export type Screen = 'setup' | 'analysis' | 'report'
type Theme = 'dark' | 'light'

const navItems: { id: Screen; label: string; icon: typeof Activity }[] = [
  { id: 'setup', label: 'Setup Context', icon: Settings },
  { id: 'analysis', label: 'New Analysis', icon: FileSearch },
  { id: 'report', label: 'Report Dashboard', icon: LayoutDashboard },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('analysis')
  const [generating, setGenerating] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const stored = localStorage.getItem('theme')
    return stored === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <div className="min-h-screen bg-obsidian relative overflow-hidden">
      {/* Ambient layers */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-spotlight pointer-events-none" />

      {/* Floating capsule nav */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-spring-in">
        <div className="glass-strong rounded-full p-1.5 flex items-center gap-1 shadow-2xl">
          {/* Tabs */}
          {navItems.map((item) => {
            const Icon = item.icon
            const active = screen === item.id
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {active && (
                  <div
                    className="absolute inset-0 rounded-full transition-all"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,69,58,0.15), rgba(255,159,10,0.1))',
                      border: '1px solid rgba(255,69,58,0.25)',
                      boxShadow: '0 0 20px -4px rgba(255,69,58,0.3)',
                    }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${active ? 'text-ember' : ''}`} />
                <span className="relative z-10 hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
          <div className="w-px h-6 bg-white/10" />
          <button
            onClick={async () => {
              setGenerating(true)
              try {
                const PptxGen = await getPptxGen()
                const pptx = generatePresentation(PptxGen)
                await pptx.writeFile({ fileName: 'AI-Impact-Analyser-Overview.pptx' })
              } finally {
                setGenerating(false)
              }
            }}
            className="relative flex items-center gap-2 px-3 py-2.5 rounded-full text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-all duration-300"
            title="Download PowerPoint overview"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Presentation className="w-4 h-4" />
                <span className="hidden lg:inline">PPTX</span>
              </>
            )}
          </button>
          <div className="w-px h-6 bg-white/10" />
          <button
            onClick={toggleTheme}
            className="relative flex items-center gap-2 px-3 py-2.5 rounded-full text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-all duration-300"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 pt-24 pb-12">
        {screen === 'setup' && <SetupScreen onContinue={() => setScreen('analysis')} />}
        {screen === 'analysis' && <AnalysisScreen onGenerate={() => setScreen('report')} />}
        {screen === 'report' && <ReportScreen report={mockReport} onBack={() => setScreen('analysis')} />}
      </main>
    </div>
  )
}
