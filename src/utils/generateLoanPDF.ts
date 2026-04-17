import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { ClienteData, ConsultorData } from '../components/PDFModal'

// ── colores Windmar ────────────────────────────────────────────
const NAVY   = rgb(0.051, 0.125, 0.314)   // #0d2050
const BLUE   = rgb(0.102, 0.337, 0.769)   // #1a56c4
const ORANGE = rgb(0.973, 0.608, 0.141)   // #F89B24
const WHITE  = rgb(1, 1, 1)
const LIGHT  = rgb(0.918, 0.953, 1.0)     // #ebf3ff
const GRAY   = rgb(0.4, 0.4, 0.4)
const DARK   = rgb(0.1, 0.1, 0.1)
const BORDER = rgb(0.773, 0.831, 0.937)   // #c5d4ef
const GREEN  = rgb(0.059, 0.600, 0.322)   // para badge WH

export interface LoanResumen {
  paneles: string
  baterias: string
  sistemaKW: number
  financiera: string
  pronto: number
  totalFinanciar: number
  pagos: { years: number; amount: number; amountMax?: number; rate: number; rateMax?: number }[]
}

export async function generateLoanPDF(
  cliente: ClienteData,
  consultor: ConsultorData,
  resumen: LoanResumen,
) {
  const res = await fetch('/loan-modelo.pdf')
  if (!res.ok) throw new Error('No se pudo cargar el PDF modelo')
  const originalBytes = await res.arrayBuffer()
  const originalDoc   = await PDFDocument.load(originalBytes)

  const outputDoc = await PDFDocument.create()
  const boldFont  = await outputDoc.embedFont(StandardFonts.HelveticaBold)
  const regFont   = await outputDoc.embedFont(StandardFonts.Helvetica)

  const INSERT_AT = 1  // insertar como 2ª página (índice 1)
  const totalOrig = originalDoc.getPages().length

  if (INSERT_AT > 0) {
    const before = await outputDoc.copyPages(originalDoc, range(0, INSERT_AT))
    before.forEach(p => outputDoc.addPage(p))
  }

  // Logo Windmar
  let logoImage: any = null
  try {
    const logoRes = await fetch('https://i.postimg.cc/6T5J2v2G/logo.png')
    if (logoRes.ok) {
      const logoBytes = await logoRes.arrayBuffer()
      logoImage = await outputDoc.embedPng(logoBytes)
    }
  } catch { /* logo opcional */ }

  const { width, height } = originalDoc.getPages()[0].getSize()
  const newPage = outputDoc.addPage([width, height])
  drawCotizacionLoan(newPage, { width, height }, boldFont, regFont,
    cliente, consultor, resumen, logoImage)

  if (INSERT_AT < totalOrig) {
    const after = await outputDoc.copyPages(originalDoc, range(INSERT_AT, totalOrig))
    after.forEach(p => outputDoc.addPage(p))
  }

  const bytes = await outputDoc.save()
  downloadPDF(bytes, `Cotizacion-Loan-${clean(cliente.nombre)}.pdf`)
}

function drawCotizacionLoan(
  page: any,
  { width, height }: { width: number; height: number },
  bold: any,
  reg: any,
  cliente: ClienteData,
  consultor: ConsultorData,
  resumen: LoanResumen,
  logoImage: any = null,
) {
  const M     = 36
  const dataW = width - M * 2

  // ── Fondo blanco ──
  rect(page, 0, 0, width, height, WHITE)

  // ── Header navy ──
  const headerH = 104
  rect(page, 0, height - headerH, width, headerH, NAVY)
  rect(page, 0, height - headerH - 8, width * 0.58, 8, ORANGE)

  text(page, 'WINDMAR', 24, M, height - 46, bold, WHITE)
  text(page, 'ENERGY by Qcells', 10, M, height - 67, reg, ORANGE)

  // Logo Windmar (derecha, grande, centrado verticalmente)
  if (logoImage) {
    const lDims = logoImage.scale(0.28)
    const lx    = width - lDims.width - 20
    const ly    = height - headerH + Math.round((headerH - lDims.height) / 2)
    page.drawImage(logoImage, { x: lx, y: ly, width: lDims.width, height: lDims.height })
  }

  // ── Título ──
  text(page, 'Cotizacion', 22, M, height - headerH - 26, bold, BLUE)

  const today = new Date().toLocaleDateString('es-PR')

  // ── Bloque cliente / consultor ──
  const colW  = Math.round(width * 0.46)
  const col2X = M + colW + 10
  const col2W = width - col2X - M

  const cY = height - headerH - 60
  text(page, clean(cliente.nombre),   11, M, cY,       bold, DARK)
  text(page, clean(cliente.direccion),  9, M, cY - 16, reg,  GRAY)
  text(page, `${clean(cliente.ciudad)}, PR ${cliente.zipCode}`, 9, M, cY - 29, reg, GRAY)
  text(page, cliente.telefono,          9, M, cY - 42, reg,  GRAY)
  text(page, clean(cliente.email),      9, M, cY - 55, reg,  BLUE)

  const rowH = 20
  const tRows: [string, string][] = [
    ['Cotizacion No.', `001   Fecha: ${today}`],
    ['Consultor:', clean(consultor.nombre)],
    ['Telefono:', consultor.telefono],
    ['Correo:', clean(consultor.email)],
  ]
  const tTop = cY + 6
  tRows.forEach(([lbl, val], i) => {
    const ry = tTop - i * rowH
    if (i % 2 === 0) rect(page, col2X, ry - rowH + 5, col2W, rowH, LIGHT)
    text(page, lbl, 8, col2X + 5, ry - 8, bold, BLUE)
    text(page, val, 8, col2X + 84, ry - 8, reg,  DARK)
  })
  page.drawRectangle({
    x: col2X,
    y: tTop - tRows.length * rowH - 2,
    width:  col2W,
    height: tRows.length * rowH + rowH,
    borderColor: BORDER,
    borderWidth: 0.6,
  })

  // ── Sección: Detalles del Sistema Solar ──
  const secY = height - headerH - 168
  text(page, 'Detalles del Sistema Solar', 13, M, secY, bold, BLUE)
  page.drawLine({
    start: { x: M, y: secY - 5 },
    end:   { x: M + 178, y: secY - 5 },
    thickness: 2, color: ORANGE,
  })

  const sysRows: [string, string][] = [
    ['Cantidad de Paneles:', clean(resumen.paneles)],
    ['Cantidad de Baterias:', clean(resumen.baterias)],
    ['Tamano del Sistema:',   `${resumen.sistemaKW} KW`],
  ]
  const rH = 20
  const valX = 212
  let sy = secY - 30
  sysRows.forEach(([lbl, val], i) => {
    if (i % 2 === 0) rect(page, M, sy - 6, dataW, rH, LIGHT)
    text(page, lbl, 9, M + 8, sy + 3, bold, BLUE)
    text(page, val, 9, valX,  sy + 3, reg,  DARK)
    sy -= rH + 4
  })

  page.drawLine({
    start: { x: M, y: sy + 2 },
    end:   { x: width - M, y: sy + 2 },
    thickness: 0.5, color: BORDER,
  })
  sy -= 16

  // ── Sección: Opciones de Financiamiento ──
  text(page, 'Opciones de Financiamiento', 13, M, sy, bold, BLUE)
  page.drawLine({
    start: { x: M, y: sy - 5 },
    end:   { x: M + 185, y: sy - 5 },
    thickness: 2, color: ORANGE,
  })
  sy -= 20

  // Badge financiera
  const isWH = resumen.financiera === 'WH Financial'
  const badgeColor = isWH ? GREEN : NAVY
  rect(page, M, sy - 4, 110, 18, badgeColor)
  text(page, clean(resumen.financiera).toUpperCase(), 8, M + 8, sy + 3, bold, WHITE)
  sy -= 24

  // Filas de resumen financiero
  const finRows: [string, string][] = [
    ['Pronto Pago:', `$${fmt(resumen.pronto)}`],
    ['Total a Financiar:', `$${fmt(resumen.totalFinanciar)}`],
  ]
  finRows.forEach(([lbl, val], i) => {
    if (i % 2 === 0) rect(page, M, sy - 6, dataW, rH, LIGHT)
    text(page, lbl, 9, M + 8, sy + 3, bold, DARK)
    text(page, val, 9, valX,  sy + 3, bold, DARK)
    sy -= rH + 4
  })

  page.drawLine({
    start: { x: M, y: sy + 2 },
    end:   { x: width - M, y: sy + 2 },
    thickness: 0.5, color: BORDER,
  })
  sy -= 16

  // ── Tabla de pagos mensuales ──
  text(page, 'Mensualidades Estimadas', 10, M, sy, bold, BLUE)
  sy -= 18

  // Cabecera tabla
  const c1 = M + 8, c2 = M + 90, c3 = M + 200
  rect(page, M, sy - 4, dataW, 16, NAVY)
  text(page, 'Plazo',       8, c1, sy + 3, bold, WHITE)
  text(page, 'APR',         8, c2, sy + 3, bold, WHITE)
  text(page, 'Mensualidad', 8, c3, sy + 3, bold, WHITE)
  sy -= 20

  resumen.pagos.forEach(({ years, rate, amount, rateMax, amountMax }, i) => {
    if (i % 2 === 0) rect(page, M, sy - 6, dataW, rH, LIGHT)
    const aprStr = rateMax
      ? `${(rate * 100).toFixed(2)}% - ${(rateMax * 100).toFixed(2)}%`
      : `${(rate * 100).toFixed(2)}%`
    const montoStr = amountMax
      ? `$${fmt(amount)} - $${fmt(amountMax)}`
      : `$${fmt(amount)}`
    text(page, `${years} anos`, 9, c1, sy + 3, reg,  DARK)
    text(page, aprStr,          9, c2, sy + 3, reg,  DARK)
    text(page, montoStr,        9, c3, sy + 3, bold, DARK)
    sy -= rH + 4
  })

  if (resumen.pagos.length === 0) {
    text(page, 'No hay opciones disponibles con la seleccion actual.', 9, M + 8, sy + 3, reg, GRAY)
    sy -= rH + 4
  }

  text(page, '* Mensualidades son estimados. Pueden variar segun aprobacion.', 7.5, M + 8, sy, reg, GRAY)

  // ── CTA ──
  const ctaY = sy - 32
  text(page, 'Cotiza hoy y empieza a ahorrar con energia confiable.', 13, M, ctaY, reg, BLUE)
  text(page, 'Accesible, simple y rapido.', 15, M, ctaY - 19, bold, NAVY)

  // Badge financiera (CTA)
  const bY = ctaY - 48
  rect(page, M, bY - 5, isWH ? 110 : 80, 22, NAVY)
  text(page, isWH ? 'WH FINANCIAL' : 'ORIENTAL BANK', 8, M + 8, bY + 5, bold, WHITE)

  // ── Beneficios ──
  const benY = ctaY - 80
  const benW = dataW / 3
  const bens = [
    'Aprobacion rapida y flexible',
    'Garantia, instalacion y servicio incluidos',
    'Servicio al cliente 24/7',
  ]
  bens.forEach((b, i) => {
    text(page, b, 8, M + 4 + i * benW, benY, i === 2 ? bold : reg, i === 2 ? NAVY : GRAY)
    if (i < 2) page.drawLine({
      start: { x: M + (i + 1) * benW, y: benY + 12 },
      end:   { x: M + (i + 1) * benW, y: benY - 8 },
      thickness: 0.5, color: GRAY,
    })
  })

  // ── Footer ──
  rect(page, 0, 0, width, 65, NAVY)
  rect(page, 0, 63, width, 3, ORANGE)
  rect(page, 0, 0, 4, 65, ORANGE)

  if (logoImage) {
    const fD = logoImage.scale(0.065)
    const fY = Math.round((65 - fD.height) / 2)
    page.drawImage(logoImage, { x: 19, y: fY, width: fD.width, height: fD.height })
  }

  page.drawLine({ start: { x: 158, y: 57 }, end: { x: 158, y: 8 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.7) })
  text(page, 'Contactanos', 7, 168, 47, bold, WHITE)
  text(page, 'ventas@windmarhome.com', 7, 168, 35, reg, rgb(0.8, 0.8, 0.9))
  text(page, '(787) 395-7766', 7, 168, 23, reg, rgb(0.8, 0.8, 0.9))

  page.drawLine({ start: { x: 310, y: 57 }, end: { x: 310, y: 8 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.7) })
  text(page, 'Direccion', 7, 322, 47, bold, WHITE)
  text(page, '1255 Avenida F.D. Roosevelt,', 7, 322, 35, reg, rgb(0.8, 0.8, 0.9))
  text(page, 'San Juan, 00920, Puerto Rico.', 7, 322, 23, reg, rgb(0.8, 0.8, 0.9))
}

// ── helpers ───────────────────────────────────────────────────
function rect(page: any, x: number, y: number, w: number, h: number, color: any) {
  page.drawRectangle({ x, y, width: w, height: h, color })
}
function text(page: any, t: string, size: number, x: number, y: number, font: any, color: any) {
  try { page.drawText(t, { x, y, size, font, color }) } catch { /* chars no soportados */ }
}
function clean(s: string): string {
  return s
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[ÁÀÄ]/g, 'A').replace(/[ÉÈË]/g, 'E')
    .replace(/[ÍÌÏ]/g, 'I').replace(/[ÓÒÖ]/g, 'O')
    .replace(/[ÚÙÜ]/g, 'U').replace(/[Ñ]/g, 'N')
}
function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}
function range(from: number, to: number) {
  return Array.from({ length: to - from }, (_, i) => i + from)
}
function downloadPDF(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
