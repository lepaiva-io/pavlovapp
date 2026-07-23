import { sb } from '../lib/supabase'
import { CAT } from '../lib/constants'
import { fmtDate, todayISO } from '../lib/helpers'
import type { Pet, MedicalRecord, DailyLog } from '../lib/types'

export async function exportVetPdf(pet: Pet) {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableMod.default
  const [{ data: medData }, { data: logData }] = await Promise.all([
    sb.from('medical_records').select('*').eq('pet_id', pet.id)
      .order('event_date', { ascending: false, nullsFirst: false }).order('next_due_date', { ascending: true, nullsFirst: false }),
    sb.from('daily_logs').select('*').eq('pet_id', pet.id).order('log_date', { ascending: false }).limit(30),
  ])
  const meds = (medData || []) as MedicalRecord[]
  const logs = (logData || []) as DailyLog[]

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const M = 40
  let y = 46

  // Encabezado
  doc.setFillColor(0x23, 0x74, 0xab)
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 8, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(0x0e, 0x3a, 0x53)
  doc.text('Ficha veterinaria — ' + pet.name, M, y)
  y += 18
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(0x5c, 0x63, 0x6b)
  doc.text('Generado con Pavlovapp · ' + fmtDate(todayISO()), M, y)
  y += 22

  // Datos de la mascota
  const info: [string, string][] = [
    ['Especie', pet.species || '—'], ['Raza', pet.breed || '—'], ['Sexo', pet.sex || '—'],
    ['Edad aprox.', pet.birthdate_approx || '—'], ['Adopción', fmtDate(pet.adoption_date)],
    ['Microchip', pet.microchip || '—'], ['Esterilizada', pet.sterilized ? 'Sí' : 'No'],
    ['Clínica', pet.clinic_name || '—'], ['Estado', pet.status || '—'],
  ]
  autoTable(doc, {
    startY: y, margin: { left: M, right: M },
    body: info, theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [0x12, 0x32, 0x40], cellWidth: 110 } },
  })
  y = (doc as any).lastAutoTable.finalY + 18

  // Peso
  const weights = logs.filter((l) => l.weight_kg != null).map((l) => ({ date: l.log_date, kg: Number(l.weight_kg) }))
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(0x0e, 0x3a, 0x53)
  doc.text('Peso', M, y); y += 6
  if (weights.length) {
    const cur = weights[0].kg
    const oldest = weights[weights.length - 1].kg
    const delta = cur - oldest
    const line = `Actual: ${cur} kg  ·  Δ en el período: ${(delta >= 0 ? '+' : '') + delta.toFixed(1)} kg` +
      (pet.target_weight_kg != null ? `  ·  Objetivo: ${pet.target_weight_kg} kg` : '')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(0x12, 0x32, 0x40)
    doc.text(line, M, y + 12)
    autoTable(doc, {
      startY: y + 20, margin: { left: M, right: M },
      head: [['Fecha', 'Peso (kg)']],
      body: weights.slice(0, 12).map((w) => [fmtDate(w.date), String(w.kg)]),
      headStyles: { fillColor: [0x23, 0x74, 0xab] }, styles: { fontSize: 9, cellPadding: 3 },
    })
    y = (doc as any).lastAutoTable.finalY + 18
  } else {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(0x5c, 0x63, 0x6b)
    doc.text('Sin registros de peso.', M, y + 14); y += 30
  }

  // Historial médico
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(0x0e, 0x3a, 0x53)
  doc.text('Historial médico', M, y); y += 6
  autoTable(doc, {
    startY: y + 4, margin: { left: M, right: M },
    head: [['Tipo', 'Título', 'Fecha', 'Próxima', 'Vet', 'Hecho']],
    body: meds.length ? meds.map((m) => [
      (CAT[m.category] || CAT.nota).label, m.title, fmtDate(m.event_date), fmtDate(m.next_due_date), m.vet_name || '—', m.done ? 'Sí' : '—',
    ]) : [['—', 'Sin registros médicos', '', '', '', '']],
    headStyles: { fillColor: [0x23, 0x74, 0xab] }, styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
    columnStyles: { 1: { cellWidth: 130 } },
  })
  y = (doc as any).lastAutoTable.finalY + 18

  // Últimos registros diarios
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(0x0e, 0x3a, 0x53)
  doc.text('Últimos registros diarios', M, y)
  autoTable(doc, {
    startY: y + 10, margin: { left: M, right: M },
    head: [['Fecha', 'Peso', 'Ánimo', 'Comidas', 'Deposiciones', 'Notas']],
    body: logs.length ? logs.slice(0, 20).map((l) => [
      fmtDate(l.log_date), l.weight_kg != null ? String(l.weight_kg) : '—', l.mood || '—', l.meals || '—', l.stool || '—', l.notes || '—',
    ]) : [['—', '', '', '', '', 'Sin registros']],
    headStyles: { fillColor: [0x23, 0x74, 0xab] }, styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    columnStyles: { 3: { cellWidth: 90 }, 5: { cellWidth: 110 } },
  })

  doc.save(`Ficha_${pet.name.replace(/\s+/g, '_')}_${todayISO()}.pdf`)
}
