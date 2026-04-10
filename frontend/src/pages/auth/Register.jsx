import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

function Register() {
  const [form, setForm]     = useState({
    name: '', email: '', password: '', business_name: '', plan: 'full'
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const { saveAuth } = useAuth()
  const navigate     = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.business_name) {
      setError('Please fill in all fields')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      setLoading(true)
      const data = await register(
        form.name, form.email, form.password, form.business_name, form.plan
      )
      saveAuth(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>serElMejor</h1>
        <h2 style={styles.subtitle}>Crear cuenta</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input
              style={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Tu nombre"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Nombre de tu empresa</label>
            <input
              style={styles.input}
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              placeholder="Mi Empresa S.L."
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Plan</label>
            <select
              style={styles.input}
              name="plan"
              value={form.plan}
              onChange={handleChange}
            >
              <option value="full">Full Suite — €49/mes</option>
              <option value="salesflow">SalesFlow CRM — €29/mes</option>
              <option value="stockflow">StockFlow Inventario — €29/mes</option>
            </select>
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
  error: {
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