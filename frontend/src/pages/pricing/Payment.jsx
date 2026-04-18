import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../../context/AuthContext'
import { request } from '../../services/api'

const stripePromise = loadStripe('pk_test_51TKdgYHu7fdnyixMdKAEYW5lD7zaLQT6RQ8iHsgXrPVBUlTLTPpCqMy18I6UEkN4j1A42zljqzqga7WFEUDwLPhc00now2TBZG')

function getCardType(number) {
  const num = number.replace(/\s/g, '')
  if (/^4/.test(num)) return 'visa'
  if (/^5[1-5]/.test(num)) return 'mastercard'
  if (/^3[47]/.test(num)) return 'amex'
  if (/^6/.test(num)) return 'discover'
  return 'unknown'
}

function CardPreview({ cardNumber, cardName, expiry, cardType }) {
  const logos = {
    visa:       '💳 VISA',
    mastercard: '💳 Mastercard',
    amex:       '💳 Amex',
    discover:   '💳 Discover',
    unknown:    '💳',
  }

  const colors = {
    visa:       'linear-gradient(135deg, #1a1f71, #2563EB)',
    mastercard: 'linear-gradient(135deg, #eb001b, #f79e1b)',
    amex:       'linear-gradient(135deg, #007bc1, #00a8e0)',
    discover:   'linear-gradient(135deg, #f76f20, #f9a01b)',
    unknown:    'linear-gradient(135deg, #0F172A, #1E3A5F)',
  }

  const formatted = cardNumber
    ? cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
    : '•••• •••• •••• ••••'

  return (
    <div style={{...styles.cardPreview, background: colors[cardType]}}>
      <div style={styles.cardTop}>
        <div style={styles.chip}>▣</div>
        <div style={styles.cardLogo}>{logos[cardType]}</div>
      </div>
      <div style={styles.cardNumber}>{formatted || '•••• •••• •••• ••••'}</div>
      <div style={styles.cardBottom}>
        <div>
          <div style={styles.cardLabel}>Titular</div>
          <div style={styles.cardValue}>{cardName || 'NOMBRE APELLIDO'}</div>
        </div>
        <div>
          <div style={styles.cardLabel}>Expira</div>
          <div style={styles.cardValue}>{expiry || 'MM/AA'}</div>
        </div>
      </div>
    </div>
  )
}

function CheckoutForm({ plan, price, clientSecret }) {
  const stripe     = useStripe()
  const elements   = useElements()
  const navigate   = useNavigate()
  const { token, user, saveAuth } = useAuth()

  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName]     = useState('')
  const [expiry, setExpiry]         = useState('')
  const [cardType, setCardType]     = useState('unknown')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: { name: cardName }
          }
        }
      )

      if (stripeError) {
        setError(stripeError.message)
        setLoading(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm on backend
        await request('POST', '/payment/confirm', {
          plan,
          payment_intent_id: paymentIntent.id
        }, token)

        saveAuth(token, { ...user, plan })
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const planNames = {
    salesflow: 'SalesFlow CRM',
    stockflow: 'StockFlow',
    full:      'Full Suite'
  }

  const stripeElementStyle = {
    style: {
      base: {
        fontSize: '15px',
        color: '#0F172A',
        '::placeholder': { color: '#94A3B8' }
      }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Salesek</h1>
        <h2 style={styles.subtitle}>Pago seguro</h2>

        <div style={styles.planBadge}>
          {planNames[plan]} — €{price}/mes
        </div>

        <CardPreview
          cardNumber={cardNumber}
          cardName={cardName}
          expiry={expiry}
          cardType={cardType}
        />

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Número de tarjeta</label>
            <div style={styles.stripeInput}>
              <CardNumberElement
                options={stripeElementStyle}
                onChange={e => {
                  if (e.brand) setCardType(e.brand)
                  if (e.value) setCardNumber(e.value.toString())
                }}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Titular de la tarjeta</label>
            <input
              style={styles.input}
              placeholder="Como aparece en la tarjeta"
              value={cardName}
              onChange={e => setCardName(e.target.value.toUpperCase())}
            />
          </div>

          <div style={styles.row}>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Fecha de expiración</label>
              <div style={styles.stripeInput}>
                <CardExpiryElement
                  options={stripeElementStyle}
                  onChange={e => {
                    if (e.value) setExpiry(e.value.toString())
                  }}
                />
              </div>
            </div>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>CVC</label>
              <div style={styles.stripeInput}>
                <CardCvcElement options={stripeElementStyle} />
              </div>
            </div>
          </div>

          <div style={styles.secureNote}>
            🔒 Pago seguro con cifrado SSL — Stripe
          </div>

          <button
            style={styles.button}
            type="submit"
            disabled={loading || !stripe}
          >
            {loading ? 'Procesando...' : `Pagar €${price}`}
          </button>
        </form>

        <p style={styles.testNote}>
          🧪 Modo test — usa la tarjeta: 4242 4242 4242 4242
        </p>
      </div>
    </div>
  )
}

function Payment() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { token } = useAuth()

  const { plan, price } = location.state || {}
  const [clientSecret, setClientSecret] = useState('')
  const [error, setError]               = useState('')

  useEffect(() => {
    if (!plan || !price) {
      navigate('/pricing')
      return
    }

    request('POST', '/payment/create-intent', { plan }, token)
      .then(data => setClientSecret(data.client_secret))
      .catch(err => setError(err.message))
  }, [])

  if (error) return (
    <div style={styles.container}>
      <p style={styles.error}>{error}</p>
    </div>
  )

  if (!clientSecret) return (
    <div style={styles.container}>
      <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Preparando pago...
      </p>
    </div>
  )

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm plan={plan} price={price} clientSecret={clientSecret} />
    </Elements>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-surface)',
    padding: '20px',
  },
  card: {
    background: 'var(--color-white)',
    padding: '40px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    width: '100%',
    maxWidth: '440px',
  },
  title: {
    fontSize: 'var(--text-2xl)',
    color: 'var(--color-brand)',
    marginBottom: '4px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-primary)',
    marginBottom: '16px',
    textAlign: 'center',
    fontWeight: '500',
  },
  planBadge: {
    background: 'var(--color-brand-light)',
    color: 'var(--color-brand)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '24px',
  },
  cardPreview: {
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    color: 'white',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    fontSize: '24px',
    opacity: 0.8,
  },
  cardLogo: {
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  cardNumber: {
    fontSize: '20px',
    letterSpacing: '3px',
    fontWeight: '500',
    textAlign: 'center',
    margin: '16px 0',
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: '10px',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '2px',
  },
  cardValue: {
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '1px',
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
  stripeInput: {
    padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'white',
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
  row: {
    display: 'flex',
    gap: '16px',
  },
  secureNote: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginBottom: '16px',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'var(--gradient-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  testNote: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginTop: '16px',
  }
}

export default Payment