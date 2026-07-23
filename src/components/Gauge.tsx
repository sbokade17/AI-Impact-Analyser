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

export default function Gauge({ value, max = 100, size = 180, stroke = 14, label, sublabel, color }: Props) {
  const [display, setDisplay] = useState(0)
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius

  useEffect(() => {
    const t = setTimeout(() => setDisplay(value), 100)
    return () => clearTimeout(t)
  }, [value])

  const arcColor = color ?? (value >= 70 ? '#ef4444' : value >= 40 ? '#f59e0b' : '#10b981')

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(122,132,159,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(display / max, 1))}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 8px ${arcColor}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-white tabular-nums">{Math.round(display)}</span>
        {label && <span className="text-xs font-semibold mt-1" style={{ color: arcColor }}>{label}</span>}
        {sublabel && <span className="text-[10px] text-ink-400 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  )
}
