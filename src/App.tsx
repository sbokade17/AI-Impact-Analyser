import { useEffect, useState } from 'react'
import { Settings, FileSearch, LayoutDashboard, Activity, Moon, Sun } from 'lucide-react'
import SetupScreen from './screens/SetupScreen'
import AnalysisScreen from './screens/AnalysisScreen'
import ReportScreen from './screens/ReportScreen'
import type { ReportData } from './data/mockReport'
import {
  createAnalysisRun,
  createProject,
  getLatestReportByProjectId,
  getProject,
  getReportByRunId,
  upsertProjectSources,
  waitForRunCompletion,
} from './api/backend'
import type { ProjectResponse } from './api/backend'
import type { SourceState } from './screens/SetupScreen'

export type Screen = 'setup' | 'analysis' | 'report'
type Theme = 'dark' | 'light'
const SETUP_DRAFT_KEY = 'setupDraft'

const navItems: { id: Screen; label: string; icon: typeof Activity }[] = [
  { id: 'setup', label: 'Setup Context', icon: Settings },
  { id: 'analysis', label: 'New Analysis', icon: FileSearch },
  { id: 'report', label: 'Report Dashboard', icon: LayoutDashboard },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('analysis')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [setupState, setSetupState] = useState<SourceState | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [reportHydrating, setReportHydrating] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const stored = localStorage.getItem('theme')
    return stored === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    const draft = localStorage.getItem(SETUP_DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as SourceState
        setSetupState(parsed)
      } catch {
        localStorage.removeItem(SETUP_DRAFT_KEY)
      }
    }

    const savedProjectId = localStorage.getItem('projectId')
    if (!savedProjectId) {
      return
    }

    const hydrate = async () => {
      try {
        const project = await getProject(savedProjectId)
        const mapped = mapProjectToSourceState(project)
        setProjectId(savedProjectId)
        setSetupState(mapped)
        localStorage.setItem(SETUP_DRAFT_KEY, JSON.stringify(sanitizeSetupStateForStorage(mapped)))

        try {
          setReportHydrating(true)
          const latest = await getLatestReportByProjectId<ReportData>(savedProjectId)
          setReport(latest)
        } catch {
          // No historical report for this project yet.
        } finally {
          setReportHydrating(false)
        }
      } catch {
        // Ignore hydration errors and let users continue with manual setup.
      }
    }

    void hydrate()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  const isSetupComplete = (state: SourceState | null) => {
    if (!state) {
      return false
    }

    return state.repo.connected && state.features.connected && state.database.connected && state.docs.files.length > 0
  }

  const handleSetupStateChange = (state: SourceState) => {
    setSetupState(state)
    localStorage.setItem(SETUP_DRAFT_KEY, JSON.stringify(sanitizeSetupStateForStorage(state)))
  }

  const saveSetup = async (state: SourceState) => {
    setGlobalError(null)

    const existingProjectId = projectId
    const activeProjectId = existingProjectId
      ?? (await createProject({
        name: 'AI Impact Analyser Project',
        description: 'Project provisioned from frontend setup flow',
      })).id

    await upsertProjectSources(activeProjectId, [
      {
        type: 'GIT',
        configJson: JSON.stringify({
          repoUrl: state.repo.url,
          accessToken: state.repo.token,
        }),
        metadataJson: JSON.stringify({
          indexedFiles: state.repo.indexedFiles,
          lastSyncAt: state.repo.lastSync,
          defaultBranch: state.repo.branch,
        }),
      },
      {
        type: 'FEATURE_FILES',
        configJson: JSON.stringify({
          repoPath: state.features.path,
        }),
        metadataJson: JSON.stringify({
          featureFileCount: state.features.count,
          scenarioCount: state.features.scenarioCount,
          tagCount: state.features.tagCount,
        }),
      },
      {
        type: 'DATABASE_SCHEMA',
        configJson: JSON.stringify({
          connectionString: state.database.conn,
        }),
        metadataJson: JSON.stringify({
          tableCount: state.database.tables,
          foreignKeyCount: state.database.foreignKeys,
          indexCount: state.database.indexes,
        }),
      },
      {
        type: 'DOCS',
        configJson: JSON.stringify({
          files: state.docs.files,
        }),
        metadataJson: JSON.stringify({
          fileCount: state.docs.files.length,
        }),
      },
    ])

    setProjectId(activeProjectId)
    setSetupState(state)
    localStorage.setItem('projectId', activeProjectId)
    localStorage.setItem(SETUP_DRAFT_KEY, JSON.stringify(sanitizeSetupStateForStorage(state)))
    setScreen('analysis')
  }

  const runAnalysis = async (payload: { jiraContent: string; featureContent: string }) => {
    setGlobalError(null)

    if (!projectId || !isSetupComplete(setupState)) {
      setScreen('setup')
      throw new Error('Please complete Setup Context before generating report')
    }

    const run = await createAnalysisRun({
      projectId,
      jiraContent: payload.jiraContent,
      featureContent: payload.featureContent,
    })

    await waitForRunCompletion(run.id)
    const reportData = await getReportByRunId<ReportData>(run.id)
    setReport(reportData)
    setScreen('report')
  }

  return (
    <div className="min-h-screen bg-obsidian relative overflow-hidden">
      {/* Ambient layers */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-spotlight pointer-events-none" />

      {/* Floating capsule nav */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-spring-in">
        <div className="glass-strong rounded-full p-1.5 flex items-center gap-1 shadow-2xl">
          {/* Tabs */}
          {navItems.map((item) => {
            const Icon = item.icon
            const active = screen === item.id
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {active && (
                  <div
                    className="absolute inset-0 rounded-full transition-all"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,69,58,0.15), rgba(255,159,10,0.1))',
                      border: '1px solid rgba(255,69,58,0.25)',
                      boxShadow: '0 0 20px -4px rgba(255,69,58,0.3)',
                    }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${active ? 'text-ember' : ''}`} />
                <span className="relative z-10 hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
          <div className="w-px h-6 bg-white/10" />
          <button
            onClick={toggleTheme}
            className="relative flex items-center gap-2 px-3 py-2.5 rounded-full text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-all duration-300"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 pt-24 pb-12">
        {globalError && (
          <div className="max-w-5xl mx-auto px-6 mb-4">
            <div className="rounded-xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember">
              {globalError}
            </div>
          </div>
        )}

        {screen === 'setup' && (
          <SetupScreen
            onContinue={saveSetup}
            initialState={setupState ?? undefined}
            onStateChange={handleSetupStateChange}
          />
        )}
        {screen === 'analysis' && (
          <AnalysisScreen
            setupComplete={isSetupComplete(setupState)}
            onGenerate={async (payload) => {
              try {
                await runAnalysis(payload)
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to generate report'
                setGlobalError(message)
                throw error
              }
            }}
          />
        )}
        {screen === 'report' && report && <ReportScreen report={report} onBack={() => setScreen('analysis')} />}
        {screen === 'report' && !report && (
          <div className="max-w-4xl mx-auto px-6">
            <div className="panel p-8 text-center">
              <h3 className="font-display text-2xl font-bold text-white mb-2">Report Dashboard</h3>
              <p className="text-zinc-400 text-sm">
                {reportHydrating
                  ? 'Loading your latest report...'
                  : 'No previous report found for this project. Run a new analysis to populate the dashboard.'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function sanitizeSetupStateForStorage(state: SourceState): SourceState {
  return {
    ...state,
    // Never persist access token in localStorage.
    repo: {
      ...state.repo,
      token: '',
    },
  }
}

function mapProjectToSourceState(project: ProjectResponse): SourceState {
  const fallback: SourceState = {
    repo: { url: 'https://github.com/blumek/party-showcase.git', token: '', connected: false, indexedFiles: 0, lastSync: 'Never', branch: '-' },
    features: { path: 'bootstrap/src/test/resources/stories/**/*.feature', count: 4, scenarioCount: 0, tagCount: 0, connected: false },
    database: { conn: 'jdbc:postgresql://localhost:5432/party_showcase?user=party&password=party', connected: false, tables: 0, foreignKeys: 0, indexes: 0 },
    docs: { files: [{ name: 'README.md', size: 'from repo' }], connected: false },
  }

  for (const source of project.sourceConnections ?? []) {
    let config: Record<string, unknown> = {}
    let metadata: Record<string, unknown> = {}
    try {
      config = JSON.parse(source.configJson ?? '{}') as Record<string, unknown>
    } catch {
      config = {}
    }
    try {
      metadata = JSON.parse(source.metadataJson ?? '{}') as Record<string, unknown>
    } catch {
      metadata = {}
    }

    if (source.type === 'GIT') {
      fallback.repo.url = typeof config.repoUrl === 'string' ? config.repoUrl : fallback.repo.url
      fallback.repo.connected = source.status === 'CONNECTED'
      fallback.repo.indexedFiles = typeof metadata.indexedFiles === 'number' ? metadata.indexedFiles : fallback.repo.indexedFiles
      fallback.repo.branch = typeof metadata.defaultBranch === 'string' ? metadata.defaultBranch : fallback.repo.branch
      if (typeof metadata.lastSyncAt === 'string') {
        const parsed = new Date(metadata.lastSyncAt)
        fallback.repo.lastSync = Number.isNaN(parsed.getTime()) ? metadata.lastSyncAt : parsed.toLocaleString()
      }
    }

    if (source.type === 'FEATURE_FILES') {
      fallback.features.path = typeof config.repoPath === 'string' ? config.repoPath : fallback.features.path
      fallback.features.connected = source.status === 'CONNECTED'
      fallback.features.count = typeof metadata.featureFileCount === 'number' ? metadata.featureFileCount : fallback.features.count
      fallback.features.scenarioCount = typeof metadata.scenarioCount === 'number' ? metadata.scenarioCount : fallback.features.scenarioCount
      fallback.features.tagCount = typeof metadata.tagCount === 'number' ? metadata.tagCount : fallback.features.tagCount
    }

    if (source.type === 'DATABASE_SCHEMA') {
      fallback.database.conn = typeof config.connectionString === 'string' ? config.connectionString : fallback.database.conn
      fallback.database.connected = source.status === 'CONNECTED'
      fallback.database.tables = typeof metadata.tableCount === 'number' ? metadata.tableCount : fallback.database.tables
      fallback.database.foreignKeys = typeof metadata.foreignKeyCount === 'number' ? metadata.foreignKeyCount : fallback.database.foreignKeys
      fallback.database.indexes = typeof metadata.indexCount === 'number' ? metadata.indexCount : fallback.database.indexes
    }

    if (source.type === 'DOCS') {
      fallback.docs.connected = source.status === 'CONNECTED'
      if (Array.isArray(config.files)) {
        fallback.docs.files = (config.files as Array<{ name?: unknown; size?: unknown }>).map((file) => ({
          name: typeof file.name === 'string' ? file.name : 'document',
          size: typeof file.size === 'string' ? file.size : 'unknown',
        }))
      }
    }
  }

  return fallback
}
