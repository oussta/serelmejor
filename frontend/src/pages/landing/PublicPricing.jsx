import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import PublicNavbar from '../../components/layout/PublicNavbar'
import PublicFooter from '../../components/layout/PublicFooter'
import { useTheme } from '../../context/ThemeContext'

function PublicPricing() {
  const navigate        = useNavigate()
  const { t }           = useTranslation()
  const { theme }       = useTheme()
  const isDark          = theme === 'dark'
  const [openFaq, setOpenFaq] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const bg         = isDark ? '#0F172A' : '#F8FAFC'
  const text       = isDark ? '#F1F5F9' : '#0F172A'
  const textSub    = isDark ? '#94A3B8' : '#64748B'
  const cardBg     = isDark ? '#1E293B' : '#ffffff'
  const cardBorder = isDark ? '#334155' : '#E2E8F0'

  const plans = [
    {
      name:         t('pricing.plans.salesflow.name'),
      nickname:     'El Vendedor',
      emoji:        '🎯',
      nickSub:      t('pricing.plans.salesflow.desc'),
      price:        '29',
      desc:         t('pricing.plans.salesflow.desc'),
      color:        '#2563EB',
      colorLight:   'rgba(37,99,235,0.08)',
      gradient:     'linear-gradient(135deg, #2563EB, #0EA5E9)',
      icon:         'contacts',
      popular:      false,
      highlight:    'Ideal si solo necesitas CRM',
      tooltipTitle: t('pricing.tooltips.salesflowTitle'),
      tooltipText:  t('pricing.tooltips.salesflowText'),
      tooltipItems: t('pricing.tooltips.salesflowItems', { returnObjects: true }) || [],
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
      name:         t('pricing.plans.suite.name'),
      nickname:     'El Completo',
      emoji:        '🚀',
      nickSub:      t('pricing.plans.suite.desc'),
      price:        '49',
      desc:         t('pricing.plans.suite.desc'),
      color:        '#2563EB',
      colorLight:   'rgba(255,255,255,0.15)',
      gradient:     'linear-gradient(135deg, #1D4ED8, #2563EB)',
      icon:         'rocket_launch',
      popular:      true,
      highlight:    'Ahorra €9/mes vs comprar por separado',
      tooltipTitle: t('pricing.tooltips.suiteTitle'),
      tooltipText:  t('pricing.tooltips.suiteText'),
      tooltipItems: t('pricing.tooltips.suiteItems', { returnObjects: true }) || [],
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
      name:         t('pricing.plans.stockflow.name'),
      nickname:     'El Almacenista',
      emoji:        '📦',
      nickSub:      t('pricing.plans.stockflow.desc'),
      price:        '29',
      desc:         t('pricing.plans.stockflow.desc'),
      color:        '#0EA5E9',
      colorLight:   'rgba(14,165,233,0.08)',
      gradient:     'linear-gradient(135deg, #0EA5E9, #06B6D4)',
      icon:         'inventory_2',
      popular:      false,
      highlight:    'Ideal si solo necesitas inventario',
      tooltipTitle: t('pricing.tooltips.stockflowTitle'),
      tooltipText:  t('pricing.tooltips.stockflowText'),
      tooltipItems: t('pricing.tooltips.stockflowItems', { returnObjects: true }) || [],
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

  const faqs = [
    { q: t('pricing.faqs.q1'), a: t('pricing.faqs.a1') },
    { q: t('pricing.faqs.q2'), a: t('pricing.faqs.a2') },
    { q: t('pricing.faqs.q3'), a: t('pricing.faqs.a3') },
    { q: t('pricing.faqs.q4'), a: t('pricing.faqs.a4') },
    { q: t('pricing.faqs.q5'), a: t('pricing.faqs.a5') },
    { q: t('pricing.faqs.q6'), a: t('pricing.faqs.a6') },
  ]

  const trust = [
    { icon: 'lock',          label: t('pricing.trust.secure'),  sub: 'JWT + bcrypt + HTTPS' },
    { icon: 'cancel',        label: t('pricing.trust.noBind'),  sub: t('pricing.noPermanence') },
    { icon: 'support_agent', label: t('pricing.trust.support'), sub: t('pricing.trust.supportSub') },
    { icon: 'update',        label: t('pricing.trust.updated'), sub: t('pricing.trust.updatedSub') },
  ]

  const tableRows = [
    { feature: t('pricing.table.crm'),        s: true,  suite: true,  st: false },
    { feature: t('pricing.table.followups'),  s: true,  suite: true,  st: false },
    { feature: t('pricing.table.ai'),         s: true,  suite: true,  st: false },
    { feature: t('pricing.table.inventory'),  s: false, suite: true,  st: true  },
    { feature: t('pricing.table.alerts'),     s: false, suite: true,  st: true  },
    { feature: t('pricing.table.orders'),     s: false, suite: true,  st: true  },
    { feature: t('pricing.table.bridge'),     s: false, suite: true,  st: false },
    { feature: t('pricing.table.supplier'),   s: false, suite: true,  st: true  },
    { feature: t('pricing.table.realtime'),   s: false, suite: true,  st: false },
    { feature: t('pricing.table.users'),      s: '1',   suite: '10',  st: '1'   },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <Helmet>
        <title>Precios — Salesek | CRM e inventario para pymes desde 29€/mes</title>
        <meta name="description" content="Planes desde 29€/mes. SalesFlow CRM, StockFlow inventario o la Suite Completa con The Bridge. 14 días gratis, sin tarjeta, sin permanencia." />
        <link rel="canonical" href="https://salsek.com/precios" />
      </Helmet>

      <PublicNavbar />

      {/* ── HERO ── */}
      <section style={{ padding: '80px 24px 64px', textAlign: 'center', background: isDark ? '#0F172A' : 'white', borderBottom: `1px solid ${cardBorder}` }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', marginBottom: '24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>sell</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB', letterSpacing: '0.02em' }}>{t('pricing.badge').toUpperCase()}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '800', color: text, marginBottom: '16px', lineHeight: '1.15', letterSpacing: '-0.03em' }}>
            {t('pricing.title')}
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: textSub, lineHeight: '1.7', marginBottom: '32px' }}>
            {t('pricing.subtitle')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {[
              `✓ ${t('pricing.free')}`,
              `✓ ${t('pricing.noCard')}`,
              `✓ ${t('pricing.noPermanence')}`,
            ].map(item => (
              <span key={item} style={{ fontSize: '13px', fontWeight: '600', color: '#10B981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '6px 14px', borderRadius: '99px' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section style={{ padding: '60px 24px 80px', position: 'relative' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                style={{ position: 'relative' }}
                onMouseEnter={() => { setHovered(i); setTooltip(i) }}
                onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              >
                {/* ── TOOLTIP ── */}
                {tooltip === i && (
                  <div style={{
                    position: 'absolute', top: plan.popular ? '-200px' : '-180px',
                    left: '50%', transform: 'translateX(-50%)',
                    width: '300px', background: isDark ? '#1E293B' : 'white',
                    border: `1.5px solid ${plan.color}`, borderRadius: '16px',
                    padding: '18px', boxShadow: `0 16px 40px rgba(0,0,0,0.2)`,
                    zIndex: 50, animation: 'tooltipIn 0.2s ease', pointerEvents: 'none',
                  }}>
                    <div style={{ position: 'absolute', bottom: '-8px', left: '50%', width: '14px', height: '14px', background: isDark ? '#1E293B' : 'white', border: `1.5px solid ${plan.color}`, borderTop: 'none', borderLeft: 'none', transform: 'translateX(-50%) rotate(45deg)', borderRadius: '0 0 2px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: plan.color }}>{plan.icon}</span>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: text }}>{plan.tooltipTitle}</p>
                    </div>
                    <p style={{ fontSize: '13px', color: textSub, lineHeight: '1.6', marginBottom: '12px' }}>{plan.tooltipText}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {Array.isArray(plan.tooltipItems) && plan.tooltipItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: plan.color }}>check_circle</span>
                          <span style={{ fontSize: '12px', color: textSub, fontWeight: '500' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── PLAN CARD ── */}
                <div style={{
                  background: plan.popular ? plan.gradient : cardBg,
                  border: `2px solid ${hovered === i && !plan.popular ? plan.color : plan.popular ? 'transparent' : cardBorder}`,
                  borderRadius: '24px', padding: 'clamp(24px, 4vw, 36px)',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: hovered === i ? `0 24px 64px ${plan.color}40` : plan.popular ? '0 24px 64px rgba(37,99,235,0.35)' : isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
                  transform: hovered === i && !plan.popular ? 'translateY(-6px) scale(1.01)' : plan.popular ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.25s ease',
                }}>
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: plan.popular ? 'rgba(255,255,255,0.06)' : `${plan.color}08`, pointerEvents: 'none' }} />

                  {plan.popular && (
                    <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: 'white', fontSize: '11px', fontWeight: '800', padding: '5px 18px', borderRadius: '99px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(245,158,11,0.5)', letterSpacing: '0.06em' }}>
                      ⭐ {t('pricing.popular').toUpperCase()}
                    </div>
                  )}

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '99px', background: plan.popular ? 'rgba(255,255,255,0.15)' : plan.colorLight, marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px' }}>{plan.emoji}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: plan.popular ? 'rgba(255,255,255,0.9)' : plan.color }}>{plan.nickname}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: plan.popular ? 'rgba(255,255,255,0.15)' : plan.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '22px', color: plan.popular ? 'white' : plan.color }}>{plan.icon}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '800', color: plan.popular ? 'white' : text, lineHeight: 1.2 }}>{plan.name}</h3>
                      <p style={{ fontSize: '12px', color: plan.popular ? 'rgba(255,255,255,0.6)' : textSub }}>{plan.nickSub?.slice(0, 50)}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: plan.popular ? 'rgba(255,255,255,0.4)' : textSub }}>info</span>
                    <span style={{ fontSize: '11px', color: plan.popular ? 'rgba(255,255,255,0.4)' : textSub }}>{t('pricing.hoverHint')}</span>
                  </div>

                  <p style={{ fontSize: '14px', color: plan.popular ? 'rgba(255,255,255,0.75)' : textSub, marginBottom: '20px', lineHeight: '1.6' }}>{plan.desc}</p>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '99px', background: plan.popular ? 'rgba(255,255,255,0.12)' : `${plan.color}10`, border: `1px solid ${plan.popular ? 'rgba(255,255,255,0.2)' : `${plan.color}25`}`, marginBottom: '20px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: plan.popular ? 'rgba(255,255,255,0.8)' : plan.color }}>star</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: plan.popular ? 'rgba(255,255,255,0.8)' : plan.color }}>{plan.highlight}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: plan.popular ? 'rgba(255,255,255,0.7)' : textSub }}>€</span>
                    <span style={{ fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: '800', color: plan.popular ? 'white' : text, letterSpacing: '-0.04em', lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontSize: '14px', color: plan.popular ? 'rgba(255,255,255,0.6)' : textSub }}>{t('pricing.month')}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: plan.popular ? 'rgba(255,255,255,0.45)' : textSub, marginBottom: '24px' }}>
                    {t('pricing.noVat')} · {t('pricing.noPermanence')}
                  </p>

                  <button
                    onClick={() => navigate('/register')}
                    style={{ width: '100%', padding: '14px', background: plan.popular ? 'white' : plan.gradient, color: plan.popular ? '#2563EB' : 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '24px', boxShadow: plan.popular ? '0 4px 20px rgba(0,0,0,0.2)' : `0 4px 16px ${plan.color}40`, transition: 'all 0.15s', position: 'relative', zIndex: 1 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    {t('pricing.cta')}
                  </button>

                  <div style={{ height: '1px', background: plan.popular ? 'rgba(255,255,255,0.15)' : cardBorder, marginBottom: '20px' }} />

                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {plan.features.map((f, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: plan.popular ? 'rgba(255,255,255,0.85)' : text }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '17px', color: plan.popular ? 'rgba(255,255,255,0.7)' : '#10B981', flexShrink: 0, marginTop: '1px' }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Savings banner */}
          <div style={{ marginTop: '40px', background: isDark ? '#1E293B' : 'linear-gradient(135deg, #EFF6FF, #F0FDF4)', border: `1px solid ${isDark ? '#334155' : '#BFDBFE'}`, borderRadius: '20px', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#10B981' }}>savings</span>
            </div>
            <div>
              <p style={{ fontSize: '17px', fontWeight: '700', color: text, marginBottom: '4px' }}>
                💡 {t('pricing.savingsBanner') || 'Ahorra €9/mes con la Suite Completa'}
              </p>
              <p style={{ fontSize: '14px', color: textSub }}>
                {t('pricing.savingsDesc') || 'SalesFlow + StockFlow por separado serían €58/mes. Con la Suite pagas €49 y además obtienes The Bridge, más usuarios y soporte prioritario.'}
              </p>
            </div>
            <button onClick={() => navigate('/register')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
              {t('pricing.ctaSuite')}
            </button>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '800', color: text, textAlign: 'center', marginBottom: '32px', letterSpacing: '-0.02em' }}>
            {t('pricing.tableTitle') || '¿Qué incluye cada plan?'}
          </h2>
          <div style={{ background: cardBg, borderRadius: '20px', border: `1px solid ${cardBorder}`, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: isDark ? '#0F172A' : '#F8FAFC', borderBottom: `1px solid ${cardBorder}`, padding: '16px 24px' }}>
              <div />
              {[t('pricing.plans.salesflow.name'), t('pricing.plans.suite.name'), t('pricing.plans.stockflow.name')].map((name, i) => (
                <div key={name} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', fontWeight: '800', color: i === 1 ? '#2563EB' : text }}>{name}</p>
                  <p style={{ fontSize: '18px', fontWeight: '800', color: i === 1 ? '#2563EB' : text }}>€{i === 1 ? '49' : '29'}<span style={{ fontSize: '12px', fontWeight: '400', color: textSub }}>{t('pricing.month')}</span></p>
                </div>
              ))}
            </div>
            {tableRows.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '14px 24px', borderBottom: i < tableRows.length - 1 ? `1px solid ${cardBorder}` : 'none', background: i % 2 === 0 ? 'transparent' : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                <span style={{ fontSize: '13px', color: textSub, fontWeight: '500' }}>{row.feature}</span>
                {[row.s, row.suite, row.st].map((val, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {typeof val === 'boolean' ? (
                      val
                        ? <span className="material-symbols-outlined" style={{ fontSize: '20px', color: j === 1 ? '#2563EB' : '#10B981' }}>check_circle</span>
                        : <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isDark ? '#334155' : '#E2E8F0' }}>remove_circle</span>
                    ) : (
                      <span style={{ fontSize: '13px', fontWeight: '700', color: j === 1 ? '#2563EB' : text }}>{val}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {trust.map((item, i) => (
            <div key={i} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '14px', padding: '20px', textAlign: 'center', transition: 'transform 0.15s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#2563EB', marginBottom: '10px', display: 'block' }}>{item.icon}</span>
              <p style={{ fontSize: '14px', fontWeight: '700', color: text, marginBottom: '4px' }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: textSub }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', color: text, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              {t('pricing.faqTitle')}
            </h2>
            <p style={{ fontSize: '16px', color: textSub }}>{t('pricing.faqSubtitle')}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: cardBg, border: `1.5px solid ${openFaq === i ? '#2563EB' : cardBorder}`, borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s', boxShadow: openFaq === i ? '0 4px 16px rgba(37,99,235,0.12)' : 'none' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'left' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: text }}>{faq.q}</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: openFaq === i ? '#2563EB' : isDark ? '#334155' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: openFaq === i ? 'white' : textSub, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                  </div>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ height: '1px', background: cardBorder, marginBottom: '14px' }} />
                    <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.7' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#60A5FA', marginBottom: '16px', display: 'block' }}>rocket_launch</span>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            {t('howItWorks.ctaTitle')}
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px', lineHeight: '1.6' }}>
            {t('howItWorks.ctaDesc')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
              {t('howItWorks.ctaRegister')}
            </button>
            <button onClick={() => navigate('/features')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {t('nav.features')}
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (max-width: 640px) {
          section { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
    </div>
  )
}

export default PublicPricing