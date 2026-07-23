import { useMemo, useRef } from 'react'

const sectionLabels = ['Ticket:', 'Summary:', 'Acceptance Criteria:']

function highlightLine(line: string): { cls: string; text: string }[] {
  const trimmed = line.trimStart()
  const leading = line.length - trimmed.length
  const spaces = line.substring(0, leading)

  if (trimmed === '') return [{ cls: '', text: line }]

  const section = sectionLabels.find((label) => trimmed.startsWith(label))
  if (section) {
    return [
      { cls: '', text: spaces },
      { cls: 'jira-label', text: section },
      { cls: 'jira-text', text: trimmed.substring(section.length) },
    ]
  }

  if (trimmed.startsWith('-')) {
    const rest = trimmed.substring(1)
    const parts: { cls: string; text: string }[] = [{ cls: '', text: spaces }, { cls: 'jira-bullet', text: '-' }]
    const stringRegex = /("[^"]*")/g
    let last = 0
    let match
    while ((match = stringRegex.exec(rest)) !== null) {
      if (match.index > last) parts.push({ cls: 'jira-text', text: rest.substring(last, match.index) })
      parts.push({ cls: 'jira-string', text: match[0] })
      last = match.index + match[0].length
    }
    if (last < rest.length) parts.push({ cls: 'jira-text', text: rest.substring(last) })
    return parts
  }

  const parts: { cls: string; text: string }[] = [{ cls: '', text: spaces }]
  const stringRegex = /("[^"]*")/g
  let last = 0
  let match
  while ((match = stringRegex.exec(trimmed)) !== null) {
    if (match.index > last) parts.push({ cls: 'jira-text', text: trimmed.substring(last, match.index) })
    parts.push({ cls: 'jira-string', text: match[0] })
    last = match.index + match[0].length
  }
  if (last < trimmed.length) parts.push({ cls: 'jira-text', text: trimmed.substring(last) })
  if (parts.length === 1) parts[0] = { cls: 'jira-text', text: line }
  return parts
}

export default function JiraCode({ code, editable = false, onChange }: { code: string; editable?: boolean; onChange?: (v: string) => void }) {
  const lines = useMemo(() => code.split('\n'), [code])
  const previewRef = useRef<HTMLPreElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const renderLines = () =>
    lines.map((line, i) => {
      const parts = highlightLine(line)
      return (
        <div key={i} className="flex gap-4 px-2 -mx-2 rounded-sm">
          <span className="text-zinc-600 select-none w-6 text-right shrink-0">{i + 1}</span>
          <span className="whitespace-pre">
            {parts.map((p, j) => (
              <span key={j} className={p.cls}>{p.text}</span>
            ))}
            {line === '' && '\u00A0'}
          </span>
        </div>
      )
    })

  if (editable && onChange) {
    return (
      <div className="editor-shell relative h-full overflow-hidden rounded-b-2xl">
        <pre ref={previewRef} className="editor-preview absolute inset-0 overflow-hidden font-mono text-sm leading-relaxed p-5 pointer-events-none select-none">
          {renderLines()}
        </pre>
        <textarea
          ref={editorRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={() => {
            if (!previewRef.current || !editorRef.current) return
            previewRef.current.scrollTop = editorRef.current.scrollTop
            previewRef.current.scrollLeft = editorRef.current.scrollLeft
          }}
          spellCheck={false}
          className="relative z-10 w-full h-full min-h-[340px] bg-transparent font-mono text-sm leading-relaxed outline-none resize-none p-5 text-transparent caret-ember overflow-auto"
          style={{ tabSize: 2, WebkitTextFillColor: 'transparent' }}
        />
      </div>
    )
  }

  return <div className="font-mono text-sm leading-relaxed p-4 overflow-x-auto">{renderLines()}</div>
}