import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import logo from '../../assets/logo.png'

function PublicNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [showLangPicker, setShowLangPicker] = useState(false)

  const isDark = theme === 'dark'

  // Show language picker on first visit only
  useEffect(() => {
    const chosen = localStorage.getItem('lang')
    if (!chosen) {
      setTimeout(() => setShowLangPicker(true), 800)
    }
  }, [])

  const links = [
    { path: '/',         label: t('nav.home') },
    { path: '/features', label: t('nav.features') },
    { path: '/precios',  label: t('nav.pricing') },
    { path: '/blog',     label: t('nav.blog') },
    { path: '/about',    label: t('nav.about') },
    { path: '/contact',  label: t('nav.contact') },
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
  }

  const currentLang = langs.find(l => l.code === i18n.language) || langs[0]

  return (
    <>
      {/* ── LANGUAGE PICKER MODAL ── */}
      {showLangPicker && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => { switchLang(i18n.language) }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: isDark ? '#1E293B' : 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', animation: 'pickerIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <img src={logo} alt="Salesek" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: isDark ? '#F1F5F9' : '#0F172A', textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Choose your language
            </h2>
            <p style={{ fontSize: '14px', color: isDark ? '#94A3B8' : '#64748B', textAlign: 'center', marginBottom: '28px', lineHeight: '1.6' }}>
              Elige tu idioma · Choisissez votre langue
            </p>

            {/* Language options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {langs.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => switchLang(lang.code)}
                  style={{
                    width:        '100%',
                    padding:      '16px 20px',
                    background:   i18n.language === lang.code
                      ? 'linear-gradient(135deg, #2563EB, #0EA5E9)'
                      : isDark ? '#0F172A' : '#F8FAFC',
                    border:       `2px solid ${i18n.language === lang.code ? '#2563EB' : isDark ? '#334155' : '#E2E8F0'}`,
                    borderRadius: '14px',
                    cursor:       'pointer',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '14px',
                    fontFamily:   'Plus Jakarta Sans, sans-serif',
                    textAlign:    'left',
                    transition:   'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (i18n.language !== lang.code) {
                      e.currentTarget.style.borderColor = '#2563EB'
                      e.currentTarget.style.background  = isDark ? '#1E293B' : '#EFF6FF'
                    }
                  }}
                  onMouseLeave={e => {
                    if (i18n.language !== lang.code) {
                      e.currentTarget.style.borderColor = isDark ? '#334155' : '#E2E8F0'
                      e.currentTarget.style.background  = isDark ? '#0F172A' : '#F8FAFC'
                    }
                  }}
                >
                  {/* Flag */}
                  <span style={{ fontSize: '32px', lineHeight: 1, flexShrink: 0 }}>{lang.flag}</span>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: i18n.language === lang.code ? 'white' : isDark ? '#F1F5F9' : '#0F172A', marginBottom: '2px' }}>
                      {lang.label}
                    </p>
                    <p style={{ fontSize: '12px', color: i18n.language === lang.code ? 'rgba(255,255,255,0.7)' : isDark ? '#64748B' : '#94A3B8' }}>
                      {lang.sub}
                    </p>
                  </div>

                  {/* Check or arrow */}
                  {i18n.language === lang.code ? (
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'white', flexShrink: 0 }}>check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isDark ? '#334155' : '#CBD5E1', flexShrink: 0 }}>chevron_right</span>
                  )}
                </button>
              ))}
            </div>

            {/* Skip */}
            <button
              onClick={() => switchLang(i18n.language)}
              style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'none', border: 'none', fontSize: '13px', color: isDark ? '#64748B' : '#94A3B8', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '500' }}
            >
              Continuar con español →
            </button>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
        background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
          height: '64px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
        }}>

          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', flexShrink: 0 }}>
            <img
              src={logo}
              alt="Salesek logo"
              style={{ height: '48px', width: 'auto', objectFit: 'contain', filter: isDark ? 'brightness(0.9)' : 'none' }}
            />
          </div>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: '2px', flex: 1, justifyContent: 'center' }}>
            {links.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  padding: '6px 12px', background: 'none', border: 'none',
                  fontSize: '14px', cursor: 'pointer', borderRadius: '6px',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: location.pathname === link.path ? '#2563EB' : isDark ? '#94A3B8' : '#64748B',
                  fontWeight: location.pathname === link.path ? '600' : '500',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>

            {/* Language dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                style={{
                  padding: '6px 10px', background: 'none',
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '13px', fontWeight: '600',
                  color: isDark ? '#94A3B8' : '#64748B',
                }}
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', transition: 'transform 0.2s', transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
              </button>

              {langOpen && (
                <>
                  {/* Backdrop to close */}
                  <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setLangOpen(false)} />
                  <div style={{
                    position: 'absolute', top: '46px', right: 0,
                    background: isDark ? '#1E293B' : '#ffffff',
                    border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                    borderRadius: '14px', padding: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    minWidth: '180px', zIndex: 200,
                    animation: 'dropIn 0.15s ease',
                  }}>
                    {langs.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => switchLang(lang.code)}
                        style={{
                          width: '100%', padding: '10px 12px',
                          background: i18n.language === lang.code
                            ? (isDark ? '#334155' : '#EFF6FF')
                            : 'none',
                          border: 'none', borderRadius: '8px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '10px',
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          fontSize: '14px',
                          color: isDark ? '#F1F5F9' : '#0F172A',
                          fontWeight: i18n.language === lang.code ? '700' : '400',
                          textAlign: 'left',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => {
                          if (i18n.language !== lang.code) e.currentTarget.style.background = isDark ? '#0F172A' : '#F8FAFC'
                        }}
                        onMouseLeave={e => {
                          if (i18n.language !== lang.code) e.currentTarget.style.background = 'none'
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                        <span style={{ flex: 1 }}>{lang.label}</span>
                        {i18n.language === lang.code && (
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleTheme}
              style={{
                padding: '6px',
                background: 'none',
                border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                color: isDark ? '#94A3B8' : '#64748B',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Login */}
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 14px', background: 'none',
                border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                borderRadius: '8px', fontSize: '14px', fontWeight: '500',
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                color: isDark ? '#94A3B8' : '#64748B',
              }}
            >
              {t('nav.login')}
            </button>

            {/* CTA */}
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', color: 'white',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
              }}
            >
              {t('nav.register')}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', color: isDark ? '#94A3B8' : '#64748B',
              alignItems: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: isDark ? '#0F172A' : '#FFFFFF',
            borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
            padding: '16px 24px',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <div style={{ marginBottom: '12px' }}>
              <img src={logo} alt="Salesek" style={{ height: '28px', width: 'auto' }} />
            </div>

            {links.map(link => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMenuOpen(false) }}
                style={{
                  padding: '12px', background: 'none', border: 'none',
                  fontSize: '15px', fontWeight: '500', cursor: 'pointer',
                  textAlign: 'left', borderRadius: '6px',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: isDark ? '#94A3B8' : '#0F172A',
                }}
              >
                {link.label}
              </button>
            ))}

            {/* Mobile language buttons */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: isDark ? '#64748B' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Idioma
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {langs.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => switchLang(lang.code)}
                    style={{
                      padding: '8px 14px',
                      background: i18n.language === lang.code
                        ? 'linear-gradient(135deg, #2563EB, #0EA5E9)'
                        : isDark ? '#1E293B' : '#F8FAFC',
                      border: `1px solid ${i18n.language === lang.code ? '#2563EB' : isDark ? '#334155' : '#E2E8F0'}`,
                      borderRadius: '10px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '13px', fontWeight: '600',
                      color: i18n.language === lang.code ? 'white' : isDark ? '#94A3B8' : '#374151',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {i18n.language === lang.code && (
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '8px 14px', background: isDark ? '#1E293B' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: isDark ? '#94A3B8' : '#64748B',
                  fontSize: '13px', fontWeight: '600',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
                {isDark ? 'Modo claro' : 'Modo oscuro'}
              </button>
            </div>

            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', color: 'white', marginTop: '12px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
              }}
            >
              {t('nav.register')} — 14 días gratis
            </button>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes pickerIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

export default PublicNavbar