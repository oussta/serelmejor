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

  const bg       = isDark ? '#0F172A' : '#faf8ff'
  const text     = isDark ? '#F1F5F9' : '#131b2e'
  const textSub  = isDark ? '#94A3B8' : '#434655'
  const cardBg   = isDark ? '#1E293B' : '#ffffff'
  const cardBorder = isDark ? '#334155' : '#e2e8f0'

  const features = [
    {
      icon: 'diversity_3',
      color: '#2563EB',
      bgColor: 'rgba(37,99,235,0.08)',
      title: t('features.salesTitle'),
      desc: t('features.salesDesc'),
      items: ['Pipeline visual de ventas', 'Recordatorios automáticos', 'Respuestas con IA', 'Estadísticas de conversión'],
    },
    {
      icon: 'inventory_2',
      color: '#006591',
      bgColor: 'rgba(0,101,145,0.08)',
      title: t('features.stockTitle'),
      desc: t('features.stockDesc'),
      items: ['Alertas de reabastecimiento', 'Movimientos de stock', 'Pedidos automáticos', 'Sugerencias con IA'],
    },
    {
      icon: 'hub',
      color: '#006242',
      bgColor: 'rgba(0,98,66,0.08)',
      title: t('features.bridgeTitle'),
      desc: t('features.bridgeDesc'),
      items: ['Sincronización en tiempo real', 'Reportes unificados', 'Notificaciones WebSocket', 'Flujo automatizado'],
    },
  ]

  const testimonials = [
    {
      name: 'María García', company: 'Ferretería García',
      text: '"Salesek ha transformado mi ferretería. Ahora sé exactamente qué hay en el almacén mientras hablo con mis clientes."',
    },
    {
      name: 'Carlos López', company: 'Distribuciones López',
      text: '"Antes perdía ventas por falta de stock. Con StockFlow, el sistema pide automáticamente cuando baja el nivel."',
    },
    {
      name: 'Ana Martínez', company: 'Boutique AM',
      text: '"El CRM me ayuda a dar seguimiento a cada cliente. La tasa de conversión subió un 40% en tres meses."',
    },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
     <Helmet>
        <title>Salesek — CRM e Inventario para pequeñas empresas desde 29€/mes</title>
        <meta name="description" content="Salesek conecta tu CRM de ventas con tu inventario en una sola plataforma. Cuando cierras una venta, el stock se actualiza solo. 14 días gratis, sin tarjeta." />
        <meta name="keywords" content="CRM pequeña empresa, software gestión pymes, control inventario, CRM autónomos, gestión clientes pymes España" />
        <link rel="canonical" href="https://salesek.onrender.com/" />
        <meta property="og:type"         content="website" />
        <meta property="og:url"          content="https://salesek.onrender.com/" />
        <meta property="og:title"        content="Salesek — CRM e Inventario para pymes españolas" />
        <meta property="og:description"  content="Conecta tu CRM de ventas con tu inventario en una sola plataforma. Desde 29€/mes, sin permanencia, 14 días gratis." />
        <meta property="og:image"        content="https://salesek.onrender.com/og-salesek.png" />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale"       content="es_ES" />
        <meta property="og:site_name"    content="Salesek" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Salesek — CRM e Inventario para pymes" />
        <meta name="twitter:description" content="Conecta CRM e inventario en una sola plataforma. 14 días gratis." />
        <meta name="twitter:image"       content="https://salesek.onrender.com/og-salesek.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Salesek",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Plataforma SaaS que combina CRM de ventas e inventario para pequeñas empresas.",
            "url": "https://salesek.onrender.com",
            "offers": [
              { "@type": "Offer", "name": "SalesFlow",      "price": "29", "priceCurrency": "EUR" },
              { "@type": "Offer", "name": "Suite Completa", "price": "49", "priceCurrency": "EUR" },
              { "@type": "Offer", "name": "StockFlow",      "price": "29", "priceCurrency": "EUR" }
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "500"
            }
          }
        `}</script>
      </Helmet>

      <PublicNavbar />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '80px 24px 120px', overflow: 'hidden' }}>

        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '500px', height: '500px', background: '#2563EB', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '20%', width: '400px', height: '400px', background: '#0EA5E9', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Left */}
          <div>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '99px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', marginBottom: '24px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>{t('hero.badge')}</span>
            </div>

            <h1 style={{ fontSize: '44px', fontWeight: '700', lineHeight: '1.15', letterSpacing: '-0.02em', color: text, marginBottom: '16px' }}>
              {t('hero.title')}<br />
              <span style={{ color: '#2563EB' }}>{t('hero.titleAccent')}</span>
            </h1>

            <p style={{ fontSize: '18px', color: textSub, lineHeight: '1.6', marginBottom: '36px', maxWidth: '480px' }}>
              {t('hero.subtitle')}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <button
                onClick={() => navigate('/register')}
                style={{ padding: '14px 28px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {t('hero.ctaPrimary')}
              </button>
              <button
                onClick={() => navigate('/features')}
                style={{ padding: '14px 28px', background: cardBg, color: text, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_circle</span>
                {t('hero.ctaSecondary')}
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

          {/* Right: dashboard mockup */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: `1px solid ${cardBorder}`, borderRadius: '20px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', transform: 'rotate(1deg)' }}>

              {/* Fake browser bar */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${cardBorder}` }}>
                {['#F87171', '#FBBF24', '#34D399'].map(c => (
                  <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
                ))}
                <div style={{ marginLeft: '12px', height: '12px', width: '120px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '6px' }} />
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                  { icon: 'trending_up', label: 'Ventas', value: '€12,400', color: '#2563EB' },
                  { icon: 'group', label: 'Leads', value: '48', color: '#0EA5E9' },
                  { icon: 'inventory_2', label: 'Productos', value: '124', color: '#10B981' },
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

              {/* Bar chart */}
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '12px', color: textSub, marginBottom: '16px', fontWeight: '600' }}>Ventas este mes</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
                  {[40, 65, 55, 85, 70, 90, 60, 75, 80, 95, 70, 88].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: i === 9 ? '#2563EB' : `rgba(37,99,235,${0.15 + i * 0.04})`, borderRadius: '4px 4px 0 0', height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '34px', fontWeight: '600', letterSpacing: '-0.02em', color: text, marginBottom: '16px' }}>
              {t('features.sectionTitle')}
            </h2>
            <p style={{ fontSize: '18px', color: textSub, maxWidth: '520px', margin: '0 auto' }}>
              {t('features.sectionSubtitle')}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {features.map(f => (
              <div key={f.title} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '24px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: f.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: f.color }}>{f.icon}</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: text, marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ fontSize: '15px', color: textSub, lineHeight: '1.6', marginBottom: '24px' }}>{f.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {f.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: text }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: f.color }}>check_circle</span>
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
      <section style={{ padding: '80px 24px', background: bg }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '34px', fontWeight: '600', color: text, marginBottom: '64px', letterSpacing: '-0.02em' }}>
            Tu negocio listo en 3 pasos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { icon: 'cloud_upload',  title: '1. Importa tus datos',     desc: 'Sube tu Excel de clientes y productos en segundos.' },
              { icon: 'edit_note',     title: '2. Personaliza el flujo',   desc: 'Adapta los estados de venta a tu proceso comercial.' },
              { icon: 'rocket_launch', title: '3. Empieza a vender',       desc: 'Gestiona ventas y stock desde cualquier dispositivo.' },
            ].map((step, i) => (
              <div key={step.title}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: i === 2 ? '#2563EB' : cardBg, border: `2px solid ${i === 2 ? '#2563EB' : cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: i === 2 ? '0 8px 24px rgba(37,99,235,0.3)' : '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: i === 2 ? 'white' : '#2563EB' }}>{step.icon}</span>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: i === 2 ? '#2563EB' : text, marginBottom: '8px' }}>{step.title}</h4>
                <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.6' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 24px', background: isDark ? '#080f1c' : '#f2f3ff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '34px', fontWeight: '600', textAlign: 'center', color: text, marginBottom: '48px', letterSpacing: '-0.02em' }}>
            Lo que dicen nuestros clientes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {testimonials.map(t2 => (
              <div key={t2.name} style={{ background: cardBg, borderRadius: '20px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ color: '#F59E0B', fontSize: '16px', marginBottom: '16px' }}>★★★★★</div>
                <p style={{ fontSize: '15px', color: textSub, lineHeight: '1.7', marginBottom: '24px', fontStyle: 'italic' }}>{t2.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px' }}>
                    {t2.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: text }}>{t2.name}</p>
                    <p style={{ fontSize: '13px', color: textSub }}>{t2.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '100px 24px', background: '#0F172A', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#F1F5F9', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            ¿Listo para transformar tu negocio?
          </h2>
          <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '40px', lineHeight: '1.6' }}>
            Únete a más de 500 empresas que ya gestionan sus ventas e inventario con serElMejor.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '14px 32px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Empieza gratis — 14 días
            </button>
            <button
              onClick={() => navigate('/precios')}
              style={{ padding: '14px 32px', background: 'transparent', color: '#94A3B8', border: '1px solid #334155', borderRadius: '12px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Ver precios
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default Landing