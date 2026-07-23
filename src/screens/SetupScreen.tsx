import { useState } from 'react'
import { Github, Database, BookOpen, FileCode2, Check, ArrowRight, Upload, Link2, ShieldCheck, RefreshCw, FolderTree, Lock } from 'lucide-react'
import CountUp from '../components/CountUp'

interface SourceState {
  repo: { url: string; token: string; connected: boolean }
  features: { path: string; count: number; connected: boolean }
  database: { conn: string; connected: boolean; tables: number }
  docs: { files: { name: string; size: string }[]; connected: boolean }
}

const initial: SourceState = {
  repo: { url: 'github.com/acme/payments-service', token: 'ghp_••••••••••••••••3A9c', connected: true },
  features: { path: '/features/**/*.feature', count: 47, connected: true },
  database: { conn: 'postgresql://reader@prod-db:5432/payments', connected: true, tables: 38 },
  docs: { files: [{ name: 'user-guide.md', size: '248 KB' }, { name: 'business-rules.pdf', size: '1.2 MB' }, { name: 'api-reference.txt', size: '86 KB' }], connected: true },
}

export default function SetupScreen({ onContinue }: { onContinue: () => void }) {
  const [state, setState] = useState<SourceState>(initial)
  const connectedCount = [state.repo, state.features, state.database, state.docs].filter((s) => s.connected).length

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-8 animate-slide-up">
        <div className="flex items-center gap-2 text-xs text-sky-600 font-bold uppercase tracking-widest mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Step 1 · Knowledge Base
        </div>
        <h2 className="text-4xl font-extrabold text-ink-900 tracking-tight">Setup Configuration</h2>
        <p className="text-ink-500 mt-2 max-w-2xl text-[15px] leading-relaxed">
          Provide baseline context for the AI engine. These sources are indexed once and reused across every impact analysis run.
        </p>

        {/* Progress strip */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`h-1.5 rounded-full transition-all duration-500 ${n <= connectedCount ? 'w-10 bg-gradient-to-r from-sky-400 to-teal-400' : 'w-6 bg-ink-200'}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-ink-700"><CountUp value={connectedCount} />/4 sources connected</span>
        </div>
      </header>

      <div className="grid gap-5">
        <SectionCard icon={Github} index={1} title="Git Repository" desc="Source code structure & dependency graph" connected={state.repo.connected} accent="sky">
          <div className="grid sm:grid-cols-[1fr_1fr] gap-4">
            <div>
              <label className="label">Repository URL</label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input className="input pl-11" value={state.repo.url} onChange={(e) => setState({ ...state, repo: { ...state.repo, url: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className="label">Personal Access Token</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input className="input pl-11 font-mono text-sm" value={state.repo.token} onChange={(e) => setState({ ...state, repo: { ...state.repo, token: e.target.value } })} />
              </div>
            </div>
          </div>
          <StatRow items={[{ label: 'Files indexed', value: '1,284' }, { label: 'Last sync', value: '2h ago' }, { label: 'Branch', value: 'main' }]} />
        </SectionCard>

        <SectionCard icon={FileCode2} index={2} title="Feature Files (Gherkin)" desc="Existing product behavior specifications" connected={state.features.connected} accent="teal">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Repository path</label>
              <div className="relative">
                <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input className="input pl-11 font-mono text-sm" value={state.features.path} onChange={(e) => setState({ ...state, features: { ...state.features, path: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className="label">Or upload .feature files</label>
              <div className="input flex items-center justify-center gap-2 hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer text-ink-500 transition-colors group">
                <Upload className="w-4 h-4 group-hover:text-teal-600 transition-colors" />
                <span className="text-sm">Drop files here</span>
              </div>
            </div>
          </div>
          <StatRow items={[{ label: 'Feature files', value: String(state.features.count) }, { label: 'Scenarios', value: '312' }, { label: 'Tags', value: '54' }]} />
        </SectionCard>

        <SectionCard icon={Database} index={3} title="Database Schema" desc="Tables, foreign keys, indexes & constraints" connected={state.database.connected} accent="amber">
          <div>
            <label className="label">Connection string</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Database className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input className="input pl-11 font-mono text-sm" value={state.database.conn} onChange={(e) => setState({ ...state, database: { ...state.database, conn: e.target.value } })} />
              </div>
              <button className="btn-ghost whitespace-nowrap group">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> Re-read
              </button>
            </div>
          </div>
          <StatRow items={[{ label: 'Tables', value: String(state.database.tables) }, { label: 'Foreign keys', value: '61' }, { label: 'Indexes', value: '104' }]} />
        </SectionCard>

        <SectionCard icon={BookOpen} index={4} title="User Guide / Knowledge Base" desc="End-user workflows & business rules" connected={state.docs.connected} accent="violet">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-ink-200 rounded-xl p-8 text-center hover:border-violet-300 hover:bg-violet-50/40 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-violet-600" />
              </div>
              <p className="text-sm text-ink-700 font-medium">Drop .md, .pdf, or .txt</p>
              <p className="text-xs text-ink-400 mt-1">Up to 25 MB per file</p>
            </div>
            <div className="space-y-2">
              {state.docs.files.map((f) => (
                <div key={f.name} className="flex items-center gap-3 rounded-xl bg-white/60 border border-ink-200 px-3.5 py-3 hover:border-ink-300 hover:bg-white transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink-800 truncate font-medium">{f.name}</div>
                    <div className="text-xs text-ink-400">{f.size}</div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-ink-200">
        <div className="flex items-center gap-2.5 text-sm">
          <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-ink-600">Knowledge base <span className="text-emerald-600 font-semibold">ready</span> · indexed <span className="text-ink-900 font-semibold">1,284</span> artifacts</span>
        </div>
        <button onClick={onContinue} className="btn-primary text-base px-7 py-3.5">
          Continue to Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
  sky: { bg: 'from-sky-100 to-sky-50', border: 'border-sky-200', text: 'text-sky-600' },
  teal: { bg: 'from-teal-100 to-teal-50', border: 'border-teal-200', text: 'text-teal-600' },
  amber: { bg: 'from-amber-100 to-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
  violet: { bg: 'from-violet-100 to-violet-50', border: 'border-violet-200', text: 'text-violet-600' },
}

function SectionCard({ icon: Icon, index, title, desc, connected, accent, children }: { icon: typeof Github; index: number; title: string; desc: string; connected: boolean; accent: string; children: React.ReactNode }) {
  const a = accentMap[accent]
  return (
    <div className="card-hover p-6 animate-slide-up">
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.bg} border ${a.border} flex items-center justify-center shrink-0 relative`}>
          <Icon className={`w-5.5 h-5.5 ${a.text}`} />
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-ink-200 text-[10px] font-bold text-ink-500 flex items-center justify-center shadow-sm">{index}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-ink-900">{title}</h3>
            {connected && (
              <span className="chip bg-emerald-50 text-emerald-600 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" /> Connected
              </span>
            )}
          </div>
          <p className="text-sm text-ink-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function StatRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 pt-4 border-t border-ink-200">
      {items.map((i) => (
        <div key={i.label} className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-ink-900 tabular-nums tracking-tight">{i.value}</span>
          <span className="text-xs text-ink-500 font-medium">{i.label}</span>
        </div>
      ))}
    </div>
  )
}
