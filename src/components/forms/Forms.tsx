import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { CAT } from '../../lib/constants'
import { todayISO } from '../../lib/helpers'
import type { Pet, MedicalRecord, DailyLog, Reminder, Contact, Member } from '../../lib/types'
import { FullScreen, Field, Area, SelectF, Gap } from '../ui'

const val = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim()
const orNull = (s: string) => (s === '' ? null : s)

// ---------- FICHA / MASCOTA ----------
export function PetForm({ pet }: { pet?: Pet }) {
  const { family, closeModal, reloadPets, toast } = useApp()
  const isNew = !pet
  const p = pet || ({} as Partial<Pet>)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const name = val(fd, 'name')
    if (!name) { toast('Falta el nombre'); return }
    const tw = val(fd, 'target_weight_kg')
    const row = {
      family_id: family!.id, name, species: val(fd, 'species'),
      breed: orNull(val(fd, 'breed')), sex: orNull(val(fd, 'sex')),
      birthdate_approx: orNull(val(fd, 'birthdate_approx')), adoption_date: orNull(val(fd, 'adoption_date')),
      microchip: orNull(val(fd, 'microchip')), clinic_name: orNull(val(fd, 'clinic_name')),
      status: val(fd, 'status'), sterilized: val(fd, 'sterilized') === 'true',
      target_weight_kg: tw === '' ? null : Number(tw),
      photo_url: orNull(val(fd, 'photo_url')), notes: orNull(val(fd, 'notes')),
    }
    setBusy(true)
    const res = isNew
      ? await sb.from('pets').insert(row).select().single()
      : await sb.from('pets').update(row).eq('id', pet!.id).select().single()
    if (res.error) { toast('Error: ' + res.error.message); setBusy(false); return }
    closeModal(); await reloadPets(res.data!.id); toast('Guardado')
  }

  const del = async () => {
    if (!confirm('¿Eliminar a ' + p.name + ' y todos sus registros?')) return
    await sb.from('pets').delete().eq('id', pet!.id)
    closeModal(); await reloadPets(); toast('Eliminada')
  }

  return (
    <FullScreen title={isNew ? 'Nueva mascota' : 'Editar ficha'} onClose={closeModal}>
      <form onSubmit={submit}>
        <Field label="Nombre" name="name" defaultValue={p.name} />
        <SelectF label="Especie" name="species" defaultValue={p.species || 'perro'} options={[['perro', 'Perro'], ['gato', 'Gato'], ['otro', 'Otro']]} />
        <Field label="Raza" name="breed" defaultValue={p.breed} />
        <SelectF label="Sexo" name="sex" defaultValue={p.sex || ''} options={[['', '—'], ['hembra', 'Hembra'], ['macho', 'Macho']]} />
        <Field label="Edad aproximada" name="birthdate_approx" defaultValue={p.birthdate_approx} placeholder="~2 años" />
        <Field label="Fecha de adopción" name="adoption_date" defaultValue={p.adoption_date} type="date" />
        <Field label="Microchip" name="microchip" defaultValue={p.microchip} />
        <Field label="Clínica" name="clinic_name" defaultValue={p.clinic_name} />
        <SelectF label="Estado" name="status" defaultValue={p.status || 'activo'} options={[['activo', 'Activo'], ['en tratamiento', 'En tratamiento'], ['inactivo', 'Inactivo']]} />
        <SelectF label="Esterilizada" name="sterilized" defaultValue={p.sterilized ? 'true' : 'false'} options={[['false', 'No'], ['true', 'Sí']]} />
        <Field label="Peso objetivo (kg, opcional)" name="target_weight_kg" defaultValue={p.target_weight_kg} type="number" placeholder="lo define la vet" />
        <Field label="Foto (URL, opcional)" name="photo_url" defaultValue={p.photo_url} />
        <Area label="Notas" name="notes" defaultValue={p.notes} />
        <Gap h={14} />
        <button className="btn block" disabled={busy}>Guardar</button>
        {!isNew && <><Gap h={8} /><button type="button" className="btn danger block" onClick={del}>Eliminar mascota</button></>}
      </form>
    </FullScreen>
  )
}

// ---------- MEDICO ----------
export function MedForm({ rec }: { rec?: MedicalRecord }) {
  const { pet, user, closeModal, bumpData, toast } = useApp()
  const isNew = !rec
  const m = rec || ({} as Partial<MedicalRecord>)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const title = val(fd, 'title')
    if (!title) { toast('Falta el título'); return }
    const row: any = {
      pet_id: pet!.id, category: val(fd, 'category'), title,
      event_date: orNull(val(fd, 'event_date')), next_due_date: orNull(val(fd, 'next_due_date')),
      vet_name: orNull(val(fd, 'vet_name')), description: orNull(val(fd, 'description')),
    }
    if (isNew) { row.created_by = user!.id; await sb.from('medical_records').insert(row) }
    else await sb.from('medical_records').update(row).eq('id', rec!.id)
    closeModal(); bumpData(); toast('Guardado')
  }
  const del = async () => {
    if (!confirm('¿Eliminar registro?')) return
    await sb.from('medical_records').delete().eq('id', rec!.id)
    closeModal(); bumpData(); toast('Eliminado')
  }
  return (
    <FullScreen title={isNew ? 'Nuevo registro médico' : 'Editar registro'} onClose={closeModal}>
      <form onSubmit={submit}>
        <SelectF label="Tipo" name="category" defaultValue={m.category || 'vacuna'} options={Object.keys(CAT).map((k) => [k, CAT[k].label])} />
        <Field label="Título" name="title" defaultValue={m.title} />
        <Field label="Fecha del evento" name="event_date" defaultValue={m.event_date} type="date" />
        <Field label="Próxima fecha / vence" name="next_due_date" defaultValue={m.next_due_date} type="date" />
        <Field label="Veterinaria/o" name="vet_name" defaultValue={m.vet_name} />
        <Area label="Descripción" name="description" defaultValue={m.description} />
        <Gap h={14} />
        <button className="btn block">Guardar</button>
        {!isNew && <><Gap h={8} /><button type="button" className="btn danger block" onClick={del}>Eliminar</button></>}
      </form>
    </FullScreen>
  )
}

// ---------- DIARIO ----------
export function LogForm({ log }: { log?: DailyLog }) {
  const { pet, user, closeModal, bumpData, toast } = useApp()
  const isNew = !log
  const l = log || ({} as Partial<DailyLog>)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const w = val(fd, 'weight_kg')
    const row: any = {
      pet_id: pet!.id, log_date: val(fd, 'log_date') || todayISO(), mood: orNull(val(fd, 'mood')),
      weight_kg: w === '' ? null : Number(w), meals: orNull(val(fd, 'meals')),
      stool: orNull(val(fd, 'stool')), notes: orNull(val(fd, 'notes')),
    }
    if (isNew) { row.created_by = user!.id; await sb.from('daily_logs').insert(row) }
    else await sb.from('daily_logs').update(row).eq('id', log!.id)
    closeModal(); bumpData(); toast('Guardado')
  }
  const del = async () => {
    if (!confirm('¿Eliminar registro?')) return
    await sb.from('daily_logs').delete().eq('id', log!.id)
    closeModal(); bumpData(); toast('Eliminado')
  }
  return (
    <FullScreen title={isNew ? 'Nuevo registro diario' : 'Editar registro'} onClose={closeModal}>
      <form onSubmit={submit}>
        <Field label="Fecha" name="log_date" defaultValue={l.log_date || todayISO()} type="date" />
        <SelectF label="Ánimo" name="mood" defaultValue={l.mood || ''} options={[['', '—'], ['Tranquila', 'Tranquila'], ['Activa / juguetona', 'Activa / juguetona'], ['Decaída', 'Decaída'], ['Ansiosa', 'Ansiosa'], ['Adaptándose', 'Adaptándose']]} />
        <Field label="Peso (kg)" name="weight_kg" defaultValue={l.weight_kg} type="number" />
        <Field label="Comidas" name="meals" defaultValue={l.meals} placeholder="qué y cuánto comió" />
        <SelectF label="Deposiciones" name="stool" defaultValue={l.stool || ''} options={[['', '—'], ['Normal', 'Normal'], ['Blanda', 'Blanda'], ['Diarrea', 'Diarrea'], ['Dura', 'Dura'], ['No hizo', 'No hizo']]} />
        <Area label="Notas" name="notes" defaultValue={l.notes} />
        <Gap h={14} />
        <button className="btn block">Guardar</button>
        {!isNew && <><Gap h={8} /><button type="button" className="btn danger block" onClick={del}>Eliminar</button></>}
      </form>
    </FullScreen>
  )
}

// ---------- RECORDATORIOS ----------
export function RemForm({ rem }: { rem?: Reminder }) {
  const { pet, user, closeModal, bumpData, toast } = useApp()
  const isNew = !rem
  const r = rem || ({} as Partial<Reminder>)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const title = val(fd, 'title')
    if (!title) { toast('Falta el título'); return }
    const row: any = { pet_id: pet!.id, title, due_date: orNull(val(fd, 'due_date')), notes: orNull(val(fd, 'notes')) }
    if (isNew) { row.created_by = user!.id; await sb.from('reminders').insert(row) }
    else await sb.from('reminders').update(row).eq('id', rem!.id)
    closeModal(); bumpData(); toast('Guardado')
  }
  const del = async () => {
    if (!confirm('¿Eliminar?')) return
    await sb.from('reminders').delete().eq('id', rem!.id)
    closeModal(); bumpData(); toast('Eliminado')
  }
  return (
    <FullScreen title={isNew ? 'Nuevo recordatorio' : 'Editar recordatorio'} onClose={closeModal}>
      <form onSubmit={submit}>
        <Field label="Título" name="title" defaultValue={r.title} placeholder="Ej: control veterinario" />
        <Field label="Fecha" name="due_date" defaultValue={r.due_date} type="date" />
        <Area label="Notas" name="notes" defaultValue={r.notes} />
        <Gap h={14} />
        <button className="btn block">Guardar</button>
        {!isNew && <><Gap h={8} /><button type="button" className="btn danger block" onClick={del}>Eliminar</button></>}
      </form>
    </FullScreen>
  )
}

// ---------- CONTACTOS ----------
export function ConForm({ con }: { con?: Contact }) {
  const { family, closeModal, bumpData, toast } = useApp()
  const isNew = !con
  const x = con || ({} as Partial<Contact>)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const name = val(fd, 'name')
    if (!name) { toast('Falta el nombre'); return }
    const row = { family_id: family!.id, name, role: val(fd, 'role'), phone: orNull(val(fd, 'phone')), email: orNull(val(fd, 'email')), notes: orNull(val(fd, 'notes')) }
    if (isNew) await sb.from('contacts').insert(row)
    else await sb.from('contacts').update(row).eq('id', con!.id)
    closeModal(); bumpData(); toast('Guardado')
  }
  const del = async () => {
    if (!confirm('¿Eliminar contacto?')) return
    await sb.from('contacts').delete().eq('id', con!.id)
    closeModal(); bumpData(); toast('Eliminado')
  }
  return (
    <FullScreen title={isNew ? 'Nuevo contacto' : 'Editar contacto'} onClose={closeModal}>
      <form onSubmit={submit}>
        <Field label="Nombre" name="name" defaultValue={x.name} />
        <SelectF label="Tipo" name="role" defaultValue={x.role || 'veterinaria'} options={[['veterinaria', 'Veterinaria'], ['peluqueria', 'Peluquería'], ['paseador', 'Paseador'], ['otro', 'Otro']]} />
        <Field label="Teléfono" name="phone" defaultValue={x.phone} type="tel" />
        <Field label="Email" name="email" defaultValue={x.email} type="email" />
        <Area label="Notas" name="notes" defaultValue={x.notes} />
        <Gap h={14} />
        <button className="btn block">Guardar</button>
        {!isNew && <><Gap h={8} /><button type="button" className="btn danger block" onClick={del}>Eliminar</button></>}
      </form>
    </FullScreen>
  )
}

// ---------- GESTIÓN DE FAMILIA ----------
export function ManageFamily() {
  const { family, closeModal, toast } = useApp()
  const [members, setMembers] = useState<Member[]>([])
  useEffect(() => {
    sb.from('family_members').select('*').eq('family_id', family!.id).then(({ data }) => setMembers((data || []) as Member[]))
  }, [family])
  const invite = async (e: FormEvent) => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const email = val(fd, 'inv').toLowerCase()
    if (!email) { toast('Escribe un correo'); return }
    const { error } = await sb.from('family_members').insert({ family_id: family!.id, email, role: val(fd, 'role') })
    if (error) { toast('Error: ' + error.message); return }
    closeModal(); toast('Invitación creada')
  }
  return (
    <FullScreen title={'Miembros de ' + family!.name} onClose={closeModal}>
      {members.length ? members.map((m) => (
        <div className="item" key={m.id}>
          <div className="t" style={{ fontSize: 14 }}>{m.email || '(sin correo)'}</div>
          <div className="d">{m.role} · {m.joined_at ? 'activo' : 'invitado (pendiente)'}</div>
        </div>
      )) : <div className="empty">Sin miembros.</div>}
      <h3 style={{ color: 'var(--teal)' }}>Invitar a alguien</h3>
      <p className="muted" style={{ fontSize: 13 }}>Escribe su correo. Cuando inicie sesión con ese mismo correo, verá y podrá registrar tus mascotas.</p>
      <form onSubmit={invite}>
        <Field label="Correo a invitar" name="inv" type="email" placeholder="persona@ejemplo.com" />
        <SelectF label="Rol" name="role" defaultValue="member" options={[['member', 'Puede registrar'], ['viewer', 'Solo ver'], ['owner', 'Administrador']]} />
        <Gap h={12} />
        <button className="btn block">Invitar</button>
      </form>
    </FullScreen>
  )
}
