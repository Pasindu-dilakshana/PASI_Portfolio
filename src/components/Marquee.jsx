import { getIcon } from '../lib/icons'

export default function Marquee({ items }) {
  if (!items?.length) return null
  const row = [...items, ...items]
  return (
    <div className="relative border-y border-white/[0.06] bg-ink-900/40 py-6" aria-label="Tools I work with">
      <div className="marquee-mask overflow-hidden">
        <ul className="flex w-max animate-marquee items-center gap-12 pr-12 hover:[animation-play-state:paused]">
          {row.map((t, i) => {
            const Icon = getIcon(t.icon)
            return (
              <li key={i} aria-hidden={i >= items.length} className="flex shrink-0 items-center gap-3 text-fog-400 transition-colors hover:text-fog-50">
                <Icon size={22} />
                <span className="font-display text-xl font-semibold tracking-tight">{t.name}</span>
                <span className="ml-9 text-signal/60">✦</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
