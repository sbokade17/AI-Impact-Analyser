import type { RiskLevel } from '../data/mockReport'

export const riskStyles: Record<RiskLevel, { bg: string; text: string; border: string; dot: string; glow: string; hex: string; soft: string }> = {
  High: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500', glow: 'glow-red', hex: '#ef4444', soft: 'rgba(239,68,68,0.12)' },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500', glow: 'glow-amber', hex: '#f59e0b', soft: 'rgba(245,158,11,0.12)' },
  Low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500', glow: 'glow-teal', hex: '#10b981', soft: 'rgba(16,185,129,0.12)' },
}

export function RiskBadge({ level, size = 'md' }: { level: RiskLevel; size?: 'sm' | 'md' | 'lg' }) {
  const s = riskStyles[level]
  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-[11px]',
    lg: 'px-3.5 py-1.5 text-xs',
  }
  return (
    <span className={`chip border ${s.bg} ${s.text} ${s.border} ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse-soft`} />
      {level}
    </span>
  )
}
