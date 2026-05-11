import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import logo from '../../assets/logo.png'

function PublicFooter() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const cols = [
    {
      title: 'Producto',
      links: [
        { label: 'Funcionalidades', path: '/features' },
        { label: 'Precios',         path: '/precios' },
        { label: 'SalesFlow CRM',   path: '/features' },
        { label: 'StockFlow',       path: '/features' },
        { label: 'The Bridge',      path: '/features' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre nosotros', path: '/about' },
        { label: 'Blog',           path: '/blog' },
        { label: 'Contacto',       path: '/contact' },
      ],
    },
    {
      title: 'Acceso',
      links: [
        { label: 'Iniciar sesión',  path: '/login' },
        { label: 'Crear cuenta',    path: '/register' },
        { label: 'Portal proveedor',path: '/supplier' },
      ],
    },
  ]

  const border  = '#1E293B'
  const textSub = '#64748B'
  const textMut = '#475569'

  return (
    <footer style={{ background: '#0A0F1E', borderTop: '1px solid #1E293B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* ── Main content ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '48px 20px 40px' : '72px 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? '40px' : '56px' }}>

          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <img src={logo} alt="Salesek" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.7', maxWidth: '260px' }}>
              La plataforma todo-en-uno para pequeñas empresas españolas. CRM + Inventario conectados en un solo lugar.
            </p>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['🔒 RGPD Compliant', '🇪🇸 Hecho en España', '⭐ 4.9/5'].map(badge => (
                <span key={badge} style={{ fontSize: '11px', background: '#1E293B', color: '#94A3B8', padding: '4px 10px', borderRadius: '99px', border: '1px solid #334155' }}>
                  {badge}
                </span>
              ))}
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: 'mail',     text: 'hola@salesek.com' },
                { icon: 'language', text: 'salesek.onrender.com' },
                { icon: 'location_on', text: 'España' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2563EB' }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: textSub }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                {col.title}
              </p>
              {col.links.map(link => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: textSub, textAlign: 'left', padding: '0', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'color 0.15s', lineHeight: '1.4' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
                  onMouseLeave={e => e.currentTarget.style.color = textSub}
                >
                  {link.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ── Pricing teaser ── */}
        <div style={{ marginTop: isMobile ? '40px' : '56px', padding: isMobile ? '20px' : '28px 32px', background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', borderRadius: '20px', border: '1px solid #1E3A5F', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>
              🚀 Empieza gratis hoy mismo
            </p>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
              14 días gratis. Sin tarjeta. Sin permanencia. Desde 29€/mes después.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', whiteSpace: 'nowrap' }}
            >
              Crear cuenta gratis
            </button>
            <button
              onClick={() => navigate('/precios')}
              style={{ padding: '10px 22px', background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid #334155', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', whiteSpace: 'nowrap' }}
            >
              Ver precios
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid #1E293B', padding: isMobile ? '20px' : '20px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <img src={logo} alt="Salesek" style={{ height: '20px', width: 'auto', opacity: 0.4 }} />
            <p style={{ fontSize: '13px', color: textMut }}>© 2026 Salesek. Todos los derechos reservados.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Privacidad', path: '/' },
              { label: 'Términos',   path: '/' },
              { label: 'Cookies',    path: '/' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: textMut, fontFamily: 'Plus Jakarta Sans, sans-serif', padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#64748B'}
                onMouseLeave={e => e.currentTarget.style.color = textMut}
              >
                {item.label}
              </button>
            ))}
            <span style={{ fontSize: '12px', color: '#334155', padding: '3px 10px', background: '#1E293B', borderRadius: '99px', border: '1px solid #334155' }}>
              Proyecto Final DAW 2025/26
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter