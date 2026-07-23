import { useState } from 'react'
import { ArrowLeft, FileCode2, Database, Workflow, FlaskConical, Lightbulb, Package, TriangleAlert as AlertTriangle, ShieldAlert, TrendingUp, ChevronRight, Download, Share2, GitCommitVertical as GitCommit, Boxes, FileWarning } from 'lucide-react'
import type { ReportData } from '../data/mockReport'
import { riskStyles } from '../components/RiskBadge'
import Gauge from '../components/Gauge'
import MiniBar from '../components/MiniBar'
import { RiskBadge } from '../components/RiskBadge'

type Tab = 'files' | 'database' | 'functional' | 'tests' | 'recommendations' | 'dependencies'

const tabs: { id: Tab; label: string; icon: typeof FileCode2 }[] = [
  { id: 'files', label: 'Affected Files', icon: FileCode2 },
  { id: 'database', label: 'Database Changes', icon: Database },
  { id: 'functional', label: 'Functional Areas', icon: Workflow },
  { id: 'tests', label: 'Test Coverage', icon: FlaskConical },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'dependencies', label: 'Dependencies', icon: Package },
]

const changeStyles: Record<string, string> = {
  modified: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  added: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  deleted: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const typeIcon: Record<string, string> = {
  service: '⚙', controller: '🎛', model: '🗃', config: '⚙', test: '✓', migration: '⇄', feature: '🥒',
}

export default function ReportScreen({ report, onBack }: { report: ReportData; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('files')
  const r = riskStyles[report.riskLevel]

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button onClick={onBack} className="btn-ghost border border-ink-700/60">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-ink-400 mb-1">
            <span className="font-mono text-sky-400">{report.ticketId}</span>
            <ChevronRight className="w-3 h-3" />
            <span>Impact Report</span>
          </div>
          <h2 className="text-2xl font-bold text-white truncate">{report.ticketSummary}</h2>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost border border-ink-700/60"><Share2 className="w-4 h-4" /> Share</button>
          <button className="btn-ghost border border-ink-700/60"><Download className="w-4 h-4" /> Export</button>
        </div>
      </div>

      {/* Top summary card */}
      <div className={`card p-6 md:p-8 mb-6 relative overflow-hidden ${r.border}`}>
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${r.bg} blur-3xl opacity-50`} />
        <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-8 items-center">
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <Gauge value={report.riskScore} label={`${report.riskLevel} Risk`} sublabel="0–100 scale" />
          </div>

          {/* Center */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-white">Overall Impact Risk</h3>
              <RiskBadge level={report.riskLevel} />
            </div>
            <p className="text-sm text-ink-300 leading-relaxed mb-5">{report.summary}</p>

            {/* Score breakdown */}
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              <MiniBar label="Affected files" value={report.scoreBreakdown.files} color="linear-gradient(90deg,#0ea5e9,#38bdf8)" />
              <MiniBar label="Database changes" value={report.scoreBreakdown.database} color="linear-gradient(90deg,#f59e0b,#fbbf24)" />
              <MiniBar label="Functional scope" value={report.scoreBreakdown.functional} color="linear-gradient(90deg,#0d9488,#2dd4bf)" />
              <MiniBar label="Test coverage gap" value={report.scoreBreakdown.tests} color="linear-gradient(90deg,#8b5cf6,#a78bfa)" />
            </div>
          </div>

          {/* Right stats */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:w-44">
            <StatTile icon={FileCode2} value={report.affectedFiles.length} label="Files" tone="sky" />
            <StatTile icon={Database} value={report.dbChanges.length} label="DB ops" tone="amber" />
            <StatTile icon={Workflow} value={report.functionalAreas.length} label="Areas" tone="teal" />
            <StatTile icon={FlaskConical} value={report.testCases.length} label="Tests" tone="violet" />
          </div>
        </div>
      </div>

      {/* Quick risk flags */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <FlagCard icon={ShieldAlert} tone="red" title="Critical Risks" value="2" desc="DB migration + auth fallback" />
        <FlagCard icon={TrendingUp} tone="amber" title="Regression Surface" value="6 services" desc="Legacy single-currency assumptions" />
        <FlagCard icon={FileWarning} tone="sky" title="New Artifacts" value="4 files" desc="2 models + migration + config" />
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
                active ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/10 text-white border border-sky-500/30' : 'text-ink-300 hover:text-white hover:bg-ink-700/40 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
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

      <p className="text-center text-xs text-ink-500 mt-6">Generated {report.generatedAt} · AI Impact Analyser</p>
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
    <div className="flex items-center gap-3 rounded-xl bg-ink-900/50 border border-ink-700/40 px-3 py-2.5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${tones[tone]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <div className="text-xl font-bold text-white tabular-nums leading-none">{value}</div>
        <div className="text-[11px] text-ink-400 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

function FlagCard({ icon: Icon, tone, title, value, desc }: { icon: typeof FileCode2; tone: string; title: string; value: string; desc: string }) {
  const tones: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  }
  const t = tones[tone]
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${t.bg} ${t.text} ${t.border}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs text-ink-400">{title}</div>
        <div className="text-xl font-bold text-white">{value}</div>
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
          <tr className="text-left text-xs text-ink-400 uppercase tracking-wider border-b border-ink-700/40">
            <th className="py-3 pr-4 font-semibold">File</th>
            <th className="py-3 px-4 font-semibold">Type</th>
            <th className="py-3 px-4 font-semibold">Change</th>
            <th className="py-3 px-4 font-semibold">Risk</th>
            <th className="py-3 px-4 font-semibold text-right">Lines</th>
            <th className="py-3 pl-4 font-semibold">Reason</th>
          </tr>
        </thead>
        <tbody>
          {report.affectedFiles.map((f) => (
            <tr key={f.path} className="border-b border-ink-700/20 hover:bg-ink-700/20 transition-colors">
              <td className="py-3 pr-4 font-mono text-ink-100 text-xs">{f.path}</td>
              <td className="py-3 px-4"><span className="text-lg">{typeIcon[f.type]}</span></td>
              <td className="py-3 px-4">
                <span className={`chip border ${changeStyles[f.change]}`}>{f.change}</span>
              </td>
              <td className="py-3 px-4"><RiskBadge level={f.risk} size="sm" /></td>
              <td className="py-3 px-4 text-right tabular-nums text-ink-200">+{f.linesChanged}</td>
              <td className="py-3 pl-4 text-ink-300 text-xs max-w-xs">{f.reason}</td>
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
          <div key={i} className="flex items-start gap-4 rounded-xl bg-ink-900/50 border border-ink-700/40 p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${s.bg} ${s.text} ${s.border} shrink-0`}>
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-sm text-white font-semibold">{c.operation}</span>
                <span className="font-mono text-sm text-sky-300">{c.table}</span>
                <RiskBadge level={c.risk} size="sm" />
              </div>
              <code className="text-xs text-ink-300 font-mono block">{c.detail}</code>
              <div className="text-xs text-ink-500 mt-1.5 flex items-center gap-1.5">
                <GitCommit className="w-3 h-3" /> {c.migration}
              </div>
            </div>
          </div>
        )
      })}
      <div className="flex items-start gap-3 rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 mt-4">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-ink-200">
          <span className="font-semibold text-amber-300">Migration order matters.</span> Apply <code className="font-mono text-xs">0042</code> before <code className="font-mono text-xs">0043</code> — <code className="font-mono text-xs">order_items</code> references the new <code className="font-mono text-xs">currency_code</code> domain.
        </div>
      </div>
    </div>
  )
}

function FunctionalTab({ report }: { report: ReportData }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {report.functionalAreas.map((a) => {
        const s = riskStyles[a.impact]
        return (
          <div key={a.name} className={`rounded-xl border ${s.border} bg-ink-900/50 p-5`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white">{a.name}</h4>
              <RiskBadge level={a.impact} size="sm" />
            </div>
            <p className="text-sm text-ink-300 mb-3">{a.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {a.affectedFlows.map((f) => (
                <span key={f} className={`chip ${s.bg} ${s.text} border ${s.border}`}>{f}</span>
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
    regression: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    new: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    integration: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  }
  return (
    <div className="space-y-2.5">
      {report.testCases.map((t) => (
        <div key={t.id} className="flex items-center gap-4 rounded-xl bg-ink-900/50 border border-ink-700/40 p-4 hover:border-ink-600/60 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <FlaskConical className="w-4.5 h-4.5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-400">{t.id}</span>
              <span className="text-sm text-ink-100 font-medium">{t.title}</span>
            </div>
            <div className="text-xs text-ink-500 mt-0.5 font-mono">{t.feature}</div>
          </div>
          <span className={`chip border ${typeTone[t.type]}`}>{t.type}</span>
          <span className={`chip ${t.status === 'required' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-ink-700/40 text-ink-300 border border-ink-600/40'}`}>
            {t.status}
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
          <div key={i} className="flex items-start gap-4 rounded-xl bg-ink-900/50 border border-ink-700/40 p-4">
            <span className={`chip ${t.bg} ${t.text} ${t.border} border font-bold shrink-0`}>{rec.priority}</span>
            <div className="flex-1">
              <p className="text-sm text-ink-100">{rec.text}</p>
              <span className="text-xs text-ink-500 mt-1 inline-block">{rec.category}</span>
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
      {report.dependencies.map((d) => (
        <div key={d.name} className="flex items-center gap-4 rounded-xl bg-ink-900/50 border border-ink-700/40 p-4">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
            <Boxes className="w-4.5 h-4.5 text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white font-semibold">{d.name}</span>
              <span className="font-mono text-xs text-sky-300">{d.version}</span>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">{d.reason}</p>
          </div>
          <span className="chip bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">new</span>
        </div>
      ))}
    </div>
  )
}
