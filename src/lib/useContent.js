import { useEffect, useState } from 'react'
import baseContent from '../content/content.json'

export const DRAFT_KEY = 'portfolio-admin-draft-v1'

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw).content : null
  } catch {
    return null
  }
}

export function isPreview() {
  try {
    return new URLSearchParams(window.location.search).has('preview')
  } catch {
    return false
  }
}

// Returns the site content. With ?preview in the URL it shows the unsaved
// dashboard draft and live-updates while you edit in the other tab.
// Without it, content.json is used directly (and hot-reloads in dev).
export function useContent() {
  const preview = isPreview()
  const [draft, setDraft] = useState(() => (preview ? readDraft() : null))

  useEffect(() => {
    if (!preview) return
    const onStorage = (e) => {
      if (e.key === DRAFT_KEY) setDraft(readDraft())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [preview])

  return { content: (preview && draft) || baseContent, preview: preview && !!draft }
}

export function computeStat(stat, content) {
  const projects = (content.projects || []).filter((p) => p.visible !== false)
  const ach = (content.achievements || []).filter((a) => a.visible !== false)
  switch (stat.source) {
    case 'projects':
      return projects.length
    case 'certifications':
      return ach.filter((a) => a.type === 'Certification').length
    case 'achievements':
      return ach.length
    default:
      return Number(stat.value) || 0
  }
}
