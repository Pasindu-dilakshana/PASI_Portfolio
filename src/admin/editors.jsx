import { useMemo, useState } from 'react'
import { PiPlus, PiArrowLeft, PiMagnifyingGlass, PiEyeSlash, PiStarFill, PiX, PiArrowUp, PiArrowDown } from 'react-icons/pi'
import { Text, Area, Select, Toggle, Tags, Lines, FileField, IconPicker, AccentPicker, RowActions, IconBtn, Field, inputCls, move, useUpload } from './fields'
import { ProjectCover } from '../components/Projects'
import { ACHIEVEMENT_TYPES, ACHIEVEMENT_TYPE_ICON, getIcon } from '../lib/icons'
import { SOCIAL_PLATFORMS, SocialIcon } from '../components/ui'
import { uid } from './storage'

export const urlError = (v) => (v && !/^(https?:\/\/|\/|mailto:)/.test(v) ? 'Should start with https://, / or mailto:' : undefined)

export function Card({ title, desc, children, actions }) {
  return (
    <section className="rounded-2xl bg-ink-900 p-5 ring-1 ring-white/[0.07] sm:p-6">
      {(title || actions) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>}
            {desc && <p className="mt-0.5 text-[13px] text-fog-500">{desc}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  )
}

/* ---------- Master / detail list ---------- */
function MasterDetail({ items, onChange, newItem, addLabel, renderRow, renderEditor, flags = {}, emptyTitle, searchKeys = ['title'] }) {
  const [sel, setSel] = useState(items[0]?.id ?? null)
  const [q, setQ] = useState('')
  const [mobileEdit, setMobileEdit] = useState(false)
  const selected = items.find((x) => x.id === sel)

  const filtered = useMemo(
    () => items.map((it, i) => ({ it, i })).filter(({ it }) => !q || searchKeys.some((k) => String(it[k] || '').toLowerCase().includes(q.toLowerCase()))),
    [items, q, searchKeys]
  )

  const update = (id, patch) => onChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const add = () => {
    const n = newItem()
    onChange([n, ...items])
    setSel(n.id)
    setMobileEdit(true)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_1fr]">
      <div className={`${mobileEdit ? 'hidden lg:block' : ''}`}>
        <div className="sticky top-[84px] space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-fog-500" />
              <input className={`${inputCls} pl-9`} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <button onClick={add} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-signal px-3.5 text-[13.5px] font-semibold text-ink-950 hover:bg-signal-soft">
              <PiPlus /> {addLabel}
            </button>
          </div>
          <ul className="max-h-[calc(100vh-190px)] space-y-1.5 overflow-y-auto pr-1">
            {filtered.map(({ it, i }) => (
              <li key={it.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => { setSel(it.id); setMobileEdit(true) }}
                  onKeyDown={(e) => e.key === 'Enter' && (setSel(it.id), setMobileEdit(true))}
                  className={`group relative flex flex-wrap items-center gap-3 rounded-xl p-2.5 ring-1 ring-inset transition lg:flex-nowrap ${sel === it.id ? 'bg-ink-800 ring-signal/50' : 'bg-ink-900 ring-white/[0.06] hover:ring-white/15'} ${it.visible === false ? 'text-fog-400' : ''}`}
                >
                  {renderRow(it, i)}
                  <div className="ml-auto shrink-0 lg:pointer-events-none lg:absolute lg:right-2 lg:top-1/2 lg:-translate-y-1/2 lg:rounded-lg lg:bg-ink-700 lg:px-1 lg:py-0.5 lg:opacity-0 lg:shadow-[0_6px_20px_rgba(0,0,0,0.5)] lg:ring-1 lg:ring-white/10 lg:transition-opacity lg:group-hover:pointer-events-auto lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:opacity-100">
                    <RowActions
                      i={i}
                      len={items.length}
                      item={it}
                      onMove={(d) => onChange(move(items, i, d))}
                      onDup={() => {
                        const c = { ...structuredClone(it), id: uid(it.id.split('-')[0] || 'x', it.title || it.category), title: it.title ? `${it.title} (copy)` : it.title }
                        const out = [...items]
                        out.splice(i + 1, 0, c)
                        onChange(out)
                        setSel(c.id)
                      }}
                      onDel={() => {
                        onChange(items.filter((x) => x.id !== it.id))
                        if (sel === it.id) setSel(null)
                      }}
                      onToggleVisible={flags.visible ? () => update(it.id, { visible: it.visible === false }) : undefined}
                      onToggleFeatured={flags.featured ? () => update(it.id, { featured: !it.featured }) : undefined}
                    />
                  </div>
                </div>
              </li>
            ))}
            {!items.length && (
              <li className="rounded-xl border border-dashed border-white/10 p-8 text-center text-[13.5px] text-fog-500">
                {emptyTitle}
                <br />
                <button onClick={add} className="mt-3 font-medium text-signal">+ {addLabel}</button>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className={`${mobileEdit ? '' : 'hidden lg:block'}`}>
        <button onClick={() => setMobileEdit(false)} className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-fog-400 lg:hidden">
          <PiArrowLeft /> Back to list
        </button>
        {selected ? (
          renderEditor(selected, (patch) => update(selected.id, patch))
        ) : (
          <div className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-white/10 p-10 text-center text-fog-500">
            Select an item to edit, or add a new one.
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Projects ---------- */
const STATUSES = ['Completed', 'In progress', 'Planned', 'Live']

export function ProjectsEditor({ content, set }) {
  const { resolveSrc } = useUpload()
  const projects = content.projects || []
  const categories = [...new Set(['Networking', 'Security', 'Web', 'Software', 'Cloud', ...projects.map((p) => p.category).filter(Boolean)])]

  return (
    <MasterDetail
      items={projects}
      onChange={(v) => set('projects', v)}
      addLabel="New project"
      emptyTitle="No projects yet."
      flags={{ visible: true, featured: true }}
      searchKeys={['title', 'category', 'subtitle']}
      newItem={() => ({
        id: uid('p', 'project'), title: 'Untitled project', subtitle: '', category: 'Web', status: 'In progress', year: String(new Date().getFullYear()),
        summary: '', description: '', highlights: [], tags: [], github: '', demo: '', image: '', icon: 'code', accent: 'lime', featured: false, visible: true,
      })}
      renderRow={(p) => {
        const I = getIcon(p.icon)
        return (
          <>
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-950 text-signal ring-1 ring-white/10">
              {p.image ? <img src={resolveSrc(p.image)} alt="" className="h-full w-full object-cover" /> : <I size={18} />}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 truncate text-[14px] font-medium">
                {p.featured && <PiStarFill className="shrink-0 text-signal" size={12} />}
                {p.visible === false && <PiEyeSlash className="shrink-0 text-fog-500" size={13} />}
                <span className="truncate">{p.title || 'Untitled'}</span>
              </span>
              <span className="block truncate font-mono text-[11px] text-fog-500">{[p.category, p.status].filter(Boolean).join(' · ')}</span>
            </span>
          </>
        )
      }}
      renderEditor={(p, up) => (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/[0.07]">
            <div className="group relative h-44">
              <ProjectCover project={{ ...p, image: resolveSrc(p.image) }} index={projects.indexOf(p)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 bg-ink-900 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold">{p.title || 'Untitled'}</p>
                <p className="truncate text-[12.5px] text-fog-500">{p.subtitle}</p>
              </div>
              <span className="font-mono text-[11px] text-fog-500">{p.visible === false ? 'Hidden from site' : p.featured ? 'Featured on site' : 'Shown on site'}</span>
            </div>
          </div>

          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Title" value={p.title} onChange={(v) => up({ title: v })} error={!p.title?.trim() ? 'Title is required' : undefined} />
              <Text label="Subtitle" value={p.subtitle} onChange={(v) => up({ subtitle: v })} placeholder="e.g. Python traffic monitor" />
              <Select label="Category" value={p.category} onChange={(v) => up({ category: v })} options={categories} allowCustom />
              <Select label="Status" value={p.status} onChange={(v) => up({ status: v })} options={STATUSES} allowCustom />
              <Text label="Year" value={p.year} onChange={(v) => up({ year: v })} placeholder="2026" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Show on site" desc="Hidden projects stay here as drafts" checked={p.visible !== false} onChange={(v) => up({ visible: v })} />
              <Toggle label="Featured" desc="Shown big at the top of Projects" checked={!!p.featured} onChange={(v) => up({ featured: v })} />
            </div>
          </Card>

          <Card title="Story" desc="The summary appears on the card; the full description opens in the side panel.">
            <Area label="Card summary" hint={`${(p.summary || '').length}/160`} rows={2} value={p.summary} onChange={(v) => up({ summary: v })} placeholder="One or two sentences on what it does." />
            <Area label="Full description" rows={6} value={p.description} onChange={(v) => up({ description: v })} />
            <Lines label="Highlights" hint="Short bullet points" value={p.highlights || []} onChange={(v) => up({ highlights: v })} placeholder="e.g. Generates Cisco IOS config" />
            <Tags label="Tech / tags" value={p.tags || []} onChange={(v) => up({ tags: v })} />
          </Card>

          <Card title="Links">
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Live demo URL" value={p.demo} onChange={(v) => up({ demo: v })} placeholder="https://…" error={urlError(p.demo)} />
              <Text label="GitHub URL" value={p.github} onChange={(v) => up({ github: v })} placeholder="https://github.com/…" error={urlError(p.github)} />
            </div>
          </Card>

          <Card title="Look" desc="Upload a screenshot, or leave empty to use the generated cover.">
            <FileField label="Cover image" value={p.image} onChange={(v) => up({ image: v })} nameHint={p.title} />
            <div className="grid gap-4 sm:grid-cols-2">
              <IconPicker value={p.icon} onChange={(v) => up({ icon: v })} />
              <AccentPicker value={p.accent} onChange={(v) => up({ accent: v })} />
            </div>
          </Card>
        </div>
      )}
    />
  )
}

/* ---------- Achievements ---------- */
export function AchievementsEditor({ content, set }) {
  const { resolveSrc } = useUpload()
  const items = content.achievements || []
  return (
    <MasterDetail
      items={items}
      onChange={(v) => set('achievements', v)}
      addLabel="New achievement"
      emptyTitle="No achievements yet."
      flags={{ visible: true, featured: true }}
      searchKeys={['title', 'issuer', 'type']}
      newItem={() => ({
        id: uid('a', 'achievement'), title: 'New achievement', type: 'Certification', issuer: '', date: '', description: '', tags: [], credentialUrl: '', image: '', featured: false, visible: true,
      })}
      renderRow={(a) => {
        const I = ACHIEVEMENT_TYPE_ICON[a.type] || ACHIEVEMENT_TYPE_ICON.Other
        return (
          <>
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-950 text-signal ring-1 ring-white/10">
              {a.image ? <img src={resolveSrc(a.image)} alt="" className="h-full w-full object-cover" /> : <I size={18} />}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[14px] font-medium">
                {a.featured && <PiStarFill className="shrink-0 text-signal" size={12} />}
                {a.visible === false && <PiEyeSlash className="shrink-0 text-fog-500" size={13} />}
                <span className="truncate">{a.title || 'Untitled'}</span>
              </span>
              <span className="block truncate font-mono text-[11px] text-fog-500">{[a.type, a.issuer, a.date].filter(Boolean).join(' · ')}</span>
            </span>
          </>
        )
      }}
      renderEditor={(a, up) => (
        <div className="space-y-5">
          <Card title="Achievement">
            <Text label="Title" value={a.title} onChange={(v) => up({ title: v })} error={!a.title?.trim() ? 'Title is required' : undefined} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Type" value={a.type} onChange={(v) => up({ type: v })} options={ACHIEVEMENT_TYPES} />
              <Text label="Issued by" value={a.issuer} onChange={(v) => up({ issuer: v })} placeholder="e.g. Cisco Networking Academy" className="sm:col-span-2" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Date" value={a.date} onChange={(v) => up({ date: v })} placeholder="e.g. Mar 2026" />
              <Text label="Credential / verify URL" value={a.credentialUrl} onChange={(v) => up({ credentialUrl: v })} placeholder="https://…" error={urlError(a.credentialUrl)} />
            </div>
            <Area label="Description" rows={3} value={a.description} onChange={(v) => up({ description: v })} />
            <Tags label="Tags" value={a.tags || []} onChange={(v) => up({ tags: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Show on site" checked={a.visible !== false} onChange={(v) => up({ visible: v })} />
              <Toggle label="Featured" desc="Shown as a large badge card" checked={!!a.featured} onChange={(v) => up({ featured: v })} />
            </div>
          </Card>
          <Card title="Certificate image" desc="Optional. Visitors can click to view it full size.">
            <FileField value={a.image} onChange={(v) => up({ image: v })} nameHint={`cert-${a.title}`} />
          </Card>
        </div>
      )}
    />
  )
}

/* ---------- Skills ---------- */
const LEVEL_LABEL = { 1: 'Learning', 2: 'Working', 3: 'Strong' }

export function SkillsEditor({ content, set }) {
  const cats = content.skills || []
  return (
    <div className="space-y-5">
      <MasterDetail
        items={cats}
        onChange={(v) => set('skills', v)}
        addLabel="New group"
        emptyTitle="No skill groups yet."
        searchKeys={['category']}
        newItem={() => ({ id: uid('k', 'group'), category: 'New group', icon: 'code', items: [{ name: '', level: 2 }] })}
        renderRow={(c) => {
          const I = getIcon(c.icon)
          return (
            <>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-950 text-signal ring-1 ring-white/10"><I size={18} /></span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium">{c.category}</span>
                <span className="block font-mono text-[11px] text-fog-500">{c.items.length} skills</span>
              </span>
            </>
          )
        }}
        renderEditor={(c, up) => (
          <Card title="Skill group">
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Group name" value={c.category} onChange={(v) => up({ category: v })} />
              <IconPicker value={c.icon} onChange={(v) => up({ icon: v })} />
            </div>
            <Field label="Skills" hint="Signal bars: 1 learning · 2 working · 3 strong">
              <div className="space-y-2">
                {c.items.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className={inputCls} value={s.name} placeholder="Skill name" onChange={(e) => up({ items: c.items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                    <div className="flex shrink-0 rounded-lg bg-ink-950 p-1 ring-1 ring-inset ring-white/10" role="radiogroup" aria-label="Level">
                      {[1, 2, 3].map((l) => (
                        <button key={l} type="button" role="radio" aria-checked={s.level === l} title={LEVEL_LABEL[l]} onClick={() => up({ items: c.items.map((x, j) => (j === i ? { ...x, level: l } : x)) })} className={`flex h-7 w-8 items-end justify-center gap-[2px] rounded-md pb-1.5 ${s.level === l ? 'bg-white/10' : ''}`}>
                          {[1, 2, 3].map((n) => <span key={n} className={`w-[3px] rounded-sm ${n <= l ? (s.level === l ? 'bg-signal' : 'bg-fog-500') : 'bg-white/10'}`} style={{ height: 3 + n * 3 }} />)}
                        </button>
                      ))}
                    </div>
                    <IconBtn label="Move up" disabled={i === 0} onClick={() => up({ items: move(c.items, i, -1) })}><PiArrowUp /></IconBtn>
                    <IconBtn label="Move down" disabled={i === c.items.length - 1} onClick={() => up({ items: move(c.items, i, 1) })}><PiArrowDown /></IconBtn>
                    <IconBtn label="Remove" danger onClick={() => up({ items: c.items.filter((_, j) => j !== i) })}><PiX /></IconBtn>
                  </div>
                ))}
                <button type="button" onClick={() => up({ items: [...c.items, { name: '', level: 2 }] })} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-signal hover:bg-signal/10">
                  <PiPlus /> Add skill
                </button>
              </div>
            </Field>
          </Card>
        )}
      />
      <Card title="Also familiar with" desc="Small chips under the skill groups.">
        <Tags value={content.alsoFamiliar || []} onChange={(v) => set('alsoFamiliar', v)} />
      </Card>
      <Card title="Tools marquee" desc="The scrolling strip under the hero. Brand logos start with “Si”.">
        <div className="space-y-2">
          {(content.techStack || []).map((t, i, arr) => (
            <div key={i} className="grid grid-cols-[1fr_180px_auto] items-end gap-2">
              <Text value={t.name} onChange={(v) => set('techStack', arr.map((x, j) => (j === i ? { ...x, name: v } : x)))} placeholder="Tool name" />
              <IconPicker label="" brands value={t.icon} onChange={(v) => set('techStack', arr.map((x, j) => (j === i ? { ...x, icon: v } : x)))} />
              <div className="flex pb-1.5">
                <IconBtn label="Move up" disabled={i === 0} onClick={() => set('techStack', move(arr, i, -1))}><PiArrowUp /></IconBtn>
                <IconBtn label="Remove" danger onClick={() => set('techStack', arr.filter((_, j) => j !== i))}><PiX /></IconBtn>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => set('techStack', [...(content.techStack || []), { name: '', icon: 'code' }])} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-signal hover:bg-signal/10">
            <PiPlus /> Add tool
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ---------- Profile ---------- */
export function ProfileEditor({ content, set }) {
  const p = content.profile
  const up = (patch) => set('profile', { ...p, ...patch })
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="space-y-5">
        <Card title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Full name" value={p.name} onChange={(v) => up({ name: v })} />
            <Text label="Short name" hint="Logo & nav" value={p.shortName} onChange={(v) => up({ shortName: v })} />
          </div>
          <Area label="Headline" hint="Big line in the hero" rows={2} value={p.headline} onChange={(v) => up({ headline: v })} />
          <Text label="Tagline" value={p.tagline} onChange={(v) => up({ tagline: v })} />
          <Lines label="Terminal interests" hint="Typed out one by one in the hero" value={p.roles || []} onChange={(v) => up({ roles: v })} />
        </Card>
        <Card title="Availability & contact">
          <Toggle label="Open to opportunities" desc="Shows the green status badge" checked={!!p.available} onChange={(v) => up({ available: v })} />
          <Text label="Status text" value={p.availabilityText} onChange={(v) => up({ availabilityText: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Email" type="email" value={p.email} onChange={(v) => up({ email: v })} />
            <Text label="Location" value={p.location} onChange={(v) => up({ location: v })} />
          </div>
        </Card>
        <Card title="Files">
          <FileField label="Profile photo" value={p.photo} onChange={(v) => up({ photo: v })} nameHint="profile" />
          <FileField label="CV (PDF)" kind="pdf" accept="application/pdf" folder="" value={p.cv} onChange={(v) => up({ cv: v })} nameHint={`${p.name || 'cv'}-CV`} />
        </Card>
      </div>
      <div className="space-y-5">
        <Card title="About section">
          <Lines label="Paragraphs" hint="First one is shown larger" multiline value={p.about || []} onChange={(v) => up({ about: v })} />
          <Area label="“Currently” card" rows={2} value={p.currently} onChange={(v) => up({ currently: v })} />
        </Card>
        <Card title="Quick facts" desc="The label / value table beside your bio.">
          {(p.facts || []).map((f, i, arr) => (
            <div key={i} className="grid grid-cols-[140px_1fr_auto] items-center gap-2">
              <input className={inputCls} value={f.label} placeholder="Label" onChange={(e) => up({ facts: arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
              <input className={inputCls} value={f.value} placeholder="Value" onChange={(e) => up({ facts: arr.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
              <div className="flex">
                <IconBtn label="Move up" disabled={i === 0} onClick={() => up({ facts: move(arr, i, -1) })}><PiArrowUp /></IconBtn>
                <IconBtn label="Remove" danger onClick={() => up({ facts: arr.filter((_, j) => j !== i) })}><PiX /></IconBtn>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => up({ facts: [...(p.facts || []), { label: '', value: '' }] })} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-signal hover:bg-signal/10">
            <PiPlus /> Add fact
          </button>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Links, stats, contact, SEO ---------- */
const STAT_SOURCES = [
  { value: 'manual', label: 'Manual number' },
  { value: 'projects', label: 'Auto: visible projects' },
  { value: 'certifications', label: 'Auto: certifications' },
  { value: 'achievements', label: 'Auto: all achievements' },
]

export function MoreEditor({ content, set }) {
  const socials = content.socials || []
  const stats = content.stats || []
  const contact = content.contact || {}
  const meta = content.meta || {}
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="space-y-5">
        <Card title="Social links">
          {socials.map((s, i) => (
            <div key={i} className="grid grid-cols-[44px_130px_1fr_auto] items-center gap-2">
              <span className="grid h-10 place-items-center rounded-lg bg-ink-950 text-fog-200 ring-1 ring-inset ring-white/10"><SocialIcon platform={s.platform} size={18} /></span>
              <select className={inputCls} value={s.platform} onChange={(e) => set('socials', socials.map((x, j) => (j === i ? { ...x, platform: e.target.value } : x)))}>
                {SOCIAL_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} value={s.label} placeholder="Label" onChange={(e) => set('socials', socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input className={`${inputCls} ${urlError(s.url) ? 'ring-[#ff8f7a]/60' : ''}`} value={s.url} placeholder="https://…" onChange={(e) => set('socials', socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
              </div>
              <div className="flex">
                <IconBtn label="Move up" disabled={i === 0} onClick={() => set('socials', move(socials, i, -1))}><PiArrowUp /></IconBtn>
                <IconBtn label="Remove" danger onClick={() => set('socials', socials.filter((_, j) => j !== i))}><PiX /></IconBtn>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => set('socials', [...socials, { platform: 'website', label: 'Website', url: '' }])} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-signal hover:bg-signal/10">
            <PiPlus /> Add link
          </button>
        </Card>
        <Card title="Numbers" desc="The counter row in Achievements. Auto values update themselves.">
          {stats.map((s, i) => (
            <div key={s.id || i} className="grid grid-cols-1 gap-2 rounded-xl bg-ink-950/60 p-3 ring-1 ring-inset ring-white/[0.06] sm:grid-cols-[1fr_190px_80px_60px_auto] sm:items-end">
              <Text label="Label" value={s.label} onChange={(v) => set('stats', stats.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
              <Select label="Value from" value={s.source} onChange={(v) => set('stats', stats.map((x, j) => (j === i ? { ...x, source: v } : x)))} options={STAT_SOURCES} />
              <Text label="Number" type="number" disabled={s.source !== 'manual'} value={s.source === 'manual' ? s.value : ''} placeholder="auto" onChange={(v) => set('stats', stats.map((x, j) => (j === i ? { ...x, value: v } : x)))} />
              <Text label="Suffix" value={s.suffix} placeholder="+" onChange={(v) => set('stats', stats.map((x, j) => (j === i ? { ...x, suffix: v } : x)))} />
              <div className="flex pb-1.5">
                <IconBtn label="Move up" disabled={i === 0} onClick={() => set('stats', move(stats, i, -1))}><PiArrowUp /></IconBtn>
                <IconBtn label="Remove" danger onClick={() => set('stats', stats.filter((_, j) => j !== i))}><PiX /></IconBtn>
              </div>
            </div>
          ))}
          {stats.length < 4 && (
            <button type="button" onClick={() => set('stats', [...stats, { id: uid('s', 'stat'), label: '', source: 'manual', value: 0, suffix: '' }])} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-signal hover:bg-signal/10">
              <PiPlus /> Add number
            </button>
          )}
        </Card>
      </div>
      <div className="space-y-5">
        <Card title="Contact section">
          <Area label="Heading" rows={2} value={contact.heading} onChange={(v) => set('contact', { ...contact, heading: v })} />
          <Area label="Intro text" rows={2} value={contact.text} onChange={(v) => set('contact', { ...contact, text: v })} />
          <Text label="Form endpoint" hint="FormSubmit, Formspree…" value={contact.formEndpoint} onChange={(v) => set('contact', { ...contact, formEndpoint: v })} error={urlError(contact.formEndpoint)} />
        </Card>
        <Card title="Search & sharing" desc="Browser tab title and Google description.">
          <Text label="Page title" value={meta.siteTitle} onChange={(v) => set('meta', { ...meta, siteTitle: v })} />
          <Area label="Description" hint={`${(meta.description || '').length}/160`} rows={3} value={meta.description} onChange={(v) => set('meta', { ...meta, description: v })} />
        </Card>
      </div>
    </div>
  )
}
