import { useEffect, useRef, useState } from 'react'
import { FileSearch, FileCode2, Play, Sparkles, Upload } from 'lucide-react'
import JiraCode from '../components/JiraCode'
import GherkinCode from '../components/GherkinCode'
import ScanBeam from '../components/ScanBeam'
import { generateFeatureFileDraft } from '../api/backend'

const sampleJira = `Ticket: AI-101
Summary: Analyze the Party Showcase registration flow

Acceptance Criteria:
- User can create a new party and register attendees
- Duplicate attendees are detected before persistence
- Relationship data is saved with the correct party owner
- Validation messages are shown for missing attendee details
- Impact analysis highlights affected database and feature files`

const sampleFeature = `@party-registration @core
Feature: Party registration
  As an organizer
  I want to create a party and register attendees
  So that the party details and relationships are stored correctly

  @happy-path
  Scenario: Register a new party with attendees
    Given the organizer opens the party registration form
    When they enter the party name "Summer Gala"
    And they add attendee "Ava"
    And they add attendee "Noah"
    Then the party is saved successfully
    And the attendees are linked to the new party

  @validation
  Scenario: Prevent duplicate attendee names
    Given the organizer has already added attendee "Mia"
    When they try to add attendee "Mia" again
    Then the system shows a duplicate attendee validation message
    And the party is not saved until the issue is fixed`

export default function AnalysisScreen({
  setupComplete,
  onGenerate,
}: {
  setupComplete: boolean
  onGenerate: (payload: { jiraContent: string; featureContent: string }) => Promise<void> | void
}) {
  const [jira, setJira] = useState(sampleJira)
  const [feature, setFeature] = useState(sampleFeature)
  const [mode, setMode] = useState<'edit' | 'upload'>('edit')
  const [scanning, setScanning] = useState(false)
  const [featureGenerating, setFeatureGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleGenerate = () => {
    if (scanning) {
      return
    }

    setError(null)
    setScanning(true)

    void (async () => {
      try {
        await onGenerate({ jiraContent: jira, featureContent: feature })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate report'
        setError(message)
      } finally {
        if (mountedRef.current) {
          setScanning(false)
        }
      }
    })()
  }

  const handleFeatureGenerate = async () => {
    setError(null)
    setFeatureGenerating(true)

    try {
      const draft = await generateFeatureFileDraft({ jiraContent: jira })
      setFeature(draft.featureContent.trim())
      setMode('edit')
    } catch {
      setFeature(`@ai-generated\nFeature: Party registration\n  As an organizer\n  I want to create a party and register attendees\n  So that the party details and relationships are stored correctly\n\n  Scenario: Create a party with required details\n    Given the organizer opens the party registration form\n    When they enter a valid party name\n    And they add at least one attendee\n    Then the party is saved successfully\n\n  Scenario: Prevent duplicate attendees\n    Given the organizer has already added attendee "Mia"\n    When they try to add attendee "Mia" again\n    Then the system shows a duplicate attendee validation message`)
      setMode('edit')
    } finally {
      setFeatureGenerating(false)
    }
  }

  if (scanning) return <ScanBeam />

  return (
    <div className="max-w-5xl mx-auto px-6 animate-fade-in">
      {/* Header */}
      <header className="mb-8 animate-slide-up">
        <div className="flex items-center gap-2 text-xs text-ember font-mono font-semibold uppercase tracking-widest mb-3">
          <span className="w-8 h-px bg-ember/40" /> Step 02 · Analysis Trigger
        </div>
        <h2 className="font-display text-4xl font-bold text-white tracking-tight">New Impact Analysis</h2>
        <p className="text-zinc-500 mt-2 max-w-xl text-[15px] leading-relaxed">
          Provide the Jira requirement and updated Gherkin feature files. The AI engine compares them against your indexed knowledge base.
        </p>
        {!setupComplete && (
          <p className="mt-3 inline-flex rounded-full border border-amber2/20 bg-amber2/10 px-3 py-1 text-xs text-amber2">
            Complete Setup Context first to enable report generation.
          </p>
        )}
      </header>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Jira input */}
        <div className="panel animate-slide-up stagger-1 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-ember/10 border border-ember/20 flex items-center justify-center">
              <FileSearch className="w-4.5 h-4.5 text-ember" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-zinc-200">Jira Requirement</h3>
              <p className="text-[11px] text-zinc-600">Ticket ID, summary & acceptance criteria</p>
            </div>
          </div>
          <div className="editor-surface h-[340px]">
            <JiraCode code={jira} editable onChange={setJira} />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 text-xs text-zinc-600">
            <span className="font-mono">{jira.trim().split('\n').length} lines</span>
            <span>{jira.length} chars</span>
          </div>
        </div>

        {/* Feature files */}
        <div className="panel animate-slide-up stagger-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber2/10 border border-amber2/20 flex items-center justify-center">
                <FileCode2 className="w-4.5 h-4.5 text-amber2" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-zinc-200">Feature File</h3>
                <p className="text-[11px] text-zinc-600">Gherkin .feature syntax</p>
              </div>
            </div>
            <div className="flex rounded-lg bg-black/40 border border-white/5 p-0.5">
              <button
                onClick={() => setMode('edit')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${mode === 'edit' ? 'bg-amber2/15 text-amber2' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Editor
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${mode === 'upload' ? 'bg-amber2/15 text-amber2' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Upload
              </button>
            </div>
            <button
              onClick={() => { void handleFeatureGenerate() }}
              disabled={featureGenerating || !jira.trim()}
              className="btn-ghost-strong ml-3 px-3 py-1.5 text-xs"
              title="Draft a feature file from the Jira requirement"
            >
              <Sparkles className={`w-3.5 h-3.5 ${featureGenerating ? 'animate-pulse' : ''}`} />
              {featureGenerating ? 'Drafting...' : 'AI Generate'}
            </button>
          </div>

          {mode === 'edit' ? (
            <div className="editor-surface h-[340px]">
              <GherkinCode code={feature} editable onChange={setFeature} />
            </div>
          ) : (
            <div className="h-[340px] flex flex-col items-center justify-center text-center hover:bg-amber2/5 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-amber2/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-amber2" />
              </div>
              <p className="text-sm text-zinc-300 font-medium">Drop .feature files here</p>
              <p className="text-xs text-zinc-600 mt-1">or click to browse</p>
            </div>
          )}

          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 text-xs">
            <span className="text-zinc-600 font-mono">{mode === 'edit' ? `${feature.split('Scenario').length - 1} scenarios` : '0 files'}</span>
            <span className="chip bg-amber2/10 text-amber2 border border-amber2/20">Gherkin</span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="panel p-4 mt-4 flex flex-wrap items-center justify-end gap-4 animate-slide-up stagger-3">
        <button onClick={handleGenerate} disabled={!setupComplete || scanning} className="btn-primary text-base px-7 py-3 disabled:opacity-60 disabled:cursor-not-allowed">
          <Play className="w-4 h-4" /> Generate Report
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-ember">{error}</p>}
    </div>
  )
}
