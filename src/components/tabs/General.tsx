import { useApp } from '../../state/store'
import { fmtDate } from '../../lib/helpers'
import { PetForm } from '../forms/Forms'

export default function General() {
  const { pet, openModal } = useApp()
  if (!pet) return <div className="empty">No hay mascota seleccionada.</div>
  const p = pet
  const initial = (p.name || '?').slice(0, 1).toUpperCase()
  return (
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
        <div className="k">Peso objetivo</div><div>{p.target_weight_kg != null ? `${p.target_weight_kg} kg` : '—'}</div>
        <div className="k">Estado</div><div>{p.status || '—'}</div>
      </div>
      {p.notes && <><h3>Notas</h3><div className="item desc" style={{ margin: 0 }}>{p.notes}</div></>}
    </div>
  )
}
