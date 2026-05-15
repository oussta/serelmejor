import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function AdminPanel() {
  const { token }  = useAuth()
  const { theme }  = useTheme()
  const { t, i18n } = useTranslation()
  const isDark     = theme === 'dark'

  const [stats,      setStats]      = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState('overview')
  const [error,      setError]      = useState('')
  const [isMobile,   setIsMobile]   = useState(window.innerWidth <= 768)
  const [mounted,    setMounted]    = useState(false)

  const cardBg  = isDark ? '#1E293B' : 'white'
  const border  = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const surfBg   = isDark ? '#0F172A' : '#F8FAFC'

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    loadAll()
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  async function loadAll() {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }
      const [sRes, bRes, uRes] = await Promise.all([
        fetch(`${API}/admin/stats`,      { headers }),
        fetch(`${API}/admin/businesses`, { headers }),
        fetch(`${API}/admin/users`,      { headers }),
      ])
      const [sData, bData, uData] = await Promise.all([sRes.json(), bRes.json(), uRes.json()])
      setStats(sData)
      setBusinesses(Array.isArray(bData) ? bData : [])
      setUsers(Array.isArray(uData) ? uData : [])
    } catch { setError(t('admin.loadError') || 'Error cargando datos') }
    finally { setLoading(false) }
  }

  const locale = i18n.language === 'en' ? 'en-GB' : i18n.language === 'fr' ? 'fr-FR' : 'es-ES'
  function formatDate(d) {
    return new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function planBadge(plan) {
    const map = {
      full:      { label: t('admin.planFull')      || 'Suite Completa', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
      salesflow: { label: 'SalesFlow',                                   color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
      stockflow: { label: 'StockFlow',                                   color: '#006591', bg: 'rgba(0,101,145,0.08)' },
      suite:     { label: t('admin.planFull')      || 'Suite Completa', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
      trial:     { label: t('admin.planTrial')     || 'Trial',          color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
      pending:   { label: t('admin.planPending')   || 'Pendiente',      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    }
    return map[plan] || { label: plan, color: '#64748B', bg: 'rgba(100,116,139,0.08)' }
  }

  function roleBadge(role) {
    const map = {
      owner:    { label: t('team.roleOwner')    || 'Owner',     color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
      employee: { label: t('team.roleEmployee') || 'Empleado',  color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
      supplier: { label: t('team.roleSupplier') || 'Proveedor', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
      admin:    { label: 'Admin',                                color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
    }
    return map[role] || { label: role, color: '#64748B', bg: 'rgba(100,116,139,0.08)' }
  }

  const tabs = [
    { key: 'overview',   label: t('admin.tabOverview')    || 'Resumen',  icon: 'dashboard' },
    { key: 'businesses', label: t('admin.tabBusinesses')  || 'Negocios', icon: 'store' },
    { key: 'users',      label: t('admin.tabUsers')       || 'Usuarios', icon: 'group' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textSub }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8B5CF6', marginBottom: '12px', display: 'block', animation: 'spin 1.5s linear infinite' }}>refresh</span>
        <p>{t('admin.loading') || 'Cargando panel...'}</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      padding: isMobile ? '16px 16px 80px' : '28px 24px',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#8B5CF6' }}>admin_panel_settings</span>
        </div>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: textMain, letterSpacing: '-0.5px' }}>
            {t('admin.title') || 'Panel de Administración'}
          </h1>
          <p style={{ fontSize: '13px', color: textSub }}>{t('admin.subtitle') || 'Visión global de la plataforma Salesek'}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: isDark ? '#1E293B' : '#F1F5F9', padding: '4px', borderRadius: '12px', width: isMobile ? '100%' : 'fit-content' }}>
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            style={{ flex: isMobile ? 1 : 'none', padding: isMobile ? '8px' : '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: tab === tb.key ? (isDark ? '#334155' : 'white') : 'none', color: tab === tb.key ? textMain : textSub, boxShadow: tab === tb.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tb.icon}</span>
            {!isMobile && tb.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: isMobile ? '10px' : '16px', marginBottom: '20px' }}>
            {[
              { icon: 'store',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', label: t('admin.businesses') || 'Negocios',  value: stats.businesses },
              { icon: 'group',          color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  label: t('admin.users')      || 'Usuarios',  value: stats.users },
              { icon: 'contacts',       color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: t('admin.leads')      || 'Leads',     value: stats.leads },
              { icon: 'inventory_2',    color: '#006591', bg: 'rgba(0,101,145,0.08)',  label: t('admin.products')   || 'Productos', value: stats.products },
              { icon: 'local_shipping', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: t('admin.orders')     || 'Pedidos',   value: stats.orders },
              { icon: 'euro',           color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'MRR',                               value: `€${stats.revenue}` },
            ].map(s => (
              <div key={s.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: isMobile ? '14px' : '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: s.color }}>{s.icon}</span>
                </div>
                <p style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: s.color, letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</p>
                <p style={{ fontSize: '12px', color: textSub, fontWeight: '600' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            {/* Plans distribution */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8B5CF6' }}>pie_chart</span>
                {t('admin.planDistribution') || 'Distribución de planes'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.plans && stats.plans.map(plan => {
                  const badge = planBadge(plan.subscription_plan)
                  const pct   = stats.businesses > 0 ? Math.round((plan.count / stats.businesses) * 100) : 0
                  return (
                    <div key={plan.subscription_plan}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: badge.color, background: badge.bg, padding: '2px 10px', borderRadius: '99px' }}>{badge.label}</span>
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
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>trending_up</span>
                {t('admin.keyMetrics') || 'Métricas clave'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: t('admin.conversionRate') || 'Tasa de conversión leads', value: stats.leads > 0 ? `${Math.round((stats.won_leads / stats.leads) * 100)}%` : '0%', icon: 'percent',       color: '#10B981' },
                  { label: t('admin.wonLeads')       || 'Leads ganados',            value: stats.won_leads,   icon: 'emoji_events',   color: '#F59E0B' },
                  { label: t('admin.lowStock')       || 'Productos con stock bajo', value: stats.low_stock,   icon: 'warning',        color: stats.low_stock > 0 ? '#F43F5E' : '#10B981' },
                  { label: t('admin.suppliers')      || 'Proveedores registrados',  value: stats.suppliers,   icon: 'local_shipping', color: '#2563EB' },
                  { label: t('admin.mrr')            || 'MRR estimado',             value: `€${stats.revenue}/mes`, icon: 'euro',    color: '#10B981' },
                ].map(metric => (
                  <div key={metric.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: surfBg, borderRadius: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${metric.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: metric.color }}>{metric.icon}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: textSub, flex: 1 }}>{metric.label}</p>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: metric.color }}>{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESSES TAB */}
      {tab === 'businesses' && (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8B5CF6' }}>store</span>
              {t('admin.allBusinesses') || 'Todos los negocios'} ({businesses.length})
            </h3>
            <button onClick={loadAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSub }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
            </button>
          </div>

          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: border }}>
              {businesses.map(biz => {
                const badge = planBadge(biz.subscription_plan)
                return (
                  <div key={biz.id} style={{ background: cardBg, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8B5CF6' }}>store</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>{biz.name}</p>
                        {biz.sector && <p style={{ fontSize: '11px', color: textSub }}>{biz.sector}</p>}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: badge.color, background: badge.bg, padding: '3px 10px', borderRadius: '99px' }}>{badge.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      {[
                        { label: t('admin.users') || 'Usuarios',   value: biz.user_count },
                        { label: t('admin.leads') || 'Leads',      value: biz.lead_count },
                        { label: t('admin.products') || 'Productos', value: biz.product_count },
                      ].map(item => (
                        <div key={item.label}>
                          <p style={{ fontSize: '16px', fontWeight: '700', color: textMain }}>{item.value}</p>
                          <p style={{ fontSize: '10px', color: textSub }}>{item.label}</p>
                        </div>
                      ))}
                      <div style={{ marginLeft: 'auto' }}>
                        <p style={{ fontSize: '11px', color: textSub }}>{formatDate(biz.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: surfBg, borderBottom: `1px solid ${border}` }}>
                    {[t('admin.business') || 'Negocio', t('admin.plan') || 'Plan', t('admin.users') || 'Usuarios', t('admin.leads') || 'Leads', t('admin.products') || 'Productos', t('admin.created') || 'Creado'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((biz, i) => {
                    const badge = planBadge(biz.subscription_plan)
                    return (
                      <tr key={biz.id} style={{ borderBottom: i < businesses.length - 1 ? `1px solid ${border}` : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8B5CF6' }}>store</span>
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{biz.name}</p>
                              {biz.sector && <p style={{ fontSize: '11px', color: textSub }}>{biz.sector}</p>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '11px', fontWeight: '700', color: badge.color, background: badge.bg, padding: '3px 10px', borderRadius: '99px' }}>{badge.label}</span></td>
                        <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{biz.user_count}</span></td>
                        <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{biz.lead_count}</span></td>
                        <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{biz.product_count}</span></td>
                        <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '13px', color: textSub }}>{formatDate(biz.created_at)}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>group</span>
              {t('admin.allUsers') || 'Todos los usuarios'} ({users.length})
            </h3>
            <button onClick={loadAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSub }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
            </button>
          </div>

          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: border }}>
              {users.map(u => {
                const rb = roleBadge(u.role)
                return (
                  <div key={u.id} style={{ background: cardBg, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: '700', flexShrink: 0 }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>{u.name}</p>
                      <p style={{ fontSize: '12px', color: textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                      {u.business_name && <p style={{ fontSize: '11px', color: textSub }}>{u.business_name}</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: rb.color, background: rb.bg, padding: '3px 10px', borderRadius: '99px' }}>{rb.label}</span>
                      <span style={{ fontSize: '11px', color: textSub }}>{formatDate(u.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: surfBg, borderBottom: `1px solid ${border}` }}>
                    {[t('team.member') || 'Usuario', 'Email', t('team.role') || 'Rol', t('admin.business') || 'Negocio', t('admin.created') || 'Registro'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const rb = roleBadge(u.role)
                    return (
                      <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${border}` : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700' }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{u.name}</p>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}><p style={{ fontSize: '13px', color: textSub }}>{u.email}</p></td>
                        <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '11px', fontWeight: '700', color: rb.color, background: rb.bg, padding: '3px 10px', borderRadius: '99px' }}>{rb.label}</span></td>
                        <td style={{ padding: '14px 16px' }}><p style={{ fontSize: '13px', color: textSub }}>{u.business_name || '—'}</p></td>
                        <td style={{ padding: '14px 16px' }}><p style={{ fontSize: '13px', color: textSub }}>{formatDate(u.created_at)}</p></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPanel