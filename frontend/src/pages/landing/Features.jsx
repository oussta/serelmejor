import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import PublicNavbar from '../../components/layout/PublicNavbar'
import PublicFooter from '../../components/layout/PublicFooter'
import { useTheme } from '../../context/ThemeContext'

function Features() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const bg         = isDark ? '#0F172A' : '#faf8ff'
  const text       = isDark ? '#F1F5F9' : '#131b2e'
  const textSub    = isDark ? '#94A3B8' : '#434655'
  const cardBg     = isDark ? '#1E293B' : '#ffffff'
  const cardBorder = isDark ? '#334155' : '#e2e8f0'

  const modules = [
    {
      id: 'salesflow',
      icon: 'diversity_3',
      color: '#2563EB',
      bgColor: 'rgba(37,99,235,0.08)',
      tag: 'SalesFlow CRM',
      title: t('features.mod1Title'),
      desc: t('features.mod1Desc'),
      features: [
        { icon: 'view_kanban',   label: t('features.mod1f1'), desc: t('features.mod1f1d') },
        { icon: 'notifications', label: t('features.mod1f2'), desc: t('features.mod1f2d') },
        { icon: 'chat',          label: t('features.mod1f3'), desc: t('features.mod1f3d') },
        { icon: 'auto_awesome',  label: t('features.mod1f4'), desc: t('features.mod1f4d') },
        { icon: 'bar_chart',     label: t('features.mod1f5'), desc: t('features.mod1f5d') },
        { icon: 'percent',       label: t('features.mod1f6'), desc: t('features.mod1f6d') },
      ],
    },
    {
      id: 'stockflow',
      icon: 'inventory_2',
      color: '#006591',
      bgColor: 'rgba(0,101,145,0.08)',
      tag: 'StockFlow',
      title: t('features.mod2Title'),
      desc: t('features.mod2Desc'),
      features: [
        { icon: 'warehouse',      label: t('features.mod2f1'), desc: t('features.mod2f1d') },
        { icon: 'trending_down',  label: t('features.mod2f2'), desc: t('features.mod2f2d') },
        { icon: 'swap_vert',      label: t('features.mod2f3'), desc: t('features.mod2f3d') },
        { icon: 'local_shipping', label: t('features.mod2f4'), desc: t('features.mod2f4d') },
        { icon: 'psychology',     label: t('features.mod2f5'), desc: t('features.mod2f5d') },
        { icon: 'people',         label: t('features.mod2f6'), desc: t('features.mod2f6d') },
      ],
    },
    {
      id: 'bridge',
      icon: 'hub',
      color: '#006242',
      bgColor: 'rgba(0,98,66,0.08)',
      tag: 'The Bridge',
      title: t('features.mod3Title'),
      desc: t('features.mod3Desc'),
      features: [
        { icon: 'sync',         label: t('features.mod3f1'), desc: t('features.mod3f1d') },
        { icon: 'bolt',         label: t('features.mod3f2'), desc: t('features.mod3f2d') },
        { icon: 'summarize',    label: t('features.mod3f3'), desc: t('features.mod3f3d') },
        { icon: 'account_tree', label: t('features.mod3f4'), desc: t('features.mod3f4d') },
      ],
    },
  ]

  const extras = [
    { icon: 'security',      color: '#2563EB', title: t('features.extra1'), desc: t('features.extra1d') },
    { icon: 'wifi',          color: '#0EA5E9', title: t('features.extra2'), desc: t('features.extra2d') },
    { icon: 'cloud',         color: '#10B981', title: t('features.extra3'), desc: t('features.extra3d') },
    { icon: 'translate',     color: '#F59E0B', title: t('features.extra4'), desc: t('features.extra4d') },
    { icon: 'dark_mode',     color: '#8B5CF6', title: t('features.extra5'), desc: t('features.extra5d') },
    { icon: 'phone_android', color: '#EC4899', title: t('features.extra6'), desc: t('features.extra6d') },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', overflowX: 'hidden' }}>
      <Helmet>
        <title>Funcionalidades — Salesek | CRM e inventario para pymes</title>
        <meta name="description" content="SalesFlow CRM con pipeline visual, StockFlow inventario automatizado y The Bridge que los sincroniza. Todo en una sola plataforma desde 29€/mes." />
        <link rel="canonical" href="https://serelmejor.vercel.app/features" />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://serelmejor.vercel.app/features" />
        <meta property="og:title"       content="Funcionalidades Salesek — CRM + Inventario" />
        <meta property="og:description" content="Pipeline de ventas, control de stock, pedidos automáticos a proveedores y sincronización en tiempo real." />
        <meta property="og:image"       content="https://serelmejor.vercel.app/og-salesek.png" />
        <meta property="og:site_name"   content="Salesek" />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="twitter:title"      content="Funcionalidades Salesek" />
        <meta name="twitter:description" content="CRM e inventario conectados para pymes." />
        <meta name="twitter:image"      content="https://serelmejor.vercel.app/og-salesek.png" />
      </Helmet>

      <PublicNavbar />

      {/* ── HERO ── */}
      <section style={{ padding: isMobile ? '48px 20px 40px' : '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '99px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', marginBottom: '24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>star</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>{t('features.heroBadge')}</span>
          </div>
          <h1 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: '800', letterSpacing: '-0.02em', color: text, marginBottom: '16px', lineHeight: '1.15' }}>
            {t('features.heroTitle')} <span style={{ color: '#2563EB' }}>Salesek</span>
          </h1>
          <p style={{ fontSize: isMobile ? '16px' : '18px', color: textSub, lineHeight: '1.6', marginBottom: '32px' }}>
            {t('features.heroDesc')}
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{ padding: '14px 32px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}
          >
            {t('features.heroCta')}
          </button>
        </div>
      </section>

      {/* ── MODULES ── */}
      {modules.map((mod, idx) => (
        <section key={mod.id} style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: idx % 2 === 0 ? (isDark ? '#080f1c' : '#ffffff') : bg }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: isMobile ? '28px' : '48px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: mod.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '26px', color: mod.color }}>{mod.icon}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: mod.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{mod.tag}</span>
                <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: text, letterSpacing: '-0.01em', marginTop: '4px' }}>{mod.title}</h2>
              </div>
            </div>
            <p style={{ fontSize: isMobile ? '15px' : '17px', color: textSub, lineHeight: '1.7', marginBottom: isMobile ? '24px' : '48px', maxWidth: '680px' }}>{mod.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              {mod.features.map((f, fi) => (
                <div key={fi} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: isMobile ? '18px' : '24px', display: 'flex', gap: isMobile ? '14px' : '0', alignItems: isMobile ? 'flex-start' : 'stretch', flexDirection: isMobile ? 'row' : 'column' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: mod.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '0' : '16px', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: mod.color }}>{f.icon}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: text, marginBottom: '4px' }}>{f.label}</h4>
                    <p style={{ fontSize: '13px', color: textSub, lineHeight: '1.6' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── EXTRAS ── */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '56px' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '700', color: text, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              {t('features.extrasTitle')}
            </h2>
            <p style={{ fontSize: '16px', color: textSub }}>{t('features.extrasDesc')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            {extras.map((e, ei) => (
              <div key={ei} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${e.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: e.color }}>{e.icon}</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: text, marginBottom: '4px' }}>{e.title}</h4>
                  <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.5' }}>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 24px', background: '#0F172A', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#F1F5F9', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {t('features.ctaTitle')}
          </h2>
          <p style={{ fontSize: isMobile ? '15px' : '17px', color: '#64748B', marginBottom: '32px', lineHeight: '1.6' }}>
            {t('features.ctaDesc')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '14px 32px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', width: isMobile ? '100%' : 'auto' }}
            >
              {t('features.ctaButton')}
            </button>
            <button
              onClick={() => navigate('/precios')}
              style={{ padding: '14px 32px', background: 'transparent', color: '#94A3B8', border: '1px solid #334155', borderRadius: '12px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}
            >
              {t('pricing.cta')}
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default Features