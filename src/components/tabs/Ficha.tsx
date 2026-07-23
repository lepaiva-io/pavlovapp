import { useState } from 'react'
import { Ic } from '../../lib/icons'
import General from './General'
import Medico from './Medico'
import Familia from './Familia'

type Sub = 'general' | 'medico' | 'familia'

export default function Ficha() {
  const [sub, setSub] = useState<Sub>('general')
  return (
    <div>
      <div className="sect-title"><h2><Ic name="paw" /> Ficha</h2></div>
      <div className="subtabs">
        <button className={sub === 'general' ? 'on' : ''} onClick={() => setSub('general')}><Ic name="paw" /> General</button>
        <button className={sub === 'medico' ? 'on' : ''} onClick={() => setSub('medico')}><Ic name="stethoscope" /> Médico</button>
        <button className={sub === 'familia' ? 'on' : ''} onClick={() => setSub('familia')}><Ic name="users" /> Familia</button>
      </div>
      {sub === 'general' && <General />}
      {sub === 'medico' && <Medico />}
      {sub === 'familia' && <Familia />}
    </div>
  )
}
