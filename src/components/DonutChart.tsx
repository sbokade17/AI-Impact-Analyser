import { useEffect, useState } from 'react'

interface DonutSlice {
  label: string
  value: number
  color: string
}

interface Props {
  data: DonutSlice[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: string
}

export default function DonutChart({ data, size = 160, thickness = 22, centerLabel, centerValue }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const total = data.reduce((s, d) => s + d.value, 0)
  const radius = (size - thickness) / 2
  const circ = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(15,23,42,0.05)" strokeWidth={thickness} />
        {data.map((slice, i) => {
          const frac = slice.value / total
          const dash = circ * frac
          const gap = circ - dash
          const rotation = (offset / total) * 360
          offset += slice.value
          return (
            <circle
              key={i}
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={mounted ? `${dash} ${gap}` : `0 ${circ}`}
              strokeDashoffset={-((rotation / 360) * circ)}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 4px ${slice.color}44)` }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerValue && <span className="text-2xl font-extrabold text-ink-900 tabular-nums">{centerValue}</span>}
        {centerLabel && <span className="text-[10px] text-ink-400 uppercase tracking-wider mt-0.5">{centerLabel}</span>}
      </div>
    </div>
  )
}
