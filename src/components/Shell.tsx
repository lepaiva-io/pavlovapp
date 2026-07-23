import { useState } from 'react'
import { sb } from '../lib/supabase'
import { useApp } from '../state/store'
import { Ic } from '../lib/icons'
import { PawLogo, Spinner } from './ui'
import { PetForm } from './forms/Forms'
import Ficha from './tabs/Ficha'
import Medico from './tabs/Medico'
import Diario from './tabs/Diario'
import Entreno from './tabs/Entreno'
import Alertas from './tabs/Alertas'
import Contactos from './tabs/Contactos'

type Tab = 'resumen' | 'medico' | 'diario' | 'entreno' | 'recordatorios' | 'contactos'

const NAV: { key: Tab; ic: string; label: string }[] = [
  { key: 'resumen', ic: 'paw', label: 'Ficha' },
  { key: 'medico', ic: 'stethoscope', label: 'Médico' },
  { key: 'diario', ic: 'notebook', label: 'Diario' },
  { key: 'entreno', ic: 'cap', label: 'Entreno' },
  { key: 'recordatorios', ic: 'bell', label: 'Alertas' },
  { key: 'contactos', ic: 'contacts', label: 'Contactos' },
]

export default function Shell() {
  const { pets, pet, setPet, family, loading, openModal } = useApp()
  const [tab, setTab] = useState<Tab>('resumen')

  const logout = async () => { await sb.auth.signOut() }

  const content = () => {
    if (tab === 'resumen') return <Ficha />
    if (tab === 'medico') return <Medico />
    if (tab === 'diario') return <Diario />
    if (tab === 'entreno') return <Entreno />
    if (tab === 'recordatorios') return <Alertas />
    return <Contactos />
  }

  return (
    <div>
      <header className="top">
        <div className="paw"><PawLogo /></div>
        <select value={pet?.id || ''} onChange={(e) => setPet(pets.find((p) => p.id === e.target.value) || null)} title="Mascota">
          {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="sp" />
        <button className="iconbtn" title="Agregar mascota" onClick={() => { if (family) openModal(<PetForm />) }}>
          <Ic name="plus" style={{ width: 18, height: 18, verticalAlign: '-.2em' }} />
        </button>
        <button className="iconbtn" title="Salir" onClick={logout}>Salir</button>
      </header>

      <div className="wrap">
        {loading ? <Spinner /> : content()}
      </div>

      <nav className="tabs">
        {NAV.map((n) => (
          <button key={n.key} className={tab === n.key ? 'active' : ''} onClick={() => setTab(n.key)}>
            <span className="ic"><Ic name={n.ic} /></span>{n.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
