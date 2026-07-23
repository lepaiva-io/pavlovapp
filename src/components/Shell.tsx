import { useState } from 'react'
import { useApp } from '../state/store'
import { Ic } from '../lib/icons'
import { PawLogo, Spinner } from './ui'
import { PetForm } from './forms/Forms'
import Inicio from './tabs/Inicio'
import Ficha from './tabs/Ficha'
import Diario from './tabs/Diario'
import Entreno from './tabs/Entreno'
import Ajustes from './Ajustes'

type Tab = 'inicio' | 'ficha' | 'diario' | 'entreno'

const NAV: { key: Tab; ic: string; label: string }[] = [
  { key: 'inicio', ic: 'paw', label: 'Inicio' },
  { key: 'ficha', ic: 'clipboard', label: 'Ficha' },
  { key: 'diario', ic: 'notebook', label: 'Diario' },
  { key: 'entreno', ic: 'cap', label: 'Entreno' },
]

export default function Shell() {
  const { pets, pet, setPet, family, loading, openModal } = useApp()
  const [tab, setTab] = useState<Tab>('inicio')
  const [settings, setSettings] = useState(false)

  const content = () => {
    if (tab === 'inicio') return <Inicio />
    if (tab === 'ficha') return <Ficha />
    if (tab === 'diario') return <Diario />
    return <Entreno />
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
        <button className="iconbtn" title="Ajustes" onClick={() => setSettings(true)}>
          <Ic name="gear" style={{ width: 18, height: 18, verticalAlign: '-.2em' }} />
        </button>
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

      {settings && <Ajustes onClose={() => setSettings(false)} />}
    </div>
  )
}
