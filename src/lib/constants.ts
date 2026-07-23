export const CAT: Record<string, { label: string; ic: string }> = {
  vacuna: { label: 'Vacuna', ic: 'syringe' },
  desparasitacion_interna: { label: 'Desparasitación interna', ic: 'pill' },
  desparasitacion_externa: { label: 'Desparasitación externa', ic: 'bug' },
  esterilizacion: { label: 'Esterilización', ic: 'scissors' },
  consulta: { label: 'Consulta', ic: 'stethoscope' },
  receta: { label: 'Receta / dieta', ic: 'clipboard' },
  nota: { label: 'Nota', ic: 'note' },
}

export const ROLE: Record<string, { ic: string; l: string }> = {
  veterinaria: { ic: 'stethoscope', l: 'Veterinaria' },
  peluqueria: { ic: 'scissors', l: 'Peluquería' },
  paseador: { ic: 'paw', l: 'Paseador' },
  otro: { ic: 'contacts', l: 'Otro' },
}

export const STLABEL: Record<string, string> = {
  pendiente: 'Pendiente', en_progreso: 'En progreso', logrado: 'Logrado',
}
export const STDOT: Record<string, string> = {
  pendiente: 'pend', en_progreso: 'prog', logrado: 'ok',
}

// Registro de un toque
export const QUICK: { type: string; label: string; ic: string }[] = [
  { type: 'comio', label: 'Comió', ic: 'bowl' },
  { type: 'pipi', label: 'Pipí', ic: 'drop' },
  { type: 'caca', label: 'Caca', ic: 'poop' },
  { type: 'agua', label: 'Agua', ic: 'waterdrop' },
  { type: 'sesion', label: 'Sesión', ic: 'cap' },
]
