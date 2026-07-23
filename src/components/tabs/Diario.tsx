import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { Ic } from '../../lib/icons'
import { fmtDate } from '../../lib/helpers'
import { Spinner } from '../ui'
import WeightChart from '../WeightChart'
import type { WPoint } from '../WeightChart'
import { LogForm } from '../forms/Forms'
import type { DailyLog } from '../../lib/types'

export default function Diario() {
  const { pet, openModal, dataVersion } = useApp()
  const [list, setList] = useState<DailyLog[] | null>(null)

  useEffect(() => {
    if (!pet) return
    setList(null)
    sb.from('daily_logs').select('*').eq('pet_id', pet.id).order('log_date', { ascending: false }).limit(60)
      .then(({ data }) => setList((data || []) as DailyLog[]))
  }, [pet, dataVersion])

  if (!pet) return <div className="empty">No hay mascota seleccionada.</div>

  const target = pet.target_weight_kg != null ? Number(pet.target_weight_kg) : null
  const weights: WPoint[] = (list || []).filter((l) => l.weight_kg != null)
    .map((l) => ({ date: l.log_date, kg: Number(l.weight_kg) }))
    .reverse()
    .slice(-12)

  return (
    <div>
      <div className="sect-title">
        <h2><Ic name="notebook" /> Registro diario</h2>
        <button className="btn sm" onClick={() => openModal(<LogForm />)}><Ic name="plus" /> Registrar</button>
      </div>
      {list === null ? <Spinner /> : (
        <>
          {weights.length >= 2 && (
            <div className="card">
              <h2><Ic name="scale" /> Peso</h2>
              <WeightChart points={weights} target={target} />
            </div>
          )}
          {list.length === 0 ? (
            <div className="empty">Sin registros todavía. Toca “Registrar”.</div>
          ) : list.map((l) => (
            <div className="item" key={l.id}>
              <div className="top">
                <div className="grow">
                  <div className="t">{fmtDate(l.log_date)}{l.weight_kg != null ? ` · ${l.weight_kg} kg` : ''}</div>
                  <div className="d">{[l.mood ? 'Ánimo: ' + l.mood : '', l.meals ? 'Comidas: ' + l.meals : '', l.stool ? 'Deposiciones: ' + l.stool : ''].filter(Boolean).join(' · ') || '—'}</div>
                  {l.notes && <div className="desc">{l.notes}</div>}
                </div>
                <button className="btn sm ghost" title="Editar" onClick={() => openModal(<LogForm log={l} />)}><Ic name="pencil" /></button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
