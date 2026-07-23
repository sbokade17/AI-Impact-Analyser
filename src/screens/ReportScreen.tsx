import { useState } from 'react'
import { ArrowLeft, FileCode2, Database, Workflow, FlaskConical, Lightbulb, Package, TriangleAlert as AlertTriangle, ChevronRight, Download, Share2, GitCommitVertical as GitCommit, Boxes, Sparkles, Clock, Hash, Layers, ScanLine } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ReportData } from '../data/mockReport'
import { riskConfig } from '../components/RiskGauge'
import RiskGauge from '../components/RiskGauge'
import { RiskPill } from '../components/RiskPill'
import DiffViewer from '../components/DiffViewer'
import FlowTimeline from '../components/FlowTimeline'

type Tab = 'files' | 'database' | 'tests' | 'recommendations' | 'dependencies'

const tabs: { id: Tab; label: string; icon: typeof FileCode2 }[] = [
  { id: 'files', label: 'Affected Files', icon: FileCode2 },
  { id: 'database', label: 'Schema Changes', icon: Database },
  { id: 'tests', label: 'Test Coverage', icon: FlaskConical },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'dependencies', label: 'Dependencies', icon: Package },
]

const changeStyles: Record<string, string> = {
  modified: 'bg-amber2/10 text-amber2 border-amber2/20',
  added: 'bg-emerald2/10 text-emerald2 border-emerald2/20',
  deleted: 'bg-ember/10 text-ember border-ember/20',
}

export default function ReportScreen({ report, onBack }: { report: ReportData; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('files')
  const [selectedFile, setSelectedFile] = useState(report.affectedFiles[0])
  const [exporting, setExporting] = useState(false)
  const cfg = riskConfig[report.riskLevel]

  const exportReport = async () => {
    if (exporting) {
      return
    }

    setExporting(true)

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const accent = [255, 69, 58] as const
      const ink = [17, 24, 39] as const
      const muted = [107, 114, 128] as const

      // Cover block
      doc.setFillColor(11, 15, 27)
      doc.rect(0, 0, pageWidth, 180, 'F')
      doc.setDrawColor(accent[0], accent[1], accent[2])
      doc.setLineWidth(2)
      doc.line(40, 138, pageWidth - 40, 138)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(28)
      doc.text('Impact Analysis Report', 40, 72)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Ticket ${report.ticketId} • ${report.generatedAt}`, 40, 102)
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(pageWidth - 170, 46, 130, 36, 8, 8, 'F')
      doc.setTextColor(ink[0], ink[1], ink[2])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text(`${report.riskLevel} Risk`, pageWidth - 148, 68)

      const gaugeImage = drawRiskGaugePng(report.riskScore, report.riskLevel)
      doc.addImage(gaugeImage, 'PNG', 40, 210, 150, 150)

      const scoreBarsImage = drawScoreBarsPng(report.scoreBreakdown)
      doc.addImage(scoreBarsImage, 'PNG', 220, 220, pageWidth - 260, 130)

      doc.setTextColor(ink[0], ink[1], ink[2])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('Executive Summary', 40, 390)
      doc.setTextColor(muted[0], muted[1], muted[2])
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const summaryLines = doc.splitTextToSize(report.summary, pageWidth - 80)
      doc.text(summaryLines, 40, 412)

      autoTable(doc, {
        startY: 470,
        head: [['Metric', 'Value']],
        body: [
          ['Risk Score', `${report.riskScore}/100`],
          ['Affected Files', String(report.affectedFiles.length)],
          ['Database Operations', String(report.dbChanges.length)],
          ['Functional Areas', String(report.functionalAreas.length)],
          ['Test Cases', String(report.testCases.length)],
        ],
        styles: { fontSize: 10, cellPadding: 7, textColor: 35 },
        headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 40, right: 40 },
      })

      doc.addPage()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(ink[0], ink[1], ink[2])
      doc.text('Technical Impact', 40, 54)

      autoTable(doc, {
        startY: 72,
        head: [['Path', 'Type', 'Change', 'Risk', 'Lines', 'Reason']],
        body: report.affectedFiles.map((f) => [f.path, f.type, f.change, f.risk, String(f.linesChanged), f.reason]),
        styles: { fontSize: 9, cellPadding: 6, textColor: 35, overflow: 'linebreak' },
        headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 40, right: 40 },
        columnStyles: {
          0: { cellWidth: 145 },
          5: { cellWidth: 170 },
        },
      })

      const filesTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 220
      autoTable(doc, {
        startY: filesTableY + 18,
        head: [['Table', 'Operation', 'Risk', 'Migration', 'Detail']],
        body: report.dbChanges.map((c) => [c.table, c.operation, c.risk, c.migration, c.detail]),
        styles: { fontSize: 9, cellPadding: 6, textColor: 35, overflow: 'linebreak' },
        headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 40, right: 40 },
        columnStyles: {
          4: { cellWidth: 215 },
        },
      })

      doc.addPage()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(ink[0], ink[1], ink[2])
      doc.text('Business Impact And Quality Plan', 40, 54)

      autoTable(doc, {
        startY: 72,
        head: [['Functional Area', 'Impact', 'Description', 'Affected Flows']],
        body: report.functionalAreas.map((a) => [a.name, a.impact, a.description, a.affectedFlows.join(', ')]),
        styles: { fontSize: 9, cellPadding: 6, textColor: 35, overflow: 'linebreak' },
        headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 40, right: 40 },
        columnStyles: {
          2: { cellWidth: 170 },
          3: { cellWidth: 180 },
        },
      })

      const functionalTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 220
      autoTable(doc, {
        startY: functionalTableY + 18,
        head: [['Test ID', 'Title', 'Feature', 'Type', 'Status']],
        body: report.testCases.map((t) => [t.id, t.title, t.feature, t.type, t.status]),
        styles: { fontSize: 9, cellPadding: 6, textColor: 35, overflow: 'linebreak' },
        headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 40, right: 40 },
      })

      doc.addPage()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(ink[0], ink[1], ink[2])
      doc.text('Recommendations And Dependencies', 40, 54)

      autoTable(doc, {
        startY: 72,
        head: [['Priority', 'Category', 'Recommendation']],
        body: report.recommendations.map((r) => [r.priority, r.category, r.text]),
        styles: { fontSize: 9, cellPadding: 6, textColor: 35, overflow: 'linebreak' },
        headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 40, right: 40 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const p = String(data.cell.raw)
            if (p === 'P0') data.cell.styles.textColor = [185, 28, 28]
            if (p === 'P1') data.cell.styles.textColor = [180, 83, 9]
            if (p === 'P2') data.cell.styles.textColor = [3, 105, 161]
            data.cell.styles.fontStyle = 'bold'
          }
        },
      })

      const recTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 220
      autoTable(doc, {
        startY: recTableY + 18,
        head: [['Package', 'Version', 'Reason']],
        body: report.dependencies.map((d) => [d.name, d.version, d.reason]),
        styles: { fontSize: 9, cellPadding: 6, textColor: 35, overflow: 'linebreak' },
        headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 40, right: 40 },
      })

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i += 1) {
        doc.setPage(i)
        const h = doc.internal.pageSize.getHeight()
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(120, 120, 120)
        doc.text(`AI Impact Analyser • ${report.ticketId}`, 40, h - 20)
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 96, h - 20)
      }

      const safeTicket = report.ticketId.replace(/[^a-zA-Z0-9_-]/g, '_')
      doc.save(`${safeTicket || 'impact-report'}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  const counts: Record<Tab, number> = {
    files: report.affectedFiles.length,
    database: report.dbChanges.length,
    tests: report.testCases.length,
    recommendations: report.recommendations.length,
    dependencies: report.dependencies.length,
  }

  return (
    <div className="max-w-7xl mx-auto px-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6 animate-slide-up">
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1.5">
            <span className="font-mono text-ember font-semibold">{report.ticketId}</span>
            <ChevronRight className="w-3 h-3" />
            <span>Impact Report</span>
            <span className="text-zinc-700">·</span>
            <Clock className="w-3 h-3" /> {report.generatedAt}
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">{report.ticketSummary}</h2>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost"><Share2 className="w-4 h-4" /> Share</button>
          <button onClick={exportReport} className="btn-ghost btn-ghost-strong" disabled={exporting}>
            <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Hero gauge card */}
      <div className={`panel p-6 md:p-10 mb-6 animate-slide-up stagger-1 relative overflow-hidden ${cfg.glow}`}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: cfg.bg }} />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="relative grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="flex justify-center">
            <RiskGauge score={report.riskScore} level={report.riskLevel} size={240} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-display text-xl font-bold text-white">Overall Impact Assessment</h3>
              <RiskPill level={report.riskLevel} size="lg" />
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-2xl">{report.summary}</p>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ScoreBar label="Files" value={report.scoreBreakdown.files} color="#ff453a" />
              <ScoreBar label="Database" value={report.scoreBreakdown.database} color="#ff9f0a" />
              <ScoreBar label="Functional" value={report.scoreBreakdown.functional} color="#30d158" />
              <ScoreBar label="Tests" value={report.scoreBreakdown.tests} color="#8b5cf6" />
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-white/5">
              <QuickStat value={report.affectedFiles.length} label="Files" />
              <QuickStat value={report.dbChanges.length} label="DB ops" />
              <QuickStat value={report.functionalAreas.length} label="Flows" />
              <QuickStat value={report.testCases.length} label="Tests" />
            </div>
          </div>
        </div>
      </div>

      {/* Split columns */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Technical Impact */}
        <div className="animate-slide-up stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <ScanLine className="w-4 h-4 text-ember" />
            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">Technical Impact</h3>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tabs.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                  <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded ${active ? 'bg-ember/20 text-ember' : 'bg-white/5 text-zinc-600'}`}>{counts[t.id]}</span>
                </button>
              )
            })}
          </div>

          <div className="panel p-5 animate-fade-in" key={tab}>
            {tab === 'files' && (
              <div className="grid md:grid-cols-[200px_1fr] gap-4">
                {/* File list */}
                <div className="space-y-1 max-h-[420px] overflow-y-auto">
                  {report.affectedFiles.map((f) => (
                    <button
                      key={f.path}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left rounded-lg px-3 py-2.5 transition-all ${
                        selectedFile.path === f.path ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`chip border text-[10px] ${changeStyles[f.change]}`}>{f.change}</span>
                        <RiskPill level={f.risk} size="sm" />
                      </div>
                      <div className="font-mono text-xs text-zinc-300 truncate">{f.path.split('/').pop()}</div>
                      <div className="text-[10px] text-zinc-600 truncate">{f.path}</div>
                    </button>
                  ))}
                </div>
                {/* Diff viewer */}
                <div className="rounded-xl overflow-hidden border border-white/5 bg-black/20">
                  <DiffViewer filename={selectedFile.path.split('/').pop() ?? ''} />
                  <div className="px-4 py-3 border-t border-white/5">
                    <div className="text-xs text-zinc-500 mb-1">Impact Reason</div>
                    <p className="text-xs text-zinc-400">{selectedFile.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {tab === 'database' && (
              <div className="space-y-3">
                {report.dbChanges.map((c, i) => {
                  const dc = riskConfig[c.risk]
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-black/30 border border-white/5 p-4 hover:border-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: dc.bg, border: `1px solid ${dc.color}22` }}>
                        <Database className="w-4.5 h-4.5" style={{ color: dc.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-mono text-sm text-white font-bold">{c.operation}</span>
                          <span className="font-mono text-sm text-ember">{c.table}</span>
                          <RiskPill level={c.risk} size="sm" />
                        </div>
                        <code className="text-xs text-zinc-400 font-mono block bg-black/40 rounded-lg px-3 py-2 border border-white/5">{c.detail}</code>
                        <div className="text-xs text-zinc-600 mt-2 flex items-center gap-1.5">
                          <GitCommit className="w-3 h-3" /> {c.migration}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className="flex items-start gap-3 rounded-xl bg-ember/5 border border-ember/20 p-4">
                  <AlertTriangle className="w-5 h-5 text-ember shrink-0 mt-0.5" />
                  <div className="text-sm text-zinc-300">
                    <span className="font-bold text-ember">Migration order matters.</span> Apply <code className="font-mono text-xs bg-ember/10 px-1.5 py-0.5 rounded">0042</code> before <code className="font-mono text-xs bg-ember/10 px-1.5 py-0.5 rounded">0043</code>.
                  </div>
                </div>
              </div>
            )}

            {tab === 'tests' && (
              <div className="space-y-2">
                {report.testCases.map((t, i) => {
                  const typeTone: Record<string, string> = {
                    regression: 'bg-amber2/10 text-amber2 border-amber2/20',
                    new: 'bg-emerald2/10 text-emerald2 border-emerald2/20',
                    integration: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                  }
                  return (
                    <div key={t.id} className={`flex items-center gap-3 rounded-xl bg-black/30 border border-white/5 p-3.5 hover:border-white/10 transition-colors animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                      <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <FlaskConical className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-zinc-500 font-semibold">{t.id}</span>
                          <span className="text-sm text-zinc-200 font-medium">{t.title}</span>
                        </div>
                        <div className="text-xs text-zinc-600 mt-0.5 font-mono flex items-center gap-1.5">
                          <Hash className="w-3 h-3" /> {t.feature}
                        </div>
                      </div>
                      <span className={`chip border ${typeTone[t.type]}`}>{t.type}</span>
                      <span className={`chip ${t.status === 'required' ? 'bg-ember/10 text-ember border border-ember/20' : 'bg-white/5 text-zinc-500 border border-white/10'}`}>
                        {t.status === 'required' && <AlertTriangle className="w-3 h-3" />}{t.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {tab === 'recommendations' && (
              <div className="space-y-2.5">
                {report.recommendations.map((rec, i) => {
                  const prioTone: Record<string, { bg: string; text: string; border: string }> = {
                    P0: { bg: 'bg-ember/10', text: 'text-ember', border: 'border-ember/20' },
                    P1: { bg: 'bg-amber2/10', text: 'text-amber2', border: 'border-amber2/20' },
                    P2: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
                  }
                  const t = prioTone[rec.priority]
                  return (
                    <div key={i} className={`flex items-start gap-3 rounded-xl bg-black/30 border border-white/5 p-4 hover:border-white/10 transition-colors animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                      <span className={`chip ${t.bg} ${t.text} ${t.border} border font-bold shrink-0 px-3 py-1`}>{rec.priority}</span>
                      <div className="flex-1">
                        <p className="text-sm text-zinc-300 leading-relaxed">{rec.text}</p>
                        <span className="text-xs text-zinc-600 mt-1.5 inline-flex items-center gap-1.5">
                          <Layers className="w-3 h-3" /> {rec.category}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {tab === 'dependencies' && (
              <div className="space-y-2.5">
                {report.dependencies.map((d, i) => (
                  <div key={d.name} className={`flex items-center gap-3 rounded-xl bg-black/30 border border-white/5 p-4 hover:border-white/10 transition-colors animate-slide-up stagger-${i + 1}`}>
                    <div className="w-10 h-10 rounded-xl bg-emerald2/10 border border-emerald2/20 flex items-center justify-center shrink-0">
                      <Boxes className="w-4.5 h-4.5 text-emerald2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-white font-bold">{d.name}</span>
                        <span className="font-mono text-xs text-ember bg-ember/10 px-2 py-0.5 rounded-md border border-ember/20">{d.version}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{d.reason}</p>
                    </div>
                    <span className="chip bg-emerald2/10 text-emerald2 border border-emerald2/20">
                      <Sparkles className="w-3 h-3" /> new
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Business Impact */}
        <div className="animate-slide-up stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <Workflow className="w-4 h-4 text-amber2" />
            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">Business Impact</h3>
          </div>
          <FlowTimeline areas={report.functionalAreas} />
        </div>
      </div>

      <p className="text-center text-xs text-zinc-600 mt-8 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3" /> Generated {report.generatedAt} · AI Impact Analyser
      </p>
    </div>
  )
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs text-zinc-500 font-medium">{label}</span>
        <span className="font-display text-sm text-white font-bold tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${value * 4}%`, background: color, boxShadow: `0 0 8px ${color}66` }}
        />
      </div>
    </div>
  )
}

function QuickStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-2xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  )
}

function drawRiskGaugePng(score: number, level: 'High' | 'Medium' | 'Low') {
  const size = 460
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return ''
  }

  const center = size / 2
  const radius = 165
  const start = Math.PI * 0.75
  const end = Math.PI * 2.25
  const progress = start + (end - start) * Math.min(1, Math.max(0, score / 100))
  const color = level === 'High' ? '#ff453a' : level === 'Medium' ? '#ff9f0a' : '#30d158'

  ctx.clearRect(0, 0, size, size)
  const bg = ctx.createLinearGradient(0, 0, size, size)
  bg.addColorStop(0, '#0b1220')
  bg.addColorStop(1, '#1f2937')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.arc(center, center, radius, start, end)
  ctx.stroke()

  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 24
  ctx.beginPath()
  ctx.arc(center, center, radius, start, progress)
  ctx.stroke()
  ctx.shadowBlur = 0

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.font = '700 84px Helvetica'
  ctx.fillText(String(score), center, center + 18)
  ctx.font = '600 26px Helvetica'
  ctx.fillText(`${level.toUpperCase()} RISK`, center, center + 64)

  return canvas.toDataURL('image/png')
}

function drawScoreBarsPng(scoreBreakdown: { files: number; database: number; functional: number; tests: number }) {
  const width = 980
  const height = 320
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return ''
  }

  const items = [
    { label: 'Files', value: scoreBreakdown.files, color: '#ff453a' },
    { label: 'Database', value: scoreBreakdown.database, color: '#ff9f0a' },
    { label: 'Functional', value: scoreBreakdown.functional, color: '#30d158' },
    { label: 'Tests', value: scoreBreakdown.tests, color: '#8b5cf6' },
  ]

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#111827'
  ctx.font = '700 34px Helvetica'
  ctx.fillText('Score Breakdown', 28, 50)

  const left = 28
  const top = 84
  const rowHeight = 54
  const barX = 180
  const maxBarWidth = width - barX - 44

  items.forEach((item, i) => {
    const y = top + i * rowHeight
    const barWidth = Math.max(8, Math.round((item.value / 40) * maxBarWidth))

    ctx.fillStyle = '#374151'
    ctx.font = '600 22px Helvetica'
    ctx.fillText(item.label, left, y + 24)

    ctx.fillStyle = '#e5e7eb'
    roundRect(ctx, barX, y, maxBarWidth, 18, 9)
    ctx.fill()

    const grad = ctx.createLinearGradient(barX, y, barX + barWidth, y)
    grad.addColorStop(0, item.color)
    grad.addColorStop(1, item.color)
    ctx.fillStyle = grad
    roundRect(ctx, barX, y, barWidth, 18, 9)
    ctx.fill()

    ctx.fillStyle = '#111827'
    ctx.font = '700 18px Helvetica'
    ctx.fillText(String(item.value), barX + maxBarWidth + 10, y + 16)
  })

  return canvas.toDataURL('image/png')
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
