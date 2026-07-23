import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'
import { useApp } from '../state/store'
import { QUICK } from '../lib/constants'
import { startOfLocalDayISO, endOfLocalDayISO } from '../lib/helpers'
import { Ic } from '../lib/icons'
import type { DailyEvent } from '../lib/types'

export default function QuickLog() {
  const { pet, user, toast, bumpData, dataVersion } = useApp()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    if (!pet) return
    const { data } = await sb
      .from('daily_events')
      .select('event_type,occurred_at')
      .eq('pet_id', pet.id)
      .gte('occurred_at', startOfLocalDayISO())
      .lte('occurred_at', endOfLocalDayISO())
    const c: Record<string, number> = {}
    ;(data as DailyEvent[] | null || []).forEach((e) => { c[e.event_type] = (c[e.event_type] || 0) + 1 })
    setCounts(c)
  }, [pet])

  useEffect(() => { load() }, [load, dataVersion])

  const log = async (type: string, label: string) => {
    if (!pet) return
    setBusy(type)
    setCounts((c) => ({ ...c, [type]: (c[type] || 0) + 1 })) // optimista
    const { error } = await sb.from('daily_events').insert({ pet_id: pet.id, event_type: type, created_by: user!.id })
    setBusy('')
    if (error) { toast('Error: ' + error.message); load(); return }
    toast(label + ' ✓')
    bumpData()
  }

  return (
    <div className="card">
      <div className="sect-title"><h2 style={{ fontSize: 16 }}><Ic name="paw" /> Registro rápido de hoy</h2></div>
      <div className="quickgrid">
        {QUICK.map((q) => (
          <button key={q.type} className="quickbtn" disabled={busy === q.type} onClick={() => log(q.type, q.label)}>
            <span className={'qic ' + q.type}><Ic name={q.ic} /></span>
            {q.label}
            <span className="qcount">{counts[q.type] ? `${counts[q.type]}× hoy` : '—'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
