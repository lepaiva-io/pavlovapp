import { useState } from 'react'
import { sb } from '../lib/supabase'
import { Ic } from '../lib/icons'
import { effectiveTheme, toggleTheme } from '../lib/theme'
import Alertas from './tabs/Alertas'
import Contactos from './tabs/Contactos'

type Sub = 'alertas' | 'contactos' | 'app'

export default function Ajustes({ onClose }: { onClose: () => void }) {
  const [sub, setSub] = useState<Sub>('alertas')
  const [theme, setTheme] = useState(effectiveTheme())

  const logout = async () => { await sb.auth.signOut() }
  const flip = () => setTheme(toggleTheme())

  return (
    <div className="settings">
      <div className="settings-top">
        <button className="back" onClick={onClose} aria-label="Volver"><Ic name="chevron" style={{ transform: 'rotate(90deg)' }} /></button>
        <h2>Ajustes</h2>
      </div>
      <div className="settings-body">
        <div className="subtabs">
          <button className={sub === 'alertas' ? 'on' : ''} onClick={() => setSub('alertas')}><Ic name="bell" /> Alertas</button>
          <button className={sub === 'contactos' ? 'on' : ''} onClick={() => setSub('contactos')}><Ic name="contacts" /> Contactos</button>
          <button className={sub === 'app' ? 'on' : ''} onClick={() => setSub('app')}><Ic name="paw" /> App</button>
        </div>

        {sub === 'alertas' && <Alertas />}
        {sub === 'contactos' && <Contactos />}
        {sub === 'app' && (
          <div className="card">
            <div className="setrow">
              <div className="lab"><Ic name={theme === 'dark' ? 'moon' : 'sun'} /> Tema {theme === 'dark' ? 'oscuro' : 'claro'}</div>
              <button className="btn sm sec" onClick={flip}>Cambiar</button>
            </div>
            <div className="setrow" style={{ borderBottom: 'none' }}>
              <div className="lab"><Ic name="undo" /> Cerrar sesión</div>
              <button className="btn sm danger" onClick={logout}>Salir</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
