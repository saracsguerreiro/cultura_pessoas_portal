import { useEffect, useRef } from 'react'

// Fogo de artifício branco: foguetes sobem do fundo e rebentam em faíscas que caem e desvanecem
type Spark  = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number }
type Rocket = { x: number; y: number; tx: number; ty: number; t: number; delay: number; dur: number; done: boolean }

const BURSTS   = 4
const SPARKS   = 64
const GRAVITY  = 0.045
const DRAG     = 0.985

export default function Fireworks({ onDone }: { onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const { width: W, height: H } = canvas.getBoundingClientRect()
    canvas.width = W * dpr; canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const rockets: Rocket[] = Array.from({ length: BURSTS }, (_, i) => {
      const tx = W * (0.18 + 0.64 * ((i + Math.random() * 0.6) / BURSTS))
      return { x: tx + (Math.random() - 0.5) * 40, y: H + 10, tx, ty: H * (0.16 + Math.random() * 0.32), t: 0, delay: i * 220 + Math.random() * 80, dur: 380 + Math.random() * 120, done: false }
    })
    const sparks: Spark[] = []
    const start = performance.now()
    let last = start, raf = 0

    function burst(x: number, y: number) {
      for (let i = 0; i < SPARKS; i++) {
        const a = (Math.PI * 2 * i) / SPARKS + Math.random() * 0.2
        const sp = 2.6 + Math.random() * 3.2
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 55 + Math.random() * 30, size: 1.5 + Math.random() * 1.9 })
      }
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 16.67, 3); last = now
      const elapsed = now - start
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      ctx.shadowColor = 'rgba(255,255,255,0.9)'

      for (const r of rockets) {
        if (r.done || elapsed < r.delay) continue
        r.t = Math.min((elapsed - r.delay) / r.dur, 1)
        const e = 1 - Math.pow(1 - r.t, 3)
        const cx = r.x + (r.tx - r.x) * e, cy = r.y + (r.ty - r.y) * e
        const g = ctx.createLinearGradient(cx, cy, cx, cy + 34)
        g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.shadowBlur = 8
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 34); ctx.stroke()
        if (r.t >= 1) { r.done = true; burst(r.tx, r.ty) }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.vx *= DRAG; s.vy = s.vy * DRAG + GRAVITY * dt
        s.x += s.vx * dt; s.y += s.vy * dt; s.life += dt
        const k = 1 - s.life / s.max
        if (k <= 0) { sparks.splice(i, 1); continue }
        ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.shadowBlur = 10 * k
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * (0.6 + 0.4 * k), 0, Math.PI * 2); ctx.fill()
      }

      if (rockets.every(r => r.done) && sparks.length === 0) { onDone?.(); return }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 5 }} />
}
