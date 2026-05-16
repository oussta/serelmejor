import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { showToast } from '../../components/ui/Toast'
import { getProduct, getMovements, registerSale, registerRestock } from '../../services/stockService'

function ProductDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { t, i18n } = useTranslation()
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mounted,  setMounted]  = useState(false)

  const [product,   setProduct]   = useState(null)
  const [movements, setMovements] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [showSale,    setShowSale]    = useState(false)
  const [showRestock, setShowRestock] = useState(false)
  const [saleQty,     setSaleQty]     = useState(1)
  const [saleNote,    setSaleNote]    = useState('')
  const [restockQty,  setRestockQty]  = useState(1)
  const [restockNote, setRestockNote] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')

  const cardBg   = isDark ? '#1E293B' : 'white'
  const border   = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const surfBg   = isDark ? '#0F172A' : '#F8FAFC'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'
  const inputText = isDark ? '#F1F5F9' : '#0F172A'

  const locale = i18n.language === 'en' ? 'en-GB' : i18n.language === 'fr' ? 'fr-FR' : 'es-ES'

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    try {
      setLoading(true)
      const [prod, movs] = await Promise.all([getProduct(id), getMovements(id)])
      setProduct(prod)
      setMovements(Array.isArray(movs) ? movs : [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleSale() {
    if (saleQty <= 0) { setFormError(t('products.quantityError') || 'La cantidad debe ser mayor que 0'); return }
    setSaving(true); setFormError('')
    try {
      await registerSale(id, saleQty, saleNote)
      setShowSale(false); setSaleQty(1); setSaleNote('')
      loadAll()
      showToast(t('products.saleDone') || `Venta registrada: -${saleQty} uds`, 'success')
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  async function handleRestock() {
    if (restockQty <= 0) { setFormError(t('products.quantityError') || 'La cantidad debe ser mayor que 0'); return }
    setSaving(true); setFormError('')
    try {
      await registerRestock(id, restockQty, restockNote)
      setShowRestock(false); setRestockQty(1); setRestockNote('')
      loadAll()
      showToast(t('products.restockDone') || `Restock confirmado: +${restockQty} uds`, 'success')
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function movementInfo(type) {
    switch (type) {
      case 'sale':    return { icon: 'remove_shopping_cart', color: '#F43F5E', bg: isDark ? 'rgba(244,63,94,0.1)'  : '#FFF1F2', label: t('products.sale')    || 'Venta' }
      case 'restock': return { icon: 'add_shopping_cart',    color: '#10B981', bg: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', label: t('products.restock') || 'Restock' }
      default:        return { icon: 'swap_vert',            color: '#2563EB', bg: isDark ? 'rgba(37,99,235,0.1)'  : '#EFF6FF', label: type }
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: inputText, boxSizing: 'border-box', outline: 'none' }
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }
  const modalStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }
  const modalBox   = { background: cardBg, borderRadius: '20px', padding: isMobile ? '24px 20px' : '32px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${border}` }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textSub }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#2563EB', display: 'block', marginBottom: '12px', animation: 'spin 1.5s linear infinite' }}>refresh</span>
        <p>{t('products.loading') || 'Cargando...'}</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error || !product) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#F43F5E', marginBottom: '16px', display: 'block' }}>error</span>
        <p style={{ color: '#F43F5E', marginBottom: '16px' }}>{error || t('products.notFound') || 'Producto no encontrado'}</p>
        <button onClick={() => navigate('/products')} style={{ padding: '8px 16px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {t('common.back') || 'Volver'}
        </button>
      </div>
    </div>
  )

  const isLow    = product.current_stock <= product.min_stock
  const stockPct = Math.min(100, Math.round((product.current_stock / Math.max(product.min_stock * 3, 1)) * 100))
  const barColor = isLow ? '#F43F5E' : product.current_stock < product.min_stock * 2 ? '#F59E0B' : '#10B981'
  const totalSales   = movements.filter(m => m.type === 'sale').reduce((s, m) => s + m.quantity, 0)
  const totalRestock = movements.filter(m => m.type === 'restock').reduce((s, m) => s + m.quantity, 0)

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', padding: isMobile ? '0 0 80px' : '0 0 40px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>

      {/* Back */}
      <button onClick={() => navigate('/products')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0, fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        {t('common.back') || 'Volver'} — {t('products.title') || 'Inventario'}
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em' }}>{product.name}</h1>
            {isLow && <span style={{ fontSize: '11px', fontWeight: '800', color: '#F43F5E', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', padding: '3px 10px', borderRadius: '99px' }}>STOCK BAJO</span>}
          </div>
          {product.category && <span style={{ fontSize: '13px', color: textSub, background: isDark ? '#334155' : '#F1F5F9', padding: '3px 10px', borderRadius: '99px' }}>{product.category}</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => { setShowSale(true); setSaleQty(1); setSaleNote(''); setFormError('') }} style={{ padding: '9px 14px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', color: '#F43F5E', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove_shopping_cart</span>
            {!isMobile && (t('products.registerSale') || 'Registrar venta')}
          </button>
          <button onClick={() => { setShowRestock(true); setRestockQty(1); setRestockNote(''); setFormError('') }} style={{ padding: '9px 14px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: '#10B981', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_shopping_cart</span>
            {!isMobile && (t('products.restockTitle') || 'Reabastecer')}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '16px', marginBottom: '20px' }}>
        {[
          { label: t('products.currentStock') || 'Stock actual',   value: product.current_stock, icon: 'inventory_2',          color: isLow ? '#F43F5E' : '#2563EB' },
          { label: t('products.minStock')     || 'Stock mínimo',   value: product.min_stock,     icon: 'warning',               color: '#F59E0B' },
          { label: t('productDetail.totalSold')    || 'Total vendido',  value: totalSales,           icon: 'remove_shopping_cart',  color: '#F43F5E' },
          { label: t('productDetail.totalReceived')|| 'Total recibido', value: totalRestock,         icon: 'add_shopping_cart',     color: '#10B981' },
        ].map(stat => (
          <div key={stat.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: isMobile ? '14px' : '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: stat.color }}>{stat.icon}</span>
              <p style={{ fontSize: '11px', color: textSub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
            </div>
            <p style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '800', color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Stock bar */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>{t('productDetail.stockLevel') || 'Nivel de stock'}</p>
          <p style={{ fontSize: '13px', color: textSub }}>{product.current_stock} / {product.min_stock * 3} {t('productDetail.units') || 'unidades'}</p>
        </div>
        <div style={{ height: '10px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${stockPct}%`, background: barColor, borderRadius: '99px', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <p style={{ fontSize: '11px', color: textSub }}>0</p>
          <p style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '600' }}>{t('productDetail.minimum') || 'Mínimo'}: {product.min_stock}</p>
          <p style={{ fontSize: '11px', color: textSub }}>{product.min_stock * 3}</p>
        </div>
      </div>

      {/* Price info */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#10B981' }}>euro</span>
        <span style={{ fontSize: '14px', color: textSub }}>{t('products.price') || 'Precio unitario'}:</span>
        <span style={{ fontSize: '20px', fontWeight: '800', color: textMain }}>€{parseFloat(product.price || 0).toFixed(2)}</span>
        <span style={{ marginLeft: 'auto', fontSize: '14px', color: textSub }}>
          {t('productDetail.totalValue') || 'Valor en stock'}: <strong style={{ color: '#10B981' }}>€{(product.current_stock * parseFloat(product.price || 0)).toFixed(2)}</strong>
        </span>
      </div>

      {/* Movements */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px' }}>
        <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: textMain, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>swap_vert</span>
          {t('productDetail.movements') || 'Historial de movimientos'}
          <span style={{ fontSize: '13px', fontWeight: '400', color: textSub }}>({movements.length})</span>
        </h2>

        {movements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: textSub }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', marginBottom: '12px', display: 'block', opacity: 0.5 }}>history</span>
            <p style={{ fontSize: '15px' }}>{t('productDetail.noMovements') || 'Sin movimientos registrados aún'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {movements.map(mov => {
              const { icon, color, bg, label } = movementInfo(mov.type)
              return (
                <div key={mov.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: isMobile ? '12px' : '14px', background: surfBg, borderRadius: '12px', border: `1px solid ${border}` }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color }}>{icon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{label}</p>
                      {mov.note && <p style={{ fontSize: '13px', color: textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>— {mov.note}</p>}
                    </div>
                    <p style={{ fontSize: '12px', color: textSub }}>{formatDate(mov.created_at)}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '18px', fontWeight: '800', color }}>{mov.type === 'sale' ? '-' : '+'}{mov.quantity}</p>
                    <p style={{ fontSize: '11px', color: textSub }}>{t('productDetail.units') || 'uds'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SALE MODAL */}
      {showSale && (
        <div style={modalStyle} onClick={() => setShowSale(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#F43F5E' }}>remove_shopping_cart</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '6px' }}>{t('products.registerSale') || 'Registrar venta'}</h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>{t('products.currentStock') || 'Stock disponible'}: <strong style={{ color: textMain }}>{product.current_stock}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>{t('products.quantity') || 'Cantidad'} *</label><input style={inputStyle} type="number" value={saleQty} onChange={e => setSaleQty(parseInt(e.target.value) || 1)} min="1" max={product.current_stock} /></div>
              <div><label style={labelStyle}>{t('products.noteOptional') || 'Nota (opcional)'}</label><input style={inputStyle} value={saleNote} onChange={e => setSaleNote(e.target.value)} placeholder="Venta a cliente..." /></div>
              {formError && <p style={{ color: '#F43F5E', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowSale(false)} style={{ padding: '10px 18px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
                <button onClick={handleSale} disabled={saving} style={{ padding: '10px 20px', background: '#F43F5E', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>{saving ? (t('products.registering') || 'Registrando...') : (t('products.confirmSale') || 'Registrar venta')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {showRestock && (
        <div style={modalStyle} onClick={() => setShowRestock(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#10B981' }}>add_shopping_cart</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '6px' }}>{t('products.restockTitle') || 'Reabastecer stock'}</h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>{t('products.currentStock') || 'Stock actual'}: <strong style={{ color: textMain }}>{product.current_stock}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>{t('products.quantity') || 'Cantidad'} *</label><input style={inputStyle} type="number" value={restockQty} onChange={e => setRestockQty(parseInt(e.target.value) || 1)} min="1" /></div>
              <div><label style={labelStyle}>{t('products.noteOptional') || 'Nota (opcional)'}</label><input style={inputStyle} value={restockNote} onChange={e => setRestockNote(e.target.value)} placeholder="Restock de proveedor..." /></div>
              {formError && <p style={{ color: '#F43F5E', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowRestock(false)} style={{ padding: '10px 18px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
                <button onClick={handleRestock} disabled={saving} style={{ padding: '10px 20px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>{saving ? (t('products.registering') || 'Registrando...') : (t('products.confirmRestock') || 'Confirmar restock')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail