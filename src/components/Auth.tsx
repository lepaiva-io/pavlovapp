import { useState } from 'react'
import { sb } from '../lib/supabase'
import { PawLogo } from './ui'

export default function Auth() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  const sendLink = async () => {
    const e = email.trim()
    if (!e) { setMsg({ t: 'Escribe tu correo.', ok: false }); return }
    setBusy(true); setMsg({ t: 'Enviando…', ok: true })
    const { error } = await sb.auth.signInWithOtp({
      email: e,
      options: { emailRedirectTo: window.location.href.split('#')[0] },
    })
    setBusy(false)
    if (error) { setMsg({ t: error.message, ok: false }); return }
    setStep('code')
    setMsg({ t: 'Te enviamos el acceso a ' + e + '.', ok: true })
  }

  const verifyCode = async () => {
    const token = otp.trim()
    if (!token) { setMsg({ t: 'Escribe el código, o usa el enlace del correo.', ok: false }); return }
    setBusy(true); setMsg({ t: 'Verificando…', ok: true })
    const { error } = await sb.auth.verifyOtp({ email: email.trim(), token, type: 'email' })
    setBusy(false)
    if (error) { setMsg({ t: error.message + ' (si tu correo no trae código, usa el enlace).', ok: false }); return }
    // onAuthStateChange se encarga del resto
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          <div className="paw"><PawLogo /></div>
          <h1>Pavlovapp</h1>
        </div>
        <p className="muted">Ficha, historial médico y plan de entrenamiento de tus mascotas. Ingresa con tu correo y te enviamos un enlace mágico.</p>

        {step === 'email' && (
          <div>
            <label>Tu correo</label>
            <input type="email" inputMode="email" autoComplete="email" placeholder="tucorreo@ejemplo.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <div style={{ height: 10 }} />
            <button className="btn block" disabled={busy} onClick={sendLink}>Enviar enlace de acceso</button>
          </div>
        )}

        {step === 'code' && (
          <div>
            <p className="muted">Revisa tu correo. Puedes hacer clic en el enlace, o si el correo trae un <b>código</b>, escríbelo aquí:</p>
            <label>Código de 6 dígitos (opcional)</label>
            <input inputMode="numeric" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <div style={{ height: 10 }} />
            <button className="btn block" disabled={busy} onClick={verifyCode}>Verificar código</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost block" onClick={() => { setStep('email'); setMsg(null) }}>Usar otro correo</button>
          </div>
        )}

        {msg && <div className={'msg ' + (msg.ok ? 'ok' : 'err')}>{msg.t}</div>}
      </div>
    </div>
  )
}
