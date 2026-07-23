import type { FunctionalArea } from '../data/mockReport'
import { riskConfig } from './RiskGauge'
import { RiskPill } from './RiskPill'
import { Workflow, ChevronRight } from 'lucide-react'

export default function FlowTimeline({ areas }: { areas: FunctionalArea[] }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-ember/30 via-amber2/20 to-emerald2/20" />

      <div className="space-y-4">
        {areas.map((area, i) => {
          const cfg = riskConfig[area.impact]
          return (
            <div key={area.name} className={`relative pl-12 animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
              {/* Node */}
              <div
                className="absolute left-2.5 top-3 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: cfg.color, background: '#09090b' }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: cfg.color }} />
              </div>

              <div className="panel-hover p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-zinc-500" />
                    <h4 className="font-display font-semibold text-zinc-200 text-sm">{area.name}</h4>
                  </div>
                  <RiskPill level={area.impact} size="sm" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3">{area.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.affectedFlows.map((flow) => (
                    <span
                      key={flow}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}22` }}
                    >
                      <ChevronRight className="w-3 h-3" /> {flow}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
