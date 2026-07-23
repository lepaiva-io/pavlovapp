import type { ReactNode } from 'react'

export function PawLogo() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M32 12c-9.6 0-15.2 7.4-15.2 18.4 0 5.4-1.7 9-3.8 11.7-1.7 2.1-.2 4.9 2.5 4.9h33c2.7 0 4.2-2.8 2.5-4.9-2.1-2.7-3.8-6.3-3.8-11.7C47.2 19.4 41.6 12 32 12Z" fill="#2374AB" />
      <circle cx="32" cy="11.5" r="6.2" fill="#18211D" />
      <path d="M27.3 46h9.4v6.8c0 2.6-2.1 4.7-4.7 4.7s-4.7-2.1-4.7-4.7V46Z" fill="#FF8484" />
    </svg>
  )
}

export function Spinner() {
  return <div className="spin" />
}

export function Field({ label, name, defaultValue, type = 'text', placeholder = '' }: {
  label: string; name: string; defaultValue?: string | number | null; type?: string; placeholder?: string
}) {
  return (
    <>
      <label>{label}</label>
      <input name={name} type={type} defaultValue={defaultValue == null ? '' : String(defaultValue)} placeholder={placeholder} />
    </>
  )
}

export function Area({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return (
    <>
      <label>{label}</label>
      <textarea name={name} defaultValue={defaultValue || ''} />
    </>
  )
}

export function SelectF({ label, name, defaultValue, options }: {
  label: string; name: string; defaultValue?: string; options: [string, string][]
}) {
  return (
    <>
      <label>{label}</label>
      <select name={name} defaultValue={defaultValue || ''}>
        {options.map((o) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
      </select>
    </>
  )
}

export function Gap({ h = 12 }: { h?: number }) {
  return <div style={{ height: h }} />
}

export function FullScreen({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fs">
      <div className="fs-top">
        <h3>{title}</h3>
        <button className="fs-x" onClick={onClose} aria-label="Cerrar">×</button>
      </div>
      <div className="fs-body">{children}</div>
    </div>
  )
}

export function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-bg" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('modal-bg')) onClose() }}>
      <div className="modal">
        <button className="close" onClick={onClose} aria-label="Cerrar">×</button>
        <h3>{title}</h3>
        <div>{children}</div>
      </div>
    </div>
  )
}
