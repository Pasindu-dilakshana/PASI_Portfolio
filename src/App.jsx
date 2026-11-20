import { useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useContent } from './lib/useContent'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Achievements from './components/Achievements'
import Contact from './components/Contact'
import Footer from './components/Footer'

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  return <motion.div aria-hidden="true" style={{ scaleX }} className="fixed inset-x-0 top-0 z-toast h-[2px] origin-left bg-signal" />
}

export default function App() {
  const { content, preview } = useContent()
  const { profile, socials = [] } = content
  const github = socials.find((s) => s.platform === 'github')?.url

  useEffect(() => {
    if (content.meta?.siteTitle) document.title = content.meta.siteTitle
  }, [content.meta?.siteTitle])

  return (
    <div className="relative min-h-screen">
      <div className="grain" aria-hidden="true" />
      <ScrollProgress />
      {preview && (
        <div className="fixed bottom-4 left-1/2 z-toast -translate-x-1/2 rounded-full bg-warn px-4 py-2 font-mono text-[12px] font-medium text-ink-950 shadow-lg">
          Preview — showing unsaved dashboard draft
        </div>
      )}
      <Navbar profile={profile} />
      <main id="main" className="relative z-[2]">
        <Hero profile={profile} socials={socials} />
        <Marquee items={content.techStack} />
        <About profile={profile} />
        <Skills skills={content.skills || []} alsoFamiliar={content.alsoFamiliar} />
        <Projects projects={content.projects || []} githubUrl={github} />
        <Achievements content={content} />
        <Contact profile={profile} socials={socials} contact={content.contact || {}} />
      </main>
      <div className="relative z-[2]">
        <Footer profile={profile} socials={socials} />
      </div>
    </div>
  )
}
