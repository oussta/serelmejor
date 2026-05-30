import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { login } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

function Login() {
  const { t }      = useTranslation()
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'
  const { saveAuth } = useAuth()
  const navigate     = useNavigate()

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [serverError, setServerError] = useState('')

  const bg       = isDark ? '#0F172A' : '#F0F4FF'
  const cardBg   = isDark ? '#1E293B' : '#FFFFFF'
  const border   = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'
  const inputText = isDark ? '#F1F5F9' : '#0F172A'
  const inputBorder = isDark ? '#334155' : '#CBD5E1'

  function validateField(name, value) {
    if (name === 'email') {
      if (!value) return t('auth.emailRequired') || 'El email es obligatorio'
      if (!/\S+@\S+\.\S+/.test(value)) return t('auth.emailInvalid') || 'Email no válido'
    }
    if (name === 'password') {
      if (!value) return t('auth.passwordRequired') || 'La contraseña es obligatoria'
      if (value.length < 8) return t('auth.passwordMin') || 'Mínimo 8 caracteres'
    }
    return ''
  }

  function handleBlur(e) {
    const { name, value } = e.target
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const emailError    = validateField('email', email)
    const passwordError = validateField('password', password)
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError })
      return
    }
    try {
      setLoading(true)
      const data = await login(email, password)
      saveAuth(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 14px',
    border: `1.5px solid ${errors[fieldName] ? '#F43F5E' : inputBorder}`,
    borderRadius: '10px',
    fontSize: '15px',
    color: inputText,
    backgroundColor: inputBg,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'border-color 0.15s',
    WebkitTextFillColor: inputText,
    caretColor: inputText,
  })

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

      {/* Back to site */}
      <a
        href="/"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: '600',
          color: textSub,
          textDecoration: 'none',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          padding: '8px 14px',
          borderRadius: '10px',
          border: `1px solid ${border}`,
          background: cardBg,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.borderColor = '#2563EB' }}
        onMouseLeave={e => { e.currentTarget.style.color = textSub; e.currentTarget.style.borderColor = border }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        Volver al sitio
      </a>

      {/* Card */}
      <div style={{
        background: cardBg,
        padding: '40px',
        borderRadius: '24px',
        boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(37,99,235,0.12)',
        width: '100%',
        maxWidth: '420px',
        border: `1px solid ${border}`,
      }}>

        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Logo circle */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
          }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '24px', letterSpacing: '-1px' }}>S</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: textMain, letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Salesek
          </h1>
          <p style={{ fontSize: '14px', color: textSub, fontWeight: '400' }}>
            {t('auth.loginTitle') || 'Inicia sesión en tu cuenta'}
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div style={{
            background: isDark ? 'rgba(244,63,94,0.12)' : '#FFF1F2',
            color: '#F43F5E',
            padding: '12px 14px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid rgba(244,63,94,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>error</span>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">

          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: textSub, marginBottom: '6px', fontWeight: '600' }}>
              Email
            </label>
            <input
              style={inputStyle('email')}
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={handleBlur}
              placeholder="admin@salesek.com"
              autoComplete="email"
            />
            {errors.email && (
              <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: textSub, marginBottom: '6px', fontWeight: '600' }}>
              {t('auth.password') || 'Contraseña'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle('password'), paddingRight: '48px' }}
                type={showPass ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', color: textSub, padding: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '8px' }}>
            <Link
              to="/forgot-password"
              style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}
            >
              {t('auth.forgotPassword') || '¿Olvidaste tu contraseña?'}
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #0EA5E9)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: loading ? 'spin 1s linear infinite' : 'none' }}>
              {loading ? 'refresh' : 'login'}
            </span>
            {loading ? (t('auth.loading') || 'Cargando...') : (t('auth.loginButton') || 'Entrar')}
          </button>
        </form>

        {/* Register link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: textSub }}>
          {t('auth.noAccount') || '¿No tienes cuenta?'}{' '}
          <Link to="/register" style={{ color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>
            {t('auth.register') || 'Regístrate'}
          </Link>
        </p>

       {/* Demo hint */}
<div style={{
  marginTop: '20px',
  padding: '14px 16px',
  background: isDark ? 'rgba(37,99,235,0.08)' : '#EFF6FF',
  borderRadius: '12px',
  border: `1px solid ${isDark ? 'rgba(37,99,235,0.2)' : '#BFDBFE'}`,
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2563EB' }}>info</span>
    <span style={{ fontSize: '12px', fontWeight: '700', color: isDark ? '#93C5FD' : '#2563EB' }}>
      Cuentas demo — password: password
    </span>
  </div>
  {[
    { role: 'Admin',    em: 'admin@salesek.com' },
    { role: 'Owner',    em: 'owner@salesek.com' },
    { role: 'Employee', em: 'employee@salesek.com' },
    { role: 'Supplier', em: 'supplier@salesek.com' },
  ].map(({ role, em }) => (
    <div key={em} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: `1px solid ${isDark ? 'rgba(37,99,235,0.1)' : '#BFDBFE'}` }}>
      <span style={{ fontSize: '11px', fontWeight: '600', color: isDark ? '#93C5FD' : '#1D4ED8' }}>{role}</span>
      <button
        type="button"
        onClick={() => { setEmail(em); setPassword('password') }}
        style={{ fontSize: '11px', color: isDark ? '#93C5FD' : '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', textDecoration: 'underline' }}
      >
        {em}
      </button>
    </div>
  ))}
</div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) }
          to   { transform: rotate(360deg) }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px ${inputBg} inset !important;
          -webkit-text-fill-color: ${inputText} !important;
          caret-color: ${inputText} !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  )
}

export default Login