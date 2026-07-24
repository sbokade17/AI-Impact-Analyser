interface RadarDatum {
  label: string
  value: number
}

interface TenRiskRadarProps {
  data: RadarDatum[]
  className?: string
}

const GRID_LEVELS = 5
const SIZE = 420
const CENTER = SIZE / 2
const RADIUS = 150

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function polarToCartesian(angle: number, distance: number) {
  return {
    x: CENTER + Math.cos(angle) * distance,
    y: CENTER + Math.sin(angle) * distance,
  }
}

function polygonPoints(data: RadarDatum[], radiusScale = 1) {
  const count = data.length
  return data
    .map((item, index) => {
      const angle = -Math.PI / 2 + (index / count) * Math.PI * 2
      const distance = (clamp(item.value) / 100) * RADIUS * radiusScale
      const point = polarToCartesian(angle, distance)
      return `${point.x},${point.y}`
    })
    .join(' ')
}

export default function TenRiskRadar({ data, className = '' }: TenRiskRadarProps) {
  const normalizedData = data.slice(0, 10)
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light'
  const colors = isLightTheme
    ? {
        grid: 'rgba(15,23,42,0.18)',
        axis: 'rgba(15,23,42,0.2)',
        outer: 'rgba(15,23,42,0.28)',
        label: '#1f2937',
        dotStroke: '#ffffff',
      }
    : {
        grid: 'rgba(255,255,255,0.08)',
        axis: 'rgba(255,255,255,0.08)',
        outer: 'rgba(255,255,255,0.12)',
        label: '#e5e7eb',
        dotStroke: '#0b0f1b',
      }

  if (normalizedData.length !== 10) {
    return null
  }

  const axes = normalizedData.map((item, index) => {
    const angle = -Math.PI / 2 + (index / normalizedData.length) * Math.PI * 2
    const axisEnd = polarToCartesian(angle, RADIUS)
    const labelPoint = polarToCartesian(angle, RADIUS + 34)
    const dotPoint = polarToCartesian(angle, (clamp(item.value) / 100) * RADIUS)

    return {
      label: item.label,
      value: clamp(item.value),
      angle,
      axisEnd,
      labelPoint,
      dotPoint,
    }
  })

  const dataPolygon = polygonPoints(normalizedData)
  const outerGrid = polygonPoints(normalizedData.map((item) => ({ ...item, value: 100 })))

  return (
    <div className={`panel p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-display text-base font-bold text-white">10-Risk Radar</h4>
          <p className="text-xs text-zinc-500">Decade lens across architecture, quality, and delivery.</p>
        </div>
        <div className="chip bg-ember/10 text-ember border border-ember/20">10 Axes</div>
      </div>

      <div className="relative mx-auto w-full max-w-[430px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto">
          <defs>
            <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff453a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff9f0a" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {[...Array(GRID_LEVELS)].map((_, idx) => {
            const step = (idx + 1) / GRID_LEVELS
            const ring = polygonPoints(normalizedData.map((item) => ({ ...item, value: step * 100 })))
            return (
              <polygon
                key={idx}
                points={ring}
                fill="none"
                stroke={colors.grid}
                strokeWidth={idx === GRID_LEVELS - 1 ? 1.2 : 1}
              />
            )
          })}

          {axes.map((axis) => (
            <line
              key={`${axis.label}-axis`}
              x1={CENTER}
              y1={CENTER}
              x2={axis.axisEnd.x}
              y2={axis.axisEnd.y}
              stroke={colors.axis}
              strokeWidth="1"
            />
          ))}

          <polygon points={outerGrid} fill="none" stroke={colors.outer} strokeWidth="1.3" />
          <polygon points={dataPolygon} fill="url(#radarFill)" stroke="#ff7b22" strokeWidth="2" />

          {axes.map((axis) => (
            <g key={`${axis.label}-point`}>
              <circle cx={axis.dotPoint.x} cy={axis.dotPoint.y} r="4.2" fill="#ff9f0a" stroke={colors.dotStroke} strokeWidth="2.2" />
              <text
                x={axis.labelPoint.x}
                y={axis.labelPoint.y}
                textAnchor={axis.labelPoint.x < CENTER - 10 ? 'end' : axis.labelPoint.x > CENTER + 10 ? 'start' : 'middle'}
                alignmentBaseline="middle"
                fill={colors.label}
                stroke={isLightTheme ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.35)'}
                strokeWidth="0.65"
                paintOrder="stroke"
                fontSize="12"
                fontWeight="600"
                fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              >
                {axis.label}
              </text>
            </g>
          ))}

          <circle cx={CENTER} cy={CENTER} r="3.5" fill="#f4f4f5" />
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        {normalizedData.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5">
            <span className="text-zinc-300 truncate pr-2 font-medium">{item.label}</span>
            <span className="text-zinc-100 font-semibold tabular-nums">{Math.round(clamp(item.value))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
