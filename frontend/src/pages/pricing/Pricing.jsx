import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { selectPlan } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

function Pricing() {
  const [loading, setLoading]     = useState('')
  const [error, setError]         = useState('')
  const { token, user, saveAuth } = useAuth()
  const navigate                  = useNavigate()

 async function handleSelectPlan(plan) {
    try {
      setLoading(plan)
      setError('')
      await selectPlan(plan, token)
      saveAuth(token, { ...user, plan })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading('')
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Gratis',
      price: '0',
      color: 'var(--color-text-secondary)',
      features: [
        'Hasta 5 leads',
        'Hasta 10 productos',
        'Sin IA',
        'Sin notificaciones',
        'Soporte por email',
      ]
    },
    {
      id: 'salesflow',
      name: 'SalesFlow CRM',
      price: '29',
      color: 'var(--color-brand)',
      features: [
        'Leads ilimitados',
        'Pipeline Kanban',
        'Historial de mensajes',
        'Recordatorios de seguimiento',
        'Respuestas con IA',
      ]
    },
    {
      id: 'full',
      name: 'Full Suite',
      price: '49',
      color: 'var(--color-accent)',
      badge: '⭐ Más popular',
      features: [
        'Todo de SalesFlow CRM',
        'Todo de StockFlow',
        'Bridge CRM ↔ Inventario',
        'Notificaciones en tiempo real',
        'Panel de administración',
      ]
    },
    {
      id: 'stockflow',
      name: 'StockFlow',
      price: '29',
      color: 'var(--color-success)',
      features: [
        'Productos ilimitados',
        'Control de stock',
        'Alertas de stock bajo',
        'Órdenes automáticas',
        'Sugerencias con IA',
      ]
    },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Salesek</h1>
        <h2 style={styles.subtitle}>Elige tu plan</h2>
        <p style={styles.trial}>✅ 14 días gratis — no se requiere tarjeta</p>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        {plans.map(plan => (
          <div key={plan.id} style={{
            ...styles.card,
            borderColor: plan.id === 'full' ? plan.color : 'var(--color-border)',
            borderWidth: plan.id === 'full' ? '2px' : '1px',
          }}>
            {plan.badge && (
              <div style={{...styles.badge, background: plan.color}}>
                {plan.badge}
              </div>
            )}
            <h3 style={{...styles.planName, color: plan.color}}>{plan.name}</h3>
            <div style={styles.priceRow}>
              <span style={styles.price}>€{plan.price}</span>
              <span style={styles.period}>/mes</span>
            </div>
            <ul style={styles.features}>
              {plan.features.map((f, i) => (
                <li key={i} style={styles.feature}>✓ {f}</li>
              ))}
            </ul>
            <button
              style={{...styles.button, background: plan.color}}
              onClick={() => handleSelectPlan(plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id ? 'Procesando...' : plan.id === 'free' ? 'Empezar gratis' : 'Elegir plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-surface)',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: 'var(--text-2xl)',
    color: 'var(--color-brand)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: 'var(--text-xl)',
    color: 'var(--color-text-primary)',
    marginBottom: '12px',
  },
  trial: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-success)',
    fontWeight: '600',
  },
  error: {
    background: 'var(--color-error-light)',
    color: 'var(--color-error)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '16px',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '0 auto 20px',
  },
  grid: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  card: {
    background: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    padding: '32px',
    width: '240px',
    boxShadow: 'var(--shadow-sm)',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    padding: '4px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  planName: {
    fontSize: 'var(--text-lg)',
    fontWeight: '700',
    marginBottom: '16px',
    textAlign: 'center',
  },
  priceRow: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  price: {
    fontSize: 'var(--text-3xl)',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  period: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },
  features: {
    listStyle: 'none',
    marginBottom: '24px',
    padding: 0,
  },
  feature: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    padding: '6px 0',
    borderBottom: '1px solid var(--color-surface-2)',
  },
  button: {
    width: '100%',
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
    cursor: 'pointer',
  }
}

export default Pricing