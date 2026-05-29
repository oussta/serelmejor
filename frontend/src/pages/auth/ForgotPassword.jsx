import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ForgotPassword() {
  const { t }      = useTranslation()
  const { theme }  = useTheme()
  const navigate   = useNavigate()
  const isDark     = theme === 'dark'

  // step: 'email' | 'code' | 'password' | 'done'
  const [step,        setStep]        = useState('email')
  const [email,       setEmail]       = useState('')
  const [code,        setCode]        = useState('')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [resending,   setResending]   = useState(false)
  const [resendOk,    setResendOk]    = useState(false)

  const bg        = isDark ? '#0F172A' : '#F0F4FF'
  const cardBg    = isDark ? '#1E293B' : '#FFFFFF'
  const border    = isDark ? '#334155' : '#E2E8F0'
  const textMain  = isDark ? '#F1F5F9' : '#0F172A'
  const textSub   = isDark ? '#94A3B8' : '#64748B'
  const inputBg   = isDark ? '#0F172A' : '#F8FAFC'
  const inputText = isDark ? '#F1F5F9' : '#0F172A'

  const inputStyle = (extra = {}) => ({
    width: '100%', padding: '12px 14px',
    border: `1.5px solid ${border}`, borderRadius: '10px',
    fontSize: '15px', color: inputText, backgroundColor: inputBg,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'border-color 0.15s', ...extra,
  })

  async function handleSendCode(e) {
    e.preventDefault()
    if (!email) { setError('Introduce tu email'); return }
    setLoading(true); setError('')
    try {
      await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStep('code')
    } catch {
      setError('Error al enviar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true); setResendOk(false)
    try {
      await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setResendOk(true)
      setTimeout(() => setResendOk(false), 4000)
    } catch {}
    setResending(false)
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    if (code.length !== 6) { setError('El código debe tener 6 dígitos'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Código incorrecto')
      setStep('password')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al restablecer')
      setStep('done')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const btnStyle = (loading) => ({
    width: '100%', padding: '13px',
    background: loading ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #0EA5E9)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: '700',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '20px', position: 'relative' }}>

      <Link to="/login" style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: textSub, textDecoration: 'none', padding: '8px 14px', borderRadius: '10px', border: `1px solid ${border}`, background: cardBg }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        {t('auth.forgotBack')}
      </Link>

      <div style={{ background: cardBg, padding: '40px', borderRadius: '24px', boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(37,99,235,0.12)', width: '100%', maxWidth: '420px', border: `1px solid ${border}` }}>

        {/* ── DONE ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'white' }}>check</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: textMain, marginBottom: '8px' }}>{t('auth.resetSuccessTitle')}</h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '16px' }}>{t('auth.resetSuccessDesc')}</p>
            <Link to="/login" style={{ color: '#2563EB', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>{t('auth.resetGoNow')}</Link>
          </div>
        )}

        {/* ── STEP 1: Email ── */}
        {step === 'email' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'white' }}>lock_reset</span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: textMain, marginBottom: '4px' }}>{t('auth.forgotTitle')}</h1>
              <p style={{ fontSize: '14px', color: textSub }}>{t('auth.forgotSubtitle')}</p>
            </div>

            {error && <div style={{ background: isDark ? 'rgba(244,63,94,0.12)' : '#FFF1F2', color: '#F43F5E', padding: '12px 14px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(244,63,94,0.3)' }}>{error}</div>}

            <form onSubmit={handleSendCode}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: textSub, marginBottom: '6px', fontWeight: '600' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" style={inputStyle()} onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = border} />
              </div>
              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: loading ? 'spin 1s linear infinite' : 'none' }}>{loading ? 'refresh' : 'send'}</span>
                {loading ? t('auth.forgotSending') : t('auth.forgotSend')}
              </button>
              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: textSub }}>
                {t('auth.forgotRemember')}{' '}
                <Link to="/login" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>{t('auth.loginButton')}</Link>
              </p>
            </form>
          </>
        )}

        {/* ── STEP 2: Code ── */}
        {step === 'code' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(37,99,235,0.35)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'white' }}>mark_email_unread</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: textMain, marginBottom: '8px' }}>Revisa tu email</h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '4px' }}>Hemos enviado un código de 6 dígitos a</p>
            <p style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '28px' }}>{email}</p>

            {error && <div style={{ background: isDark ? 'rgba(244,63,94,0.12)' : '#FFF1F2', color: '#F43F5E', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(244,63,94,0.3)' }}>{error}</div>}

            <input
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
              placeholder="000000"
              maxLength={6}
              style={{
                width: '100%', padding: '16px', textAlign: 'center',
                fontSize: '32px', fontWeight: '800', letterSpacing: '12px',
                fontFamily: 'monospace',
                border: `2px solid ${error ? '#F43F5E' : code.length === 6 ? '#10B981' : border}`,
                borderRadius: '14px', background: inputBg, color: textMain,
                outline: 'none', boxSizing: 'border-box', marginBottom: '16px',
                transition: 'border-color 0.2s',
              }}
            />

            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
              style={{ ...btnStyle(loading || code.length !== 6), background: code.length === 6 && !loading ? 'linear-gradient(135deg, #10B981, #0EA5E9)' : '#94A3B8', marginBottom: '16px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: loading ? 'spin 1s linear infinite' : 'none' }}>{loading ? 'refresh' : 'check_circle'}</span>
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>

            {resendOk && <p style={{ color: '#10B981', fontSize: '13px', marginBottom: '8px', fontWeight: '600' }}>✓ Código reenviado</p>}
            <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: resending ? 0.6 : 1 }}>
              {resending ? 'Reenviando...' : '¿No recibiste el código? Reenviar →'}
            </button>
          </div>
        )}

        {/* ── STEP 3: New password ── */}
        {step === 'password' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'white' }}>lock_reset</span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: textMain, marginBottom: '4px' }}>{t('auth.resetTitle')}</h1>
              <p style={{ fontSize: '14px', color: textSub }}>{t('auth.resetSubtitle')}</p>
            </div>

            {error && <div style={{ background: isDark ? 'rgba(244,63,94,0.12)' : '#FFF1F2', color: '#F43F5E', padding: '12px 14px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(244,63,94,0.3)' }}>{error}</div>}

            <form onSubmit={handleReset}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: textSub, marginBottom: '6px', fontWeight: '600' }}>{t('auth.resetNew')}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" style={inputStyle({ paddingRight: '48px' })} onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = border} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textSub, display: 'flex', alignItems: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: textSub, marginBottom: '6px', fontWeight: '600' }}>{t('auth.resetConfirm')}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t('auth.resetConfirmPlaceholder')} style={inputStyle({ paddingRight: '48px', borderColor: confirm && confirm !== password ? '#F43F5E' : confirm && confirm === password ? '#10B981' : border })} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textSub, display: 'flex', alignItems: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showConfirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {confirm && confirm === password && (
                  <p style={{ color: '#10B981', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                    {t('auth.resetMatch')}
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: loading ? 'spin 1s linear infinite' : 'none' }}>{loading ? 'refresh' : 'lock_reset'}</span>
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