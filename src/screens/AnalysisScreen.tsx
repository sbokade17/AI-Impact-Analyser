import { useState } from 'react'
import { FileSearch, Sparkles, Upload, FileCode2, Play, Loader as Loader2, CircleCheck as CheckCircle2, Layers, GitCompare, ScanLine, BrainCircuit } from 'lucide-react'

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
  { label: 'Parsing Jira requirement', icon: FileSearch, detail: 'Extracting ticket ID, summary & acceptance criteria' },
  { label: 'Diffing feature files against baseline', icon: GitCompare, detail: 'Comparing 2 new scenarios against 312 existing' },
  { label: 'Scanning codebase for affected modules', icon: Layers, detail: 'Tracing dependency graph across 1,284 files' },
  { label: 'Analyzing database schema impact', icon: ScanLine, detail: 'Checking 38 tables for required migrations' },
  { label: 'Cross-referencing user workflows', icon: BrainCircuit, detail: 'Matching against knowledge base documents' },
  { label: 'Generating impact assessment', icon: Sparkles, detail: 'Compiling risk score & recommendations' },
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
        const next = p + 100 / (progressSteps.length * 9)
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(onGenerate, 600)
          return 100
        }
        return next
      })
    }, 200)
  }

  const currentStep = Math.min(Math.floor((progress / 100) * progressSteps.length), progressSteps.length - 1)

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      <header className="mb-8 animate-slide-up">
        <div className="flex items-center gap-2 text-xs text-sky-600 font-bold uppercase tracking-widest mb-3">
          <FileSearch className="w-3.5 h-3.5" /> Step 2 · Analysis Trigger
        </div>
        <h2 className="text-4xl font-extrabold text-ink-900 tracking-tight">New Impact Analysis</h2>
        <p className="text-ink-500 mt-2 max-w-2xl text-[15px] leading-relaxed">
          Provide the Jira requirement and updated feature files. The AI engine compares them against your indexed knowledge base to produce a detailed impact report.
        </p>
      </header>

      {!running ? (
        <>
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Jira input */}
            <div className="card p-6 animate-slide-up stagger-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 border border-sky-200 flex items-center justify-center">
                  <FileSearch className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-bold text-ink-900">Jira Ticket / Requirement</h3>
                  <p className="text-xs text-ink-500">Ticket ID, summary & acceptance criteria</p>
                </div>
              </div>
              <textarea
                value={jira}
                onChange={(e) => setJira(e.target.value)}
                rows={14}
                className="input font-mono text-sm leading-relaxed resize-none"
                placeholder="Paste Jira ticket content here..."
              />
              <div className="flex items-center justify-between mt-3 text-xs text-ink-400">
                <span className="flex items-center gap-1.5"><FileCode2 className="w-3 h-3" /> {jira.trim().split('\n').length} lines</span>
                <span>{jira.length} chars</span>
              </div>
            </div>

            {/* Feature files */}
            <div className="card p-6 animate-slide-up stagger-2">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 border border-teal-200 flex items-center justify-center">
                    <FileCode2 className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900">New / Modified Feature Files</h3>
                    <p className="text-xs text-ink-500">Gherkin .feature reflecting the proposed change</p>
                  </div>
                </div>
                <div className="flex rounded-lg bg-ink-100 border border-ink-200 p-0.5">
                  <button onClick={() => setMode('edit')} className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${mode === 'edit' ? 'bg-white text-teal-600 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}>Editor</button>
                  <button onClick={() => setMode('upload')} className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${mode === 'upload' ? 'bg-white text-teal-600 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}>Upload</button>
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
                <div className="border-2 border-dashed border-ink-200 rounded-xl h-[324px] flex flex-col items-center justify-center text-center hover:border-teal-300 hover:bg-teal-50/40 transition-all cursor-pointer group">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="text-sm text-ink-700 font-medium">Drop .feature files here</p>
                  <p className="text-xs text-ink-400 mt-1">or click to browse</p>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-ink-400">{mode === 'edit' ? `${feature.split('Scenario').length - 1} scenarios detected` : '0 files'}</span>
                <span className="chip bg-teal-50 text-teal-600 border border-teal-200">Gherkin syntax</span>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="card p-5 mt-5 flex flex-wrap items-center justify-between gap-4 animate-slide-up stagger-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <div className="text-xs text-ink-500">Engine</div>
                  <div className="text-sm font-semibold text-ink-900">GPT-4o · Deep</div>
                </div>
              </div>
              <div className="w-px h-8 bg-ink-200" />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <div className="text-xs text-ink-500">Indexed</div>
                  <div className="text-sm font-semibold text-ink-900">1,284 files</div>
                </div>
              </div>
            </div>
            <button onClick={handleGenerate} className="btn-primary text-base px-7 py-3.5">
              <Play className="w-4 h-4" /> Generate Impact Report
            </button>
          </div>
        </>
      ) : (
        <div className="card p-8 md:p-12 animate-fade-in max-w-2xl mx-auto">
          {/* Animated header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin-slow" />
              <div className="absolute -inset-8 rounded-full border border-teal-200 border-b-teal-400 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '6s' }} />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 via-cyan-50 to-teal-100 flex items-center justify-center relative">
                <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-ink-900 tracking-tight">Analyzing impact...</h3>
            <p className="text-sm text-ink-500 mt-1.5">Comparing requirement against 1,284 indexed files</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline text-xs mb-2.5">
              <span className="text-ink-700 font-semibold">{progressSteps[currentStep].label}</span>
              <span className="text-sky-600 font-bold tabular-nums text-base">{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-200 relative"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#0ea5e9,#06b6d4,#0d9488)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: 'shimmer 1.5s linear infinite', backgroundSize: '200% 100%' }} />
              </div>
            </div>
            <p className="text-xs text-ink-400 mt-2">{progressSteps[currentStep].detail}</p>
          </div>

          {/* Steps list */}
          <div className="space-y-2">
            {progressSteps.map((step, i) => {
              const Icon = step.icon
              const done = i < currentStep
              const active = i === currentStep
              return (
                <div key={step.label} className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-300 ${active ? 'bg-sky-50 border border-sky-200' : 'border border-transparent'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    done ? 'bg-emerald-100 text-emerald-600' : active ? 'bg-sky-100 text-sky-600' : 'bg-ink-100 text-ink-400'
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm ${done ? 'text-ink-500' : active ? 'text-ink-900 font-semibold' : 'text-ink-400'}`}>{step.label}</span>
                  {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
