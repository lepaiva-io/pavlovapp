import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { Ic } from '../../lib/icons'
import { QUICK } from '../../lib/constants'
import { fmtDate, todayISO, timeHM, localDateOf, startOfLocalDayISO, endOfLocalDayISO } from '../../lib/helpers'
import { Spinner } from '../ui'
import WeightChart from '../WeightChart'
import type { WPoint } from '../WeightChart'
import { LogForm } from '../forms/Forms'
import type { DailyLog, DailyEvent } from '../../lib/types'

const QMAP: Record<string, { label: string; ic: string }> = Object.fromEntries(QUICK.map((q) => [q.type, { label: q.label, ic: q.ic }]))

function minusOneDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}
function computeStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const today = todayISO()
  const yest = minusOneDay(today)
  // el streak solo cuenta si hay actividad hoy o ayer
  let cursor: string
  if (dates.has(today)) cursor = today
  else if (dates.has(yest)) cursor = yest
  else return 0
  let n = 0
  while (dates.has(cursor)) { n++; cursor = minusOneDay(cursor) }
  return n
}

export default function Diario() {
  const { pet, openModal, dataVersion } = useApp()
  const [logs, setLogs] = useState<DailyLog[] | null>(null)
  const [todayEvents, setTodayEvents] = useState<DailyEvent[]>([])
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!pet) return
    setLogs(null)
    Promise.all([
      sb.from('daily_logs').select('*').eq('pet_id', pet.id).order('log_date', { ascending: false }).limit(60),
      sb.from('daily_events').select('*').eq('pet_id', pet.id).gte('occurred_at', startOfLocalDayISO()).lte('occurred_at', endOfLocalDayISO()).order('occurred_at', { ascending: false }),
      sb.from('daily_events').select('occurred_at').eq('pet_id', pet.id).order('occurred_at', { ascending: false }).limit(400),
    ]).then(([r1, r2, r3]) => {
      const ll = (r1.data || []) as DailyLog[]
      setLogs(ll)
      setTodayEvents((r2.data || []) as DailyEvent[])
      const dates = new Set<string>()
      ll.forEach((l) => dates.add(l.log_date))
      ;((r3.data || []) as { occurred_at: string }[]).forEach((e) => dates.add(localDateOf(e.occurred_at)))
      setStreak(computeStreak(dates))
    })
  }, [pet, dataVersion])

  if (!pet) return <div className="empty">No hay mascota seleccionada.</div>

  const target = pet.target_weight_kg != null ? Number(pet.target_weight_kg) : null
  const weights: WPoint[] = (logs || []).filter((l) => l.weight_kg != null)
    .map((l) => ({ date: l.log_date, kg: Number(l.weight_kg) }))
    .reverse().slice(-12)

  return (
    <div>
      <div className="sect-title">
        <h2><Ic name="notebook" /> Diario</h2>
        <button className="btn sm" onClick={() => openModal(<LogForm />)}><Ic name="plus" /> Registrar</button>
      </div>
      {logs === null ? <Spinner /> : (
        <>
          {streak > 0 && (
            <div className="streak">
              <Ic name="flame" />
              <div className="n">{streak}</div>
              <div className="lab">día{streak === 1 ? '' : 's'} seguido{streak === 1 ? '' : 's'} con registro<br />¡sigue así!</div>
            </div>
          )}

          <div className="card">
            <div className="sect-title"><h2 style={{ fontSize: 16 }}><Ic name="paw" /> Hoy, minuto a minuto</h2></div>
            {todayEvents.length === 0 ? (
              <div className="empty" style={{ padding: '10px 8px' }}>Sin eventos hoy. Usa el registro rápido en Inicio.</div>
            ) : (
              <div className="timeline">
                {todayEvents.map((e) => {
                  const q = QMAP[e.event_type] || { label: e.event_type, ic: 'paw' }
                  return (
                    <div className="tl-item" key={e.id}>
                      <div className="tl-time">{timeHM(e.occurred_at)}</div>
                      <div className={'tl-ic qic ' + e.event_type}><Ic name={q.ic} /></div>
                      <div className="tl-label">{q.label}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {weights.length >= 2 && (
            <div className="card">
              <h2><Ic name="scale" /> Peso</h2>
              <WeightChart points={weights} target={target} />
            </div>
          )}

          {logs.length === 0 ? (
            <div className="empty">Sin registros de diario todavía. Toca “Registrar”.</div>
          ) : logs.map((l) => (
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
