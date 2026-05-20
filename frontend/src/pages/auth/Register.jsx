import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { register } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PLANS = [
  {
    id: 'free',
    icon: 'star',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #0EA5E9)',
    price: 0,
    trialDays: 14,
  },
  {
    id: 'salesflow',
    icon: 'contacts',
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    price: 29,
  },
  {
    id: 'full',
    icon: 'rocket_launch',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #2563EB)',
    price: 49,
    popular: true,
  },
  {
    id: 'stockflow',
    icon: 'inventory_2',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9, #10B981)',
    price: 29,
  },
]

function formatCardNumber(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d
}

function getCardBrand(n) {
  const s = n.replace(/\s/g, '')
  if (s.startsWith('4')) return 'VISA'
  if (/^5[1-5]/.test(s) || /^2[2-7]/.test(s)) return 'MC'
  if (/^3[47]/.test(s)) return 'AMEX'
  return ''
}

function Register() {
  const { t }               = useTranslation()
  const { theme }           = useTheme()
  const { clearAuth }       = useAuth()
  const navigate            = useNavigate()
  const isDark              = theme === 'dark'

  const [step, setStep]                     = useState('account')
  const [registeredUser, setRegisteredUser] = useState(null)
  const [registeredToken, setRegisteredToken] = useState(null)
  const [selectedPlan, setSelectedPlan]     = useState('full')

  // Account form — persisted in localStorage
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem('register_form')
      return saved ? JSON.parse(saved) : { name: '', email: '', password: '', business_name: '' }
    } catch {
      return { name: '', email: '', password: '', business_name: '' }
    }
  })
  const [showPass, setShowPass]         = useState(false)
  const [errors, setErrors]             = useState({})
  const [serverError, setServerError]   = useState('')
  const [loading, setLoading]           = useState(false)

  // Card form
  const [card, setCard]             = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [cardErrors, setCardErrors] = useState({})
  const [cardFocus, setCardFocus]   = useState('')
  const [paying, setPaying]         = useState(false)
  const [flipped, setFlipped]       = useState(false)

  const bg      = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg  = isDark ? '#1E293B' : '#FFFFFF'
  const border  = isDark ? '#334155' : '#E2E8F0'
  const textMain= isDark ? '#F1F5F9' : '#0F172A'
  const textSub = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? '#0F172A' : '#F8FAFC'

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[2]

  // ── Plan helpers ─────────────────────────────────────
  function planName(id) {
    if (id === 'free')      return t('register.planFree')            || '14 días gratis'
    if (id === 'salesflow') return t('pricing.plans.salesflow.name') || 'SalesFlow'
    if (id === 'full')      return t('pricing.plans.suite.name')     || 'Suite Completa'
    if (id === 'stockflow') return t('pricing.plans.stockflow.name') || 'StockFlow'
    return id
  }

  function planDesc(id) {
    if (id === 'free')      return t('register.planFreeDesc')        || 'Prueba todas las funciones durante 14 días'
    if (id === 'salesflow') return t('pricing.plans.salesflow.desc') || 'CRM de ventas'
    if (id === 'full')      return t('pricing.plans.suite.desc')     || 'CRM + Inventario conectados'
    if (id === 'stockflow') return t('pricing.plans.stockflow.desc') || 'Control de stock'
    return ''
  }

  // ── Account field validation ─────────────────────────
  function validateField(name, value) {
    if (name === 'name') {
      if (!value.trim()) return t('team.nameRequired') || 'El nombre es obligatorio'
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return t('register.nameLetters') || 'Solo letras, sin números'
    }
    if (name === 'business_name' && !value.trim()) return t('register.businessRequired') || 'El nombre de empresa es obligatorio'
    if (name === 'email') {
      if (!value.trim()) return t('auth.emailRequired') || 'El email es obligatorio'
      if (!/\S+@\S+\.\S+/.test(value)) return t('auth.emailInvalid') || 'Email no válido'
    }
    if (name === 'password') {
      if (!value) return t('auth.passwordRequired') || 'La contraseña es obligatoria'
      if (value.length < 8) return t('auth.passwordMin') || 'Mínimo 8 caracteres'
    }
    return ''
  }

  // ── Card name validation (only letters + spaces) ─────
  function validateCardName(value) {
    if (!value.trim()) return t('register.cardNameRequired') || 'Nombre requerido'
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return t('register.cardNameLetters') || 'Solo letras, sin números ni símbolos'
    if (value.trim().length < 2) return t('register.cardNameMin') || 'Nombre demasiado corto'
    return ''
  }

  // ── Account form handlers ────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    setForm(updated)
    // Persist to localStorage
    localStorage.setItem('register_form', JSON.stringify(updated))
    if (errors[name]) setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  function handleBlur(e) {
    const { name, value } = e.target
    setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  // ── Card form handlers ───────────────────────────────
  function handleCardChange(field, value) {
    let formatted = value
    if (field === 'number') formatted = formatCardNumber(value)
    if (field === 'expiry') formatted = formatExpiry(value)
    if (field === 'cvv')    formatted = value.replace(/\D/g, '').slice(0, 4)
    // Card name: only allow letters and spaces
    if (field === 'name')   formatted = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toUpperCase()
    setCard(c => ({ ...c, [field]: formatted }))
    if (cardErrors[field]) setCardErrors(p => ({ ...p, [field]: '' }))
  }

  function handleCardBlur(field) {
    if (field === 'name') {
      const err = validateCardName(card.name)
      if (err) setCardErrors(p => ({ ...p, name: err }))
    }
    if (field === 'number') {
      const digits = card.number.replace(/\s/g, '')
      if (digits.length > 0 && digits.length < 16) {
        setCardErrors(p => ({ ...p, number: t('register.cardNumberInvalid') || 'Número de tarjeta inválido' }))
      }
    }
    if (field === 'expiry' && card.expiry.length > 0) {
      if (!card.expiry.match(/^\d{2}\/\d{2}$/)) {
        setCardErrors(p => ({ ...p, expiry: t('register.cardExpiryInvalid') || 'Formato inválido (MM/AA)' }))
      } else {
        const [mm, yy] = card.expiry.split('/').map(Number)
        if (mm < 1 || mm > 12) {
          setCardErrors(p => ({ ...p, expiry: t('register.cardMonthInvalid') || 'Mes inválido' }))
        } else {
          const expDate = new Date(2000 + yy, mm - 1)
          if (expDate < new Date()) {
            setCardErrors(p => ({ ...p, expiry: t('register.cardExpired') || 'La tarjeta ha expirado' }))
          }
        }
      }
    }
    if (field === 'cvv' && card.cvv.length > 0 && card.cvv.length < 3) {
      setCardErrors(p => ({ ...p, cvv: t('register.cardCvvInvalid') || 'CVV inválido' }))
    }
    setCardFocus('')
  }

  // ── STEP 1: Register account ─────────────────────────
  async function handleRegister(e) {
    e.preventDefault()
    setServerError('')
    const newErrors = {}
    Object.keys(form).forEach(k => {
      const err = validateField(k, form[k])
      if (err) newErrors[k] = err
    })
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    try {
      setLoading(true)
      const data = await register(form.name, form.email, form.password, form.business_name, 'pending')
      setRegisteredUser(data.user)
      setRegisteredToken(data.token)
      localStorage.removeItem('register_form') // clear after success
      setStep('plan')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── STEP 3: Payment ──────────────────────────────────
  function validateCard() {
    const e = {}
    const nameErr = validateCardName(card.name)
    if (nameErr) e.name = nameErr
    const digits = card.number.replace(/\s/g, '')
    if (digits.length < 16) e.number = t('register.cardNumberInvalid') || 'Número inválido'
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) {
      e.expiry = t('register.cardExpiryInvalid') || 'Fecha inválida (MM/AA)'
    } else {
      const [mm, yy] = card.expiry.split('/').map(Number)
      if (mm < 1 || mm > 12) {
        e.expiry = t('register.cardMonthInvalid') || 'Mes inválido'
      } else {
        const expDate = new Date(2000 + yy, mm - 1)
        if (expDate < new Date()) e.expiry = t('register.cardExpired') || 'Tarjeta expirada'
      }
    }
    if (card.cvv.length < 3) e.cvv = t('register.cardCvvInvalid') || 'CVV inválido'
    setCardErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePay() {
    if (!validateCard()) return
    setPaying(true)
    try {
      await new Promise(r => setTimeout(r, 1800))

      // Update plan in DB
      await fetch(`${API}/business/subscription`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${registeredToken}` },
        body:    JSON.stringify({ plan: selectedPlan }),
      })

      // Send confirmation email
      try {
        await fetch(`${API}/contact`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${registeredToken}` },
          body: JSON.stringify({
            name:    registeredUser?.name || '',
            email:   registeredUser?.email || '',
            company: planName(selectedPlan),
            message: `Nueva suscripción — Plan: ${planName(selectedPlan)} — ${plan.price > 0 ? plan.price + '€/mes' : '14 días gratis'} — Usuario: ${registeredUser?.email}`,
          }),
        })
      } catch {}

      setStep('done')
    } catch {
      setStep('done')
    } finally {
      setPaying(false)
    }
  }

  // ── Steps ────────────────────────────────────────────
  const STEPS = [
    { key: 'account', label: t('register.stepAccount') || '1. Cuenta' },
    { key: 'plan',    label: t('register.stepPlan')    || '2. Plan' },
    { key: 'payment', label: t('register.stepPayment') || '3. Pago' },
  ]
  const stepIdx   = { account: 0, plan: 1, payment: 2, done: 3 }
  const currentIdx = stepIdx[step] ?? 0

  const inputStyle = (field, isCard = false) => ({
    width: '100%', padding: '12px 14px',
    border: `1.5px solid ${(isCard ? cardErrors[field] : errors[field]) ? '#F43F5E' : cardFocus === field ? plan.color : border}`,
    borderRadius: '10px', fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    background: inputBg, color: textMain,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  })

  // ── DONE ─────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <div style={{ background: cardBg, borderRadius: '24px', padding: '48px 40px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: `1px solid ${border}` }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: plan.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 8px 32px ${plan.color}40` }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'white' }}>check</span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: textMain, marginBottom: '10px' }}>
            {t('register.successTitle') || '¡Cuenta creada! 🎉'}
          </h2>
          <p style={{ fontSize: '15px', color: textSub, marginBottom: '24px', lineHeight: 1.6 }}>
            {t('register.successDesc') || 'Tu cuenta ha sido creada correctamente.'}
          </p>
          <div style={{ background: isDark ? '#0F172A' : '#F8FAFC', border: `1px solid ${border}`, borderRadius: '12px', padding: '16px', marginBottom: '28px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: textSub }}>{t('register.email') || 'Email'}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: textMain }}>{registeredUser?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: textSub }}>{t('register.plan') || 'Plan'}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: plan.color }}>{planName(selectedPlan)}</span>
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); navigate('/login') }}
            style={{ width: '100%', padding: '14px', background: plan.gradient, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: `0 8px 24px ${plan.color}40` }}
          >
            {t('register.goToLogin') || 'Iniciar sesión →'}
          </button>
          <p style={{ fontSize: '12px', color: textSub, marginTop: '12px' }}>
            {t('register.successNote') || 'Inicia sesión con tu email y contraseña para acceder.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: step === 'plan' ? '900px' : '480px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>
            Salesek
          </div>
          <p style={{ fontSize: '14px', color: textSub }}>
            {step === 'account' && (t('register.createAccount')  || 'Crea tu cuenta gratis')}
            {step === 'plan'    && (t('register.choosePlan')     || 'Elige tu plan')}
            {step === 'payment' && (t('register.paymentDetails') || 'Datos de pago')}
          </p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {STEPS.map((s, i) => {
            const done   = i < currentIdx
            const active = i === currentIdx
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? '#10B981' : active ? '#2563EB' : (isDark ? '#334155' : '#E2E8F0'), display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                    {done
                      ? <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'white' }}>check</span>
                      : <span style={{ fontSize: '12px', fontWeight: '700', color: active ? 'white' : textSub }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: active ? '700' : '500', color: active ? textMain : textSub }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: '32px', height: '2px', background: done ? '#10B981' : (isDark ? '#334155' : '#E2E8F0'), borderRadius: '99px' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* ── STEP 1: Account ── */}
        {step === 'account' && (
          <div style={{ background: cardBg, borderRadius: '24px', padding: '36px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: `1px solid ${border}` }}>
            {serverError && (
              <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '13px' }}>
                {serverError}
              </div>
            )}
            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>{t('register.name') || 'Nombre'}</label>
                  <input style={inputStyle('name')} name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder="Juan García" onFocus={() => setCardFocus('name')} />
                  {errors.name && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>{t('register.businessName') || 'Nombre de tu empresa'}</label>
                  <input style={inputStyle('business_name')} name="business_name" value={form.business_name} onChange={handleChange} onBlur={handleBlur} placeholder="Mi Empresa S.L." />
                  {errors.business_name && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.business_name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>Email</label>
                  <input style={inputStyle('email')} name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="tu@empresa.com" />
                  {errors.email && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>{t('auth.password') || 'Contraseña'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inputStyle('password'), paddingRight: '44px' }}
                      name="password" type={showPass ? 'text' : 'password'}
                      value={form.password} onChange={handleChange} onBlur={handleBlur}
                      placeholder={t('auth.passwordMin') || 'Mínimo 8 caracteres'}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textSub, display: 'flex', alignItems: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {errors.password && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                style={{ width: '100%', marginTop: '24px', padding: '14px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading
                  ? <><span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>progress_activity</span>{t('register.creating') || 'Creando cuenta...'}</>
                  : <>{t('register.continue') || 'Continuar'} →</>
                }
              </button>

              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: textSub }}>
                {t('register.hasAccount') || '¿Ya tienes cuenta?'}{' '}
                <Link to="/login" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>{t('auth.loginButton') || 'Inicia sesión'}</Link>
              </p>
            </form>
          </div>
        )}

        {/* ── STEP 2: Plan selection ── */}
        {step === 'plan' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {PLANS.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  style={{ background: cardBg, border: `2px solid ${selectedPlan === p.id ? p.color : border}`, borderRadius: '20px', padding: '24px 20px', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', boxShadow: selectedPlan === p.id ? `0 8px 32px ${p.color}30` : '0 2px 8px rgba(0,0,0,0.06)', transform: selectedPlan === p.id ? 'translateY(-4px)' : 'translateY(0)' }}
                >
                  {p.popular && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #F59E0B, #F43F5E)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 12px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                      ⭐ {t('pricing.popular') || 'Más popular'}
                    </div>
                  )}
                  {/* Selected radio */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selectedPlan === p.id ? p.color : border}`, background: selectedPlan === p.id ? p.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedPlan === p.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', display: 'block' }} />}
                  </div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: p.color }}>{p.icon}</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: textMain, marginBottom: '4px' }}>{planName(p.id)}</p>
                  <p style={{ fontSize: '12px', color: textSub, marginBottom: '16px', lineHeight: 1.4 }}>{planDesc(p.id)?.slice(0, 55)}...</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '8px' }}>
                    {p.price === 0
                      ? <span style={{ fontSize: '22px', fontWeight: '800', color: p.color }}>{t('register.free') || 'Gratis'}</span>
                      : <><span style={{ fontSize: '28px', fontWeight: '800', color: p.color }}>€{p.price}</span><span style={{ fontSize: '12px', color: textSub }}>/mes</span></>
                    }
                  </div>
                  {p.trialDays && (
                    <p style={{ fontSize: '11px', color: p.color, fontWeight: '600' }}>✓ {p.trialDays} {t('register.trialDays') || 'días gratis'}</p>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('payment')}
              style={{ width: '100%', padding: '14px', background: plan.gradient, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: `0 8px 24px ${plan.color}40` }}
            >
              {t('register.continueWith') || 'Continuar con'} {planName(selectedPlan)} →
            </button>
          </div>
        )}

        {/* ── STEP 3: Payment ── */}
        {step === 'payment' && (
          <div style={{ background: cardBg, borderRadius: '24px', padding: '36px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: `1px solid ${border}` }}>

            {/* Plan summary bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: `${plan.color}08`, border: `1px solid ${plan.color}20`, borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: plan.color }}>{plan.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>{planName(selectedPlan)}</p>
                <p style={{ fontSize: '12px', color: textSub }}>
                  {plan.price === 0
                    ? t('register.freePlanNote') || '14 días gratis — cancela cuando quieras'
                    : `€${plan.price}/mes · ${t('register.cancelAnytime') || 'Cancela cuando quieras'}`
                  }
                </p>
              </div>
              <button onClick={() => setStep('plan')} style={{ fontSize: '12px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {t('register.change') || 'Cambiar'}
              </button>
            </div>

            {/* Visual card preview */}
            <div
              style={{ width: '100%', height: '185px', borderRadius: '16px', background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', padding: '20px 24px', marginBottom: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', boxSizing: 'border-box' }}
              onClick={() => setFlipped(!flipped)}
            >
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: '-50px', left: '-10px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              {!flipped ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EB001B', opacity: 0.9 }} />
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F79E1B', opacity: 0.9, marginLeft: '-10px' }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '700', letterSpacing: '2px' }}>{getCardBrand(card.number)}</span>
                  </div>
                  <p style={{ fontSize: '17px', fontWeight: '600', color: 'white', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'monospace' }}>
                    {card.number || '•••• •••• •••• ••••'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '2px' }}>TITULAR</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{card.name || 'NOMBRE APELLIDO'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '2px' }}>VENCE</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{card.expiry || 'MM/AA'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ position: 'absolute', top: '36px', left: 0, right: 0, height: '36px', background: 'rgba(0,0,0,0.6)' }} />
                  <div style={{ position: 'absolute', top: '84px', right: '24px', background: 'white', borderRadius: '6px', padding: '6px 14px' }}>
                    <p style={{ fontSize: '9px', color: '#64748B', marginBottom: '2px' }}>CVV</p>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace', letterSpacing: '3px' }}>{card.cvv || '•••'}</p>
                  </div>
                </>
              )}
              <p style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{t('register.tapToFlip') || 'Toca para girar'}</p>
            </div>

            {/* Card inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
              {/* Card name — only letters, blur validated */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSub, marginBottom: '6px', letterSpacing: '0.5px' }}>{t('register.cardName') || 'NOMBRE EN LA TARJETA'}</label>
                <input
                  value={card.name}
                  onChange={e => handleCardChange('name', e.target.value)}
                  onFocus={() => { setCardFocus('cardName'); setFlipped(false) }}
                  onBlur={() => handleCardBlur('name')}
                  placeholder="NOMBRE APELLIDO"
                  style={{ ...inputStyle('cardName', true), letterSpacing: '1px' }}
                />
                {cardErrors.name && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{cardErrors.name}</p>}
              </div>

              {/* Card number */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSub, marginBottom: '6px', letterSpacing: '0.5px' }}>{t('register.cardNumber') || 'NÚMERO DE TARJETA'}</label>
                <input
                  value={card.number}
                  onChange={e => handleCardChange('number', e.target.value)}
                  onFocus={() => { setCardFocus('number'); setFlipped(false) }}
                  onBlur={() => handleCardBlur('number')}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  style={{ ...inputStyle('number', true), fontFamily: 'monospace', letterSpacing: '2px', fontSize: '15px' }}
                />
                {cardErrors.number && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{cardErrors.number}</p>}
              </div>

              {/* Expiry + CVV */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSub, marginBottom: '6px', letterSpacing: '0.5px' }}>{t('register.cardExpiry') || 'FECHA EXPIRACIÓN'}</label>
                  <input
                    value={card.expiry}
                    onChange={e => handleCardChange('expiry', e.target.value)}
                    onFocus={() => { setCardFocus('expiry'); setFlipped(false) }}
                    onBlur={() => handleCardBlur('expiry')}
                    placeholder="MM/AA"
                    maxLength={5}
                    style={{ ...inputStyle('expiry', true), fontFamily: 'monospace', letterSpacing: '2px' }}
                  />
                  {cardErrors.expiry && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{cardErrors.expiry}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSub, marginBottom: '6px', letterSpacing: '0.5px' }}>CVV</label>
                  <input
                    value={card.cvv}
                    onChange={e => handleCardChange('cvv', e.target.value)}
                    onFocus={() => { setCardFocus('cvv'); setFlipped(true) }}
                    onBlur={() => handleCardBlur('cvv')}
                    placeholder="•••"
                    maxLength={4}
                    type="password"
                    style={inputStyle('cvv', true)}
                  />
                  {cardErrors.cvv && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{cardErrors.cvv}</p>}
                </div>
              </div>
            </div>

            {/* Cancel anytime notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: isDark ? 'rgba(16,185,129,0.08)' : '#ECFDF5', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10B981', flexShrink: 0 }}>info</span>
              <p style={{ fontSize: '12px', color: '#10B981', fontWeight: '500' }}>
                {plan.price === 0
                  ? (t('register.freeCancelNote') || '14 días gratis. Cancela antes de que terminen y no se te cobrará nada.')
                  : (t('register.cancelNote')     || 'Cancela cuando quieras. Sin permanencia ni penalizaciones.')
                }
              </p>
            </div>

            {cardErrors.general && (
              <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#F43F5E', fontSize: '13px' }}>
                {cardErrors.general}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('plan')} style={{ flex: 1, padding: '13px', background: 'none', border: `1px solid ${border}`, borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                ← {t('common.back') || 'Atrás'}
              </button>
              <button
                onClick={handlePay} disabled={paying}
                style={{ flex: 2, padding: '13px', background: paying ? textSub : plan.gradient, color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: paying ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: paying ? 'none' : `0 8px 24px ${plan.color}40` }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: paying ? 'spin 1s linear infinite' : 'none' }}>
                  {paying ? 'progress_activity' : 'lock'}
                </span>
                {paying
                  ? (t('register.processing') || 'Procesando...')
                  : plan.price === 0
                    ? (t('register.startFree') || 'Empezar gratis')
                    : `${t('register.pay') || 'Pagar'} €${plan.price}/mes`
                }
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: textSub }}>shield</span>
              <p style={{ fontSize: '11px', color: textSub }}>{t('register.securePayment') || 'Pago seguro SSL · Encriptación 256-bit'}</p>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default Register