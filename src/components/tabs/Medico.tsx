import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { Ic } from '../../lib/icons'
import { CAT } from '../../lib/constants'
import { fmtDate } from '../../lib/helpers'
import { Spinner } from '../ui'
import { MedForm } from '../forms/Forms'
import { exportVetPdf } from '../../features/pdf'
import type { MedicalRecord } from '../../lib/types'

export default function Medico() {
  const { pet, openModal, toast, bumpData, dataVersion } = useApp()
  const [list, setList] = useState<MedicalRecord[] | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)

  useEffect(() => {
    if (!pet) return
    setList(null)
    sb.from('medical_records').select('*').eq('pet_id', pet.id)
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('next_due_date', { ascending: true, nullsFirst: false })
      .then(({ data }) => setList((data || []) as MedicalRecord[]))
  }, [pet, dataVersion])

  const toggleDone = async (m: MedicalRecord) => {
    await sb.from('medical_records').update({ done: !m.done }).eq('id', m.id)
    toast(m.done ? 'Marcado pendiente' : '¡Hecho!')
    bumpData()
  }

  const doPdf = async () => {
    if (!pet) return
    setPdfBusy(true)
    try { await exportVetPdf(pet) } catch (e: any) { toast('Error al generar PDF: ' + (e?.message || e)) }
    setPdfBusy(false)
  }

  if (!pet) return <div className="empty">No hay mascota seleccionada.</div>

  return (
    <div>
      <div className="sect-title">
        <h2><Ic name="stethoscope" /> Historial médico</h2>
        <button className="btn sm" onClick={() => openModal(<MedForm />)}><Ic name="plus" /> Agregar</button>
      </div>
      <button className="btn sec block" style={{ marginBottom: 14 }} disabled={pdfBusy} onClick={doPdf}>
        <Ic name="pdf" /> {pdfBusy ? 'Generando…' : 'Exportar para la vet (PDF)'}
      </button>
      {list === null ? <Spinner /> : list.length === 0 ? (
        <div className="empty">Aún no hay registros médicos.</div>
      ) : list.map((m) => {
        const cc = CAT[m.category] || CAT.nota
        return (
          <div className={'item ' + (m.done ? 'medone' : '')} key={m.id}>
            <div className="top">
              <div className="grow">
                <div className="t"><Ic name={cc.ic} /> <span>{m.title}</span>{m.done && <span className="doneflag"><Ic name="check" />Hecho</span>}</div>
                <div className="d">
                  {cc.label}{m.event_date ? ' · ' + fmtDate(m.event_date) : ''}
                  {m.next_due_date ? <> · próx: <b>{fmtDate(m.next_due_date)}</b></> : ''}
                  {m.vet_name ? ' · ' + m.vet_name : ''}
                </div>
                {m.description && <div className="desc">{m.description}</div>}
              </div>
              <div className="medbtns">
                <button className={'btn sm ' + (m.done ? 'ghost' : 'sec')} title={m.done ? 'Marcar como pendiente' : 'Marcar como hecho'} onClick={() => toggleDone(m)}>{m.done ? <Ic name="undo" /> : <Ic name="check" />}</button>
                <button className="btn sm ghost" title="Editar" onClick={() => openModal(<MedForm rec={m} />)}><Ic name="pencil" /></button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
