import { fmtDate } from '../lib/helpers'
import { Ic } from '../lib/icons'

export interface WPoint { date: string; kg: number }

export default function WeightChart({ points, target }: { points: WPoint[]; target?: number | null }) {
  if (points.length < 2) {
    return <div className="empty">Registra al menos 2 pesos en el Diario para ver la curva.</div>
  }
  const W = 100, H = 46
  const padL = 13, padR = 3, padT = 4, padB = 9
  const x0 = padL, x1 = W - padR, y0 = padT, y1 = H - padB

  const vals = points.map((p) => p.kg)
  const domainVals = target != null ? [...vals, target] : vals
  let mn = Math.min(...domainVals)
  let mx = Math.max(...domainVals)
  if (mn === mx) { mn -= 0.5; mx += 0.5 }
  const pad = (mx - mn) * 0.12
  mn -= pad; mx += pad
  const sx = (i: number) => x0 + (i / (points.length - 1)) * (x1 - x0)
  const sy = (v: number) => y1 - ((v - mn) / (mx - mn)) * (y1 - y0)

  const line = points.map((p, i) => `${sx(i).toFixed(2)},${sy(p.kg).toFixed(2)}`).join(' ')

  const first = points[0].kg
  const last = points[points.length - 1].kg
  const delta = last - first
  const deltaStr = (delta >= 0 ? '+' : '') + delta.toFixed(1)

  return (
    <div>
      <svg className="wchart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 120 }}>
        {/* eje */}
        <line className="axis" x1={x0} y1={y1} x2={x1} y2={y1} />
        <line className="axis" x1={x0} y1={y0} x2={x0} y2={y1} />
        {/* banda / línea objetivo */}
        {target != null && (
          <>
            <line className="bandline" x1={x0} y1={sy(target)} x2={x1} y2={sy(target)} />
            <text className="ylab" x={x1} y={sy(target) - 1} textAnchor="end">obj {target}</text>
          </>
        )}
        {/* etiquetas Y (min/max) */}
        <text className="ylab" x={x0 - 1} y={y0 + 2} textAnchor="end">{mx.toFixed(1)}</text>
        <text className="ylab" x={x0 - 1} y={y1} textAnchor="end">{mn.toFixed(1)}</text>
        {/* curva */}
        <polyline className="line" points={line} />
        {points.map((p, i) => <circle key={i} className="pt" cx={sx(i)} cy={sy(p.kg)} r={0.9} />)}
        {/* etiquetas X (primera / última fecha) */}
        <text className="xlab" x={x0} y={H - 1} textAnchor="start">{fmtDate(points[0].date).slice(0, 5)}</text>
        <text className="xlab" x={x1} y={H - 1} textAnchor="end">{fmtDate(points[points.length - 1].date).slice(0, 5)}</text>
      </svg>
      <div className="wstat">
        <div className="b"><Ic name="scale" /> Actual<b>{last} kg</b></div>
        <div className="b">Δ desde inicio<b className={delta >= 0 ? 'up' : 'down'}>{deltaStr} kg</b></div>
        {target != null && <div className="b">Objetivo<b>{target} kg</b></div>}
      </div>
    </div>
  )
}
