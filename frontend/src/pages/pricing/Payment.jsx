import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { selectPlan } from '../../services/authService'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PLANS = [
  { id: 'salesflow', name: 'SalesFlow',     price: 29, color: '#2563EB', icon: 'contacts',      desc: 'CRM de ventas' },
  { id: 'full',      name: 'Suite Completa', price: 49, color: '#7C3AED', icon: 'rocket_launch', desc: 'CRM + Inventario', popular: true },
  { id: 'stockflow', name: 'StockFlow',      price: 29, color: '#0EA5E9', icon: 'inventory_2',   desc: 'Control de stock' },
]

function getCardType(number) {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  return 'unknown'
}

function formatCardNumber(value) {
  const v = value.replace(/\D/g, '').slice(0, 16)
  return v.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value) {
  const v = value.replace(/\D/g, '').slice(0, 4)
  if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2)
  return v
}

function Payment() {
  const { user, token, saveAuth } = useAuth()
  const { theme }                 = useTheme()
  const { t }                     = useTranslation()
  const navigate                  = useNavigate()
  const location                  = useLocation()
  const isDark                    = theme === 'dark'

  const [selectedPlan, setSelectedPlan] = useState(location.state?.planId || 'full')
  const [step,         setStep]         = useState('plan') // plan | card | confirm | done
  const [cardData,     setCardData]     = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [errors,       setErrors]       = useState({})
  const [sending,      setSending]      = useState(false)
  const [flipped,      setFlipped]      = useState(false)

  const cardBg   = isDark ? '#1E293B' : '#FFFFFF'
  const border   = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const pageBg   = isDark ? '#0F172A' : '#F8FAFC'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'
  const inputText= isDark ? '#F1F5F9' : '#0F172A'

  const plan     = PLANS.find(p => p.id === selectedPlan) || PLANS[1]
  const cardType = getCardType(cardData.number)

  function handleCardChange(field, value) {
    let formatted = value
    if (field === 'number') formatted = formatCardNumber(value)
    if (field === 'expiry') formatted = formatExpiry(value)
    if (field === 'cvv')    formatted = value.replace(/\D/g, '').slice(0, 4)
    setCardData(prev => ({ ...prev, [field]: formatted }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validateCard() {
    const e = {}
    const num = cardData.number.replace(/\s/g, '')
    if (!num || num.length < 16)                                    e.number = 'Número de tarjeta inválido'
    if (!cardData.name.trim())                                      e.name   = 'Nombre requerido'
    const [m, y] = cardData.expiry.split('/')
    if (!m || !y || parseInt(m) > 12 || cardData.expiry.length < 5) e.expiry = 'Fecha inválida'
    if (!cardData.cvv || cardData.cvv.length < 3)                   e.cvv    = 'CVV inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePayment() {
    if (!validateCard()) return
    setSending(true)
    try {
      await new Promise(r => setTimeout(r, 1800))
      await selectPlan(selectedPlan, token)
      saveAuth(token, { ...user, plan: selectedPlan })

      const payment = {
        plan:      selectedPlan,
        planName:  plan.name,
        price:     plan.price,
        cardLast4: cardData.number.replace(/\s/g, '').slice(-4),
        cardType,
        email:     user?.email,
        date:      new Date().toISOString(),
        status:    'confirmed',
      }
      localStorage.setItem('salesek_payment', JSON.stringify(payment))

      // Send confirmation email
      try {
        await fetch(`${API}/contact`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name:    user?.name || 'Usuario',
            email:   user?.email || '',
            company: plan.name,
            message: `Confirmación de pago — Plan: ${plan.name} — ${plan.price}€/mes — Tarjeta: **** **** **** ${payment.cardLast4}`,
          }),
        })
      } catch {}

      setStep('done')
    } catch (e) {
      setStep('done')
    } finally {
      setSending(false)
    }
  }

  const inputStyle = (field) => ({
    width: '100%', padding: '11px 14px',
    background: inputBg, color: inputText,
    border: `1.5px solid ${errors[field] ? '#F43F5E' : border}`,
    borderRadius: '10px', fontSize: '15px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  })

  // ── DONE STATE ──────────────────────────────────────────
  if (step === 'done') {
    const payment = JSON.parse(localStorage.getItem('salesek_payment') || '{}')
    return (
      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', background: pageBg, minHeight: '100vh', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '24px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'white' }}>check</span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: textMain, marginBottom: '10px' }}>¡Pago confirmado! 🎉</h2>
          <p style={{ fontSize: '15px', color: textSub, marginBottom: '28px', lineHeight: '1.6' }}>
            Hemos enviado un email de confirmación a <strong style={{ color: textMain }}>{user?.email}</strong>
          </p>
          <div style={{ background: isDark ? '#0F172A' : '#F8FAFC', border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            {[
              { label: 'Plan',    value: payment.planName },
              { label: 'Importe', value: `€${payment.price}/mes`, color: '#10B981' },
              { label: 'Tarjeta', value: `•••• ${payment.cardLast4}` },
              { label: 'Estado',  value: 'Confirmado', badge: true },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < 3 ? '12px' : 0 }}>
                <span style={{ fontSize: '13px', color: textSub }}>{row.label}</span>
                {row.badge
                  ? <span style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: '99px' }}>{row.value}</span>
                  : <span style={{ fontSize: '14px', fontWeight: '700', color: row.color || textMain }}>{row.value}</span>
                }
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Ir al dashboard →
          </button>
        </div>
      </div>
    )
  }

  // ── MAIN LAYOUT ─────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', background: pageBg, minHeight: '100vh', padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '16px', padding: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Volver
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: textMain, marginBottom: '6px' }}>Suscripción</h1>
          <p style={{ fontSize: '14px', color: textSub }}>Elige tu plan y realiza el pago de forma segura</p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          {[
            { key: 'plan',    label: '1. Plan' },
            { key: 'card',    label: '2. Pago' },
            { key: 'confirm', label: '3. Confirmación' },
          ].map((s, i) => {
            const steps   = ['plan', 'card', 'confirm']
            const current = steps.indexOf(step)
            const thisIdx = steps.indexOf(s.key)
            const isDone   = thisIdx < current
            const isActive = thisIdx === current
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDone ? '#10B981' : isActive ? '#2563EB' : (isDark ? '#334155' : '#E2E8F0'), display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                    {isDone
                      ? <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'white' }}>check</span>
                      : <span style={{ fontSize: '12px', fontWeight: '700', color: isActive ? 'white' : textSub }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500', color: isActive ? textMain : textSub }}>{s.label}</span>
                </div>
                {i < 2 && <div style={{ width: '32px', height: '2px', background: isDone ? '#10B981' : (isDark ? '#334155' : '#E2E8F0'), borderRadius: '99px' }} />}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

          {/* ── LEFT PANEL ── */}
          <div>

            {/* STEP 1: Plan selection */}
            {step === 'plan' && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '20px' }}>Elige tu plan</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {PLANS.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlan(p.id)}
                      style={{ padding: '20px', border: `2px solid ${selectedPlan === p.id ? p.color : border}`, borderRadius: '14px', cursor: 'pointer', background: selectedPlan === p.id ? `${p.color}08` : 'transparent', transition: 'all 0.2s', position: 'relative' }}
                    >
                      {p.popular && (
                        <div style={{ position: 'absolute', top: '-10px', right: '16px', background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 10px', borderRadius: '99px' }}>
                          ⭐ MÁS POPULAR
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: p.color }}>{p.icon}</span>
                          </div>
                          <div>
                            <p style={{ fontSize: '15px', fontWeight: '700', color: textMain }}>{p.name}</p>
                            <p style={{ fontSize: '12px', color: textSub }}>{p.desc}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '22px', fontWeight: '800', color: p.color }}>€{p.price}<span style={{ fontSize: '12px', fontWeight: '400', color: textSub }}>/mes</span></p>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selectedPlan === p.id ? p.color : border}`, background: selectedPlan === p.id ? p.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginTop: '4px' }}>
                            {selectedPlan === p.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', display: 'block' }} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('card')}
                  style={{ width: '100%', marginTop: '24px', padding: '13px', background: `linear-gradient(135deg, ${plan.color}, #0EA5E9)`, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Continuar con {plan.name} — €{plan.price}/mes
                </button>
              </div>
            )}

            {/* STEP 2: Card form */}
            {step === 'card' && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '24px' }}>Datos de pago</h2>

                {/* Flippable credit card */}
                <div
                  style={{ width: '100%', maxWidth: '340px', height: '200px', borderRadius: '20px', background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', padding: '24px', marginBottom: '28px', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 16px 48px rgba(0,0,0,0.3)', boxSizing: 'border-box' }}
                  onClick={() => setFlipped(!flipped)}
                >
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ position: 'absolute', bottom: '-60px', left: '-20px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

                  {!flipped ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div style={{ display: 'flex' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#EB001B', opacity: 0.9 }} />
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F79E1B', opacity: 0.9, marginLeft: '-12px' }} />
                        </div>
                        {cardType === 'visa'       && <span style={{ color: 'white', fontWeight: '800', fontSize: '22px', fontStyle: 'italic' }}>VISA</span>}
                        {cardType === 'mastercard' && <span style={{ color: 'white', fontWeight: '800', fontSize: '14px', letterSpacing: '1px' }}>MASTERCARD</span>}
                        {cardType === 'amex'       && <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>AMEX</span>}
                        {cardType === 'unknown'    && <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'rgba(255,255,255,0.4)' }}>credit_card</span>}
                      </div>
                      <p style={{ fontSize: '20px', fontWeight: '600', color: 'white', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'monospace' }}>
                        {cardData.number || '•••• •••• •••• ••••'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Titular</p>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{cardData.name || 'NOMBRE APELLIDO'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Vence</p>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{cardData.expiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ position: 'absolute', top: '40px', left: 0, right: 0, height: '40px', background: 'rgba(0,0,0,0.5)' }} />
                      <div style={{ position: 'absolute', top: '95px', right: '24px', background: 'white', borderRadius: '6px', padding: '8px 16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '10px', color: '#64748B', marginBottom: '2px' }}>CVV</p>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace', letterSpacing: '3px' }}>{cardData.cvv || '•••'}</p>
                      </div>
                      <p style={{ position: 'absolute', bottom: '12px', left: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Reverso de la tarjeta</p>
                    </>
                  )}
                  <p style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Toca para girar</p>
                </div>

                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>Número de tarjeta</label>
                    <input style={inputStyle('number')} value={cardData.number} onChange={e => handleCardChange('number', e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} onFocus={() => setFlipped(false)} />
                    {errors.number && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.number}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>Nombre del titular</label>
                    <input style={inputStyle('name')} value={cardData.name} onChange={e => handleCardChange('name', e.target.value.toUpperCase())} placeholder="NOMBRE APELLIDO" onFocus={() => setFlipped(false)} />
                    {errors.name && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>Fecha de vencimiento</label>
                      <input style={inputStyle('expiry')} value={cardData.expiry} onChange={e => handleCardChange('expiry', e.target.value)} placeholder="MM/YY" maxLength={5} onFocus={() => setFlipped(false)} />
                      {errors.expiry && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.expiry}</p>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>CVV</label>
                      <input style={inputStyle('cvv')} value={cardData.cvv} onChange={e => handleCardChange('cvv', e.target.value)} placeholder="•••" maxLength={4} onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} />
                      {errors.cvv && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.cvv}</p>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button onClick={() => setStep('plan')} style={{ flex: 1, padding: '13px', background: 'none', border: `1px solid ${border}`, borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Atrás</button>
                  <button onClick={() => { if (validateCard()) setStep('confirm') }} style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Revisar pedido</button>
                </div>
              </div>
            )}

            {/* STEP 3: Confirm */}
            {step === 'confirm' && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '24px' }}>Confirmar pedido</h2>

                <div style={{ background: isDark ? '#0F172A' : '#F8FAFC', border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
                  {[
                    { label: 'Plan',    value: plan.name },
                    { label: 'Tarjeta', value: `•••• •••• •••• ${cardData.number.replace(/\s/g, '').slice(-4)}` },
                    { label: 'Titular', value: cardData.name },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', color: textSub }}>{row.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ height: '1px', background: border, margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: textMain }}>Total mensual</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#2563EB' }}>€{plan.price}/mes</span>
                  </div>
                </div>

                <div style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>mail</span>
                  <p style={{ fontSize: '13px', color: '#10B981', fontWeight: '500' }}>
                    Se enviará confirmación a <strong>{user?.email}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setStep('card')} style={{ flex: 1, padding: '13px', background: 'none', border: `1px solid ${border}`, borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Atrás</button>
                  <button
                    onClick={handlePayment}
                    disabled={sending}
                    style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: sending ? 0.8 : 1 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{sending ? 'hourglass_empty' : 'lock'}</span>
                    {sending ? 'Procesando...' : `Pagar €${plan.price}/mes`}
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: textSub, textAlign: 'center', marginTop: '12px' }}>🔒 Pago seguro — Proyecto DAW</p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Order summary ── */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px', padding: '24px', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>receipt</span>
              Resumen
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: `${plan.color}08`, border: `1px solid ${plan.color}20`, borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: plan.color }}>{plan.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>{plan.name}</p>
                <p style={{ fontSize: '12px', color: textSub }}>{plan.desc}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: textSub }}>Subtotal</span>
                <span style={{ fontSize: '13px', color: textMain }}>€{plan.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: textSub }}>IVA (21%)</span>
                <span style={{ fontSize: '13px', color: textMain }}>€{(plan.price * 0.21).toFixed(2)}</span>
              </div>
              <div style={{ height: '1px', background: border }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: textMain }}>Total</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>€{(plan.price * 1.21).toFixed(2)}/mes</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['14 días gratis incluidos', 'Sin permanencia', 'Cancela cuando quieras', 'Soporte prioritario'].map(feature => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: textSub }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#10B981' }}>check_circle</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment