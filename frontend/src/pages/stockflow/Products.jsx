import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getProducts, createProduct, updateProduct,
  deleteProduct, registerSale, registerRestock,
} from '../../services/stockService'

function Products() {
  const navigate = useNavigate()

  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Modals
  const [showCreate, setShowCreate]   = useState(false)
  const [showEdit, setShowEdit]       = useState(null)   // product object
  const [showSale, setShowSale]       = useState(null)   // product object
  const [showRestock, setShowRestock] = useState(null)   // product object
  const [deleteConfirm, setDeleteConfirm] = useState(null) // product object

  // Forms
  const [form, setForm] = useState({ name: '', category: '', current_stock: '', min_stock: '', price: '' })
  const [saleQty, setSaleQty]       = useState(1)
  const [saleNote, setSaleNote]     = useState('')
  const [restockQty, setRestockQty] = useState(1)
  const [restockNote, setRestockNote] = useState('')
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Filtered products ─────────────────────────────────
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCategory === 'all' || p.category === filterCategory
    return matchSearch && matchCat
  })

  const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock)

  // ── Create product ────────────────────────────────────
  async function handleCreate() {
    if (!form.name) { setFormError('El nombre es obligatorio'); return }
    setSaving(true)
    setFormError('')
    try {
      await createProduct({
        name: form.name,
        category: form.category,
        current_stock: parseInt(form.current_stock) || 0,
        min_stock: parseInt(form.min_stock) || 5,
        price: parseFloat(form.price) || 0,
      })
      setShowCreate(false)
      setForm({ name: '', category: '', current_stock: '', min_stock: '', price: '' })
      loadProducts()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Edit product ──────────────────────────────────────
  function openEdit(product) {
    setShowEdit(product)
    setForm({
      name: product.name,
      category: product.category || '',
      current_stock: product.current_stock,
      min_stock: product.min_stock,
      price: product.price,
    })
    setFormError('')
  }

  async function handleEdit() {
    if (!form.name) { setFormError('El nombre es obligatorio'); return }
    setSaving(true)
    setFormError('')
    try {
      await updateProduct(showEdit.id, {
        name: form.name,
        category: form.category,
        min_stock: parseInt(form.min_stock) || 5,
        price: parseFloat(form.price) || 0,
      })
      setShowEdit(null)
      loadProducts()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete product ────────────────────────────────────
  async function handleDelete(product) {
    try {
      await deleteProduct(product.id)
      setDeleteConfirm(null)
      loadProducts()
    } catch (e) {
      setError(e.message)
    }
  }

  // ── Register sale ─────────────────────────────────────
  async function handleSale() {
    if (saleQty <= 0) { setFormError('La cantidad debe ser mayor que 0'); return }
    setSaving(true)
    setFormError('')
    try {
      await registerSale(showSale.id, saleQty, saleNote)
      setShowSale(null)
      setSaleQty(1)
      setSaleNote('')
      loadProducts()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Register restock ──────────────────────────────────
  async function handleRestock() {
    if (restockQty <= 0) { setFormError('La cantidad debe ser mayor que 0'); return }
    setSaving(true)
    setFormError('')
    try {
      await registerRestock(showRestock.id, restockQty, restockNote)
      setShowRestock(null)
      setRestockQty(1)
      setRestockNote('')
      loadProducts()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Styles ────────────────────────────────────────────
  const s = {
    page:       { padding: '32px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--color-surface)', minHeight: '100vh' },
    header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
    title:      { fontSize: '24px', fontWeight: '700', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' },
    subtitle:   { fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' },
    btnPrimary: { padding: '10px 20px', background: 'var(--color-brand)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    btnSecondary: { padding: '8px 14px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    btnDanger:  { padding: '8px 14px', background: 'var(--color-error-light)', color: 'var(--color-error)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    card:       { background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' },
    input:      { width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--color-surface)', color: 'var(--color-text-primary)', boxSizing: 'border-box', outline: 'none' },
    label:      { fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' },
    modal:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' },
    modalBox:   { background: 'var(--color-white)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  }

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-brand)', animation: 'spin 1s linear infinite' }}>inventory_2</span>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '12px' }}>Cargando productos...</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px', verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-brand)' }}>inventory_2</span>
            StockFlow — Inventario
          </h1>
          <p style={s.subtitle}>{products.length} productos · {lowStockProducts.length} con stock bajo</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={s.btnSecondary} onClick={() => navigate('/orders')}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>local_shipping</span>
            Pedidos
          </button>
          <button style={s.btnPrimary} onClick={() => { setShowCreate(true); setForm({ name: '', category: '', current_stock: '', min_stock: '', price: '' }); setFormError('') }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Nuevo producto
          </button>
        </div>
      </div>

      {/* ── Low stock alert ── */}
      {lowStockProducts.length > 0 && (
        <div style={{ background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-warning)' }}>warning</span>
          <p style={{ fontSize: '14px', color: 'var(--color-warning)', fontWeight: '600' }}>
            {lowStockProducts.length} producto{lowStockProducts.length > 1 ? 's' : ''} con stock bajo:
            <span style={{ fontWeight: '400', marginLeft: '6px' }}>
              {lowStockProducts.map(p => p.name).join(', ')}
            </span>
          </p>
        </div>
      )}

      {/* ── Search + filter ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--color-text-muted)' }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            style={{ ...s.input, paddingLeft: '36px' }}
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{ ...s.input, width: 'auto', minWidth: '160px' }}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'Todas las categorías' : c}</option>
          ))}
        </select>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: 'var(--color-error)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* ── Products grid ── */}
      {filtered.length === 0 ? (
        <div style={{ ...s.card, textAlign: 'center', padding: '64px 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: 'var(--color-text-muted)', marginBottom: '16px', display: 'block' }}>inventory_2</span>
          <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            {search ? 'No se encontraron productos' : 'Sin productos aún'}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            {search ? 'Prueba con otro término de búsqueda' : 'Crea tu primer producto para empezar'}
          </p>
          {!search && (
            <button style={s.btnPrimary} onClick={() => setShowCreate(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Nuevo producto
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(product => {
            const isLow     = product.current_stock <= product.min_stock
            const stockPct  = Math.min(100, Math.round((product.current_stock / (product.min_stock * 3)) * 100))
            const barColor  = isLow ? 'var(--color-error)' : product.current_stock < product.min_stock * 2 ? 'var(--color-warning)' : 'var(--color-success)'

            return (
              <div key={product.id} style={{ ...s.card, border: `1px solid ${isLow ? 'var(--color-error)' : 'var(--color-border)'}`, transition: 'box-shadow 0.2s' }}>

                {/* Product header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isLow ? 'var(--color-error-light)' : 'var(--color-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isLow ? 'var(--color-error)' : 'var(--color-brand)' }}>inventory_2</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{product.name}</p>
                        {product.category && (
                          <span style={{ fontSize: '11px', background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', padding: '2px 8px', borderRadius: '99px' }}>
                            {product.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isLow && (
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-error)', background: 'var(--color-error-light)', padding: '3px 8px', borderRadius: '99px', flexShrink: 0 }}>
                      STOCK BAJO
                    </span>
                  )}
                </div>

                {/* Stock info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: 'var(--color-surface)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: '800', color: isLow ? 'var(--color-error)' : 'var(--color-text-primary)' }}>{product.current_stock}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Stock actual</p>
                  </div>
                  <div style={{ background: 'var(--color-surface)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>{product.min_stock}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Stock mínimo</p>
                  </div>
                </div>

                {/* Stock bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ height: '6px', background: 'var(--color-surface-2)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${stockPct}%`, background: barColor, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Precio: <strong style={{ color: 'var(--color-text-primary)' }}>€{parseFloat(product.price).toFixed(2)}</strong>
                  </p>
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    style={{ fontSize: '12px', color: 'var(--color-brand)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    Ver movimientos
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <button
                    onClick={() => { setShowSale(product); setSaleQty(1); setSaleNote(''); setFormError('') }}
                    style={{ padding: '8px', background: 'var(--color-error-light)', color: 'var(--color-error)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove_shopping_cart</span>
                    Registrar venta
                  </button>
                  <button
                    onClick={() => { setShowRestock(product); setRestockQty(1); setRestockNote(''); setFormError('') }}
                    style={{ padding: '8px', background: 'var(--color-success-light)', color: 'var(--color-success)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_shopping_cart</span>
                    Reabastecer
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => openEdit(product)} style={s.btnSecondary}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>edit</span>
                    Editar
                  </button>
                  <button onClick={() => setDeleteConfirm(product)} style={s.btnDanger}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>delete</span>
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreate && (
        <div style={s.modal} onClick={() => setShowCreate(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '24px' }}>Nuevo producto</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={s.label}>Nombre *</label>
                <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tornillos M6" />
              </div>
              <div>
                <label style={s.label}>Categoría</label>
                <input style={s.input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ferretería" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={s.label}>Stock inicial</label>
                  <input style={s.input} type="number" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={s.label}>Stock mínimo</label>
                  <input style={s.input} type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} placeholder="5" min="0" />
                </div>
                <div>
                  <label style={s.label}>Precio (€)</label>
                  <input style={s.input} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" min="0" step="0.01" />
                </div>
              </div>
              {formError && <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button style={s.btnSecondary} onClick={() => setShowCreate(false)}>Cancelar</button>
                <button style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }} onClick={handleCreate} disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear producto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEdit && (
        <div style={s.modal} onClick={() => setShowEdit(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '24px' }}>Editar producto</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={s.label}>Nombre *</label>
                <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Categoría</label>
                <input style={s.input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={s.label}>Stock mínimo</label>
                  <input style={s.input} type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} min="0" />
                </div>
                <div>
                  <label style={s.label}>Precio (€)</label>
                  <input style={s.input} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} min="0" step="0.01" />
                </div>
              </div>
              {formError && <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button style={s.btnSecondary} onClick={() => setShowEdit(null)}>Cancelar</button>
                <button style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }} onClick={handleEdit} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SALE MODAL ── */}
      {showSale && (
        <div style={s.modal} onClick={() => setShowSale(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Registrar venta</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              {showSale.name} · Stock actual: <strong>{showSale.current_stock}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={s.label}>Cantidad *</label>
                <input style={s.input} type="number" value={saleQty} onChange={e => setSaleQty(parseInt(e.target.value))} min="1" max={showSale.current_stock} />
              </div>
              <div>
                <label style={s.label}>Nota (opcional)</label>
                <input style={s.input} value={saleNote} onChange={e => setSaleNote(e.target.value)} placeholder="Venta a cliente..." />
              </div>
              {formError && <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button style={s.btnSecondary} onClick={() => setShowSale(null)}>Cancelar</button>
                <button
                  style={{ ...s.btnPrimary, background: 'var(--color-error)', opacity: saving ? 0.7 : 1 }}
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
        <div style={s.modal} onClick={() => setShowRestock(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Reabastecer stock</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              {showRestock.name} · Stock actual: <strong>{showRestock.current_stock}</strong>
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
                <button style={s.btnSecondary} onClick={() => setShowRestock(null)}>Cancelar</button>
                <button
                  style={{ ...s.btnPrimary, background: 'var(--color-success)', opacity: saving ? 0.7 : 1 }}
                  onClick={handleRestock} disabled={saving}
                >
                  {saving ? 'Registrando...' : 'Confirmar restock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteConfirm && (
        <div style={s.modal} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modalBox, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-error-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--color-error)' }}>delete</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>¿Eliminar producto?</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                Se eliminará <strong>{deleteConfirm.name}</strong> y todos sus movimientos. Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ ...s.btnSecondary, flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button style={{ ...s.btnDanger, flex: 1, padding: '10px' }} onClick={() => handleDelete(deleteConfirm)}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products