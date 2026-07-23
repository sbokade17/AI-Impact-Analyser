import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
  children: React.ReactNode
  accentColor?: string
}

export default function Accordion({ title, icon, defaultOpen = false, badge, children, accentColor = '#ff453a' }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02]"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}11`, border: `1px solid ${accentColor}22` }}
        >
          {icon}
        </div>
        <span className="font-display font-semibold text-sm text-zinc-200 flex-1 text-left">{title}</span>
        {badge}
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
