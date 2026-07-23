import { useState } from 'react'
import { FileSearch, Sparkles, Upload, FileCode2, Play, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Wand as Wand2, Layers, GitCompare } from 'lucide-react'

const sampleJira = `Ticket: PAY-1247
Summary: Add multi-currency support to checkout flow

Acceptance Criteria:
• Customer can select currency (USD, EUR, GBP, JPY) at checkout
• Order total displays converted amount with correct symbol
• Payment authorization occurs in selected currency
• Refunds issue in the original order currency
• Revenue reports normalize to base currency (USD)`

const sampleFeature = `Feature: Multi-currency checkout
  As a customer
  I want to pay in my local currency
  So that I understand the exact amount I am charged

  Scenario: Select EUR at checkout
    Given the customer is on the checkout page
    When they select "EUR" from the currency dropdown
    Then the order total is displayed in Euros with the € symbol
    And the exchange rate is fetched from the FX provider

  Scenario: Authorize payment in GBP
    Given the customer has selected "GBP"
    When they submit payment
    Then the payment gateway authorizes the charge in GBP
    And the order is persisted with currency_code = "GBP"`

const progressSteps = [
  { label: 'Parsing Jira requirement', icon: FileSearch },
  { label: 'Diffing feature files against baseline', icon: GitCompare },
  { label: 'Scanning codebase for affected modules', icon: Layers },
  { label: 'Analyzing database schema impact', icon: AlertCircle },
  { label: 'Cross-referencing user workflows', icon: Wand2 },
  { label: 'Generating impact assessment', icon: Sparkles },
]

export default function AnalysisScreen({ onGenerate }: { onGenerate: () => void }) {
  const [jira, setJira] = useState(sampleJira)
  const [feature, setFeature] = useState(sampleFeature)
  const [mode, setMode] = useState<'edit' | 'upload'>('edit')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleGenerate = () => {
    setRunning(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / (progressSteps.length * 8)
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(onGenerate, 500)
          return 100
        }
        return next
      })
    }, 220)
  }

  const currentStep = Math.min(Math.floor((progress / 100) * progressSteps.length), progressSteps.length - 1)

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-2">
          <FileSearch className="w-3.5 h-3.5" /> Step 2 · Analysis Trigger
        </div>
        <h2 className="text-3xl font-bold text-white">New Impact Analysis</h2>
        <p className="text-ink-400 mt-2 max-w-2xl">
          Provide the Jira requirement and updated feature files. The AI engine compares them against your indexed knowledge base to produce a detailed impact report.
        </p>
      </header>

      {!running ? (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Jira input */}
          <div className="card p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <FileSearch className="w-4.5 h-4.5 text-sky-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Jira Ticket / Requirement</h3>
                <p className="text-xs text-ink-400">Ticket ID, summary & acceptance criteria</p>
              </div>
            </div>
            <textarea
              value={jira}
              onChange={(e) => setJira(e.target.value)}
              rows={14}
              className="input font-mono text-sm leading-relaxed resize-none"
              placeholder="Paste Jira ticket content here..."
            />
            <div className="flex items-center justify-between mt-3 text-xs text-ink-500">
              <span>{jira.trim().split('\n').length} lines</span>
              <span>{jira.length} chars</span>
            </div>
          </div>

          {/* Feature files */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <FileCode2 className="w-4.5 h-4.5 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">New / Modified Feature Files</h3>
                  <p className="text-xs text-ink-400">Gherkin .feature reflecting the proposed change</p>
                </div>
              </div>
              <div className="flex rounded-lg bg-ink-900/70 border border-ink-700/60 p-0.5">
                <button onClick={() => setMode('edit')} className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${mode === 'edit' ? 'bg-sky-500/20 text-sky-300' : 'text-ink-400'}`}>Editor</button>
                <button onClick={() => setMode('upload')} className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${mode === 'upload' ? 'bg-sky-500/20 text-sky-300' : 'text-ink-400'}`}>Upload</button>
              </div>
            </div>

            {mode === 'edit' ? (
              <textarea
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                rows={14}
                className="input font-mono text-sm leading-relaxed resize-none"
                placeholder="Feature: ..."
              />
            ) : (
              <div className="border-2 border-dashed border-ink-700/60 rounded-xl h-[324px] flex flex-col items-center justify-center text-center hover:border-teal-500/40 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-teal-400" />
                </div>
                <p className="text-sm text-ink-200 font-medium">Drop .feature files here</p>
                <p className="text-xs text-ink-500 mt-1">or click to browse</p>
              </div>
            )}
            <div className="flex items-center justify-between mt-3 text-xs">
              <span className="text-ink-500">{mode === 'edit' ? `${feature.split('Scenario').length - 1} scenarios` : '0 files'}</span>
              <span className="chip bg-teal-500/10 text-teal-400 border border-teal-500/20">Gherkin syntax</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-8 animate-fade-in">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/20 to-teal-500/10 flex items-center justify-center">
                <Loader2 className="w-9 h-9 text-sky-400 animate-spin" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin-slow" />
            </div>
            <h3 className="text-xl font-bold text-white">Analyzing impact...</h3>
            <p className="text-sm text-ink-400 mt-1">Comparing requirement against 1,284 indexed files</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-ink-300 font-medium">{progressSteps[currentStep].label}</span>
              <span className="text-sky-400 font-semibold tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-ink-800/80 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#0ea5e9,#0d9488)' }}
              />
            </div>
          </div>

          {/* Steps list */}
          <div className="space-y-2.5">
            {progressSteps.map((step, i) => {
              const Icon = step.icon
              const done = i < currentStep
              const active = i === currentStep
              return (
                <div key={step.label} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${active ? 'bg-sky-500/10 border border-sky-500/20' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    done ? 'bg-emerald-500/15 text-emerald-400' : active ? 'bg-sky-500/15 text-sky-400' : 'bg-ink-800/60 text-ink-500'
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-sm ${done ? 'text-ink-300' : active ? 'text-white font-medium' : 'text-ink-500'}`}>{step.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!running && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink-700/40">
          <div className="text-sm text-ink-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Estimated analysis depth: <span className="text-ink-200 font-medium">deep</span>
          </div>
          <button onClick={handleGenerate} className="btn-primary text-base px-7 py-3.5">
            <Play className="w-4 h-4" /> Generate Impact Report
          </button>
        </div>
      )}
    </div>
  )
}
