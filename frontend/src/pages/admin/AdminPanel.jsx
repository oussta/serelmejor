import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const API = 'http://localhost:8000'

function AdminPanel() {
  const { token }  = useAuth()
  const navigate   = useNavigate()
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'

  const [stats,      setStats]      = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState('overview')
  const [error,      setError]      = useState('')

  const cardBg     = isDark ? '#1E293B' : 'white'
  const cardBorder = isDark ? '#334155' : '#E2E8F0'
  const textMain   = isDark ? '#F1F5F9' : '#0F172A'
  const textSub    = isDark ? '#94A3B8' : '#64748B'
  const pageBg     = isDark ? '#0F172A' : '#F8FAFC'

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }
      const [statsRes, bizRes, usersRes] = await Promise.all([
        fetch(`${API}/admin/stats`,      { headers }),
        fetch(`${API}/admin/businesses`, { headers }),
        fetch(`${API}/admin/users`,      { headers }),
      ])
      const [statsData, bizData, usersData] = await Promise.all([
        statsRes.json(),
        bizRes.json(),
        usersRes.json(),
      ])
      setStats(statsData)
      setBusinesses(Array.isArray(bizData) ? bizData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (e) {
      setError('Error cargando datos de administración')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  function planBadge(plan) {
    const map = {
      full:      { label: 'Suite Completa', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
      salesflow: { label: 'SalesFlow',      color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
      stockflow: { label: 'StockFlow',      color: '#006591', bg: 'rgba(0,101,145,0.08)' },
      pending:   { label: 'Pendiente',      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    }
    return map[plan] || { label: plan, color: '#64748B', bg: 'rgba(100,116,139,0.08)' }
  }

  function roleBadge(role) {
    const map = {
      owner:    { label: 'Owner',    color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
      employee: { label: 'Empleado', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
      supplier: { label: 'Proveedor',color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
      admin:    { label: 'Admin',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
    }
    return map[role] || { label: role, color: '#64748B', bg: 'rgba(100,116,139,0.08)' }
  }

  const tabs = [
    { key: 'overview',   label: 'Resumen',   icon: 'dashboard' },
    { key: 'businesses', label: 'Negocios',  icon: 'store' },
    { key: 'users',      label: 'Usuarios',  icon: 'group' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8B5CF6', marginBottom: '12px', display: 'block' }}>admin_panel_settings</span>
        <p style={{ color: textSub }}>Cargando panel de administración...</p>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', background: pageBg, minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#8B5CF6' }}>admin_panel_settings</span>
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: textMain, letterSpacing: '-0.5px' }}>
              Panel de Administración
            </h1>
            <p style={{ fontSize: '13px', color: textSub }}>Visión global de la plataforma serElMejor</p>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: isDark ? '#1E293B' : '#F1F5F9', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: tab === t.key ? (isDark ? '#334155' : 'white') : 'none',
              color: tab === t.key ? textMain : textSub,
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && stats && (
        <div>
          {/* Big stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: 'store',           color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', label: 'Negocios',   value: stats.businesses },
              { icon: 'group',           color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  label: 'Usuarios',   value: stats.users },
              { icon: 'contacts',        color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'Leads',      value: stats.leads },
              { icon: 'inventory_2',     color: '#006591', bg: 'rgba(0,101,145,0.08)',  label: 'Productos',  value: stats.products },
              { icon: 'local_shipping',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: 'Pedidos',    value: stats.orders },
              { icon: 'euro',            color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'MRR',        value: `€${stats.revenue}` },
            ].map(s => (
              <div key={s.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: s.color }}>{s.icon}</span>
                </div>
                <p style={{ fontSize: '28px', fontWeight: '800', color: s.color, letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</p>
                <p style={{ fontSize: '12px', color: textSub, fontWeight: '600' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Plans + conversion */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Plans distribution */}
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8B5CF6' }}>pie_chart</span>
                Distribución de planes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.plans.map(plan => {
                  const badge = planBadge(plan.subscription_plan)
                  const pct   = stats.businesses > 0 ? Math.round((plan.count / stats.businesses) * 100) : 0
                  return (
                    <div key={plan.subscription_plan}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: badge.color, background: badge.bg, padding: '2px 10px', borderRadius: '99px' }}>
                          {badge.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: textMain }}>{plan.count}</span>
                          <span style={{ fontSize: '12px', color: textSub }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: badge.color, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Key metrics */}
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>trending_up</span>
                Métricas clave
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  {
                    label: 'Tasa de conversión leads',
                    value: stats.leads > 0 ? `${Math.round((stats.won_leads / stats.leads) * 100)}%` : '0%',
                    icon: 'percent', color: '#10B981',
                  },
                  {
                    label: 'Leads ganados',
                    value: stats.won_leads,
                    icon: 'emoji_events', color: '#F59E0B',
                  },
                  {
                    label: 'Productos con stock bajo',
                    value: stats.low_stock,
                    icon: 'warning', color: stats.low_stock > 0 ? '#F43F5E' : '#10B981',
                  },
                  {
                    label: 'Proveedores registrados',
                    value: stats.suppliers,
                    icon: 'local_shipping', color: '#2563EB',
                  },
                  {
                    label: 'MRR estimado',
                    value: `€${stats.revenue}/mes`,
                    icon: 'euro', color: '#10B981',
                  },
                ].map(metric => (
                  <div key={metric.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${metric.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: metric.color }}>{metric.icon}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: textSub, flex: 1 }}>{metric.label}</p>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: metric.color }}>{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BUSINESSES TAB ── */}
      {tab === 'businesses' && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8B5CF6' }}>store</span>
              Todos los negocios ({businesses.length})
            </h3>
            <button onClick={loadAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSub, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
              Actualizar
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                  {['Negocio', 'Plan', 'Usuarios', 'Leads', 'Productos', 'Creado'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {businesses.map((biz, i) => {
                  const badge = planBadge(biz.subscription_plan)
                  return (
                    <tr
                      key={biz.id}
                      style={{ borderBottom: i < businesses.length - 1 ? `1px solid ${cardBorder}` : 'none', transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8B5CF6' }}>store</span>
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{biz.name}</p>
                            {biz.sector && <p style={{ fontSize: '11px', color: textSub }}>{biz.sector}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: badge.color, background: badge.bg, padding: '3px 10px', borderRadius: '99px' }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{biz.user_count}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{biz.lead_count}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{biz.product_count}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', color: textSub }}>{formatDate(biz.created_at)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>group</span>
              Todos los usuarios ({users.length})
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                  {['Usuario', 'Email', 'Rol', 'Negocio', 'Registro'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rb = roleBadge(u.role)
                  return (
                    <tr
                      key={u.id}
                      style={{ borderBottom: i < users.length - 1 ? `1px solid ${cardBorder}` : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{u.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: '13px', color: textSub }}>{u.email}</p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: rb.color, background: rb.bg, padding: '3px 10px', borderRadius: '99px' }}>
                          {rb.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: '13px', color: textSub }}>{u.business_name || '—'}</p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: '13px', color: textSub }}>{formatDate(u.created_at)}</p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel