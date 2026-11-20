import { getIcon } from '../lib/icons'
import { Reveal, SectionHeader, useSpotlight } from './ui'

const LEVELS = { 1: 'Learning', 2: 'Working', 3: 'Strong' }

// Signal-strength bars instead of fake percentages.
function SignalBars({ level }) {
  return (
    <span className="flex items-end gap-[3px]" aria-label={LEVELS[level]} title={LEVELS[level]}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`w-[5px] rounded-[1.5px] ${n <= level ? 'bg-signal' : 'bg-white/10'}`}
          style={{ height: 5 + n * 4 }}
        />
      ))}
    </span>
  )
}

export default function Skills({ skills, alsoFamiliar }) {
  const spot = useSpotlight()
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-28 md:py-36">
      <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,transparent,#000_20%,#000_80%,transparent)]" />
      <div className="container-x relative">
        <SectionHeader
          id="skills-title"
          index="02"
          label="Skills"
          title={<>What I can configure, <span className="text-fog-500">script and ship.</span></>}
          aside={
            <span className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px]">
              {[3, 2, 1].map((l) => (
                <span key={l} className="inline-flex items-center gap-2"><SignalBars level={l} /> {LEVELS[l]}</span>
              ))}
            </span>
          }
        />

        <div className="grid gap-5 md:grid-cols-2">
          {skills.map((cat, ci) => {
            const Icon = getIcon(cat.icon)
            return (
              <Reveal key={cat.id || cat.category} delay={ci * 0.06}>
                <article onMouseMove={spot} className="panel spotlight group h-full p-7 sm:p-8">
                  <header className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-signal ring-1 ring-inset ring-white/[0.08] transition-transform duration-300 group-hover:-rotate-6">
                        <Icon size={20} />
                      </span>
                      {cat.category}
                    </h3>
                    <span className="font-mono text-[11px] text-fog-500">{String(cat.items.length).padStart(2, '0')} items</span>
                  </header>
                  <ul className="divide-y divide-white/[0.05]">
                    {cat.items.map((s) => (
                      <li key={s.name} className="flex items-center justify-between gap-4 py-3 text-[15px] text-fog-200 transition-colors hover:text-fog-50">
                        <span>{s.name}</span>
                        <SignalBars level={s.level} />
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            )
          })}
        </div>

        {alsoFamiliar?.length > 0 && (
          <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-2">Also familiar with</span>
            {alsoFamiliar.map((t) => (
              <span key={t} className="chip transition-colors hover:border-signal/40 hover:text-signal">{t}</span>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  )
}
