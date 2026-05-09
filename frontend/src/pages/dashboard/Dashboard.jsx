import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'

const API = 'http://localhost:8000'

function Dashboard() {
  const { user, token } = useAuth()
  const navigate        = useNavigate()
  const { i18n }        = useTranslation()
  const { theme }       = useTheme()
  const isDark          = theme === 'dark'

  const [stats,   setStats]   = useState({ leads: 0, products: 0, pending_orders: 0, low_stock: 0 })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }

      const [leadsRes, productsRes, ordersRes, lowStockRes] = await Promise.all([
        fetch(`${API}/leads`,              { headers }),
        fetch(`${API}/products`,           { headers }),
        fetch(`${API}/orders`,             { headers }),
        fetch(`${API}/products/low-stock`, { headers }),
      ])

      const [leads, products, orders, lowStock] = await Promise.all([
        leadsRes.ok      ? leadsRes.json()    : [],
        productsRes.ok   ? productsRes.json() : [],
        ordersRes.ok     ? ordersRes.json()   : [],
        lowStockRes.ok   ? lowStockRes.json() : [],
      ])

      const activeLeads    = Array.isArray(leads)    ? leads.filter(l => l.status !== 'won' && l.status !== 'lost').length : 0
      const totalProducts  = Array.isArray(products) ? products.length : 0
      const pendingOrders  = Array.isArray(orders)   ? orders.filter(o => o.status === 'pending' || o.status === 'sent').length : 0
      const lowStockCount  = Array.isArray(lowStock) ? lowStock.length : 0

      setStats({
        leads:          activeLeads,
        products:       totalProducts,
        pending_orders: pendingOrders,
        low_stock:      lowStockCount,
      })

      // Build recent activity from leads + orders
      const activity = []
      if (Array.isArray(leads)) {
        leads.slice(0, 3).forEach(l => activity.push({
          id:      `lead-${l.id}`,
          icon:    'contacts',
          color:   '#2563EB',
          text:    `Lead: ${l.client_name}`,
          status:  l.status,
          date:    l.created_at,
          path:    `/leads/${l.id}`,
        }))
      }
      if (Array.isArray(orders)) {
        orders.slice(0, 3).forEach(o => activity.push({
          id:      `order-${o.id}`,
          icon:    'local_shipping',
          color:   '#F59E0B',
          text:    `Pedido #${o.id} — ${o.product_name}`,
          status:  o.status,
          date:    o.created_at,
          path:    '/orders',
        }))
      }

      activity.sort((a, b) => new Date(b.date) - new Date(a.date))
      setRecentActivity(activity.slice(0, 6))

    } catch (e) {
      console.error('Dashboard stats error:', e)
    } finally {
      setLoading(false)
    }
  }

  const date = new Date().toLocaleDateString(
    i18n.language === 'en' ? 'en-GB' : i18n.language === 'fr' ? 'fr-FR' : 'es-ES',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  )

  const statCards = [
    {
      icon:  'contacts',
      color: '#2563EB',
      bg:    'rgba(37,99,235,0.08)',
      label: 'Leads activos',
      value: stats.leads,
      path:  '/leads',
      trend: 'pipeline comercial',
    },
    {
      icon:  'inventory_2',
      color: '#10B981',
      bg:    'rgba(16,185,129,0.08)',
      label: 'Productos',
      value: stats.products,
      path:  '/products',
      trend: 'en catálogo',
    },
    {
      icon:  'local_shipping',
      color: '#F59E0B',
      bg:    'rgba(245,158,11,0.08)',
      label: 'Pedidos activos',
      value: stats.pending_orders,
      path:  '/orders',
      trend: 'pendientes o enviados',
    },
    {
      icon:  'warning',
      color: stats.low_stock > 0 ? '#F43F5E' : '#10B981',
      bg:    stats.low_stock > 0 ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)',
      label: 'Stock bajo',
      value: stats.low_stock,
      path:  '/products',
      trend: stats.low_stock > 0 ? 'requieren reabastecimiento' : 'todo en orden',
    },
  ]

  const moduleCards = [
    {
      path:  '/leads',
      icon:  'contacts',
      title: 'SalesFlow CRM',
      text:  'Gestiona tus leads y pipeline de ventas',
      color: '#2563EB',
      bg:    'rgba(37,99,235,0.06)',
      stat:  `${stats.leads} activos`,
    },
    {
      path:  '/products',
      icon:  'inventory_2',
      title: 'StockFlow',
      text:  'Control de inventario y productos',
      color: '#10B981',
      bg:    'rgba(16,185,129,0.06)',
      stat:  `${stats.products} productos`,
    },
    {
      path:  '/orders',
      icon:  'local_shipping',
      title: 'Pedidos',
      text:  'Órdenes de compra a proveedores',
      color: '#F59E0B',
      bg:    'rgba(245,158,11,0.06)',
      stat:  `${stats.pending_orders} activos`,
    },
    {
      path:  '/team',
      icon:  'group',
      title: 'Equipo',
      text:  'Gestiona tu equipo y roles',
      color: '#0EA5E9',
      bg:    'rgba(14,165,233,0.06)',
      stat:  user?.role,
    },
  ]

  const statusLabels = {
    new: 'Nuevo', contacted: 'Contactado', negotiating: 'Negociando',
    won: 'Ganado', lost: 'Perdido',
    pending: 'Pendiente', sent: 'Enviado', confirmed: 'Confirmado', delivered: 'Entregado',
  }

  const statusColors = {
    new: '#64748B', contacted: '#2563EB', negotiating: '#F59E0B',
    won: '#10B981', lost: '#F43F5E',
    pending: '#F59E0B', sent: '#2563EB', confirmed: '#0EA5E9', delivered: '#10B981',
  }

  function formatDate(dateStr) {
    const d    = new Date(dateStr)
    const now  = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  const cardBg     = isDark ? '#1E293B' : 'white'
  const cardBorder = isDark ? '#334155' : '#E2E8F0'
  const textMain   = isDark ? '#F1F5F9' : '#0F172A'
  const textSub    = isDark ? '#94A3B8' : '#64748B'
  const pageBg     = isDark ? '#0F172A' : 'var(--color-surface)'

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', background: pageBg, minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: textMain, marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Bienvenido, {user?.name} 👋
          </h1>
          <p style={{ fontSize: '14px', color: textSub, textTransform: 'capitalize' }}>
            Panel de Control — {date}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadStats}
            style={{ padding: '8px 16px', background: 'none', border: `1px solid ${cardBorder}`, borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
            Actualizar
          </button>
          <button
            onClick={() => navigate('/leads')}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Nuevo lead
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {statCards.map(stat => (
          <div
            key={stat.label}
            onClick={() => navigate(stat.path)}
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: stat.color }}>{stat.icon}</span>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: textSub }}>arrow_forward</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '800', color: stat.color, letterSpacing: '-0.03em', marginBottom: '4px' }}>
              {loading ? '—' : stat.value}
            </p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: textMain, marginBottom: '2px' }}>{stat.label}</p>
            <p style={{ fontSize: '11px', color: textSub }}>{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* ── Module cards + Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>

        {/* Module cards */}
        <div>
          <p style={{ fontSize: '12px', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Módulos</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {moduleCards.map(card => (
              <div
                key={card.path}
                onClick={() => navigate(card.path)}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: card.bg, borderRadius: '0 16px 0 60px' }} />
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: card.color }}>{card.icon}</span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '4px' }}>{card.title}</h3>
                <p style={{ fontSize: '12px', color: textSub, lineHeight: '1.5', marginBottom: '14px' }}>{card.text}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: card.color, background: card.bg, padding: '3px 8px', borderRadius: '99px' }}>
                    {card.stat}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: '600', color: card.color }}>
                    Ir
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: textMain, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>history</span>
              Actividad reciente
            </h2>
            <button
              onClick={loadStats}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSub, display: 'flex', alignItems: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: textSub }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}>hourglass_empty</span>
              <p style={{ fontSize: '13px' }}>Cargando...</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: textSub }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', marginBottom: '12px', display: 'block' }}>inbox</span>
              <p style={{ fontSize: '13px' }}>Sin actividad reciente</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentActivity.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? '#1E293B' : '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = isDark ? '#0F172A' : '#F8FAFC'}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: item.color }}>{item.icon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.text}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', color: statusColors[item.status] || textSub, background: `${statusColors[item.status] || '#64748B'}15`, padding: '1px 6px', borderRadius: '99px' }}>
                        {statusLabels[item.status] || item.status}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: textSub, flexShrink: 0 }}>{formatDate(item.date)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bridge info card */}
          <div style={{ marginTop: '16px', padding: '12px', background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(14,165,233,0.06))', border: `1px solid ${isDark ? 'rgba(37,99,235,0.2)' : 'rgba(37,99,235,0.15)'}`, borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>hub</span>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB' }}>The Bridge activo</p>
            </div>
            <p style={{ fontSize: '11px', color: textSub, lineHeight: '1.5' }}>
              Las ventas en CRM actualizan automáticamente el inventario y crean pedidos si el stock baja del mínimo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard