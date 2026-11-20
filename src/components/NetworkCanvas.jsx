import { useEffect, useRef } from 'react'

// Animated network topology: nodes drift, links form by distance, and
// "packets" travel along links. Nodes near the pointer light up.
export default function NetworkCanvas({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, dpr = 1, raf = 0, running = true
    let nodes = [], packets = []
    const pointer = { x: -9999, y: -9999 }
    const LINK = 150

    function init() {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(70, Math.max(26, (w * h) / 16000)))
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() < 0.14 ? 2.6 : 1.4,
        hub: Math.random() < 0.14,
        id: i,
      }))
      packets = []
    }

    function spawnPacket() {
      const a = nodes[(Math.random() * nodes.length) | 0]
      let best = null, bd = Infinity
      for (const b of nodes) {
        if (b === a) continue
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < LINK && d < bd && Math.random() > 0.3) { bd = d; best = b }
      }
      if (best) packets.push({ a, b: best, t: 0, speed: 0.006 + Math.random() * 0.01 })
    }

    function frame() {
      ctx.clearRect(0, 0, w, h)
      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx; n.y += n.vy
          if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20
          if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20
        }
      }
      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < LINK) {
            const near = Math.min(
              Math.hypot(a.x - pointer.x, a.y - pointer.y),
              Math.hypot(b.x - pointer.x, b.y - pointer.y)
            )
            const glow = near < 160 ? 1 - near / 160 : 0
            const alpha = (1 - d / LINK) * 0.16 + glow * 0.35
            ctx.strokeStyle = glow > 0 ? `rgba(198,242,78,${alpha})` : `rgba(201,208,216,${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
      }
      // packets
      if (!reduce && packets.length < 14 && Math.random() < 0.08) spawnPacket()
      packets = packets.filter((p) => {
        p.t += p.speed
        if (p.t >= 1) return false
        const x = p.a.x + (p.b.x - p.a.x) * p.t
        const y = p.a.y + (p.b.y - p.a.y) * p.t
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9)
        g.addColorStop(0, 'rgba(198,242,78,0.9)')
        g.addColorStop(1, 'rgba(198,242,78,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#eaffb0'
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill()
        return true
      })
      // nodes
      for (const n of nodes) {
        const near = Math.hypot(n.x - pointer.x, n.y - pointer.y)
        const lit = near < 160
        ctx.fillStyle = lit ? '#c6f24e' : n.hub ? 'rgba(238,241,244,0.75)' : 'rgba(201,208,216,0.45)'
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (lit ? 0.8 : 0), 0, Math.PI * 2); ctx.fill()
        if (n.hub) {
          ctx.strokeStyle = lit ? 'rgba(198,242,78,0.5)' : 'rgba(238,241,244,0.14)'
          ctx.beginPath(); ctx.arc(n.x, n.y, 7, 0, Math.PI * 2); ctx.stroke()
        }
      }
      if (running && !reduce) raf = requestAnimationFrame(frame)
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      if (reduce) frame()
    }
    const onLeave = () => { pointer.x = -9999; pointer.y = -9999 }
    const onResize = () => { init(); if (reduce) frame() }

    const io = new IntersectionObserver(([entry]) => {
      const vis = entry.isIntersecting
      if (vis && !running) { running = true; if (!reduce) raf = requestAnimationFrame(frame) }
      if (!vis) { running = false; cancelAnimationFrame(raf) }
    })

    init()
    frame()
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onResize)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />
}
