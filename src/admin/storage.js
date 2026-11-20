// Storage backends for the dashboard.
//  - local:  `npm run dev` is running → write straight into src/content/content.json + /public
//  - github: deployed site → commit content.json (and uploaded files) to your repo; Vercel/Netlify redeploys
//  - offline: neither available → edit + export JSON
import { DRAFT_KEY } from '../lib/useContent'

export const CONTENT_PATH = 'src/content/content.json'
const GH_KEY = 'portfolio-admin-github-v1'

/* ---------------- draft (autosave) ---------------- */
export function saveDraft(content) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, savedAt: Date.now() }))
  } catch {}
}
export function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {}
}

/* ---------------- local dev API ---------------- */
export async function detectLocal() {
  try {
    const r = await fetch('/__admin/ping', { cache: 'no-store' })
    if (!r.ok) return false
    const j = await r.json()
    return j.mode === 'local'
  } catch {
    return false
  }
}
export async function localLoad() {
  const r = await fetch('/__admin/content', { cache: 'no-store' })
  if (!r.ok) throw new Error('Could not read content.json')
  return r.json()
}
export async function localSave(content) {
  const r = await fetch('/__admin/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Save failed')
}
export async function localUpload(blob, relPath) {
  const r = await fetch(`/__admin/upload?path=${encodeURIComponent(relPath)}`, { method: 'POST', body: blob })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || 'Upload failed')
  return j.url
}

/* ---------------- GitHub ---------------- */
export function getGithubConfig() {
  try {
    return JSON.parse(localStorage.getItem(GH_KEY)) || null
  } catch {
    return null
  }
}
export function setGithubConfig(cfg) {
  try {
    if (cfg) localStorage.setItem(GH_KEY, JSON.stringify(cfg))
    else localStorage.removeItem(GH_KEY)
  } catch {}
}

async function gh(cfg, path, opts = {}) {
  const r = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}${path}`, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${cfg.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
    cache: 'no-store',
  })
  if (!r.ok) {
    const j = await r.json().catch(() => ({}))
    const msg =
      r.status === 401 ? 'GitHub rejected the token (expired or wrong).' :
      r.status === 403 ? 'Token lacks permission. It needs "Contents: Read and write" on this repo.' :
      r.status === 404 ? 'Repo, branch or file not found. Check owner / repo / branch.' :
      r.status === 409 ? 'GitHub reported a conflict. Reload and try again.' :
      j.message || `GitHub error ${r.status}`
    const err = new Error(msg)
    err.status = r.status
    throw err
  }
  return r.status === 204 ? null : r.json()
}

function b64ToUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ''))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export async function githubVerify(cfg) {
  const repo = await gh(cfg, '')
  if (!repo.permissions?.push) throw new Error('This token can read the repo but cannot push to it.')
  await gh(cfg, `/git/ref/heads/${encodeURIComponent(cfg.branch)}`)
  return repo
}

export async function githubLoad(cfg) {
  const j = await gh(cfg, `/contents/${CONTENT_PATH}?ref=${encodeURIComponent(cfg.branch)}`)
  return { content: JSON.parse(b64ToUtf8(j.content)), sha: j.sha }
}

export async function githubCurrentSha(cfg) {
  const j = await gh(cfg, `/contents/${CONTENT_PATH}?ref=${encodeURIComponent(cfg.branch)}`)
  return j.sha
}

/**
 * One atomic commit with content.json + any pending uploads.
 * files: [{ path: 'public/uploads/x.webp', base64: '...' }]
 */
export async function githubPublish(cfg, content, files = [], message) {
  const ref = await gh(cfg, `/git/ref/heads/${encodeURIComponent(cfg.branch)}`)
  const parentSha = ref.object.sha
  const parent = await gh(cfg, `/git/commits/${parentSha}`)

  const tree = []
  for (const f of files) {
    const blob = await gh(cfg, '/git/blobs', { method: 'POST', body: JSON.stringify({ content: f.base64, encoding: 'base64' }) })
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha })
  }
  const json = JSON.stringify(content, null, 2) + '\n'
  const blob = await gh(cfg, '/git/blobs', { method: 'POST', body: JSON.stringify({ content: json, encoding: 'utf-8' }) })
  tree.push({ path: CONTENT_PATH, mode: '100644', type: 'blob', sha: blob.sha })

  const newTree = await gh(cfg, '/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree }) })
  const commit = await gh(cfg, '/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message: message || 'Update portfolio content', tree: newTree.sha, parents: [parentSha] }),
  })
  await gh(cfg, `/git/refs/heads/${encodeURIComponent(cfg.branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) })
  const sha = await githubCurrentSha(cfg)
  return { commit: commit.sha, sha, url: commit.html_url }
}

/* ---------------- files ---------------- */
export function slugify(s) {
  return (s || 'file')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'file'
}

// Resize + convert images to WebP so commits stay small.
export async function compressImage(file, max = 1600, quality = 0.85) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') return { blob: file, ext: file.name.split('.').pop().toLowerCase() }
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/webp', quality))
  return { blob: blob || file, ext: blob ? 'webp' : file.name.split('.').pop().toLowerCase() }
}

export function blobToBase64(blob) {
  return new Promise((ok, fail) => {
    const fr = new FileReader()
    fr.onload = () => ok(String(fr.result).split(',')[1])
    fr.onerror = fail
    fr.readAsDataURL(blob)
  })
}

export function downloadJson(content) {
  const blob = new Blob([JSON.stringify(content, null, 2) + '\n'], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'content.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function uid(prefix, title) {
  return `${prefix}-${slugify(title).slice(0, 18)}-${Math.random().toString(36).slice(2, 6)}`
}
