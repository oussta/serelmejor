import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ResetPassword() {
  const { t }          = useTranslation()
  const { theme }      = useTheme()
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const token          = searchParams.get('token')
  const isDark         = theme === 'dark'

  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)

  const bg        = isDark ? '#0F172A' : '#F0F4FF'
  const cardBg    = isDark ? '#1E293B' : '#FFFFFF'
  const border    = isDark ? '#334155' : '#E2E8F0'
  const textMain  = isDark ? '#F1F5F9' : '#0F172A'
  const textSub   = isDark ? '#94A3B8' : '#64748B'
  const inputBg   = isDark ? '#0F172A' : '#F8FAFC'
  const inputText = isDark ? '#F1F5F9' : '#0F172A'

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('La contraseña debe tener mínimo 8 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const res  = await fetch(`${API}/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al restablecer')
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (extra = {}) => ({
    width: '100%', padding: '12px 14px',
    border: `1.5px solid ${border}`, borderRadius: '10px',
    fontSize: '15px', color: inputText, backgroundColor: inputBg,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'border-color 0.15s',
    ...extra,
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: bg, fontFamily: 'Plus Jakarta Sans, sans-serif',
      padding: '20px', position: 'relative',
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
        {t('auth.resetBack')}
      </Link>

      <div style={{
        background: cardBg, padding: '40px', borderRadius: '24px',
        boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(37,99,235,0.12)',
        width: '100%', maxWidth: '420px', border: `1px solid ${border}`,
      }}>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #0EA5E9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'white' }}>check</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: textMain, marginBottom: '8px' }}>
              {t('auth.resetSuccessTitle')}
            </h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '16px' }}>
              {t('auth.resetSuccessDesc')}
            </p>
            <Link to="/login" style={{ color: '#2563EB', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
              {t('auth.resetGoNow')}
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
                {t('auth.resetTitle')}
              </h1>
              <p style={{ fontSize: '14px', color: textSub }}>
                {t('auth.resetSubtitle')}
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
              {/* New password */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: textSub, marginBottom: '6px', fontWeight: '600' }}>
                  {t('auth.resetNew')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inputStyle({ paddingRight: '48px' }) }}
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    onFocus={e => e.target.style.borderColor = '#2563EB'}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textSub, display: 'flex', alignItems: 'center' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: textSub, marginBottom: '6px', fontWeight: '600' }}>
                  {t('auth.resetConfirm')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inputStyle({
                      paddingRight: '48px',
                      borderColor: confirm && confirm !== password ? '#F43F5E' : confirm && confirm === password ? '#10B981' : border,
                    }) }}
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder={t('auth.resetConfirmPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textSub, display: 'flex', alignItems: 'center' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showConfirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {confirm && confirm === password && (
                  <p style={{ color: '#10B981', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                    {t('auth.resetMatch')}
                  </p>
                )}
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
                  {loading ? 'refresh' : 'lock_reset'}
                </span>
                {loading ? t('auth.resetUpdating') : t('auth.resetBtn')}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}