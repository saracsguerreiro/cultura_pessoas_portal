import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'starting' | 'live' | 'analysing' | 'result' | 'feedback'
type Person = { name: string; role: string; team: string }

// Protótipo: a "câmara" mostra uma foto aleatória da galeria e o reconhecimento é simulado
const PHOTOS = Array.from({ length: 48 }, (_, i) => `${import.meta.env.BASE_URL}fotos/${i + 1}_tis.jpg`)
const GALLERY: Person[] = [
  { name: 'Sara Cristina Sargento Guerreiro', role: 'Consultor UX / UI',       team: 'Innovation Lab'          },
  { name: 'Ana Paula Ribeiro Domingos',       role: 'Gestora de Projeto',      team: 'PMO'                     },
  { name: 'João Manuel Calunga Matos',        role: 'Engenheiro de Software',  team: 'Laboratório de Inovação' },
  { name: 'Inês Maria Carvalho Neto',         role: 'Técnica de RH',           team: 'Cultura & Pessoas'       },
  { name: 'Pedro António Almeida Sebastião',  role: 'Analista de Dados',       team: 'Data & AI'               },
  { name: 'Rita Isabel Fonseca Kiala',        role: 'Consultora Financeira',   team: 'Finance'                 },
  { name: 'Tiago Miguel Moreira Cassoma',     role: 'Arquiteto Cloud',         team: 'Infraestrutura'          },
]

// Filtro sobre a foto no resultado, com opacidade a 90%
const RESULT_OVERLAY = 'rgba(46,27,124,0.9)'
// Gradiente do fundo da página
const PAGE_GRADIENT = 'linear-gradient(130deg, rgb(130,0,200) 0%, rgb(60,12,178) 45%, rgb(3,110,242) 100%)'

function initials(name: string) {
  const parts = name.split(' ')
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function IconSparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}><path d="M12 2c.4 4.6 2.4 7.6 7.6 8.4l2.4.4-2.4.4C14.4 12 12.4 15 12 22c-.4-7-2.4-10-7.6-10.8L2 10.8l2.4-.4C9.6 9.6 11.6 6.6 12 2z" /></svg>
}
function IconStudio({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="5" width="15" height="15" rx="2" /><circle cx="8" cy="10" r="1.5" /><path d="M18 15l-4-4-8 9" /><path d="M20 2v4M18 4h4" /></svg>
}
function IconCheck({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
}

function randomPhoto(except?: string) {
  let p = PHOTOS[Math.floor(Math.random() * PHOTOS.length)]
  while (p === except) p = PHOTOS[Math.floor(Math.random() * PHOTOS.length)]
  return p
}

function IconCamera({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.5" /></svg>
}

export function IconFaceScan({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" /><circle cx="9" cy="10" r=".6" fill="currentColor" /><circle cx="15" cy="10" r=".6" fill="currentColor" /><path d="M9 15.5c.8.7 1.8 1 3 1s2.2-.3 3-1" /></svg>
}

export default function QuemSouEu({ isMobile, onOpenStudio }: { isMobile: boolean; onOpenStudio: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [phase,   setPhase]   = useState<Phase>('idle')
  const [photo,   setPhoto]   = useState('')
  const [guess,   setGuess]   = useState<Person | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function later(fn: () => void, ms: number) {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(fn, ms)
  }

  function startCamera() {
    setPhoto(randomPhoto())
    setPhase('starting')
    later(() => setPhase('live'), 700)
  }

  function turnOff() {
    if (timer.current) clearTimeout(timer.current)
    setGuess(null); setPhase('idle')
  }

  function analyse() {
    setPhase('analysing')
    later(() => {
      setGuess(GALLERY[Math.floor(Math.random() * GALLERY.length)])
      setPhase('result')
    }, 2200)
  }

  function answer() {
    setPhase('feedback')
  }

  function retry() {
    setGuess(null)
    setPhoto(p => randomPhoto(p))
    setPhase('live')
  }

  const cameraOn = phase !== 'idle' && phase !== 'starting'

  const resultCard = guess && (
    <div className="w-full rounded-3xl text-white" style={{ maxWidth: 620, padding: isMobile ? 16 : 22, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.26)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 10px 40px rgba(0,0,70,0.25)' }}>
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="shrink-0 flex items-center justify-center rounded-full font-bold"
          style={{ width: isMobile ? 60 : 76, height: isMobile ? 60 : 76, fontSize: isMobile ? 18 : 22, background: 'rgba(255,255,255,0.14)', border: '3px solid #036ef2', boxShadow: '0 0 18px rgba(3,110,242,0.55)' }}
        >
          {initials(guess.name)}
        </div>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] md:text-[11px] font-semibold text-[#036ef2] mb-1.5"
            style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(3,110,242,0.45)', boxShadow: '0 0 12px rgba(3,110,242,0.45)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#036ef2]" style={{ boxShadow: '0 0 6px rgba(3,110,242,0.9)' }} />Colaborador TIS Reconhecido
          </span>
          <p className="font-extrabold leading-tight" style={{ fontSize: isMobile ? 19 : 24, letterSpacing: '-0.01em' }}>{guess.name}</p>
          <p className="text-xs md:text-sm text-white/70 mt-0.5">{guess.role} · {guess.team}</p>
        </div>
      </div>

      {/* Team badge */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <IconSparkle className="h-5 w-5 shrink-0 text-[#036ef2]" style={{ filter: 'drop-shadow(0 0 6px rgba(3,110,242,0.8))' }} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] md:text-xs"><span className="font-bold uppercase text-[#036ef2]" style={{ letterSpacing: '0.04em', textShadow: '0 0 6px rgba(3,110,242,0.45)' }}>{guess.team}</span><span className="text-white/50"> · Membro Oficial</span></p>
          <p className="text-[11px] md:text-xs font-medium text-white/85">Juntos Somos TIS — É um orgulho ter-te na nossa equipa!</p>
        </div>
        {!isMobile && <span className="shrink-0 text-xs font-bold italic text-[#036ef2]" style={{ textShadow: '0 0 6px rgba(3,110,242,0.45)' }}>#SomosTIS</span>}
      </div>

      {/* Feedback */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.14)' }}>
        <p className="text-sm font-semibold text-white/85 mb-2.5">Acertei?</p>
        {phase === 'result' ? (
          <div className="flex flex-wrap gap-2">
            <button onClick={answer} className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-bold text-[#036ef2] active:scale-95 transition-transform">
              <IconCheck className="h-4 w-4" />Acertaste
            </button>
            <button onClick={answer} className="rounded-full px-5 py-2 text-sm font-bold text-white active:scale-95 transition-all hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.30)' }}>
              Não era eu
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-white/75">Obrigada! A tua resposta ajuda-nos a afinar o limiar.</p>
            <button onClick={retry} className="rounded-full px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/20" style={{ border: '1px solid rgba(255,255,255,0.30)' }}>Tentar novamente</button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 flex justify-start" style={{ borderTop: '1px solid rgba(255,255,255,0.14)' }}>
        <button onClick={onOpenStudio}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase text-white transition-transform active:scale-95"
          style={{ letterSpacing: '0.04em', background: PAGE_GRADIENT, border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 22px rgba(60,12,178,0.45)' }}
        >
          <IconStudio className="h-4 w-4" />Abrir estúdio em «A minha foto»
        </button>
      </div>
    </div>
  )

  return (
    <div className="relative h-full overflow-y-auto">
      <div className={`relative z-10 ${isMobile ? 'min-h-full flex-col gap-5' : 'h-full items-center gap-14'} flex px-4 md:px-14 py-4 md:py-6`}>

        {/* ── Left: title, intro, ready text ── */}
        <div className="shrink-0 text-white" style={{ width: isMobile ? '100%' : 'clamp(300px, 32vw, 460px)' }}>
          <p className="text-xs font-bold text-white/60 uppercase mb-1" style={{ letterSpacing: '0.16em' }}>Experimenta</p>
          <h2 className="font-extrabold text-white mb-3 md:mb-4 leading-none" style={{ fontSize: isMobile ? 31 : 47, letterSpacing: '-0.02em' }}>Quem sou eu?</h2>
          <p className="text-sm md:text-[15px] leading-relaxed text-white/80">
            Olha para a câmara e deixa a assistente adivinhar. Depois diz-lhe se acertou. Cada resposta ensina-nos onde o limiar deve ficar antes de o abrirmos a eventos e totens.
          </p>
          <div className="mt-8 md:mt-16">
            <p className="text-base font-extrabold text-white mb-1">Pronto para começar?</p>
            <p className="text-sm leading-relaxed text-white/70">A imagem é processada localmente e comparada com a galeria de rostos autorizados da TIS.</p>
          </div>
        </div>

        {/* ── Right: camera box ── */}
        <div className={`flex-1 min-w-0 flex justify-center ${isMobile ? 'pb-4' : ''}`}>
          <div className="rounded-3xl"
            style={{ width: isMobile ? '100%' : 'min(80.5%, calc(((100vh - 170px) * 4 / 3 + 40px) * 0.805))', padding: isMobile ? 12 : 20, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.24)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 10px 40px rgba(0,0,70,0.18)' }}
          >
            <div className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: '4 / 3', background: 'linear-gradient(135deg, #2b1460 0%, #1d1a5c 50%, #142454 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
            >
              {/* subtle diagonal sheen */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 22px)' }} />

              {photo && (
                <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: 'center 4%', opacity: cameraOn ? 1 : 0, transition: 'opacity 0.45s ease' }}
                />
              )}

              {/* Idle / starting */}
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div className="relative mb-5">
                    <div className="flex items-center justify-center rounded-full"
                      style={{ width: isMobile ? 68 : 80, height: isMobile ? 68 : 80, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.28)' }}
                    >
                      {phase === 'starting'
                        ? <div className="h-7 w-7 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <IconCamera className="h-9 w-9 text-white" />}
                    </div>
                    <span className="absolute rounded-full" style={{ top: -3, right: -5, width: 16, height: 16, background: '#036ef2', boxShadow: '0 0 10px rgba(3,110,242,0.75)' }} />
                  </div>
                  <p className="text-sm leading-relaxed text-white/75 mb-5" style={{ maxWidth: 300 }}>
                    Posiciona o teu rosto dentro da guia central para máxima nitidez.
                  </p>
                  <button onClick={startCamera} disabled={phase === 'starting'}
                    className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#036ef2] transition-all hover:bg-white/95 active:scale-[0.98] disabled:opacity-60"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,60,0.25)' }}
                  >
                    <IconCamera className="h-5 w-5" />{phase === 'starting' ? 'A ligar…' : 'Ligar câmara'}
                  </button>
                </div>
              )}

              {/* Camera on: metric pill, close, face guide */}
              {cameraOn && (
                <>
                  <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none">
                    <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase text-white"
                      style={{ letterSpacing: '0.08em', background: 'rgba(20,16,70,0.55)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#036ef2]" style={{ boxShadow: '0 0 6px rgba(3,110,242,0.9)', animation: 'typing-cursor 1.4s ease-in-out infinite' }} />
                      Mira métrica activa
                    </span>
                  </div>
                  <button onClick={turnOff} title="Desligar câmara"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all text-sm"
                    style={{ background: 'rgba(20,16,70,0.55)', border: '1px solid rgba(255,255,255,0.25)' }}
                  >✕</button>
                </>
              )}

              {(phase === 'live' || phase === 'analysing') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '6%' }}>
                  <div className="relative overflow-hidden" style={{ width: '34%', aspectRatio: '3 / 4', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.75)', boxShadow: '0 0 0 9999px rgba(20,16,70,0.32)' }}>
                    {phase === 'analysing' && (
                      <div className="absolute left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)', boxShadow: '0 0 14px #38bdf8', animation: 'face-scan 1.4s ease-in-out infinite' }} />
                    )}
                  </div>
                </div>
              )}

              {(phase === 'live' || phase === 'analysing') && (
                <div className="absolute bottom-3 md:bottom-4 left-0 right-0 flex justify-center">
                  <button onClick={analyse} disabled={phase !== 'live'}
                    className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 md:py-3 text-sm font-bold text-[#036ef2] transition-all hover:bg-white/95 active:scale-[0.98] disabled:opacity-80"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,60,0.30)' }}
                  >
                    {phase === 'analysing'
                      ? <><div className="h-4 w-4 rounded-full border-2 border-[#036ef2]/25 border-t-[#036ef2] animate-spin" />A analisar…</>
                      : <><IconFaceScan className="h-5 w-5" />Descobre quem sou</>}
                  </button>
                </div>
              )}

              {/* Result: home gradient over the photo (+ card on desktop) */}
              {(phase === 'result' || phase === 'feedback') && guess && (
                <div className="absolute inset-0 overflow-y-auto flex justify-center p-3 md:p-5" style={{ background: RESULT_OVERLAY, alignItems: 'safe center' }}>
                  {!isMobile && resultCard}
                </div>
              )}
            </div>
            {isMobile && (phase === 'result' || phase === 'feedback') && <div className="mt-3">{resultCard}</div>}
          </div>
        </div>

      </div>
    </div>
  )
}
