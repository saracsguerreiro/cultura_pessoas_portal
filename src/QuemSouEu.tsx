import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'starting' | 'live' | 'analysing' | 'result' | 'feedback' | 'error'
type Guess = { name: string; confidence: number }

// Nomes da galeria de demonstração — o reconhecimento é simulado neste protótipo
const GALLERY_NAMES = ['Ana Ribeiro', 'João Matos', 'Inês Carvalho', 'Pedro Almeida', 'Rita Fonseca', 'Tiago Moreira']

function IconCamera({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.5" /></svg>
}

export function IconFaceScan({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" /><circle cx="9" cy="10" r=".6" fill="currentColor" /><circle cx="15" cy="10" r=".6" fill="currentColor" /><path d="M9 15.5c.8.7 1.8 1 3 1s2.2-.3 3-1" /></svg>
}

export default function QuemSouEu({ userName, isMobile }: { userName: string; isMobile: boolean }) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [phase,   setPhase]   = useState<Phase>('idle')
  const [guess,   setGuess]   = useState<Guess | null>(null)
  const [errMsg,  setErrMsg]  = useState('')
  const [answers, setAnswers] = useState<{ right: number; total: number }>({ right: 0, total: 0 })

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => stopCamera, [])

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrMsg('Este navegador não permite aceder à câmara.'); setPhase('error'); return
    }
    setPhase('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      setPhase('live')
    } catch {
      setErrMsg('Não foi possível ligar a câmara. Verifica as permissões do navegador e tenta novamente.')
      setPhase('error')
    }
  }

  function turnOff() {
    stopCamera(); setGuess(null); setPhase('idle')
  }

  function analyse() {
    videoRef.current?.pause()
    setPhase('analysing')
    setTimeout(() => {
      const isUser = Math.random() < 0.75
      const name = isUser ? userName : GALLERY_NAMES[Math.floor(Math.random() * GALLERY_NAMES.length)]
      const confidence = isUser ? 78 + Math.floor(Math.random() * 19) : 52 + Math.floor(Math.random() * 20)
      setGuess({ name, confidence })
      setPhase('result')
    }, 2200)
  }

  function answer(correct: boolean) {
    setAnswers(a => ({ right: a.right + (correct ? 1 : 0), total: a.total + 1 }))
    setPhase('feedback')
  }

  function retry() {
    setGuess(null)
    videoRef.current?.play()
    setPhase('live')
  }

  const cameraOn = phase === 'live' || phase === 'analysing' || phase === 'result' || phase === 'feedback'
  const firstName = guess?.name.split(' ')[0]

  return (
    <div className="relative h-full overflow-y-auto">
      <div className={`relative z-10 ${isMobile ? 'min-h-full' : 'h-full'} px-4 md:px-14 py-4 md:py-5 flex flex-col gap-5 md:gap-8`}>

        {/* Page header */}
        <div className="shrink-0 text-white">
          <p className="text-xs font-bold text-white/60 uppercase mb-1" style={{ letterSpacing: '0.16em' }}>Experimenta</p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-3" style={{ letterSpacing: '-0.02em' }}>Quem sou eu?</h2>
          <p className="text-sm md:text-[15px] leading-relaxed text-white/80" style={{ maxWidth: 680 }}>
            Olha para a câmara e deixa a assistente adivinhar. Depois diz-lhe se acertou — cada resposta ensina-nos onde o limiar deve ficar antes de o abrirmos a eventos e totens.
          </p>
        </div>

        {/* Camera card */}
        <div className="flex-1 min-h-0 flex justify-center pb-4 md:pb-6">
          <div className="w-full flex flex-col rounded-3xl"
            style={{ maxWidth: isMobile ? 768 : 'min(768px, calc((100vh - 360px) * 4 / 3 + 56px))', padding: isMobile ? 14 : 28, gap: isMobile ? 14 : 20, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.24)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 10px 40px rgba(0,0,70,0.18)' }}
          >
            {/* Viewport */}
            <div className={`relative w-full overflow-hidden rounded-2xl ${isMobile ? '' : 'flex-1 min-h-[260px]'}`}
              style={{ aspectRatio: isMobile ? '4 / 3' : undefined, background: 'linear-gradient(135deg, #2b1460 0%, #1d1a5c 50%, #142454 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
            >
              {/* subtle diagonal sheen */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 22px)' }} />

              <video ref={videoRef} playsInline muted
                className="absolute inset-0 h-full w-full object-cover"
                style={{ transform: 'scaleX(-1)', opacity: cameraOn ? 1 : 0, transition: 'opacity 0.4s ease' }}
              />

              {/* Idle / starting / error */}
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div className="relative mb-5">
                    <div className="flex items-center justify-center rounded-full"
                      style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.28)' }}
                    >
                      {phase === 'starting'
                        ? <div className="h-7 w-7 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <IconCamera className="h-9 w-9 text-white" />}
                    </div>
                    <span className="absolute rounded-full" style={{ top: -3, right: -5, width: 16, height: 16, background: phase === 'error' ? '#f87171' : '#38bdf8', boxShadow: `0 0 10px ${phase === 'error' ? 'rgba(248,113,113,0.7)' : 'rgba(56,189,248,0.7)'}` }} />
                  </div>
                  <p className="text-base font-extrabold text-white mb-1.5">
                    {phase === 'error' ? 'Câmara indisponível' : phase === 'starting' ? 'A ligar a câmara…' : 'Pronto para começar?'}
                  </p>
                  <p className="text-xs leading-relaxed text-white/70" style={{ maxWidth: 360 }}>
                    {phase === 'error' ? errMsg : 'A imagem é processada localmente e comparada com a galeria de rostos autorizados da TIS.'}
                  </p>
                </div>
              )}

              {/* Face guide */}
              {(phase === 'live' || phase === 'analysing') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative overflow-hidden" style={{ width: '38%', aspectRatio: '3 / 4', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.65)', boxShadow: '0 0 0 9999px rgba(20,16,70,0.38)' }}>
                    {phase === 'analysing' && (
                      <div className="absolute left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)', boxShadow: '0 0 14px #38bdf8', animation: 'face-scan 1.4s ease-in-out infinite' }} />
                    )}
                  </div>
                </div>
              )}

              {phase === 'analysing' && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <span className="rounded-full px-4 py-1.5 text-xs font-semibold text-white" style={{ background: 'rgba(20,16,70,0.65)', border: '1px solid rgba(255,255,255,0.22)' }}>A analisar…</span>
                </div>
              )}

              {/* Result / feedback */}
              {(phase === 'result' || phase === 'feedback') && guess && (
                <div className="absolute inset-0 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(20,16,70,0.55)' }}>
                  <div className="w-full rounded-2xl text-center text-white" style={{ maxWidth: 380, padding: isMobile ? 18 : 26, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
                    {phase === 'result' ? (
                      <>
                        <p className="text-xs font-bold uppercase text-white/60 mb-2" style={{ letterSpacing: '0.16em' }}>Acho que és…</p>
                        <p className="text-2xl md:text-3xl font-extrabold mb-3">{guess.name}</p>
                        <div className="mx-auto mb-1.5 h-1.5 rounded-full overflow-hidden" style={{ maxWidth: 220, background: 'rgba(255,255,255,0.18)' }}>
                          <div className="h-full rounded-full" style={{ width: `${guess.confidence}%`, background: 'linear-gradient(90deg, #38bdf8, #a78bfa)' }} />
                        </div>
                        <p className="text-xs text-white/65 mb-5">Confiança: {guess.confidence}%</p>
                        <p className="text-sm font-semibold mb-3">Acertei?</p>
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => answer(true)} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#3c0cb2] active:scale-95 transition-transform">Sim, sou eu</button>
                          <button onClick={() => answer(false)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white active:scale-95 transition-transform" style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)' }}>Não sou {firstName}</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xl font-extrabold mb-2">Obrigada!</p>
                        <p className="text-sm text-white/75 mb-5">A tua resposta ajuda-nos a afinar o limiar de reconhecimento.</p>
                        <button onClick={retry} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#3c0cb2] active:scale-95 transition-transform">Tentar novamente</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!cameraOn ? (
                  <button onClick={startCamera} disabled={phase === 'starting'}
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1e1b4b] transition-all hover:bg-white/95 active:scale-[0.98] disabled:opacity-60"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,60,0.18)' }}
                  >
                    <IconCamera className="h-5 w-5" />{phase === 'error' ? 'Tentar novamente' : 'Ligar câmara'}
                  </button>
                ) : (
                  <>
                    <button onClick={analyse} disabled={phase !== 'live'}
                      className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1e1b4b] transition-all hover:bg-white/95 active:scale-[0.98] disabled:opacity-50"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,60,0.18)' }}
                    >
                      <IconFaceScan className="h-5 w-5" />Adivinha quem sou
                    </button>
                    <button onClick={turnOff}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-white/85 transition-all hover:bg-white/15"
                      style={{ border: '1px solid rgba(255,255,255,0.28)' }}
                    >
                      Desligar
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed text-white/60 md:text-right" style={{ maxWidth: 320 }}>
                {answers.total > 0
                  ? `${answers.total} resposta${answers.total > 1 ? 's' : ''} registada${answers.total > 1 ? 's' : ''} · ${Math.round((answers.right / answers.total) * 100)}% de acertos`
                  : 'Posiciona o teu rosto dentro da guia central para máxima nitidez.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
