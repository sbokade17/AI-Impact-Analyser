import { useEffect, useState } from 'react'
import type { RiskLevel } from '../data/mockReport'

const riskConfig: Record<RiskLevel, { color: string; glow: string; bg: string; label: string }> = {
  High: { color: '#ff453a', glow: 'glow-ember', bg: 'rgba(255,69,58,0.1)', label: 'HIGH RISK' },
  Medium: { color: '#ff9f0a', glow: 'glow-amber', bg: 'rgba(255,159,10,0.1)', label: 'MEDIUM RISK' },
  Low: { color: '#30d158', glow: 'glow-emerald', bg: 'rgba(48,209,88,0.1)', label: 'LOW RISK' },
}

export default function RiskGauge({ score, level, size = 240 }: { score: number; level: RiskLevel; size?: number }) {
  const [display, setDisplay] = useState(0)
  const cfg = riskConfig[level]
  const stroke = 14
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  useEffect(() => {
    const t = setTimeout(() => setDisplay(score), 200)
    return () => clearTimeout(t)
  }, [score])

  const offset = circ * (1 - display / 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: size + 40,
          height: size + 40,
          background: `radial-gradient(circle, ${cfg.bg}, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />
      <svg width={size} height={size} className="-rotate-90 relative">
        <defs>
          <linearGradient id="gauge-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={cfg.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={cfg.color} />
          </linearGradient>
        </defs>
        {/* Tick marks */}
        {Array.from({ length: 80 }).map((_, i) => {
          const angle = (i / 80) * 2 * Math.PI
          const inner = radius - stroke / 2 - 10
          const outer = inner + (i % 10 === 0 ? 8 : 4)
          const active = (i / 80) * 100 <= display
          return (
            <line
              key={i}
              x1={size/2 + inner * Math.cos(angle)}
              y1={size/2 + inner * Math.sin(angle)}
              x2={size/2 + outer * Math.cos(angle)}
              y2={size/2 + outer * Math.sin(angle)}
              stroke={active ? cfg.color : 'rgba(255,255,255,0.08)'}
              strokeWidth={i % 10 === 0 ? 1.5 : 0.8}
              strokeOpacity={active ? 0.6 : 1}
            />
          )
        })}
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} strokeLinecap="round" />
        {/* Progress */}
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke="url(#gauge-stroke)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 8px ${cfg.color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-bold text-white tabular-nums tracking-tight">{Math.round(display)}</span>
        <span className="text-[10px] text-zinc-500 font-mono mt-1">/ 100</span>
        <span className="text-xs font-bold mt-3 tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
    </div>
  )
}

export { riskConfig }
