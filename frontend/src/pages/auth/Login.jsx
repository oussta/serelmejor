import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

// ── Dev credentials — remove before production ──
const DEV_EMAIL    = 'test2@testt.com'
const DEV_PASSWORD = 'newpassword123'

function Login() {
  const [email,       setEmail]       = useState(DEV_EMAIL)
  const [password,    setPassword]    = useState(DEV_PASSWORD)
  const [showPass,    setShowPass]    = useState(false)
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [serverError, setServerError] = useState('')

  const { saveAuth } = useAuth()
  const navigate     = useNavigate()

  function validateField(name, value) {
    if (name === 'email') {
      if (!value) return 'El email es obligatorio'
      if (!/\S+@\S+\.\S+/.test(value)) return 'Email no válido'
    }
    if (name === 'password') {
      if (!value) return 'La contraseña es obligatoria'
      if (value.length < 8) return 'Mínimo 8 caracteres'
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '22px' }}>S</span>
          </div>
          <h1 style={styles.title}>serElMejor</h1>
          <h2 style={styles.subtitle}>Iniciar sesión</h2>
        </div>

        {/* Dev badge */}
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#F59E0B' }}>bug_report</span>
          <p style={{ fontSize: '12px', color: '#92400E', fontWeight: '500' }}>
            Dev mode — credenciales precargadas
          </p>
        </div>

        {serverError && (
          <div style={styles.serverError}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>error</span>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={{ ...styles.input, borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border)' }}
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={handleBlur}
              placeholder="tu@email.com"
            />
            {errors.email && <p style={styles.fieldError}>{errors.email}</p>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.passwordWrapper}>
              <input
                style={{ ...styles.input, borderColor: errors.password ? 'var(--color-error)' : 'var(--color-border)', paddingRight: '44px' }}
                type={showPass ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={handleBlur}
                placeholder="••••••••"
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPass(!showPass)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-text-muted)' }}>
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && <p style={styles.fieldError}>{errors.password}</p>}
          </div>

          <button
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>refresh</span>
                Cargando...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                Entrar
              </span>
            )}
          </button>
        </form>

        <p style={styles.link}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--color-brand)', fontWeight: '600' }}>Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-surface)',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  },
  card: {
    background: 'var(--color-white)',
    padding: '40px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid var(--color-border)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--color-brand)',
    marginBottom: '4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--color-text-secondary)',
    marginBottom: '24px',
    fontWeight: '500',
  },
  serverError: {
    background: 'var(--color-error-light)',
    color: 'var(--color-error)',
    padding: '12px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid var(--color-error)',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--color-border)',
    borderRadius: '8px',
    fontSize: '15px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    background: 'var(--color-surface)',
    transition: 'border-color 0.15s',
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  fieldError: {
    color: 'var(--color-error)',
    fontSize: '12px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
    transition: 'opacity 0.15s',
  },
  link: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
  },
}

export default Login