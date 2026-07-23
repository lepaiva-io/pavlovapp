import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../state/store'
import { Ic } from '../../lib/icons'
import { ROLE } from '../../lib/constants'
import { Spinner } from '../ui'
import { ConForm } from '../forms/Forms'
import type { Contact } from '../../lib/types'

export default function Contactos() {
  const { family, openModal, dataVersion } = useApp()
  const [list, setList] = useState<Contact[] | null>(null)

  useEffect(() => {
    if (!family) { setList([]); return }
    setList(null)
    sb.from('contacts').select('*').eq('family_id', family.id).order('role')
      .then(({ data }) => setList((data || []) as Contact[]))
  }, [family, dataVersion])

  return (
    <div>
      <div className="sect-title">
        <h2><Ic name="contacts" /> Contactos</h2>
        <button className="btn sm" onClick={() => openModal(<ConForm />)}><Ic name="plus" /> Agregar</button>
      </div>
      {list === null ? <Spinner /> : list.length === 0 ? (
        <div className="empty">Sin contactos.</div>
      ) : list.map((x) => {
        const rr = ROLE[x.role]
        return (
          <div className="item" key={x.id}>
            <div className="top">
              <div className="grow">
                <div className="t"><span>{x.name}</span></div>
                <div className="d">{rr ? <><Ic name={rr.ic} /> {rr.l}</> : x.role}{x.phone ? ' · ' + x.phone : ''}{x.email ? ' · ' + x.email : ''}</div>
                {x.notes && <div className="desc">{x.notes}</div>}
              </div>
              <button className="btn sm ghost" title="Editar" onClick={() => openModal(<ConForm con={x} />)}><Ic name="pencil" /></button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
