// Clicker de marcador: emite un clic corto y consistente (Web Audio).
// El "clic" marca el instante del acierto → luego viene el premio.

const KEY = 'pavlov-click-sound'
let ctx: AudioContext | null = null

export function soundOn(): boolean {
  return localStorage.getItem(KEY) !== 'off'
}
export function setSound(on: boolean) {
  localStorage.setItem(KEY, on ? 'on' : 'off')
}

// Debe llamarse desde un gesto del usuario (toque) para que iOS habilite el audio.
export function playClick() {
  if (!soundOn()) return
  try {
    type ACtor = typeof AudioContext
    const AC: ACtor = window.AudioContext || (window as unknown as { webkitAudioContext: ACtor }).webkitAudioContext
    ctx = ctx || new AC()
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.setValueAtTime(2400, t)
    o.frequency.exponentialRampToValueAtTime(1400, t + 0.018)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.45, t + 0.002)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)
    o.connect(g).connect(ctx.destination)
    o.start(t)
    o.stop(t + 0.06)
  } catch {
    // audio no disponible: seguimos sin sonido
  }
}
