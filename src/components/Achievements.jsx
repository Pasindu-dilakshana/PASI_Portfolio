import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { PiArrowUpRight, PiImage, PiX } from 'react-icons/pi'
import { ACHIEVEMENT_TYPE_ICON } from '../lib/icons'
import { computeStat } from '../lib/useContent'
import { Reveal, SectionHeader, ease, useSpotlight } from './ui'

function CountUp({ to, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return setN(to)
    const start = performance.now()
    let raf
    const tick = (t) => {
      const p = Math.min((t - start) / 1400, 1)
      setN(Math.round((1 - Math.pow(1 - p, 4)) * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])
  return (
    <span ref={ref} className="tabular">
      {n}
      <span className="text-signal">{suffix}</span>
    </span>
  )
}

function Lightbox({ item, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <motion.div className="fixed inset-0 z-drawer grid place-items-center bg-ink-950/85 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.figure initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ ease, duration: 0.5 }} className="relative max-h-[88vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <img src={item.image} alt={`${item.title} certificate`} className="max-h-[80vh] rounded-2xl object-contain ring-1 ring-white/10" />
        <figcaption className="mt-3 text-center text-sm text-fog-400">{item.title} — {item.issuer}</figcaption>
        <button onClick={onClose} autoFocus className="absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full bg-ink-900 ring-1 ring-white/15" aria-label="Close">
          <PiX size={18} />
        </button>
      </motion.figure>
    </motion.div>
  )
}

function FeaturedBadge({ a, onImage }) {
  const spot = useSpotlight()
  const Icon = ACHIEVEMENT_TYPE_ICON[a.type] || ACHIEVEMENT_TYPE_ICON.Other
  return (
    <article onMouseMove={spot} className="panel spotlight group flex h-full flex-col overflow-hidden">
      {a.image ? (
        <button onClick={onImage} className="relative aspect-[16/10] overflow-hidden bg-ink-850" aria-label={`View ${a.title} certificate`}>
          <img src={a.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        </button>
      ) : (
        <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-ink-850">
          <div className="dot-grid absolute inset-0" />
          <div className="absolute h-40 w-40 rounded-full bg-signal/10 blur-2xl transition-all duration-700 group-hover:bg-signal/20" />
          <div className="relative grid h-24 w-24 place-items-center rounded-full border border-signal/40 text-signal transition-transform duration-500 group-hover:rotate-12">
            <div className="absolute inset-2 rounded-full border border-dashed border-signal/30" />
            <Icon size={40} />
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-fog-500">
          <span className="text-signal">{a.type}</span>
          {a.date && <><span>·</span><span>{a.date}</span></>}
        </div>
        <h3 className="font-display text-xl font-bold leading-snug tracking-tight">{a.title}</h3>
        {a.issuer && <p className="mt-1 text-sm text-fog-400">{a.issuer}</p>}
        {a.description && <p className="mt-4 text-[14.5px] leading-relaxed text-fog-400">{a.description}</p>}
        {a.credentialUrl && (
          <a href={a.credentialUrl} target="_blank" rel="noopener noreferrer" className="link-arrow mt-auto pt-6 text-signal">
            Verify credential <PiArrowUpRight size={14} />
          </a>
        )}
      </div>
    </article>
  )
}

export default function Achievements({ content }) {
  const items = useMemo(() => (content.achievements || []).filter((a) => a.visible !== false), [content.achievements])
  const featured = items.filter((a) => a.featured)
  const rest = items.filter((a) => !a.featured)
  const [lightbox, setLightbox] = useState(null)
  const stats = (content.stats || []).map((s) => ({ ...s, n: computeStat(s, content) }))

  return (
    <section id="achievements" aria-labelledby="ach-title" className="relative py-28 md:py-36">
      <div className="container-x">
        <SectionHeader
          id="ach-title"
          index="04"
          label="Achievements"
          title={<>Proof of work, <span className="text-fog-500">on the record.</span></>}
          aside="Certifications, academic results and milestones from my degree and beyond."
        />

        {stats.length > 0 && (
          <Reveal>
            <dl className="mb-16 grid grid-cols-2 border-y border-white/[0.07] lg:grid-cols-4">
              {stats.map((s, i) => (
                <div key={s.id || s.label} className={`px-2 py-8 sm:px-6 ${i % 2 ? 'border-l border-white/[0.07]' : ''} ${i >= 2 ? 'border-t border-white/[0.07] lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}>
                  <dd className="font-display text-5xl font-extrabold tracking-tightest sm:text-6xl">
                    <CountUp to={s.n} suffix={s.suffix} />
                  </dd>
                  <dt className="mt-2 text-sm text-fog-400">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        {featured.length > 0 && (
          <div className={`mb-5 grid gap-5 ${featured.length === 1 ? 'md:grid-cols-2' : featured.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {featured.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.06}>
                <FeaturedBadge a={a} onImage={() => setLightbox(a)} />
              </Reveal>
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <Reveal>
            <ol className="panel divide-y divide-white/[0.06] overflow-hidden">
              {rest.map((a) => {
                const Icon = ACHIEVEMENT_TYPE_ICON[a.type] || ACHIEVEMENT_TYPE_ICON.Other
                return (
                  <li key={a.id} className="group grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 px-5 py-6 transition-colors hover:bg-white/[0.02] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-8">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] text-fog-200 ring-1 ring-inset ring-white/[0.07] transition-colors group-hover:text-signal">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="font-display text-lg font-semibold tracking-tight">{a.title}</h3>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-fog-500">{[a.type, a.date].filter(Boolean).join(' · ')}</span>
                      </div>
                      {a.issuer && <p className="mt-0.5 text-sm text-fog-400">{a.issuer}</p>}
                      {a.description && <p className="mt-2 max-w-[70ch] text-[14.5px] leading-relaxed text-fog-500">{a.description}</p>}
                    </div>
                    <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                      {a.image && (
                        <button onClick={() => setLightbox(a)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-fog-400 transition-colors hover:border-signal hover:text-signal" aria-label={`View ${a.title} certificate`}>
                          <PiImage size={16} />
                        </button>
                      )}
                      {a.credentialUrl && (
                        <a href={a.credentialUrl} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-fog-400 transition-colors hover:border-signal hover:text-signal" aria-label={`Verify ${a.title}`}>
                          <PiArrowUpRight size={16} />
                        </a>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Reveal>
        )}
      </div>
      {createPortal(<AnimatePresence>{lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}</AnimatePresence>, document.body)}
    </section>
  )
}
