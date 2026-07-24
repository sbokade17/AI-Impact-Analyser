import PptxGenJS from 'pptxgenjs'
import { mockReport } from '../data/mockReport'

const C = {
  bg: 'F4F6FB',
  bgDeep: 'EEF1F7',
  panel: 'FFFFFF',
  panelSoft: 'F8FAFC',
  ink: '0F172A',
  inkMuted: '475569',
  inkFaint: '94A3B8',
  border: 'E2E8F0',
  borderSoft: 'F1F5F9',
  sky: '0EA5E9',
  skyDark: '0284C7',
  skyLight: 'E0F2FE',
  teal: '0D9488',
  tealLight: 'CCFBF1',
  ember: 'EF4444',
  emberLight: 'FEE2E2',
  amber: 'F59E0B',
  amberLight: 'FEF3C7',
  emerald: '10B981',
  emeraldLight: 'D1FAE5',
  violet: '8B5CF6',
  violetLight: 'EDE9FE',
  white: 'FFFFFF',
}

const F = {
  display: 'Space Grotesk',
  body: 'Plus Jakarta Sans',
  mono: 'Fira Code',
}

const W = 13.333
const H = 7.5

type Slide = ReturnType<PptxGenJS['addSlide']>

function drawGrid(pptx: PptxGenJS, s: Slide) {
  const spacing = 0.5
  for (let x = 0; x <= W; x += spacing) {
    s.addShape(pptx.ShapeType.line, { x, y: 0, w: 0, h: H, line: { color: C.borderSoft, width: 0.5 } })
  }
  for (let y = 0; y <= H; y += spacing) {
    s.addShape(pptx.ShapeType.line, { x: 0, y, w: W, h: 0, line: { color: C.borderSoft, width: 0.5 } })
  }
}

function drawAurora(pptx: PptxGenJS, s: Slide) {
  s.addShape(pptx.ShapeType.ellipse, {
    x: -1.5, y: -1.5, w: 5, h: 5,
    fill: { color: C.sky, transparency: 92 },
    line: { type: 'none' },
  })
  s.addShape(pptx.ShapeType.ellipse, {
    x: W - 3.5, y: -1, w: 5, h: 4,
    fill: { color: C.teal, transparency: 93 },
    line: { type: 'none' },
  })
}

function glowCircle(pptx: PptxGenJS, s: Slide, x: number, y: number, size: number, color: string, transparency: number) {
  s.addShape(pptx.ShapeType.ellipse, {
    x, y, w: size, h: size,
    fill: { color, transparency },
    line: { type: 'none' },
  })
}

function card(s: Slide, pptx: PptxGenJS, x: number, y: number, w: number, h: number, opts?: { fill?: string; border?: string; radius?: number; shadow?: boolean }) {
  const fill = opts?.fill ?? C.panel
  const border = opts?.border ?? C.border
  const radius = opts?.radius ?? 0.12
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: fill },
    line: { color: border, width: 1 },
    rectRadius: radius,
    shadow: opts?.shadow ? { type: 'outer', color: '94A3B8', blur: 8, offset: 2, angle: 90, opacity: 0.15 } : undefined,
  })
}

function iconBox(s: Slide, pptx: PptxGenJS, x: number, y: number, size: number, bg: string, border: string, symbol: string, symbolColor: string) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w: size, h: size,
    fill: { color: bg },
    line: { color: border, width: 1 },
    rectRadius: 0.08,
  })
  s.addText(symbol, {
    x, y, w: size, h: size,
    fontFace: F.body, fontSize: 14, color: symbolColor, bold: true,
    align: 'center', valign: 'middle',
  })
}

function gradientButton(s: Slide, pptx: PptxGenJS, x: number, y: number, w: number, h: number, label: string) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: C.sky },
    line: { color: C.skyDark, width: 1 },
    rectRadius: 0.08,
    shadow: { type: 'outer', color: C.sky, blur: 12, offset: 3, angle: 90, opacity: 0.3 },
  })
  s.addText(label, {
    x, y, w, h,
    fontFace: F.body, fontSize: 12, color: C.white, bold: true,
    align: 'center', valign: 'middle',
  })
}

function sectionLabel(s: Slide, pptx: PptxGenJS, text: string, color: string, x = 0.8, y = 0.5) {
  s.addShape(pptx.ShapeType.line, { x, y: y + 0.15, w: 0.3, h: 0, line: { color, width: 2 } })
  s.addText(text, {
    x: x + 0.4, y, w: 5, h: 0.35,
    fontFace: F.mono, fontSize: 10, color, bold: true, charSpacing: 3,
  })
}

function pill(s: Slide, pptx: PptxGenJS, x: number, y: number, w: number, h: number, label: string, bg: string, border: string, textColor: string) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: bg },
    line: { color: border, width: 1 },
    rectRadius: 0.5,
  })
  s.addText(label, {
    x, y, w, h,
    fontFace: F.body, fontSize: 9, color: textColor, bold: true,
    align: 'center', valign: 'middle',
  })
}

function progressBar(s: Slide, pptx: PptxGenJS, x: number, y: number, w: number, pct: number, color: string) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.1, fill: { color: C.border }, rectRadius: 0.05, line: { type: 'none' } })
  s.addShape(pptx.ShapeType.roundRect, { x, y, w: w * pct, h: 0.1, fill: { color }, rectRadius: 0.05, line: { type: 'none' } })
}

export function generatePresentation(PptxGen: typeof PptxGenJS) {
  const pptx = new PptxGen()
  pptx.defineLayout({ name: 'WIDE', width: W, height: H })
  pptx.layout = 'WIDE'
  pptx.author = 'AI Impact Analyser'
  pptx.title = 'AI Impact Analyser — Project Overview'

  // ============================================================
  // SLIDE 1: Title
  // ============================================================
  {
    const s = pptx.addSlide()
    s.background = { color: C.bg }
    drawGrid(pptx, s)
    drawAurora(pptx, s)

    // Left accent bar
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: H, fill: { color: C.sky }, line: { type: 'none' } })

    // Logo box
    s.addShape(pptx.ShapeType.roundRect, {
      x: 1.0, y: 1.0, w: 0.6, h: 0.6,
      fill: { color: C.sky },
      line: { type: 'none' },
      rectRadius: 0.1,
      shadow: { type: 'outer', color: C.sky, blur: 16, offset: 2, angle: 90, opacity: 0.3 },
    })
    s.addText('◆', { x: 1.0, y: 1.0, w: 0.6, h: 0.6, fontFace: F.body, fontSize: 18, color: C.white, bold: true, align: 'center', valign: 'middle' })

    // Section label
    s.addShape(pptx.ShapeType.line, { x: 1.0, y: 2.0, w: 0.3, h: 0, line: { color: C.sky, width: 2 } })
    s.addText('PROJECT OVERVIEW', {
      x: 1.4, y: 1.85, w: 5, h: 0.35,
      fontFace: F.mono, fontSize: 10, color: C.skyDark, bold: true, charSpacing: 3,
    })

    // Title
    s.addText('AI Impact Analyser', {
      x: 1.0, y: 2.4, w: 10, h: 1.0,
      fontFace: F.display, fontSize: 48, color: C.ink, bold: true,
    })

    // Subtitle
    s.addText('Intelligent impact assessment for code changes', {
      x: 1.0, y: 3.5, w: 10, h: 0.6,
      fontFace: F.body, fontSize: 20, color: C.inkMuted,
    })

    // Divider
    s.addShape(pptx.ShapeType.line, { x: 1.0, y: 4.3, w: 4, h: 0, line: { color: C.border, width: 1 } })

    s.addText('Why it exists  •  What it does  •  How it works', {
      x: 1.0, y: 4.5, w: 8, h: 0.4,
      fontFace: F.body, fontSize: 14, color: C.inkFaint,
    })

    // Feature pills row
    const pills = [
      { label: 'Risk Scoring', bg: C.skyLight, border: C.sky, text: C.skyDark },
      { label: 'Code Diffs', bg: C.tealLight, border: C.teal, text: C.teal },
      { label: 'Schema Analysis', bg: C.amberLight, border: C.amber, text: C.amber },
      { label: 'AI Recommendations', bg: C.violetLight, border: C.violet, text: C.violet },
    ]
    pills.forEach((p, i) => {
      const pw = 2.2
      const px = 1.0 + i * (pw + 0.2)
      pill(s, pptx, px, 5.4, pw, 0.4, p.label, p.bg, p.border, p.text)
    })

    // Bottom badge
    gradientButton(s, pptx, 1.0, 6.2, 2.4, 0.5, 'v0.1  •  2026')
  }

  // ============================================================
  // SLIDE 2: The Problem
  // ============================================================
  {
    const s = pptx.addSlide()
    s.background = { color: C.bg }
    drawGrid(pptx, s)
    glowCircle(pptx, s, -1, -1, 5, C.ember, 94)

    sectionLabel(s, pptx, 'THE PROBLEM', C.ember)
    s.addText('Why we need this', {
      x: 0.8, y: 0.85, w: 10, h: 0.7,
      fontFace: F.display, fontSize: 32, color: C.ink, bold: true,
    })

    const problems = [
      { icon: '◉', title: 'Invisible blast radius', desc: 'When a developer changes a service or schema, nobody knows which other services, tests, and user flows are affected until something breaks in production.', bg: C.emberLight, border: 'FECACA', color: C.ember },
      { icon: '✦', title: 'Manual, error-prone review', desc: 'Senior engineers spend hours tracing dependency graphs and reading code to assess risk. It is repetitive, inconsistent, and scales poorly with team size.', bg: C.amberLight, border: 'FDE68A', color: C.amber },
      { icon: '⇄', title: 'Specs drift from code', desc: 'Gherkin feature files describe intended behavior, but nothing checks whether a new Jira ticket conflicts with or invalidates existing scenarios.', bg: C.skyLight, border: 'BAE6FD', color: C.skyDark },
      { icon: '▤', title: 'Database changes are risky', desc: 'Schema migrations silently break foreign keys and assumptions in downstream services. There is no automated check for migration ordering or backfill requirements.', bg: C.violetLight, border: 'DDD6FE', color: C.violet },
    ]

    problems.forEach((p, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 0.8 + col * 6.0
      const y = 1.9 + row * 2.6

      card(s, pptx, x, y, 5.6, 2.3, { shadow: true })
      iconBox(s, pptx, x + 0.3, y + 0.3, 0.65, p.bg, p.border, p.icon, p.color)

      s.addText(p.title, {
        x: x + 1.1, y: y + 0.3, w: 4.3, h: 0.5,
        fontFace: F.display, fontSize: 16, color: C.ink, bold: true,
      })
      s.addText(p.desc, {
        x: x + 0.3, y: y + 1.05, w: 5.0, h: 1.1,
        fontFace: F.body, fontSize: 12, color: C.inkMuted, lineSpacingMultiple: 1.4,
      })
    })
  }

  // ============================================================
  // SLIDE 3: The Solution
  // ============================================================
  {
    const s = pptx.addSlide()
    s.background = { color: C.bg }
    drawGrid(pptx, s)
    glowCircle(pptx, s, -1, -1, 5, C.teal, 94)
    glowCircle(pptx, s, W - 3, H - 3, 5, C.sky, 94)

    sectionLabel(s, pptx, 'THE SOLUTION', C.teal)
    s.addText('What it does', {
      x: 0.8, y: 0.85, w: 10, h: 0.7,
      fontFace: F.display, fontSize: 32, color: C.ink, bold: true,
    })

    s.addText('AI Impact Analyser connects a Jira ticket and updated Gherkin feature files to your indexed codebase, database schema, and user documentation — then produces a scored, visual impact report in seconds.', {
      x: 0.8, y: 1.65, w: 11.5, h: 0.8,
      fontFace: F.body, fontSize: 15, color: C.inkMuted, lineSpacingMultiple: 1.5,
    })

    const steps = [
      { num: '1', title: 'Index the knowledge base', desc: 'Connect a Git repo, feature files, database schema, and user guides. The engine indexes 1,284+ artifacts once.', bg: C.skyLight, border: 'BAE6FD', color: C.skyDark, icon: '⚙' },
      { num: '2', title: 'Trigger an analysis', desc: 'Paste a Jira ticket and the proposed Gherkin scenarios. The AI compares them against the baseline.', bg: C.tealLight, border: '5EEAD4', color: C.teal, icon: '🔍' },
      { num: '3', title: 'Get a visual report', desc: 'A risk score, affected files with diffs, schema migrations, disrupted user flows, and prioritized recommendations.', bg: C.emberLight, border: 'FECACA', color: C.ember, icon: '📊' },
    ]

    steps.forEach((st, i) => {
      const x = 0.8 + i * 4.1
      const y = 2.8

      card(s, pptx, x, y, 3.7, 3.6, { shadow: true })

      // Number circle with glow
      glowCircle(pptx, s, x + 0.2, y + 0.2, 1.2, st.color, 88)
      s.addShape(pptx.ShapeType.ellipse, {
        x: x + 0.3, y: y + 0.3, w: 0.8, h: 0.8,
        fill: { color: st.color },
        line: { type: 'none' },
        shadow: { type: 'outer', color: st.color, blur: 12, offset: 2, angle: 90, opacity: 0.3 },
      })
      s.addText(st.num, { x: x + 0.3, y: y + 0.3, w: 0.8, h: 0.8, fontFace: F.display, fontSize: 24, color: C.white, bold: true, align: 'center', valign: 'middle' })

      s.addText(st.title, {
        x: x + 0.3, y: y + 1.3, w: 3.1, h: 0.5,
        fontFace: F.display, fontSize: 16, color: C.ink, bold: true,
      })
      s.addText(st.desc, {
        x: x + 0.3, y: y + 1.85, w: 3.1, h: 1.5,
        fontFace: F.body, fontSize: 12, color: C.inkMuted, lineSpacingMultiple: 1.4,
      })

      // Bottom pill
      pill(s, pptx, x + 0.3, y + 3.05, 2.5, 0.35, `Step ${st.num}`, st.bg, st.border, st.color)
    })

    // Arrow connectors
    s.addShape(pptx.ShapeType.rightArrow, { x: 4.5, y: 4.3, w: 0.35, h: 0.25, fill: { color: C.border }, line: { type: 'none' }, rotate: 0 })
    s.addShape(pptx.ShapeType.rightArrow, { x: 8.6, y: 4.3, w: 0.35, h: 0.25, fill: { color: C.border }, line: { type: 'none' }, rotate: 0 })
  }

  // ============================================================
  // SLIDE 4: Key Features
  // ============================================================
  {
    const s = pptx.addSlide()
    s.background = { color: C.bg }
    drawGrid(pptx, s)
    glowCircle(pptx, s, W - 3, -1, 5, C.sky, 94)

    sectionLabel(s, pptx, 'KEY FEATURES', C.skyDark)
    s.addText('What makes it different', {
      x: 0.8, y: 0.85, w: 10, h: 0.7,
      fontFace: F.display, fontSize: 32, color: C.ink, bold: true,
    })

    const features = [
      { icon: '◉', title: 'Risk Score Gauge', desc: 'A 0–100 score with High / Medium / Low severity, computed across files, database, functional scope, and test coverage gaps.', bg: C.emberLight, border: 'FECACA', color: C.ember },
      { icon: '⇄', title: 'Code Diff Viewer', desc: 'Terminal-style before/after diffs for every affected file, with change type and impact reasoning.', bg: C.skyLight, border: 'BAE6FD', color: C.skyDark },
      { icon: '▤', title: 'Schema Migration Analysis', desc: 'Detects required ALTER, CREATE, and INDEX operations. Flags migration ordering risks and backfill requirements.', bg: C.amberLight, border: 'FDE68A', color: C.amber },
      { icon: '↗', title: 'User Flow Timeline', desc: 'Visual timeline of disrupted customer journeys — checkout, refunds, notifications — with severity pill badges.', bg: C.tealLight, border: '5EEAD4', color: C.teal },
      { icon: '✓', title: 'Test Gap Detection', desc: 'Cross-references Gherkin scenarios against existing tests. Marks required regression, integration, and new test cases.', bg: C.violetLight, border: 'DDD6FE', color: C.violet },
      { icon: '✦', title: 'AI Recommendations', desc: 'Prioritized P0 / P1 / P2 action items — database, resilience, performance, and UX guidance.', bg: C.emeraldLight, border: 'A7F3D0', color: C.emerald },
    ]

    features.forEach((f, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = 0.8 + col * 4.1
      const y = 1.8 + row * 2.7

      card(s, pptx, x, y, 3.7, 2.4, { shadow: true })
      iconBox(s, pptx, x + 0.3, y + 0.3, 0.6, f.bg, f.border, f.icon, f.color)

      s.addText(f.title, {
        x: x + 1.05, y: y + 0.3, w: 2.5, h: 0.5,
        fontFace: F.display, fontSize: 15, color: C.ink, bold: true,
      })
      s.addText(f.desc, {
        x: x + 0.3, y: y + 1.0, w: 3.1, h: 1.3,
        fontFace: F.body, fontSize: 11.5, color: C.inkMuted, lineSpacingMultiple: 1.4,
      })
    })
  }

  // ============================================================
  // SLIDE 5: Real Example
  // ============================================================
  {
    const s = pptx.addSlide()
    s.background = { color: C.bg }
    drawGrid(pptx, s)
    glowCircle(pptx, s, -1, -1, 5, C.ember, 93)

    sectionLabel(s, pptx, 'REAL EXAMPLE', C.ember)
    s.addText(`${mockReport.ticketId} — ${mockReport.ticketSummary}`, {
      x: 0.8, y: 0.85, w: 11.5, h: 0.7,
      fontFace: F.display, fontSize: 24, color: C.ink, bold: true,
    })

    // ---- Left: Risk Score Panel ----
    const lx = 0.8
    const ly = 1.8
    card(s, pptx, lx, ly, 3.5, 4.9, { shadow: true })

    // Glow behind score
    glowCircle(pptx, s, lx + 0.5, ly + 0.5, 2.5, C.ember, 90)

    s.addText('RISK SCORE', {
      x: lx, y: ly + 0.2, w: 3.5, h: 0.35,
      fontFace: F.mono, fontSize: 10, color: C.inkFaint, bold: true, charSpacing: 2, align: 'center',
    })

    // Score circle
    s.addShape(pptx.ShapeType.ellipse, {
      x: lx + 1.0, y: ly + 0.7, w: 1.5, h: 1.5,
      fill: { color: C.emberLight },
      line: { color: C.ember, width: 3 },
    })
    s.addText(String(mockReport.riskScore), {
      x: lx + 1.0, y: ly + 0.7, w: 1.5, h: 1.5,
      fontFace: F.display, fontSize: 48, color: C.ember, bold: true, align: 'center', valign: 'middle',
    })

    pill(s, pptx, lx + 0.75, ly + 2.35, 2.0, 0.4, `${mockReport.riskLevel.toUpperCase()} RISK`, C.emberLight, 'FECACA', C.ember)

    // Score breakdown bars
    const breakdown = [
      { label: 'Files', value: mockReport.scoreBreakdown.files, color: C.sky },
      { label: 'Database', value: mockReport.scoreBreakdown.database, color: C.amber },
      { label: 'Functional', value: mockReport.scoreBreakdown.functional, color: C.teal },
      { label: 'Tests', value: mockReport.scoreBreakdown.tests, color: C.violet },
    ]

    s.addText('SCORE BREAKDOWN', {
      x: lx + 0.3, y: ly + 3.0, w: 3.0, h: 0.3,
      fontFace: F.mono, fontSize: 9, color: C.inkFaint, bold: true, charSpacing: 2,
    })

    breakdown.forEach((b, i) => {
      const by = ly + 3.4 + i * 0.35
      s.addText(b.label, { x: lx + 0.3, y: by, w: 1.2, h: 0.25, fontFace: F.body, fontSize: 10, color: C.inkMuted })
      s.addText(String(b.value), { x: lx + 2.5, y: by, w: 0.6, h: 0.25, fontFace: F.display, fontSize: 11, color: C.ink, bold: true, align: 'right' })
      progressBar(s, pptx, lx + 0.3, by + 0.25, 2.8, b.value / 40, b.color)
    })

    // ---- Right: Impact Summary + Stats ----
    const rx = 4.6
    const ry = 1.8
    card(s, pptx, rx, ry, 7.9, 4.9, { shadow: true })

    s.addText('IMPACT SUMMARY', {
      x: rx + 0.3, y: ry + 0.2, w: 5, h: 0.35,
      fontFace: F.mono, fontSize: 10, color: C.inkFaint, bold: true, charSpacing: 2,
    })

    s.addText(mockReport.summary, {
      x: rx + 0.3, y: ry + 0.6, w: 7.3, h: 1.6,
      fontFace: F.body, fontSize: 12.5, color: C.inkMuted, lineSpacingMultiple: 1.5,
    })

    // Stats grid
    const stats = [
      { value: mockReport.affectedFiles.length, label: 'Affected Files', bg: C.skyLight, color: C.skyDark },
      { value: mockReport.dbChanges.length, label: 'DB Changes', bg: C.amberLight, color: C.amber },
      { value: mockReport.functionalAreas.length, label: 'User Flows', bg: C.tealLight, color: C.teal },
      { value: mockReport.testCases.length, label: 'Test Cases', bg: C.violetLight, color: C.violet },
      { value: mockReport.recommendations.length, label: 'Recommendations', bg: C.emberLight, color: C.ember },
      { value: mockReport.dependencies.length, label: 'New Dependencies', bg: C.emeraldLight, color: C.emerald },
    ]

    stats.forEach((st, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const sx = rx + 0.3 + col * 2.5
      const sy = ry + 2.4 + row * 1.2

      // Mini card for each stat
      s.addShape(pptx.ShapeType.roundRect, {
        x: sx, y: sy, w: 2.3, h: 1.0,
        fill: { color: C.panelSoft },
        line: { color: C.border, width: 1 },
        rectRadius: 0.08,
      })

      s.addText(String(st.value), {
        x: sx + 0.2, y: sy + 0.1, w: 1.9, h: 0.5,
        fontFace: F.display, fontSize: 28, color: st.color, bold: true,
      })
      s.addText(st.label, {
        x: sx + 0.2, y: sy + 0.6, w: 1.9, h: 0.3,
        fontFace: F.body, fontSize: 10, color: C.inkFaint,
      })
    })
  }

  // ============================================================
  // SLIDE 6: Closing
  // ============================================================
  {
    const s = pptx.addSlide()
    s.background = { color: C.bg }
    drawGrid(pptx, s)
    glowCircle(pptx, s, W / 2 - 2.5, 1, 6, C.sky, 93)
    glowCircle(pptx, s, W / 2 - 1, H - 3, 5, C.teal, 94)

    // Top accent bar
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.12, fill: { color: C.sky }, line: { type: 'none' } })

    sectionLabel(s, pptx, 'THE BOTTOM LINE', C.skyDark, 1.0, 1.5)

    s.addText('Ship changes with confidence.', {
      x: 1.0, y: 2.0, w: 11, h: 1.0,
      fontFace: F.display, fontSize: 42, color: C.ink, bold: true,
    })

    s.addText('AI Impact Analyser turns a 4-hour manual code review into a 30-second automated assessment — so teams catch risky changes before they reach production, not after.', {
      x: 1.0, y: 3.2, w: 10, h: 1.2,
      fontFace: F.body, fontSize: 18, color: C.inkMuted, lineSpacingMultiple: 1.5,
    })

    s.addShape(pptx.ShapeType.line, { x: 1.0, y: 4.6, w: 4, h: 0, line: { color: C.border, width: 1 } })

    // Feature pills
    const pills = [
      { label: 'Risk Score', bg: C.emberLight, border: 'FECACA', text: C.ember },
      { label: 'Code Diffs', bg: C.skyLight, border: 'BAE6FD', text: C.skyDark },
      { label: 'Schema Analysis', bg: C.amberLight, border: 'FDE68A', text: C.amber },
      { label: 'User Flow Timeline', bg: C.tealLight, border: '5EEAD4', text: C.teal },
      { label: 'AI Recommendations', bg: C.violetLight, border: 'DDD6FE', text: C.violet },
    ]
    pills.forEach((p, i) => {
      const pw = 2.2
      const px = 1.0 + i * (pw + 0.15)
      pill(s, pptx, px, 4.85, pw, 0.4, p.label, p.bg, p.border, p.text)
    })

    // Bottom gradient button
    gradientButton(s, pptx, 1.0, 6.0, 3.0, 0.55, 'AI Impact Analyser')

    // Logo mark
    s.addShape(pptx.ShapeType.roundRect, {
      x: 4.2, y: 6.0, w: 0.55, h: 0.55,
      fill: { color: C.sky },
      line: { type: 'none' },
      rectRadius: 0.1,
      shadow: { type: 'outer', color: C.sky, blur: 12, offset: 2, angle: 90, opacity: 0.3 },
    })
    s.addText('◆', { x: 4.2, y: 6.0, w: 0.55, h: 0.55, fontFace: F.body, fontSize: 16, color: C.white, bold: true, align: 'center', valign: 'middle' })
  }

  return pptx
}
