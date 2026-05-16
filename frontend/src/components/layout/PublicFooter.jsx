import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'

const LANGS = [
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
]

function PublicFooter() {
  const navigate   = useNavigate()
  const { t, i18n } = useTranslation()
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  function switchLang(code) {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
  }

  const cols = [
    {
      title: t('footer.product') || 'Producto',
      links: [
        { label: t('footer.features')   || 'Funcionalidades', path: '/features' },
        { label: t('footer.pricing')    || 'Precios',         path: '/precios' },
        { label: t('footer.howItWorks') || 'Cómo funciona',   path: '/como-funciona' },
        { label: 'SalesFlow CRM',                             path: '/features' },
        { label: 'StockFlow',                                 path: '/features' },
      ],
    },
    {
      title: t('footer.company') || 'Empresa',
      links: [
        { label: t('footer.about')   || 'Sobre nosotros', path: '/about' },
        { label: t('footer.blog')    || 'Blog',           path: '/blog' },
        { label: t('footer.contact') || 'Contacto',       path: '/contact' },
      ],
    },
    {
      title: t('footer.access') || 'Acceso',
      links: [
        { label: t('footer.login')    || 'Iniciar sesión',   path: '/login' },
        { label: t('footer.register') || 'Crear cuenta',     path: '/register' },
        { label: t('footer.supplier') || 'Portal proveedor', path: '/supplier' },
      ],
    },
  ]

  return (
    <footer style={{ background: '#080D1A', borderTop: '1px solid #1E293B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* ── Main ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '48px 20px 40px' : '72px 24px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? '40px' : '48px' }}>

          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Logo — clicks back to home */}
            <div
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '18px', letterSpacing: '-1px' }}>S</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#F1F5F9', letterSpacing: '-0.5px' }}>Salesek</span>
            </div>

            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.75', maxWidth: '260px' }}>
              {t('footer.tagline') || 'La plataforma todo-en-uno para pequeñas empresas. CRM + Inventario conectados en un solo lugar.'}
            </p>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                t('footer.badge1') || '🔒 RGPD',
                t('footer.badge2') || '🇪🇸 España',
                '⭐ 4.9/5',
              ].map(badge => (
                <span key={badge} style={{ fontSize: '11px', background: '#1E293B', color: '#94A3B8', padding: '4px 10px', borderRadius: '99px', border: '1px solid #2D3748', fontWeight: '600' }}>
                  {badge}
                </span>
              ))}
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: 'mail',        text: 'hola@salesek.com',      href: 'mailto:hola@salesek.com' },
                { icon: 'language',    text: 'serelmejor.vercel.app',  href: 'https://serelmejor.vercel.app' },
                { icon: 'location_on', text: 'España',                  href: null },
              ].map(item => (
                <div
                  key={item.text}
                  onClick={() => item.href && window.open(item.href, '_blank')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: item.href ? 'pointer' : 'default' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2563EB' }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: '#64748B', transition: 'color 0.15s' }}
                    onMouseEnter={e => { if (item.href) e.currentTarget.style.color = '#94A3B8' }}
                    onMouseLeave={e => { if (item.href) e.currentTarget.style.color = '#64748B' }}
                  >{item.text}</span>
                </div>
              ))}
            </div>

            {/* Language switcher */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                {t('footer.language') || 'Idioma'}
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {LANGS.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => switchLang(lang.code)}
                    style={{ padding: '5px 12px', borderRadius: '99px', border: `1px solid ${i18n.language === lang.code ? '#2563EB' : '#2D3748'}`, background: i18n.language === lang.code ? '#2563EB' : 'transparent', color: i18n.language === lang.code ? 'white' : '#64748B', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s' }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                {col.title}
              </p>
              {col.links.map(link => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#64748B', textAlign: 'left', padding: '0', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'color 0.15s', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                >
                  {link.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ── CTA banner ── */}
        <div style={{ marginTop: isMobile ? '40px' : '64px', padding: isMobile ? '24px 20px' : '32px 40px', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)', borderRadius: '20px', border: '1px solid #1E3A5F', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>
              🚀 {t('footer.ctaTitle') || 'Empieza gratis hoy mismo'}
            </p>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
              {t('footer.ctaDesc') || '14 días gratis. Sin tarjeta. Sin permanencia. Desde 29€/mes después.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto' }}
            >
              {t('footer.ctaButton') || 'Crear cuenta gratis'}
            </button>
            <button
              onClick={() => navigate('/precios')}
              style={{ padding: '11px 24px', background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid #334155', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto' }}
            >
              {t('footer.ctaSecondary') || 'Ver precios'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid #1A2332', padding: isMobile ? '20px' : '20px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px' }}>

          {/* Left — logo + copyright */}
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '12px' }}>S</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569' }}>
              © 2026 Salesek. {t('footer.rights') || 'Todos los derechos reservados.'}
            </p>
          </div>

          {/* Right — legal links + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: t('footer.privacy') || 'Privacidad', path: '/contact' },
              { label: t('footer.terms')   || 'Términos',   path: '/contact' },
              { label: t('footer.cookies') || 'Cookies',    path: '/contact' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#475569', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: 0, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#64748B'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                {item.label}
              </button>
            ))}
            <span style={{ fontSize: '11px', color: '#334155', padding: '3px 10px', background: '#1E293B', borderRadius: '99px', border: '1px solid #2D3748', fontWeight: '600' }}>
              DAW 2025/26
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter