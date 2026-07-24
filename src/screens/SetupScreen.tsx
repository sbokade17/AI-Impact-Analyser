import { useEffect, useState } from 'react'
import { Github, Database, BookOpen, FileCode2, Check, ArrowRight, Upload, Link2, Lock, FolderTree, RefreshCw } from 'lucide-react'
import Accordion from '../components/Accordion'
import { BACKEND_CONFIGURED, validateSourceConnection } from '../api/backend'

export interface SourceState {
  repo: { url: string; token: string; connected: boolean; indexedFiles: number; lastSync: string; branch: string }
  features: { path: string; count: number; scenarioCount: number; tagCount: number; connected: boolean }
  database: { conn: string; connected: boolean; tables: number; foreignKeys: number; indexes: number }
  docs: { files: { name: string; size: string }[]; connected: boolean }
}

const initial: SourceState = {
  repo: { url: 'https://github.com/blumek/party-showcase.git', token: '', connected: false, indexedFiles: 0, lastSync: 'Never', branch: '-' },
  features: { path: 'bootstrap/src/test/resources/stories/**/*.feature', count: 4, scenarioCount: 0, tagCount: 0, connected: false },
  database: { conn: 'jdbc:postgresql://localhost:5432/party_showcase?user=party&password=party', connected: false, tables: 0, foreignKeys: 0, indexes: 0 },
  docs: { files: [{ name: 'README.md', size: 'from repo' }], connected: false },
}

const connectedBadge = (
  <span className="chip bg-emerald2/10 text-emerald2 border border-emerald2/20">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald2 animate-pulse-soft" /> Connected
  </span>
)

export default function SetupScreen({ onContinue, initialState, onStateChange }: { onContinue: (state: SourceState) => Promise<void> | void; initialState?: SourceState; onStateChange?: (state: SourceState) => void }) {
  const [state, setState] = useState<SourceState>(initialState ?? initial)
  const [saving, setSaving] = useState(false)
  const [validatingRepo, setValidatingRepo] = useState(false)
  const [validatingFeatures, setValidatingFeatures] = useState(false)
  const [validatingDb, setValidatingDb] = useState(false)
  const [repoMessage, setRepoMessage] = useState<string | null>(null)
  const [featureMessage, setFeatureMessage] = useState<string | null>(null)
  const [dbMessage, setDbMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialState) {
      setState(initialState)
    }
  }, [initialState])

  useEffect(() => {
    onStateChange?.(state)
  }, [onStateChange, state])

  useEffect(() => {
    if (!initialState) {
      return
    }
    if (initialState.repo.connected) {
      setRepoMessage((prev) => prev ?? 'Using saved validation state')
    }
    if (initialState.features.connected) {
      setFeatureMessage((prev) => prev ?? 'Using saved validation state')
    }
    if (initialState.database.connected) {
      setDbMessage((prev) => prev ?? 'Using saved validation state')
    }
  }, [initialState])

  const handleContinue = async () => {
    if (saving) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onContinue(state)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save setup context'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleValidateDatabase = async () => {
    if (validatingDb) {
      return
    }

    setValidatingDb(true)
    setDbMessage(null)

    try {
      const response = await validateSourceConnection({
        type: 'DATABASE_SCHEMA',
        configJson: JSON.stringify({ connectionString: state.database.conn }),
      })

      let tableCount = state.database.tables
      let foreignKeyCount = state.database.foreignKeys
      let indexCount = state.database.indexes
      try {
        const metadata = JSON.parse(response.metadataJson || '{}') as {
          tableCount?: number
          foreignKeyCount?: number
          indexCount?: number
        }
        if (typeof metadata.tableCount === 'number') {
          tableCount = metadata.tableCount
        }
        if (typeof metadata.foreignKeyCount === 'number') {
          foreignKeyCount = metadata.foreignKeyCount
        }
        if (typeof metadata.indexCount === 'number') {
          indexCount = metadata.indexCount
        }
      } catch {
        // Keep current count if metadata is not parseable.
      }

      const connected = response.status === 'CONNECTED'
      setState((prev) => ({
        ...prev,
        database: {
          ...prev.database,
          connected,
          tables: tableCount,
          foreignKeys: foreignKeyCount,
          indexes: indexCount,
        },
      }))

      setDbMessage(response.message || (connected ? 'Database validated' : 'Database validation failed'))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Database validation failed'
      setState((prev) => ({
        ...prev,
        database: {
          ...prev.database,
          connected: false,
        },
      }))
      setDbMessage(message)
    } finally {
      setValidatingDb(false)
    }
  }

  const handleValidateRepo = async () => {
    if (validatingRepo) {
      return
    }

    setValidatingRepo(true)
    setRepoMessage(null)

    try {
      const response = await validateSourceConnection({
        type: 'GIT',
        configJson: JSON.stringify({
          repoUrl: state.repo.url,
          accessToken: state.repo.token,
        }),
      })

      let indexedFiles = 0
      let branch = '-'
      let lastSync = 'Unknown'
      try {
        const metadata = JSON.parse(response.metadataJson || '{}') as {
          indexedFiles?: number
          defaultBranch?: string
          lastSyncAt?: string
        }
        if (typeof metadata.indexedFiles === 'number') {
          indexedFiles = metadata.indexedFiles
        }
        if (typeof metadata.defaultBranch === 'string' && metadata.defaultBranch.trim().length > 0) {
          branch = metadata.defaultBranch
        }
        if (typeof metadata.lastSyncAt === 'string' && metadata.lastSyncAt.trim().length > 0) {
          const parsed = new Date(metadata.lastSyncAt)
          lastSync = Number.isNaN(parsed.getTime()) ? metadata.lastSyncAt : parsed.toLocaleString()
        }
      } catch {
        // Keep fallback values if metadata is missing or malformed.
      }

      const connected = response.status === 'CONNECTED'
      setState((prev) => ({
        ...prev,
        repo: {
          ...prev.repo,
          connected,
          indexedFiles,
          branch,
          lastSync,
        },
      }))
      setRepoMessage(response.message || (connected ? 'Repository validated' : 'Repository validation failed'))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Repository validation failed'
      setState((prev) => ({
        ...prev,
        repo: {
          ...prev.repo,
          connected: false,
          indexedFiles: 0,
          branch: '-',
          lastSync: 'Never',
        },
      }))
      setRepoMessage(message)
    } finally {
      setValidatingRepo(false)
    }
  }

  const handleValidateFeatures = async () => {
    if (validatingFeatures) {
      return
    }

    setValidatingFeatures(true)
    setFeatureMessage(null)

    try {
      const response = await validateSourceConnection({
        type: 'FEATURE_FILES',
        configJson: JSON.stringify({
          repoPath: state.features.path,
        }),
      })

      let featureFileCount = state.features.count
      let scenarioCount = state.features.scenarioCount
      let tagCount = state.features.tagCount
      try {
        const metadata = JSON.parse(response.metadataJson || '{}') as {
          featureFileCount?: number
          scenarioCount?: number
          tagCount?: number
        }
        if (typeof metadata.featureFileCount === 'number') {
          featureFileCount = metadata.featureFileCount
        }
        if (typeof metadata.scenarioCount === 'number') {
          scenarioCount = metadata.scenarioCount
        }
        if (typeof metadata.tagCount === 'number') {
          tagCount = metadata.tagCount
        }
      } catch {
        // Keep existing values if metadata parsing fails.
      }

      const connected = response.status === 'CONNECTED'
      setState((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          count: featureFileCount,
          scenarioCount,
          tagCount,
          connected,
        },
      }))
      setFeatureMessage(response.message || (connected ? 'Feature path validated' : 'Feature path validation failed'))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Feature path validation failed'
      setState((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          scenarioCount: 0,
          tagCount: 0,
          connected: false,
        },
      }))
      setFeatureMessage(message)
    } finally {
      setValidatingFeatures(false)
    }
  }

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
        {!BACKEND_CONFIGURED && (
          <p className="mt-3 inline-flex rounded-full border border-amber2/20 bg-amber2/10 px-3 py-1 text-xs text-amber2">
            Validation needs a deployed backend. Set VITE_API_BASE_URL to your Spring Boot server before clicking Validate.
          </p>
        )}
      </header>

      {/* Accordion panels */}
      <div className="space-y-3">
        <Accordion
          title="Git Repository"
          icon={<Github className="w-4.5 h-4.5 text-zinc-400" />}
          defaultOpen
          badge={state.repo.connected ? connectedBadge : <span className="chip border border-ember/20 bg-ember/10 text-ember">Not validated</span>}
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
            <Stat value={state.repo.indexedFiles > 0 ? state.repo.indexedFiles.toLocaleString() : '--'} label="Files indexed" />
            <Stat value={state.repo.lastSync || 'Never'} label="Last sync" />
            <Stat value={state.repo.branch || '-'} label="Branch" />
            <button onClick={() => { void handleValidateRepo() }} disabled={validatingRepo || !BACKEND_CONFIGURED} className="btn-ghost group disabled:opacity-60 disabled:cursor-not-allowed" title={BACKEND_CONFIGURED ? 'Validate connection' : 'Configure VITE_API_BASE_URL first'}>
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-xs">{validatingRepo ? 'Validating...' : 'Validate'}</span>
            </button>
          </div>
          {repoMessage && <p className={`mt-2 text-xs ${state.repo.connected ? 'text-emerald2' : 'text-ember'}`}>{repoMessage}</p>}
        </Accordion>

        <Accordion
          title="Feature Files (Gherkin)"
          icon={<FileCode2 className="w-4.5 h-4.5 text-zinc-400" />}
          defaultOpen
          badge={state.features.connected ? connectedBadge : <span className="chip border border-ember/20 bg-ember/10 text-ember">Not validated</span>}
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
            <Stat value={String(state.features.scenarioCount)} label="Scenarios" />
            <Stat value={String(state.features.tagCount)} label="Tags" />
            <button onClick={() => { void handleValidateFeatures() }} disabled={validatingFeatures || !BACKEND_CONFIGURED} className="btn-ghost group disabled:opacity-60 disabled:cursor-not-allowed" title={BACKEND_CONFIGURED ? 'Validate feature path' : 'Configure VITE_API_BASE_URL first'}>
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-xs">{validatingFeatures ? 'Validating...' : 'Validate'}</span>
            </button>
          </div>
          {featureMessage && <p className={`mt-2 text-xs ${state.features.connected ? 'text-emerald2' : 'text-ember'}`}>{featureMessage}</p>}
        </Accordion>

        <Accordion
          title="Database Schema"
          icon={<Database className="w-4.5 h-4.5 text-zinc-400" />}
          badge={state.database.connected ? connectedBadge : <span className="chip border border-ember/20 bg-ember/10 text-ember">Not validated</span>}
          accentColor="#30d158"
        >
          <label className="label">Connection string</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Database className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input className="input pl-11 font-mono text-sm" value={state.database.conn} onChange={(e) => setState({ ...state, database: { ...state.database, conn: e.target.value } })} />
            </div>
            <button onClick={() => { void handleValidateDatabase() }} disabled={validatingDb || !BACKEND_CONFIGURED} className="btn-ghost group disabled:opacity-60 disabled:cursor-not-allowed" title={BACKEND_CONFIGURED ? 'Validate connection' : 'Configure VITE_API_BASE_URL first'}>
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
          {dbMessage && (
            <p className={`mt-2 text-xs ${state.database.connected ? 'text-emerald2' : 'text-ember'}`}>
              {dbMessage}
            </p>
          )}
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-white/5">
            <Stat value={String(state.database.tables)} label="Tables" />
            <Stat value={String(state.database.foreignKeys)} label="Foreign keys" />
            <Stat value={String(state.database.indexes)} label="Indexes" />
          </div>
        </Accordion>

        <Accordion
          title="User Guide / Knowledge Base"
          icon={<BookOpen className="w-4.5 h-4.5 text-zinc-400" />}
          badge={state.docs.connected ? connectedBadge : <span className="chip border border-ember/20 bg-ember/10 text-ember">Not validated</span>}
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
          <span className="text-zinc-400">
            Knowledge base <span className="text-emerald2 font-semibold">ready</span> ·{' '}
            <span className="text-zinc-200 font-semibold">{state.repo.indexedFiles > 0 ? state.repo.indexedFiles.toLocaleString() : '--'}</span> artifacts indexed
          </span>
        </div>
        <button onClick={handleContinue} disabled={saving} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? 'Saving...' : 'Continue to Analysis'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-ember">{error}</p>}
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
