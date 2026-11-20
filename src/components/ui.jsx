import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { PiGithubLogo, PiLinkedinLogo, PiEnvelopeSimple, PiGlobe, PiXLogo, PiInstagramLogo, PiYoutubeLogo, PiFacebookLogo, PiMediumLogo, PiDevToLogo } from 'react-icons/pi'

export const ease = [0.22, 1, 0.36, 1]

export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const M = motion[as] || motion.div
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </M>
  )
}

export function SectionHeader({ index, label, title, aside, id }) {
  return (
    <div className="mb-14 grid gap-6 md:mb-20 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <Reveal>
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-xs text-signal">{index}</span>
            <span className="h-px w-10 bg-white/15" />
            <span className="eyebrow">{label}</span>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 id={id} className="h-section">{title}</h2>
        </Reveal>
      </div>
      {aside && (
        <Reveal delay={0.12} className="md:col-span-4 md:pb-2">
          <p className="max-w-sm text-[15px] leading-relaxed text-fog-400 md:ml-auto">{aside}</p>
        </Reveal>
      )}
    </div>
  )
}

// Sets --mx / --my on the element so the .spotlight border follows the pointer.
export function useSpotlight() {
  return useCallback((e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])
}

const SOCIAL_ICONS = {
  github: PiGithubLogo,
  linkedin: PiLinkedinLogo,
  email: PiEnvelopeSimple,
  x: PiXLogo,
  twitter: PiXLogo,
  instagram: PiInstagramLogo,
  youtube: PiYoutubeLogo,
  facebook: PiFacebookLogo,
  medium: PiMediumLogo,
  devto: PiDevToLogo,
  website: PiGlobe,
}
export const SOCIAL_PLATFORMS = Object.keys(SOCIAL_ICONS)

export function SocialIcon({ platform, ...props }) {
  const I = SOCIAL_ICONS[platform] || PiGlobe
  return <I {...props} />
}

export function isExternal(url) {
  return /^https?:\/\//.test(url || '')
}
