import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PiList, PiX, PiDownloadSimple } from 'react-icons/pi'
import { ease } from './ui'

const links = [
  { label: 'About', id: 'about' },
  { label: 'Skills', id: 'skills' },
  { label: 'Projects', id: 'projects' },
  { label: 'Achievements', id: 'achievements' },
  { label: 'Contact', id: 'contact' },
]

export default function Navbar({ profile }) {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    ;['home', ...links.map((l) => l.id)].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease, delay: 0.1 }}
        className="fixed inset-x-0 top-0 z-nav px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-[1240px] items-center justify-between rounded-2xl px-3 py-2 transition-all duration-500 sm:px-4 ${
            scrolled ? 'bg-ink-900/75 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.07] backdrop-blur-xl' : ''
          }`}
        >
          <a href="#home" onClick={go('home')} className="group flex items-center gap-2.5 rounded-lg py-1 pr-2">
            <img src="/pasindu-logo-signal.svg" alt="" className="h-8 w-8" />
            <span className="font-display text-[17px] font-bold tracking-tight">
              {profile.shortName}
              <span className="text-signal">.</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  aria-current={active === l.id ? 'true' : undefined}
                  className={`relative rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors ${
                    active === l.id ? 'text-ink-950' : 'text-fog-400 hover:text-fog-50'
                  }`}
                >
                  {active === l.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-signal"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {profile.cv && (
              <a href={profile.cv} download className="hidden items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] font-medium transition-all hover:border-signal hover:text-signal sm:inline-flex">
                <PiDownloadSimple size={15} /> CV
              </a>
            )}
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 md:hidden"
              aria-label="Open menu"
            >
              <PiList size={18} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-overlay flex flex-col bg-ink-950/95 px-6 pb-10 pt-5 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow">Menu</span>
              <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15" aria-label="Close menu">
                <PiX size={18} />
              </button>
            </div>
            <ul className="mt-12 space-y-2">
              {[{ label: 'Home', id: 'home' }, ...links].map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, ease, duration: 0.5 }}
                >
                  <a href={`#${l.id}`} onClick={go(l.id)} className="flex items-baseline gap-4 py-2 font-display text-4xl font-bold tracking-tight">
                    <span className="font-mono text-xs text-signal">0{i}</span>
                    <span className={active === l.id ? 'text-signal' : ''}>{l.label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            {profile.cv && (
              <a href={profile.cv} download className="btn-signal mt-auto">
                <PiDownloadSimple size={16} /> Download CV
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
