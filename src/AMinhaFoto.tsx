import { useRef, useState } from 'react'
import { IconFaceScan } from '@/QuemSouEu'

// Perfil de demonstração
export const PROFILE = {
  name:  'Sara Cristina Sargento Guerreiro',
  role:  'Consultor UX / UI',
  team:  'Innovation Lab',
  photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=640&h=640&fit=crop&crop=faces&auto=format&q=80',
}

// Gradiente do fundo da página
const PAGE_GRADIENT = 'linear-gradient(130deg, rgb(130,0,200) 0%, rgb(60,12,178) 45%, rgb(3,110,242) 100%)'

function IconCamera({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.5" /></svg>
}
function IconUpload({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></svg>
}
function IconTrash({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
}
function IconShield({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z" /><path d="M8.8 12.2l2.2 2.2 4.2-4.4" /></svg>
}
function IconCheck({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
}
function IconStudio({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="5" width="15" height="15" rx="2" /><circle cx="8" cy="10" r="1.5" /><path d="M18 15l-4-4-8 9" /><path d="M20 2v4M18 4h4" /></svg>
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className="relative shrink-0 rounded-full transition-colors duration-200"
      style={{ width: 50, height: 28, background: on ? '#036ef2' : 'rgba(255,255,255,0.22)', boxShadow: on ? '0 0 12px rgba(3,110,242,0.55)' : 'none' }}
    >
      <span className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-200" style={{ left: on ? 26 : 4, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
    </button>
  )
}

const glass = { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.24)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' } as const

export default function AMinhaFoto({ isMobile, photo, onPhotoChange, onRetake, onOpenStudio }: { isMobile: boolean; photo: string | null; onPhotoChange: (url: string | null) => void; onRetake: () => void; onOpenStudio: () => void }) {
  const uploadRef  = useRef<HTMLInputElement>(null)
  const [showPortal, setShowPortal] = useState(true)
  const [recognise,  setRecognise]  = useState(true)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onPhotoChange(URL.createObjectURL(file))
    e.target.value = ''
  }

  const initials = PROFILE.name.split(' ')[0][0] + PROFILE.name.split(' ').slice(-1)[0][0]
  const avatar = isMobile ? 253 : 340

  const permissions = [
    {
      icon: IconShield, title: 'Mostrar a minha foto no portal', on: showPortal, set: setShowPortal,
      body: 'A tua foto aparece ao lado do teu nome no portal, no organigrama e quando a assistente falar de ti para colegas da TIS. Não sai da TIS.',
      note: 'Sem esta autorização a foto não é guardada.', italic: false,
    },
    {
      icon: IconFaceScan, title: 'Reconhecer-me em eventos da TIS', on: recognise, set: setRecognise,
      body: 'Autorizas que da tua foto seja criado um código matemático que permite reconhecer-te em totens e eventos internos — para te dar as boas-vindas pelo nome. É um dado biométrico e podes retirar esta autorização a qualquer momento, sem perderes a foto.',
      note: 'Nunca será usado para controlo de assiduidade ou de ponto.', italic: true,
    },
  ]

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="relative z-10 px-4 md:px-14 py-4 md:py-6 pb-10">

        {/* Page header */}
        <div className="text-white mb-8 md:mb-10" style={{ maxWidth: 680 }}>
          <p className="text-xs font-bold text-white/60 uppercase mb-1" style={{ letterSpacing: '0.16em' }}>O meu perfil</p>
          <h2 className="font-extrabold text-white mb-3 md:mb-4 leading-none" style={{ fontSize: isMobile ? 31 : 47, letterSpacing: '-0.02em' }}>A Minha Foto</h2>
          <p className="text-sm md:text-[15px] leading-relaxed text-white/80">
            A tua foto passa a aparecer no portal e no organigrama, ao lado do teu nome. Só tu a podes mudar ou apagar. Podes ainda personalizá-la no Estúdio TIS com molduras e inteligência artificial.
          </p>
        </div>

        <div className={`flex ${isMobile ? 'flex-col gap-8' : 'items-start gap-14'}`}>

          {/* ── Left: photo + identity + actions ── */}
          <div className="shrink-0 flex flex-col items-center text-center text-white" style={{ width: isMobile ? '100%' : 356 }}>
            <div className="relative mb-6" style={{ width: avatar, height: avatar }}>
              <div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center"
                style={{ border: '4px solid rgba(255,255,255,0.35)', boxShadow: '0 12px 40px rgba(0,0,70,0.35)', background: 'rgba(255,255,255,0.12)' }}
              >
                {photo
                  ? <img src={photo} alt={PROFILE.name} className="h-full w-full object-cover" />
                  : <span className="font-bold text-white/80" style={{ fontSize: avatar / 3.6 }}>{initials}</span>}
              </div>
              {photo && (
                <span className="absolute flex items-center justify-center rounded-full bg-[#036ef2]"
                  style={{ width: 40, height: 40, right: avatar * 0.04, bottom: avatar * 0.06, border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 14px rgba(0,0,60,0.3)' }}
                >
                  <IconCheck className="h-5 w-5 text-white" />
                </span>
              )}
            </div>

            <p className="text-lg font-extrabold leading-tight">{PROFILE.name}</p>
            <p className="text-sm text-white/80 mt-1">{PROFILE.role}</p>
            <p className="text-xs text-white/55 mt-0.5">{PROFILE.team}</p>

            <div className="flex gap-2.5 mt-6">
              <button onClick={onRetake}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#036ef2] transition-all hover:bg-white/95 active:scale-[0.98]"
                style={{ boxShadow: '0 4px 20px rgba(0,0,60,0.18)' }}
              >
                <IconCamera className="h-4 w-4" />Tirar outra
              </button>
              <button onClick={() => uploadRef.current?.click()}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
                style={glass}
              >
                <IconUpload className="h-4 w-4" />Carregar
              </button>
            </div>
            <input ref={uploadRef}  type="file" accept="image/*" className="hidden" onChange={onFile} />

          </div>

          {/* ── Right: permissions ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {permissions.map(p => (
              <div key={p.title} className="flex items-start gap-4 rounded-2xl text-white" style={{ ...glass, padding: isMobile ? 16 : 24 }}>
                <div className="shrink-0 flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)' }}>
                  <p.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-extrabold mb-1.5">{p.title}</p>
                  <p className="text-[13px] leading-relaxed text-white/80">{p.body}</p>
                  <p className={`text-xs text-white/55 mt-2.5 ${p.italic ? 'italic' : ''}`}>{p.note}</p>
                </div>
                <Toggle on={p.on} onChange={p.set} label={p.title} />
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => onPhotoChange(null)} disabled={!photo}
                className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white/90 transition-all hover:bg-white/20 disabled:opacity-40"
                style={glass}
              >
                <IconTrash className="h-4 w-4" />Remover a minha foto
              </button>
              <button onClick={onOpenStudio}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase text-white transition-transform active:scale-95"
                style={{ letterSpacing: '0.04em', background: PAGE_GRADIENT, border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 22px rgba(60,12,178,0.45)' }}
              >
                <IconStudio className="h-4 w-4" />Abrir estúdio TIS &amp; Nano Banana
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
