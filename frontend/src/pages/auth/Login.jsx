import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { login } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import logo from '../../assets/logo.png'

function Login() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [serverError, setServerError] = useState('')

  const { saveAuth } = useAuth()
  const navigate     = useNavigate()

  const bg        = isDark ? '#0F172A' : '#F8FAFC'
  const cardBg    = isDark ? '#1E293B' : '#FFFFFF'
  const border    = isDark ? '#334155' : '#E2E8F0'
  const textMain  = isDark ? '#F1F5F9' : '#0F172A'
  const textSub   = isDark ? '#94A3B8' : '#64748B'
  const inputBg   = isDark ? '#0F172A' : '#F8FAFC'
  const inputText = isDark ? '#F1F5F9' : '#0F172A'

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
    padding: '11px 14px',
    border: `1.5px solid ${errors[fieldName] ? '#F43F5E' : border}`,
    borderRadius: '10px',
    fontSize: '15px',
    color: inputText,
    background: inputBg,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'border-color 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '20px' }}>
      <div style={{ background: cardBg, padding: '40px', borderRadius: '20px', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(15,23,42,0.10)', width: '100%', maxWidth: '420px', border: `1px solid ${border}` }}>

        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={logo} alt="Salesek" style={{ height: '44px', width: 'auto', objectFit: 'contain', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '16px', color: textSub, fontWeight: '500' }}>
            {t('auth.loginTitle') || 'Iniciar sesión'}
          </h2>
        </div>

        {serverError && (
          <div style={{ background: isDark ? 'rgba(244,63,94,0.15)' : '#FFF1F2', color: '#F43F5E', padding: '12px 14px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="tu@email.com"
              autoComplete="email"
            />
            {errors.email && (
              <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: textSub, marginBottom: '6px', fontWeight: '600' }}>
              {t('auth.password') || 'Contraseña'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle('password'), paddingRight: '44px' }}
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
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: textSub }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(37,99,235,0.35)', opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.15s' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {loading ? 'hourglass_empty' : 'login'}
            </span>
            {loading ? (t('auth.loading') || 'Cargando...') : (t('auth.loginButton') || 'Entrar')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: textSub }}>
          {t('auth.noAccount') || '¿No tienes cuenta?'}{' '}
          <Link to="/register" style={{ color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>
            {t('auth.register') || 'Regístrate'}
          </Link>
        </p>

        {/* Demo hint */}
        <div style={{ marginTop: '20px', padding: '12px', background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF', borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE'}` }}>
          <p style={{ fontSize: '12px', color: isDark ? '#93C5FD' : '#2563EB', textAlign: 'center', fontWeight: '500' }}>
            Demo: admin@salesek.com / password
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

export default Login