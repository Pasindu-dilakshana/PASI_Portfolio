import { PiLightning } from 'react-icons/pi'
import { Reveal, SectionHeader, useSpotlight } from './ui'

export default function About({ profile }) {
  const spot = useSpotlight()
  const [lead, ...paras] = profile.about || []

  return (
    <section id="about" aria-labelledby="about-title" className="relative py-28 md:py-36">
      <div className="container-x">
        <SectionHeader
          id="about-title"
          index="01"
          label="About"
          title={<>Curious about the packet, <span className="text-fog-500">not just the page.</span></>}
        />

        <div className="grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div onMouseMove={spot} className="panel spotlight h-full overflow-hidden p-7 sm:p-10">
              {lead && <p className="font-display text-2xl font-medium leading-snug tracking-tight text-fog-50 sm:text-[1.7rem]">{lead}</p>}
              <div className="mt-8 space-y-5">
                {paras.map((p, i) => (
                  <p key={i} className="max-w-[62ch] text-[15.5px] leading-[1.75] text-fog-400">{p}</p>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid gap-5 lg:col-span-5">
            <Reveal delay={0.08}>
              <dl className="panel divide-y divide-white/[0.06] px-7 py-2">
                {(profile.facts || []).map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="eyebrow shrink-0">{f.label}</dt>
                    <dd className="text-right text-[15px] font-medium text-fog-50">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            {profile.currently && (
              <Reveal delay={0.14}>
                <div className="relative overflow-hidden rounded-[22px] bg-signal p-7 text-ink-950">
                  <div className="dot-grid absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(7,9,12,0.18)_1px,transparent_1px)]" />
                  <div className="relative">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em]">
                      <PiLightning size={14} /> Currently
                    </span>
                    <p className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight">{profile.currently}</p>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
