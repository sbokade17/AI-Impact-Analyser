import type { RiskLevel } from '../data/mockReport'

export const riskStyles: Record<RiskLevel, { bg: string; text: string; border: string; dot: string; ring: string }> = {
  High: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500', ring: 'ring-red-500/20' },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500', ring: 'ring-amber-500/20' },
  Low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
}

export function RiskBadge({ level, size = 'md' }: { level: RiskLevel; size?: 'sm' | 'md' }) {
  const s = riskStyles[level]
  return (
    <span className={`chip ${s.bg} ${s.text} ${s.border} border ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse-soft`} />
      {level}
    </span>
  )
}
