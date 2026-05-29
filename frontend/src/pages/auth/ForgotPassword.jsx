import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ForgotPassword() {
  const { t }     = useTranslation()
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const bg       = isDark ? '#0F172A' : '#F0F4FF'
  const cardBg   = isDark ? '#1E293B' : '#FFFFFF'
  const border   = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'
  const inputText = isDark ? '#F1F5F9' : '#0F172A'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Introduce tu email'); return }
    setLoading(true)
    setError('')
    try {
      await fetch(`${API}/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Error al enviar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: bg,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      padding: '20px',
      position: 'relative',
    }}>

      {/* Back link */}
      <Link to="/login" style={{
        position: 'absolute', top: '24px', left: '24px',
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', fontWeight: '600', color: textSub,
        textDecoration: 'none', padding: '8px 14px',
        borderRadius: '10px', border: `1px solid ${border}`,
        background: cardBg,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        {t('auth.forgotBack')}
      </Link>

      <div style={{
        background: cardBg, padding: '40px', borderRadius: '24px',
        boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(37,99,235,0.12)',
        width: '100%', maxWidth: '420px', border: `1px solid ${border}`,
      }}>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #0EA5E9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'white' }}>mark_email_read</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: textMain, marginBottom: '8px' }}>
              {t('auth.forgotSentTitle')}
            </h2>
            <p style={{ fontSize: '14px', color: textSub, lineHeight: 1.6, marginBottom: '12px' }}>
              {t('auth.forgotSentDesc')}
            </p>
            <p style={{ fontSize: '13px', color: textSub, marginBottom: '20px' }}>
              {t('auth.forgotSpam')}
            </p>
            <Link to="/login" style={{ color: '#2563EB', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
              {t('auth.forgotBack')}
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px', boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'white' }}>lock_reset</span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: textMain, marginBottom: '4px' }}>
                {t('auth.forgotTitle')}
              </h1>
              <p style={{ fontSize: '14px', color: textSub }}>
                {t('auth.forgotSubtitle')}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: isDark ? 'rgba(244,63,94,0.12)' : '#FFF1F2',
                color: '#F43F5E', padding: '12px 14px', borderRadius: '10px',
                marginBottom: '20px', fontSize: '14px',
                border: '1px solid rgba(244,63,94,0.3)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: textSub, marginBottom: '6px', fontWeight: '600' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: `1.5px solid ${border}`, borderRadius: '10px',
                    fontSize: '15px', color: inputText, backgroundColor: inputBg,
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.15s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                  {loading ? 'refresh' : 'send'}
                </span>
                {loading ? t('auth.forgotSending') : t('auth.forgotSend')}
              </button>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: textSub }}>
                {t('auth.forgotRemember')}{' '}
                <Link to="/login" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>
                  {t('auth.loginButton')}
                </Link>
              </p>
            </form>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}