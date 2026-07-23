import { useState } from 'react'
import { Settings, FileSearch, LayoutDashboard, Activity } from 'lucide-react'
import SetupScreen from './screens/SetupScreen'
import AnalysisScreen from './screens/AnalysisScreen'
import ReportScreen from './screens/ReportScreen'
import { mockReport } from './data/mockReport'

export type Screen = 'setup' | 'analysis' | 'report'

const navItems: { id: Screen; label: string; icon: typeof Activity }[] = [
  { id: 'setup', label: 'Setup Context', icon: Settings },
  { id: 'analysis', label: 'New Analysis', icon: FileSearch },
  { id: 'report', label: 'Report Dashboard', icon: LayoutDashboard },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('analysis')

  return (
    <div className="min-h-screen bg-obsidian relative overflow-hidden">
      {/* Ambient layers */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-spotlight pointer-events-none" />

      {/* Floating capsule nav */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-spring-in">
        <div className="glass-strong rounded-full p-1.5 flex items-center gap-1 shadow-2xl">
          {/* Brand dot */}
          <div className="flex items-center gap-2 pl-3 pr-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ember to-amber2 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -inset-0.5 rounded-lg bg-ember/30 blur-sm -z-10" />
            </div>
          </div>
          <div className="w-px h-6 bg-white/10" />
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
