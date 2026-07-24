interface DiffViewerProps {
  filename: string
  proposedPatch?: string
  previewSource?: string
  previewBranch?: string
}

interface PatchLine {
  kind: 'header' | 'hunk' | 'add' | 'del' | 'ctx'
  content: string
}

function parseUnifiedPatch(patch?: string): PatchLine[] {
  if (!patch) {
    return []
  }

  return patch.split('\n').map((line) => {
    if (line.startsWith('---') || line.startsWith('+++')) return { kind: 'header', content: line }
    if (line.startsWith('@@')) return { kind: 'hunk', content: line }
    if (line.startsWith('+')) return { kind: 'add', content: line }
    if (line.startsWith('-')) return { kind: 'del', content: line }
    return { kind: 'ctx', content: line }
  })
}

export default function DiffViewer({ filename, proposedPatch, previewSource, previewBranch }: DiffViewerProps) {
  const patchLines = parseUnifiedPatch(proposedPatch)
  return (
    <div className="font-mono text-xs">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-black/30">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-ember/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber2/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald2/70" />
        </div>
        <span className="text-zinc-500 text-xs ml-2">{filename}</span>
        {previewSource && (
          <span className="ml-auto text-[10px] text-zinc-600">
            {previewSource}{previewBranch ? ` @ ${previewBranch}` : ''}
          </span>
        )}
      </div>
      <div className="border-t border-white/5 px-4 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Generated proposed patch</div>
      <div className="overflow-x-auto py-1 max-h-64">
        {patchLines.length > 0 ? (
          patchLines.map((line, i) => (
            <div
              key={`${line.kind}-${i}`}
              className={`flex items-start gap-3 px-4 py-0.5 ${
                line.kind === 'add' ? 'diff-add' : line.kind === 'del' ? 'diff-del' : 'diff-ctx'
              }`}
            >
              <span className="text-zinc-600 select-none w-7 text-right shrink-0">{line.kind === 'header' || line.kind === 'hunk' ? '' : i + 1}</span>
              <span className={`select-none w-4 shrink-0 ${line.kind === 'add' ? 'diff-add-text' : line.kind === 'del' ? 'diff-del-text' : 'text-zinc-600'}`}>
                {line.kind === 'add' ? '+' : line.kind === 'del' ? '-' : ' '}
              </span>
              <span className={line.kind === 'header' || line.kind === 'hunk' ? 'whitespace-pre text-zinc-500' : line.kind === 'ctx' ? 'whitespace-pre text-zinc-300' : 'whitespace-pre text-zinc-200'}>{line.content || ' '}</span>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-zinc-300">No generated patch available for this file.</p>
            <p className="mt-2 text-xs text-zinc-500">
              The analysis did not return a grounded proposed patch for this path.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
