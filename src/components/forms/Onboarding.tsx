import { useState } from 'react'
import type { FormEvent } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { PawLogo, Field, Gap } from '../ui'

const SLIDES = [
  {
    art: (
      <svg viewBox="0 0 64 64" width="72" height="72" fill="none" style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.18))' }}>
        <path d="M32 12c-9.6 0-15.2 7.4-15.2 18.4 0 5.4-1.7 9-3.8 11.7-1.7 2.1-.2 4.9 2.5 4.9h33c2.7 0 4.2-2.8 2.5-4.9-2.1-2.7-3.8-6.3-3.8-11.7C47.2 19.4 41.6 12 32 12Z" fill="#fff" />
        <circle cx="32" cy="11.5" r="6.2" fill="#fff" />
        <path d="M27.3 46h9.4v6.8c0 2.6-2.1 4.7-4.7 4.7s-4.7-2.1-4.7-4.7V46Z" fill="#FF8484" />
      </svg>
    ),
    h: 'Bienvenido a Pavlovapp',
    p: 'La ficha, la salud y el entrenamiento de tu compañero, en un solo lugar.',
  },
  {
    art: (
      <svg viewBox="0 0 120 90" width="140" height="105">
        <circle cx="60" cy="45" r="40" fill="rgba(255,255,255,.14)" />
        <path d="M40 40a20 20 0 0 1 40 0c0 20-10 24-10 24H50s-10-4-10-24Z" fill="#fff" />
        <path d="M56 62h8v6a4 4 0 0 1-8 0Z" fill="#FF8484" />
        <path d="M60 24v-8M40 34l-6-5M80 34l6-5" stroke="#FFC24B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    h: 'Buenos hábitos, paso a paso',
    p: 'Un plan por fases con refuerzo positivo. Sin apuros, sin castigo.',
  },
  {
    art: (
      <svg viewBox="0 0 120 90" width="140" height="105">
        <circle cx="34" cy="48" r="15" fill="rgba(255,255,255,.18)" />
        <circle cx="60" cy="38" r="16" fill="rgba(255,255,255,.28)" />
        <circle cx="86" cy="48" r="15" fill="rgba(255,255,255,.18)" />
        <g fill="#fff">
          <circle cx="34" cy="44" r="4" /><path d="M28 56c0-4 3-6 6-6s6 2 6 6Z" />
          <circle cx="86" cy="44" r="4" /><path d="M80 56c0-4 3-6 6-6s6 2 6 6Z" />
        </g>
        <g fill="#FF8484"><path d="M56 40h8c0 20-4 20-4 20s-4 0-4-20Z" opacity=".9" /></g>
        <path d="M54 34a6 6 0 0 1 12 0c0 6-6 8-6 8s-6-2-6-8Z" fill="#fff" />
      </svg>
    ),
    h: 'Toda la familia, al día',
    p: 'Invita a quien cuida a tu mascota. Todos ven y registran lo mismo.',
  },
]

export default function Onboarding() {
  const { user, reloadFamiliesAndPets, toast } = useApp()
  const [step, setStep] = useState(0) // 0,1,2 = intro; 3 = formulario
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const fname = String(fd.get('fam') || '').trim()
    const pname = String(fd.get('pet') || '').trim()
    if (!fname || !pname) { toast('Completa ambos campos'); return }
    setBusy(true)
    const { data: fam, error: e1 } = await sb.from('families').insert({ name: fname }).select().single()
    if (e1) { toast('Error: ' + e1.message); setBusy(false); return }
    await sb.from('family_members').insert({ family_id: fam!.id, user_id: user!.id, email: user!.email, role: 'owner', joined_at: new Date().toISOString() })
    await sb.from('pets').insert({ family_id: fam!.id, name: pname })
    await reloadFamiliesAndPets()
    toast('¡Listo!')
  }

  if (step < 3) {
    const s = SLIDES[step]
    const last = step === 2
    return (
      <div className="ob">
        <div className="ob-slide">
          {s.art}
          <h2>{s.h}</h2>
          <p>{s.p}</p>
        </div>
        <div className="ob-foot">
          <div className="ob-dots">
            {SLIDES.map((_, i) => <i key={i} className={i === step ? 'on' : ''} />)}
          </div>
          <button className="btn light" onClick={() => setStep(last ? 3 : step + 1)}>
            {last ? 'Crear mi familia' : 'Siguiente'}
          </button>
          {!last && <button className="skip" onClick={() => setStep(3)}>Saltar</button>}
        </div>
      </div>
    )
  }

  return (
    <div className="ob">
      <div className="ob-slide">
        <div className="ob-card">
          <div className="brand" style={{ marginBottom: 10 }}>
            <div className="paw" style={{ width: 40, height: 40 }}><PawLogo /></div>
            <h3 style={{ margin: 0 }}>Empecemos</h3>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>Crea tu familia y tu primera mascota para arrancar.</p>
          <form onSubmit={submit}>
            <Field label="Nombre de la familia" name="fam" placeholder="Ej: Familia Paiva" />
            <Field label="Nombre de tu primera mascota" name="pet" placeholder="Ej: Aurora" />
            <Gap h={14} />
            <button className="btn block" disabled={busy}>Crear</button>
          </form>
        </div>
      </div>
    </div>
  )
}
