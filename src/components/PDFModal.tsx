import { useState } from 'react'
import { X, Download, FileText } from 'lucide-react'

// ── tipos compartidos ──────────────────────────────────────────
export interface ClienteData {
  nombre: string
  direccion: string
  ciudad: string
  zipCode: string
  telefono: string
  email: string
}

export interface ConsultorData {
  nombre: string
  email: string
  telefono: string
}

// ── props del modal ────────────────────────────────────────────
interface PDFModalProps {
  isOpen: boolean
  onClose: () => void
  tipo: 'lease' | 'loan' | 'roofing'
  resumen: Record<string, string | number>   // datos auto de la app
  onGenerate: (cliente: ClienteData, consultor: ConsultorData) => Promise<void>
  // Para LOAN: selector múltiple de modalidades
  modalidades?: string[]
  modalidadesSeleccionadas?: string[]
  onModalidadesChange?: (m: string[]) => void
  // Para ROOFING: selector múltiple de planes
  planes?: string[]
  planesSeleccionados?: string[]
  onPlanesChange?: (planes: string[]) => void
  // Idioma del PDF
  idioma?: 'es' | 'en'
  onIdiomaChange?: (i: 'es' | 'en') => void
  // Para LOAN: modelo de batería
  powerwallVersion?: 2 | 3
  onPowerwallChange?: (v: 2 | 3) => void
  // Promo Mes de las Madres 2026 — solo LOAN
  promoMadres?: { whCash: boolean; powerwall3: boolean }
  onPromoMadresChange?: (v: { whCash: boolean; powerwall3: boolean }) => void
  sistemaKW?: number
  cantidadBaterias?: number
  // Promoción Farmacias (10% fijo solo sobre placas)
  farmacias?: { activa: boolean; nombre: string }
  onFarmaciasChange?: (v: { activa: boolean; nombre: string }) => void
}

const TITULOS = {
  lease:   'Cotización LEASE PPA',
  loan:    'Cotización LOAN',
  roofing: 'Cotización ROOFING',
}

// ── helper de campo (fuera del componente para evitar re-mount en cada tecla) ──
function Field({
  label, value, onChange, type = 'text', colSpan = 1,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; colSpan?: number
}) {
  return (
    <div style={{ gridColumn: colSpan === 2 ? 'span 2' : 'span 1' }}>
      <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', border: '1px solid #d0d9ef', borderRadius: 8,
          padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ── componente ────────────────────────────────────────────────
export function PDFModal({
  isOpen, onClose, tipo, resumen, onGenerate,
  modalidades, modalidadesSeleccionadas, onModalidadesChange,
  planes, planesSeleccionados, onPlanesChange,
  idioma = 'es', onIdiomaChange,
  powerwallVersion = 3, onPowerwallChange,
  promoMadres, onPromoMadresChange, sistemaKW = 0, cantidadBaterias = 0,
  farmacias, onFarmaciasChange,
}: PDFModalProps) {

  const [cliente, setCliente] = useState<ClienteData>({
    nombre: '', direccion: '', ciudad: '', zipCode: '', telefono: '', email: '',
  })
  const [consultor, setConsultor] = useState<ConsultorData>({
    nombre: '', email: '', telefono: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [promosOpen, setPromosOpen] = useState(false)
  const [madresOpen, setMadresOpen] = useState(true)
  const [farmaOpen,   setFarmaOpen]   = useState(true)

  const handleGenerate = async () => {
    if (!cliente.nombre.trim() || !consultor.nombre.trim()) {
      setError('Nombre del cliente y consultor son requeridos.')
      return
    }
    if (tipo === 'loan' && (modalidadesSeleccionadas?.length ?? 0) === 0) {
      setError('Selecciona al menos una modalidad de cotización.')
      return
    }
    if (tipo === 'roofing' && (planesSeleccionados?.length ?? 0) === 0) {
      setError('Selecciona al menos un plan de sellado.')
      return
    }
    if (farmacias?.activa) {
      if (!farmacias.nombre.trim()) {
        setError('Ingresa el nombre de la farmacia antes de generar el PDF.')
        return
      }
    }
    setError('')
    setLoading(true)
    try {
      await onGenerate(cliente, consultor)
      onClose()
    } catch (e) {
      setError('Error generando el PDF. Intenta de nuevo.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #e8eef7',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={22} color="#1a56c4" />
            <span style={{ fontSize: 17, fontWeight: 700, color: '#1a56c4' }}>
              {TITULOS[tipo]}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onIdiomaChange && (
              <div style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', border: '1.5px solid #1a56c4' }}>
                {(['es', 'en'] as const).map(lang => (
                  <button key={lang} onClick={() => onIdiomaChange(lang)} style={{
                    padding: '4px 12px', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', border: 'none',
                    background: idioma === lang ? '#1a56c4' : 'white',
                    color:      idioma === lang ? 'white'   : '#1a56c4',
                    transition: 'all 0.15s',
                  }}>
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={22} color="#888" />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── DATOS DEL CLIENTE ── */}
          <section>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#1a56c4',
              borderBottom: '2px solid #F89B24', paddingBottom: 4, marginBottom: 12,
            }}>
              Datos del Cliente
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Nombre completo *"  value={cliente.nombre}    onChange={v => setCliente({...cliente, nombre: v})}    colSpan={2} />
              <Field label="Dirección"          value={cliente.direccion} onChange={v => setCliente({...cliente, direccion: v})} colSpan={2} />
              <Field label="Ciudad"             value={cliente.ciudad}    onChange={v => setCliente({...cliente, ciudad: v})} />
              <Field label="ZIP Code"           value={cliente.zipCode}   onChange={v => setCliente({...cliente, zipCode: v})} />
              <Field label="Teléfono"           value={cliente.telefono}  onChange={v => setCliente({...cliente, telefono: v})} />
              <Field label="Email"              value={cliente.email}     onChange={v => setCliente({...cliente, email: v})} type="email" />
            </div>
          </section>

          {/* ── DATOS DEL CONSULTOR ── */}
          <section>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#1a56c4',
              borderBottom: '2px solid #F89B24', paddingBottom: 4, marginBottom: 12,
            }}>
              Datos del Consultor
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Nombre del Consultor *" value={consultor.nombre}   onChange={v => setConsultor({...consultor, nombre: v})}   colSpan={2} />
              <Field label="Email del Consultor"    value={consultor.email}    onChange={v => setConsultor({...consultor, email: v})}    type="email" />
              <Field label="Teléfono del Consultor" value={consultor.telefono} onChange={v => setConsultor({...consultor, telefono: v})} />
            </div>
          </section>

          {/* ── MODELO DE BATERÍA — solo LOAN ── */}
          {tipo === 'loan' && onPowerwallChange && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#f7f9ff', borderRadius: 8, padding: '8px 12px',
            }}>
              <span style={{ fontSize: 16 }}>🔋</span>
              <span style={{ fontSize: 12, color: '#555', fontWeight: 600, flex: 1 }}>
                Modelo de Batería
              </span>
              <div style={{ display: 'flex', borderRadius: 16, overflow: 'hidden', border: '1.5px solid #d0d9ef' }}>
                {([2, 3] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => onPowerwallChange(v)}
                    style={{
                      padding: '4px 14px', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', border: 'none',
                      background: powerwallVersion === v ? '#0d2050' : 'white',
                      color:      powerwallVersion === v ? 'white'   : '#555',
                      transition: 'all 0.15s',
                    }}
                  >
                    PW{v}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 11, color: '#888', minWidth: 60 }}>
                Powerwall {powerwallVersion} · 13.5 kWh
              </span>
            </div>
          )}

          {/* ── SELECTOR MODALIDADES — solo LOAN ── */}
          {tipo === 'loan' && modalidades && (
            <section>
              <div style={{
                fontSize: 13, fontWeight: 700, color: '#1a56c4',
                borderBottom: '2px solid #F89B24', paddingBottom: 4, marginBottom: 12,
              }}>
                Modalidad de Cotización (selección múltiple)
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {modalidades.map(m => {
                  const selected = modalidadesSeleccionadas?.includes(m)
                  const info: Record<string, { label: string; color: string }> = {
                    wh:       { label: 'WH Financial', color: '#1a56c4' },
                    oriental: { label: 'Oriental Bank', color: '#E07000' },
                    cash:     { label: 'Cash',          color: '#0f8933' },
                  }
                  const { label, color } = info[m] ?? { label: m, color: '#888' }
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        const curr = modalidadesSeleccionadas ?? []
                        onModalidadesChange?.(
                          selected ? curr.filter(p => p !== m) : [...curr, m]
                        )
                      }}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13,
                        cursor: 'pointer', fontWeight: 700,
                        border: `2px solid ${selected ? color : '#d0d9ef'}`,
                        background: selected ? color : 'white',
                        color: selected ? 'white' : '#555',
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {(modalidadesSeleccionadas?.length ?? 0) === 0 && (
                <p style={{ fontSize: 11, color: '#e74c3c', marginTop: 6 }}>
                  Selecciona al menos una modalidad.
                </p>
              )}
            </section>
          )}

          {/* ── SELECTOR PLANES — solo ROOFING ── */}
          {tipo === 'roofing' && planes && (
            <section>
              <div style={{
                fontSize: 13, fontWeight: 700, color: '#1a56c4',
                borderBottom: '2px solid #F89B24', paddingBottom: 4, marginBottom: 12,
              }}>
                Planes de Sellado (selección múltiple)
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {planes.map(plan => {
                  const selected = planesSeleccionados?.includes(plan)
                  const colores: Record<string, string> = {
                    Silver: '#6b7280', Gold: '#F89B24', Platinum: '#0d2050',
                  }
                  return (
                    <button
                      key={plan}
                      onClick={() => {
                        const curr = planesSeleccionados ?? []
                        onPlanesChange?.(
                          selected ? curr.filter(p => p !== plan) : [...curr, plan]
                        )
                      }}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13,
                        cursor: 'pointer', fontWeight: 700,
                        border: `2px solid ${selected ? colores[plan] : '#d0d9ef'}`,
                        background: selected ? colores[plan] : 'white',
                        color: selected ? 'white' : '#333',
                      }}
                    >
                      {plan}
                    </button>
                  )
                })}
              </div>
              {(planesSeleccionados?.length ?? 0) === 0 && (
                <p style={{ fontSize: 11, color: '#e74c3c', marginTop: 6 }}>
                  Selecciona al menos un plan de sellado.
                </p>
              )}
            </section>
          )}

          {/* ── IDIOMA DEL PDF — solo ROOFING ── */}
          {tipo === 'roofing' && onIdiomaChange && (
            <section>
              <div style={{
                fontSize: 13, fontWeight: 700, color: '#1a56c4',
                borderBottom: '2px solid #F89B24', paddingBottom: 4, marginBottom: 12,
              }}>
                Idioma del PDF
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['es', 'en'] as const).map(lang => {
                  const selected = idioma === lang
                  const label    = lang === 'es' ? '🇵🇷  Español' : '🇺🇸  English'
                  return (
                    <button
                      key={lang}
                      onClick={() => onIdiomaChange(lang)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13,
                        cursor: 'pointer', fontWeight: 700,
                        border: `2px solid ${selected ? '#1a56c4' : '#d0d9ef'}`,
                        background: selected ? '#1a56c4' : 'white',
                        color: selected ? 'white' : '#555',
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── DROPDOWN DE PROMOCIONES ── */}
          {tipo === 'loan' && (onPromoMadresChange || onFarmaciasChange) && (() => {
            const whCashRate = sistemaKW >= 5 ? 1000 : (sistemaKW >= 4 ? 500 : 0)
            const pw3Total   = (powerwallVersion === 3 && cantidadBaterias > 0) ? 500 * cantidadBaterias : 0
            const madresAct = !!(promoMadres && (promoMadres.whCash || promoMadres.powerwall3))
            const totalMadres =
              (promoMadres?.whCash    && whCashRate > 0 ? whCashRate : 0) +
              (promoMadres?.powerwall3 && pw3Total > 0 ? pw3Total : 0)
            return (
              <section style={{ border: '1.5px solid #d0d9ef', borderRadius: 12, overflow: 'hidden' }}>
                <button type="button" onClick={() => setPromosOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', cursor: 'pointer',
                    background: 'linear-gradient(90deg, #fff7fb 0%, #f3fbf6 100%)',
                    border: 'none', borderBottom: promosOpen ? '1.5px solid #d0d9ef' : 'none',
                  }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1a56c4', display: 'flex', alignItems: 'center', gap: 8 }}>
                    🎁 Promociones disponibles
                  </span>
                  <span style={{ fontSize: 11, color: '#777' }}>
                    {(madresAct || farmacias?.activa) && (
                      <span style={{
                        background: madresAct ? '#E84F97' : '#0F9D58',
                        color: 'white', padding: '2px 8px', borderRadius: 10, fontWeight: 700, marginRight: 6,
                      }}>
                        {madresAct ? '❤ Madres activa' : '⚕ Farmacia activa'}
                      </span>
                    )}
                    {promosOpen ? '▴' : '▾'}
                  </span>
                </button>

                {promosOpen && (
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* Mother's Day */}
                    {onPromoMadresChange && promoMadres && (
                      <div style={{
                        border: `2px solid ${madresAct ? '#E84F97' : '#F8B8D4'}`,
                        borderRadius: 10, overflow: 'hidden',
                        background: 'linear-gradient(135deg, #FFEAF3 0%, #FFF5FA 100%)',
                        opacity: farmacias?.activa ? 0.45 : 1,
                      }}>
                        <button type="button" onClick={() => setMadresOpen(o => !o)}
                          style={{
                            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: 12.5, fontWeight: 800, color: '#BE2E71',
                          }}>
                          <span>❤️ Mes de las Madres 2026 ❤️</span>
                          <span>{madresOpen ? '▴' : '▾'}</span>
                        </button>
                        {madresOpen && (
                          <div style={{ padding: '0 12px 12px' }}>
                            <p style={{ fontSize: 11, color: '#8E2658', marginBottom: 10, lineHeight: 1.4 }}>
                              Vigente del <b>7 al 14 de mayo 2026</b> · Marca los descuentos aplicables.
                            </p>
                            <label style={{
                              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                              padding: '10px 12px', borderRadius: 8,
                              cursor: (whCashRate > 0 && !farmacias?.activa) ? 'pointer' : 'not-allowed',
                              opacity: whCashRate > 0 ? 1 : 0.5,
                              background: promoMadres.whCash ? '#E84F97' : 'white',
                              border: `2px solid ${promoMadres.whCash ? '#E84F97' : '#F8B8D4'}`,
                            }}>
                              <input type="checkbox" checked={!!promoMadres.whCash}
                                disabled={whCashRate === 0 || farmacias?.activa}
                                onChange={e => {
                                  onPromoMadresChange({ ...promoMadres, whCash: e.target.checked })
                                  if (e.target.checked && onFarmaciasChange && farmacias?.activa) {
                                    onFarmaciasChange({ ...farmacias, activa: false })
                                  }
                                }}
                                style={{ width: 18, height: 18, accentColor: '#E84F97' }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: promoMadres.whCash ? 'white' : '#BE2E71' }}>
                                Descuento WHF/Cash: {whCashRate > 0
                                  ? `−$${whCashRate.toLocaleString()} (${sistemaKW < 5 ? '4–5 kW' : '5 kW+'})`
                                  : 'Sistema < 4 kW (no aplica)'}
                              </span>
                            </label>
                            <label style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 12px', borderRadius: 8,
                              cursor: (pw3Total > 0 && !farmacias?.activa) ? 'pointer' : 'not-allowed',
                              opacity: pw3Total > 0 ? 1 : 0.5,
                              background: promoMadres.powerwall3 ? '#E84F97' : 'white',
                              border: `2px solid ${promoMadres.powerwall3 ? '#E84F97' : '#F8B8D4'}`,
                            }}>
                              <input type="checkbox" checked={!!promoMadres.powerwall3}
                                disabled={pw3Total === 0 || farmacias?.activa}
                                onChange={e => {
                                  onPromoMadresChange({ ...promoMadres, powerwall3: e.target.checked })
                                  if (e.target.checked && onFarmaciasChange && farmacias?.activa) {
                                    onFarmaciasChange({ ...farmacias, activa: false })
                                  }
                                }}
                                style={{ width: 18, height: 18, accentColor: '#E84F97' }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: promoMadres.powerwall3 ? 'white' : '#BE2E71' }}>
                                Tesla Powerwall 3: {pw3Total > 0
                                  ? `−$${pw3Total.toLocaleString()} ($500 × ${cantidadBaterias} unidad${cantidadBaterias > 1 ? 'es' : ''})`
                                  : (powerwallVersion !== 3 ? 'Selecciona Powerwall v3' : 'Sin baterías en cotización')}
                              </span>
                            </label>
                            {totalMadres > 0 && (
                              <div style={{
                                marginTop: 10, padding: '8px 12px', borderRadius: 8,
                                background: 'white', border: '1.5px dashed #E84F97',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#BE2E71' }}>Ahorro total:</span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: '#E84F97' }}>
                                  −${totalMadres.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {farmacias?.activa && (
                              <p style={{ fontSize: 10.5, color: '#888', marginTop: 6, fontStyle: 'italic' }}>
                                Desactiva Farmacias para usar Mes de las Madres.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Farmacias */}
                    {onFarmaciasChange && farmacias && (
                      <div style={{
                        border: `2px solid ${farmacias.activa ? '#0F9D58' : '#A7E5C4'}`,
                        borderRadius: 10, overflow: 'hidden',
                        background: 'linear-gradient(135deg, #E8F8F0 0%, #F3FBF6 100%)',
                        opacity: madresAct ? 0.45 : 1,
                      }}>
                        <button type="button" onClick={() => setFarmaOpen(o => !o)}
                          style={{
                            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: 12.5, fontWeight: 800, color: '#066647',
                          }}>
                          <span>💊 PROMOCION FARMACIAS ⚕️</span>
                          <span>{farmaOpen ? '▴' : '▾'}</span>
                        </button>
                        {farmaOpen && (
                          <div style={{ padding: '0 12px 12px' }}>
                            <p style={{ fontSize: 11, color: '#0a6b40', marginBottom: 10, lineHeight: 1.4 }}>
                              🩺 Descuento fijo de <b>10%</b> sobre el valor de las <b>placas solares únicamente</b>.
                              Las baterías Powerwall <b>no llevan descuento</b> y se muestran aparte en el PDF.
                            </p>
                            <label style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 12px', borderRadius: 8, marginBottom: 10,
                              cursor: madresAct ? 'not-allowed' : 'pointer',
                              background: farmacias.activa ? '#0F9D58' : 'white',
                              border: `2px solid ${farmacias.activa ? '#0F9D58' : '#A7E5C4'}`,
                            }}>
                              <input type="checkbox" checked={farmacias.activa} disabled={madresAct}
                                onChange={e => {
                                  onFarmaciasChange({ ...farmacias, activa: e.target.checked })
                                  if (e.target.checked && onPromoMadresChange && madresAct) {
                                    onPromoMadresChange({ whCash: false, powerwall3: false })
                                  }
                                }}
                                style={{ width: 18, height: 18, accentColor: '#0F9D58' }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: farmacias.activa ? 'white' : '#066647' }}>
                                Aplicar 10% descuento en placas
                              </span>
                            </label>
                            {farmacias.activa && (
                              <div>
                                <label style={{ display: 'block', fontSize: 11, color: '#066647', marginBottom: 4, fontWeight: 700 }}>
                                  🏥 Nombre de la farmacia *
                                </label>
                                <input type="text" value={farmacias.nombre}
                                  onChange={e => onFarmaciasChange({ ...farmacias, nombre: e.target.value })}
                                  placeholder="Ej: Walgreens, CVS, Caridad..." maxLength={40}
                                  style={{
                                    width: '100%', border: '1.5px solid #A7E5C4', borderRadius: 8,
                                    padding: '8px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box',
                                  }} />
                              </div>
                            )}
                            {madresAct && (
                              <p style={{ fontSize: 10.5, color: '#888', marginTop: 6, fontStyle: 'italic' }}>
                                Desactiva Mes de las Madres para usar esta promo.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )
          })()}

          {/* ── RESUMEN AUTOMÁTICO ── */}
          <section>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#1a56c4',
              borderBottom: '2px solid #F89B24', paddingBottom: 4, marginBottom: 12,
            }}>
              Resumen de Cotización (generado automáticamente)
            </div>
            <div style={{ background: '#ebf3ff', borderRadius: 10, padding: '12px 16px' }}>
              {Object.entries(resumen).map(([k, v], i) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '5px 0',
                  borderTop: i > 0 ? '1px solid #c5d4ef' : 'none',
                }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0d2050' }}>{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 12, color: '#e74c3c', background: '#fde8e8', padding: '8px 12px', borderRadius: 8 }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 24px', borderTop: '1px solid #e8eef7',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 8, border: '1px solid #d0d9ef',
              background: 'white', color: '#555', fontSize: 13, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: loading ? '#93b3e8' : '#1a56c4',
              color: 'white', fontSize: 13, fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Download size={16} />
            {loading ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
