import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
  suffix?: string
  className?: string
}

export default function CountUp({ value, duration = 1200, suffix = '', className = '' }: Props) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const tick = (now: number) => {
              const p = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - p, 3)
              setDisplay(value * eased)
              if (p < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.3 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {Math.round(display)}
      {suffix}
    </span>
  )
}
