import { useState } from 'react'
import { Github, Database, BookOpen, FileCode2, Check, ArrowRight, Upload, Link2, ShieldCheck, RefreshCw } from 'lucide-react'

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

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Step 1 · Knowledge Base
        </div>
        <h2 className="text-3xl font-bold text-white">Setup Configuration</h2>
        <p className="text-ink-400 mt-2 max-w-2xl">
          Provide baseline context for the AI engine. These sources are indexed once and reused across every impact analysis run.
        </p>
      </header>

      <div className="grid gap-5">
        {/* Repository */}
        <SectionCard
          icon={Github}
          title="Git Repository"
          desc="Source code structure & dependency graph"
          connected={state.repo.connected}
        >
          <div className="grid sm:grid-cols-[1fr_1fr] gap-3">
            <div>
              <label className="label">Repository URL</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input className="input pl-10" value={state.repo.url} onChange={(e) => setState({ ...state, repo: { ...state.repo, url: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className="label">Personal Access Token</label>
              <input className="input font-mono text-sm" value={state.repo.token} onChange={(e) => setState({ ...state, repo: { ...state.repo, token: e.target.value } })} />
            </div>
          </div>
          <StatRow items={[{ label: 'Files indexed', value: '1,284' }, { label: 'Last sync', value: '2h ago' }, { label: 'Branch', value: 'main' }]} />
        </SectionCard>

        {/* Feature files */}
        <SectionCard
          icon={FileCode2}
          title="Feature Files (Gherkin)"
          desc="Existing product behavior specifications"
          connected={state.features.connected}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Repository path</label>
              <input className="input font-mono text-sm" value={state.features.path} onChange={(e) => setState({ ...state, features: { ...state.features, path: e.target.value } })} />
            </div>
            <div>
              <label className="label">Or upload .feature files</label>
              <button className="input flex items-center justify-center gap-2 hover:border-sky-500/40 cursor-pointer text-ink-300">
                <Upload className="w-4 h-4" /> Drop files here
              </button>
            </div>
          </div>
          <StatRow items={[{ label: 'Feature files', value: String(state.features.count) }, { label: 'Scenarios', value: '312' }, { label: 'Tags', value: '54' }]} />
        </SectionCard>

        {/* Database */}
        <SectionCard
          icon={Database}
          title="Database Schema"
          desc="Tables, foreign keys, indexes & constraints"
          connected={state.database.connected}
        >
          <div>
            <label className="label">Connection string</label>
            <div className="flex gap-2">
              <input className="input font-mono text-sm" value={state.database.conn} onChange={(e) => setState({ ...state, database: { ...state.database, conn: e.target.value } })} />
              <button className="btn-ghost border border-ink-700/60 whitespace-nowrap">
                <RefreshCw className="w-4 h-4" /> Re-read
              </button>
            </div>
          </div>
          <StatRow items={[{ label: 'Tables', value: String(state.database.tables) }, { label: 'Foreign keys', value: '61' }, { label: 'Indexes', value: '104' }]} />
        </SectionCard>

        {/* Docs */}
        <SectionCard
          icon={BookOpen}
          title="User Guide / Knowledge Base"
          desc="End-user workflows & business rules"
          connected={state.docs.connected}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="border-2 border-dashed border-ink-700/60 rounded-xl p-6 text-center hover:border-sky-500/40 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-ink-400 mx-auto mb-2" />
              <p className="text-sm text-ink-300">Drop .md, .pdf, or .txt</p>
              <p className="text-xs text-ink-500 mt-1">Up to 25 MB per file</p>
            </div>
            <div className="space-y-2">
              {state.docs.files.map((f) => (
                <div key={f.name} className="flex items-center gap-3 rounded-lg bg-ink-900/60 border border-ink-700/50 px-3 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-ink-100 truncate">{f.name}</div>
                    <div className="text-xs text-ink-500">{f.size}</div>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink-700/40">
        <div className="text-sm text-ink-400">
          <span className="text-emerald-400 font-semibold">4/4 sources connected.</span> Knowledge base ready.
        </div>
        <button onClick={onContinue} className="btn-primary">
          Continue to Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function SectionCard({ icon: Icon, title, desc, connected, children }: { icon: typeof Github; title: string; desc: string; connected: boolean; children: React.ReactNode }) {
  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {connected && (
              <span className="chip bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
              </span>
            )}
          </div>
          <p className="text-sm text-ink-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function StatRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 border-t border-ink-700/30">
      {items.map((i) => (
        <div key={i.label} className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-white tabular-nums">{i.value}</span>
          <span className="text-xs text-ink-400">{i.label}</span>
        </div>
      ))}
    </div>
  )
}
