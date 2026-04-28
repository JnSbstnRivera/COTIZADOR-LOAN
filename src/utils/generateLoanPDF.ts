import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { ClienteData, ConsultorData } from '../components/PDFModal'

// ── Colores ────────────────────────────────────────────────────
const NAVY        = rgb(0.051, 0.125, 0.314)   // #0d2050
const BLUE        = rgb(0.102, 0.337, 0.769)   // #1a56c4  ← WH Financial
const ORANGE_ACC  = rgb(0.973, 0.608, 0.141)   // #F89B24  ← acento / Oriental Bank
const ORANGE_OB   = rgb(0.941, 0.471, 0.000)   // #F07800  ← Oriental Bank header
const GREEN_CASH  = rgb(0.059, 0.537, 0.200)   // #0f8933  ← Cash
const WHITE       = rgb(1, 1, 1)
const LIGHT_BLUE  = rgb(0.918, 0.953, 1.0)     // #ebf3ff
const LIGHT_OB    = rgb(1.0, 0.949, 0.882)     // light orange
const LIGHT_GREEN = rgb(0.878, 0.965, 0.882)   // light green
const GRAY        = rgb(0.4, 0.4, 0.4)
const DARK        = rgb(0.1, 0.1, 0.1)
const BORDER      = rgb(0.773, 0.831, 0.937)   // #c5d4ef

type PagoWH       = { years: number; amount: number; rate: number }
type PagoOriental = { years: number; amount: number; rate: number; amountMax?: number; rateMax?: number }

export interface LoanResumen {
  paneles: string
  baterias: string
  sistemaKW: number
  pronto: number
  cashTotal: number                 // valor total del sistema (sin financiamiento)
  modalidades: string[]             // ['wh', 'oriental', 'cash']
  pagosWH: PagoWH[]
  pagosOriental: PagoOriental[]
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

  const INSERT_AT = 1
  const totalOrig = originalDoc.getPages().length

  if (INSERT_AT > 0) {
    const before = await outputDoc.copyPages(originalDoc, range(0, INSERT_AT))
    before.forEach(p => outputDoc.addPage(p))
  }

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

  // Fondo blanco
  rect(page, 0, 0, width, height, WHITE)

  // ── Header navy ──
  const headerH = 60
  rect(page, 0, height - headerH, width, headerH, NAVY)
  rect(page, 0, height - headerH - 8, width * 0.58, 8, ORANGE_ACC)
  text(page, 'WINDMAR', 22, M, height - 22, bold, WHITE)
  text(page, 'ENERGY by Qcells', 9, M, height - 38, reg, ORANGE_ACC)

  if (logoImage) {
    const lDims = logoImage.scale(0.34)
    page.drawImage(logoImage, {
      x: width - lDims.width - 20,
      y: height - headerH + Math.round((headerH - lDims.height) / 2),
      width: lDims.width, height: lDims.height,
    })
  }

  // ── Título ──
  text(page, 'Cotizacion', 22, M, height - headerH - 26, bold, BLUE)
  const today = new Date().toLocaleDateString('es-PR')

  // ── Bloque cliente / consultor ──
  const colW  = Math.round(width * 0.46)
  const col2X = M + colW + 10
  const col2W = width - col2X - M
  const cY    = height - headerH - 60

  text(page, clean(cliente.nombre),    11, M, cY,       bold, DARK)
  text(page, clean(cliente.direccion),  9, M, cY - 16,  reg,  GRAY)
  text(page, `${clean(cliente.ciudad)}, PR ${cliente.zipCode}`, 9, M, cY - 29, reg, GRAY)
  text(page, cliente.telefono,          9, M, cY - 42,  reg,  GRAY)
  text(page, clean(cliente.email),      9, M, cY - 55,  reg,  BLUE)

  const rowH  = 20
  const tRows: [string, string][] = [
    ['Cotizacion No.', `001   Fecha: ${today}`],
    ['Consultor:', clean(consultor.nombre)],
    ['Telefono:', consultor.telefono],
    ['Correo:', clean(consultor.email)],
  ]
  const tTop = cY + 6
  tRows.forEach(([lbl, val], i) => {
    const ry = tTop - i * rowH
    if (i % 2 === 0) rect(page, col2X, ry - rowH + 5, col2W, rowH, LIGHT_BLUE)
    text(page, lbl, 8, col2X + 5,  ry - 8, bold, BLUE)
    text(page, val, 8, col2X + 84, ry - 8, reg,  DARK)
  })
  page.drawRectangle({
    x: col2X, y: tTop - tRows.length * rowH - 2,
    width: col2W, height: tRows.length * rowH + rowH,
    borderColor: BORDER, borderWidth: 0.6,
  })

  // ── Detalles del Sistema Solar ──
  const secY = height - headerH - 168
  text(page, 'Detalles del Sistema Solar', 13, M, secY, bold, BLUE)
  page.drawLine({ start: { x: M, y: secY - 5 }, end: { x: M + 178, y: secY - 5 }, thickness: 2, color: ORANGE_ACC })

  const sysRows: [string, string][] = [
    ['Cantidad de Paneles:', clean(resumen.paneles)],
    ['Cantidad de Baterias:', clean(resumen.baterias)],
    ['Tamano del Sistema:', `${resumen.sistemaKW} KW`],
  ]
  const rH   = 18
  const valX = 212
  let sy = secY - 28

  sysRows.forEach(([lbl, val], i) => {
    if (i % 2 === 0) rect(page, M, sy - 5, dataW, rH, LIGHT_BLUE)
    text(page, lbl, 9, M + 8, sy + 2, bold, BLUE)
    text(page, val, 9, valX,  sy + 2, reg,  DARK)
    sy -= rH + 3
  })

  page.drawLine({ start: { x: M, y: sy + 2 }, end: { x: M + dataW, y: sy + 2 }, thickness: 0.5, color: BORDER })
  sy -= 14

  // ── Opciones de Cotizacion ──
  text(page, 'Opciones de Cotizacion', 13, M, sy, bold, BLUE)
  page.drawLine({ start: { x: M, y: sy - 5 }, end: { x: M + 155, y: sy - 5 }, thickness: 2, color: ORANGE_ACC })
  sy -= 22

  // Pronto Pago + Total a Financiar (compartido)
  const totalFinanciar = Math.max(resumen.cashTotal - resumen.pronto, 0)
  const finRows: [string, string][] = [
    ['Pronto Pago:', `$${fmt(resumen.pronto)}`],
    ['Total a Financiar:', `$${fmt(totalFinanciar)}`],
  ]
  finRows.forEach(([lbl, val], i) => {
    if (i % 2 === 0) rect(page, M, sy - 5, dataW, 17, LIGHT_BLUE)
    text(page, lbl, 9, M + 8, sy + 2, bold, DARK)
    text(page, val, 9, valX,  sy + 2, bold, DARK)
    sy -= 20
  })
  page.drawLine({ start: { x: M, y: sy + 2 }, end: { x: M + dataW, y: sy + 2 }, thickness: 0.5, color: BORDER })
  sy -= 12

  // ── CASH ──────────────────────────────────────────────────────
  if (resumen.modalidades.includes('cash')) {
    // Badge verde + precio prominente
    rect(page, M, sy - 2, 110, 16, GREEN_CASH)
    text(page, 'PRECIO AL CONTADO', 8, M + 6, sy + 5, bold, WHITE)
    text(page, `$${fmt(resumen.cashTotal)}`, 13, M + 130, sy + 2, bold, GREEN_CASH)
    sy -= 22
    // Fila info
    rect(page, M, sy - 3, dataW, 15, LIGHT_GREEN)
    text(page, 'Valor total del sistema al contado, sin cargos de financiamiento.', 7.5, M + 8, sy + 2, reg, GRAY)
    sy -= 18
    page.drawLine({ start: { x: M, y: sy + 2 }, end: { x: M + dataW, y: sy + 2 }, thickness: 0.5, color: BORDER })
    sy -= 10
  }

  // ── WH FINANCIAL ─────────────────────────────────────────────
  if (resumen.modalidades.includes('wh')) {
    sy = drawPaymentSection(page, sy, M, dataW, bold, reg,
      'WH FINANCIAL', BLUE, LIGHT_BLUE, resumen.pagosWH)
  }

  // ── ORIENTAL BANK ─────────────────────────────────────────────
  if (resumen.modalidades.includes('oriental')) {
    sy = drawPaymentSection(page, sy, M, dataW, bold, reg,
      'ORIENTAL BANK', ORANGE_OB, LIGHT_OB, resumen.pagosOriental)
  }

  // ── Footer ──
  const footerH = 60
  rect(page, 0, 0, width, footerH, NAVY)
  rect(page, 0, footerH - 3, width, 3, ORANGE_ACC)
  rect(page, 0, 0, 4, footerH, ORANGE_ACC)

  if (logoImage) {
    const fD = logoImage.scale(0.28)
    page.drawImage(logoImage, { x: 14, y: Math.round((footerH - fD.height) / 2), width: fD.width, height: fD.height })
  }

  page.drawLine({ start: { x: 230, y: 50 }, end: { x: 230, y: 8 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.7) })
  text(page, 'Contactanos', 7, 242, 44, bold, WHITE)
  text(page, 'ventas@windmarhome.com', 7, 242, 30, reg, rgb(0.8, 0.8, 0.9))
  text(page, '(787) 395-7766', 7, 242, 18, reg, rgb(0.8, 0.8, 0.9))

  page.drawLine({ start: { x: 390, y: 50 }, end: { x: 390, y: 8 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.7) })
  text(page, 'Direccion', 7, 402, 44, bold, WHITE)
  text(page, '1255 Avenida F.D. Roosevelt,', 7, 402, 30, reg, rgb(0.8, 0.8, 0.9))
  text(page, 'San Juan, 00920, Puerto Rico.', 7, 402, 18, reg, rgb(0.8, 0.8, 0.9))
}

// ── Sección de pagos mensuales (WH o Oriental) ─────────────────
function drawPaymentSection(
  page: any, sy: number, M: number, dataW: number,
  bold: any, reg: any,
  title: string, headerColor: any, lightBg: any,
  pagos: { years: number; amount: number; rate: number; amountMax?: number; rateMax?: number }[],
): number {
  const c1 = M + 8
  const c2 = M + 90
  const c3 = M + 200

  // Badge header de color
  rect(page, M, sy - 2, 120, 16, headerColor)
  text(page, title, 8, M + 6, sy + 5, bold, WHITE)
  sy -= 20

  // Cabecera tabla (siempre navy)
  rect(page, M, sy - 3, dataW, 15, NAVY)
  text(page, 'Plazo',       8, c1, sy + 3, bold, WHITE)
  text(page, 'APR',         8, c2, sy + 3, bold, WHITE)
  text(page, 'Mensualidad', 8, c3, sy + 3, bold, WHITE)
  sy -= 19

  if (pagos.length === 0) {
    text(page, 'No hay opciones disponibles con la configuracion actual.', 8, M + 8, sy + 2, reg, GRAY)
    sy -= 16
  } else {
    pagos.forEach(({ years, rate, amount, rateMax, amountMax }, i) => {
      if (i % 2 === 0) rect(page, M, sy - 3, dataW, 16, lightBg)
      const aprStr = rateMax
        ? `${(rate * 100).toFixed(2)}% - ${(rateMax * 100).toFixed(2)}%`
        : `${(rate * 100).toFixed(2)}%`
      const montoStr = amountMax
        ? `$${fmt(amount)} - $${fmt(amountMax)}`
        : `$${fmt(amount)}`
      text(page, `${years} Anos`, 8.5, c1, sy + 2, reg,  DARK)
      text(page, aprStr,          8.5, c2, sy + 2, reg,  DARK)
      text(page, montoStr,        8.5, c3, sy + 2, bold, DARK)
      sy -= 19
    })
  }

  text(page, '* Mensualidades son estimados. Pueden variar segun aprobacion.', 7, M + 8, sy + 2, reg, GRAY)
  sy -= 12

  page.drawLine({ start: { x: M, y: sy + 2 }, end: { x: M + dataW, y: sy + 2 }, thickness: 0.5, color: BORDER })
  sy -= 10

  return sy
}

// ── Helpers ────────────────────────────────────────────────────
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
    .replace(/[úùü]/g, 'u')
    .replace(/[ÁÀÄ]/g, 'A').replace(/[ÉÈË]/g, 'E')
    .replace(/[ÍÌÏ]/g, 'I').replace(/[ÓÒÖ]/g, 'O')
    .replace(/[ÚÙÜ]/g, 'U')
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
