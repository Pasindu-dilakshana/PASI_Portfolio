import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  PiHouse, PiFolders, PiCertificate, PiChartBar, PiUser, PiLinkSimple, PiGear, PiEye, PiFloppyDisk,
  PiCloudArrowUp, PiDownloadSimple, PiCheckCircle, PiWarningCircle, PiArrowCounterClockwise, PiGithubLogo,
  PiPlus, PiArrowSquareOut, PiUploadSimple, PiEyeSlash, PiSpinnerGap, PiX, PiLaptop, PiInfo,
} from 'react-icons/pi'
import baseContent from '../content/content.json'
import {
  detectLocal, localLoad, localSave, localUpload, getGithubConfig, setGithubConfig, githubVerify, githubLoad,
  githubCurrentSha, githubPublish, saveDraft, readDraft, clearDraft, compressImage, blobToBase64, slugify,
  downloadJson, uid,
} from './storage'
import { UploadCtx, Text, inputCls } from './fields'
import { ProjectsEditor, AchievementsEditor, SkillsEditor, ProfileEditor, MoreEditor, Card } from './editors'

const TABS = [
  { id: 'overview', label: 'Overview', icon: PiHouse },
  { id: 'projects', label: 'Projects', icon: PiFolders },
  { id: 'achievements', label: 'Achievements', icon: PiCertificate },
  { id: 'skills', label: 'Skills & tools', icon: PiChartBar },
  { id: 'profile', label: 'Profile & about', icon: PiUser },
  { id: 'more', label: 'Links, numbers, SEO', icon: PiLinkSimple },
  { id: 'settings', label: 'Settings', icon: PiGear },
]

const TAB_INFO = {
  overview: ['Overview', 'Everything on your portfolio, in one place.'],
  projects: ['Projects', 'Add, reorder, feature or hide projects. Hidden ones stay here as drafts.'],
  achievements: ['Achievements', 'Certifications, awards, competitions and academic results.'],
  skills: ['Skills & tools', 'Skill groups with signal-bar levels, plus the scrolling tools strip.'],
  profile: ['Profile & about', 'Hero text, photo, CV, bio and quick facts.'],
  more: ['Links, numbers & SEO', 'Social links, counters, contact section and page title.'],
  settings: ['Settings', 'Where your changes are saved, backups and the GitHub connection.'],
}

const SECTION_NAMES = { projects: 'projects', achievements: 'achievements', skills: 'skills', profile: 'profile', socials: 'links', stats: 'stats', techStack: 'tools', alsoFamiliar: 'skills', contact: 'contact', meta: 'SEO' }

function commitMessage(prev, next) {
  const changed = new Set()
  for (const k of Object.keys(next)) if (JSON.stringify(prev?.[k]) !== JSON.stringify(next[k])) changed.add(SECTION_NAMES[k] || k)
  return changed.size ? `Portfolio: update ${[...changed].join(', ')}` : 'Portfolio: update content'
}

/* -------------------- GitHub connect form -------------------- */
function GithubForm({ initial, onConnected, compact }) {
  const [cfg, setCfg] = useState(initial || { owner: 'Pasindu-dilakshana', repo: '', branch: 'main', token: '' })
  const [state, setState] = useState({ busy: false, error: '' })
  const set = (k) => (v) => setCfg((c) => ({ ...c, [k]: v.trim?.() ?? v }))
  const submit = async (e) => {
    e.preventDefault()
    setState({ busy: true, error: '' })
    try {
      await githubVerify(cfg)
      setGithubConfig(cfg)
      onConnected(cfg)
    } catch (err) {
      setState({ busy: false, error: err.message })
      return
    }
    setState({ busy: false, error: '' })
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Text label="GitHub username" value={cfg.owner} onChange={set('owner')} placeholder="Pasindu-dilakshana" required />
        <Text label="Repository" value={cfg.repo} onChange={set('repo')} placeholder="portfolio" required />
        <Text label="Branch" value={cfg.branch} onChange={set('branch')} placeholder="main" required />
      </div>
      <Text label="Access token" hint="Fine-grained token · Contents: Read and write" type="password" value={cfg.token} onChange={set('token')} placeholder="github_pat_…" required autoComplete="off" />
      {!compact && (
        <details className="rounded-lg bg-ink-950 p-4 text-[13px] text-fog-400 ring-1 ring-inset ring-white/[0.07]">
          <summary className="cursor-pointer font-medium text-fog-200">How do I get a token?</summary>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>GitHub → Settings → Developer settings → Personal access tokens → <b>Fine-grained tokens</b> → Generate new token.</li>
            <li>Repository access: <b>Only select repositories</b> → pick your portfolio repo.</li>
            <li>Permissions → Repository → <b>Contents: Read and write</b>. Nothing else is needed.</li>
            <li>Set an expiry (e.g. 90 days), generate, and paste it here.</li>
          </ol>
          <p className="mt-3">The token is stored only in this browser. Publishing makes a commit; Vercel / Netlify then rebuilds your site automatically.</p>
        </details>
      )}
      {state.error && <p className="flex items-center gap-2 rounded-lg bg-[#ff8f7a]/10 px-3 py-2.5 text-[13px] text-[#ff8f7a]"><PiWarningCircle size={16} /> {state.error}</p>}
      <button type="submit" disabled={state.busy} className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-[14px] font-semibold text-ink-950 hover:bg-signal-soft disabled:opacity-60">
        {state.busy ? <PiSpinnerGap className="animate-spin" /> : <PiGithubLogo />} {state.busy ? 'Checking…' : 'Connect & load'}
      </button>
    </form>
  )
}

function ConnectScreen({ onConnected, onOffline, error }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <img src="/pasindu-logo-signal.svg" alt="" className="h-10 w-10" />
          <div>
            <p className="font-display text-2xl font-bold tracking-tight">Portfolio dashboard</p>
            <p className="text-[13.5px] text-fog-500">Edit your site without touching the code.</p>
          </div>
        </div>
        {error && <p className="mb-5 flex items-center gap-2 rounded-xl bg-[#ff8f7a]/10 px-4 py-3 text-[13.5px] text-[#ff8f7a]"><PiWarningCircle size={18} /> {error}</p>}
        <Card title="Connect your GitHub repo" desc="Publish changes from anywhere. Each publish is one commit, and your host redeploys the site.">
          <GithubForm onConnected={onConnected} />
        </Card>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-ink-900 p-5 text-[13.5px] text-fog-400 ring-1 ring-white/[0.07]">
            <p className="mb-1.5 flex items-center gap-2 font-medium text-fog-50"><PiLaptop /> Working on your laptop?</p>
            Run <code className="rounded bg-ink-950 px-1.5 py-0.5 font-mono text-[12px] text-signal">npm run dev</code> and open <code className="font-mono text-[12px] text-signal">localhost:5173/admin/</code>. Saves go straight into your project files.
          </div>
          <button onClick={onOffline} className="rounded-2xl bg-ink-900 p-5 text-left text-[13.5px] text-fog-400 ring-1 ring-white/[0.07] transition hover:ring-white/20">
            <p className="mb-1.5 flex items-center gap-2 font-medium text-fog-50"><PiDownloadSimple /> Continue without connecting</p>
            Edit and preview here, then export <span className="font-mono text-[12px]">content.json</span> and replace the file yourself.
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------- Overview -------------------- */
function Overview({ content, setContent, go, mode }) {
  const projects = content.projects || []
  const ach = content.achievements || []
  const hiddenP = projects.filter((p) => p.visible === false)
  const hiddenA = ach.filter((a) => a.visible === false)
  const tiles = [
    { label: 'Projects on site', n: projects.length - hiddenP.length, sub: `${hiddenP.length} hidden`, tab: 'projects' },
    { label: 'Achievements on site', n: ach.length - hiddenA.length, sub: `${hiddenA.length} hidden`, tab: 'achievements' },
    { label: 'Featured', n: projects.filter((p) => p.featured && p.visible !== false).length + ach.filter((a) => a.featured && a.visible !== false).length, sub: 'projects + achievements', tab: 'projects' },
    { label: 'Skills listed', n: (content.skills || []).reduce((s, c) => s + c.items.length, 0), sub: `${(content.skills || []).length} groups`, tab: 'skills' },
  ]
  const quickAdd = (key, item, tab) => {
    setContent((c) => ({ ...c, [key]: [item, ...(c[key] || [])] }))
    go(tab)
  }
  const showItem = (key, id) => setContent((c) => ({ ...c, [key]: c[key].map((x) => (x.id === id ? { ...x, visible: true } : x)) }))

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-signal p-6 text-ink-950 sm:p-8">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(7,9,12,0.16)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em]">Welcome back</p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Hi, {content.profile?.shortName || 'there'}.</p>
            <p className="mt-2 max-w-md text-[14.5px] text-ink-950/75">What did you build or earn this week? Add it here and it shows up on your portfolio.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => quickAdd('projects', { id: uid('p', 'project'), title: 'Untitled project', subtitle: '', category: 'Web', status: 'In progress', year: String(new Date().getFullYear()), summary: '', description: '', highlights: [], tags: [], github: '', demo: '', image: '', icon: 'code', accent: 'lime', featured: false, visible: true }, 'projects')} className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-4 py-2.5 text-[13.5px] font-semibold text-fog-50 hover:bg-ink-800">
              <PiPlus /> Add project
            </button>
            <button onClick={() => quickAdd('achievements', { id: uid('a', 'achievement'), title: 'New achievement', type: 'Certification', issuer: '', date: '', description: '', tags: [], credentialUrl: '', image: '', featured: false, visible: true }, 'achievements')} className="inline-flex items-center gap-2 rounded-full border border-ink-950/30 px-4 py-2.5 text-[13.5px] font-semibold hover:bg-ink-950/10">
              <PiPlus /> Add achievement
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <button key={t.label} onClick={() => go(t.tab)} className="rounded-2xl bg-ink-900 p-5 text-left ring-1 ring-white/[0.07] transition hover:ring-white/20">
            <p className="font-display text-4xl font-extrabold tracking-tight tabular">{t.n}</p>
            <p className="mt-1 text-[13.5px] font-medium">{t.label}</p>
            <p className="font-mono text-[11px] text-fog-500">{t.sub}</p>
          </button>
        ))}
      </div>

      {(hiddenP.length > 0 || hiddenA.length > 0) && (
        <Card title="Hidden drafts" desc="These are saved but not shown on the site. Check the details, then switch them on.">
          <ul className="divide-y divide-white/[0.06]">
            {[...hiddenP.map((x) => ['projects', x]), ...hiddenA.map((x) => ['achievements', x])].map(([key, x]) => (
              <li key={x.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <PiEyeSlash className="shrink-0 text-fog-500" />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">{x.title}</p>
                    <p className="font-mono text-[11px] text-fog-500">{key === 'projects' ? 'Project' : 'Achievement'}{x.subtitle ? ` · ${x.subtitle}` : ''}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => go(key)} className="rounded-lg px-3 py-1.5 text-[12.5px] text-fog-400 hover:bg-white/[0.06] hover:text-fog-50">Edit</button>
                  <button onClick={() => showItem(key, x.id)} className="rounded-lg bg-white/[0.07] px-3 py-1.5 text-[12.5px] font-medium hover:bg-white/[0.12]">Show on site</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="How saving works here">
        <ModeExplainer mode={mode} />
      </Card>
    </div>
  )
}

function ModeExplainer({ mode }) {
  const steps = {
    local: [
      'You are running the site locally (npm run dev).',
      'Save writes straight into src/content/content.json and uploads go to /public/uploads.',
      'The site tab refreshes instantly. Commit and push with git when you are happy.',
    ],
    github: [
      'Connected to your GitHub repo.',
      'Publish makes one commit with content.json and any images you uploaded.',
      'Vercel / Netlify sees the commit and redeploys. Your live site updates in about a minute.',
    ],
    offline: [
      'Not connected, so changes live only in this browser.',
      'Use Export to download content.json and replace src/content/content.json in your project.',
      'Connect GitHub in Settings to publish directly instead.',
    ],
  }[mode] || []
  return (
    <ol className="space-y-2.5">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 text-[14px] text-fog-400">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[0.06] font-mono text-[11px] text-signal">{i + 1}</span>
          {s}
        </li>
      ))}
      <li className="flex gap-3 text-[14px] text-fog-400">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[0.06] text-signal"><PiEye size={13} /></span>
        Preview opens your site with unsaved edits and updates live as you type.
      </li>
    </ol>
  )
}

/* -------------------- Settings -------------------- */
function Settings({ mode, ghCfg, onConnected, onDisconnect, content, setContent, revert, dirty, toast }) {
  const fileRef = useRef(null)
  const importJson = async (file) => {
    try {
      const data = JSON.parse(await file.text())
      if (!data.profile || !Array.isArray(data.projects)) throw new Error('This file doesn’t look like a portfolio content.json')
      setContent(data)
      toast('Imported. Review it, then save or publish.', 'ok')
    } catch (e) {
      toast(e.message, 'error')
    }
  }
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="space-y-5">
        <Card title="Where changes go" desc={mode === 'local' ? 'Local dev mode' : mode === 'github' ? 'GitHub publish mode' : 'Offline mode'}>
          <ModeExplainer mode={mode} />
        </Card>
        <Card title="Backup">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => downloadJson(content)} className="inline-flex items-center gap-2 rounded-lg bg-white/[0.07] px-3.5 py-2 text-[13.5px] font-medium hover:bg-white/[0.12]"><PiDownloadSimple /> Export content.json</button>
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-white/[0.07] px-3.5 py-2 text-[13.5px] font-medium hover:bg-white/[0.12]"><PiUploadSimple /> Import JSON</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          </div>
        </Card>
        <Card title="Undo">
          <div className="flex flex-wrap gap-2">
            <button disabled={!dirty} onClick={revert} className="inline-flex items-center gap-2 rounded-lg bg-white/[0.07] px-3.5 py-2 text-[13.5px] font-medium hover:bg-white/[0.12] disabled:opacity-40"><PiArrowCounterClockwise /> Discard unsaved changes</button>
          </div>
        </Card>
      </div>
      <Card
        title="GitHub publishing"
        desc={ghCfg ? `Connected to ${ghCfg.owner}/${ghCfg.repo} (${ghCfg.branch})` : 'Not connected'}
        actions={ghCfg && <button onClick={onDisconnect} className="rounded-lg px-3 py-1.5 text-[12.5px] text-fog-400 hover:bg-[#ff8f7a]/10 hover:text-[#ff8f7a]">Disconnect</button>}
      >
        {mode === 'local' && (
          <p className="flex gap-2 rounded-lg bg-ink-950 p-3 text-[13px] text-fog-400 ring-1 ring-inset ring-white/[0.07]"><PiInfo className="mt-0.5 shrink-0 text-signal" /> In local mode, saves go to your files; push with git as usual. GitHub publishing is used on your deployed site at /admin/.</p>
        )}
        <GithubForm initial={ghCfg} onConnected={onConnected} />
      </Card>
    </div>
  )
}

/* -------------------- App -------------------- */
export default function AdminApp() {
  const [mode, setMode] = useState('loading')
  const [bootError, setBootError] = useState('')
  const [content, setContent] = useState(null)
  const [saved, setSaved] = useState('')
  const [savedObj, setSavedObj] = useState(null)
  const [ghCfg, setGhCfg] = useState(getGithubConfig())
  const [ghSha, setGhSha] = useState(null)
  const [pending, setPending] = useState({})
  const [tab, setTab] = useState('overview')
  const [busy, setBusy] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)
  const [restore, setRestore] = useState(null)
  const [conflict, setConflict] = useState(false)

  const toast = useCallback((text, kind = 'ok', link) => {
    setToastMsg({ text, kind, link, id: Date.now() })
  }, [])
  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), toastMsg.link ? 9000 : 4500)
    return () => clearTimeout(t)
  }, [toastMsg])

  const loaded = useCallback((c) => {
    setContent(c)
    const s = JSON.stringify(c)
    setSaved(s)
    setSavedObj(c)
    const d = readDraft()
    if (d?.content && JSON.stringify(d.content) !== s) setRestore(d)
  }, [])

  const loadGithub = useCallback(async (cfg) => {
    const { content: c, sha } = await githubLoad(cfg)
    setGhSha(sha)
    setMode('github')
    loaded(c)
  }, [loaded])

  // boot
  useEffect(() => {
    ;(async () => {
      if (await detectLocal()) {
        try {
          const c = await localLoad()
          setMode('local')
          loaded(c)
          return
        } catch (e) {
          setBootError(e.message)
        }
      }
      const cfg = getGithubConfig()
      if (cfg) {
        try {
          await loadGithub(cfg)
          return
        } catch (e) {
          setBootError(`Couldn’t load from GitHub: ${e.message}`)
        }
      }
      setMode('connect')
    })()
  }, [loaded, loadGithub])

  // autosave draft (also feeds the live preview tab)
  useEffect(() => {
    if (!content || restore) return
    const t = setTimeout(() => saveDraft(content), 250)
    return () => clearTimeout(t)
  }, [content, restore])

  const pendingCount = Object.keys(pending).length
  const dirty = !!content && (JSON.stringify(content) !== saved || pendingCount > 0)

  useEffect(() => {
    const h = (e) => {
      if (dirty && mode !== 'local') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty, mode])

  const set = useCallback((key, value) => setContent((c) => ({ ...c, [key]: value })), [])

  /* uploads */
  const upload = useMemo(() => {
    if (mode === 'local') {
      return async (file, { nameHint, folder, kind }) => {
        const { blob, ext } = kind === 'pdf' ? { blob: file, ext: 'pdf' } : await compressImage(file)
        const name = kind === 'pdf' ? `${slugify(nameHint)}.${ext}` : `${slugify(nameHint)}-${Math.random().toString(36).slice(2, 6)}.${ext}`
        const url = await localUpload(blob, folder ? `${folder}/${name}` : name)
        toast(`Uploaded ${name}`, 'ok')
        return url
      }
    }
    if (mode === 'github') {
      return async (file, { nameHint, folder, kind }) => {
        const { blob, ext } = kind === 'pdf' ? { blob: file, ext: 'pdf' } : await compressImage(file)
        if (blob.size > 8 * 1024 * 1024) throw new Error('File is over 8 MB. Please use a smaller one.')
        const name = kind === 'pdf' ? `${slugify(nameHint)}.${ext}` : `${slugify(nameHint)}-${Math.random().toString(36).slice(2, 6)}.${ext}`
        const rel = folder ? `${folder}/${name}` : name
        const url = `/${rel}`
        const base64 = await blobToBase64(blob)
        setPending((p) => ({ ...p, [url]: { path: `public/${rel}`, base64, objectUrl: URL.createObjectURL(blob) } }))
        toast('Image ready. It goes live with your next publish.', 'ok')
        return url
      }
    }
    return null
  }, [mode, toast])
  const resolveSrc = useCallback((u) => pending[u]?.objectUrl || u, [pending])

  /* save / publish */
  const doPublish = async (force = false) => {
    setBusy(true)
    try {
      if (!force) {
        const current = await githubCurrentSha(ghCfg)
        if (ghSha && current !== ghSha) {
          setConflict(true)
          setBusy(false)
          return
        }
      }
      const used = Object.entries(pending).filter(([u]) => JSON.stringify(content).includes(u)).map(([, f]) => f)
      const res = await githubPublish(ghCfg, content, used, commitMessage(savedObj, content))
      setGhSha(res.sha)
      setSaved(JSON.stringify(content))
      setSavedObj(content)
      Object.values(pending).forEach((f) => URL.revokeObjectURL(f.objectUrl))
      setPending({})
      toast('Published. Your site will redeploy in about a minute.', 'ok', res.url)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    if (!content || busy) return
    const missing = [...(content.projects || []), ...(content.achievements || [])].find((x) => !x.title?.trim())
    if (missing) return toast('Every project and achievement needs a title before saving.', 'error')
    if (mode === 'local') {
      setBusy(true)
      try {
        await localSave(content)
        setSaved(JSON.stringify(content))
        setSavedObj(content)
        toast('Saved to src/content/content.json', 'ok')
      } catch (e) {
        toast(e.message, 'error')
      } finally {
        setBusy(false)
      }
    } else if (mode === 'github') {
      await doPublish()
    } else {
      downloadJson(content)
      toast('Downloaded content.json. Replace src/content/content.json with it.', 'ok')
    }
  }

  useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  const revert = () => {
    setContent(JSON.parse(saved))
    setPending({})
    toast('Changes discarded.', 'ok')
  }

  /* ------------ render states ------------ */
  if (mode === 'loading')
    return (
      <div className="grid min-h-screen place-items-center text-fog-500">
        <PiSpinnerGap className="animate-spin" size={28} />
      </div>
    )

  if (mode === 'connect')
    return (
      <ConnectScreen
        error={bootError}
        onConnected={async (cfg) => {
          setGhCfg(cfg)
          try {
            await loadGithub(cfg)
            setBootError('')
          } catch (e) {
            setBootError(e.message)
          }
        }}
        onOffline={() => {
          setMode('offline')
          loaded(baseContent)
        }}
      />
    )

  const saveLabel = mode === 'local' ? 'Save' : mode === 'github' ? 'Publish' : 'Export'
  const SaveIcon = mode === 'local' ? PiFloppyDisk : mode === 'github' ? PiCloudArrowUp : PiDownloadSimple
  const [title, desc] = TAB_INFO[tab]
  const counts = { projects: content.projects?.length, achievements: content.achievements?.length }

  return (
    <UploadCtx.Provider value={{ upload, resolveSrc }}>
      <div className="min-h-screen">
        {/* top bar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <a href="/" className="flex items-center gap-2.5" title="Open site">
              <img src="/pasindu-logo-signal.svg" alt="" className="h-8 w-8" />
              <span className="hidden font-display text-[17px] font-bold tracking-tight sm:inline">Dashboard</span>
            </a>
            <span className={`ml-1 hidden items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] sm:inline-flex ${mode === 'local' ? 'bg-sky/10 text-sky' : mode === 'github' ? 'bg-signal/10 text-signal' : 'bg-warn/10 text-warn'}`}>
              {mode === 'local' ? <PiLaptop /> : mode === 'github' ? <PiGithubLogo /> : <PiDownloadSimple />}
              {mode === 'local' ? 'Local files' : mode === 'github' ? `${ghCfg?.repo}@${ghCfg?.branch}` : 'Offline'}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className={`hidden items-center gap-1.5 text-[12.5px] md:inline-flex ${dirty ? 'text-warn' : 'text-fog-500'}`}>
                <span className={`h-2 w-2 rounded-full ${dirty ? 'bg-warn' : 'bg-fog-600'}`} />
                {dirty ? `Unsaved changes${pendingCount ? ` · ${pendingCount} file${pendingCount > 1 ? 's' : ''}` : ''}` : 'All changes saved'}
              </span>
              {dirty && (
                <button onClick={revert} title="Discard unsaved changes" className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] text-fog-400 hover:bg-white/[0.06] hover:text-fog-50 sm:inline-flex">
                  <PiArrowCounterClockwise /> Discard
                </button>
              )}
              <button onClick={() => { saveDraft(content); window.open('/?preview=1', 'portfolio-preview') }} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium ring-1 ring-inset ring-white/15 hover:bg-white/[0.06]">
                <PiEye /> <span className="hidden sm:inline">Preview</span>
              </button>
              <button onClick={save} disabled={busy || (!dirty && mode !== 'offline')} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-signal px-4 text-[13.5px] font-semibold text-ink-950 transition hover:bg-signal-soft disabled:opacity-40" title={`${saveLabel} (Ctrl+S)`}>
                {busy ? <PiSpinnerGap className="animate-spin" /> : <SaveIcon />} {busy ? 'Working…' : saveLabel}
              </button>
            </div>
          </div>
          {/* mobile tabs */}
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden" aria-label="Sections">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-[12.5px] font-medium ${tab === t.id ? 'bg-signal text-ink-950' : 'text-fog-400 hover:bg-white/[0.06]'}`}>
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex">
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-white/[0.06] p-3 lg:flex">
            <nav className="space-y-0.5" aria-label="Sections">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition ${tab === t.id ? 'bg-white/[0.07] text-fog-50' : 'text-fog-400 hover:bg-white/[0.04] hover:text-fog-50'}`}
                >
                  <t.icon size={17} className={tab === t.id ? 'text-signal' : ''} />
                  {t.label}
                  {counts[t.id] != null && <span className="ml-auto font-mono text-[11px] text-fog-500">{counts[t.id]}</span>}
                </button>
              ))}
            </nav>
            <a href="/" target="_blank" rel="noopener" className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] text-fog-500 hover:text-fog-50">
              <PiArrowSquareOut /> Open live site
            </a>
          </aside>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-[1180px]">
              {restore && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-warn/10 px-4 py-3 text-[13.5px] text-warn ring-1 ring-inset ring-warn/25">
                  <span className="flex items-center gap-2"><PiWarningCircle size={17} /> You have unsaved edits from {new Date(restore.savedAt).toLocaleString()}.</span>
                  <span className="flex gap-2">
                    <button onClick={() => { setContent(restore.content); setRestore(null) }} className="rounded-lg bg-warn px-3 py-1.5 font-semibold text-ink-950">Restore them</button>
                    <button onClick={() => { clearDraft(); setRestore(null) }} className="rounded-lg px-3 py-1.5 hover:bg-warn/10">Discard</button>
                  </span>
                </div>
              )}
              <div className="mb-7">
                <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
                <p className="mt-1 text-[14px] text-fog-500">{desc}</p>
              </div>

              {tab === 'overview' && <Overview content={content} setContent={setContent} go={setTab} mode={mode} />}
              {tab === 'projects' && <ProjectsEditor content={content} set={set} />}
              {tab === 'achievements' && <AchievementsEditor content={content} set={set} />}
              {tab === 'skills' && <SkillsEditor content={content} set={set} />}
              {tab === 'profile' && <ProfileEditor content={content} set={set} />}
              {tab === 'more' && <MoreEditor content={content} set={set} />}
              {tab === 'settings' && (
                <Settings
                  mode={mode}
                  ghCfg={ghCfg}
                  dirty={dirty}
                  revert={revert}
                  toast={toast}
                  content={content}
                  setContent={setContent}
                  onConnected={async (cfg) => {
                    setGhCfg(cfg)
                    if (mode !== 'local') {
                      try {
                        if (dirty) {
                          const { sha } = await githubLoad(cfg)
                          setGhSha(sha)
                          setMode('github')
                          toast('Connected. Your current edits are kept. Publish when ready.', 'ok')
                        } else {
                          await loadGithub(cfg)
                          toast('Connected and loaded from GitHub.', 'ok')
                        }
                      } catch (e) {
                        toast(e.message, 'error')
                      }
                    } else toast('GitHub details saved.', 'ok')
                  }}
                  onDisconnect={() => {
                    setGithubConfig(null)
                    setGhCfg(null)
                    if (mode === 'github') setMode('offline')
                    toast('Disconnected. Token removed from this browser.', 'ok')
                  }}
                />
              )}
            </div>
          </main>
        </div>

        {/* conflict dialog */}
        <AnimatePresence>
          {conflict && (
            <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-ink-900 p-6 ring-1 ring-white/10">
                <p className="font-display text-xl font-bold">content.json changed on GitHub</p>
                <p className="mt-2 text-[14px] text-fog-400">Someone (maybe you, from another device) published since this page loaded. Publishing now will replace those changes with yours.</p>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setConflict(false)} className="rounded-lg px-4 py-2 text-[13.5px] text-fog-400 hover:bg-white/[0.06]">Cancel</button>
                  <button onClick={() => { setConflict(false); doPublish(true) }} className="rounded-lg bg-[#ff8f7a] px-4 py-2 text-[13.5px] font-semibold text-ink-950">Overwrite & publish</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* toast */}
        <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end" aria-live="polite">
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                key={toastMsg.id}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-[13.5px] shadow-2xl ring-1 ${toastMsg.kind === 'error' ? 'bg-[#2a1512] text-[#ffb3a5] ring-[#ff8f7a]/30' : 'bg-ink-800 text-fog-50 ring-white/10'}`}
              >
                {toastMsg.kind === 'error' ? <PiWarningCircle size={18} className="mt-0.5 shrink-0" /> : <PiCheckCircle size={18} className="mt-0.5 shrink-0 text-signal" />}
                <span>
                  {toastMsg.text}
                  {toastMsg.link && (
                    <a href={toastMsg.link} target="_blank" rel="noopener noreferrer" className="ml-2 font-medium text-signal underline-offset-2 hover:underline">View commit</a>
                  )}
                </span>
                <button onClick={() => setToastMsg(null)} className="ml-1 text-fog-500 hover:text-fog-50" aria-label="Dismiss"><PiX /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </UploadCtx.Provider>
  )
}
