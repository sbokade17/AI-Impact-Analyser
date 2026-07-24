import type pptxgen from 'pptxgenjs'
import { mockReport } from '../data/mockReport'

const COLORS = {
  bg: 'FFFFFF',
  bgSoft: 'F4F6FB',
  panel: 'EEF1F7',
  ink: '0F172A',
  inkMuted: '475569',
  inkFaint: '94A3B8',
  border: 'E2E8F0',
  sky: '0EA5E9',
  skyDark: '0284C7',
  teal: '0D9488',
  ember: 'EF4444',
  amber: 'F59E0B',
  emerald: '10B981',
  violet: '8B5CF6',
}

const FONT = {
  display: 'Space Grotesk',
  body: 'Plus Jakarta Sans',
  mono: 'Fira Code',
}

export function generatePresentation(PptxGen: typeof pptxgen) {
  const pptx = new PptxGen()
  pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 })
  pptx.layout = 'WIDE'
  pptx.author = 'AI Impact Analyser'
  pptx.title = 'AI Impact Analyser — Project Overview'

  // ---------- Slide 1: Title ----------
  {
    const s = pptx.addSlide()
    s.background = { color: COLORS.bgSoft }

    // Decorative accent bar
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.15, h: 7.5, fill: { color: COLORS.sky } })

    // Top label
    s.addText('PROJECT OVERVIEW', {
      x: 1.0, y: 1.2, w: 8, h: 0.4,
      fontFace: FONT.mono, fontSize: 11, color: COLORS.skyDark, bold: true, charSpacing: 3,
    })

    s.addText('AI Impact Analyser', {
      x: 1.0, y: 1.7, w: 10, h: 1.2,
      fontFace: FONT.display, fontSize: 44, color: COLORS.ink, bold: true,
    })

    s.addText('Intelligent impact assessment for code changes', {
      x: 1.0, y: 2.9, w: 10, h: 0.6,
      fontFace: FONT.body, fontSize: 20, color: COLORS.inkMuted,
    })

    // Divider
    s.addShape(pptx.ShapeType.line, { x: 1.0, y: 3.7, w: 4, h: 0, line: { color: COLORS.border, width: 1 } })

    s.addText('Why it exists  •  What it does  •  How it works', {
      x: 1.0, y: 3.9, w: 8, h: 0.4,
      fontFace: FONT.body, fontSize: 14, color: COLORS.inkFaint,
    })

    // Bottom badge
    s.addShape(pptx.ShapeType.roundRect, { x: 1.0, y: 5.8, w: 2.6, h: 0.55, fill: { color: COLORS.sky }, rectRadius: 0.08 })
    s.addText('v0.1  •  2026', { x: 1.0, y: 5.8, w: 2.6, h: 0.55, fontFace: FONT.mono, fontSize: 11, color: 'FFFFFF', align: 'center', valign: 'middle' })
  }

  // ---------- Slide 2: The Problem ----------
  {
    const s = pptx.addSlide()
    s.background = { color: COLORS.bg }

    s.addText('THE PROBLEM', {
      x: 0.8, y: 0.5, w: 8, h: 0.35,
      fontFace: FONT.mono, fontSize: 11, color: COLORS.ember, bold: true, charSpacing: 3,
    })
    s.addText('Why we need this', {
      x: 0.8, y: 0.85, w: 10, h: 0.7,
      fontFace: FONT.display, fontSize: 32, color: COLORS.ink, bold: true,
    })

    const problems = [
      { icon: '01', title: 'Invisible blast radius', desc: 'When a developer changes a service or schema, nobody knows which other services, tests, and user flows are affected until something breaks in production.' },
      { icon: '02', title: 'Manual, error-prone review', desc: 'Senior engineers spend hours tracing dependency graphs and reading code to assess risk. It is repetitive, inconsistent, and scales poorly with team size.' },
      { icon: '03', title: 'Specs drift from code', desc: 'Gherkin feature files describe intended behavior, but nothing checks whether a new Jira ticket conflicts with or invalidates existing scenarios.' },
      { icon: '04', title: 'Database changes are risky', desc: 'Schema migrations silently break foreign keys and assumptions in downstream services. There is no automated check for migration ordering or backfill requirements.' },
    ]

    problems.forEach((p, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 0.8 + col * 6.0
      const y = 1.9 + row * 2.5

      s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.6, h: 2.2, fill: { color: COLORS.panel }, line: { color: COLORS.border, width: 1 }, rectRadius: 0.1 })

      s.addText(p.icon, {
        x: x + 0.3, y: y + 0.25, w: 0.6, h: 0.5,
        fontFace: FONT.mono, fontSize: 22, color: COLORS.sky, bold: true,
      })

      s.addText(p.title, {
        x: x + 0.95, y: y + 0.25, w: 4.4, h: 0.5,
        fontFace: FONT.display, fontSize: 16, color: COLORS.ink, bold: true,
      })

      s.addText(p.desc, {
        x: x + 0.3, y: y + 0.85, w: 5.0, h: 1.2,
        fontFace: FONT.body, fontSize: 12, color: COLORS.inkMuted, lineSpacingMultiple: 1.4,
      })
    })
  }

  // ---------- Slide 3: The Solution ----------
  {
    const s = pptx.addSlide()
    s.background = { color: COLORS.bg }

    s.addText('THE SOLUTION', {
      x: 0.8, y: 0.5, w: 8, h: 0.35,
      fontFace: FONT.mono, fontSize: 11, color: COLORS.teal, bold: true, charSpacing: 3,
    })
    s.addText('What it does', {
      x: 0.8, y: 0.85, w: 10, h: 0.7,
      fontFace: FONT.display, fontSize: 32, color: COLORS.ink, bold: true,
    })

    s.addText('AI Impact Analyser connects a Jira ticket and updated Gherkin feature files to your indexed codebase, database schema, and user documentation — then produces a scored, visual impact report in seconds.', {
      x: 0.8, y: 1.65, w: 11.5, h: 0.8,
      fontFace: FONT.body, fontSize: 15, color: COLORS.inkMuted, lineSpacingMultiple: 1.5,
    })

    const steps = [
      { num: '1', title: 'Index the knowledge base', desc: 'Connect a Git repo, feature files, database schema, and user guides. The engine indexes 1,284+ artifacts once.', color: COLORS.sky },
      { num: '2', title: 'Trigger an analysis', desc: 'Paste a Jira ticket and the proposed Gherkin scenarios. The AI compares them against the baseline.', color: COLORS.teal },
      { num: '3', title: 'Get a visual report', desc: 'A risk score, affected files with diffs, schema migrations, disrupted user flows, and prioritized recommendations.', color: COLORS.ember },
    ]

    steps.forEach((st, i) => {
      const x = 0.8 + i * 4.1
      const y = 2.8

      s.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.7, h: 3.5, fill: { color: COLORS.panel }, line: { color: COLORS.border, width: 1 }, rectRadius: 0.1 })

      // Number circle
      s.addShape(pptx.ShapeType.ellipse, { x: x + 0.3, y: y + 0.3, w: 0.7, h: 0.7, fill: { color: st.color } })
      s.addText(st.num, { x: x + 0.3, y: y + 0.3, w: 0.7, h: 0.7, fontFace: FONT.display, fontSize: 20, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' })

      s.addText(st.title, {
        x: x + 0.3, y: y + 1.2, w: 3.1, h: 0.5,
        fontFace: FONT.display, fontSize: 16, color: COLORS.ink, bold: true,
      })

      s.addText(st.desc, {
        x: x + 0.3, y: y + 1.75, w: 3.1, h: 1.5,
        fontFace: FONT.body, fontSize: 12, color: COLORS.inkMuted, lineSpacingMultiple: 1.4,
      })
    })

    // Arrow connectors
    s.addShape(pptx.ShapeType.rightArrow, { x: 4.4, y: 4.2, w: 0.4, h: 0.3, fill: { color: COLORS.border } })
    s.addShape(pptx.ShapeType.rightArrow, { x: 8.5, y: 4.2, w: 0.4, h: 0.3, fill: { color: COLORS.border } })
  }

  // ---------- Slide 4: Key Features ----------
  {
    const s = pptx.addSlide()
    s.background = { color: COLORS.bg }

    s.addText('KEY FEATURES', {
      x: 0.8, y: 0.5, w: 8, h: 0.35,
      fontFace: FONT.mono, fontSize: 11, color: COLORS.skyDark, bold: true, charSpacing: 3,
    })
    s.addText('What makes it different', {
      x: 0.8, y: 0.85, w: 10, h: 0.7,
      fontFace: FONT.display, fontSize: 32, color: COLORS.ink, bold: true,
    })

    const features = [
      { title: 'Risk Score Gauge', desc: 'A 0–100 score with High / Medium / Low severity, computed across files, database, functional scope, and test coverage gaps.', color: COLORS.ember },
      { title: 'Code Diff Viewer', desc: 'Terminal-style before/after diffs for every affected file, with change type (modified, added, deleted) and impact reasoning.', color: COLORS.sky },
      { title: 'Schema Migration Analysis', desc: 'Detects required ALTER, CREATE, and INDEX operations. Flags migration ordering risks and backfill requirements.', color: COLORS.amber },
      { title: 'User Flow Timeline', desc: 'Visual timeline of disrupted customer journeys — checkout, refunds, notifications — with severity pill badges.', color: COLORS.teal },
      { title: 'Test Gap Detection', desc: 'Cross-references Gherkin scenarios against existing tests. Marks required regression, integration, and new test cases.', color: COLORS.violet },
      { title: 'AI Recommendations', desc: 'Prioritized P0 / P1 / P2 action items generated from the analysis — database, resilience, performance, and UX guidance.', color: COLORS.emerald },
    ]

    features.forEach((f, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = 0.8 + col * 4.1
      const y = 1.8 + row * 2.7

      s.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.7, h: 2.4, fill: { color: COLORS.panel }, line: { color: COLORS.border, width: 1 }, rectRadius: 0.1 })

      // Color dot
      s.addShape(pptx.ShapeType.ellipse, { x: x + 0.3, y: y + 0.3, w: 0.35, h: 0.35, fill: { color: f.color } })

      s.addText(f.title, {
        x: x + 0.8, y: y + 0.25, w: 2.7, h: 0.45,
        fontFace: FONT.display, fontSize: 15, color: COLORS.ink, bold: true,
      })

      s.addText(f.desc, {
        x: x + 0.3, y: y + 0.85, w: 3.1, h: 1.4,
        fontFace: FONT.body, fontSize: 11.5, color: COLORS.inkMuted, lineSpacingMultiple: 1.4,
      })
    })
  }

  // ---------- Slide 5: Real Example ----------
  {
    const s = pptx.addSlide()
    s.background = { color: COLORS.bg }

    s.addText('REAL EXAMPLE', {
      x: 0.8, y: 0.5, w: 8, h: 0.35,
      fontFace: FONT.mono, fontSize: 11, color: COLORS.ember, bold: true, charSpacing: 3,
    })
    s.addText(`${mockReport.ticketId} — ${mockReport.ticketSummary}`, {
      x: 0.8, y: 0.85, w: 11.5, h: 0.7,
      fontFace: FONT.display, fontSize: 24, color: COLORS.ink, bold: true,
    })

    // Risk score panel
    s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.8, w: 3.5, h: 4.8, fill: { color: COLORS.panel }, line: { color: COLORS.border, width: 1 }, rectRadius: 0.1 })

    s.addText('RISK SCORE', {
      x: 0.8, y: 2.0, w: 3.5, h: 0.35,
      fontFace: FONT.mono, fontSize: 10, color: COLORS.inkFaint, bold: true, charSpacing: 2, align: 'center',
    })

    s.addText(String(mockReport.riskScore), {
      x: 0.8, y: 2.4, w: 3.5, h: 1.4,
      fontFace: FONT.display, fontSize: 72, color: COLORS.ember, bold: true, align: 'center',
    })

    s.addText(`${mockReport.riskLevel.toUpperCase()} RISK`, {
      x: 0.8, y: 3.8, w: 3.5, h: 0.4,
      fontFace: FONT.mono, fontSize: 14, color: COLORS.ember, bold: true, align: 'center', charSpacing: 2,
    })

    // Score breakdown bars
    const breakdown = [
      { label: 'Files', value: mockReport.scoreBreakdown.files, color: COLORS.sky },
      { label: 'Database', value: mockReport.scoreBreakdown.database, color: COLORS.amber },
      { label: 'Functional', value: mockReport.scoreBreakdown.functional, color: COLORS.teal },
      { label: 'Tests', value: mockReport.scoreBreakdown.tests, color: COLORS.violet },
    ]

    breakdown.forEach((b, i) => {
      const y = 4.5 + i * 0.5
      s.addText(b.label, { x: 1.1, y, w: 1.2, h: 0.3, fontFace: FONT.body, fontSize: 11, color: COLORS.inkMuted })
      s.addText(String(b.value), { x: 3.5, y, w: 0.6, h: 0.3, fontFace: FONT.display, fontSize: 12, color: COLORS.ink, bold: true, align: 'right' })
      s.addShape(pptx.ShapeType.roundRect, { x: 1.1, y: y + 0.3, w: 2.9, h: 0.08, fill: { color: COLORS.border }, rectRadius: 0.04 })
      s.addShape(pptx.ShapeType.roundRect, { x: 1.1, y: y + 0.3, w: 2.9 * (b.value / 40), h: 0.08, fill: { color: b.color }, rectRadius: 0.04 })
    })

    // Impact summary panel
    s.addShape(pptx.ShapeType.roundRect, { x: 4.6, y: 1.8, w: 7.9, h: 4.8, fill: { color: COLORS.panel }, line: { color: COLORS.border, width: 1 }, rectRadius: 0.1 })

    s.addText('IMPACT SUMMARY', {
      x: 4.9, y: 2.0, w: 5, h: 0.35,
      fontFace: FONT.mono, fontSize: 10, color: COLORS.inkFaint, bold: true, charSpacing: 2,
    })

    s.addText(mockReport.summary, {
      x: 4.9, y: 2.4, w: 7.3, h: 1.6,
      fontFace: FONT.body, fontSize: 12.5, color: COLORS.inkMuted, lineSpacingMultiple: 1.5,
    })

    // Stats grid
    const stats = [
      { value: mockReport.affectedFiles.length, label: 'Affected Files' },
      { value: mockReport.dbChanges.length, label: 'DB Changes' },
      { value: mockReport.functionalAreas.length, label: 'User Flows' },
      { value: mockReport.testCases.length, label: 'Test Cases' },
      { value: mockReport.recommendations.length, label: 'Recommendations' },
      { value: mockReport.dependencies.length, label: 'New Dependencies' },
    ]

    stats.forEach((st, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = 4.9 + col * 2.5
      const y = 4.2 + row * 1.15

      s.addText(String(st.value), {
        x, y, w: 2.2, h: 0.55,
        fontFace: FONT.display, fontSize: 28, color: COLORS.ink, bold: true,
      })
      s.addText(st.label, {
        x, y: y + 0.55, w: 2.2, h: 0.35,
        fontFace: FONT.body, fontSize: 11, color: COLORS.inkFaint,
      })
    })
  }

  // ---------- Slide 6: Closing ----------
  {
    const s = pptx.addSlide()
    s.background = { color: COLORS.bgSoft }
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.15, fill: { color: COLORS.sky } })

    s.addText('THE BOTTOM LINE', {
      x: 1.0, y: 1.5, w: 8, h: 0.4,
      fontFace: FONT.mono, fontSize: 11, color: COLORS.skyDark, bold: true, charSpacing: 3,
    })

    s.addText('Ship changes with confidence.', {
      x: 1.0, y: 2.0, w: 11, h: 1.0,
      fontFace: FONT.display, fontSize: 40, color: COLORS.ink, bold: true,
    })

    s.addText('AI Impact Analyser turns a 4-hour manual code review into a 30-second automated assessment — so teams catch risky changes before they reach production, not after.', {
      x: 1.0, y: 3.1, w: 10, h: 1.2,
      fontFace: FONT.body, fontSize: 18, color: COLORS.inkMuted, lineSpacingMultiple: 1.5,
    })

    s.addShape(pptx.ShapeType.line, { x: 1.0, y: 4.5, w: 4, h: 0, line: { color: COLORS.border, width: 1 } })

    s.addText('Risk score  •  Code diffs  •  Schema analysis  •  User flow timeline  •  AI recommendations', {
      x: 1.0, y: 4.7, w: 11, h: 0.4,
      fontFace: FONT.body, fontSize: 13, color: COLORS.inkFaint,
    })

    s.addShape(pptx.ShapeType.roundRect, { x: 1.0, y: 5.8, w: 2.6, h: 0.55, fill: { color: COLORS.sky }, rectRadius: 0.08 })
    s.addText('AI Impact Analyser', { x: 1.0, y: 5.8, w: 2.6, h: 0.55, fontFace: FONT.mono, fontSize: 11, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' })
  }

  return pptx
}
