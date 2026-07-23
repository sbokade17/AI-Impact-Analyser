import type { RiskLevel } from '../data/mockReport'
import { riskConfig } from './RiskGauge'

export function RiskPill({ level, size = 'md' }: { level: RiskLevel; size?: 'sm' | 'md' | 'lg' }) {
  const cfg = riskConfig[level]
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-[11px]',
    lg: 'px-3.5 py-1.5 text-xs',
  }
  return (
    <span
      className={`chip border ${sizes[size]}`}
      style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}33` }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: cfg.color }} />
      {level}
    </span>
  )
}
