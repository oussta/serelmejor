import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { showToast } from '../../components/ui/Toast'
import {
  getOrders, createOrder, deleteOrder,
  sendOrder, confirmOrder, deliverOrder,
  getProducts, getSuppliers, createSupplier,
} from '../../services/stockService'

const PAGE_SIZE = 8

function Orders() {
  const navigate  = useNavigate()
  const { t }     = useTranslation()
  const { theme } = useTheme()
  const { token } = useAuth()
  const isDark    = theme === 'dark'

  const [orders,       setOrders]       = useState([])
  const [products,     setProducts]     = useState([])
  const [suppliers,    setSuppliers]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage,  setCurrentPage]  = useState(1)
  const [mounted,      setMounted]      = useState(false)
  const [isMobile,     setIsMobile]     = useState(window.innerWidth <= 768)

  // Modals
  const [showCreate,      setShowCreate]      = useState(false)
  const [showNewSupplier, setShowNewSupplier] = useState(false)
  const [deleteConfirm,   setDeleteConfirm]   = useState(null)

  // AI
  const [showAI,    setShowAI]    = useState(false)
  const [aiContext, setAiContext]  = useState('')
  const [aiResult,  setAiResult]  = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Forms
  const [form,         setForm]         = useState({ supplier_id: '', product_id: '', quantity: '', note: '' })
  const [supplierForm, setSupplierForm] = useState({ name: '', email: '', contact_name: '', phone: '' })
  const [saving,       setSaving]       = useState(false)
  const [formError,    setFormError]    = useState('')

  const cardBg   = isDark ? '#1E293B' : '#FFFFFF'
  const border   = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      setLoading(true)
      const [ord, prod, supp] = await Promise.all([getOrders(), getProducts(), getSuppliers()])
      setOrders(Array.isArray(ord) ? ord : [])
      setProducts(Array.isArray(prod) ? prod : [])
      setSuppliers(Array.isArray(supp) ? supp : [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => { setCurrentPage(1) }, [filterStatus])

  const statusCounts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    sent:      orders.filter(o => o.status === 'sent').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  async function handleCreate() {
    if (!form.supplier_id || !form.product_id || !form.quantity) { setFormError(t('orders.requiredFields') || 'Proveedor, producto y cantidad son obligatorios'); return }
    setSaving(true); setFormError('')
    try {
      await createOrder({ supplier_id: parseInt(form.supplier_id), product_id: parseInt(form.product_id), quantity: parseInt(form.quantity), note: form.note })
      setShowCreate(false)
      setForm({ supplier_id: '', product_id: '', quantity: '', note: '' })
      loadAll()
      showToast(t('orders.created') || 'Pedido creado ✓', 'success')
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  async function handleCreateSupplier() {
    if (!supplierForm.name || !supplierForm.email) { setFormError(t('orders.supplierRequired') || 'Nombre y email son obligatorios'); return }
    setSaving(true); setFormError('')
    try {
      const newSupplier = await createSupplier(supplierForm)
      setSuppliers(prev => [...prev, newSupplier])
      setForm(f => ({ ...f, supplier_id: newSupplier.id }))
      setShowNewSupplier(false)
      setSupplierForm({ name: '', email: '', contact_name: '', phone: '' })
      showToast(t('orders.supplierCreated') || 'Proveedor creado ✓', 'success')
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  async function handleSend(order) {
    try { await sendOrder(order.id); loadAll(); showToast(t('orders.sent') || 'Pedido enviado ✓', 'success') }
    catch (e) { setError(e.message) }
  }

  async function handleConfirm(order) {
    try { await confirmOrder(order.id); loadAll(); showToast(t('orders.confirmed') || 'Pedido confirmado ✓', 'success') }
    catch (e) { setError(e.message) }
  }

  async function handleDeliver(order) {
    try { await deliverOrder(order.id); loadAll(); showToast(t('orders.delivered') || 'Pedido entregado ✓', 'success') }
    catch (e) { setError(e.message) }
  }

  async function handleDelete(order) {
    try { await deleteOrder(order.id); setDeleteConfirm(null); loadAll(); showToast(t('orders.deleted') || 'Pedido eliminado', 'info') }
    catch (e) { setError(e.message) }
  }

  async function handleAI() {
    if (!aiContext.trim()) return
    setAiLoading(true); setAiResult('')
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API}/ai/suggest-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ context: aiContext, orders: orders.slice(0, 5), products: products.slice(0, 5) }),
      })
      const data = await res.json()
      setAiResult(data.suggestion || data.draft || data.response || 'Sugerencia generada')
    } catch { setAiResult('Error al conectar con la IA.') }
    finally { setAiLoading(false) }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function statusBadge(status) {
    const map = {
      pending:   { label: t('orders.statusPending')   || 'Pendiente',  color: '#F59E0B', bg: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB',  icon: 'schedule' },
      sent:      { label: t('orders.statusSent')      || 'Enviado',    color: '#2563EB', bg: isDark ? 'rgba(37,99,235,0.1)'  : '#EFF6FF',  icon: 'send' },
      confirmed: { label: t('orders.statusConfirmed') || 'Confirmado', color: '#0EA5E9', bg: isDark ? 'rgba(14,165,233,0.1)' : '#E0F2FE',  icon: 'check_circle' },
      delivered: { label: t('orders.statusDelivered') || 'Entregado',  color: '#10B981', bg: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5',  icon: 'inventory' },
    }
    return map[status] || { label: status, color: textSub, bg: isDark ? '#334155' : '#F1F5F9', icon: 'help' }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: textMain, boxSizing: 'border-box', outline: 'none' }
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }
  const modalStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }
  const modalBox   = { background: cardBg, borderRadius: '20px', padding: isMobile ? '24px 20px' : '32px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${border}`, maxHeight: '90vh', overflowY: 'auto' }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textSub }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#2563EB', marginBottom: '12px', display: 'block', animation: 'spin 1.5s linear infinite' }}>local_shipping</span>
        <p>{t('orders.loading') || 'Cargando pedidos...'}</p>
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
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#2563EB' }}>local_shipping</span>
            {t('orders.title') || 'Pedidos a proveedores'}
          </h1>
          <p style={{ fontSize: '13px', color: textSub, marginTop: '4px' }}>
            {orders.length} {t('orders.total') || 'pedidos'} · {statusCounts.pending} {t('orders.pending') || 'pendientes'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAI(!showAI)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: showAI ? 'linear-gradient(135deg, #7C3AED, #2563EB)' : (isDark ? '#1E293B' : '#F1F5F9'), color: showAI ? 'white' : textSub, border: `1px solid ${showAI ? 'transparent' : border}`, borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>smart_toy</span>
            {!isMobile && 'Salesek AI'}
          </button>
          <button onClick={() => navigate('/products')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>inventory_2</span>
            {!isMobile && (t('orders.products') || 'Productos')}
          </button>
          <button onClick={() => { setShowCreate(true); setForm({ supplier_id: '', product_id: '', quantity: '', note: '' }); setFormError('') }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            {t('orders.new') || 'Nuevo pedido'}
          </button>
        </div>
      </div>

      {/* AI Panel */}
      {showAI && (
        <div style={{ background: isDark ? '#0a0f1e' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE'}`, borderRadius: '16px', padding: '20px', marginBottom: '20px', animation: 'slideDown 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#7C3AED' }}>smart_toy</span>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>Salesek AI — {t('orders.aiTitle') || 'Asistente de pedidos'}</h3>
          </div>
          <textarea value={aiContext} onChange={e => setAiContext(e.target.value)} placeholder={t('orders.aiPlaceholder') || 'Describe tu situación de pedidos para obtener sugerencias...'} rows={3} style={{ ...inputStyle, marginBottom: '10px', resize: 'vertical' }} />
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
            {aiResult && <button onClick={() => navigator.clipboard.writeText(aiResult)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>Copiar</button>}
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all',       label: t('orders.all')       || 'Todos' },
          { key: 'pending',   label: t('orders.statusPending')   || 'Pendientes' },
          { key: 'sent',      label: t('orders.statusSent')      || 'Enviados' },
          { key: 'confirmed', label: t('orders.statusConfirmed') || 'Confirmados' },
          { key: 'delivered', label: t('orders.statusDelivered') || 'Entregados' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilterStatus(tab.key)} style={{ padding: '7px 14px', background: filterStatus === tab.key ? '#2563EB' : 'transparent', color: filterStatus === tab.key ? 'white' : textSub, border: `1px solid ${filterStatus === tab.key ? '#2563EB' : border}`, borderRadius: '99px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
            {tab.label} ({statusCounts[tab.key]})
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Orders list */}
      {paginated.length === 0 ? (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', textAlign: 'center', padding: '64px 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: textSub, marginBottom: '16px', display: 'block', opacity: 0.5 }}>local_shipping</span>
          <p style={{ fontSize: '18px', fontWeight: '600', color: textMain, marginBottom: '8px' }}>{t('orders.empty') || 'Sin pedidos aún'}</p>
          <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>{t('orders.emptyDesc') || 'Crea un pedido para enviar a tus proveedores'}</p>
          <button onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            {t('orders.new') || 'Nuevo pedido'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {paginated.map(order => {
            const badge = statusBadge(order.status)
            return (
              <div key={order.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '16px 20px', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {isMobile ? (
                  // Mobile card layout
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: badge.color }}>{badge.icon}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>{t('orders.order') || 'Pedido'} #{order.id}</p>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: '99px' }}>{badge.label}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: textSub }}>{order.product_name} · <strong style={{ color: textMain }}>{order.quantity} uds</strong></p>
                        <p style={{ fontSize: '11px', color: textSub }}>{order.supplier_name} · {formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {order.status === 'pending' && <button onClick={() => handleSend(order)} style={{ flex: 1, padding: '8px', background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}><span className="material-symbols-outlined" style={{ fontSize: '15px' }}>send</span>{t('orders.send') || 'Enviar'}</button>}
                      {order.status === 'sent' && <button onClick={() => handleConfirm(order)} style={{ flex: 1, padding: '8px', background: isDark ? 'rgba(14,165,233,0.1)' : '#E0F2FE', color: '#0EA5E9', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}><span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check_circle</span>{t('orders.confirm') || 'Confirmar'}</button>}
                      {order.status === 'confirmed' && <button onClick={() => handleDeliver(order)} style={{ flex: 1, padding: '8px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: '#10B981', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}><span className="material-symbols-outlined" style={{ fontSize: '15px' }}>inventory</span>{t('orders.deliver') || 'Entregar'}</button>}
                      {order.status !== 'delivered' && <button onClick={() => setDeleteConfirm(order)} style={{ padding: '8px 12px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', color: '#F43F5E', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}><span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span></button>}
                    </div>
                  </div>
                ) : (
                  // Desktop row layout
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '22px', color: badge.color }}>{badge.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: textMain }}>{t('orders.order') || 'Pedido'} #{order.id}</p>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: '99px' }}>{badge.label}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: textSub }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '3px' }}>inventory_2</span>
                        {order.product_name} · <strong style={{ color: textMain }}>{order.quantity} uds</strong>
                      </p>
                      <p style={{ fontSize: '12px', color: textSub, marginTop: '2px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '13px', verticalAlign: 'middle', marginRight: '3px' }}>store</span>
                        {order.supplier_name} · {formatDate(order.created_at)}
                      </p>
                      {order.note && <p style={{ fontSize: '12px', color: textSub, marginTop: '3px', fontStyle: 'italic' }}>"{order.note}"</p>}
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '70px' }}>
                      <p style={{ fontSize: '10px', color: textSub, marginBottom: '2px' }}>{t('products.currentStock') || 'Stock'}</p>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: order.current_stock <= order.min_stock ? '#F43F5E' : textMain }}>{order.current_stock}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {order.status === 'pending' && <button onClick={() => handleSend(order)} style={{ padding: '8px 14px', background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>{t('orders.send') || 'Enviar'}</button>}
                      {order.status === 'sent' && <button onClick={() => handleConfirm(order)} style={{ padding: '8px 14px', background: isDark ? 'rgba(14,165,233,0.1)' : '#E0F2FE', color: '#0EA5E9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>{t('orders.confirm') || 'Confirmar'}</button>}
                      {order.status === 'confirmed' && <button onClick={() => handleDeliver(order)} style={{ padding: '8px 14px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: '#10B981', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>inventory</span>{t('orders.deliver') || 'Marcar entregado'}</button>}
                      {order.status !== 'delivered' && <button onClick={() => setDeleteConfirm(order)} style={{ padding: '8px 12px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', color: '#F43F5E', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span></button>}
                    </div>
                  </div>
                )}
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
            <button key={page} onClick={() => setCurrentPage(page)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${page === currentPage ? '#2563EB' : border}`, background: page === currentPage ? '#2563EB' : 'none', color: page === currentPage ? 'white' : textSub, fontSize: '14px', fontWeight: page === currentPage ? '700' : '400', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{page}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${border}`, background: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === totalPages ? 0.4 : 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
          </button>
          <span style={{ fontSize: '13px', color: textSub }}>{filtered.length} {t('orders.total') || 'pedidos'}</span>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {showCreate && (
        <div style={modalStyle} onClick={() => setShowCreate(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: textMain, marginBottom: '24px' }}>{t('orders.new') || 'Nuevo pedido a proveedor'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>{t('orders.supplier') || 'Proveedor'} *</label>
                  <button onClick={() => { setShowNewSupplier(true); setSupplierForm({ name: '', email: '', contact_name: '', phone: '' }); setFormError('') }} style={{ fontSize: '12px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '600' }}>+ {t('orders.newSupplier') || 'Nuevo proveedor'}</button>
                </div>
                <select style={inputStyle} value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}>
                  <option value="">{t('orders.selectSupplier') || 'Selecciona un proveedor'}</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('orders.product') || 'Producto'} *</label>
                <select style={inputStyle} value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
                  <option value="">{t('orders.selectProduct') || 'Selecciona un producto'}</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock} / Mín: {p.min_stock})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('orders.quantity') || 'Cantidad'} *</label>
                <input style={inputStyle} type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="50" />
              </div>
              <div>
                <label style={labelStyle}>{t('orders.noteOptional') || 'Nota (opcional)'}</label>
                <input style={inputStyle} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Reabastecimiento urgente..." />
              </div>
              {formError && <p style={{ color: '#F43F5E', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: '10px 18px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
                <button onClick={handleCreate} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>{saving ? (t('orders.creating') || 'Creando...') : (t('orders.create') || 'Crear pedido')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW SUPPLIER MODAL */}
      {showNewSupplier && (
        <div style={{ ...modalStyle, zIndex: 200 }} onClick={() => setShowNewSupplier(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: textMain, marginBottom: '24px' }}>{t('orders.newSupplier') || 'Nuevo proveedor'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>{t('orders.supplierName') || 'Nombre empresa'} *</label><input style={inputStyle} value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} placeholder="Ferretería Industrial S.L." /></div>
              <div><label style={labelStyle}>Email *</label><input style={inputStyle} type="email" value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} placeholder="pedidos@proveedor.com" /></div>
              <div><label style={labelStyle}>{t('orders.contactName') || 'Persona de contacto'}</label><input style={inputStyle} value={supplierForm.contact_name} onChange={e => setSupplierForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Juan Pérez" /></div>
              <div><label style={labelStyle}>{t('orders.phone') || 'Teléfono'}</label><input style={inputStyle} value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} placeholder="+34 612 345 678" /></div>
              {formError && <p style={{ color: '#F43F5E', fontSize: '13px' }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowNewSupplier(false)} style={{ padding: '10px 18px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
                <button onClick={handleCreateSupplier} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>{saving ? (t('orders.creating') || 'Creando...') : (t('orders.createSupplier') || 'Crear proveedor')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div style={modalStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...modalBox, maxWidth: '380px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#F43F5E' }}>delete</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '8px' }}>{t('orders.deleteTitle') || '¿Eliminar pedido?'}</h3>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>
              {t('orders.deleteDesc') || 'Se eliminará el'} <strong style={{ color: textMain }}>{t('orders.order') || 'Pedido'} #{deleteConfirm.id}</strong>. {t('orders.deleteDesc2') || 'Esta acción no se puede deshacer.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '10px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '10px', background: '#F43F5E', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('orders.confirmDelete') || 'Sí, eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

export default Orders