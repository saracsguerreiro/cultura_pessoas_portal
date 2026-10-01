import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'starting' | 'live' | 'analysing' | 'result' | 'feedback'
type Guess = { name: string; confidence: number }

// Protótipo: a "câmara" mostra uma foto aleatória da galeria e o reconhecimento é simulado
const PHOTOS = Array.from({ length: 48 }, (_, i) => `${import.meta.env.BASE_URL}fotos/${i + 1}_tis.jpg`)
const GALLERY_NAMES = ['Ana Ribeiro', 'João Matos', 'Inês Carvalho', 'Pedro Almeida', 'Rita Fonseca', 'Tiago Moreira', 'Marta Lopes', 'Nuno Teixeira']

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

export default function QuemSouEu({ isMobile }: { isMobile: boolean }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [phase,   setPhase]   = useState<Phase>('idle')
  const [photo,   setPhoto]   = useState('')
  const [guess,   setGuess]   = useState<Guess | null>(null)
  const [answers, setAnswers] = useState<{ right: number; total: number }>({ right: 0, total: 0 })

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
      setGuess({ name: GALLERY_NAMES[Math.floor(Math.random() * GALLERY_NAMES.length)], confidence: 62 + Math.floor(Math.random() * 35) })
      setPhase('result')
    }, 2200)
  }

  function answer(correct: boolean) {
    setAnswers(a => ({ right: a.right + (correct ? 1 : 0), total: a.total + 1 }))
    setPhase('feedback')
  }

  function retry() {
    setGuess(null)
    setPhoto(p => randomPhoto(p))
    setPhase('live')
  }

  const cameraOn = phase !== 'idle' && phase !== 'starting'
  const firstName = guess?.name.split(' ')[0]

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
          <div className="mt-5 md:mt-7 pt-5 md:pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}>
            <p className="text-base font-extrabold text-white mb-1">Pronto para começar?</p>
            <p className="text-sm leading-relaxed text-white/70">A imagem é processada localmente e comparada com a galeria de rostos autorizados da TIS.</p>
            {answers.total > 0 && (
              <p className="mt-4 text-xs text-white/60">
                {answers.total} resposta{answers.total > 1 ? 's' : ''} registada{answers.total > 1 ? 's' : ''} · {Math.round((answers.right / answers.total) * 100)}% de acertos
              </p>
            )}
          </div>
        </div>

        {/* ── Right: camera box ── */}
        <div className={`flex-1 min-w-0 flex justify-center ${isMobile ? 'pb-4' : ''}`}>
          <div className="rounded-3xl"
            style={{ width: isMobile ? '100%' : 'min(100%, calc((100vh - 170px) * 4 / 3 + 40px))', padding: isMobile ? 12 : 20, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.24)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 10px 40px rgba(0,0,70,0.18)' }}
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
                    <span className="absolute rounded-full" style={{ top: -3, right: -5, width: 16, height: 16, background: '#38bdf8', boxShadow: '0 0 10px rgba(56,189,248,0.7)' }} />
                  </div>
                  <p className="text-sm leading-relaxed text-white/75 mb-5" style={{ maxWidth: 300 }}>
                    Posiciona o teu rosto dentro da guia central para máxima nitidez.
                  </p>
                  <button onClick={startCamera} disabled={phase === 'starting'}
                    className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#1e1b4b] transition-all hover:bg-white/95 active:scale-[0.98] disabled:opacity-60"
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
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)', animation: 'typing-cursor 1.4s ease-in-out infinite' }} />
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
                <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
                  <button onClick={analyse} disabled={phase !== 'live'}
                    className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 md:py-3 text-sm font-bold text-[#1e1b4b] transition-all hover:bg-white/95 active:scale-[0.98] disabled:opacity-80"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,60,0.30)' }}
                  >
                    {phase === 'analysing'
                      ? <><div className="h-4 w-4 rounded-full border-2 border-[#1e1b4b]/25 border-t-[#1e1b4b] animate-spin" />A analisar…</>
                      : <><IconFaceScan className="h-5 w-5" />Descobre quem sou</>}
                  </button>
                </div>
              )}

              {/* Result / feedback */}
              {(phase === 'result' || phase === 'feedback') && guess && (
                <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4" style={{ background: 'rgba(20,16,70,0.55)' }}>
                  <div className="w-full rounded-2xl text-center text-white" style={{ maxWidth: 380, padding: isMobile ? '10px 12px' : 26, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
                    {phase === 'result' ? (
                      <>
                        <p className="text-xs font-bold uppercase text-white/60 mb-1 md:mb-2" style={{ letterSpacing: '0.16em' }}>Acho que és…</p>
                        <p className="text-lg md:text-3xl font-extrabold mb-2 md:mb-3">{guess.name}</p>
                        <div className="mx-auto mb-1.5 h-1.5 rounded-full overflow-hidden" style={{ maxWidth: 220, background: 'rgba(255,255,255,0.18)' }}>
                          <div className="h-full rounded-full" style={{ width: `${guess.confidence}%`, background: 'linear-gradient(90deg, #38bdf8, #a78bfa)' }} />
                        </div>
                        <p className="text-xs text-white/65 mb-2.5 md:mb-5">Confiança: {guess.confidence}%</p>
                        <p className="text-xs md:text-sm font-semibold mb-2 md:mb-3">Acertei?</p>
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => answer(true)} className="whitespace-nowrap rounded-full bg-white px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold text-[#3c0cb2] active:scale-95 transition-transform">Sim, sou eu</button>
                          <button onClick={() => answer(false)} className="whitespace-nowrap rounded-full px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold text-white active:scale-95 transition-transform" style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)' }}>Não sou {firstName}</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-lg md:text-xl font-extrabold mb-1 md:mb-2">Obrigada!</p>
                        <p className="text-xs md:text-sm text-white/75 mb-3 md:mb-5">A tua resposta ajuda-nos a afinar o limiar de reconhecimento.</p>
                        <button onClick={retry} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#3c0cb2] active:scale-95 transition-transform">Tentar novamente</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
