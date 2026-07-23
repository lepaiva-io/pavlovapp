import { useApp } from '../../state/store'
import { Ic } from '../../lib/icons'
import { ManageFamily } from '../forms/Forms'

export default function Familia() {
  const { family, openModal } = useApp()
  return (
    <div className="card">
      <div className="sect-title">
        <h2 style={{ fontSize: 16 }}><Ic name="users" /> Familia y seguimiento</h2>
        <button className="btn sm sec" onClick={() => openModal(<ManageFamily />)}>Miembros</button>
      </div>
      <div className="muted" style={{ fontSize: 14 }}>
        Familia: <b>{family?.name}</b>. Los miembros invitados pueden ver y registrar a tus mascotas.
      </div>
    </div>
  )
}
