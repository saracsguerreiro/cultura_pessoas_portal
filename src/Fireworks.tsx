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
    // Brilho pré-desenhado uma única vez (evita shadowBlur por faísca, que trava a animação)
    const R = 16
    const glow = document.createElement('canvas')
    glow.width = glow.height = R * 2 * dpr
    const gctx = glow.getContext('2d')!
    const rg = gctx.createRadialGradient(R * dpr, R * dpr, 0, R * dpr, R * dpr, R * dpr)
    rg.addColorStop(0, 'rgba(255,255,255,1)')
    rg.addColorStop(0.18, 'rgba(255,255,255,0.95)')
    rg.addColorStop(0.4, 'rgba(255,255,255,0.35)')
    rg.addColorStop(1, 'rgba(255,255,255,0)')
    gctx.fillStyle = rg; gctx.fillRect(0, 0, R * 2 * dpr, R * 2 * dpr)

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

    function dot(x: number, y: number, size: number, alpha: number) {
      const d = size * 5
      ctx.globalAlpha = alpha
      ctx.drawImage(glow, x - d / 2, y - d / 2, d, d)
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 16.67, 2); last = now
      const elapsed = now - start
      const drag = Math.pow(DRAG, dt)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      for (const r of rockets) {
        if (r.done || elapsed < r.delay) continue
        r.t = Math.min((elapsed - r.delay) / r.dur, 1)
        const e = 1 - Math.pow(1 - r.t, 3)
        const cx = r.x + (r.tx - r.x) * e, cy = r.y + (r.ty - r.y) * e
        for (let j = 0; j < 6; j++) dot(cx, cy + j * 6, 2.2 - j * 0.3, 0.9 - j * 0.14)
        if (r.t >= 1) { r.done = true; burst(r.tx, r.ty) }
      }

      let alive = 0
      for (const s of sparks) {
        if (s.life >= s.max) continue
        s.vx *= drag; s.vy = s.vy * drag + GRAVITY * dt
        s.x += s.vx * dt; s.y += s.vy * dt; s.life += dt
        const k = 1 - s.life / s.max
        if (k <= 0) continue
        alive++
        dot(s.x, s.y, s.size * (0.6 + 0.4 * k), k)
      }
      ctx.globalAlpha = 1

      if (rockets.every(r => r.done) && alive === 0) { onDone?.(); return }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 5, willChange: 'transform' }} />
}
