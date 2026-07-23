import { useEffect, useState } from 'react'

interface Props {
  value: number
  max?: number
  size?: number
  stroke?: number
  color: string
  label?: string
}

export default function RingProgress({ value, max = 100, size = 72, stroke = 7, color, label }: Props) {
  const [display, setDisplay] = useState(0)
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius

  useEffect(() => {
    const t = setTimeout(() => setDisplay(value), 100)
    return () => clearTimeout(t)
  }, [value])

  const offset = circ * (1 - Math.min(display / max, 1))

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth={stroke} />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 3px ${color}44)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-ink-800 tabular-nums">{label ?? Math.round(value)}</span>
      </div>
    </div>
  )
}
