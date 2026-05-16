import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import logo from '../../assets/logo.png'

function PublicNavbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen]             = useState(false)
  const [langOpen, setLangOpen]             = useState(false)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [scrolled, setScrolled]             = useState(false)
  const [isMobile, setIsMobile]             = useState(window.innerWidth <= 960)

  const isDark = theme === 'dark'

  useEffect(() => {
    const chosen = localStorage.getItem('lang')
    if (!chosen) setTimeout(() => setShowLangPicker(true), 800)
    const onScroll  = () => setScrolled(window.scrollY > 20)
    const onResize  = () => { setIsMobile(window.innerWidth <= 960); if (window.innerWidth > 960) setMenuOpen(false) }
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [])

  const links = [
    { path: '/',              label: t('nav.home')      || 'Inicio' },
    { path: '/features',      label: t('nav.features')  || 'Funcionalidades' },
    { path: '/como-funciona', label: t('nav.howItWorks')|| 'Cómo funciona' },
    { path: '/precios',       label: t('nav.pricing')   || 'Precios' },
    { path: '/blog',          label: t('nav.blog')      || 'Blog' },
    { path: '/contact',       label: t('nav.contact')   || 'Contacto' },
  ]

  const langs = [
    { code: 'es', label: 'Español',  flag: '🇪🇸', sub: 'Idioma principal' },
    { code: 'en', label: 'English',  flag: '🇬🇧', sub: 'Continue in English' },
    { code: 'fr', label: 'Français', flag: '🇫🇷', sub: 'Continuer en français' },
  ]

  function switchLang(code) {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setLangOpen(false)
    setShowLangPicker(false)
    setMenuOpen(false)
  }

  const currentLang = langs.find(l => l.code === i18n.language) || langs[0]
  const navBg  = isDark ? 'rgba(15,23,42,0.98)' : 'rgba(255,255,255,0.98)'
  const border = isDark ? '#1E293B' : '#E2E8F0'
  const textC  = isDark ? '#94A3B8' : '#64748B'
  const textM  = isDark ? '#F1F5F9' : '#0F172A'

  return (
    <>
      {/* Language picker modal */}
      {showLangPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => switchLang(i18n.language)}>
          <div onClick={e => e.stopPropagation()} style={{ background: isDark ? '#1E293B' : 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.35)', animation: 'pickerIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '24px' }}>S</span>
              </div>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: textM, textAlign: 'center', marginBottom: '6px' }}>Choose your language</h2>
            <p style={{ fontSize: '14px', color: textC, textAlign: 'center', marginBottom: '24px' }}>Elige tu idioma · Choisissez votre langue</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {langs.map(lang => (
                <button key={lang.code} onClick={() => switchLang(lang.code)} style={{ width: '100%', padding: '16px 20px', background: i18n.language === lang.code ? 'linear-gradient(135deg, #2563EB, #0EA5E9)' : isDark ? '#0F172A' : '#F8FAFC', border: `2px solid ${i18n.language === lang.code ? '#2563EB' : isDark ? '#334155' : '#E2E8F0'}`, borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'left', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '32px' }}>{lang.flag}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: i18n.language === lang.code ? 'white' : textM }}>{lang.label}</p>
                    <p style={{ fontSize: '12px', color: i18n.language === lang.code ? 'rgba(255,255,255,0.7)' : textC }}>{lang.sub}</p>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: i18n.language === lang.code ? 'white' : textC }}>{i18n.language === lang.code ? 'check_circle' : 'chevron_right'}</span>
                </button>
              ))}
            </div>
            <button onClick={() => switchLang(i18n.language)} style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'none', border: 'none', fontSize: '13px', color: textC, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Continuar con {currentLang.label} →
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)', background: navBg, borderBottom: `1px solid ${scrolled ? border : 'transparent'}`, boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.3s ease', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="Salesek" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </div>

          {/* Desktop links */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: '2px', flex: 1, justifyContent: 'center', flexWrap: 'nowrap' }}>
              {links.map(link => {
                const active = location.pathname === link.path
                return (
                  <button key={link.path} onClick={() => navigate(link.path)} style={{ padding: '6px 11px', background: active ? (isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.08)') : 'none', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', color: active ? '#2563EB' : textC, fontWeight: active ? '700' : '500', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none' }}
                  >
                    {link.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

            {/* Language dropdown — desktop */}
            {!isMobile && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setLangOpen(!langOpen); setMenuOpen(false) }} style={{ padding: '6px 10px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: textC, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.code.toUpperCase()}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', transition: 'transform 0.2s', transform: langOpen ? 'rotate(180deg)' : 'rotate(0)' }}>expand_more</span>
                </button>
                {langOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setLangOpen(false)} />
                    <div style={{ position: 'absolute', top: '44px', right: 0, background: isDark ? '#1E293B' : 'white', border: `1px solid ${border}`, borderRadius: '14px', padding: '8px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', minWidth: '180px', zIndex: 200, animation: 'dropIn 0.15s ease' }}>
                      {langs.map(lang => (
                        <button key={lang.code} onClick={() => switchLang(lang.code)} style={{ width: '100%', padding: '10px 12px', background: i18n.language === lang.code ? (isDark ? '#334155' : '#EFF6FF') : 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', color: textM, fontWeight: i18n.language === lang.code ? '700' : '400', textAlign: 'left' }}>
                          <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                          <span style={{ flex: 1 }}>{lang.label}</span>
                          {i18n.language === lang.code && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>check</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Dark mode */}
            <button onClick={toggleTheme} style={{ width: '34px', height: '34px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textC, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? '#1E293B' : '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>

            {/* Login + CTA — desktop */}
            {!isMobile && (
              <>
                <button onClick={() => navigate('/login')} style={{ padding: '7px 14px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textC, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? '#1E293B' : '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {t('nav.login') || 'Entrar'}
                </button>
                <button onClick={() => navigate('/register')} style={{ padding: '7px 16px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {t('nav.register') || 'Registrarse'}
                </button>
              </>
            )}

            {/* Hamburger — mobile */}
            {isMobile && (
              <button onClick={() => { setMenuOpen(!menuOpen); setLangOpen(false) }} style={{ width: '40px', height: '40px', background: menuOpen ? (isDark ? '#1E293B' : '#F1F5F9') : 'none', border: `1px solid ${border}`, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textM, transition: 'all 0.2s' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{menuOpen ? 'close' : 'menu'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMobile && menuOpen && (
          <div style={{ background: isDark ? '#0F172A' : 'white', borderTop: `1px solid ${border}`, padding: '16px 20px 24px', animation: 'slideDown 0.2s ease', maxHeight: '85vh', overflowY: 'auto' }}>

            {/* Nav links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '20px' }}>
              {links.map(link => {
                const active = location.pathname === link.path
                return (
                  <button key={link.path} onClick={() => { navigate(link.path); setMenuOpen(false) }} style={{ padding: '12px 14px', background: active ? (isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.06)') : 'none', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: active ? '700' : '500', cursor: 'pointer', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, sans-serif', color: active ? '#2563EB' : textM, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {link.label}
                    {active && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>arrow_forward</span>}
                  </button>
                )
              })}
            </div>

            <div style={{ height: '1px', background: border, marginBottom: '16px' }} />

            {/* Language */}
            <p style={{ fontSize: '11px', fontWeight: '700', color: textC, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
              {t('footer.language') || 'Idioma'}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {langs.map(lang => (
                <button key={lang.code} onClick={() => switchLang(lang.code)} style={{ flex: 1, padding: '10px 8px', background: i18n.language === lang.code ? 'linear-gradient(135deg, #2563EB, #0EA5E9)' : isDark ? '#1E293B' : '#F8FAFC', border: `1px solid ${i18n.language === lang.code ? '#2563EB' : border}`, borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: i18n.language === lang.code ? 'white' : textC }}>{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>

            {/* Dark mode */}
            <button onClick={toggleTheme} style={{ width: '100%', padding: '12px 14px', background: isDark ? '#1E293B' : '#F8FAFC', border: `1px solid ${border}`, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: textM, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isDark ? '#F59E0B' : '#64748B' }}>{isDark ? 'light_mode' : 'dark_mode'}</span>
              {isDark ? (t('nav.lightMode') || 'Modo claro') : (t('nav.darkMode') || 'Modo oscuro')}
            </button>

            {/* CTA */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { navigate('/login'); setMenuOpen(false) }} style={{ flex: 1, padding: '12px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: textC, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {t('nav.login') || 'Entrar'}
              </button>
              <button onClick={() => { navigate('/register'); setMenuOpen(false) }} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
                {t('nav.register') || 'Registrarse'} 🚀
              </button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes pickerIn  { from{opacity:0;transform:scale(0.92) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes dropIn    { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  )
}

export default PublicNavbar