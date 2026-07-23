import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { Ic } from '../../lib/icons'
import { CAT } from '../../lib/constants'
import { fmtDate, longDate, todayISO, daysFromToday } from '../../lib/helpers'
import { Spinner } from '../ui'
import WeightChart from '../WeightChart'
import type { WPoint } from '../WeightChart'
import QuickLog from '../QuickLog'
import { PetForm, ManageFamily } from '../forms/Forms'
import type { Reminder, MedicalRecord, DailyLog, TrainingSkill, SkillStatusRow } from '../../lib/types'

interface HoyData {
  overdue: { title: string; due: string }[]
  today: { title: string; due: string }[]
  upcomingMed: { title: string; due: string; cat: string }[]
  hasLogToday: boolean
  weights: WPoint[]
  nextSkill: TrainingSkill | null
}

export default function Ficha() {
  const { pet, family, dataVersion, openModal } = useApp()
  const [d, setD] = useState<HoyData | null>(null)

  useEffect(() => {
    if (!pet) return
    let alive = true
    setD(null)
    const today = todayISO()
    Promise.all([
      sb.from('reminders').select('title,due_date,done').eq('pet_id', pet.id).eq('done', false),
      sb.from('medical_records').select('title,next_due_date,category').eq('pet_id', pet.id).not('next_due_date', 'is', null),
      sb.from('daily_logs').select('id,log_date,weight_kg').eq('pet_id', pet.id).order('log_date', { ascending: true }),
      sb.from('training_skills').select('*').order('phase_order').order('skill_order'),
      sb.from('pet_skill_status').select('skill_id,status').eq('pet_id', pet.id),
    ]).then(([r1, r2, r3, r4, r5]) => {
      if (!alive) return
      const rems = (r1.data || []) as Reminder[]
      const meds = (r2.data || []) as MedicalRecord[]
      const logs = (r3.data || []) as DailyLog[]
      const skills = (r4.data || []) as TrainingSkill[]
      const st = (r5.data || []) as SkillStatusRow[]
      const overdue = rems.filter((r) => r.due_date && r.due_date < today).map((r) => ({ title: r.title, due: r.due_date! }))
      const todayR = rems.filter((r) => r.due_date === today).map((r) => ({ title: r.title, due: r.due_date! }))
      const upcomingMed = meds
        .filter((m) => m.next_due_date && m.next_due_date >= today)
        .sort((a, b) => a.next_due_date!.localeCompare(b.next_due_date!))
        .slice(0, 3)
        .map((m) => ({ title: m.title, due: m.next_due_date!, cat: m.category }))
      const hasLogToday = logs.some((l) => l.log_date === today)
      const weights: WPoint[] = logs.filter((l) => l.weight_kg != null).slice(-12).map((l) => ({ date: l.log_date, kg: Number(l.weight_kg) }))
      const statusMap: Record<string, string> = {}
      st.forEach((s) => { statusMap[s.skill_id] = s.status })
      const nextSkill = skills.find((s) => statusMap[s.id] !== 'logrado') || null
      setD({ overdue, today: todayR, upcomingMed, hasLogToday, weights, nextSkill })
    })
    return () => { alive = false }
  }, [pet, dataVersion])

  if (!pet) return <div className="empty">No hay mascota seleccionada. Toca ＋ arriba para agregar una.</div>

  const p = pet
  const initial = (p.name || '?').slice(0, 1).toUpperCase()
  const target = p.target_weight_kg != null ? Number(p.target_weight_kg) : null

  // resumen de la cabecera
  let heroSub = 'Cargando…'
  if (d) {
    if (d.overdue.length) heroSub = `${d.overdue.length} recordatorio(s) vencido(s)`
    else if (d.today.length) heroSub = `${d.today.length} recordatorio(s) para hoy`
    else if (d.upcomingMed.length) {
      const n = daysFromToday(d.upcomingMed[0].due)
      heroSub = `Próximo: ${d.upcomingMed[0].title}${n != null ? ` en ${n} día(s)` : ''}`
    } else heroSub = 'Todo al día por ahora 🐾'.replace(' 🐾', '')
  }

  return (
    <div>
      {/* ===== HOY ===== */}
      <div className="today-hero">
        <div className="th-date">{longDate()}</div>
        <div className="th-name">{p.name}</div>
        <div className="th-sub">{heroSub}</div>
      </div>

      {!d ? <Spinner /> : (
        <>
          {(d.overdue.length > 0 || d.today.length > 0 || d.upcomingMed.length > 0) && (
            <div className="card">
              <div className="sect-title"><h2 style={{ fontSize: 16 }}><Ic name="bell" /> Alertas</h2></div>
              {d.overdue.map((r, i) => (
                <div className="alert-row over" key={'o' + i}><Ic name="bell" /><div><b>{r.title}</b> · venció {fmtDate(r.due)}</div></div>
              ))}
              {d.today.map((r, i) => (
                <div className="alert-row today" key={'t' + i}><Ic name="bell" /><div><b>{r.title}</b> · hoy</div></div>
              ))}
              {d.upcomingMed.map((m, i) => (
                <div className="alert-row soon" key={'m' + i}><Ic name={(CAT[m.cat] || CAT.nota).ic} /><div><b>{m.title}</b> · {fmtDate(m.due)}</div></div>
              ))}
            </div>
          )}

          {/* estado del diario de hoy */}
          <div className={'alert-row ' + (d.hasLogToday ? 'okrow' : 'soon')} style={{ marginBottom: 14 }}>
            <Ic name={d.hasLogToday ? 'checkcircle' : 'notebook'} />
            <div>{d.hasLogToday ? 'Diario de hoy registrado' : 'Aún no registras el diario de hoy'}</div>
          </div>

          {/* registro de un toque */}
          <QuickLog />

          {/* peso */}
          {d.weights.length >= 2 && (
            <div className="card">
              <div className="sect-title"><h2 style={{ fontSize: 16 }}><Ic name="scale" /> Peso</h2></div>
              <WeightChart points={d.weights} target={target} />
            </div>
          )}

          {/* sugerencia de entreno */}
          {d.nextSkill && (
            <div className="card">
              <div className="sect-title"><h2 style={{ fontSize: 16 }}><Ic name="cap" /> Sugerencia de hoy</h2></div>
              <div className="item" style={{ marginBottom: 0 }}>
                <div className="t"><Ic name="target" /> <span>{d.nextSkill.title}</span></div>
                {d.nextSkill.goal && <div className="desc">{d.nextSkill.goal}</div>}
                <div className="d" style={{ marginTop: 6 }}>Ábrela en la pestaña Entreno para ver pasos, videos y el clicker.</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== FICHA ===== */}
      <div className="card">
        <div className="petHead">
          <div className="petAvatar">{p.photo_url ? <img src={p.photo_url} alt={p.name} /> : initial}</div>
          <div className="grow">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20 }}>{p.name}</h2>
              <button className="btn sm sec" onClick={() => openModal(<PetForm pet={p} />)}>Editar</button>
            </div>
            <div className="catline">
              <span className="pill">{p.species || '—'}</span>
              {p.sex && <span className="pill">{p.sex}</span>}
              {p.sterilized ? <span className="pill">esterilizada</span> : <span className="pill warn">sin esterilizar</span>}
            </div>
          </div>
        </div>
        <div className="kv">
          <div className="k">Raza</div><div>{p.breed || '—'}</div>
          <div className="k">Edad aprox.</div><div>{p.birthdate_approx || '—'}</div>
          <div className="k">Adopción</div><div>{fmtDate(p.adoption_date)}</div>
          <div className="k">Microchip</div><div>{p.microchip || '—'}</div>
          <div className="k">Clínica</div><div>{p.clinic_name || '—'}</div>
          <div className="k">Estado</div><div>{p.status || '—'}</div>
        </div>
        {p.notes && <><h3>Notas</h3><div className="item desc" style={{ margin: 0 }}>{p.notes}</div></>}
      </div>

      {/* ===== FAMILIA ===== */}
      <div className="card">
        <div className="sect-title"><h2 style={{ fontSize: 16 }}><Ic name="users" /> Familia y seguimiento</h2><button className="btn sm sec" onClick={() => openModal(<ManageFamily />)}>Miembros</button></div>
        <div className="muted" style={{ fontSize: 14 }}>Familia: <b>{family?.name}</b>. Los miembros invitados pueden ver y registrar a tus mascotas.</div>
      </div>
    </div>
  )
}
