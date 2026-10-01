import { useState } from 'react'
import tisLogoSvg from '@/imports/TIS_logo-01.svg'
import { PROFILE } from '@/AMinhaFoto'

// Gradiente do fundo da página
const PAGE_GRADIENT = 'linear-gradient(130deg, rgb(130,0,200) 0%, rgb(60,12,178) 45%, rgb(3,110,242) 100%)'
const TIS_BLUE = '#036ef2'
const LOGO_RATIO = 1264.17 / 618.3

type IconProps = { className?: string }
const svgProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function IconSparkles({ className }: IconProps) { return <svg {...svgProps} className={className}><path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6L10 3z" /><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z" /></svg> }
function IconBriefcase({ className }: IconProps) { return <svg {...svgProps} className={className}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12.5h18" /></svg> }
function IconCube({ className }: IconProps) { return <svg {...svgProps} className={className}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></svg> }
function IconBuilding({ className }: IconProps) { return <svg {...svgProps} className={className}><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10.5 21v-3h3v3" /></svg> }
function IconAperture({ className }: IconProps) { return <svg {...svgProps} className={className}><circle cx="12" cy="12" r="9" /><path d="M14.3 3.3L9 12.5M20.6 9.5H10M18.4 18.2l-5.3-9.2M9.7 20.7l5.3-9.2M3.4 14.5H14M5.6 5.8l5.3 9.2" /></svg> }
function IconSun({ className }: IconProps) { return <svg {...svgProps} className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg> }
function IconContrast({ className }: IconProps) { return <svg {...svgProps} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 3v18" /><path d="M12 7a5 5 0 0 1 0 10" /></svg> }
function IconDroplet({ className }: IconProps) { return <svg {...svgProps} className={className}><path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z" /></svg> }
function IconZoom({ className }: IconProps) { return <svg {...svgProps} className={className}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2M11 8.5v5M8.5 11h5" /></svg> }
function IconArrowsV({ className }: IconProps) { return <svg {...svgProps} className={className}><path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" /></svg> }
function IconDownload({ className }: IconProps) { return <svg {...svgProps} className={className}><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></svg> }
function IconUserCheck({ className }: IconProps) { return <svg {...svgProps} className={className}><circle cx="10" cy="8" r="3.5" /><path d="M3.5 20c0-3.6 2.9-6.5 6.5-6.5 1.4 0 2.6.4 3.7 1.1M15.5 18l2 2 4-4" /></svg> }
function IconImage({ className }: IconProps) { return <svg {...svgProps} className={className}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="M21 16l-5-5-9 9" /></svg> }
function IconArrowLeft({ className }: IconProps) { return <svg {...svgProps} className={className}><path d="M19 12H5M11 6l-6 6 6 6" /></svg> }
function IconStudio({ className }: IconProps) { return <svg {...svgProps} className={className}><rect x="3" y="5" width="15" height="15" rx="2" /><circle cx="8" cy="10" r="1.5" /><path d="M18 15l-4-4-8 9" /><path d="M20 2v4M18 4h4" /></svg> }

// Estilos Nano Banana — protótipo: a transformação é simulada com filtros e camadas de cor
type NanoStyle = { id: string; icon: React.FC<IconProps>; title: string; sub: string; filter: string; tint: string; blend: GlobalCompositeOperation; vignette: number }
const NANO_STYLES: NanoStyle[] = [
  { id: 'executivo', icon: IconBriefcase, title: 'Executivo',         sub: 'Estúdio & escritório', filter: 'contrast(1.08) saturate(0.9) sepia(0.12)',       tint: 'rgba(60,40,20,0.45)',  blend: 'soft-light', vignette: 0.35 },
  { id: 'avatar3d',  icon: IconCube,      title: 'Avatar 3D',         sub: 'Visual estilizado TIS', filter: 'saturate(1.5) contrast(1.2) brightness(1.05)',  tint: 'rgba(130,0,200,0.40)', blend: 'soft-light', vignette: 0.2  },
  { id: 'lounge',    icon: IconBuilding,  title: 'Lounge Tech',       sub: 'Cenário futurista',     filter: 'contrast(1.1) saturate(1.2)',                   tint: 'rgba(3,110,242,0.32)', blend: 'color',      vignette: 0.3  },
  { id: 'editorial', icon: IconAperture,  title: 'Estúdio Editorial', sub: 'LinkedIn Pro',          filter: 'grayscale(0.25) contrast(1.22) brightness(0.96)', tint: 'rgba(20,16,60,0.35)',  blend: 'multiply',   vignette: 0.55 },
]

type FrameId = 'oficial' | 'cracha' | 'neon' | 'minimal'
const FRAMES: { id: FrameId; title: string; sub: string }[] = [
  { id: 'oficial', title: 'Oficial TIS',  sub: 'Clássica azul/violeta'  },
  { id: 'cracha',  title: 'Crachá VIP',   sub: 'Identificação executiva' },
  { id: 'neon',    title: 'Tech Neon HUD', sub: 'Cibernética futurista'  },
  { id: 'minimal', title: 'Minimalista',  sub: 'Linhas finas discretas'  },
]

const DEFAULT_ADJ = { brightness: 100, contrast: 100, saturation: 100, zoom: 100, offset: 0 }
type Adj = typeof DEFAULT_ADJ

const glass  = { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' } as const
const tileOn  = { background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 0 18px rgba(3,110,242,0.45)' } as const
const tileOff = { background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.16)' } as const

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function Slider({ icon: Icon, label, value, min, max, unit, onChange }: { icon: React.FC<IconProps>; label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-2 text-white">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold"><Icon className="h-4 w-4 text-white/85" />{label}</span>
        <span className="text-xs font-semibold text-white/70 tabular-nums">{value > 0 && unit === 'px' ? '+' : ''}{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="tis-range w-full" style={{ '--pct': `${pct}%` } as React.CSSProperties}
      />
    </label>
  )
}

export default function Estudio({ isMobile, photo, onSetPhoto, onBack }: { isMobile: boolean; photo: string | null; onSetPhoto: (url: string) => void; onBack: () => void }) {
  const [styleId,    setStyleId]    = useState('editorial')
  const [frame,      setFrame]      = useState<FrameId>('minimal')
  const [adj,        setAdj]        = useState<Adj>(DEFAULT_ADJ)
  const [generated,  setGenerated]  = useState<string | null>(null)
  const [mode,       setMode]       = useState<'original' | 'nano'>('original')
  const [generating, setGenerating] = useState(false)
  const [busy,       setBusy]       = useState(false)
  const [notice,     setNotice]     = useState('')

  const nano = mode === 'nano' && generated ? NANO_STYLES.find(s => s.id === generated)! : null
  const set = (k: keyof Adj) => (v: number) => setAdj(a => ({ ...a, [k]: v }))
  const filter = `brightness(${adj.brightness / 100}) contrast(${adj.contrast / 100}) saturate(${adj.saturation / 100})${nano ? ' ' + nano.filter : ''}`
  const src = photo ?? PROFILE.photo

  function generate() {
    setGenerating(true); setNotice('')
    setTimeout(() => { setGenerated(styleId); setMode('nano'); setGenerating(false) }, 2400)
  }

  async function renderPng() {
    const S = 1024, k = S / 400
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = S
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#140f3a'; ctx.fillRect(0, 0, S, S)

    const img = await loadImage(src)
    const cover = Math.max(S / img.width, S / img.height) * (adj.zoom / 100)
    const w = img.width * cover, h = img.height * cover
    ctx.save(); ctx.filter = filter
    ctx.drawImage(img, (S - w) / 2, (S - h) / 2 + adj.offset * k, w, h)
    ctx.restore()

    if (nano) {
      ctx.save(); ctx.globalCompositeOperation = nano.blend; ctx.fillStyle = nano.tint; ctx.fillRect(0, 0, S, S); ctx.restore()
      const v = ctx.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.75)
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${nano.vignette})`)
      ctx.fillStyle = v; ctx.fillRect(0, 0, S, S)
    }

    // bottom shade for the name
    const g = ctx.createLinearGradient(0, S * 0.6, 0, S)
    g.addColorStop(0, 'rgba(10,8,40,0)'); g.addColorStop(1, 'rgba(10,8,40,0.8)')
    ctx.fillStyle = g; ctx.fillRect(0, S * 0.6, S, S * 0.4)

    // frame
    let textColor = '#fff', nameY = S - 92
    if (frame === 'oficial') {
      const fg = ctx.createLinearGradient(0, 0, S, S)
      fg.addColorStop(0, 'rgb(130,0,200)'); fg.addColorStop(0.45, 'rgb(60,12,178)'); fg.addColorStop(1, 'rgb(3,110,242)')
      ctx.strokeStyle = fg; ctx.lineWidth = 40; ctx.strokeRect(20, 20, S - 40, S - 40)
      ctx.fillStyle = fg; ctx.fillRect(0, S - 170, S, 170)
      nameY = S - 98
    } else if (frame === 'cracha') {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 48; ctx.strokeRect(24, 24, S - 48, S - 48)
      ctx.fillStyle = '#fff'; ctx.fillRect(0, S - 180, S, 180)
      textColor = '#1e1b4b'; nameY = S - 104
    } else if (frame === 'neon') {
      ctx.save(); ctx.shadowColor = TIS_BLUE; ctx.shadowBlur = 30
      ctx.strokeStyle = TIS_BLUE; ctx.lineWidth = 6; ctx.strokeRect(28, 28, S - 56, S - 56)
      ctx.lineWidth = 10
      for (const [x, y, dx, dy] of [[44, 44, 1, 1], [S - 44, 44, -1, 1], [44, S - 44, 1, -1], [S - 44, S - 44, -1, -1]]) {
        ctx.beginPath(); ctx.moveTo(x, y + dy * 90); ctx.lineTo(x, y); ctx.lineTo(x + dx * 90, y); ctx.stroke()
      }
      ctx.restore()
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(40, 40, S - 80, S - 80)
    }

    // logo
    try {
      const logo = await loadImage(tisLogoSvg)
      const lh = 64, lw = lh * LOGO_RATIO
      ctx.save()
      ctx.filter = 'brightness(0) invert(1)'
      ctx.drawImage(logo, (S - lw) / 2, 78, lw, lh)
      ctx.restore()
    } catch { /* logo é opcional */ }

    ctx.fillStyle = textColor; ctx.textAlign = 'center'
    ctx.font = "800 44px 'Outfit', sans-serif"; ctx.fillText(PROFILE.name, S / 2, nameY)
    ctx.globalAlpha = 0.8
    ctx.font = "500 24px 'Outfit', sans-serif"; ctx.fillText(`${PROFILE.role} · ${PROFILE.team}`, S / 2, nameY + 40)
    return canvas.toDataURL('image/png')
  }

  async function download() {
    setBusy(true); setNotice('')
    try {
      const a = document.createElement('a')
      a.href = await renderPng(); a.download = 'retrato-tis.png'; a.click()
    } catch { setNotice('Não foi possível gerar a imagem. Tenta novamente.') }
    setBusy(false)
  }

  async function setAsPortrait() {
    setBusy(true); setNotice('')
    try { onSetPhoto(await renderPng()) }
    catch { setNotice('Não foi possível guardar o retrato. Tenta novamente.'); setBusy(false) }
  }

  // ── Preview frame (CSS) ──
  const isCracha = frame === 'cracha'
  const frameWrap: React.CSSProperties =
    frame === 'oficial' ? { padding: 10, background: PAGE_GRADIENT, borderRadius: 22 } :
    frame === 'cracha'  ? { padding: '12px 12px 0', background: '#fff', borderRadius: 22 } :
    frame === 'neon'    ? { padding: 4, background: 'rgba(3,110,242,0.15)', border: `2px solid ${TIS_BLUE}`, borderRadius: 20, boxShadow: `0 0 24px rgba(3,110,242,0.7), inset 0 0 18px rgba(3,110,242,0.45)` } :
                          { padding: 0, borderRadius: 20 }

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="relative z-10 px-4 md:px-14 py-4 md:py-6 pb-10">
        <div className="rounded-3xl text-white" style={{ ...glass, background: 'rgba(255,255,255,0.08)', padding: isMobile ? 16 : 32 }}>

          {/* Header */}
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between gap-6'} pb-5 md:pb-6 mb-5 md:mb-6`} style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
            <div className="flex items-start gap-3">
              <button onClick={onBack} title="Voltar" className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/15 transition-all" style={glass}>
                <IconArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="flex items-center gap-2 font-extrabold uppercase leading-tight" style={{ fontSize: isMobile ? 18 : 22, letterSpacing: '0.01em' }}>
                  <IconStudio className="h-6 w-6 shrink-0" />Estúdio de Retrato TIS · Edição &amp; Nano Banana
                </h2>
                <p className="text-[13px] leading-relaxed text-white/70 mt-1" style={{ maxWidth: 560 }}>
                  Ajusta a iluminação, recorta com proteção de enquadramento da cabeça, escolhe a tua moldura TIS ou transforma o teu retrato com o modelo Nano Banana.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1 rounded-full p-1 self-start md:self-auto" style={glass}>
              <button onClick={() => setMode('original')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-all ${mode === 'original' ? 'bg-white text-[#036ef2]' : 'text-white/75 hover:text-white'}`}
              ><IconImage className="h-4 w-4" />Foto original</button>
              <button onClick={() => generated ? setMode('nano') : setNotice('Escolhe um estilo e gera primeiro com Nano Banana.')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-all ${mode === 'nano' ? 'bg-white text-[#036ef2]' : 'text-white/75 hover:text-white'}`}
              ><IconSparkles className="h-4 w-4" />Nano Banana</button>
            </div>
          </div>

          <div className={`flex ${isMobile ? 'flex-col-reverse gap-5' : 'items-start gap-8'}`}>

            {/* ── Left: controls ── */}
            <div className="flex-[1.45] min-w-0 flex flex-col gap-4 md:gap-5">

              {/* Nano Banana */}
              <section className="rounded-2xl" style={{ ...glass, padding: isMobile ? 16 : 20 }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="flex items-center gap-2 text-[13px] font-extrabold uppercase" style={{ letterSpacing: '0.04em' }}><IconSparkles className="h-5 w-5" />Transformação com Nano Banana</p>
                  {!isMobile && <span className="text-xs font-semibold text-white/50">Google Gemini AI</span>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                  {NANO_STYLES.map(s => (
                    <button key={s.id} onClick={() => setStyleId(s.id)} className="text-left rounded-2xl p-3.5 transition-all hover:bg-white/12" style={styleId === s.id ? tileOn : tileOff}>
                      <s.icon className="h-6 w-6 mb-3 text-white" />
                      <p className="text-[13px] font-extrabold leading-tight">{s.title}</p>
                      <p className="text-[11px] text-white/60 mt-0.5">{s.sub}</p>
                    </button>
                  ))}
                </div>
                <button onClick={generate} disabled={generating}
                  className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-80"
                  style={{ background: PAGE_GRADIENT, border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 22px rgba(60,12,178,0.45)' }}
                >
                  {generating
                    ? <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />A gerar…</>
                    : <><IconSparkles className="h-4 w-4" />Gerar com Nano Banana</>}
                </button>
              </section>

              {/* Frames */}
              <section className="rounded-2xl" style={{ ...glass, padding: isMobile ? 16 : 20 }}>
                <p className="text-[13px] font-extrabold uppercase mb-4" style={{ letterSpacing: '0.04em' }}>Estilo da moldura</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {FRAMES.map(f => (
                    <button key={f.id} onClick={() => setFrame(f.id)} className="text-left rounded-full px-4 py-2.5 transition-all hover:bg-white/12" style={frame === f.id ? tileOn : tileOff}>
                      <p className="text-[13px] font-extrabold leading-tight">{f.title}</p>
                      <p className="text-[11px] text-white/60 mt-0.5 truncate">{f.sub}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Adjustments */}
              <section className="rounded-2xl" style={{ ...glass, padding: isMobile ? 16 : 20 }}>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[13px] font-extrabold uppercase" style={{ letterSpacing: '0.04em' }}>Ajustes de luz &amp; enquadramento da cabeça</p>
                  <button onClick={() => setAdj(DEFAULT_ADJ)} className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white/85 hover:bg-white/15 transition-all" style={{ border: '1px solid rgba(255,255,255,0.28)' }}>Repor valores</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                  <Slider icon={IconSun}      label="Brilho"    value={adj.brightness} min={50} max={150} unit="%" onChange={set('brightness')} />
                  <Slider icon={IconContrast} label="Contraste" value={adj.contrast}   min={50} max={150} unit="%" onChange={set('contrast')} />
                  <Slider icon={IconDroplet}  label="Saturação" value={adj.saturation} min={0}  max={200} unit="%" onChange={set('saturation')} />
                  <Slider icon={IconZoom}     label="Zoom / Recorte" value={adj.zoom}  min={100} max={180} unit="%" onChange={set('zoom')} />
                  <div className="md:col-span-2">
                    <Slider icon={IconArrowsV} label="Posição da cabeça / topo" value={adj.offset} min={-60} max={60} unit="px" onChange={set('offset')} />
                    <p className="text-[11px] text-white/55 mt-2">Desliza para baixo se o topo da cabeça estiver muito encostado à borda.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* ── Right: preview + actions ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-4" style={{ position: isMobile ? 'static' : 'sticky', top: 0 }}>
              <div className="rounded-2xl flex items-center justify-center" style={{ ...glass, padding: isMobile ? 14 : 24 }}>
                <div className="w-full" style={{ maxWidth: 400, ...frameWrap }}>
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1 / 1', borderRadius: frame === 'minimal' ? 20 : 14, background: '#140f3a' }}>
                    {(
                      <img src={src} alt="" crossOrigin="anonymous" className="absolute inset-0 h-full w-full object-cover"
                        style={{ filter, transform: `translateY(${adj.offset}px) scale(${adj.zoom / 100})`, transition: 'filter 0.4s ease' }}
                      />
                    )}
                    {nano && <>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: nano.tint, mixBlendMode: nano.blend as React.CSSProperties['mixBlendMode'] }} />
                      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle, rgba(0,0,0,0) 42%, rgba(0,0,0,${nano.vignette}) 100%)` }} />
                    </>}
                    {generating && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(46,27,124,0.7)' }}>
                        <div className="h-9 w-9 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <p className="text-xs font-semibold">A transformar com Nano Banana…</p>
                      </div>
                    )}
                    {!isCracha && <div className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(10,8,40,0), rgba(10,8,40,0.8))' }} />}
                    {frame === 'minimal' && <div className="absolute pointer-events-none" style={{ inset: 14, border: '1px solid rgba(255,255,255,0.55)', borderRadius: 10 }} />}
                    {frame === 'neon' && [['top-3 left-3', 'border-t-2 border-l-2'], ['top-3 right-3', 'border-t-2 border-r-2'], ['bottom-3 left-3', 'border-b-2 border-l-2'], ['bottom-3 right-3', 'border-b-2 border-r-2']].map(([pos, b]) => (
                      <div key={pos} className={`absolute ${pos} ${b} h-7 w-7 pointer-events-none`} style={{ borderColor: TIS_BLUE, filter: `drop-shadow(0 0 6px ${TIS_BLUE})` }} />
                    ))}
                    <img src={tisLogoSvg} alt="TIS" className="absolute left-1/2 -translate-x-1/2 top-6 pointer-events-none" style={{ height: 22, filter: 'brightness(0) invert(1)' }} />
                    {!isCracha && (
                      <div className="absolute inset-x-0 text-center pointer-events-none" style={{ bottom: frame === 'oficial' ? 0 : 26, padding: frame === 'oficial' ? '14px 10px 16px' : '0 10px', background: frame === 'oficial' ? PAGE_GRADIENT : 'none' }}>
                        <p className="text-[15px] font-extrabold leading-tight">{PROFILE.name}</p>
                        <p className="text-[10px] text-white/80 mt-0.5">{PROFILE.role} · {PROFILE.team}</p>
                      </div>
                    )}
                    {frame === 'neon' && <span className="absolute top-3 left-1/2 -translate-x-1/2 mt-8 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase" style={{ color: '#fff', background: 'rgba(3,110,242,0.35)', border: `1px solid ${TIS_BLUE}` }}>ID verificado</span>}
                  </div>
                  {isCracha && (
                    <div className="text-center py-3.5 relative">
                      <span className="absolute -top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white" style={{ background: TIS_BLUE }}>VIP</span>
                      <p className="text-[15px] font-extrabold leading-tight text-[#1e1b4b]">{PROFILE.name}</p>
                      <p className="text-[10px] text-[#1e1b4b]/70 mt-0.5">{PROFILE.role} · {PROFILE.team}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button onClick={download} disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#036ef2] transition-all hover:bg-white/95 active:scale-[0.98] disabled:opacity-60"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,60,0.18)' }}
                ><IconDownload className="h-4 w-4" />Descarregar foto (PNG)</button>
                <button onClick={setAsPortrait} disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-[0.98] disabled:opacity-60"
                  style={glass}
                ><IconUserCheck className="h-4 w-4" />Definir como meu retrato</button>
              </div>
              {notice && <p className="text-xs text-white/70 text-center">{notice}</p>}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
