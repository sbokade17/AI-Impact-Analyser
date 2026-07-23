interface Props {
  value: number
  color?: string
  label?: string
  sublabel?: string
  max?: number
  icon?: React.ReactNode
}

export default function MiniBar({ value, color, label, sublabel, max = 100 }: Props) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      {label && (
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs text-ink-500 font-medium">{label}</span>
          <span className="text-sm text-ink-800 font-bold tabular-nums">{value}{sublabel && <span className="text-[10px] text-ink-400 ml-1 font-normal">{sublabel}</span>}</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-ink-100 overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${pct}%`, background: color ?? 'linear-gradient(90deg,#0ea5e9,#0d9488)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 2.5s linear infinite', backgroundSize: '200% 100%' }} />
        </div>
      </div>
    </div>
  )
}
