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
  const navigate    = useNavigate()
  const { t, i18n } = useTranslation()
  const { theme }   = useTheme()
  const isDark      = theme === 'dark'
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
        { label: t('footer.howItWorks') || 'Cómo funciona',   path: '/como-funciona' },
        { label: t('footer.pricing')    || 'Precios',         path: '/precios' },
        { label: 'Blog',                                       path: '/blog' },
      ],
    },
    {
      title: t('footer.access') || 'Acceso',
      links: [
        { label: t('footer.login')    || 'Iniciar sesión', path: '/login' },
        { label: t('footer.register') || 'Crear cuenta',   path: '/register' },
        { label: t('footer.contact')  || 'Contacto',       path: '/contact' },
      ],
    },
  ]

  const border  = '#1E293B'
  const textSub = '#64748B'
  const textMut = '#475569'

  return (
    <footer style={{ background: '#080D1A', borderTop: `1px solid ${border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* Main */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '48px 20px 36px' : '64px 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: isMobile ? '40px' : '56px' }}>

          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Logo */}
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer', width: 'fit-content' }}>
    <img src="/logo.png" alt="Salesek" style={{ height: '40px', objectFit: 'contain' }} />
    </div>

            <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.75', maxWidth: '260px' }}>
              {t('footer.tagline') || 'CRM + Inventario conectados en una sola plataforma para pequeñas empresas.'}
            </p>

            {/* Language switcher */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: textMut, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                {t('footer.language') || 'Idioma'}
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {LANGS.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => switchLang(lang.code)}
                    style={{ padding: '5px 12px', borderRadius: '99px', border: `1px solid ${i18n.language === lang.code ? '#2563EB' : '#2D3748'}`, background: i18n.language === lang.code ? '#2563EB' : 'transparent', color: i18n.language === lang.code ? 'white' : textSub, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s' }}
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
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: textSub, textAlign: 'left', padding: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'color 0.15s', lineHeight: '1.4' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
                  onMouseLeave={e => e.currentTarget.style.color = textSub}
                >
                  {link.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: `1px solid ${border}`, padding: isMobile ? '16px 20px' : '18px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px' }}>

          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '11px' }}>S</span>
            </div>
            <p style={{ fontSize: '13px', color: textMut }}>
              © 2026 Salesek. {t('footer.rights') || 'Todos los derechos reservados.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: t('footer.privacy') || 'Privacidad', path: '/contact' },
              { label: t('footer.terms')   || 'Términos',   path: '/contact' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: textMut, fontFamily: 'Plus Jakarta Sans, sans-serif', padding: 0, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#64748B'}
                onMouseLeave={e => e.currentTarget.style.color = textMut}
              >
                {item.label}
              </button>
            ))}
            
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter