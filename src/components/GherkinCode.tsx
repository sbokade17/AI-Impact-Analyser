import { useMemo } from 'react'

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

  if (editable && onChange) {
    return (
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="w-full h-full bg-transparent font-mono text-sm leading-relaxed text-zinc-200 outline-none resize-none p-4"
        style={{ tabSize: 2 }}
      />
    )
  }

  return (
    <div className="font-mono text-sm leading-relaxed p-4 overflow-x-auto">
      {lines.map((line, i) => {
        const parts = highlightLine(line)
        return (
          <div key={i} className="flex gap-4 hover:bg-white/[0.02] px-2 -mx-2 rounded">
            <span className="text-zinc-700 select-none w-6 text-right shrink-0">{i + 1}</span>
            <span className="whitespace-pre">
              {parts.map((p, j) => (
                <span key={j} className={p.cls}>{p.text}</span>
              ))}
              {line === '' && '\u00A0'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
