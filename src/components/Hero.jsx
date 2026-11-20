import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PiArrowDownRight, PiDownloadSimple, PiMapPin } from 'react-icons/pi'
import NetworkCanvas from './NetworkCanvas'
import { ease, SocialIcon, isExternal } from './ui'

function useTyped(words) {
  const [text, setText] = useState('')
  const [i, setI] = useState(0)
  const [del, setDel] = useState(false)
  useEffect(() => {
    if (!words?.length) return
    const word = words[i % words.length]
    let t
    if (!del && text === word) t = setTimeout(() => setDel(true), 1600)
    else if (del && text === '') {
      setDel(false)
      setI((v) => v + 1)
    } else
      t = setTimeout(
        () => setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        del ? 35 : 75
      )
    return () => clearTimeout(t)
  }, [text, del, i, words])
  return text
}

export default function Hero({ profile, socials }) {
  const typed = useTyped(profile.roles)
  const [first, ...rest] = profile.name.split(' ')
  const last = rest.join(' ')

  return (
    <section id="home" className="relative isolate flex min-h-[100dvh] items-center overflow-hidden pb-16 pt-28 md:pt-32">
      {/* topology background */}
      <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_75%_70%_at_60%_45%,#000_30%,transparent_80%)]">
        <NetworkCanvas />
      </div>
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[620px] w-[620px] rounded-full bg-signal/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-60 -left-40 -z-10 h-[520px] w-[520px] rounded-full bg-sky/[0.05] blur-[120px]" />

      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        {/* Text */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
            className="mb-8 flex flex-wrap items-center gap-3"
          >
            {profile.available && (
              <span className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/[0.08] px-3.5 py-1.5 text-[12.5px] font-medium text-signal">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-signal" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
                </span>
                {profile.availabilityText}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-fog-400">
              <PiMapPin size={14} /> {profile.location}
            </span>
          </motion.div>

          <h1 className="font-display font-extrabold leading-[0.86] tracking-tightest">
            <motion.span
              className="block text-[clamp(3.4rem,12vw,8.6rem)] lg:text-[min(7.3vw,7.6rem)]"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.3 }}
            >
              {first}
            </motion.span>
            {last && (
              <motion.span
                className="block text-[clamp(3.4rem,12vw,8.6rem)] lg:text-[min(7.3vw,7.6rem)] text-outline"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease, delay: 0.42 }}
              >
                {last}
                <span className="text-signal [-webkit-text-stroke:0]">.</span>
              </motion.span>
            )}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.6 }}
            className="mt-8 max-w-[34rem] text-lg leading-relaxed text-fog-200 sm:text-xl"
          >
            {profile.headline}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-3 font-mono text-[12.5px] text-fog-400"
          >
            {profile.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="btn-signal group"
            >
              See my work
              <PiArrowDownRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            {profile.cv && (
              <a href={profile.cv} download className="btn-ghost">
                <PiDownloadSimple size={16} /> Download CV
              </a>
            )}
            <div className="ml-1 flex items-center gap-1">
              {socials.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target={isExternal(s.url) ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-11 w-11 place-items-center rounded-full text-fog-400 transition-colors hover:bg-white/[0.05] hover:text-signal"
                >
                  <SocialIcon platform={s.platform} size={20} />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Photo + terminal */}
        <motion.div
          className="relative mx-auto w-full max-w-[400px] lg:col-span-5 lg:ml-auto lg:mr-0"
          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.1, ease, delay: 0.45 }}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] ring-1 ring-white/10">
            <img
              src={profile.photo}
              alt={`Portrait of ${profile.name}`}
              className="h-full w-full object-cover grayscale-[35%] contrast-[1.05] transition-all duration-700 hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-ink-950/70 px-3 py-1.5 font-mono text-[11px] text-fog-200 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" /> node: {profile.shortName.toLowerCase()}-01 · up
            </div>
            {/* corner brackets */}
            {['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'left-3 bottom-3 border-l border-b', 'right-3 bottom-3 border-r border-b'].map((c) => (
              <span key={c} className={`absolute h-5 w-5 border-signal/70 ${c}`} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.9 }}
            className="absolute -bottom-8 -left-4 w-[88%] rounded-2xl bg-ink-900/90 p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl sm:-left-10"
          >
            <div className="mb-3 flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
            </div>
            <p className="font-mono text-[12.5px] leading-6 text-fog-400">
              <span className="text-signal">{profile.shortName.toLowerCase()}@nsbm</span>:~$ show interests
            </p>
            <p className="font-mono text-[14px] leading-6 text-fog-50">
              &gt; {typed}
              <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-signal" />
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-3 font-mono text-[11px] text-fog-500 md:flex"
      >
        <span className="h-8 w-px overflow-hidden bg-white/10">
          <motion.span
            className="block h-3 w-px bg-signal"
            animate={{ y: [-12, 32] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
        scroll
      </motion.div>
    </section>
  )
}
