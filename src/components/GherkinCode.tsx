import { useMemo, useRef } from 'react'

const keywords = ['Feature', 'Scenario', 'Scenario Outline', 'Given', 'When', 'Then', 'And', 'But', 'Background', 'Examples']

function highlightLine(line: string): { cls: string; text: string }[] {
  const trimmed = line.trimStart()
  const leading = line.length - trimmed.length
  const spaces = line.substring(0, leading)

  // Comment
  if (trimmed.startsWith('#')) return [{ cls: 'gh-comment', text: line }]

  // Find keyword
  const kw = keywords.find((k) => trimmed.startsWith(k))
  if (kw) {
    const rest = trimmed.substring(kw.length)
    // Highlight strings in rest
    const parts: { cls: string; text: string }[] = [{ cls: '', text: spaces }, { cls: 'gh-keyword', text: kw }]
    // Parse strings
    const stringRegex = /("[^"]*")/g
    let last = 0
    let match
    while ((match = stringRegex.exec(rest)) !== null) {
      if (match.index > last) parts.push({ cls: 'gh-text', text: rest.substring(last, match.index) })
      parts.push({ cls: 'gh-string', text: match[0] })
      last = match.index + match[0].length
    }
    if (last < rest.length) parts.push({ cls: 'gh-text', text: rest.substring(last) })
    return parts
  }

  // Plain line - highlight strings
  const parts: { cls: string; text: string }[] = [{ cls: '', text: spaces }]
  const stringRegex = /("[^"]*")/g
  let last = 0
  let match
  while ((match = stringRegex.exec(trimmed)) !== null) {
    if (match.index > last) parts.push({ cls: 'gh-text', text: trimmed.substring(last, match.index) })
    parts.push({ cls: 'gh-string', text: match[0] })
    last = match.index + match[0].length
  }
  if (last < trimmed.length) parts.push({ cls: 'gh-text', text: trimmed.substring(last) })
  if (parts.length === 1) parts[0] = { cls: 'gh-text', text: line }
  return parts
}

export default function GherkinCode({ code, editable = false, onChange }: { code: string; editable?: boolean; onChange?: (v: string) => void }) {
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
        <pre ref={previewRef} className="editor-preview absolute inset-0 overflow-hidden font-mono text-sm leading-relaxed p-4 pointer-events-none select-none">
          {renderLines()}
        </pre>
        <textarea
          ref={editorRef}
          wrap="off"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={() => {
            if (!previewRef.current || !editorRef.current) return
            previewRef.current.scrollTop = editorRef.current.scrollTop
            previewRef.current.scrollLeft = editorRef.current.scrollLeft
          }}
          spellCheck={false}
          className="relative z-10 w-full h-full min-h-[340px] bg-transparent font-mono text-sm leading-relaxed outline-none resize-none whitespace-pre py-4 pr-4 pl-[4rem] text-transparent caret-ember overflow-auto selection:bg-ember/20 selection:text-transparent"
          style={{ tabSize: 2, WebkitTextFillColor: 'transparent' }}
        />
      </div>
    )
  }

  return <div className="font-mono text-sm leading-relaxed p-4 overflow-x-auto">{renderLines()}</div>
}
