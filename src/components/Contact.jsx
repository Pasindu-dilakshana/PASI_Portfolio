import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PiArrowUpRight, PiCopy, PiCheck, PiPaperPlaneTilt, PiWarningCircle } from 'react-icons/pi'
import { Reveal, SocialIcon, isExternal } from './ui'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.15em] text-fog-400">{label}</span>
      {children}
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#ff8f7a]">
          <PiWarningCircle size={14} /> {error}
        </span>
      )}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl bg-ink-950/60 px-4 py-3.5 text-[15px] text-fog-50 placeholder:text-fog-600 ring-1 ring-inset ring-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-signal/70'

export default function Contact({ profile, socials, contact }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [copied, setCopied] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const er = {}
    if (!form.name.trim()) er.name = 'Please add your name.'
    if (!EMAIL_RE.test(form.email)) er.email = 'That email doesn’t look right.'
    if (form.message.trim().length < 10) er.message = 'A little more detail, please (10+ characters).'
    setErrors(er)
    return !Object.keys(er).length
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setState('sending')
    try {
      const res = await fetch(contact.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, _subject: `Portfolio: ${form.subject || 'New message'}`, _captcha: 'false' }),
      })
      if (!res.ok) throw new Error()
      setState('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setState('error')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-signal/[0.06] blur-[140px]" />
      <div className="container-x relative">
        <Reveal>
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-xs text-signal">05</span>
            <span className="h-px w-10 bg-white/15" />
            <span className="eyebrow">Contact</span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id="contact-title" className="max-w-4xl font-display text-[2.4rem] font-bold leading-[1] tracking-tightest sm:text-6xl lg:text-7xl">
            {contact.heading}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-lg text-fog-400">{contact.text}</p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-5" delay={0.12}>
            <div className="flex h-full flex-col gap-5">
              <div className="panel p-7">
                <span className="eyebrow">Email</span>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <a href={`mailto:${profile.email}`} className="min-w-0 break-all font-display text-xl font-semibold tracking-tight transition-colors hover:text-signal sm:text-2xl">
                    {profile.email}
                  </a>
                  <button onClick={copy} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-fog-400 transition-colors hover:border-signal hover:text-signal" aria-label="Copy email address">
                    {copied ? <PiCheck size={17} className="text-signal" /> : <PiCopy size={17} />}
                  </button>
                </div>
                <p className="mt-1 h-5 text-[13px] text-signal" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</p>
              </div>
              <ul className="panel divide-y divide-white/[0.06] overflow-hidden">
                {socials.filter((s) => s.platform !== 'email').map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target={isExternal(s.url) ? '_blank' : undefined} rel="noopener noreferrer" className="group flex items-center justify-between px-7 py-5 transition-colors hover:bg-white/[0.02]">
                      <span className="flex items-center gap-4">
                        <SocialIcon platform={s.platform} size={22} className="text-fog-400 transition-colors group-hover:text-signal" />
                        <span className="font-medium">{s.label}</span>
                      </span>
                      <PiArrowUpRight size={18} className="text-fog-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal" />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="panel flex items-center gap-3 p-6 text-sm text-fog-400">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${profile.available ? 'bg-signal shadow-[0_0_12px_#c6f24e]' : 'bg-fog-500'}`} />
                {profile.available ? profile.availabilityText : 'Not taking new work right now'} · {profile.location}
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={0.18}>
            <form onSubmit={submit} noValidate className="panel space-y-5 p-7 sm:p-9">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" error={errors.name}>
                  <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Your name" autoComplete="name" aria-invalid={!!errors.name} />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input className={inputCls} type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" autoComplete="email" aria-invalid={!!errors.email} />
                </Field>
              </div>
              <Field label="Subject">
                <input className={inputCls} value={form.subject} onChange={set('subject')} placeholder="Internship, project, question…" />
              </Field>
              <Field label="Message" error={errors.message}>
                <textarea className={`${inputCls} min-h-[160px] resize-y`} value={form.message} onChange={set('message')} placeholder="What are you working on?" aria-invalid={!!errors.message} />
              </Field>
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={state}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm ${state === 'error' ? 'text-[#ff8f7a]' : 'text-signal'}`}
                    aria-live="polite"
                  >
                    {state === 'sent' && 'Message sent. I’ll get back to you soon.'}
                    {state === 'error' && 'Couldn’t send that. Try again, or email me directly.'}
                  </motion.p>
                </AnimatePresence>
                <button type="submit" disabled={state === 'sending'} className="btn-signal disabled:opacity-60">
                  {state === 'sending' ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" /> Sending
                    </>
                  ) : (
                    <>
                      Send message <PiPaperPlaneTilt size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
