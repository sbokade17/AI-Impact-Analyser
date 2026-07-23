import { useState } from 'react'
import { Activity, Settings, FileSearch, LayoutDashboard, Github, Database, BookOpen, Sparkles } from 'lucide-react'
import SetupScreen from './screens/SetupScreen'
import AnalysisScreen from './screens/AnalysisScreen'
import ReportScreen from './screens/ReportScreen'
import { mockReport } from './data/mockReport'

export type Screen = 'setup' | 'analysis' | 'report'

const navItems: { id: Screen; label: string; icon: typeof Activity }[] = [
  { id: 'setup', label: 'Knowledge Base', icon: Settings },
  { id: 'analysis', label: 'New Analysis', icon: FileSearch },
  { id: 'report', label: 'Impact Report', icon: LayoutDashboard },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('analysis')

  return (
    <div className="min-h-screen bg-ink-950 bg-aurora relative">
      <div className="bg-grid absolute inset-0 pointer-events-none opacity-40" />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-ink-700/40 glass-strong">
          <div className="px-6 py-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">AI Impact</h1>
              <p className="text-[11px] text-ink-400 leading-tight">Analyser</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = screen === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/10 text-white border border-sky-500/30'
                      : 'text-ink-300 hover:text-white hover:bg-ink-700/40'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${active ? 'text-sky-400' : ''}`} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="px-4 py-5 space-y-3 border-t border-ink-700/40">
            <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">Connected</div>
            {[
              { icon: Github, label: 'repo/payments-service', tone: 'text-emerald-400' },
              { icon: Database, label: 'prod-db (read-only)', tone: 'text-emerald-400' },
              { icon: BookOpen, label: 'User Guide v3.2', tone: 'text-emerald-400' },
            ].map((c) => {
              const Icon = c.icon
              return (
                <div key={c.label} className="flex items-center gap-2.5 text-xs text-ink-300">
                  <Icon className="w-3.5 h-3.5 text-ink-400" />
                  <span className="truncate">{c.label}</span>
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full ${c.tone.replace('text-', 'bg-')} animate-pulse-soft`} />
                </div>
              )
            })}
          </div>

          <div className="p-4">
            <div className="glass rounded-xl p-3 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <div className="text-[11px] text-ink-300 leading-tight">
                <div className="font-semibold text-white">GPT-4o engine</div>
                <div className="text-ink-400">Indexed 1,284 files</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="md:hidden fixed top-0 inset-x-0 z-30 glass-strong border-b border-ink-700/40">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-white text-sm">AI Impact</span>
            </div>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = screen === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setScreen(item.id)}
                    className={`p-2 rounded-lg ${active ? 'bg-sky-500/20 text-sky-400' : 'text-ink-300'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 min-w-0 pt-14 md:pt-0">
          {screen === 'setup' && <SetupScreen onContinue={() => setScreen('analysis')} />}
          {screen === 'analysis' && <AnalysisScreen onGenerate={() => setScreen('report')} />}
          {screen === 'report' && <ReportScreen report={mockReport} onBack={() => setScreen('analysis')} />}
        </main>
      </div>
    </div>
  )
}
