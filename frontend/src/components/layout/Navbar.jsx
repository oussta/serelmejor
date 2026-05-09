import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import logo from '../../assets/logo.png'
import NotifBell from '../shared/NotifBell'

function Navbar() {
  const { user, clearAuth } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { i18n }  = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [langOpen,   setLangOpen]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)

  const isDark = theme === 'dark'

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function switchLang(code) {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setLangOpen(false)
  }

  const langs = [
    { code: 'es', flag: '🇪🇸', label: 'Español' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
  ]

  const currentLang = langs.find(l => l.code === i18n.language) || langs[0]

  const links = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  ...(user?.role !== 'supplier' ? [
    { path: '/leads',    label: 'CRM',        icon: 'contacts' },
    { path: '/products', label: 'Inventario', icon: 'inventory_2' },
    { path: '/orders',   label: 'Pedidos',    icon: 'local_shipping' },
  ] : []),
  ...(user?.role === 'supplier' ? [
    { path: '/supplier', label: 'Mis Pedidos', icon: 'local_shipping' },
  ] : []),
  ...(user?.role === 'owner' || user?.role === 'admin' ? [
    { path: '/admin', label: 'Admin', icon: 'admin_panel_settings' },
    { path: '/team',  label: 'Equipo', icon: 'group' },
  ] : []),
]

  const navBg     = isDark ? '#1E293B' : 'white'
  const border    = isDark ? '#334155' : '#E2E8F0'
  const textColor = isDark ? '#94A3B8' : '#64748B'
  const textMain  = isDark ? '#F1F5F9' : '#0F172A'

  return (
    <>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: '60px',
        background: navBg, borderBottom: `1px solid ${border}`,
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>

        {/* ── Logo ── */}
        <img
          src={logo}
          alt="Salesek"
          style={{ height: '28px', width: 'auto', cursor: 'pointer', objectFit: 'contain' }}
          onClick={() => navigate('/dashboard')}
        />

        {/* ── Desktop links ── */}
        <div style={{ display: 'flex', gap: '2px', '@media (max-width: 768px)': { display: 'none' } }} className="desktop-links">
          {links.map(link => {
            const active = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px',
                  background: active ? 'rgba(37,99,235,0.08)' : 'none',
                  border: 'none', borderRadius: '8px',
                  fontSize: '13px', fontWeight: active ? '600' : '500',
                  color: active ? '#2563EB' : textColor,
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>{link.icon}</span>
                {link.label}
              </button>
            )
          })}
        </div>

        {/* ── Right actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

          {/* Language */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setLangOpen(!langOpen); setMenuOpen(false) }}
              style={{ padding: '5px 8px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: textColor, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.code.toUpperCase()}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>expand_more</span>
            </button>

            {langOpen && (
              <div style={{ position: 'absolute', top: '38px', right: 0, background: navBg, border: `1px solid ${border}`, borderRadius: '12px', padding: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: '140px', zIndex: 200 }}>
                {langs.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => switchLang(lang.code)}
                    style={{ width: '100%', padding: '8px 12px', background: i18n.language === lang.code ? (isDark ? '#334155' : '#F1F5F9') : 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textMain, fontWeight: i18n.language === lang.code ? '600' : '400', textAlign: 'left' }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {i18n.language === lang.code && (
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#2563EB', marginLeft: 'auto' }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
            {/* Notification bell */}
            <NotifBell />
          {/* Dark mode */}
          <button
            onClick={toggleTheme}
            style={{ width: '32px', height: '32px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textColor }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User — desktop only */}
          <div className="desktop-user" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '10px', border: `1px solid ${border}` }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: textMain, lineHeight: 1 }}>{user?.name}</p>
              <p style={{ fontSize: '10px', color: textColor, textTransform: 'capitalize', lineHeight: 1, marginTop: '2px' }}>{user?.role}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{ width: '32px', height: '32px', background: 'rgba(244,63,94,0.08)', color: '#F43F5E', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>logout</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => { setMenuOpen(!menuOpen); setLangOpen(false) }}
            className="mobile-menu-btn"
            style={{ width: '32px', height: '32px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center', color: textColor }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div style={{ background: navBg, borderBottom: `1px solid ${border}`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: '60px', zIndex: 49 }}>
          {links.map(link => {
            const active = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMenuOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: active ? 'rgba(37,99,235,0.08)' : 'none', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: active ? '600' : '500', color: active ? '#2563EB' : textMain, cursor: 'pointer', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{link.icon}</span>
                {link.label}
              </button>
            )
          })}
          <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{user?.name}</p>
              <p style={{ fontSize: '12px', color: textColor, textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .desktop-user  { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}

export default Navbar