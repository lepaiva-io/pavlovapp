import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { Ic } from '../../lib/icons'
import { STLABEL, STDOT } from '../../lib/constants'
import { fmtDate } from '../../lib/helpers'
import { Spinner, FullScreen } from '../ui'
import { playClick, soundOn, setSound } from '../../lib/clicker'
import type { TrainingSkill, SkillStatusRow, SkillSessionRow, Status } from '../../lib/types'

export default function Entreno() {
  const { pet, openModal, dataVersion } = useApp()
  const [skills, setSkills] = useState<TrainingSkill[] | null>(null)
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})
  const [repsMap, setRepsMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!pet) return
    setSkills(null)
    Promise.all([
      sb.from('training_skills').select('*').order('phase_order').order('skill_order'),
      sb.from('pet_skill_status').select('skill_id,status').eq('pet_id', pet.id),
      sb.from('skill_sessions').select('skill_id,reps').eq('pet_id', pet.id),
    ]).then(([r1, r2, r3]) => {
      const sk = (r1.data || []) as TrainingSkill[]
      const st = (r2.data || []) as SkillStatusRow[]
      const sess = (r3.data || []) as SkillSessionRow[]
      const sm: Record<string, string> = {}; st.forEach((s) => { sm[s.skill_id] = s.status })
      const rm: Record<string, number> = {}; sess.forEach((s) => { if (s.skill_id) rm[s.skill_id] = (rm[s.skill_id] || 0) + (s.reps || 0) })
      setSkills(sk); setStatusMap(sm); setRepsMap(rm)
    })
  }, [pet, dataVersion])

  if (!pet) return <div className="empty">No hay mascota seleccionada.</div>
  if (skills === null) return (<div><div className="sect-title"><h2><Ic name="cap" /> Entrenamiento</h2></div><Spinner /></div>)

  const total = skills.length
  const done = skills.filter((s) => statusMap[s.id] === 'logrado').length
  const phases: Record<number, { info: TrainingSkill; items: TrainingSkill[] }> = {}
  skills.forEach((s) => { (phases[s.phase_order] = phases[s.phase_order] || { info: s, items: [] }).items.push(s) })

  return (
    <div>
      <div className="sect-title"><h2><Ic name="cap" /> Entrenamiento</h2></div>
      <div className="hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
          <b>{done} de {total} ejercicios logrados</b>
          <span className="pct">{total ? Math.round((done / total) * 100) : 0}%</span>
        </div>
        <div className="progbar hero-bar"><span style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
        <div className="hero-sub">Toca un ejercicio para ver el detalle, los videos de Canine-Service y usar el clicker.</div>
      </div>
      {Object.keys(phases).map(Number).sort((a, b) => a - b).map((k) => {
        const ph = phases[k]; const lvl = Number(k) + 1
        return (
          <div key={k}>
            <div className="level"><span className="lvtag">NIVEL {lvl}</span><div className="lvname">{ph.info.phase_name}</div><div className="lvsub">{ph.info.phase_period || ''}</div></div>
            <div className="cardgrid">
              {ph.items.map((s) => {
                const cur = statusMap[s.id] || 'pendiente'; const r = repsMap[s.id] || 0
                return (
                  <button className="tcard" key={s.id} onClick={() => openModal(<SkillDetail skill={s} initial={cur as Status} />)}>
                    {cur === 'logrado' && <span className="chk" style={{ color: 'var(--ok)' }}><Ic name="checkcircle" /></span>}
                    <div className="tt">{s.title}</div>
                    <div className="meta"><span className={'dot ' + STDOT[cur]} /><span className="stag">{STLABEL[cur]}</span>{r ? <span className="reps"><Ic name="target" /> {r}</span> : null}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SkillDetail({ skill, initial }: { skill: TrainingSkill; initial: Status }) {
  const { pet, user, closeModal, toast, bumpData } = useApp()
  const [cur, setCur] = useState<Status>(initial)
  const [n, setN] = useState(0)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [hist, setHist] = useState<SkillSessionRow[]>([])
  const [subtab, setSubtab] = useState<'inst' | 'prac' | 'hist'>('inst')
  const [snd, setSnd] = useState(soundOn())

  const click = () => { playClick(); if (navigator.vibrate) navigator.vibrate(15); setN((x) => x + 1) }
  const flipSound = () => { const v = !snd; setSound(v); setSnd(v) }

  useEffect(() => {
    if (!pet) return
    sb.from('skill_sessions').select('session_date,reps,notes').eq('pet_id', pet.id).eq('skill_id', skill.id)
      .order('session_date', { ascending: false }).limit(8)
      .then(({ data }) => setHist((data || []) as SkillSessionRow[]))
  }, [pet, skill.id])

  const setStatus = async (v: Status) => {
    setCur(v)
    await sb.from('pet_skill_status').upsert(
      { pet_id: pet!.id, skill_id: skill.id, status: v, updated_by: user!.id, updated_at: new Date().toISOString() },
      { onConflict: 'pet_id,skill_id' },
    )
    bumpData()
  }

  const saveSession = async () => {
    if (n <= 0) { toast('Cuenta al menos 1 acierto con el ＋'); return }
    setBusy(true)
    const { error } = await sb.from('skill_sessions').insert({ pet_id: pet!.id, skill_id: skill.id, reps: n, notes: note.trim() || null, created_by: user!.id })
    if (error) { toast('Error: ' + error.message); setBusy(false); return }
    toast('Sesión guardada: ' + n + ' aciertos')
    closeModal(); bumpData()
  }

  const segCls = (v: Status) => (v === cur ? (cur === 'logrado' ? 'on-ok' : cur === 'en_progreso' ? 'on-prog' : 'on-pend') : '')

  return (
    <FullScreen title={skill.title} onClose={closeModal}>
      <div className="sd-head">
        <div className="sd-ico"><Ic name="cap" /></div>
        <div style={{ paddingTop: 4 }}><span className="sd-lvl">NIVEL {Number(skill.phase_order) + 1}</span></div>
      </div>

      <div className="subtabs">
        <button className={subtab === 'inst' ? 'on' : ''} onClick={() => setSubtab('inst')}><Ic name="clipboard" /> Instrucciones</button>
        <button className={subtab === 'prac' ? 'on' : ''} onClick={() => setSubtab('prac')}><Ic name="target" /> Práctica</button>
        <button className={subtab === 'hist' ? 'on' : ''} onClick={() => setSubtab('hist')}><Ic name="medal" /> Historial</button>
      </div>

      {subtab === 'inst' && (
        <div>
          {skill.goal && <div className="sd-goal"><Ic name="target" /><div><b>Objetivo</b><span>{skill.goal}</span></div></div>}
          {skill.steps?.length > 0 && (
            <div className="sd-block"><div className="sd-bt"><Ic name="cap" /> Cómo hacerlo</div>
              <ol className="sd-steps">{skill.steps.map((x, i) => <li key={i}>{x}</li>)}</ol>
            </div>
          )}
          {skill.done_criteria && (
            <div className="sd-done"><Ic name="checkcircle" /><div><b style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Logrado cuando</b>{skill.done_criteria}</div></div>
          )}
          {!skill.goal && !skill.steps?.length && !skill.done_criteria && (
            <div className="empty">Sin instrucciones cargadas para este ejercicio.</div>
          )}
        </div>
      )}

      {subtab === 'prac' && (
        <div>
          <div className="sd-block">
            <div className="sd-bt"><Ic name="checkcircle" /> Estado</div>
            <div className="statusseg">
              <button className={segCls('pendiente')} onClick={() => setStatus('pendiente')}>Pendiente</button>
              <button className={segCls('en_progreso')} onClick={() => setStatus('en_progreso')}>En progreso</button>
              <button className={segCls('logrado')} onClick={() => setStatus('logrado')}>Logrado</button>
            </div>
          </div>

          <div className="sd-block">
            <div className="sd-bt" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Ic name="target" /> Clicker — sesión de hoy</span>
              <button className="soundtog" onClick={flipSound} title={snd ? 'Silenciar clic' : 'Activar sonido'}>
                <Ic name={snd ? 'volume' : 'volumeoff'} /> {snd ? 'Sonido' : 'Mudo'}
              </button>
            </div>
            <div className="clicker">
              <div className="counter">{n}</div>
              <div className="muted" style={{ fontSize: 12 }}>aciertos en esta sesión</div>
              <button className="clickbtn" onClick={click}>+</button>
              <div className="clickrow">
                <button className="btn sm ghost" onClick={() => setN((x) => Math.max(0, x - 1))}>−1</button>
                <button className="btn sm ghost" onClick={() => setN(0)}>Reiniciar</button>
              </div>
              <div style={{ height: 10 }} />
              <input placeholder="Nota de la sesión (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
              <div style={{ height: 8 }} />
              <button className="btn block" disabled={busy} onClick={saveSession}>Guardar sesión</button>
            </div>
          </div>
        </div>
      )}

      {subtab === 'hist' && (
        <div>
          <div className="sd-bt" style={{ marginTop: 4 }}><Ic name="medal" /> Historial de sesiones</div>
          {hist.length === 0 ? (
            <div className="empty">Aún no hay sesiones guardadas. Registra una en la pestaña Práctica.</div>
          ) : hist.map((x, i) => (
            <div className="item" style={{ marginBottom: 8 }} key={i}>
              <div className="t" style={{ fontSize: 14 }}><Ic name="target" /> <span>{x.reps} aciertos · {fmtDate(x.session_date)}</span></div>
              {x.notes && <div className="desc">{x.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </FullScreen>
  )
}
