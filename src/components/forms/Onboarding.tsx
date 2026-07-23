import { useState } from 'react'
import type { FormEvent } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { ModalShell, Field, Gap } from '../ui'

export default function Onboarding() {
  const { user, reloadFamiliesAndPets, toast } = useApp()
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
    await reloadFamiliesAndPets(); toast('¡Listo!')
  }
  return (
    <ModalShell title="¡Bienvenido!" onClose={() => { /* onboarding no se cierra sin crear */ }}>
      <p className="muted">Aún no perteneces a ninguna familia. Crea la tuya para empezar a registrar tus mascotas.</p>
      <form onSubmit={submit}>
        <Field label="Nombre de la familia" name="fam" placeholder="Ej: Familia Paiva" />
        <Field label="Nombre de tu primera mascota" name="pet" placeholder="Ej: Aurora" />
        <Gap h={12} />
        <button className="btn block" disabled={busy}>Crear</button>
      </form>
    </ModalShell>
  )
}
