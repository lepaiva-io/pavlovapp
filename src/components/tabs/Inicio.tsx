import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { Ic } from '../../lib/icons'
import { CAT } from '../../lib/constants'
import { fmtDate, longDate, todayISO, daysFromToday } from '../../lib/helpers'
import { Spinner } from '../ui'
import QuickLog from '../QuickLog'
import type { Reminder, MedicalRecord, TrainingSkill, SkillStatusRow } from '../../lib/types'

interface HoyData {
  overdue: { title: string; due: string }[]
  today: { title: string; due: string }[]
  upcomingMed: { title: string; due: string; cat: string }[]
  nextSkill: TrainingSkill | null
}

export default function Inicio() {
  const { pet, dataVersion } = useApp()
  const [d, setD] = useState<HoyData | null>(null)

  useEffect(() => {
    if (!pet) return
    let alive = true
    setD(null)
    const today = todayISO()
    Promise.all([
      sb.from('reminders').select('title,due_date,done').eq('pet_id', pet.id).eq('done', false),
      sb.from('medical_records').select('title,next_due_date,category').eq('pet_id', pet.id).not('next_due_date', 'is', null),
      sb.from('training_skills').select('*').order('phase_order').order('skill_order'),
      sb.from('pet_skill_status').select('skill_id,status').eq('pet_id', pet.id),
    ]).then(([r1, r2, r3, r4]) => {
      if (!alive) return
      const rems = (r1.data || []) as Reminder[]
      const meds = (r2.data || []) as MedicalRecord[]
      const skills = (r3.data || []) as TrainingSkill[]
      const st = (r4.data || []) as SkillStatusRow[]
      const overdue = rems.filter((r) => r.due_date && r.due_date < today).map((r) => ({ title: r.title, due: r.due_date! }))
      const todayR = rems.filter((r) => r.due_date === today).map((r) => ({ title: r.title, due: r.due_date! }))
      const upcomingMed = meds
        .filter((m) => m.next_due_date && m.next_due_date >= today)
        .sort((a, b) => a.next_due_date!.localeCompare(b.next_due_date!))
        .slice(0, 2)
        .map((m) => ({ title: m.title, due: m.next_due_date!, cat: m.category }))
      const statusMap: Record<string, string> = {}
      st.forEach((s) => { statusMap[s.skill_id] = s.status })
      const nextSkill = skills.find((s) => statusMap[s.id] !== 'logrado') || null
      setD({ overdue, today: todayR, upcomingMed, nextSkill })
    })
    return () => { alive = false }
  }, [pet, dataVersion])

  if (!pet) return <div className="empty">No hay mascota seleccionada. Toca ＋ arriba para agregar una.</div>

  let heroSub = 'Cargando…'
  if (d) {
    if (d.overdue.length) heroSub = `${d.overdue.length} recordatorio(s) vencido(s)`
    else if (d.today.length) heroSub = `${d.today.length} recordatorio(s) para hoy`
    else if (d.upcomingMed.length) {
      const n = daysFromToday(d.upcomingMed[0].due)
      heroSub = `Próximo: ${d.upcomingMed[0].title}${n != null ? ` en ${n} día(s)` : ''}`
    } else heroSub = 'Todo al día por ahora'
  }

  return (
    <div>
      <div className="today-hero">
        <div className="th-date">{longDate()}</div>
        <div className="th-name">{pet.name}</div>
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

          <QuickLog />

          {d.nextSkill && (
            <div className="card">
              <div className="sect-title"><h2 style={{ fontSize: 16 }}><Ic name="cap" /> Sugerencia de hoy</h2></div>
              <div className="item" style={{ marginBottom: 0 }}>
                <div className="t"><Ic name="target" /> <span>{d.nextSkill.title}</span></div>
                {d.nextSkill.goal && <div className="desc">{d.nextSkill.goal}</div>}
                <div className="d" style={{ marginTop: 6 }}>Ábrela en Entreno para ver los pasos y usar el clicker.</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
