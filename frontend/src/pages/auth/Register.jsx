import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PLANS = [
  { id: 'free',      icon: 'star',          color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #0EA5E9)', price: 0,  trialDays: 14 },
  { id: 'salesflow', icon: 'contacts',       color: '#2563EB', gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)', price: 29 },
  { id: 'full',      icon: 'rocket_launch',  color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #2563EB)', price: 49, popular: true },
  { id: 'stockflow', icon: 'inventory_2',    color: '#0EA5E9', gradient: 'linear-gradient(135deg, #0EA5E9, #10B981)', price: 29 },
]

function formatCardNumber(v) { return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }
function formatExpiry(v) { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d }
function getCardBrand(n) {
  const s = n.replace(/\s/g, '')
  if (s.startsWith('4')) return 'VISA'
  if (/^5[1-5]/.test(s) || /^2[2-7]/.test(s)) return 'MC'
  if (/^3[47]/.test(s)) return 'AMEX'
  return ''
}

export default function Register() {
  const { t }         = useTranslation()
  const { theme }     = useTheme()
  const { saveAuth }  = useAuth()
  const navigate      = useNavigate()
  const isDark        = theme === 'dark'

  // ── State ─────────────────────────────────────────────
  const [step, setStep]                       = useState('account')
  const [registeredUser, setRegisteredUser]   = useState(null)
  const [registeredToken, setRegisteredToken] = useState(null)
  const [selectedPlan, setSelectedPlan]       = useState('full')

  const [form, setForm] = useState({ name: '', email: '', password: '', business_name: '' })
  const [showPass, setShowPass]       = useState(false)
  const [errors, setErrors]           = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(false)

  const [verifyCode, setVerifyCode]   = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifying, setVerifying]     = useState(false)
  const [resending, setResending]     = useState(false)
  const [resendOk, setResendOk]       = useState(false)

  const [card, setCard]             = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [cardErrors, setCardErrors] = useState({})
  const [cardFocus, setCardFocus]   = useState('')
  const [paying, setPaying]         = useState(false)
  const [flipped, setFlipped]       = useState(false)

  // ── Theme ─────────────────────────────────────────────
  const bg      = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg  = isDark ? '#1E293B' : '#FFFFFF'
  const border  = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[2]

  // ── Steps ─────────────────────────────────────────────
 const STEPS = [
  { key: 'account', label: t('register.stepAccount') || 'Cuenta',    icon: 'person' },
  { key: 'verify',  label: t('register.stepVerify')  || 'Verificar', icon: 'mark_email_read' },
  { key: 'plan',    label: t('register.stepPlan')    || 'Plan',      icon: 'star' },
  { key: 'payment', label: t('register.stepPayment') || 'Pago',      icon: 'credit_card' },
]
  const stepIdx    = { account: 0, verify: 1, plan: 2, payment: 3, done: 4 }
  const currentIdx = stepIdx[step] ?? 0

  // ── Helpers ───────────────────────────────────────────
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

  function validateField(name, value) {
    if (name === 'name') {
      if (!value.trim()) return 'El nombre es obligatorio'
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Solo letras, sin números'
    }
    if (name === 'business_name' && !value.trim()) return 'El nombre de empresa es obligatorio'
    if (name === 'email') {
      if (!value.trim()) return 'El email es obligatorio'
      if (!/\S+@\S+\.\S+/.test(value)) return 'Email no válido'
    }
    if (name === 'password') {
      if (!value) return 'La contraseña es obligatoria'
      if (value.length < 8) return 'Mínimo 8 caracteres'
    }
    return ''
  }

  function validateCardName(value) {
    if (!value.trim()) return 'Nombre requerido'
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Solo letras'
    return ''
  }

  const inputStyle = (field, isCard = false) => ({
    width: '100%', padding: '12px 14px',
    border: `1.5px solid ${(isCard ? cardErrors[field] : errors[field]) ? '#F43F5E' : cardFocus === field ? '#2563EB' : border}`,
    borderRadius: '10px', fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    background: inputBg, color: textMain,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  })

  // ── Handlers ──────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  function handleBlur(e) {
    const { name, value } = e.target
    setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  function handleCardChange(field, value) {
    let v = value
    if (field === 'number') v = formatCardNumber(value)
    if (field === 'expiry') v = formatExpiry(value)
    if (field === 'cvv')    v = value.replace(/\D/g, '').slice(0, 4)
    if (field === 'name')   v = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toUpperCase()
    setCard(c => ({ ...c, [field]: v }))
    if (cardErrors[field]) setCardErrors(p => ({ ...p, [field]: '' }))
  }

  function handleCardBlur(field) {
    if (field === 'name') {
      const err = validateCardName(card.name)
      if (err) setCardErrors(p => ({ ...p, name: err }))
    }
    if (field === 'number') {
      const digits = card.number.replace(/\s/g, '')
      if (digits.length > 0 && digits.length < 16)
        setCardErrors(p => ({ ...p, number: 'Número inválido' }))
    }
    if (field === 'expiry' && card.expiry.length > 0) {
      if (!card.expiry.match(/^\d{2}\/\d{2}$/)) {
        setCardErrors(p => ({ ...p, expiry: 'Formato inválido (MM/AA)' }))
      } else {
        const [mm, yy] = card.expiry.split('/').map(Number)
        if (mm < 1 || mm > 12) setCardErrors(p => ({ ...p, expiry: 'Mes inválido' }))
        else if (new Date(2000 + yy, mm - 1) < new Date()) setCardErrors(p => ({ ...p, expiry: 'Tarjeta expirada' }))
      }
    }
    if (field === 'cvv' && card.cvv.length > 0 && card.cvv.length < 3)
      setCardErrors(p => ({ ...p, cvv: 'CVV inválido' }))
    setCardFocus('')
  }

  // ── STEP 1: Register ──────────────────────────────────
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
      const res  = await fetch(`${API}/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, plan: 'free' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrar')
      setRegisteredUser(data.user)
      setRegisteredToken(data.token)
      setStep('verify')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── STEP 2: Verify email ──────────────────────────────
  async function handleVerify() {
    if (verifyCode.length !== 6) { setVerifyError('El código debe tener 6 dígitos'); return }
    setVerifying(true)
    setVerifyError('')
    try {
      const res  = await fetch(`${API}/verify-email`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: registeredUser?.email, code: verifyCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Código incorrecto')
      setRegisteredToken(data.token)
      setStep('plan')
    } catch (err) {
      setVerifyError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setResendOk(false)
    try {
      await fetch(`${API}/resend-code`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: registeredUser?.email }),
      })
      setResendOk(true)
      setTimeout(() => setResendOk(false), 4000)
    } catch {}
    setResending(false)
  }

  // ── STEP 4: Payment ───────────────────────────────────
  function validateCard() {
    const e = {}
    const nameErr = validateCardName(card.name)
    if (nameErr) e.name = nameErr
    const digits = card.number.replace(/\s/g, '')
    if (digits.length < 16) e.number = 'Número inválido'
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) {
      e.expiry = 'Fecha inválida (MM/AA)'
    } else {
      const [mm, yy] = card.expiry.split('/').map(Number)
      if (mm < 1 || mm > 12) e.expiry = 'Mes inválido'
      else if (new Date(2000 + yy, mm - 1) < new Date()) e.expiry = 'Tarjeta expirada'
    }
    if (card.cvv.length < 3) e.cvv = 'CVV inválido'
    setCardErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePay() {
    if (!validateCard()) return
    setPaying(true)
    try {
      await new Promise(r => setTimeout(r, 1800))

      // Update plan
      await fetch(`${API}/business/subscription`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${registeredToken}` },
        body:    JSON.stringify({ plan: selectedPlan }),
      })

      setStep('done')
    } catch {
      setStep('done')
    } finally {
      setPaying(false)
    }
  }

  // ── DONE ─────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <div style={{ background: cardBg, borderRadius: '24px', padding: '48px 32px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: `1px solid ${border}` }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'white' }}>check</span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: textMain, marginBottom: '10px' }}>¡Todo listo! 🎉</h2>
          <p style={{ fontSize: '15px', color: textSub, marginBottom: '24px', lineHeight: 1.6 }}>
            Tu cuenta ha sido creada y verificada. Hemos enviado un email de confirmación.
          </p>
          <div style={{ background: isDark ? '#0F172A' : '#F8FAFC', border: `1px solid ${border}`, borderRadius: '12px', padding: '16px', marginBottom: '28px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: textSub }}>Email</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: textMain }}>{registeredUser?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: textSub }}>Plan</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: plan.color }}>{planName(selectedPlan)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Iniciar sesión →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: step === 'plan' ? '900px' : '480px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>
            Salesek
          </div>
          <p style={{ fontSize: '13px', color: textSub }}>
            {step === 'account' && 'Crea tu cuenta gratis'}
            {step === 'verify'  && 'Verifica tu email'}
            {step === 'plan'    && 'Elige tu plan'}
            {step === 'payment' && 'Datos de pago'}
          </p>
        </div>

        {/* Steps indicator — responsive */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', gap: '0' }}>
          {STEPS.map((s, i) => {
            const done   = i < currentIdx
            const active = i === currentIdx
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: done ? '#10B981' : active ? '#2563EB' : (isDark ? '#334155' : '#E2E8F0'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s',
                    boxShadow: active ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none',
                  }}>
                    {done
                      ? <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'white' }}>check</span>
                     : <span className="material-symbols-outlined" style={{ fontSize: '16px', color: active ? 'white' : textSub }}>{s.icon}</span>
                    }
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: active ? '700' : '500',
                    color: active ? textMain : textSub,
                    whiteSpace: 'nowrap',
                    display: window.innerWidth < 400 ? 'none' : 'block'
                  }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: '40px', height: '2px', background: done ? '#10B981' : (isDark ? '#334155' : '#E2E8F0'), borderRadius: '99px', margin: '0 4px', marginBottom: '14px' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* ── STEP 1: Account ── */}
        {step === 'account' && (
          <div style={{ background: cardBg, borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: `1px solid ${border}` }}>
            {serverError && (
              <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '13px' }}>
                {serverError}
              </div>
            )}
            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>Nombre</label>
                  <input style={inputStyle('name')} name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder="Juan García" onFocus={() => setCardFocus('name')} />
                  {errors.name && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>Nombre de tu empresa</label>
                  <input style={inputStyle('business_name')} name="business_name" value={form.business_name} onChange={handleChange} onBlur={handleBlur} placeholder="Mi Empresa S.L." />
                  {errors.business_name && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.business_name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>Email</label>
                  <input style={inputStyle('email')} name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="tu@empresa.com" />
                  {errors.email && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inputStyle('password'), paddingRight: '44px' }}
                      name="password" type={showPass ? 'text' : 'password'}
                      value={form.password} onChange={handleChange} onBlur={handleBlur}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textSub, display: 'flex', alignItems: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {errors.password && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '20px', padding: '14px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading
                  ? <><span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>progress_activity</span>Creando cuenta...</>
                  : <>Continuar →</>
                }
              </button>

              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: textSub }}>
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>Inicia sesión</Link>
              </p>
            </form>
          </div>
        )}

        {/* ── STEP 2: Verify email ── */}
        {step === 'verify' && (
          <div style={{ background: cardBg, borderRadius: '24px', padding: '36px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: `1px solid ${border}`, textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(37,99,235,0.35)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'white' }}>mark_email_unread</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: textMain, marginBottom: '8px' }}>Verifica tu email</h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '4px', lineHeight: 1.6 }}>
              Hemos enviado un código de 6 dígitos a
            </p>
            <p style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '28px' }}>
              {registeredUser?.email}
            </p>

            <input
              value={verifyCode}
              onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setVerifyError('') }}
              placeholder="000000"
              maxLength={6}
              style={{
                width: '100%', padding: '16px', textAlign: 'center',
                fontSize: '32px', fontWeight: '800', letterSpacing: '12px',
                fontFamily: 'monospace',
                border: `2px solid ${verifyError ? '#F43F5E' : verifyCode.length === 6 ? '#10B981' : border}`,
                borderRadius: '14px', background: inputBg, color: textMain,
                outline: 'none', boxSizing: 'border-box', marginBottom: '12px',
                transition: 'border-color 0.2s',
              }}
            />

            {verifyError && <p style={{ color: '#F43F5E', fontSize: '13px', marginBottom: '12px' }}>{verifyError}</p>}

            <button
              onClick={handleVerify}
              disabled={verifying || verifyCode.length !== 6}
              style={{
                width: '100%', padding: '14px',
                background: verifyCode.length === 6 ? 'linear-gradient(135deg, #10B981, #0EA5E9)' : (isDark ? '#334155' : '#E2E8F0'),
                color: verifyCode.length === 6 ? 'white' : textSub,
                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
                cursor: verifyCode.length === 6 && !verifying ? 'pointer' : 'not-allowed',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginBottom: '16px', transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: verifying ? 'spin 1s linear infinite' : 'none' }}>
                {verifying ? 'progress_activity' : 'check_circle'}
              </span>
              {verifying ? 'Verificando...' : 'Verificar email'}
            </button>

            {resendOk && (
              <p style={{ color: '#10B981', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                ✓ Código reenviado correctamente
              </p>
            )}

            <button
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: resending ? 0.6 : 1 }}
            >
              {resending ? 'Reenviando...' : '¿No recibiste el código? Reenviar →'}
            </button>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${border}` }}>
              <p style={{ fontSize: '12px', color: textSub }}>
                ¿Email incorrecto?{' '}
                <button onClick={() => setStep('account')} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Volver atrás
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Plan ── */}
        {step === 'plan' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ background: cardBg, border: `2px solid ${selectedPlan === p.id ? p.color : border}`, borderRadius: '20px', padding: '24px 20px', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', boxShadow: selectedPlan === p.id ? `0 8px 32px ${p.color}30` : '0 2px 8px rgba(0,0,0,0.06)', transform: selectedPlan === p.id ? 'translateY(-4px)' : 'translateY(0)' }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #F59E0B, #F43F5E)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 12px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                      ⭐ Más popular
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selectedPlan === p.id ? p.color : border}`, background: selectedPlan === p.id ? p.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedPlan === p.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', display: 'block' }} />}
                  </div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: p.color }}>{p.icon}</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: textMain, marginBottom: '4px' }}>{planName(p.id)}</p>
                  <p style={{ fontSize: '12px', color: textSub, marginBottom: '16px', lineHeight: 1.4 }}>{planDesc(p.id)?.slice(0, 55)}...</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    {p.price === 0
                      ? <span style={{ fontSize: '22px', fontWeight: '800', color: p.color }}>Gratis</span>
                      : <><span style={{ fontSize: '28px', fontWeight: '800', color: p.color }}>€{p.price}</span><span style={{ fontSize: '12px', color: textSub }}>/mes</span></>
                    }
                  </div>
                  {p.trialDays && <p style={{ fontSize: '11px', color: p.color, fontWeight: '600', marginTop: '6px' }}>✓ {p.trialDays} días gratis</p>}
                </div>
              ))}
            </div>
            <button onClick={() => setStep('payment')} style={{ width: '100%', padding: '14px', background: plan.gradient, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: `0 8px 24px ${plan.color}40` }}>
              Continuar con {planName(selectedPlan)} →
            </button>
          </div>
        )}

        {/* ── STEP 4: Payment ── */}
        {step === 'payment' && (
          <div style={{ background: cardBg, borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: `1px solid ${border}` }}>

            {/* Plan summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: `${plan.color}08`, border: `1px solid ${plan.color}20`, borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: plan.color }}>{plan.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>{planName(selectedPlan)}</p>
                <p style={{ fontSize: '12px', color: textSub }}>{plan.price === 0 ? '14 días gratis — cancela cuando quieras' : `€${plan.price}/mes · Cancela cuando quieras`}</p>
              </div>
              <button onClick={() => setStep('plan')} style={{ fontSize: '12px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Cambiar</button>
            </div>

            {/* Card preview */}
            <div style={{ width: '100%', height: '170px', borderRadius: '16px', background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', padding: '20px 24px', marginBottom: '20px', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', boxSizing: 'border-box' }} onClick={() => setFlipped(!flipped)}>
              {!flipped ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#EB001B', opacity: 0.9 }} />
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#F79E1B', opacity: 0.9, marginLeft: '-8px' }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', letterSpacing: '2px' }}>{getCardBrand(card.number)}</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'white', letterSpacing: '3px', marginBottom: '14px', fontFamily: 'monospace' }}>{card.number || '•••• •••• •••• ••••'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '2px' }}>TITULAR</p>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>{card.name || 'NOMBRE APELLIDO'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '2px' }}>VENCE</p>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>{card.expiry || 'MM/AA'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ position: 'absolute', top: '32px', left: 0, right: 0, height: '36px', background: 'rgba(0,0,0,0.6)' }} />
                  <div style={{ position: 'absolute', top: '78px', right: '24px', background: 'white', borderRadius: '6px', padding: '6px 14px' }}>
                    <p style={{ fontSize: '9px', color: '#64748B', marginBottom: '2px' }}>CVV</p>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace', letterSpacing: '3px' }}>{card.cvv || '•••'}</p>
                  </div>
                </>
              )}
              <p style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Toca para girar</p>
            </div>

            {/* Card inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>NOMBRE EN LA TARJETA</label>
                <input value={card.name} onChange={e => handleCardChange('name', e.target.value)} onFocus={() => { setCardFocus('cardName'); setFlipped(false) }} onBlur={() => handleCardBlur('name')} placeholder="NOMBRE APELLIDO" style={{ ...inputStyle('cardName', true), letterSpacing: '1px' }} />
                {cardErrors.name && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{cardErrors.name}</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>NÚMERO DE TARJETA</label>
                <input value={card.number} onChange={e => handleCardChange('number', e.target.value)} onFocus={() => { setCardFocus('number'); setFlipped(false) }} onBlur={() => handleCardBlur('number')} placeholder="1234 5678 9012 3456" maxLength={19} style={{ ...inputStyle('number', true), fontFamily: 'monospace', letterSpacing: '2px', fontSize: '15px' }} />
                {cardErrors.number && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{cardErrors.number}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>FECHA EXPIRACIÓN</label>
                  <input value={card.expiry} onChange={e => handleCardChange('expiry', e.target.value)} onFocus={() => { setCardFocus('expiry'); setFlipped(false) }} onBlur={() => handleCardBlur('expiry')} placeholder="MM/AA" maxLength={5} style={{ ...inputStyle('expiry', true), fontFamily: 'monospace', letterSpacing: '2px' }} />
                  {cardErrors.expiry && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{cardErrors.expiry}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSub, marginBottom: '6px' }}>CVV</label>
                  <input value={card.cvv} onChange={e => handleCardChange('cvv', e.target.value)} onFocus={() => { setCardFocus('cvv'); setFlipped(true) }} onBlur={() => handleCardBlur('cvv')} placeholder="•••" maxLength={4} type="password" style={inputStyle('cvv', true)} />
                  {cardErrors.cvv && <p style={{ color: '#F43F5E', fontSize: '12px', marginTop: '4px' }}>{cardErrors.cvv}</p>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: isDark ? 'rgba(16,185,129,0.08)' : '#ECFDF5', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10B981', flexShrink: 0 }}>info</span>
              <p style={{ fontSize: '12px', color: '#10B981', fontWeight: '500' }}>
                {plan.price === 0 ? '14 días gratis. Cancela antes y no se te cobrará nada.' : 'Cancela cuando quieras. Sin permanencia ni penalizaciones.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('plan')} style={{ flex: 1, padding: '13px', background: 'none', border: `1px solid ${border}`, borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                ← Atrás
              </button>
              <button onClick={handlePay} disabled={paying} style={{ flex: 2, padding: '13px', background: paying ? textSub : plan.gradient, color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: paying ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: paying ? 'none' : `0 8px 24px ${plan.color}40` }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: paying ? 'spin 1s linear infinite' : 'none' }}>{paying ? 'progress_activity' : 'lock'}</span>
                {paying ? 'Procesando...' : plan.price === 0 ? 'Empezar gratis' : `Pagar €${plan.price}/mes`}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: textSub }}>shield</span>
              <p style={{ fontSize: '11px', color: textSub }}>Pago seguro SSL · Encriptación 256-bit</p>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}