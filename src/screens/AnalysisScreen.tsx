import { useState } from 'react'
import { FileSearch, FileCode2, Play, Sparkles, Layers, Upload } from 'lucide-react'
import JiraCode from '../components/JiraCode'
import GherkinCode from '../components/GherkinCode'
import ScanBeam from '../components/ScanBeam'

const sampleJira = `Ticket: PAY-1247
Summary: Add multi-currency support to checkout flow

Acceptance Criteria:
- Customer can select currency (USD, EUR, GBP, JPY) at checkout
- Order total displays converted amount with correct symbol
- Payment authorization occurs in selected currency
- Refunds issue in the original order currency
- Revenue reports normalize to base currency (USD)`

const sampleFeature = `Feature: Multi-currency checkout
  As a customer
  I want to pay in my local currency
  So that I understand the exact amount I am charged

  Scenario: Select EUR at checkout
    Given the customer is on the checkout page
    When they select "EUR" from the currency dropdown
    Then the order total is displayed in Euros with the "€" symbol
    And the exchange rate is fetched from the FX provider

  Scenario: Authorize payment in GBP
    Given the customer has selected "GBP"
    When they submit payment
    Then the payment gateway authorizes the charge in "GBP"
    And the order is persisted with currency_code = "GBP"`

export default function AnalysisScreen({ onGenerate }: { onGenerate: () => void }) {
  const [jira, setJira] = useState(sampleJira)
  const [feature, setFeature] = useState(sampleFeature)
  const [mode, setMode] = useState<'edit' | 'upload'>('edit')
  const [scanning, setScanning] = useState(false)

  if (scanning) return <ScanBeam onComplete={onGenerate} />

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
      <div className="panel p-4 mt-4 flex flex-wrap items-center justify-between gap-4 animate-slide-up stagger-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-600">Engine</div>
              <div className="text-sm font-semibold text-zinc-200">GPT-4o · Deep</div>
            </div>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ember/10 border border-ember/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-ember" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-600">Indexed</div>
              <div className="text-sm font-semibold text-zinc-200">1,284 files</div>
            </div>
          </div>
        </div>
        <button onClick={() => setScanning(true)} className="btn-primary text-base px-7 py-3">
          <Play className="w-4 h-4" /> Generate Report
        </button>
      </div>
    </div>
  )
}
