export type Theme = 'light' | 'dark'

const KEY = 'pavlov-theme'

function stored(): Theme | null {
  const v = localStorage.getItem(KEY)
  return v === 'dark' || v === 'light' ? v : null
}

// Aplica la preferencia guardada (si no hay, sigue al sistema vía CSS)
export function applyTheme() {
  const s = stored()
  const root = document.documentElement
  if (s) root.setAttribute('data-theme', s)
  else root.removeAttribute('data-theme')
}

export function effectiveTheme(): Theme {
  const a = document.documentElement.getAttribute('data-theme')
  if (a === 'dark' || a === 'light') return a
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function toggleTheme(): Theme {
  const next: Theme = effectiveTheme() === 'dark' ? 'light' : 'dark'
  localStorage.setItem(KEY, next)
  document.documentElement.setAttribute('data-theme', next)
  return next
}
