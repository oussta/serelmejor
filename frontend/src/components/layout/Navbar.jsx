import { useState, useEffect } from 'react'
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
  const [langOpen, setLangOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const isDark = theme === 'dark'

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

 function switchLang(code) {
  i18n.changeLanguage(code)
  localStorage.setItem('lang', code)
  setLangOpen(false)
  setMenuOpen(false)
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
  const pageBg    = isDark ? '#0F172A' : '#F8FAFC'

  // ── MOBILE bottom tab bar ──
  if (isMobile) {
    const bottomLinks = links.slice(0, 5)
    return (
      <>
        {/* Mobile top header */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: '56px',
          background: navBg, borderBottom: `1px solid ${border}`,
          position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          {/* Logo */}
          <img
            src={logo}
            alt="Salesek"
            style={{ height: '26px', width: 'auto', cursor: 'pointer', objectFit: 'contain' }}
            onClick={() => navigate('/dashboard')}
          />

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Language */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                style={{ padding: '5px 8px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: textColor, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div style={{ position: 'absolute', top: '38px', right: 0, background: navBg, border: `1px solid ${border}`, borderRadius: '12px', padding: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', minWidth: '140px', zIndex: 200 }}>
                  {langs.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => switchLang(lang.code)}
                      style={{ width: '100%', padding: '8px 12px', background: i18n.language === lang.code ? (isDark ? '#334155' : '#F1F5F9') : 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textMain, fontWeight: i18n.language === lang.code ? '600' : '400', textAlign: 'left' }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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

            {/* User avatar */}
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </nav>

        {/* User dropdown menu */}
        {menuOpen && (
          <div style={{ position: 'fixed', top: '56px', right: '16px', background: navBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 200, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: textMain }}>{user?.name}</p>
                <p style={{ fontSize: '11px', color: textColor, textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
            </div>
            <div style={{ height: '1px', background: border, marginBottom: '8px' }} />
            <button
              onClick={handleLogout}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(244,63,94,0.08)', color: '#F43F5E', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
              Cerrar sesión
            </button>
          </div>
        )}

        {/* Backdrop */}
        {(menuOpen || langOpen) && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
            onClick={() => { setMenuOpen(false); setLangOpen(false) }}
          />
        )}

        {/* ── BOTTOM TAB BAR ── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: '64px', background: navBg,
          borderTop: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          {bottomLinks.map(link => {
            const active = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '2px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: active ? '#2563EB' : textColor,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  position: 'relative',
                }}
              >
                {active && (
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '32px', height: '3px', background: '#2563EB', borderRadius: '0 0 4px 4px' }} />
                )}
                <div style={{ width: '36px', height: '28px', borderRadius: '10px', background: active ? 'rgba(37,99,235,0.1)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                    {link.icon}
                  </span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: active ? '700' : '500' }}>
                  {link.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bottom padding so content isn't hidden behind tab bar */}
        <div style={{ height: '64px' }} />
      </>
    )
  }

  // ── DESKTOP ──
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
        {/* Logo */}
        <img
          src={logo}
          alt="Salesek"
          style={{ height: '28px', width: 'auto', cursor: 'pointer', objectFit: 'contain' }}
          onClick={() => navigate('/dashboard')}
        />

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '2px' }}>
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

        {/* Right actions */}
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
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setLangOpen(false)} />
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
              </>
            )}
          </div>

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

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '10px', border: `1px solid ${border}` }}>
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
        </div>
      </nav>
    </>
  )
}

export default Navbar