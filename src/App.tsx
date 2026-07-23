import { useState } from 'react'
import { Activity, Settings, FileSearch, LayoutDashboard, Github, Database, BookOpen, Sparkles, Zap, ChevronRight } from 'lucide-react'
import SetupScreen from './screens/SetupScreen'
import AnalysisScreen from './screens/AnalysisScreen'
import ReportScreen from './screens/ReportScreen'
import { mockReport } from './data/mockReport'

export type Screen = 'setup' | 'analysis' | 'report'

const navItems: { id: Screen; label: string; icon: typeof Activity; desc: string }[] = [
  { id: 'setup', label: 'Knowledge Base', icon: Settings, desc: 'Baseline context' },
  { id: 'analysis', label: 'New Analysis', icon: FileSearch, desc: 'Trigger a run' },
  { id: 'report', label: 'Impact Report', icon: LayoutDashboard, desc: 'Results dashboard' },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('analysis')

  return (
    <div className="min-h-screen bg-ink-960 bg-aurora relative">
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 flex-col border-r border-ink-700/30 glass-2">
          {/* Brand */}
          <div className="px-6 py-7">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                  <Activity className="w-5.5 h-5.5 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-sky-400 to-teal-500 opacity-30 blur-md -z-10" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-base leading-tight tracking-tight">AI Impact</h1>
                <p className="text-[11px] text-ink-400 leading-tight font-medium">Analyser</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-ink-500 font-bold">Workflow</div>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = screen === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id)}
                  className={`w-full group flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 relative ${
                    active
                      ? 'bg-gradient-to-r from-sky-500/15 via-cyan-500/8 to-transparent text-white border border-sky-500/25'
                      : 'text-ink-300 hover:text-white hover:bg-ink-700/30 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    active ? 'bg-sky-500/20 text-sky-300' : 'bg-ink-800/60 text-ink-400 group-hover:text-ink-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold leading-tight">{item.label}</div>
                    <div className="text-[10px] text-ink-500 leading-tight mt-0.5">{item.desc}</div>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-sky-400" />}
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-sky-400 opacity-0 group-hover:opacity-40 transition-opacity" />
                </button>
              )
            })}
          </nav>

          {/* Connections */}
          <div className="px-5 py-5 space-y-3 border-t border-ink-700/30">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">Connections</div>
              <span className="chip bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" /> 4 live
              </span>
            </div>
            {[
              { icon: Github, label: 'payments-service', sub: 'main · 1,284 files' },
              { icon: Database, label: 'prod-db', sub: 'read-only · 38 tables' },
              { icon: BookOpen, label: 'User Guide v3.2', sub: '3 documents' },
            ].map((c) => {
              const Icon = c.icon
              return (
                <div key={c.label} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-ink-800/60 border border-ink-700/40 flex items-center justify-center group-hover:border-ink-600 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-ink-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-ink-100 font-medium truncate">{c.label}</div>
                    <div className="text-[10px] text-ink-500 truncate">{c.sub}</div>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                </div>
              )
            })}
          </div>

          {/* Engine card */}
          <div className="p-4">
            <div className="glass rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-sky-500/10 blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-300" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    GPT-4o engine <Zap className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-[10px] text-ink-400">Deep analysis · 1,284 indexed</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="md:hidden fixed top-0 inset-x-0 z-30 glass-2 border-b border-ink-700/30">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center">
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
                    className={`p-2 rounded-lg transition ${active ? 'bg-sky-500/20 text-sky-300' : 'text-ink-400'}`}
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
