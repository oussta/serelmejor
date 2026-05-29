import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import PublicNavbar from '../../components/layout/PublicNavbar'
import PublicFooter from '../../components/layout/PublicFooter'

export default function HowItWorks() {
  const navigate     = useNavigate()
  const { t }        = useTranslation()
  const { theme }    = useTheme()
  const isDark       = theme === 'dark'
  const [isMobile,   setIsMobile]   = useState(window.innerWidth <= 768)
  const [activeTab,  setActiveTab]  = useState('salesflow')
  const [mounted,    setMounted]    = useState(false)
  const [openFaq,    setOpenFaq]    = useState(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const bg      = isDark ? '#0F172A' : '#F8FAFC'
  const cardBg  = isDark ? '#1E293B' : '#FFFFFF'
  const border  = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'

  const tabs = [
    { id: 'salesflow', label: 'SalesFlow CRM', icon: 'diversity_3', color: '#2563EB' },
    { id: 'stockflow', label: 'StockFlow',      icon: 'inventory_2', color: '#0EA5E9' },
    { id: 'bridge',    label: 'The Bridge',     icon: 'hub',         color: '#10B981' },
  ]

  const content = {
    salesflow: {
      color: '#2563EB',
      title: t('howItWorks.salesflow.title'),
      desc:  t('howItWorks.salesflow.desc'),
      steps: [
        { icon: 'person_add',    title: t('howItWorks.salesflow.s1t'), desc: t('howItWorks.salesflow.s1d') },
        { icon: 'view_kanban',   title: t('howItWorks.salesflow.s2t'), desc: t('howItWorks.salesflow.s2d') },
        { icon: 'chat',          title: t('howItWorks.salesflow.s3t'), desc: t('howItWorks.salesflow.s3d') },
        { icon: 'smart_toy',     title: t('howItWorks.salesflow.s4t'), desc: t('howItWorks.salesflow.s4d') },
        { icon: 'notifications', title: t('howItWorks.salesflow.s5t'), desc: t('howItWorks.salesflow.s5d') },
        { icon: 'bar_chart',     title: t('howItWorks.salesflow.s6t'), desc: t('howItWorks.salesflow.s6d') },
      ],
    },
    stockflow: {
      color: '#0EA5E9',
      title: t('howItWorks.stockflow.title'),
      desc:  t('howItWorks.stockflow.desc'),
      steps: [
        { icon: 'add_box',              title: t('howItWorks.stockflow.s1t'), desc: t('howItWorks.stockflow.s1d') },
        { icon: 'trending_down',        title: t('howItWorks.stockflow.s2t'), desc: t('howItWorks.stockflow.s2d') },
        { icon: 'remove_shopping_cart', title: t('howItWorks.stockflow.s3t'), desc: t('howItWorks.stockflow.s3d') },
        { icon: 'add_shopping_cart',    title: t('howItWorks.stockflow.s4t'), desc: t('howItWorks.stockflow.s4d') },
        { icon: 'smart_toy',            title: t('howItWorks.stockflow.s5t'), desc: t('howItWorks.stockflow.s5d') },
        { icon: 'local_shipping',       title: t('howItWorks.stockflow.s6t'), desc: t('howItWorks.stockflow.s6d') },
      ],
    },
    bridge: {
      color: '#10B981',
      title: t('howItWorks.bridge.title'),
      desc:  t('howItWorks.bridge.desc'),
      steps: [
        { icon: 'diversity_3',   title: t('howItWorks.bridge.s1t'), desc: t('howItWorks.bridge.s1d') },
        { icon: 'bolt',          title: t('howItWorks.bridge.s2t'), desc: t('howItWorks.bridge.s2d') },
        { icon: 'trending_down', title: t('howItWorks.bridge.s3t'), desc: t('howItWorks.bridge.s3d') },
        { icon: 'local_shipping',title: t('howItWorks.bridge.s4t'), desc: t('howItWorks.bridge.s4d') },
        { icon: 'notifications', title: t('howItWorks.bridge.s5t'), desc: t('howItWorks.bridge.s5d') },
        { icon: 'summarize',     title: t('howItWorks.bridge.s6t'), desc: t('howItWorks.bridge.s6d') },
      ],
    },
  }

  const current = content[activeTab]

  const mods = [
    { icon: 'diversity_3', color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  title: 'SalesFlow CRM', desc: t('howItWorks.mods.salesflow'), tag: '€29/mes' },
    { icon: 'inventory_2', color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)', title: 'StockFlow',      desc: t('howItWorks.mods.stockflow'), tag: '€29/mes' },
    { icon: 'hub',         color: '#10B981', bg: 'rgba(16,185,129,0.08)', title: 'The Bridge',     desc: t('howItWorks.mods.bridge'),    tag: t('pricing.plans.suite.name') },
  ]

  const flowSteps = [
    { icon: 'person_add',     color: '#2563EB', bg: 'rgba(37,99,235,0.1)',  label: t('howItWorks.flow.f1l'), sub: t('howItWorks.flow.f1s') },
    { icon: 'view_kanban',    color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', label: t('howItWorks.flow.f2l'), sub: t('howItWorks.flow.f2s') },
    { icon: 'check_circle',   color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: t('howItWorks.flow.f3l'), sub: t('howItWorks.flow.f3s') },
    { icon: 'hub',            color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: t('howItWorks.flow.f4l'), sub: t('howItWorks.flow.f4s') },
    { icon: 'local_shipping', color: '#F43F5E', bg: 'rgba(244,63,94,0.1)',  label: t('howItWorks.flow.f5l'), sub: t('howItWorks.flow.f5s') },
    { icon: 'trending_up',    color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)', label: t('howItWorks.flow.f6l'), sub: t('howItWorks.flow.f6s') },
  ]

  const whoItems = [
    { icon: 'store',           color: '#2563EB', title: t('howItWorks.who.w1t'), desc: t('howItWorks.who.w1d') },
    { icon: 'engineering',     color: '#10B981', title: t('howItWorks.who.w2t'), desc: t('howItWorks.who.w2d') },
    { icon: 'apartment',       color: '#F59E0B', title: t('howItWorks.who.w3t'), desc: t('howItWorks.who.w3d') },
    { icon: 'groups',          color: '#7C3AED', title: t('howItWorks.who.w4t'), desc: t('howItWorks.who.w4d') },
    { icon: 'medical_services', color: '#F43F5E', title: t('howItWorks.who.w5t'), desc: t('howItWorks.who.w5d') },
    { icon: 'restaurant',      color: '#0EA5E9', title: t('howItWorks.who.w6t'), desc: t('howItWorks.who.w6d') },
    { icon: 'build',           color: '#10B981', title: t('howItWorks.who.w7t'), desc: t('howItWorks.who.w7d') },
    { icon: 'school',          color: '#2563EB', title: t('howItWorks.who.w8t'), desc: t('howItWorks.who.w8d') },
  ]

  const faqs = [
    { q: t('howItWorks.faq.q1'), a: t('howItWorks.faq.a1') },
    { q: t('howItWorks.faq.q2'), a: t('howItWorks.faq.a2') },
    { q: t('howItWorks.faq.q3'), a: t('howItWorks.faq.a3') },
    { q: t('howItWorks.faq.q4'), a: t('howItWorks.faq.a4') },
    { q: t('howItWorks.faq.q5'), a: t('howItWorks.faq.a5') },
    { q: t('howItWorks.faq.q6'), a: t('howItWorks.faq.a6') },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <Helmet>
        <title>¿Cómo funciona Salesek? — CRM e inventario para pymes</title>
        <meta name="description" content="Aprende cómo SalesFlow, StockFlow y The Bridge trabajan juntos para que nunca pierdas una venta ni te quedes sin stock." />
      </Helmet>

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', padding: isMobile ? '48px 20px' : '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#60A5FA' }}>help</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#60A5FA', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('howItWorks.badge')}</span>
          </div>
          <h1 style={{ fontSize: isMobile ? '28px' : '48px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.12', letterSpacing: '-0.03em' }}>
            {t('howItWorks.title')}<br />
            <span style={{ color: '#60A5FA' }}>{t('howItWorks.titleAccent')}</span>
          </h1>
          <p style={{ fontSize: isMobile ? '14px' : '17px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', marginBottom: '32px', maxWidth: '520px', margin: '0 auto 32px' }}>
            {t('howItWorks.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/pricing')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
              {t('howItWorks.tryFree')}
            </button>
            <button onClick={() => navigate('/contact')} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {t('howItWorks.talkToUs')}
            </button>
          </div>
        </div>
      </section>

      {/* ── 3 MODULE CARDS ── */}
      <section style={{ padding: isMobile ? '40px 20px' : '64px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '48px' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '34px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em', marginBottom: '10px' }}>{t('howItWorks.modulesTitle')}</h2>
            <p style={{ fontSize: '15px', color: textSub }}>{t('howItWorks.modulesSubtitle')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
            {mods.map((mod, i) => (
              <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px', padding: '28px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${mod.color}20` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: mod.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '26px', color: mod.color }}>{mod.icon}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: textMain, marginBottom: '10px' }}>{mod.title}</h3>
                <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.7', marginBottom: '16px' }}>{mod.desc}</p>
                <span style={{ fontSize: '12px', fontWeight: '700', color: mod.color, background: mod.bg, padding: '4px 12px', borderRadius: '99px' }}>{mod.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE MODULE STEPS ── */}
      <section style={{ padding: isMobile ? '40px 20px' : '72px 24px', background: bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em', marginBottom: '8px' }}>{t('howItWorks.stepsTitle')}</h2>
            <p style={{ fontSize: '14px', color: textSub }}>{t('howItWorks.stepsSubtitle')}</p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: isMobile ? '10px 16px' : '11px 20px', background: activeTab === tab.id ? tab.color : cardBg, color: activeTab === tab.id ? 'white' : textSub, border: `2px solid ${activeTab === tab.id ? tab.color : border}`, borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s', boxShadow: activeTab === tab.id ? `0 4px 16px ${tab.color}40` : 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '24px', padding: isMobile ? '24px 20px' : '36px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '99px', background: `${current.color}15`, marginBottom: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: current.color }}>{tabs.find(t => t.id === activeTab)?.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: current.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tabs.find(t => t.id === activeTab)?.label}</span>
              </div>
              <h3 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: '800', color: textMain, marginBottom: '8px' }}>{current.title}</h3>
              <p style={{ fontSize: '15px', color: textSub, lineHeight: '1.7' }}>{current.desc}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
              {current.steps.map((step, i) => (
                <div key={i} style={{ background: isDark ? '#0F172A' : '#F8FAFC', border: `1px solid ${border}`, borderRadius: '14px', padding: '18px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '14px', right: '14px', width: '24px', height: '24px', borderRadius: '50%', background: current.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'white' }}>{i + 1}</span>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${current.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: current.color }}>{step.icon}</span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: textMain, marginBottom: '5px' }}>{step.title}</h4>
                  <p style={{ fontSize: '13px', color: textSub, lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOW DIAGRAM ── */}
      <section style={{ padding: isMobile ? '40px 20px' : '72px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: '800', color: textMain, marginBottom: '10px', letterSpacing: '-0.02em' }}>{t('howItWorks.flowTitle')}</h2>
          <p style={{ fontSize: '14px', color: textSub, marginBottom: '40px' }}>{t('howItWorks.flowSubtitle')}</p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center' }}>
            {flowSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: isMobile ? '12px' : '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: isMobile ? '48px' : '60px', height: isMobile ? '48px' : '60px', borderRadius: '50%', background: step.bg, border: `2px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${step.color}30`, flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: isMobile ? '22px' : '26px', color: step.color }}>{step.icon}</span>
                  </div>
                  {!isMobile && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: textMain, marginBottom: '2px' }}>{step.label}</p>
                      <p style={{ fontSize: '10px', color: textSub }}>{step.sub}</p>
                    </div>
                  )}
                </div>
                {isMobile && (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: textMain, marginBottom: '2px' }}>{step.label}</p>
                    <p style={{ fontSize: '11px', color: textSub }}>{step.sub}</p>
                  </div>
                )}
                {i < 5 && <div style={{ color: step.color, fontSize: '18px', fontWeight: '800', margin: isMobile ? '4px 0 4px 8px' : '0 6px', marginTop: isMobile ? '0' : '-24px', flexShrink: 0 }}>{isMobile ? '↓' : '→'}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section style={{ padding: isMobile ? '40px 20px' : '72px 24px', background: bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '40px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em', marginBottom: '8px' }}>{t('howItWorks.forWhoTitle')}</h2>
            <p style={{ fontSize: '14px', color: textSub }}>{t('howItWorks.forWhoSubtitle')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '14px' }}>
            {whoItems.map((item, i) => (
              <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: isMobile ? '16px' : '20px', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: item.color }}>{item.icon}</span>
                </div>
                <p style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '700', color: textMain, marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '11px', color: textSub, lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: isMobile ? '40px 20px' : '72px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '30px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em', marginBottom: '8px' }}>{t('howItWorks.faqTitle')}</h2>
            <p style={{ fontSize: '14px', color: textSub }}>{t('howItWorks.faqSubtitle')}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: cardBg, border: `1px solid ${openFaq === i ? '#2563EB' : border}`, borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'left' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{faq.q}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: openFaq === i ? '#2563EB' : textSub, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>expand_more</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 18px', borderTop: `1px solid ${border}` }}>
                    <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.7', marginTop: '14px' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT HELP BANNER ── */}
      <section style={{ padding: isMobile ? '32px 20px' : '48px 24px', background: bg }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px', padding: isMobile ? '24px 20px' : '32px 40px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '20px', textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#2563EB' }}>support_agent</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: textMain, marginBottom: '6px' }}>{t('howItWorks.contactTitle')}</h3>
              <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.6' }}>{t('howItWorks.contactDesc')}</p>
            </div>
            <button onClick={() => navigate('/contact')} style={{ padding: '12px 22px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', flexShrink: 0 }}>
              {t('howItWorks.contactBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#60A5FA', marginBottom: '14px', display: 'block' }}>rocket_launch</span>
          <h2 style={{ fontSize: isMobile ? '26px' : '38px', fontWeight: '800', color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>{t('howItWorks.ctaTitle')}</h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px', lineHeight: '1.6' }}>{t('howItWorks.ctaDesc')}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/pricing')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: isMobile ? '14px' : '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', width: isMobile ? '100%' : 'auto' }}>
              {t('howItWorks.ctaRegister')}
            </button>
            <button onClick={() => navigate('/precios')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: isMobile ? '14px' : '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}>
              {t('howItWorks.ctaPricing')}
            </button>
          </div>
        </div>
      </section>

      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}