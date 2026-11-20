import { createContext, useContext, useRef, useState } from 'react'
import {
  PiX, PiUploadSimple, PiImage, PiCaretDown, PiCheck, PiArrowUp, PiArrowDown, PiTrash,
  PiCopy, PiEye, PiEyeSlash, PiStar, PiStarFill, PiPlus, PiFilePdf,
} from 'react-icons/pi'
import { GENERIC_ICONS, BRAND_ICONS, ACCENTS, getIcon } from '../lib/icons'

/* Upload context: provided by AdminApp depending on storage mode */
export const UploadCtx = createContext({ upload: null, resolveSrc: (u) => u })
export const useUpload = () => useContext(UploadCtx)

export const inputCls =
  'w-full rounded-lg bg-ink-950 px-3 py-2.5 text-[14px] text-fog-50 placeholder:text-fog-600 ring-1 ring-inset ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-signal/70'

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <div className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-[12.5px] font-medium text-fog-200">{label}</span>
          {hint && <span className="text-[11.5px] text-fog-500">{hint}</span>}
        </span>
      )}
      {children}
      {error && <span className="mt-1 block text-[12px] text-[#ff8f7a]">{error}</span>}
    </div>
  )
}

export function Text({ label, hint, value, onChange, placeholder, type = 'text', error, className, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <input
        type={type}
        className={`${inputCls} ${error ? 'ring-[#ff8f7a]/60' : ''}`}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        {...rest}
      />
    </Field>
  )
}

export function Area({ label, hint, value, onChange, placeholder, rows = 4, className }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea className={`${inputCls} resize-y leading-relaxed`} rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

export function Select({ label, value, onChange, options, className, allowCustom }) {
  const known = options.some((o) => (o.value ?? o) === value)
  return (
    <Field label={label} className={className}>
      <div className="relative">
        <select className={`${inputCls} appearance-none pr-9`} value={known || !allowCustom ? value : '__custom'} onChange={(e) => onChange(e.target.value === '__custom' ? '' : e.target.value)}>
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
          {allowCustom && <option value="__custom">Custom…</option>}
        </select>
        <PiCaretDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fog-500" />
      </div>
      {allowCustom && !known && (
        <input className={`${inputCls} mt-2`} placeholder="Type a custom value" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  )
}

export function Toggle({ label, desc, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-ink-950 px-3 py-2.5 ring-1 ring-inset ring-white/10">
      <span>
        <span className="block text-[13.5px] font-medium text-fog-100">{label}</span>
        {desc && <span className="block text-[12px] text-fog-500">{desc}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-signal' : 'bg-ink-600'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

/* Chips input: Enter or comma adds a tag */
export function Tags({ label, hint, value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [draft, setDraft] = useState('')
  const add = (raw) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
    if (!parts.length) return
    onChange([...value, ...parts.filter((p) => !value.includes(p))])
    setDraft('')
  }
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-ink-950 p-2 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-signal/70">
        {value.map((t, i) => (
          <span key={t + i} className="inline-flex items-center gap-1 rounded-md bg-white/[0.07] py-1 pl-2 pr-1 font-mono text-[12px]">
            {t}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-0.5 text-fog-500 hover:bg-white/10 hover:text-fog-50" aria-label={`Remove ${t}`}>
              <PiX size={12} />
            </button>
          </span>
        ))}
        <input
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-[14px] outline-none placeholder:text-fog-600"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(draft)
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
          }}
          onBlur={() => add(draft)}
        />
      </div>
    </Field>
  )
}

/* Simple list of text lines (bullets, paragraphs, roles) */
export function Lines({ label, hint, value = [], onChange, placeholder, multiline }) {
  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            {multiline ? (
              <textarea className={`${inputCls} resize-y`} rows={3} value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            ) : (
              <input className={inputCls} value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            )}
            <div className={`flex shrink-0 gap-1 ${multiline ? 'flex-col' : 'items-center self-center'}`}>
              <IconBtn label="Move up" disabled={i === 0} onClick={() => onChange(move(value, i, -1))}><PiArrowUp /></IconBtn>
              <IconBtn label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}><PiX /></IconBtn>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...value, ''])} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-signal hover:bg-signal/10">
          <PiPlus /> Add line
        </button>
      </div>
    </Field>
  )
}

export function IconBtn({ children, label, onClick, disabled, active, danger, className = '' }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      className={`grid h-7 w-7 place-items-center rounded-md text-[14px] transition-colors disabled:pointer-events-none disabled:opacity-30 ${
        active ? 'text-signal' : danger ? 'text-fog-500 hover:bg-[#ff8f7a]/10 hover:text-[#ff8f7a]' : 'text-fog-500 hover:bg-white/[0.07] hover:text-fog-50'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function move(arr, i, d) {
  const j = i + d
  if (j < 0 || j >= arr.length) return arr
  const out = [...arr]
  ;[out[i], out[j]] = [out[j], out[i]]
  return out
}

/* Image / file field with upload */
export function FileField({ label, hint, value, onChange, accept = 'image/*', nameHint = 'image', folder = 'uploads', kind = 'image' }) {
  const { upload, resolveSrc } = useUpload()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const ref = useRef(null)
  const isPdf = kind === 'pdf'

  const onFile = async (file) => {
    if (!file) return
    setErr('')
    setBusy(true)
    try {
      onChange(await upload(file, { nameHint, folder, kind }))
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
      if (ref.current) ref.current.value = ''
    }
  }

  return (
    <Field label={label} hint={hint} error={err}>
      <div
        className="flex gap-3 rounded-lg bg-ink-950 p-3 ring-1 ring-inset ring-white/10"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          onFile(e.dataTransfer.files?.[0])
        }}
      >
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-md bg-ink-800 text-fog-600">
          {value && !isPdf ? <img src={resolveSrc(value)} alt="" className="h-full w-full object-cover" /> : isPdf ? <PiFilePdf size={28} /> : <PiImage size={26} />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <input className={`${inputCls} py-1.5 font-mono text-[12px]`} value={value || ''} placeholder={isPdf ? '/your-cv.pdf or https://…' : '/uploads/photo.webp or https://…'} onChange={(e) => onChange(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2">
            {upload ? (
              <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.07] px-2.5 py-1.5 text-[12.5px] font-medium hover:bg-white/[0.12] disabled:opacity-50">
                <PiUploadSimple /> {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
              </button>
            ) : (
              <span className="text-[11.5px] text-fog-500">Uploads need local dev mode or GitHub. Paste a URL instead.</span>
            )}
            {value && (
              <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[12.5px] text-fog-500 hover:text-[#ff8f7a]">
                <PiTrash /> Remove
              </button>
            )}
            {upload && <span className="text-[11px] text-fog-600">or drop a file here</span>}
          </div>
        </div>
        <input ref={ref} type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </Field>
  )
}

/* Icon picker */
export function IconPicker({ label = 'Icon', value, onChange, brands = false }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const Current = getIcon(value)
  const set = brands ? { ...BRAND_ICONS, ...GENERIC_ICONS } : GENERIC_ICONS
  const entries = Object.entries(set).filter(([k]) => k.toLowerCase().includes(q.toLowerCase()))
  return (
    <Field label={label}>
      <div className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)} className={`${inputCls} flex items-center gap-2.5 text-left`}>
          <Current size={18} className="text-signal" />
          <span className="flex-1 truncate font-mono text-[12.5px]">{value || 'Choose…'}</span>
          <PiCaretDown className="text-fog-500" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl bg-ink-800 p-3 shadow-2xl ring-1 ring-white/10 sm:w-[340px]">
              <input autoFocus className={`${inputCls} mb-2 py-1.5`} placeholder="Search icons" value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="grid max-h-56 grid-cols-7 gap-1 overflow-y-auto">
                {entries.map(([k, I]) => (
                  <button key={k} type="button" title={k} onClick={() => { onChange(k); setOpen(false) }} className={`grid aspect-square place-items-center rounded-md transition-colors ${k === value ? 'bg-signal text-ink-950' : 'text-fog-200 hover:bg-white/10'}`}>
                    <I size={18} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Field>
  )
}

export function AccentPicker({ value, onChange }) {
  return (
    <Field label="Cover colour">
      <div className="flex flex-wrap gap-2">
        {Object.entries(ACCENTS).map(([k, c]) => (
          <button key={k} type="button" title={k} onClick={() => onChange(k)} className={`grid h-9 w-9 place-items-center rounded-full ring-2 transition ${value === k ? 'ring-white' : 'ring-transparent hover:ring-white/30'}`} style={{ background: c }}>
            {value === k && <PiCheck className="text-ink-950" />}
          </button>
        ))}
      </div>
    </Field>
  )
}

/* Row action cluster used by list editors */
export function RowActions({ i, len, item, onMove, onDup, onDel, onToggleVisible, onToggleFeatured }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="flex items-center gap-0.5">
      {onToggleFeatured && (
        <IconBtn label={item.featured ? 'Unfeature' : 'Feature'} active={item.featured} onClick={onToggleFeatured}>
          {item.featured ? <PiStarFill /> : <PiStar />}
        </IconBtn>
      )}
      {onToggleVisible && (
        <IconBtn label={item.visible === false ? 'Show on site' : 'Hide from site'} onClick={onToggleVisible}>
          {item.visible === false ? <PiEyeSlash /> : <PiEye />}
        </IconBtn>
      )}
      <IconBtn label="Move up" disabled={i === 0} onClick={() => onMove(-1)}><PiArrowUp /></IconBtn>
      <IconBtn label="Move down" disabled={i === len - 1} onClick={() => onMove(1)}><PiArrowDown /></IconBtn>
      {onDup && <IconBtn label="Duplicate" onClick={onDup}><PiCopy /></IconBtn>}
      {confirm ? (
        <span className="ml-1 flex items-center gap-1">
          <button type="button" onClick={(e) => { e.stopPropagation(); onDel() }} className="rounded-md bg-[#ff8f7a]/15 px-2 py-1 text-[11.5px] font-semibold text-[#ff8f7a]">Delete</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setConfirm(false) }} className="rounded-md px-1.5 py-1 text-[11.5px] text-fog-500">Cancel</button>
        </span>
      ) : (
        <IconBtn label="Delete" danger onClick={() => setConfirm(true)}><PiTrash /></IconBtn>
      )}
    </div>
  )
}
