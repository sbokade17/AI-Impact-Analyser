interface Props {
  value: number
  color?: string
  label?: string
  max?: number
}

export default function MiniBar({ value, color, label, max = 100 }: Props) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-ink-300">{label}</span>
          <span className="text-ink-100 font-semibold tabular-nums">{value}</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-ink-800/80 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: color ?? 'linear-gradient(90deg,#0ea5e9,#0d9488)' }}
        />
      </div>
    </div>
  )
}
