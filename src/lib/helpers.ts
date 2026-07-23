// Fecha local (respeta zona horaria del dispositivo, ej. America/Santiago)
export const todayISO = (): string => {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export const fmtDate = (d?: string | null): string => {
  if (!d) return '—'
  const [y, m, dd] = d.split('-')
  return `${dd}-${m}-${y}`
}

// Inicio del día local en ISO timestamp (para filtrar eventos de hoy)
export const startOfLocalDayISO = (dayISO?: string): string => {
  const day = dayISO || todayISO()
  return new Date(`${day}T00:00:00`).toISOString()
}
export const endOfLocalDayISO = (dayISO?: string): string => {
  const day = dayISO || todayISO()
  return new Date(`${day}T23:59:59.999`).toISOString()
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export const longDate = (dayISO?: string): string => {
  const day = dayISO || todayISO()
  const dt = new Date(`${day}T12:00:00`)
  return `${DIAS[dt.getDay()]}, ${dt.getDate()} de ${MESES[dt.getMonth()]}`
}

// hora local HH:MM desde un timestamp ISO
export const timeHM = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// convierte un timestamp ISO a fecha local YYYY-MM-DD
export const localDateOf = (iso: string): string => {
  const d = new Date(iso)
  const l = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return l.toISOString().slice(0, 10)
}

// diferencia en días entre hoy y una fecha ISO (fecha - hoy)
export const daysFromToday = (d?: string | null): number | null => {
  if (!d) return null
  const a = new Date(`${todayISO()}T00:00:00`).getTime()
  const b = new Date(`${d}T00:00:00`).getTime()
  return Math.round((b - a) / 86400000)
}
