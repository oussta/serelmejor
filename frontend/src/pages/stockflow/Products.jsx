import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { showToast } from '../../components/ui/Toast'
import {
  getProducts, createProduct, updateProduct,
  deleteProduct, registerSale, registerRestock,
} from '../../services/stockService'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const PAGE_SIZE = 8

function Products() {
  const navigate    = useNavigate()
  const { t }       = useTranslation()
  const { theme }   = useTheme()
  const { token }   = useAuth()
  const isDark      = theme === 'dark'

  const [products,       setProducts]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [search,         setSearch]         = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [currentPage,    setCurrentPage]    = useState(1)
  const [mounted,        setMounted]        = useState(false)
  const [isMobile,       setIsMobile]       = useState(window.innerWidth <= 768)

  // Modals
  const [showCreate,     setShowCreate]     = useState(false)
  const [showEdit,       setShowEdit]       = useState(null)
  const [showSale,       setShowSale]       = useState(null)
  const [showRestock,    setShowRestock]    = useState(null)
  const [deleteConfirm,  setDeleteConfirm]  = useState(null)

  // AI
  const [showAI,    setShowAI]    = useState(false)
  const [aiContext, setAiContext]  = useState('')
  const [aiResult,  setAiResult]  = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Forms
  const [form,        setForm]        = useState({ name: '', category: '', current_stock: '', min_stock: '', price: '' })
  const [saleQty,     setSaleQty]     = useState(1)
  const [saleNote,    setSaleNote]    = useState('')
  const [restockQty,  setRestockQty]  = useState(1)
  const [restockNote, setRestockNote] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')

  const cardBg   = isDark ? '#1E293B' : '#FFFFFF'
  const border   = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const pageBg   = isDark ? '#0F172A' : 'var(--color-surface)'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'
  const surfaceBg = isDark ? '#0F172A' : '#F8FAFC'

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCategory === 'all' || p.category === filterCategory
    return matchSearch && matchCat
  })
  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated    = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const lowStock     = products.filter(p => p.current_stock <= p.min_stock)

  useEffect(() => { setCurrentPage(1) }, [search, filterCategory])

  async function handleCreate() {
    if (!form.name) { setFormError(t('products.nameRequired') || 'El nombre es obligatorio'); return }
    setSaving(true); setFormError('')
    try {
      await createProduct({ name: form.name, category: form.category, current_stock: parseInt(form.current_stock) || 0, min_stock: parseInt(form.min_stock) || 5, price: parseFloat(form.price) || 0 })
      setShowCreate(false)
      setForm({ name: '', category: '', current_stock: '', min_stock: '', price: '' })
      loadProducts()
      showToast(t('products.created') || 'Producto creado ✓', 'success')
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  function openEdit(product) {
    setShowEdit(product)
    setForm({ name: product.name, category: product.category || '', current_stock: product.current_stock, min_stock: product.min_stock, price: product.price })
    setFormError('')
  }

  async function handleEdit() {
    if (!form.name) { setFormError(t('products.nameRequired') || 'El nombre es obligatorio'); return }
    setSaving(true); setFormError('')
    try {
      await updateProduct(showEdit.id, { name: form.name, category: form.category, min_stock: parseInt(form.min_stock) || 5, price: parseFloat(form.price) || 0 })
      setShowEdit(null)
      loadProducts()
      showToast(t('products.updated') || 'Producto actualizado ✓', 'success')
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(product) {
    try {
      await deleteProduct(product.id)
      setDeleteConfirm(null)
      loadProducts()
      showToast(t('products.deleted') || 'Producto eliminado', 'info')
    } catch (e) { setError(e.message) }
  }

  async function handleSale() {
    if (saleQty <= 0) { setFormError('La cantidad debe ser mayor que 0'); return }
    setSaving(true); setFormError('')
    try {
      await registerSale(showSale.id, saleQty, saleNote)
      setShowSale(null); setSaleQty(1); setSaleNote('')
      loadProducts()
      showToast(t('products.saleDone') || `Venta registrada: -${saleQty} unidades`, 'success')
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  async function handleRestock() {
    if (restockQty <= 0) { setFormError('La cantidad debe ser mayor que 0'); return }
    setSaving(true); setFormError('')
    try {
      await registerRestock(showRestock.id, restockQty, restockNote)
      setShowRestock(null); setRestockQty(1); setRestockNote('')
      loadProducts()
      showToast(t('products.restockDone') || `Restock confirmado: +${restockQty} unidades`, 'success')
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  async function handleAI() {
    if (!aiContext.trim()) return
    setAiLoading(true); setAiResult('')
    try {
      const res = await fetch(`${API}/ai/suggest-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ context: aiContext, products: products.slice(0, 5) }),
      })
      const data = await res.json()
      setAiResult(data.suggestion || data.draft || data.response || 'Sugerencia generada por IA')
    } catch { setAiResult('Error al conectar con la IA.') }
    finally { setAiLoading(false) }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: textMain, boxSizing: 'border-box', outline: 'none' }
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }
  const modalStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }
  const modalBox   = { background: cardBg, borderRadius: '20px', padding: isMobile ? '24px 20px' : '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${border}`, maxHeight: '90vh', overflowY: 'auto' }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textSub }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#2563EB', marginBottom: '12px', display: 'block', animation: 'spin 1.5s linear infinite' }}>inventory_2</span>
        <p>{t('products.loading') || 'Cargando productos...'}</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding: isMobile ? '0 0 80px' : '0 0 40px', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: textMain, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#2563EB' }}>inventory_2</span>
            StockFlow — {t('products.title') || 'Inventario'}
          </h1>
          <p style={{ fontSize: '13px', color: textSub, marginTop: '4px' }}>
            {products.length} {t('products.total') || 'productos'} · {lowStock.length} {t('products.lowStock') || 'con stock bajo'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAI(!showAI)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: showAI ? 'linear-gradient(135deg, #7C3AED, #2563EB)' : (isDark ? '#1E293B' : '#F1F5F9'), color: showAI ? 'white' : textSub, border: `1px solid ${showAI ? 'transparent' : border}`, borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>smart_toy</span>
            {!isMobile && 'Salesek AI'}
          </button>
          <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>local_shipping</span>
            {!isMobile && (t('products.orders') || 'Pedidos')}
          </button>
          <button onClick={() => { setShowCreate(true); setForm({ name: '', category: '', current_stock: '', min_stock: '', price: '' }); setFormError('') }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            {t('products.new') || 'Nuevo producto'}
          </button>
        </div>
      </div>

      {/* AI Panel */}
      {showAI && (
        <div style={{ background: isDark ? '#0a0f1e' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE'}`, borderRadius: '16px', padding: '20px', marginBottom: '20px', animation: 'slideDown 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#7C3AED' }}>smart_toy</span>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>Salesek AI — {t('products.aiTitle') || 'Sugerencias de inventario'}</h3>
          </div>
          <textarea value={aiContext} onChange={e => setAiContext(e.target.value)} placeholder={t('products.aiPlaceholder') || 'Describe tu situación de stock para obtener sugerencias de pedido...'} rows={3} style={{ ...inputStyle, marginBottom: '10px', resize: 'vertical' }} />
          {aiResult && (
            <div style={{ background: isDark ? '#1E293B' : 'white', border: `1px solid ${border}`, borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', color: textSub, marginBottom: '4px', fontWeight: '600' }}>Sugerencia IA:</p>
              <p style={{ fontSize: '14px', color: textMain, lineHeight: '1.6' }}>{aiResult}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleAI} disabled={aiLoading || !aiContext.trim()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: aiLoading || !aiContext.trim() ? 0.6 : 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{aiLoading ? 'hourglass_empty' : 'send'}</span>
              {aiLoading ? 'Analizando...' : 'Obtener sugerencia'}
            </button>
            {aiResult && (
              <button onClick={() => navigator.clipboard.writeText(aiResult)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                Copiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div style={{ background: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#F59E0B' }}>warning</span>
          <p style={{ fontSize: '14px', color: '#F59E0B', fontWeight: '600' }}>
            {lowStock.length} {t('products.lowStockAlert') || 'producto(s) con stock bajo'}:
            <span style={{ fontWeight: '400', marginLeft: '6px', color: textSub }}>{lowStock.map(p => p.name).join(', ')}</span>
          </p>
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: textSub }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('products.search') || 'Buscar producto...'} style={{ ...inputStyle, paddingLeft: '36px' }} />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: '160px' }}>
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? (t('products.allCategories') || 'Todas las categorías') : c}</option>)}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Products grid */}
      {paginated.length === 0 ? (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', textAlign: 'center', padding: '64px 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: textSub, marginBottom: '16px', display: 'block', opacity: 0.5 }}>inventory_2</span>
          <p style={{ fontSize: '18px', fontWeight: '600', color: textMain, marginBottom: '8px' }}>{search ? (t('products.notFound') || 'No se encontraron productos') : (t('products.empty') || 'Sin productos aún')}</p>
          <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>{search ? (t('products.trySearch') || 'Prueba con otro término') : (t('products.createFirst') || 'Crea tu primer producto para empezar')}</p>
          {!search && (
            <button onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              {t('products.new') || 'Nuevo producto'}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {paginated.map(product => {
            const isLow    = product.current_stock <= product.min_stock
            const stockPct = Math.min(100, Math.round((product.current_stock / Math.max(product.min_stock * 3, 1)) * 100))
            const barColor = isLow ? '#F43F5E' : product.current_stock < product.min_stock * 2 ? '#F59E0B' : '#10B981'
            return (
              <div key={product.id} style={{ background: cardBg, border: `1px solid ${isLow ? '#F43F5E' : border}`, borderRadius: '16px', padding: '20px', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Product header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isLow ? 'rgba(244,63,94,0.1)' : 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isLow ? '#F43F5E' : '#2563EB' }}>inventory_2</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                      {product.category && <span style={{ fontSize: '11px', background: isDark ? '#334155' : '#F1F5F9', color: textSub, padding: '2px 8px', borderRadius: '99px' }}>{product.category}</span>}
                    </div>
                  </div>
                  {isLow && <span style={{ fontSize: '10px', fontWeight: '800', color: '#F43F5E', background: 'rgba(244,63,94,0.1)', padding: '3px 8px', borderRadius: '99px', flexShrink: 0, marginLeft: '8px' }}>LOW</span>}
                </div>

                {/* Stock numbers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: surfaceBg, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ fontSize: '22px', fontWeight: '800', color: isLow ? '#F43F5E' : textMain }}>{product.current_stock}</p>
                    <p style={{ fontSize: '10px', color: textSub }}>{t('products.currentStock') || 'Stock actual'}</p>
                  </div>
                  <div style={{ background: surfaceBg, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ fontSize: '22px', fontWeight: '800', color: textSub }}>{product.min_stock}</p>
                    <p style={{ fontSize: '10px', color: textSub }}>{t('products.minStock') || 'Stock mínimo'}</p>
                  </div>
                </div>

                {/* Stock bar */}
                <div style={{ height: '5px', background: isDark ? '#334155' : '#E2E8F0', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ height: '100%', width: `${stockPct}%`, background: barColor, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                </div>

                {/* Price + movements */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <p style={{ fontSize: '13px', color: textSub }}>
                    {t('products.price') || 'Precio'}: <strong style={{ color: textMain }}>€{parseFloat(product.price || 0).toFixed(2)}</strong>
                  </p>
                  <button onClick={() => navigate(`/products/${product.id}`)} style={{ fontSize: '12px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '600' }}>
                    {t('products.movements') || 'Movimientos'}
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                  </button>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => { setShowSale(product); setSaleQty(1); setSaleNote(''); setFormError('') }} style={{ padding: '8px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', color: '#F43F5E', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>remove_shopping_cart</span>
                    {t('products.sale') || 'Venta'}
                  </button>
                  <button onClick={() => { setShowRestock(product); setRestockQty(1); setRestockNote(''); setFormError('') }} style={{ padding: '8px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: '#10B981', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>add_shopping_cart</span>
                    {t('products.restock') || 'Restock'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => openEdit(product)} style={{ padding: '7px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                    {t('common.edit') || 'Editar'}
                  </button>
                  <button onClick={() => setDeleteConfirm(product)} style={{ padding: '7px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', color: '#F43F5E', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                    {t('common.delete') || 'Eliminar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${border}`, background: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === 1 ? 0.4 : 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${page === currentPage ? '#2563EB' : border}`, background: page === currentPage ? '#2563EB' : 'none', color: page === currentPage ? 'white' : textSub, fontSize: '14px', fontWeight: page === currentPage ? '700' : '400', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${border}`, background: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === totalPages ? 0.4 : 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
          </button>
          <span style={{ fontSize: '13px', color: textSub, marginLeft: '8px' }}>
            {filtered.length} {t('products.total') || 'productos'}
          </span>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div style={modalStyle} onClick={() => setShowCreate(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: textMain, marginBottom: '24px' }}>{t('products.new') || 'Nuevo producto'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>{t('products.name') || 'Nombre'} *</label><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tornillos M6" /></div>
              <div><label style={labelStyle}>{t('products.category') || 'Categoría'}</label><input style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ferretería" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div><label style={labelStyle}>{t('products.initialStock') || 'Stock inicial'}</label><input style={inputStyle} type="number" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} placeholder="0" min="0" /></div>
                <div><label style={labelStyle}>{t('products.minStock') || 'Stock mínimo'}</label><input style={inputStyle} type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} placeholder="5" min="0" /></div>
                <div><label style={labelStyle}>{t('products.price') || 'Precio (€)'}</label><input style={inputStyle} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" min="0" step="0.01" /></div>
              </div>
              {formError && <p style={{ color: '#F43F5E', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: '10px 18px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
                <button onClick={handleCreate} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>{saving ? (t('common.saving') || 'Guardando...') : (t('products.create') || 'Crear producto')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <div style={modalStyle} onClick={() => setShowEdit(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: textMain, marginBottom: '24px' }}>{t('products.edit') || 'Editar producto'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>{t('products.name') || 'Nombre'} *</label><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label style={labelStyle}>{t('products.category') || 'Categoría'}</label><input style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={labelStyle}>{t('products.minStock') || 'Stock mínimo'}</label><input style={inputStyle} type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} min="0" /></div>
                <div><label style={labelStyle}>{t('products.price') || 'Precio (€)'}</label><input style={inputStyle} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} min="0" step="0.01" /></div>
              </div>
              {formError && <p style={{ color: '#F43F5E', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setShowEdit(null)} style={{ padding: '10px 18px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
                <button onClick={handleEdit} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>{saving ? (t('common.saving') || 'Guardando...') : (t('products.saveChanges') || 'Guardar cambios')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SALE MODAL */}
      {showSale && (
        <div style={modalStyle} onClick={() => setShowSale(null)}>
          <div style={{ ...modalBox, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#F43F5E' }}>remove_shopping_cart</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '6px' }}>{t('products.registerSale') || 'Registrar venta'}</h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '20px' }}>{showSale.name} · {t('products.currentStock') || 'Stock actual'}: <strong style={{ color: textMain }}>{showSale.current_stock}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>{t('products.quantity') || 'Cantidad'} *</label><input style={inputStyle} type="number" value={saleQty} onChange={e => setSaleQty(parseInt(e.target.value) || 1)} min="1" max={showSale.current_stock} /></div>
              <div><label style={labelStyle}>{t('products.noteOptional') || 'Nota (opcional)'}</label><input style={inputStyle} value={saleNote} onChange={e => setSaleNote(e.target.value)} placeholder="Venta a cliente..." /></div>
              {formError && <p style={{ color: '#F43F5E', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowSale(null)} style={{ padding: '10px 18px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
                <button onClick={handleSale} disabled={saving} style={{ padding: '10px 20px', background: '#F43F5E', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>{saving ? (t('products.registering') || 'Registrando...') : (t('products.confirmSale') || 'Registrar venta')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {showRestock && (
        <div style={modalStyle} onClick={() => setShowRestock(null)}>
          <div style={{ ...modalBox, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#10B981' }}>add_shopping_cart</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '6px' }}>{t('products.restockTitle') || 'Reabastecer stock'}</h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '20px' }}>{showRestock.name} · {t('products.currentStock') || 'Stock actual'}: <strong style={{ color: textMain }}>{showRestock.current_stock}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>{t('products.quantity') || 'Cantidad'} *</label><input style={inputStyle} type="number" value={restockQty} onChange={e => setRestockQty(parseInt(e.target.value) || 1)} min="1" /></div>
              <div><label style={labelStyle}>{t('products.noteOptional') || 'Nota (opcional)'}</label><input style={inputStyle} value={restockNote} onChange={e => setRestockNote(e.target.value)} placeholder="Restock de proveedor..." /></div>
              {formError && <p style={{ color: '#F43F5E', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowRestock(null)} style={{ padding: '10px 18px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
                <button onClick={handleRestock} disabled={saving} style={{ padding: '10px 20px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>{saving ? (t('products.registering') || 'Registrando...') : (t('products.confirmRestock') || 'Confirmar restock')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div style={modalStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...modalBox, maxWidth: '380px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#F43F5E' }}>delete</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '8px' }}>{t('products.deleteTitle') || '¿Eliminar producto?'}</h3>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>
              {t('products.deleteDesc') || 'Se eliminará'} <strong style={{ color: textMain }}>{deleteConfirm.name}</strong> {t('products.deleteDesc2') || 'y todos sus movimientos. Esta acción no se puede deshacer.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '10px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '10px', background: '#F43F5E', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('products.confirmDelete') || 'Sí, eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

export default Products