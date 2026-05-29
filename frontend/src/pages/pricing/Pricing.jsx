import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { selectPlan } from '../../services/authService'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Pricing() {
  const { t }                     = useTranslation()
  const { theme }                 = useTheme()
  const { token, user, saveAuth } = useAuth()
  const navigate                  = useNavigate()
  const isDark                    = theme === 'dark'

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPayment,  setShowPayment]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState(false)
  const [activeTip,    setActiveTip]    = useState(null)

  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [cardError, setCardError] = useState('')
  const [cardFocus, setCardFocus] = useState('')

  const bg       = isDark ? '#0F172A' : '#F8FAFC'
  const cardBg   = isDark ? '#1E293B' : '#FFFFFF'
  const border   = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'

  const plans = [
    {
      id:       'salesflow',
      whyKey:   'Salesflow',
      name:     'SalesFlow',
      role:     t('pricing.plans.salesflow.name') || 'SalesFlow',
      price:    29,
      color:    '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
      icon:     'contacts',
      desc:     t('pricing.plans.salesflow.desc'),
      badge:    null,
      features: [
        t('pricing.plans.salesflow.f1'),
        t('pricing.plans.salesflow.f2'),
        t('pricing.plans.salesflow.f3'),
        t('pricing.plans.salesflow.f4'),
        t('pricing.plans.salesflow.f5'),
        t('pricing.plans.salesflow.f6'),
        t('pricing.plans.salesflow.f7'),
        t('pricing.plans.salesflow.f8'),
      ],
    },
    {
      id:       'full',
      whyKey:   'Suite',
      name:     'Suite Completa',
      role:     t('pricing.plans.suite.name') || 'Suite Completa',
      price:    49,
      color:    '#7C3AED',
      gradient: 'linear-gradient(135deg, #7C3AED, #2563EB)',
      icon:     'rocket_launch',
      desc:     t('pricing.plans.suite.desc'),
      badge:    t('pricing.popular') || 'Más popular',
      features: [
        t('pricing.plans.suite.f1'),
        t('pricing.plans.suite.f2'),
        t('pricing.plans.suite.f3'),
        t('pricing.plans.suite.f4'),
        t('pricing.plans.suite.f5'),
        t('pricing.plans.suite.f6'),
        t('pricing.plans.suite.f7'),
        t('pricing.plans.suite.f8'),
        t('pricing.plans.suite.f9'),
        t('pricing.plans.suite.f10'),
      ],
    },
    {
      id:       'stockflow',
      whyKey:   'Stockflow',
      name:     'StockFlow',
      role:     t('pricing.plans.stockflow.name') || 'StockFlow',
      price:    29,
      color:    '#10B981',
      gradient: 'linear-gradient(135deg, #10B981, #0EA5E9)',
      icon:     'inventory_2',
      desc:     t('pricing.plans.stockflow.desc'),
      badge:    null,
      features: [
        t('pricing.plans.stockflow.f1'),
        t('pricing.plans.stockflow.f2'),
        t('pricing.plans.stockflow.f3'),
        t('pricing.plans.stockflow.f4'),
        t('pricing.plans.stockflow.f5'),
        t('pricing.plans.stockflow.f6'),
        t('pricing.plans.stockflow.f7'),
        t('pricing.plans.stockflow.f8'),
      ],
    },
  ]

  function formatCardNumber(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  function getCardBrand(number) {
    const n = number.replace(/\s/g, '')
    if (n.startsWith('4')) return 'visa'
    if (n.startsWith('5') || n.startsWith('2')) return 'mastercard'
    if (n.startsWith('34') || n.startsWith('37')) return 'amex'
    return 'generic'
  }

  function validateCard() {
    if (!card.name.trim()) return t('pricing.errorCardName') || 'El nombre en la tarjeta es obligatorio'
    const digits = card.number.replace(/\s/g, '')
    if (digits.length < 16) return t('pricing.errorCardNumber') || 'Número de tarjeta inválido'
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) return t('pricing.errorCardExpiry') || 'Fecha de expiración inválida (MM/AA)'
    const [mm, yy] = card.expiry.split('/').map(Number)
    if (mm < 1 || mm > 12) return t('pricing.errorCardMonth') || 'Mes inválido'
    if (new Date(2000 + yy, mm - 1) < new Date()) return t('pricing.errorCardExpired') || 'La tarjeta ha expirado'
    if (card.cvv.length < 3) return t('pricing.errorCardCvv') || 'CVV inválido'
    return null
  }

  async function handlePay() {
    const err = validateCard()
    if (err) { setCardError(err); return }
    setCardError('')
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1800))
      await selectPlan(selectedPlan.id, token)
      saveAuth(token, { ...user, plan: selectedPlan.id })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (e) {
      setCardError(e.message || 'Error procesando el pago')
    } finally {
      setLoading(false)
    }
  }

  function openPayment(plan) {
    navigate('/payment', { state: { planId: plan.id } })
  }

  const brand = selectedPlan ? getCardBrand(card.number) : 'generic'

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '40px 20px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '99px', padding: '6px 16px', marginBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>verified</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>{t('pricing.badge')}</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: textMain, letterSpacing: '-1px', marginBottom: '12px' }}>
          {t('pricing.title')}
        </h1>
        <p style={{ fontSize: '16px', color: textSub, maxWidth: '500px', margin: '0 auto 16px' }}>
          {t('pricing.subtitle')}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '20px', background: isDark ? '#1E293B' : 'white', border: `1px solid ${border}`, borderRadius: '99px', padding: '8px 20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: 'check_circle',    text: t('pricing.free') },
            { icon: 'credit_card_off', text: t('pricing.noCard') },
            { icon: 'lock',            text: 'SSL' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10B981' }}>{item.icon}</span>
              <span style={{ fontSize: '13px', color: textSub, fontWeight: '500' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plans grid */}
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '1100px', margin: '0 auto' }}>
        {plans.map(plan => (
          <div
            key={plan.id}
            style={{
              background: plan.badge ? plan.gradient : cardBg,
              border: `2px solid ${plan.badge ? 'transparent' : border}`,
              borderRadius: '24px', padding: '32px', width: '300px',
              position: 'relative',
              boxShadow: plan.badge ? '0 20px 60px rgba(124,58,237,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
              transform: plan.badge ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { if (!plan.badge) e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseLeave={e => { if (!plan.badge) e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {/* Popular badge */}
            {plan.badge && (
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #F59E0B, #F43F5E)', color: 'white', padding: '4px 18px', borderRadius: '99px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                ⭐ {plan.badge}
              </div>
            )}

            {/* Why tooltip button */}
            <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
              <button
                onMouseEnter={() => setActiveTip(plan.id)}
                onMouseLeave={() => setActiveTip(null)}
                onClick={() => setActiveTip(activeTip === plan.id ? null : plan.id)}
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: plan.badge ? 'rgba(255,255,255,0.2)' : (isDark ? '#334155' : '#F1F5F9'),
                  border: plan.badge ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${border}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: plan.badge ? 'white' : textSub,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>help</span>
              </button>

              {activeTip === plan.id && (
                <div style={{
                  position: 'absolute', top: '32px', right: 0,
                  background: isDark ? '#1E293B' : 'white',
                  border: `1px solid ${border}`,
                  borderRadius: '16px', padding: '16px', width: '240px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 20,
                  animation: 'slideUp 0.2s ease',
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '800', color: textMain, marginBottom: '8px' }}>
                    {t(`pricing.why${plan.whyKey}`)}
                  </p>
                  <p style={{ fontSize: '12px', color: textSub, lineHeight: '1.6', marginBottom: '10px' }}>
                    {t(`pricing.why${plan.whyKey}Desc`)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(t(`pricing.why${plan.whyKey}Items`, { returnObjects: true }) || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: plan.color }}>check_circle</span>
                        <span style={{ fontSize: '12px', color: textMain, fontWeight: '500' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Icon + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingRight: '32px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: plan.badge ? 'rgba(255,255,255,0.2)' : `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: plan.badge ? 'white' : plan.color }}>{plan.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: '18px', fontWeight: '800', color: plan.badge ? 'white' : textMain }}>{plan.role}</p>
                <p style={{ fontSize: '12px', color: plan.badge ? 'rgba(255,255,255,0.7)' : textSub }}>{plan.desc?.slice(0, 50)}...</p>
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800', color: plan.badge ? 'white' : textMain, letterSpacing: '-2px' }}>€{plan.price}</span>
                <span style={{ fontSize: '14px', color: plan.badge ? 'rgba(255,255,255,0.7)' : textSub }}>{t('pricing.month')}</span>
              </div>
              <p style={{ fontSize: '12px', color: plan.badge ? 'rgba(255,255,255,0.6)' : textSub, marginTop: '4px' }}>
                {t('pricing.noVat')} · {t('pricing.noPermanence')}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => openPayment(plan)}
              style={{
                width: '100%', padding: '14px', marginBottom: '24px',
                background: plan.badge ? 'white' : plan.gradient,
                color: plan.badge ? plan.color : 'white',
                border: 'none', borderRadius: '12px',
                fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: plan.badge ? '0 4px 16px rgba(255,255,255,0.3)' : `0 4px 16px ${plan.color}40`,
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {plan.badge ? t('pricing.ctaSuite') : t('pricing.cta')}
            </button>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: plan.badge ? 'rgba(255,255,255,0.8)' : plan.color, flexShrink: 0 }}>check_circle</span>
                  <span style={{ fontSize: '13px', color: plan.badge ? 'rgba(255,255,255,0.85)' : textSub }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PAYMENT MODAL */}
      {showPayment && selectedPlan && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(4px)' }}
          onClick={() => !loading && setShowPayment(false)}
        >
          <div
            style={{ background: cardBg, borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', border: `1px solid ${border}`, animation: 'slideUp 0.3s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'white' }}>check</span>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: textMain, marginBottom: '8px' }}>{t('pricing.paymentCompleted')}</h3>
                <p style={{ fontSize: '14px', color: textSub }}>{t('pricing.redirecting')}</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: textMain }}>{t('pricing.securePayment')}</h2>
                    <p style={{ fontSize: '13px', color: textSub, marginTop: '2px' }}>
                      {selectedPlan.role} · €{selectedPlan.price}{t('pricing.month')}
                    </p>
                  </div>
                  <button onClick={() => setShowPayment(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${border}`, background: 'none', cursor: 'pointer', color: textSub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>

                {/* Card preview */}
                <div style={{ background: selectedPlan.gradient, borderRadius: '16px', padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 32px ${selectedPlan.color}40` }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ position: 'absolute', bottom: '-30px', right: '40px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '28px', background: 'rgba(255,255,255,0.9)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '24px', height: '16px', borderRadius: '2px', background: 'linear-gradient(135deg, #F59E0B, #F43F5E)' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: '2px' }}>
                      {brand === 'visa' ? 'VISA' : brand === 'mastercard' ? 'MC' : brand === 'amex' ? 'AMEX' : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: 'white', letterSpacing: '3px', marginBottom: '16px' }}>
                    {card.number || '•••• •••• •••• ••••'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px', letterSpacing: '1px' }}>{t('pricing.cardHolder')}</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{card.name || 'NOMBRE APELLIDO'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px', letterSpacing: '1px' }}>{t('pricing.cardExpires')}</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{card.expiry || 'MM/AA'}</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>{t('pricing.cardName')}</label>
                    <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))} onFocus={() => setCardFocus('name')} onBlur={() => setCardFocus('')} placeholder="JUAN GARCIA" style={{ width: '100%', padding: '12px 14px', border: `2px solid ${cardFocus === 'name' ? selectedPlan.color : border}`, borderRadius: '10px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: textMain, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', letterSpacing: '1px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>{t('pricing.cardNumber')}</label>
                    <div style={{ position: 'relative' }}>
                      <input value={card.number} onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))} onFocus={() => setCardFocus('number')} onBlur={() => setCardFocus('')} placeholder="1234 5678 9012 3456" maxLength={19} style={{ width: '100%', padding: '12px 44px 12px 14px', border: `2px solid ${cardFocus === 'number' ? selectedPlan.color : border}`, borderRadius: '10px', fontSize: '16px', fontFamily: 'monospace', background: inputBg, color: textMain, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', letterSpacing: '2px' }} />
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: textSub }}>credit_card</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>{t('pricing.cardExpiry')}</label>
                      <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))} onFocus={() => setCardFocus('expiry')} onBlur={() => setCardFocus('')} placeholder="MM/AA" maxLength={5} style={{ width: '100%', padding: '12px 14px', border: `2px solid ${cardFocus === 'expiry' ? selectedPlan.color : border}`, borderRadius: '10px', fontSize: '15px', fontFamily: 'monospace', background: inputBg, color: textMain, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', letterSpacing: '2px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>CVV</label>
                      <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} onFocus={() => setCardFocus('cvv')} onBlur={() => setCardFocus('')} placeholder="•••" maxLength={4} type="password" style={{ width: '100%', padding: '12px 14px', border: `2px solid ${cardFocus === 'cvv' ? selectedPlan.color : border}`, borderRadius: '10px', fontSize: '15px', fontFamily: 'monospace', background: inputBg, color: textMain, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
                    </div>
                  </div>
                </div>

                {cardError && (
                  <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#F43F5E', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                    {cardError}
                  </div>
                )}

                <button onClick={handlePay} disabled={loading} style={{ width: '100%', padding: '16px', background: loading ? textSub : selectedPlan.gradient, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: loading ? 'none' : `0 8px 24px ${selectedPlan.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                  {loading ? (
                    <><span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>progress_activity</span>{t('pricing.processing')}</>
                  ) : (
                    <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock</span>
                    {t('pricing.pay') || 'Pagar'} €{selectedPlan.price}{t('pricing.month')}</>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: textSub }}>shield</span>
                  <p style={{ fontSize: '12px', color: textSub, textAlign: 'center' }}>{t('pricing.secureNote')}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

export default Pricing