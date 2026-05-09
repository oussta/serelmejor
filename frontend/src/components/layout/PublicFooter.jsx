import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'

function PublicFooter() {
  const navigate = useNavigate()

  const cols = [
    {
      title: 'Producto',
      links: [
        { label: 'Características', path: '/features' },
        { label: 'Precios', path: '/precios' },
        { label: 'SalesFlow CRM', path: '/features' },
        { label: 'StockFlow Inventario', path: '/features' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre nosotros', path: '/about' },
        { label: 'Blog', path: '/blog' },
        { label: 'Contacto', path: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacidad', path: '/' },
        { label: 'Términos', path: '/' },
        { label: 'Aviso legal', path: '/' },
      ],
    },
  ]

  return (
    <footer style={s.footer}>
      <div style={s.inner}>

        {/* Brand */}
        <div style={s.brand}>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img
              src={logo}
              alt="Salesek logo"
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <p style={s.tagline}>
            La plataforma todo-en-uno para pequeñas empresas. CRM + Inventario en un solo lugar.
          </p>
          <div style={s.badges}>
            <span style={s.badge}>🔒 RGPD Compliant</span>
            <span style={s.badge}>🇪🇸 Hecho en España</span>
          </div>

          {/* Social links */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {[
              { icon: 'language', label: 'Web' },
              { icon: 'mail', label: 'Email' },
              { icon: 'chat', label: 'Chat' },
            ].map(item => (
              <button
                key={item.label}
                style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#1E293B', border: '1px solid #334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{item.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Columns */}
        {cols.map(col => (
          <div key={col.title} style={s.col}>
            <p style={s.colTitle}>{col.title}</p>
            {col.links.map(link => (
              <button
                key={link.label}
                style={s.colLink}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div style={s.bottom}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="Salesek" style={{ height: '24px', width: 'auto', opacity: 0.5 }} />
          <p style={s.rights}>© 2025 serElMejor. Todos los derechos reservados.</p>
        </div>
        <p style={s.sub}>Proyecto Final DAW 2024/25</p>
      </div>
    </footer>
  )
}

const s = {
  footer: {
    background: '#0F172A',
    borderTop: '1px solid #1E293B',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '64px 24px 40px',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '48px',
  },
  brand: { display: 'flex', flexDirection: 'column', gap: '16px' },
  tagline: {
    fontSize: '14px', color: '#64748B', lineHeight: '1.6', maxWidth: '260px',
  },
  badges: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  badge: {
    fontSize: '11px', background: '#1E293B', color: '#94A3B8',
    padding: '4px 10px', borderRadius: '99px', border: '1px solid #334155',
  },
  col: { display: 'flex', flexDirection: 'column', gap: '10px' },
  colTitle: {
    fontSize: '12px', fontWeight: '600', color: '#F1F5F9',
    marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  colLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '14px', color: '#64748B', textAlign: 'left',
    padding: '2px 0', fontFamily: 'Plus Jakarta Sans, sans-serif',
  },
  bottom: {
    maxWidth: '1200px', margin: '0 auto',
    padding: '24px 24px 32px',
    borderTop: '1px solid #1E293B',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '8px',
  },
  rights: { fontSize: '13px', color: '#475569' },
  sub: { fontSize: '12px', color: '#334155' },
}

export default PublicFooter