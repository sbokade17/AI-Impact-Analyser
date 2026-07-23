import { useState } from 'react'
import {
  ArrowLeft, FileCode2, Database, Workflow, FlaskConical, Lightbulb, Package,
  AlertTriangle, ShieldAlert, TrendingUp, ChevronRight, Download, Share2,
  GitCommit, Boxes, FileWarning, Sparkles, Clock, Hash, Layers,
} from 'lucide-react'
import type { ReportData } from '../data/mockReport'
import { riskStyles, RiskBadge } from '../components/RiskBadge'
import Gauge from '../components/Gauge'
import MiniBar from '../components/MiniBar'
import DonutChart from '../components/DonutChart'
import CountUp from '../components/CountUp'
import RingProgress from '../components/RingProgress'

type Tab = 'files' | 'database' | 'functional' | 'tests' | 'recommendations' | 'dependencies'

const tabs: { id: Tab; label: string; icon: typeof FileCode2; count?: number }[] = [
  { id: 'files', label: 'Affected Files', icon: FileCode2 },
  { id: 'database', label: 'Database Changes', icon: Database },
  { id: 'functional', label: 'Functional Areas', icon: Workflow },
  { id: 'tests', label: 'Test Coverage', icon: FlaskConical },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'dependencies', label: 'Dependencies', icon: Package },
]

const changeStyles: Record<string, string> = {
  modified: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  added: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  deleted: 'bg-red-500/10 text-red-400 border-red-500/25',
}

const typeIcon: Record<string, string> = {
  service: '⚙', controller: '🎛', model: '🗃', config: '⚙', test: '✓', migration: '⇄', feature: '🥒',
}

export default function ReportScreen({ report, onBack }: { report: ReportData; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('files')
  const r = riskStyles[report.riskLevel]
  const counts: Record<Tab, number> = {
    files: report.affectedFiles.length,
    database: report.dbChanges.length,
    functional: report.functionalAreas.length,
    tests: report.testCases.length,
    recommendations: report.recommendations.length,
    dependencies: report.dependencies.length,
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6 animate-slide-up">
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-ink-400 mb-1.5">
            <span className="font-mono text-sky-400 font-semibold">{report.ticketId}</span>
            <ChevronRight className="w-3 h-3" />
            <span>Impact Report</span>
            <span className="text-ink-600">·</span>
            <Clock className="w-3 h-3" /> {report.generatedAt}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{report.ticketSummary}</h2>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost"><Share2 className="w-4 h-4" /> Share</button>
          <button className="btn-ghost"><Download className="w-4 h-4" /> Export</button>
        </div>
      </div>

      {/* Hero summary card */}
      <div className={`card p-6 md:p-8 mb-6 animate-slide-up stagger-1 relative overflow-hidden ${r.border}`}>
        <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full ${r.bg} blur-3xl opacity-60`} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-8 items-center">
          {/* Gauge */}
          <div className="flex flex-col items-center justify-center">
            <Gauge value={report.riskScore} label={`${report.riskLevel} Risk`} sublabel="impact score" size={210} />
          </div>

          {/* Center content */}
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-white">Overall Impact Risk</h3>
              <RiskBadge level={report.riskLevel} size="lg" />
            </div>
            <p className="text-sm text-ink-300 leading-relaxed mb-6">{report.summary}</p>

            {/* Score breakdown bars */}
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              <MiniBar label="Affected files" value={report.scoreBreakdown.files} color="linear-gradient(90deg,#0ea5e9,#38bdf8)" />
              <MiniBar label="Database changes" value={report.scoreBreakdown.database} color="linear-gradient(90deg,#f59e0b,#fbbf24)" />
              <MiniBar label="Functional scope" value={report.scoreBreakdown.functional} color="linear-gradient(90deg,#0d9488,#2dd4bf)" />
              <MiniBar label="Test coverage gap" value={report.scoreBreakdown.tests} color="linear-gradient(90deg,#8b5cf6,#a78bfa)" />
            </div>
          </div>

          {/* Right stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:w-48">
            <StatTile icon={FileCode2} value={report.affectedFiles.length} label="Files" tone="sky" />
            <StatTile icon={Database} value={report.dbChanges.length} label="DB ops" tone="amber" />
            <StatTile icon={Workflow} value={report.functionalAreas.length} label="Areas" tone="teal" />
            <StatTile icon={FlaskConical} value={report.testCases.length} label="Tests" tone="violet" />
          </div>
        </div>
      </div>

      {/* Risk flags + donut row */}
      <div className="grid lg:grid-cols-[1fr_1fr_1fr_auto] gap-4 mb-6">
        <FlagCard icon={ShieldAlert} tone="red" title="Critical Risks" value="2" desc="DB migration + auth fallback" delay="stagger-2" />
        <FlagCard icon={TrendingUp} tone="amber" title="Regression Surface" value="6 svc" desc="Legacy single-currency assumptions" delay="stagger-3" />
        <FlagCard icon={FileWarning} tone="sky" title="New Artifacts" value="4 files" desc="2 models + migration + config" delay="stagger-4" />
        {/* Donut */}
        <div className="card p-5 flex items-center gap-4 animate-slide-up stagger-5">
          <DonutChart
            size={110}
            thickness={16}
            data={[
              { label: 'Files', value: report.scoreBreakdown.files, color: '#0ea5e9' },
              { label: 'DB', value: report.scoreBreakdown.database, color: '#f59e0b' },
              { label: 'Func', value: report.scoreBreakdown.functional, color: '#0d9488' },
              { label: 'Tests', value: report.scoreBreakdown.tests, color: '#8b5cf6' },
            ]}
            centerValue={String(report.riskScore)}
            centerLabel="score"
          />
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-ink-200 uppercase tracking-wider">Score Mix</div>
            {[
              { c: '#0ea5e9', l: 'Files' },
              { c: '#f59e0b', l: 'Database' },
              { c: '#0d9488', l: 'Functional' },
              { c: '#8b5cf6', l: 'Tests' },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: x.c }} />
                <span className="text-ink-300">{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-gradient-to-r from-sky-500/20 via-cyan-500/10 to-transparent text-white border border-sky-500/30' : 'text-ink-300 hover:text-white hover:bg-ink-700/30 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
              <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded-md ${active ? 'bg-sky-500/20 text-sky-300' : 'bg-ink-800/60 text-ink-400'}`}>{counts[t.id]}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="card p-6 animate-fade-in" key={tab}>
        {tab === 'files' && <FilesTab report={report} />}
        {tab === 'database' && <DatabaseTab report={report} />}
        {tab === 'functional' && <FunctionalTab report={report} />}
        {tab === 'tests' && <TestsTab report={report} />}
        {tab === 'recommendations' && <RecommendationsTab report={report} />}
        {tab === 'dependencies' && <DependenciesTab report={report} />}
      </div>

      <p className="text-center text-xs text-ink-500 mt-6 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3" /> Generated {report.generatedAt} · AI Impact Analyser
      </p>
    </div>
  )
}

/* ---------- Sub-components ---------- */

function StatTile({ icon: Icon, value, label, tone }: { icon: typeof FileCode2; value: number; label: string; tone: string }) {
  const tones: Record<string, string> = {
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl bg-ink-900/50 border border-ink-700/40 px-3.5 py-3 hover:border-ink-600/60 transition-colors">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${tones[tone]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-white tabular-nums leading-none">
          <CountUp value={value} />
        </div>
        <div className="text-[11px] text-ink-400 mt-1">{label}</div>
      </div>
    </div>
  )
}

function FlagCard({ icon: Icon, tone, title, value, desc, delay }: { icon: typeof FileCode2; tone: string; title: string; value: string; desc: string; delay: string }) {
  const tones: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  }
  const t = tones[tone]
  return (
    <div className={`card-hover p-5 flex items-start gap-4 animate-slide-up ${delay}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${t.bg} ${t.text} ${t.border}`}>
        <Icon className="w-5.5 h-5.5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-ink-400 font-medium">{title}</div>
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        <div className="text-xs text-ink-500 mt-0.5">{desc}</div>
      </div>
    </div>
  )
}

function FilesTab({ report }: { report: ReportData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] text-ink-400 uppercase tracking-widest border-b border-ink-700/40">
            <th className="py-3 pr-4 font-bold">File</th>
            <th className="py-3 px-4 font-bold">Type</th>
            <th className="py-3 px-4 font-bold">Change</th>
            <th className="py-3 px-4 font-bold">Risk</th>
            <th className="py-3 px-4 font-bold text-right">Lines</th>
            <th className="py-3 pl-4 font-bold">Reason</th>
          </tr>
        </thead>
        <tbody>
          {report.affectedFiles.map((f, i) => (
            <tr key={f.path} className="border-b border-ink-700/20 hover:bg-ink-700/20 transition-colors group">
              <td className="py-3.5 pr-4 font-mono text-ink-100 text-xs flex items-center gap-2">
                <span className="text-ink-600 text-xs tabular-nums w-5">{String(i + 1).padStart(2, '0')}</span>
                {f.path}
              </td>
              <td className="py-3.5 px-4"><span className="text-lg">{typeIcon[f.type]}</span></td>
              <td className="py-3.5 px-4">
                <span className={`chip border ${changeStyles[f.change]}`}>{f.change}</span>
              </td>
              <td className="py-3.5 px-4"><RiskBadge level={f.risk} size="sm" /></td>
              <td className="py-3.5 px-4 text-right tabular-nums text-ink-200 font-semibold">+{f.linesChanged}</td>
              <td className="py-3.5 pl-4 text-ink-300 text-xs max-w-xs">{f.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DatabaseTab({ report }: { report: ReportData }) {
  return (
    <div className="space-y-3">
      {report.dbChanges.map((c, i) => {
        const s = riskStyles[c.risk]
        return (
          <div key={i} className="flex items-start gap-4 rounded-xl bg-ink-900/50 border border-ink-700/40 p-4 hover:border-ink-600/60 transition-colors">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${s.bg} ${s.text} ${s.border} shrink-0`}>
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="font-mono text-sm text-white font-bold">{c.operation}</span>
                <span className="font-mono text-sm text-sky-300">{c.table}</span>
                <RiskBadge level={c.risk} size="sm" />
              </div>
              <code className="text-xs text-ink-300 font-mono block bg-ink-960/50 rounded-lg px-3 py-2 border border-ink-700/30">{c.detail}</code>
              <div className="text-xs text-ink-500 mt-2 flex items-center gap-1.5">
                <GitCommit className="w-3 h-3" /> {c.migration}
              </div>
            </div>
          </div>
        )
      })}
      <div className="flex items-start gap-3 rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 mt-4">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-ink-200">
          <span className="font-bold text-amber-300">Migration order matters.</span> Apply <code className="font-mono text-xs bg-ink-960/60 px-1.5 py-0.5 rounded">0042</code> before <code className="font-mono text-xs bg-ink-960/60 px-1.5 py-0.5 rounded">0043</code> — <code className="font-mono text-xs bg-ink-960/60 px-1.5 py-0.5 rounded">order_items</code> references the new <code className="font-mono text-xs bg-ink-960/60 px-1.5 py-0.5 rounded">currency_code</code> domain.
        </div>
      </div>
    </div>
  )
}

function FunctionalTab({ report }: { report: ReportData }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {report.functionalAreas.map((a, i) => {
        const s = riskStyles[a.impact]
        return (
          <div key={a.name} className={`rounded-xl border ${s.border} bg-ink-900/50 p-5 card-hover animate-slide-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <RingProgress value={a.impact === 'High' ? 85 : a.impact === 'Medium' ? 55 : 25} color={s.hex} size={44} stroke={5} />
                <h4 className="font-bold text-white">{a.name}</h4>
              </div>
              <RiskBadge level={a.impact} size="sm" />
            </div>
            <p className="text-sm text-ink-300 mb-3 leading-relaxed">{a.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {a.affectedFlows.map((f) => (
                <span key={f} className={`chip ${s.bg} ${s.text} border ${s.border}`}>
                  <Workflow className="w-3 h-3" /> {f}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TestsTab({ report }: { report: ReportData }) {
  const typeTone: Record<string, string> = {
    regression: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    new: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    integration: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  }
  return (
    <div className="space-y-2.5">
      {report.testCases.map((t, i) => (
        <div key={t.id} className={`flex items-center gap-4 rounded-xl bg-ink-900/50 border border-ink-700/40 p-4 hover:border-ink-600/60 transition-colors animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <FlaskConical className="w-4.5 h-4.5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-400 font-semibold">{t.id}</span>
              <span className="text-sm text-ink-100 font-medium">{t.title}</span>
            </div>
            <div className="text-xs text-ink-500 mt-0.5 font-mono flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> {t.feature}
            </div>
          </div>
          <span className={`chip border ${typeTone[t.type]}`}>{t.type}</span>
          <span className={`chip ${t.status === 'required' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-ink-700/40 text-ink-300 border border-ink-600/40'}`}>
            {t.status === 'required' && <AlertTriangle className="w-3 h-3" />}{t.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function RecommendationsTab({ report }: { report: ReportData }) {
  const prioTone: Record<string, { bg: string; text: string; border: string }> = {
    P0: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    P1: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    P2: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  }
  return (
    <div className="space-y-3">
      {report.recommendations.map((rec, i) => {
        const t = prioTone[rec.priority]
        return (
          <div key={i} className={`flex items-start gap-4 rounded-xl bg-ink-900/50 border border-ink-700/40 p-4 hover:border-ink-600/60 transition-colors animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
            <span className={`chip ${t.bg} ${t.text} ${t.border} border font-extrabold shrink-0 px-3 py-1.5`}>{rec.priority}</span>
            <div className="flex-1">
              <p className="text-sm text-ink-100 leading-relaxed">{rec.text}</p>
              <span className="text-xs text-ink-500 mt-1.5 inline-flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> {rec.category}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DependenciesTab({ report }: { report: ReportData }) {
  return (
    <div className="space-y-3">
      {report.dependencies.map((d, i) => (
        <div key={d.name} className={`flex items-center gap-4 rounded-xl bg-ink-900/50 border border-ink-700/40 p-4 hover:border-ink-600/60 transition-colors animate-slide-up stagger-${i + 1}`}>
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-white font-bold">{d.name}</span>
              <span className="font-mono text-xs text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">{d.version}</span>
            </div>
            <p className="text-xs text-ink-400 mt-1">{d.reason}</p>
          </div>
          <span className="chip bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" /> new
          </span>
        </div>
      ))}
    </div>
  )
}
