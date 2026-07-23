import { useEffect, useState } from 'react'
import { Check, Loader as Loader2 } from 'lucide-react'

export interface ScanStep {
  label: string
  detail: string
}

const steps: ScanStep[] = [
  { label: 'Analyzing AST', detail: 'Parsing dependency graph across 1,284 files' },
  { label: 'Parsing Schema', detail: 'Comparing 38 tables against baseline schema' },
  { label: 'Cross-referencing Flows', detail: 'Matching Gherkin scenarios against user workflows' },
  { label: 'Calculating Risk', detail: 'Scoring impact across 4 dimensions' },
  { label: 'Compiling Report', detail: 'Generating diff views and recommendations' },
]

export default function ScanBeam({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [durationMs] = useState(() => 5000 + Math.random() * 10000)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const next = Math.min((elapsed / durationMs) * 100, 100)

      setProgress(next)

      if (next >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 250)
        }
    }, 80)
    return () => clearInterval(interval)
  }, [durationMs, onComplete])

  useEffect(() => {
    setActiveStep(Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1))
  }, [progress])

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 animate-fade-in">
      {/* Scan beam visual */}
      <div className="relative w-full h-48 panel rounded-2xl overflow-hidden mb-8">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        {/* Scan line */}
        <div className="scan-line" />
        {/* Code lines mockup */}
        <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-8 opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-2 h-2 rounded bg-white/10" />
              <div
                className="h-2 rounded shimmer"
                style={{ width: `${30 + Math.random() * 50}%` }}
              />
            </div>
          ))}
        </div>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-white tabular-nums">{Math.round(progress)}%</div>
            <div className="text-xs text-ember font-mono mt-1 tracking-wider">SCANNING</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ff453a, #ff9f0a)' }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-1.5">
        {steps.map((step, i) => {
          const done = i < activeStep
          const active = i === activeStep
          return (
            <div
              key={step.label}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300 ${
                active ? 'bg-ember/5 border border-ember/20' : 'border border-transparent'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                done ? 'bg-emerald2/15 text-emerald2' : active ? 'bg-ember/15 text-ember' : 'bg-white/5 text-zinc-600'
              }`}>
                {done ? <Check className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-[10px] font-mono">{String(i + 1).padStart(2, '0')}</span>}
              </div>
              <div className="flex-1">
                <div className={`text-sm ${done ? 'text-zinc-500' : active ? 'text-white font-semibold' : 'text-zinc-600'}`}>
                  {step.label}
                </div>
                {active && <div className="text-xs text-zinc-500 mt-0.5">{step.detail}</div>}
              </div>
              {active && <div className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <div key={d} className="w-1 h-1 rounded-full bg-ember animate-pulse-soft" style={{ animationDelay: `${d * 200}ms` }} />
                ))}
              </div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
