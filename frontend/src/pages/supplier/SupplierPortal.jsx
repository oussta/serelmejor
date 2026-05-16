import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { showToast } from '../../components/ui/Toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function SupplierPortal() {
  const { token, user } = useAuth()
  const { theme }       = useTheme()
  const { t, i18n }    = useTranslation()
  const isDark          = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mounted,  setMounted]  = useState(false)

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [filter,  setFilter]  = useState('all')

  const cardBg  = isDark ? '#1E293B' : 'white'
  const border  = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const surfBg   = isDark ? '#0F172A' : '#F8FAFC'

  const locale = i18n.language === 'en' ? 'en-GB' : i18n.language === 'fr' ? 'fr-FR' : 'es-ES'

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    loadOrders()
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      const res  = await fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch { setError(t('supplier.loadError') || 'Error cargando los pedidos') }
    finally { setLoading(false) }
  }

  async function handleConfirm(orderId) {
    try {
      const res = await fetch(`${API}/orders/${orderId}/confirm`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o))
      showToast(t('supplier.confirmed') || 'Pedido confirmado ✓', 'success')
    } catch { setError(t('supplier.confirmError') || 'Error confirmando pedido') }
  }

  async function handleDeliver(orderId) {
    try {
      const res = await fetch(`${API}/orders/${orderId}/deliver`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o))
      showToast(t('supplier.delivered') || 'Pedido marcado como entregado ✓', 'success')
    } catch { setError(t('supplier.deliverError') || 'Error marcando como entregado') }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function statusBadge(status) {
    const map = {
      pending:   { label: t('orders.statusPending')   || 'Pendiente',  color: '#F59E0B', bg: isDark ? 'rgba(245,158,11,0.1)'  : '#FFFBEB', icon: 'schedule' },
      sent:      { label: t('orders.statusSent')      || 'Enviado',    color: '#2563EB', bg: isDark ? 'rgba(37,99,235,0.1)'   : '#EFF6FF', icon: 'send' },
      confirmed: { label: t('orders.statusConfirmed') || 'Confirmado', color: '#0EA5E9', bg: isDark ? 'rgba(14,165,233,0.1)'  : '#E0F2FE', icon: 'check_circle' },
      delivered: { label: t('orders.statusDelivered') || 'Entregado',  color: '#10B981', bg: isDark ? 'rgba(16,185,129,0.1)'  : '#ECFDF5', icon: 'inventory' },
    }
    return map[status] || { label: status, color: '#64748B', bg: isDark ? '#334155' : '#F1F5F9', icon: 'help' }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const counts = {
    all:       orders.length,
    sent:      orders.filter(o => o.status === 'sent').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textSub }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#F59E0B', marginBottom: '12px', display: 'block', animation: 'spin 1.5s linear infinite' }}>refresh</span>
        <p>{t('supplier.loading') || 'Cargando pedidos...'}</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      padding: isMobile ? '0 0 80px' : '0 0 40px',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#F59E0B' }}>local_shipping</span>
        </div>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: textMain, letterSpacing: '-0.5px' }}>
            {t('supplier.title') || 'Portal de Proveedor'}
          </h1>
          <p style={{ fontSize: '13px', color: textSub }}>
            {t('supplier.welcome') || 'Bienvenido'}, <strong style={{ color: textMain }}>{user?.name}</strong> — {t('supplier.subtitle') || 'Gestiona tus pedidos entrantes'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#F43F5E', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Stats filter cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {[
          { key: 'all',       label: t('orders.all')              || 'Todos',          color: '#64748B', icon: 'receipt_long' },
          { key: 'sent',      label: t('supplier.toConfirm')      || 'Por confirmar',  color: '#2563EB', icon: 'send' },
          { key: 'confirmed', label: t('orders.statusConfirmed')  || 'Confirmados',    color: '#0EA5E9', icon: 'check_circle' },
          { key: 'delivered', label: t('orders.statusDelivered')  || 'Entregados',     color: '#10B981', icon: 'inventory' },
        ].map(s => (
          <div
            key={s.key}
            onClick={() => setFilter(s.key)}
            style={{ background: filter === s.key ? s.color : cardBg, border: `1px solid ${filter === s.key ? s.color : border}`, borderRadius: '12px', padding: isMobile ? '14px 12px' : '16px', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: filter === s.key ? 'white' : s.color, marginBottom: '6px', display: 'block' }}>{s.icon}</span>
            <p style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '800', color: filter === s.key ? 'white' : textMain, marginBottom: '2px' }}>{counts[s.key]}</p>
            <p style={{ fontSize: '11px', color: filter === s.key ? 'rgba(255,255,255,0.8)' : textSub }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', textAlign: 'center', padding: '64px 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: textSub, marginBottom: '16px', display: 'block', opacity: 0.5 }}>local_shipping</span>
          <p style={{ fontSize: '18px', fontWeight: '600', color: textMain, marginBottom: '8px' }}>{t('supplier.noOrders') || 'Sin pedidos'}</p>
          <p style={{ fontSize: '14px', color: textSub }}>{t('supplier.noOrdersDesc') || 'No tienes pedidos en este estado'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(order => {
            const badge = statusBadge(order.status)
            return (
              <div key={order.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: isMobile ? '16px' : '20px', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {isMobile ? (
                  // Mobile layout
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: badge.color }}>{badge.icon}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>{t('orders.order') || 'Pedido'} #{order.id}</p>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: '99px' }}>{badge.label}</span>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: textMain }}>{order.product_name} · <span style={{ color: '#2563EB' }}>{order.quantity} uds</span></p>
                        <p style={{ fontSize: '11px', color: textSub }}>{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    {order.note && <p style={{ fontSize: '12px', color: textSub, fontStyle: 'italic', marginBottom: '12px' }}>"{order.note}"</p>}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {order.status === 'sent' && (
                        <button onClick={() => handleConfirm(order.id)} style={{ flex: 1, padding: '9px', background: isDark ? 'rgba(14,165,233,0.1)' : '#E0F2FE', color: '#0EA5E9', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check_circle</span>
                          {t('orders.confirm') || 'Confirmar'}
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button onClick={() => handleDeliver(order.id)} style={{ flex: 1, padding: '9px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: '#10B981', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>inventory</span>
                          {t('orders.deliver') || 'Entregar'}
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', borderRadius: '8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#10B981' }}>verified</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#10B981' }}>{t('supplier.completed') || 'Completado'}</span>
                        </div>
                      )}
                      {order.status === 'pending' && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB', borderRadius: '8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#F59E0B' }}>hourglass_empty</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#F59E0B' }}>{t('supplier.waitingShipment') || 'Esperando envío'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Desktop layout
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px', color: badge.color }}>{badge.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: textMain }}>{t('orders.order') || 'Pedido'} #{order.id}</p>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: '99px' }}>{badge.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '13px', color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>inventory_2</span>
                          <strong style={{ color: textMain }}>{order.product_name}</strong>
                        </p>
                        <p style={{ fontSize: '13px', color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>tag</span>
                          <strong style={{ color: textMain }}>{order.quantity} {t('productDetail.units') || 'unidades'}</strong>
                        </p>
                        <p style={{ fontSize: '13px', color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>calendar_today</span>
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      {order.note && <p style={{ fontSize: '12px', color: textSub, marginTop: '4px', fontStyle: 'italic' }}>"{order.note}"</p>}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {order.status === 'sent' && (
                        <button onClick={() => handleConfirm(order.id)} style={{ padding: '10px 18px', background: isDark ? 'rgba(14,165,233,0.1)' : '#E0F2FE', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                          {t('supplier.confirmOrder') || 'Confirmar pedido'}
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button onClick={() => handleDeliver(order.id)} style={{ padding: '10px 18px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>inventory</span>
                          {t('supplier.markDelivered') || 'Marcar entregado'}
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>verified</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#10B981' }}>{t('supplier.completed') || 'Completado'}</span>
                        </div>
                      )}
                      {order.status === 'pending' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#F59E0B' }}>hourglass_empty</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#F59E0B' }}>{t('supplier.waitingShipment') || 'Esperando envío'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Info note */}
      <div style={{ marginTop: '24px', padding: '16px 20px', background: surfBg, border: `1px solid ${border}`, borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB', flexShrink: 0, marginTop: '1px' }}>info</span>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: textMain, marginBottom: '4px' }}>{t('supplier.infoTitle') || 'Portal de solo lectura'}</p>
          <p style={{ fontSize: '12px', color: textSub, lineHeight: '1.6' }}>{t('supplier.infoDesc') || 'Este portal te permite ver los pedidos enviados, confirmarlos y marcarlos como entregados. Para consultas contacta directamente con el negocio.'}</p>
        </div>
      </div>
    </div>
  )
}

export default SupplierPortal