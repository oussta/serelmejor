import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getOrders, createOrder, deleteOrder,
  sendOrder, confirmOrder, deliverOrder,
} from '../../services/stockService'
import { getProducts } from '../../services/stockService'
import { getSuppliers, createSupplier } from '../../services/stockService'

function Orders() {
  const navigate = useNavigate()

  const [orders,    setOrders]    = useState([])
  const [products,  setProducts]  = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Modals
  const [showCreate,       setShowCreate]       = useState(false)
  const [showNewSupplier,  setShowNewSupplier]  = useState(false)
  const [deleteConfirm,    setDeleteConfirm]    = useState(null)

  // Forms
  const [form, setForm] = useState({ supplier_id: '', product_id: '', quantity: '', note: '' })
  const [supplierForm, setSupplierForm] = useState({ name: '', email: '', contact_name: '', phone: '' })
  const [saving,     setSaving]     = useState(false)
  const [formError,  setFormError]  = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      setLoading(true)
      const [ord, prod, supp] = await Promise.all([
        getOrders(),
        getProducts(),
        getSuppliers(),
      ])
      setOrders(ord)
      setProducts(prod)
      setSuppliers(supp)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Filter orders ─────────────────────────────────────
  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const statusCounts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    sent:      orders.filter(o => o.status === 'sent').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  // ── Create order ──────────────────────────────────────
  async function handleCreate() {
    if (!form.supplier_id || !form.product_id || !form.quantity) {
      setFormError('Proveedor, producto y cantidad son obligatorios')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await createOrder({
        supplier_id: parseInt(form.supplier_id),
        product_id:  parseInt(form.product_id),
        quantity:    parseInt(form.quantity),
        note:        form.note,
      })
      setShowCreate(false)
      setForm({ supplier_id: '', product_id: '', quantity: '', note: '' })
      loadAll()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Create supplier on the fly ────────────────────────
  async function handleCreateSupplier() {
    if (!supplierForm.name || !supplierForm.email) {
      setFormError('Nombre y email son obligatorios')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const newSupplier = await createSupplier(supplierForm)
      setSuppliers(prev => [...prev, newSupplier])
      setForm(f => ({ ...f, supplier_id: newSupplier.id }))
      setShowNewSupplier(false)
      setSupplierForm({ name: '', email: '', contact_name: '', phone: '' })
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Order actions ─────────────────────────────────────
  async function handleSend(order) {
    try {
      await sendOrder(order.id)
      loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleConfirm(order) {
    try {
      await confirmOrder(order.id)
      loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDeliver(order) {
    try {
      await deliverOrder(order.id)
      loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(order) {
    try {
      await deleteOrder(order.id)
      setDeleteConfirm(null)
      loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  function statusBadge(status) {
    const map = {
      pending:   { label: 'Pendiente',   color: 'var(--color-warning)',  bg: 'var(--color-warning-light)',  icon: 'schedule' },
      sent:      { label: 'Enviado',     color: 'var(--color-brand)',    bg: 'var(--color-brand-light)',    icon: 'send' },
      confirmed: { label: 'Confirmado',  color: 'var(--color-accent)',   bg: 'var(--color-accent-light)',   icon: 'check_circle' },
      delivered: { label: 'Entregado',   color: 'var(--color-success)',  bg: 'var(--color-success-light)',  icon: 'inventory' },
    }
    return map[status] || { label: status, color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)', icon: 'help' }
  }

  const s = {
    page:        { padding: '32px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--color-surface)', minHeight: '100vh' },
    card:        { background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' },
    btnPrimary:  { padding: '10px 20px', background: 'var(--color-brand)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    btnSecondary:{ padding: '8px 14px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    btnDanger:   { padding: '8px 14px', background: 'var(--color-error-light)', color: 'var(--color-error)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    input:       { width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--color-surface)', color: 'var(--color-text-primary)', boxSizing: 'border-box', outline: 'none' },
    label:       { fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' },
    modal:       { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' },
    modalBox:    { background: 'var(--color-white)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  }

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Cargando pedidos...</p>
    </div>
  )

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--color-brand)' }}>local_shipping</span>
            Pedidos a proveedores
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {orders.length} pedidos · {statusCounts.pending} pendientes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={s.btnSecondary} onClick={() => navigate('/products')}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>inventory_2</span>
            Productos
          </button>
          <button style={s.btnPrimary} onClick={() => { setShowCreate(true); setForm({ supplier_id: '', product_id: '', quantity: '', note: '' }); setFormError('') }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Nuevo pedido
          </button>
        </div>
      </div>

      {/* ── Status filter tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all',       label: 'Todos' },
          { key: 'pending',   label: 'Pendientes' },
          { key: 'sent',      label: 'Enviados' },
          { key: 'confirmed', label: 'Confirmados' },
          { key: 'delivered', label: 'Entregados' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: '8px 16px',
              background: filterStatus === tab.key ? 'var(--color-brand)' : 'var(--color-white)',
              color: filterStatus === tab.key ? 'white' : 'var(--color-text-secondary)',
              border: `1px solid ${filterStatus === tab.key ? 'var(--color-brand)' : 'var(--color-border)'}`,
              borderRadius: '99px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {tab.label}
            <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8 }}>
              ({statusCounts[tab.key]})
            </span>
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: 'var(--color-error)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* ── Orders list ── */}
      {filtered.length === 0 ? (
        <div style={{ ...s.card, textAlign: 'center', padding: '64px 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: 'var(--color-text-muted)', marginBottom: '16px', display: 'block' }}>local_shipping</span>
          <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            {filterStatus === 'all' ? 'Sin pedidos aún' : `Sin pedidos ${filterStatus === 'pending' ? 'pendientes' : filterStatus}`}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Crea un pedido para enviar a tus proveedores
          </p>
          <button style={s.btnPrimary} onClick={() => setShowCreate(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Nuevo pedido
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(order => {
            const badge = statusBadge(order.status)
            return (
              <div key={order.id} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>

                {/* Status icon */}
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: badge.color }}>{badge.icon}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      Pedido #{order.id}
                    </p>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: '99px' }}>
                      {badge.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '3px' }}>inventory_2</span>
                    {order.product_name} · <strong>{order.quantity} uds</strong>
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '3px' }}>store</span>
                    {order.supplier_name} · {formatDate(order.created_at)}
                  </p>
                  {order.note && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      "{order.note}"
                    </p>
                  )}
                </div>

                {/* Stock info */}
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Stock actual</p>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: order.current_stock <= order.min_stock ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                    {order.current_stock}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleSend(order)}
                      style={{ padding: '8px 14px', background: 'var(--color-brand-light)', color: 'var(--color-brand)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                      Enviar
                    </button>
                  )}
                  {order.status === 'sent' && (
                    <button
                      onClick={() => handleConfirm(order)}
                      style={{ padding: '8px 14px', background: 'var(--color-accent-light)', color: 'var(--color-accent)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                      Confirmar
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleDeliver(order)}
                      style={{ padding: '8px 14px', background: 'var(--color-success-light)', color: 'var(--color-success)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>inventory</span>
                      Marcar entregado
                    </button>
                  )}
                  {order.status !== 'delivered' && (
                    <button onClick={() => setDeleteConfirm(order)} style={s.btnDanger}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle' }}>delete</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CREATE ORDER MODAL ── */}
      {showCreate && (
        <div style={s.modal} onClick={() => setShowCreate(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '24px' }}>
              Nuevo pedido a proveedor
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Supplier */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ ...s.label, marginBottom: 0 }}>Proveedor *</label>
                  <button
                    onClick={() => { setShowNewSupplier(true); setSupplierForm({ name: '', email: '', contact_name: '', phone: '' }); setFormError('') }}
                    style={{ fontSize: '12px', color: 'var(--color-brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '600' }}
                  >
                    + Nuevo proveedor
                  </button>
                </div>
                <select
                  style={s.input}
                  value={form.supplier_id}
                  onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                >
                  <option value="">Selecciona un proveedor</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div>
                <label style={s.label}>Producto *</label>
                <select
                  style={s.input}
                  value={form.product_id}
                  onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                >
                  <option value="">Selecciona un producto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.current_stock} / Mín: {p.min_stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label style={s.label}>Cantidad *</label>
                <input
                  style={s.input}
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="50"
                />
              </div>

              {/* Note */}
              <div>
                <label style={s.label}>Nota (opcional)</label>
                <input
                  style={s.input}
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Reabastecimiento urgente..."
                />
              </div>

              {formError && (
                <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{formError}</p>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button style={s.btnSecondary} onClick={() => setShowCreate(false)}>Cancelar</button>
                <button
                  style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }}
                  onClick={handleCreate} disabled={saving}
                >
                  {saving ? 'Creando...' : 'Crear pedido'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW SUPPLIER MODAL ── */}
      {showNewSupplier && (
        <div style={{ ...s.modal, zIndex: 200 }} onClick={() => setShowNewSupplier(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '24px' }}>
              Nuevo proveedor
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={s.label}>Nombre empresa *</label>
                <input style={s.input} value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} placeholder="Ferretería Industrial S.L." />
              </div>
              <div>
                <label style={s.label}>Email *</label>
                <input style={s.input} type="email" value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} placeholder="pedidos@proveedor.com" />
              </div>
              <div>
                <label style={s.label}>Persona de contacto</label>
                <input style={s.input} value={supplierForm.contact_name} onChange={e => setSupplierForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Juan Pérez" />
              </div>
              <div>
                <label style={s.label}>Teléfono</label>
                <input style={s.input} value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} placeholder="+34 612 345 678" />
              </div>
              {formError && <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button style={s.btnSecondary} onClick={() => setShowNewSupplier(false)}>Cancelar</button>
                <button
                  style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }}
                  onClick={handleCreateSupplier} disabled={saving}
                >
                  {saving ? 'Creando...' : 'Crear proveedor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div style={s.modal} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modalBox, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-error-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--color-error)' }}>delete</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>¿Eliminar pedido?</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                Se eliminará el <strong>Pedido #{deleteConfirm.id}</strong>. Esta acción no se puede deshacer.
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

export default Orders