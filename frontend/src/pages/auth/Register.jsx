import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', business_name: ''
  })
  const [showPass, setShowPass]       = useState(false)
  const [errors, setErrors]           = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(false)

  const { saveAuth } = useAuth()
  const navigate     = useNavigate()

  function validateField(name, value) {
    if (name === 'name') {
  if (!value) return 'El nombre es obligatorio'
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'El nombre solo puede contener letras'
}
    if (name === 'business_name' && !value) return 'El nombre de empresa es obligatorio'
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

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')

    const newErrors = {}
    Object.keys(form).forEach(key => {
      const err = validateField(key, form[key])
      if (err) newErrors[key] = err
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      const data = await register(
        form.name, form.email, form.password, form.business_name, 'full'
      )
      saveAuth(data.token, data.user)
      navigate('/pricing')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Salesek</h1>
        <h2 style={styles.subtitle}>Crear cuenta</h2>

        {serverError && <p style={styles.serverError}>{serverError}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input
              style={{...styles.input, borderColor: errors.name ? 'var(--color-error)' : 'var(--color-border)'}}
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tu nombre"
            />
            {errors.name && <p style={styles.fieldError}>{errors.name}</p>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={{...styles.input, borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border)'}}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="tu@email.com"
            />
            {errors.email && <p style={styles.fieldError}>{errors.email}</p>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.passwordWrapper}>
              <input
                style={{...styles.input, borderColor: errors.password ? 'var(--color-error)' : 'var(--color-border)'}}
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p style={styles.fieldError}>{errors.password}</p>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Nombre de tu empresa</label>
            <input
              style={{...styles.input, borderColor: errors.business_name ? 'var(--color-error)' : 'var(--color-border)'}}
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Mi Empresa S.L."
            />
            {errors.business_name && <p style={styles.fieldError}>{errors.business_name}</p>}
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={styles.link}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
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
  },
  card: {
    background: 'var(--color-white)',
    padding: '40px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: 'var(--text-2xl)',
    color: 'var(--color-brand)',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-primary)',
    marginBottom: '24px',
    textAlign: 'center',
    fontWeight: '500',
  },
  serverError: {
    background: 'var(--color-error-light)',
    color: 'var(--color-error)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '16px',
    fontSize: 'var(--text-sm)',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
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
    fontSize: '16px',
  },
  fieldError: {
    color: 'var(--color-error)',
    fontSize: 'var(--text-xs)',
    marginTop: '4px',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'var(--gradient-primary)',
    color: 'var(--color-white)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  link: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
  }
}

export default Register