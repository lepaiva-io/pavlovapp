import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { Ic } from '../../lib/icons'
import { CAT } from '../../lib/constants'
import { fmtDate, todayISO } from '../../lib/helpers'
import { Spinner } from '../ui'
import { RemForm } from '../forms/Forms'
import type { Reminder, MedicalRecord } from '../../lib/types'

export default function Alertas() {
  const { pet, openModal, bumpData, dataVersion } = useApp()
  const [rems, setRems] = useState<Reminder[] | null>(null)
  const [meds, setMeds] = useState<MedicalRecord[]>([])

  useEffect(() => {
    if (!pet) return
    setRems(null)
    Promise.all([
      sb.from('reminders').select('*').eq('pet_id', pet.id).order('due_date', { nullsFirst: false }),
      sb.from('medical_records').select('id,title,next_due_date,category').eq('pet_id', pet.id).not('next_due_date', 'is', null),
    ]).then(([r1, r2]) => {
      setRems((r1.data || []) as Reminder[])
      setMeds((r2.data || []) as MedicalRecord[])
    })
  }, [pet, dataVersion])

  const toggle = async (r: Reminder) => {
    await sb.from('reminders').update({ done: !r.done }).eq('id', r.id)
    bumpData()
  }

  if (!pet) return <div className="empty">No hay mascota seleccionada.</div>

  const today = todayISO()
  const medUp = meds.filter((m) => m.next_due_date && m.next_due_date >= today).sort((a, b) => a.next_due_date!.localeCompare(b.next_due_date!))

  return (
    <div>
      <div className="sect-title">
        <h2><Ic name="bell" /> Recordatorios</h2>
        <button className="btn sm" onClick={() => openModal(<RemForm />)}><Ic name="plus" /> Agregar</button>
      </div>
      {rems === null ? <Spinner /> : (
        <>
          {medUp.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 15 }}>Del historial médico</h2>
              {medUp.map((m) => (
                <div className="item" style={{ marginBottom: 8 }} key={m.id}>
                  <div className="t" style={{ fontSize: 14 }}><Ic name={(CAT[m.category] || CAT.nota).ic} /> <span>{m.title}</span></div>
                  <div className="d">Vence: <b>{fmtDate(m.next_due_date)}</b></div>
                </div>
              ))}
            </div>
          )}
          {rems.length === 0 ? (
            medUp.length ? null : <div className="empty">Sin recordatorios personalizados.</div>
          ) : rems.map((r) => (
            <div className="item" key={r.id}>
              <div className="top">
                <div className="grow">
                  <div className="t" style={r.done ? { textDecoration: 'line-through', color: 'var(--muted)' } : undefined}>{r.title}</div>
                  <div className="d">{r.due_date ? fmtDate(r.due_date) : 'sin fecha'}{r.notes ? ' · ' + r.notes : ''}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className={'btn sm ' + (r.done ? 'ghost' : 'sec')} title={r.done ? 'Reabrir' : 'Marcar hecho'} onClick={() => toggle(r)}>{r.done ? <Ic name="undo" /> : <Ic name="check" />}</button>
                  <button className="btn sm ghost" title="Editar" onClick={() => openModal(<RemForm rem={r} />)}><Ic name="pencil" /></button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
