import { PiArrowUp } from 'react-icons/pi'
import { SocialIcon, isExternal } from './ui'

export default function Footer({ profile, socials }) {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] pt-16">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight">
              {profile.shortName}<span className="text-signal">.</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-fog-500">{profile.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a key={s.url} href={s.url} target={isExternal(s.url) ? '_blank' : undefined} rel="noopener noreferrer" aria-label={s.label} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-fog-400 transition-colors hover:border-signal hover:text-signal">
                <SocialIcon platform={s.platform} size={18} />
              </a>
            ))}
            <a href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="ml-2 grid h-11 w-11 place-items-center rounded-full bg-signal text-ink-950 transition-transform hover:-translate-y-1" aria-label="Back to top">
              <PiArrowUp size={18} />
            </a>
          </div>
        </div>
      </div>
      <p aria-hidden="true" className="pointer-events-none mt-10 select-none whitespace-nowrap text-center font-display text-[9.2vw] font-extrabold leading-[0.78] tracking-tightest text-outline opacity-60">
        {profile.name}
      </p>
      <div className="container-x flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] py-6 text-xs text-fog-500 sm:flex-row">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="font-mono">Built with React · Tailwind · Framer Motion</span>
      </div>
    </footer>
  )
}
