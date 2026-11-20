import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PiArrowUpRight, PiGithubLogo, PiX, PiCheckCircle, PiPlus } from 'react-icons/pi'
import { getIcon, ACCENTS } from '../lib/icons'
import { Reveal, SectionHeader, ease, useSpotlight } from './ui'

function StatusTag({ status }) {
  const done = /complete|live|shipped/i.test(status || '')
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10.5px] uppercase tracking-wider ${done ? 'bg-signal/10 text-signal' : 'bg-warn/10 text-warn'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${done ? 'bg-signal' : 'bg-warn animate-pulse'}`} />
      {status || 'Draft'}
    </span>
  )
}

export function ProjectCover({ project, index = 0, large = false }) {
  const color = ACCENTS[project.accent] || ACCENTS.lime
  const Icon = getIcon(project.icon)
  if (project.image) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <img src={project.image} alt={`${project.title} screenshot`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" />
      </div>
    )
  }
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-850">
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 85% 15%, ${color}38 0%, transparent 55%), radial-gradient(80% 80% at 10% 100%, ${color}18 0%, transparent 60%)` }} />
      <div className="dot-grid absolute inset-0 opacity-70" />
      {/* topology lines */}
      <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 400 250" aria-hidden="true">
        <g stroke={color} strokeWidth="0.8" fill="none" strokeOpacity="0.55">
          <path d="M40 200 L140 120 L260 160 L360 60" />
          <path d="M140 120 L180 40 M260 160 L300 230" />
        </g>
        {[[40, 200], [140, 120], [260, 160], [360, 60], [180, 40], [300, 230]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 1 ? 4 : 2.5} fill={color} />
        ))}
      </svg>
      <span className="absolute bottom-4 left-5 font-mono text-[11px] text-fog-400">P/{String(index + 1).padStart(2, '0')}</span>
      {project.category && (
        <span className="absolute left-5 top-5 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color }}>
          {project.category}
        </span>
      )}
      <div
        className={`absolute right-6 top-1/2 grid -translate-y-1/2 place-items-center rounded-[28%] ring-1 ring-inset ring-white/10 backdrop-blur-sm transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105 ${large ? 'h-28 w-28 sm:right-10' : 'h-20 w-20'}`}
        style={{ background: `${color}14`, color, boxShadow: `0 20px 60px -10px ${color}40` }}
      >
        <Icon size={large ? 52 : 38} />
      </div>
    </div>
  )
}

function Links({ project, compact }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noopener noreferrer" className={compact ? 'link-arrow text-signal' : 'btn-signal py-2.5'}>
          Live site <PiArrowUpRight size={15} />
        </a>
      )}
      {project.github && (
        <a href={project.github} target="_blank" rel="noopener noreferrer" className={compact ? 'link-arrow' : 'btn-ghost py-2.5'}>
          <PiGithubLogo size={16} /> Code
        </a>
      )}
    </div>
  )
}

function FeaturedCard({ project, index, onOpen }) {
  const spot = useSpotlight()
  return (
    <Reveal>
      <article onMouseMove={spot} className="panel spotlight group grid overflow-hidden lg:grid-cols-12">
        <button onClick={onOpen} className="relative aspect-[16/10] text-left lg:col-span-7 lg:aspect-auto lg:min-h-[420px]" aria-label={`Open details for ${project.title}`}>
          <ProjectCover project={project} index={index} large />
        </button>
        <div className="flex flex-col p-7 sm:p-9 lg:col-span-5">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[10.5px] uppercase tracking-wider text-fog-200">Featured</span>
            <StatusTag status={project.status} />
            <span className="font-mono text-[11px] text-fog-500">{[project.category, project.year].filter(Boolean).join(' · ')}</span>
          </div>
          <h3 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <button onClick={onOpen} className="text-left transition-colors hover:text-signal">{project.title}</button>
          </h3>
          <p className="mt-1 text-[15px] text-fog-400">{project.subtitle}</p>
          <p className="mt-5 text-[15.5px] leading-relaxed text-fog-200">{project.summary || project.description}</p>
          {project.highlights?.length > 0 && (
            <ul className="mt-6 space-y-2.5">
              {project.highlights.slice(0, 3).map((h) => (
                <li key={h} className="flex gap-2.5 text-[14.5px] text-fog-400">
                  <PiCheckCircle size={18} className="mt-0.5 shrink-0 text-signal" /> {h}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.tags?.map((t) => <span key={t} className="chip">{t}</span>)}
          </div>
          <div className="mt-auto pt-8">
            <Links project={project} />
          </div>
        </div>
      </article>
    </Reveal>
  )
}

function ProjectCard({ project, index, span, wide, onOpen }) {
  const spot = useSpotlight()
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease }}
      onMouseMove={spot}
      className={`panel spotlight group flex flex-col overflow-hidden ${wide ? 'lg:grid lg:grid-cols-2' : ''} ${span}`}
    >
      <button onClick={onOpen} className={`relative w-full text-left ${wide ? 'h-56 sm:h-64 lg:h-full lg:min-h-[300px]' : 'h-56 sm:h-64'}`} aria-label={`Open details for ${project.title}`}>
        <ProjectCover project={project} index={index} />
      </button>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusTag status={project.status} />
          <span className="font-mono text-[11px] text-fog-500">{[project.category, project.year].filter(Boolean).join(' · ')}</span>
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight">
          <button onClick={onOpen} className="text-left transition-colors hover:text-signal">{project.title}</button>
        </h3>
        <p className="mt-0.5 text-sm text-fog-500">{project.subtitle}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-fog-400">{project.summary || project.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.tags?.slice(0, 5).map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
        <div className="mt-auto flex items-center justify-between gap-4 pt-7">
          <Links project={project} compact />
          <button onClick={onOpen} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-fog-400 transition-all hover:rotate-90 hover:border-signal hover:text-signal" aria-label={`More about ${project.title}`}>
            <PiPlus size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

function Drawer({ project, index, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div className="fixed inset-0 z-drawer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.55, ease }}
        className="absolute inset-y-0 right-0 flex w-full max-w-[620px] flex-col overflow-y-auto bg-ink-900 ring-1 ring-white/10"
      >
        <div className="relative aspect-[16/9] shrink-0">
          <ProjectCover project={project} index={index} large />
          <button onClick={onClose} autoFocus className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-ink-950/80 text-fog-50 ring-1 ring-white/15 backdrop-blur transition-colors hover:text-signal" aria-label="Close">
            <PiX size={18} />
          </button>
        </div>
        <div className="p-7 sm:p-9">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <StatusTag status={project.status} />
            <span className="font-mono text-[11px] text-fog-500">{[project.category, project.year].filter(Boolean).join(' · ')}</span>
          </div>
          <h3 className="font-display text-4xl font-bold tracking-tight">{project.title}</h3>
          <p className="mt-1 text-fog-400">{project.subtitle}</p>
          <p className="mt-6 text-[16px] leading-[1.75] text-fog-200">{project.description}</p>
          {project.highlights?.length > 0 && (
            <>
              <h4 className="eyebrow mt-9">Highlights</h4>
              <ul className="mt-4 space-y-3">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-[15px] text-fog-200">
                    <PiCheckCircle size={19} className="mt-0.5 shrink-0 text-signal" /> {h}
                  </li>
                ))}
              </ul>
            </>
          )}
          {project.tags?.length > 0 && (
            <>
              <h4 className="eyebrow mt-9">Built with</h4>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            </>
          )}
          <div className="mt-10">
            <Links project={project} />
          </div>
        </div>
      </motion.aside>
    </motion.div>
  )
}

const SPANS = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7']

export default function Projects({ projects, githubUrl }) {
  const visible = useMemo(() => projects.filter((p) => p.visible !== false), [projects])
  const categories = useMemo(() => ['All', ...new Set(visible.map((p) => p.category).filter(Boolean))], [visible])
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState(null)

  const featured = filter === 'All' ? visible.filter((p) => p.featured) : []
  const rest = visible.filter((p) => (filter === 'All' ? !p.featured : p.category === filter))
  const indexOf = (p) => visible.indexOf(p)
  const open = visible.find((p) => p.id === openId)

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-28 md:py-36">
      <div className="container-x">
        <SectionHeader
          id="projects-title"
          index="03"
          label="Selected work"
          title={<>Things I've built <span className="text-fog-500">and broken on purpose.</span></>}
          aside="Network tools, security experiments and web platforms. Click any project for the full story."
        />

        {categories.length > 2 && (
          <Reveal className="mb-10 flex flex-wrap gap-2" y={12}>
            <div role="tablist" aria-label="Filter projects" className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-ink-900 p-1 ring-1 ring-white/[0.07]">
              {categories.map((c) => {
                const count = c === 'All' ? visible.length : visible.filter((p) => p.category === c).length
                return (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={filter === c}
                    onClick={() => setFilter(c)}
                    className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${filter === c ? 'text-ink-950' : 'text-fog-400 hover:text-fog-50'}`}
                  >
                    {filter === c && <motion.span layoutId="proj-filter" className="absolute inset-0 -z-0 rounded-full bg-signal" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                    <span className="relative">{c} <span className="font-mono text-[11px] opacity-60">{count}</span></span>
                  </button>
                )
              })}
            </div>
          </Reveal>
        )}

        <div className="space-y-5">
          {featured.map((p) => (
            <FeaturedCard key={p.id} project={p} index={indexOf(p)} onOpen={() => setOpenId(p.id)} />
          ))}
          <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
            <AnimatePresence mode="popLayout">
              {rest.map((p, i) => {
                const lone = rest.length % 2 === 1 && i === rest.length - 1
                return (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    index={indexOf(p)}
                    wide={lone}
                    span={lone ? 'md:col-span-2 lg:col-span-12' : SPANS[i % 4]}
                    onOpen={() => setOpenId(p.id)}
                  />
                )
              })}
            </AnimatePresence>
          </motion.div>
          {visible.length === 0 && (
            <div className="panel grid place-items-center px-6 py-20 text-center">
              <p className="font-display text-2xl font-bold">New projects are on the way.</p>
              <p className="mt-2 text-fog-400">Check back soon, or browse my GitHub in the meantime.</p>
            </div>
          )}
        </div>

        {githubUrl && (
          <Reveal className="mt-14 flex justify-center">
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <PiGithubLogo size={17} /> More on GitHub <PiArrowUpRight size={14} />
            </a>
          </Reveal>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {open && <Drawer project={open} index={indexOf(open)} onClose={() => setOpenId(null)} />}
        </AnimatePresence>,
        document.body
      )}
    </section>
  )
}
