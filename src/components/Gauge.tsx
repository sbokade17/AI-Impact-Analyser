import { useEffect, useState } from 'react'

interface Props {
  value: number
  max?: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  color?: string
}

export default function Gauge({ value, max = 100, size = 210, stroke = 16, label, sublabel, color }: Props) {
  const [display, setDisplay] = useState(0)
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius

  useEffect(() => {
    const t = setTimeout(() => setDisplay(value), 150)
    return () => clearTimeout(t)
  }, [value])

  const arcColor = color ?? (value >= 70 ? '#ef4444' : value >= 40 ? '#f59e0b' : '#10b981')
  const pct = Math.min(display / max, 1)
  const dashOffset = circ * (1 - pct)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={arcColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={arcColor} />
          </linearGradient>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={radius + 6} fill="none" stroke={arcColor} strokeWidth="1" strokeOpacity="0.12" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth={stroke} strokeLinecap="round" />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          filter="url(#gauge-glow)"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)' }}
        />
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * 2 * Math.PI
          const inner = radius - stroke / 2 - 8
          const outer = inner + (i % 5 === 0 ? 6 : 3)
          return (
            <line
              key={i}
              x1={size/2 + inner * Math.cos(angle)}
              y1={size/2 + inner * Math.sin(angle)}
              x2={size/2 + outer * Math.cos(angle)}
              y2={size/2 + outer * Math.sin(angle)}
              stroke="rgba(15,23,42,0.1)"
              strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold text-ink-900 tabular-nums tracking-tight">{Math.round(display)}</span>
        <span className="text-[10px] text-ink-400 font-mono mt-0.5">/ {max}</span>
        {label && <span className="text-xs font-bold mt-2 uppercase tracking-wider" style={{ color: arcColor }}>{label}</span>}
        {sublabel && <span className="text-[10px] text-ink-400 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  )
}
