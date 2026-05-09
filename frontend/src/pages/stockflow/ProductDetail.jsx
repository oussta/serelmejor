import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct, getMovements, registerSale, registerRestock } from '../../services/stockService'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product,   setProduct]   = useState(null)
  const [movements, setMovements] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  // Modals
  const [showSale,    setShowSale]    = useState(false)
  const [showRestock, setShowRestock] = useState(false)

  // Forms
  const [saleQty,     setSaleQty]     = useState(1)
  const [saleNote,    setSaleNote]    = useState('')
  const [restockQty,  setRestockQty]  = useState(1)
  const [restockNote, setRestockNote] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    try {
      setLoading(true)
      const [prod, movs] = await Promise.all([
        getProduct(id),
        getMovements(id),
      ])
      setProduct(prod)
      setMovements(movs)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSale() {
    if (saleQty <= 0) { setFormError('La cantidad debe ser mayor que 0'); return }
    setSaving(true)
    setFormError('')
    try {
      await registerSale(id, saleQty, saleNote)
      setShowSale(false)
      setSaleQty(1)
      setSaleNote('')
      loadAll()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRestock() {
    if (restockQty <= 0) { setFormError('La cantidad debe ser mayor que 0'); return }
    setSaving(true)
    setFormError('')
    try {
      await registerRestock(id, restockQty, restockNote)
      setShowRestock(false)
      setRestockQty(1)
      setRestockNote('')
      loadAll()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function movementIcon(type) {
    switch (type) {
      case 'sale':       return { icon: 'remove_shopping_cart', color: 'var(--color-error)',   bg: 'var(--color-error-light)',   label: 'Venta' }
      case 'restock':    return { icon: 'add_shopping_cart',    color: 'var(--color-success)', bg: 'var(--color-success-light)', label: 'Restock' }
      case 'adjustment': return { icon: 'tune',                 color: 'var(--color-warning)', bg: 'var(--color-warning-light)', label: 'Ajuste' }
      default:           return { icon: 'swap_vert',            color: 'var(--color-brand)',   bg: 'var(--color-brand-light)',   label: type }
    }
  }

  const s = {
    page:       { padding: '32px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--color-surface)', minHeight: '100vh' },
    card:       { background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' },
    btnPrimary: { padding: '10px 20px', background: 'var(--color-brand)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    btnSecondary: { padding: '8px 14px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    input:      { width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--color-surface)', color: 'var(--color-text-primary)', boxSizing: 'border-box', outline: 'none' },
    label:      { fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' },
    modal:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' },
    modalBox:   { background: 'var(--color-white)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  }

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Cargando producto...</p>
    </div>
  )

  if (error || !product) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)', marginBottom: '16px', display: 'block' }}>error</span>
        <p style={{ color: 'var(--color-error)', marginBottom: '16px' }}>{error || 'Producto no encontrado'}</p>
        <button style={s.btnSecondary} onClick={() => navigate('/products')}>Volver</button>
      </div>
    </div>
  )

  const isLow    = product.current_stock <= product.min_stock
  const stockPct = Math.min(100, Math.round((product.current_stock / (product.min_stock * 3)) * 100))
  const barColor = isLow ? 'var(--color-error)' : product.current_stock < product.min_stock * 2 ? 'var(--color-warning)' : 'var(--color-success)'

  // Stats from movements
  const totalSales   = movements.filter(m => m.type === 'sale').reduce((sum, m) => sum + m.quantity, 0)
  const totalRestock = movements.filter(m => m.type === 'restock').reduce((sum, m) => sum + m.quantity, 0)

  return (
    <div style={s.page}>

      {/* ── Back + header ── */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/products')}
          style={{ ...s.btnSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Volver a productos
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                {product.name}
              </h1>
              {isLow && (
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-error)', background: 'var(--color-error-light)', padding: '3px 10px', borderRadius: '99px' }}>
                  STOCK BAJO
                </span>
              )}
            </div>
            {product.category && (
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', padding: '3px 10px', borderRadius: '99px' }}>
                {product.category}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { setShowSale(true); setSaleQty(1); setSaleNote(''); setFormError('') }}
              style={{ padding: '10px 16px', background: 'var(--color-error-light)', color: 'var(--color-error)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove_shopping_cart</span>
              Registrar venta
            </button>
            <button
              onClick={() => { setShowRestock(true); setRestockQty(1); setRestockNote(''); setFormError('') }}
              style={{ ...s.btnPrimary, background: 'var(--color-success)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
              Reabastecer
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Stock actual',  value: product.current_stock, icon: 'inventory_2',         color: isLow ? 'var(--color-error)' : 'var(--color-brand)' },
          { label: 'Stock mínimo',  value: product.min_stock,     icon: 'warning',              color: 'var(--color-warning)' },
          { label: 'Total vendido', value: totalSales,            icon: 'remove_shopping_cart', color: 'var(--color-error)' },
          { label: 'Total recibido',value: totalRestock,          icon: 'add_shopping_cart',    color: 'var(--color-success)' },
        ].map(stat => (
          <div key={stat.label} style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: stat.color }}>{stat.icon}</span>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '800', color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Stock bar ── */}
      <div style={{ ...s.card, marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Nivel de stock</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {product.current_stock} / {product.min_stock * 3} unidades
          </p>
        </div>
        <div style={{ height: '12px', background: 'var(--color-surface-2)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${stockPct}%`, background: barColor, borderRadius: '99px', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>0</p>
          <p style={{ fontSize: '11px', color: 'var(--color-warning)' }}>Mínimo: {product.min_stock}</p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{product.min_stock * 3}</p>
        </div>
      </div>

      {/* ── Movements list ── */}
      <div style={s.card}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-brand)' }}>swap_vert</span>
          Historial de movimientos
          <span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--color-text-muted)', marginLeft: '4px' }}>({movements.length})</span>
        </h2>

        {movements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--color-text-muted)', marginBottom: '12px', display: 'block' }}>history</span>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>Sin movimientos registrados aún</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {movements.map(mov => {
              const { icon, color, bg, label } = movementIcon(mov.type)
              return (
                <div key={mov.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--color-surface)', borderRadius: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color }}>{icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{label}</p>
                      {mov.note && (
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>— {mov.note}</p>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{formatDate(mov.created_at)}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '18px', fontWeight: '700', color }}>
                      {mov.type === 'sale' ? '-' : '+'}{mov.quantity}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>unidades</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── SALE MODAL ── */}
      {showSale && (
        <div style={s.modal} onClick={() => setShowSale(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Registrar venta</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              Stock disponible: <strong>{product.current_stock}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={s.label}>Cantidad *</label>
                <input style={s.input} type="number" value={saleQty} onChange={e => setSaleQty(parseInt(e.target.value))} min="1" max={product.current_stock} />
              </div>
              <div>
                <label style={s.label}>Nota (opcional)</label>
                <input style={s.input} value={saleNote} onChange={e => setSaleNote(e.target.value)} placeholder="Venta a cliente..." />
              </div>
              {formError && <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button style={s.btnSecondary} onClick={() => setShowSale(false)}>Cancelar</button>
                <button
                  style={{ padding: '10px 20px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}
                  onClick={handleSale} disabled={saving}
                >
                  {saving ? 'Registrando...' : 'Registrar venta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESTOCK MODAL ── */}
      {showRestock && (
        <div style={s.modal} onClick={() => setShowRestock(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Reabastecer stock</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              Stock actual: <strong>{product.current_stock}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={s.label}>Cantidad *</label>
                <input style={s.input} type="number" value={restockQty} onChange={e => setRestockQty(parseInt(e.target.value))} min="1" />
              </div>
              <div>
                <label style={s.label}>Nota (opcional)</label>
                <input style={s.input} value={restockNote} onChange={e => setRestockNote(e.target.value)} placeholder="Restock de proveedor..." />
              </div>
              {formError && <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button style={s.btnSecondary} onClick={() => setShowRestock(false)}>Cancelar</button>
                <button
                  style={{ padding: '10px 20px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}
                  onClick={handleRestock} disabled={saving}
                >
                  {saving ? 'Registrando...' : 'Confirmar restock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail