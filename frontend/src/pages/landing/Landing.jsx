import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import PublicNavbar from '../../components/layout/PublicNavbar'
import PublicFooter from '../../components/layout/PublicFooter'
import { useTheme } from '../../context/ThemeContext'

function Landing() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const bg         = isDark ? '#0F172A' : '#faf8ff'
  const text       = isDark ? '#F1F5F9' : '#131b2e'
  const textSub    = isDark ? '#94A3B8' : '#434655'
  const cardBg     = isDark ? '#1E293B' : '#ffffff'
  const cardBorder = isDark ? '#334155' : '#e2e8f0'

  const features = [
    {
      icon: 'diversity_3',
      color: '#2563EB',
      bgColor: 'rgba(37,99,235,0.08)',
      title: t('features.salesTitle'),
      desc: t('features.salesDesc'),
      items: [
        t('features.sales1'),
        t('features.sales2'),
        t('features.sales3'),
        t('features.sales4'),
      ],
    },
    {
      icon: 'inventory_2',
      color: '#006591',
      bgColor: 'rgba(0,101,145,0.08)',
      title: t('features.stockTitle'),
      desc: t('features.stockDesc'),
      items: [
        t('features.stock1'),
        t('features.stock2'),
        t('features.stock3'),
        t('features.stock4'),
      ],
    },
    {
      icon: 'hub',
      color: '#006242',
      bgColor: 'rgba(0,98,66,0.08)',
      title: t('features.bridgeTitle'),
      desc: t('features.bridgeDesc'),
      items: [
        t('features.bridge1'),
        t('features.bridge2'),
        t('features.bridge3'),
        t('features.bridge4'),
      ],
    },
  ]

  const testimonials = [
    { name: 'María García',   company: 'Ferretería García',    text: '"Salesek ha transformado mi ferretería. Ahora sé exactamente qué hay en el almacén mientras hablo con mis clientes."' },
    { name: 'Carlos López',   company: 'Distribuciones López', text: '"Antes perdía ventas por falta de stock. Con StockFlow, el sistema pide automáticamente cuando baja el nivel."' },
    { name: 'Ana Martínez',   company: 'Boutique AM',          text: '"El CRM me ayuda a dar seguimiento a cada cliente. La tasa de conversión subió un 40% en tres meses."' },
  ]

  const steps = [
    { icon: 'cloud_upload',  title: t('hero.step1Title') || '1. Importa tus datos',   desc: t('hero.step1Desc') || 'Sube tu Excel de clientes y productos en segundos.' },
    { icon: 'edit_note',     title: t('hero.step2Title') || '2. Personaliza el flujo', desc: t('hero.step2Desc') || 'Adapta los estados de venta a tu proceso comercial.' },
    { icon: 'rocket_launch', title: t('hero.step3Title') || '3. Empieza a vender',     desc: t('hero.step3Desc') || 'Gestiona ventas y stock desde cualquier dispositivo.' },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <Helmet>
        <title>Salesek — CRM e Inventario para pequeñas empresas desde 29€/mes</title>
        <meta name="description" content="Salesek conecta tu CRM de ventas con tu inventario en una sola plataforma. Cuando cierras una venta, el stock se actualiza solo. 14 días gratis, sin tarjeta." />
        <meta name="keywords" content="CRM pequeña empresa, software gestión pymes, control inventario, CRM autónomos, gestión clientes pymes España" />
        <link rel="canonical" href="https://serelmejor.vercel.app/" />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://serelmejor.vercel.app/" />
        <meta property="og:title"       content="Salesek — CRM e Inventario para pymes españolas" />
        <meta property="og:description" content="Conecta tu CRM de ventas con tu inventario en una sola plataforma. Desde 29€/mes, sin permanencia, 14 días gratis." />
        <meta property="og:image"       content="https://serelmejor.vercel.app/og-salesek.png" />
        <meta property="og:locale"      content="es_ES" />
        <meta property="og:site_name"   content="Salesek" />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="twitter:title"      content="Salesek — CRM e Inventario para pymes" />
        <meta name="twitter:description" content="Conecta CRM e inventario en una sola plataforma. 14 días gratis." />
        <meta name="twitter:image"      content="https://serelmejor.vercel.app/og-salesek.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Salesek",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Plataforma SaaS que combina CRM de ventas e inventario para pequeñas empresas.",
            "url": "https://serelmejor.vercel.app",
            "offers": [
              { "@type": "Offer", "name": "SalesFlow",      "price": "29", "priceCurrency": "EUR" },
              { "@type": "Offer", "name": "Suite Completa", "price": "49", "priceCurrency": "EUR" },
              { "@type": "Offer", "name": "StockFlow",      "price": "29", "priceCurrency": "EUR" }
            ],
            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "500" }
          }
        `}</script>
      </Helmet>

      <PublicNavbar />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: isMobile ? '56px 20px 64px' : '80px 24px 120px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '500px', height: '500px', background: '#2563EB', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '20%', width: '400px', height: '400px', background: '#0EA5E9', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '64px', alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Left */}
          <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '99px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', marginBottom: '24px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>{t('hero.badge')}</span>
            </div>

            <h1 style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: '800', lineHeight: '1.12', letterSpacing: '-0.03em', color: text, marginBottom: '16px' }}>
              {t('hero.title')}<br />
              <span style={{ color: '#2563EB' }}>{t('hero.titleAccent')}</span>
            </h1>

            <p style={{ fontSize: isMobile ? '16px' : '18px', color: textSub, lineHeight: '1.65', marginBottom: '32px', maxWidth: isMobile ? '100%' : '480px', margin: isMobile ? '0 auto 32px' : '0 0 32px' }}>
              {t('hero.subtitle')}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <button
                onClick={() => navigate('/register')}
                style={{ padding: isMobile ? '14px 24px' : '14px 28px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}
              >
                {t('hero.ctaPrimary')}
              </button>
              <button
                onClick={() => navigate('/features')}
                style={{ padding: isMobile ? '14px 24px' : '14px 28px', background: cardBg, color: text, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_circle</span>
                {t('hero.ctaSecondary')}
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <div style={{ display: 'flex' }}>
                {['#2563EB', '#0EA5E9', '#10B981'].map((c, i) => (
                  <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i > 0 ? '-10px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px' }}>
                    {['M', 'C', 'A'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ color: '#F59E0B', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>★★★★★ 4.9/5</div>
                <p style={{ fontSize: '13px', color: textSub }}>{t('hero.socialProof')}</p>
              </div>
            </div>
          </div>

          {/* Right: dashboard mockup — desktop only */}
          {!isMobile && (
            <div style={{ position: 'relative' }}>
              <div style={{ background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: `1px solid ${cardBorder}`, borderRadius: '20px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', transform: 'rotate(1deg)' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${cardBorder}` }}>
                  {['#F87171', '#FBBF24', '#34D399'].map(c => (
                    <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
                  ))}
                  <div style={{ marginLeft: '12px', height: '12px', width: '120px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '6px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { icon: 'trending_up', label: t('hero.statSales'),    value: '€12,400', color: '#2563EB' },
                    { icon: 'group',       label: t('hero.statLeads'),    value: '48',      color: '#0EA5E9' },
                    { icon: 'inventory_2', label: t('hero.statProducts'), value: '124',     color: '#10B981' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: isDark ? '#1E293B' : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: stat.color }}>{stat.icon}</span>
                        <span style={{ fontSize: '11px', color: textSub }}>{stat.label}</span>
                      </div>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: text }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: textSub, marginBottom: '16px', fontWeight: '600' }}>{t('hero.statChart')}</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
                    {[40, 65, 55, 85, 70, 90, 60, 75, 80, 95, 70, 88].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: i === 9 ? '#2563EB' : `rgba(37,99,235,${0.15 + i * 0.04})`, borderRadius: '4px 4px 0 0', height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile: mini stats */}
          {isMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { icon: 'trending_up', label: t('hero.statSales'),    value: '€12k', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
                { icon: 'group',       label: t('hero.statLeads'),    value: '48',   color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)' },
                { icon: 'inventory_2', label: t('hero.statProducts'), value: '124',  color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
              ].map(stat => (
                <div key={stat.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: stat.color }}>{stat.icon}</span>
                  </div>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</p>
                  <p style={{ fontSize: '11px', color: textSub, marginTop: '2px' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section style={{ padding: '20px 24px', background: isDark ? '#1E293B' : 'white', borderTop: `1px solid ${cardBorder}`, borderBottom: `1px solid ${cardBorder}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: isMobile ? '16px' : '48px', flexWrap: 'wrap' }}>
          {[
            { icon: 'verified',      label: t('hero.trust1') },
            { icon: 'cancel',        label: t('hero.trust2') },
            { icon: 'lock',          label: t('hero.trust3') },
            { icon: 'support_agent', label: t('hero.trust4') },
          ].map(item => (
            <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10B981' }}>{item.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: textSub }}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: isMobile ? '56px 20px' : '80px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '64px' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', letterSpacing: '-0.02em', color: text, marginBottom: '12px' }}>
              {t('features.sectionTitle')}
            </h2>
            <p style={{ fontSize: isMobile ? '15px' : '18px', color: textSub, maxWidth: '520px', margin: '0 auto' }}>
              {t('features.sectionSubtitle')}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
            {features.map(f => (
              <div key={f.title} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '24px', padding: isMobile ? '24px' : '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: f.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '26px', color: f.color }}>{f.icon}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: text, marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.6', marginBottom: '20px' }}>{f.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {f.items.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: text }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: f.color }}>check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section style={{ padding: isMobile ? '56px 20px' : '80px 24px', background: bg }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: text, marginBottom: isMobile ? '40px' : '64px', letterSpacing: '-0.02em' }}>
            {t('hero.stepsTitle') || 'Tu negocio listo en 3 pasos'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '32px' : '40px' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: isMobile ? '16px' : '0', textAlign: isMobile ? 'left' : 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: i === 2 ? '#2563EB' : cardBg, border: `2px solid ${i === 2 ? '#2563EB' : cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: isMobile ? '0' : '0 auto 20px', boxShadow: i === 2 ? '0 8px 24px rgba(37,99,235,0.3)' : '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '26px', color: i === 2 ? 'white' : '#2563EB' }}>{step.icon}</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: i === 2 ? '#2563EB' : text, marginBottom: '6px' }}>{step.title}</h4>
                  <p style={{ fontSize: '13px', color: textSub, lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: isMobile ? '56px 20px' : '80px 24px', background: isDark ? '#080f1c' : '#f2f3ff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', textAlign: 'center', color: text, marginBottom: isMobile ? '32px' : '48px', letterSpacing: '-0.02em' }}>
            {t('hero.testimonialsTitle') || 'Lo que dicen nuestros clientes'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
            {testimonials.map(t2 => (
              <div key={t2.name} style={{ background: cardBg, borderRadius: '20px', padding: isMobile ? '20px' : '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}` }}>
                <div style={{ color: '#F59E0B', fontSize: '16px', marginBottom: '14px' }}>★★★★★</div>
                <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>{t2.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0 }}>
                    {t2.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '14px', color: text }}>{t2.name}</p>
                    <p style={{ fontSize: '12px', color: textSub }}>{t2.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section style={{ padding: isMobile ? '56px 20px' : '80px 24px', background: bg }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: text, marginBottom: '12px', letterSpacing: '-0.02em' }}>
            {t('hero.pricingTitle') || 'Precios claros, sin sorpresas'}
          </h2>
          <p style={{ fontSize: '16px', color: textSub, marginBottom: '40px' }}>
            {t('hero.pricingDesc') || 'Desde 29€/mes. Sin permanencia. Sin letra pequeña.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {[
              { name: t('pricing.plans.salesflow.name'), price: '29', color: '#2563EB', icon: 'contacts',     desc: t('features.salesTitle') },
              { name: t('pricing.plans.suite.name'),     price: '49', color: '#2563EB', icon: 'rocket_launch', desc: 'CRM + Inventario', popular: true },
              { name: t('pricing.plans.stockflow.name'), price: '29', color: '#0EA5E9', icon: 'inventory_2',   desc: t('features.stockTitle') },
            ].map(plan => (
              <div key={plan.name} style={{ background: plan.popular ? 'linear-gradient(135deg, #1D4ED8, #2563EB)' : cardBg, border: `1px solid ${plan.popular ? 'transparent' : cardBorder}`, borderRadius: '20px', padding: '24px', position: 'relative', boxShadow: plan.popular ? '0 16px 48px rgba(37,99,235,0.3)' : '0 2px 8px rgba(0,0,0,0.05)', transform: plan.popular && !isMobile ? 'scale(1.04)' : 'scale(1)' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: 'white', fontSize: '11px', fontWeight: '800', padding: '4px 14px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                    ⭐ {t('pricing.popular')}
                  </div>
                )}
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: plan.popular ? 'rgba(255,255,255,0.8)' : plan.color, marginBottom: '12px', display: 'block' }}>{plan.icon}</span>
                <p style={{ fontSize: '14px', fontWeight: '700', color: plan.popular ? 'rgba(255,255,255,0.7)' : textSub, marginBottom: '4px' }}>{plan.name}</p>
                <p style={{ fontSize: '32px', fontWeight: '800', color: plan.popular ? 'white' : text, letterSpacing: '-0.03em', marginBottom: '4px' }}>€{plan.price}<span style={{ fontSize: '14px', fontWeight: '400' }}>{t('pricing.month')}</span></p>
                <p style={{ fontSize: '12px', color: plan.popular ? 'rgba(255,255,255,0.6)' : textSub }}>{plan.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/precios')}
            style={{ padding: '12px 28px', background: 'none', border: `1px solid ${cardBorder}`, borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: textSub, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {t('hero.pricingCta') || 'Ver todos los planes →'}
          </button>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 24px', background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#60A5FA', marginBottom: '16px', display: 'block' }}>rocket_launch</span>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: '#F1F5F9', marginBottom: '14px', letterSpacing: '-0.02em' }}>
            {t('hero.ctaTitle') || '¿Listo para transformar tu negocio?'}
          </h2>
          <p style={{ fontSize: isMobile ? '15px' : '18px', color: '#64748B', marginBottom: '36px', lineHeight: '1.6' }}>
            {t('hero.ctaDesc') || 'Únete a más de 500 empresas que ya gestionan sus ventas e inventario con Salesek.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: isMobile ? '15px' : '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}
            >
              {t('hero.ctaButton') || 'Empieza gratis — 14 días'}
            </button>
            <button
              onClick={() => navigate('/precios')}
              style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.08)', color: '#94A3B8', border: '1px solid #334155', borderRadius: '12px', fontSize: isMobile ? '15px' : '16px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}
            >
              {t('pricing.cta') || 'Ver precios'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '20px' }}>
            ✓ {t('pricing.noCard')} &nbsp;·&nbsp; ✓ {t('pricing.noPermanence')} &nbsp;·&nbsp; ✓ {t('hero.cancelAnytime') || 'Cancela cuando quieras'}
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default Landing