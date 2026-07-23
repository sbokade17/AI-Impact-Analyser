import { useState } from 'react'
import { Github, Database, BookOpen, FileCode2, Check, ArrowRight, Upload, Link2, Lock, FolderTree, RefreshCw } from 'lucide-react'
import Accordion from '../components/Accordion'

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

const connectedBadge = (
  <span className="chip bg-emerald2/10 text-emerald2 border border-emerald2/20">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald2 animate-pulse-soft" /> Connected
  </span>
)

export default function SetupScreen({ onContinue }: { onContinue: () => void }) {
  const [state, setState] = useState<SourceState>(initial)

  return (
    <div className="max-w-3xl mx-auto px-6 animate-fade-in">
      {/* Header */}
      <header className="mb-8 animate-slide-up">
        <div className="flex items-center gap-2 text-xs text-ember font-mono font-semibold uppercase tracking-widest mb-3">
          <span className="w-8 h-px bg-ember/40" /> Step 01 · Knowledge Base
        </div>
        <h2 className="font-display text-4xl font-bold text-white tracking-tight">Setup Context</h2>
        <p className="text-zinc-500 mt-2 max-w-xl text-[15px] leading-relaxed">
          Configure the baseline sources the AI engine indexes. These power every impact analysis run.
        </p>
      </header>

      {/* Accordion panels */}
      <div className="space-y-3">
        <Accordion
          title="Git Repository"
          icon={<Github className="w-4.5 h-4.5 text-zinc-400" />}
          defaultOpen
          badge={connectedBadge}
          accentColor="#ff453a"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Repository URL</label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input className="input pl-11 font-mono text-sm" value={state.repo.url} onChange={(e) => setState({ ...state, repo: { ...state.repo, url: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className="label">Access Token</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input className="input pl-11 font-mono text-sm" value={state.repo.token} onChange={(e) => setState({ ...state, repo: { ...state.repo, token: e.target.value } })} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-white/5">
            <Stat value="1,284" label="Files indexed" />
            <Stat value="2h ago" label="Last sync" />
            <Stat value="main" label="Branch" />
          </div>
        </Accordion>

        <Accordion
          title="Feature Files (Gherkin)"
          icon={<FileCode2 className="w-4.5 h-4.5 text-zinc-400" />}
          defaultOpen
          badge={connectedBadge}
          accentColor="#ff9f0a"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Repository path</label>
              <div className="relative">
                <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input className="input pl-11 font-mono text-sm" value={state.features.path} onChange={(e) => setState({ ...state, features: { ...state.features, path: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className="label">Upload .feature files</label>
              <div className="input flex items-center justify-center gap-2 hover:border-amber2/40 hover:bg-amber2/5 cursor-pointer text-zinc-500 transition-colors group">
                <Upload className="w-4 h-4 group-hover:text-amber2 transition-colors" />
                <span className="text-sm">Drop files here</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-white/5">
            <Stat value={String(state.features.count)} label="Feature files" />
            <Stat value="312" label="Scenarios" />
            <Stat value="54" label="Tags" />
          </div>
        </Accordion>

        <Accordion
          title="Database Schema"
          icon={<Database className="w-4.5 h-4.5 text-zinc-400" />}
          badge={connectedBadge}
          accentColor="#30d158"
        >
          <label className="label">Connection string</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Database className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input className="input pl-11 font-mono text-sm" value={state.database.conn} onChange={(e) => setState({ ...state, database: { ...state.database, conn: e.target.value } })} />
            </div>
            <button className="btn-ghost group">
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-white/5">
            <Stat value={String(state.database.tables)} label="Tables" />
            <Stat value="61" label="Foreign keys" />
            <Stat value="104" label="Indexes" />
          </div>
        </Accordion>

        <Accordion
          title="User Guide / Knowledge Base"
          icon={<BookOpen className="w-4.5 h-4.5 text-zinc-400" />}
          badge={connectedBadge}
          accentColor="#8b5cf6"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-violet-400/30 hover:bg-violet-500/5 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-sm text-zinc-300 font-medium">Drop .md, .pdf, or .txt</p>
              <p className="text-xs text-zinc-600 mt-1">Up to 25 MB per file</p>
            </div>
            <div className="space-y-2">
              {state.docs.files.map((f) => (
                <div key={f.name} className="flex items-center gap-3 rounded-xl bg-black/30 border border-white/5 px-3.5 py-3 hover:border-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-zinc-200 truncate font-medium">{f.name}</div>
                    <div className="text-xs text-zinc-600">{f.size}</div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald2/15 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Accordion>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2.5 text-sm">
          <div className="w-7 h-7 rounded-full bg-emerald2/15 border border-emerald2/25 flex items-center justify-center">
            <Check className="w-4 h-4 text-emerald2" />
          </div>
          <span className="text-zinc-400">Knowledge base <span className="text-emerald2 font-semibold">ready</span> · <span className="text-zinc-200 font-semibold">1,284</span> artifacts indexed</span>
        </div>
        <button onClick={onContinue} className="btn-primary">
          Continue to Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  )
}
