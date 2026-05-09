import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const API = 'http://localhost:8000'

function SupplierPortal() {
  const { token, user } = useAuth()
  const { theme }       = useTheme()
  const isDark          = theme === 'dark'

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [filter,  setFilter]  = useState('all')

  const cardBg     = isDark ? '#1E293B' : 'white'
  const cardBorder = isDark ? '#334155' : '#E2E8F0'
  const textMain   = isDark ? '#F1F5F9' : '#0F172A'
  const textSub    = isDark ? '#94A3B8' : '#64748B'

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      const res  = await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setError('Error cargando los pedidos')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm(orderId) {
    try {
      const res = await fetch(`${API}/orders/${orderId}/confirm`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Error confirmando pedido')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o))
      setSuccess('Pedido confirmado correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDeliver(orderId) {
    try {
      const res = await fetch(`${API}/orders/${orderId}/deliver`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Error marcando como entregado')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o))
      setSuccess('Pedido marcado como entregado')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  function statusBadge(status) {
    const map = {
      pending:   { label: 'Pendiente',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  icon: 'schedule' },
      sent:      { label: 'Enviado',    color: '#2563EB', bg: 'rgba(37,99,235,0.08)',   icon: 'send' },
      confirmed: { label: 'Confirmado', color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)',  icon: 'check_circle' },
      delivered: { label: 'Entregado',  color: '#10B981', bg: 'rgba(16,185,129,0.08)',  icon: 'inventory' },
    }
    return map[status] || { label: status, color: '#64748B', bg: 'rgba(100,116,139,0.08)', icon: 'help' }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const counts = {
    all:       orders.length,
    sent:      orders.filter(o => o.status === 'sent').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#F59E0B', marginBottom: '12px', display: 'block' }}>local_shipping</span>
        <p style={{ color: textSub }}>Cargando pedidos...</p>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#F59E0B' }}>local_shipping</span>
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: textMain, letterSpacing: '-0.5px' }}>
              Portal de Proveedor
            </h1>
            <p style={{ fontSize: '13px', color: textSub }}>
              Bienvenido, <strong>{user?.name}</strong> — Gestiona tus pedidos entrantes
            </p>
          </div>
        </div>
      </div>

      {/* ── Success ── */}
      {success && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#10B981' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          {success}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#F43F5E' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#F43F5E', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { key: 'all',       label: 'Total',      color: '#64748B', icon: 'receipt_long' },
          { key: 'sent',      label: 'Por confirmar', color: '#2563EB', icon: 'send' },
          { key: 'confirmed', label: 'Confirmados', color: '#0EA5E9', icon: 'check_circle' },
          { key: 'delivered', label: 'Entregados',  color: '#10B981', icon: 'inventory' },
        ].map(s => (
          <div
            key={s.key}
            onClick={() => setFilter(s.key)}
            style={{ background: filter === s.key ? s.color : cardBg, border: `1px solid ${filter === s.key ? s.color : cardBorder}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: filter === s.key ? 'white' : s.color, marginBottom: '6px', display: 'block' }}>{s.icon}</span>
            <p style={{ fontSize: '22px', fontWeight: '800', color: filter === s.key ? 'white' : textMain, marginBottom: '2px' }}>{counts[s.key]}</p>
            <p style={{ fontSize: '11px', color: filter === s.key ? 'rgba(255,255,255,0.8)' : textSub }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Orders list ── */}
      {filtered.length === 0 ? (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', textAlign: 'center', padding: '64px 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: textSub, marginBottom: '16px', display: 'block' }}>local_shipping</span>
          <p style={{ fontSize: '18px', fontWeight: '600', color: textMain, marginBottom: '8px' }}>Sin pedidos</p>
          <p style={{ fontSize: '14px', color: textSub }}>
            {filter === 'all' ? 'No tienes pedidos aún' : `No tienes pedidos en estado "${filter}"`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(order => {
            const badge = statusBadge(order.status)
            return (
              <div
                key={order.id}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
              >
                {/* Status icon */}
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: badge.color }}>{badge.icon}</span>
                </div>

                {/* Order info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: textMain }}>
                      Pedido #{order.id}
                    </p>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: '99px' }}>
                      {badge.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '13px', color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>inventory_2</span>
                      <strong style={{ color: textMain }}>{order.product_name}</strong>
                    </p>
                    <p style={{ fontSize: '13px', color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>tag</span>
                      <strong style={{ color: textMain }}>{order.quantity} unidades</strong>
                    </p>
                    <p style={{ fontSize: '13px', color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>calendar_today</span>
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  {order.note && (
                    <p style={{ fontSize: '12px', color: textSub, marginTop: '6px', fontStyle: 'italic' }}>
                      "{order.note}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {order.status === 'sent' && (
                    <button
                      onClick={() => handleConfirm(order.id)}
                      style={{ padding: '10px 18px', background: 'rgba(14,165,233,0.08)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                      Confirmar pedido
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleDeliver(order.id)}
                      style={{ padding: '10px 18px', background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>inventory</span>
                      Marcar entregado
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>verified</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#10B981' }}>Completado</span>
                    </div>
                  )}
                  {order.status === 'pending' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(245,158,11,0.08)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#F59E0B' }}>hourglass_empty</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#F59E0B' }}>Esperando envío</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Info note ── */}
      <div style={{ marginTop: '24px', padding: '16px 20px', background: isDark ? '#1E293B' : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB', flexShrink: 0, marginTop: '1px' }}>info</span>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: textMain, marginBottom: '4px' }}>Portal de solo lectura</p>
          <p style={{ fontSize: '12px', color: textSub, lineHeight: '1.6' }}>
            Este portal te permite ver los pedidos que te han enviado, confirmarlos y marcarlos como entregados. Para cualquier consulta contacta directamente con el negocio.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SupplierPortal