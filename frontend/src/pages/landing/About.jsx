import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useEffect, useRef, useState } from 'react'
import PublicNavbar from '../../components/layout/PublicNavbar'
import PublicFooter from '../../components/layout/PublicFooter'
import { useTheme } from '../../context/ThemeContext'

function Animate({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(32px)'
    el.style.transition = `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; observer.disconnect() }
    }, { threshold: 0.12 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return <div ref={ref} style={style}>{children}</div>
}

function Counter({ target, suffix = '', duration = 1800 }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        observer.disconnect()
        const isSlash = target.includes('/')
        const isFloat = target.includes('.')
        if (isSlash) {
          const parts = target.split('/')
          const end = parseInt(parts[0])
          const steps = 40; let step = 0
          const timer = setInterval(() => { step++; setDisplay(`${Math.round(end * step / steps)}/${parts[1]}`); if (step >= steps) clearInterval(timer) }, duration / steps)
        } else if (isFloat) {
          const end = parseFloat(target)
          const steps = 40; let step = 0
          const timer = setInterval(() => { step++; setDisplay((end * step / steps).toFixed(1)); if (step >= steps) clearInterval(timer) }, duration / steps)
        } else {
          const end = parseInt(target)
          const steps = 50; let step = 0
          const timer = setInterval(() => { step++; setDisplay(Math.round(end * step / steps).toString()); if (step >= steps) clearInterval(timer) }, duration / steps)
        }
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])
  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>{display}{suffix}</span>
}

function About() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const bg         = isDark ? '#0F172A' : '#faf8ff'
  const text       = isDark ? '#F1F5F9' : '#131b2e'
  const textSub    = isDark ? '#94A3B8' : '#434655'
  const cardBg     = isDark ? '#1E293B' : '#ffffff'
  const cardBorder = isDark ? '#334155' : '#e2e8f0'

  const stats = [
    { target: '500', suffix: '+', label: 'Empresas activas' },
    { target: '99.9', suffix: '%', label: 'Uptime garantizado' },
    { target: '24/7', suffix: '', label: 'Soporte prioritario' },
    { target: '14', suffix: '', label: 'Días de prueba gratis' },
  ]

  const values = [
    { icon: 'handshake',  color: '#2563EB', title: 'Honestidad',  desc: 'Precios transparentes, sin letra pequeña. Lo que ves es lo que pagas.' },
    { icon: 'bolt',       color: '#0EA5E9', title: 'Simplicidad', desc: 'Herramientas potentes que cualquiera puede usar sin formación.' },
    { icon: 'groups',     color: '#10B981', title: 'Comunidad',   desc: 'Construimos con nuestros usuarios, no solo para ellos.' },
    { icon: 'security',   color: '#F59E0B', title: 'Privacidad',  desc: 'Tus datos son tuyos. Nunca los vendemos ni compartimos.' },
  ]

  const timeline = [
    { year: '2024', title: 'La idea nace',     desc: 'Frustración con las hojas de cálculo para gestionar clientes e inventario.' },
    { year: '2024', title: 'Primer prototipo', desc: 'Backend PHP + React frontend. Las primeras funciones de CRM toman forma.' },
    { year: '2025', title: 'Proyecto DAW',     desc: 'serElMejor se convierte en el proyecto final del ciclo DAW.' },
    { year: '2025', title: 'Lanzamiento',      desc: 'La plataforma sale a producción con SalesFlow, StockFlow y The Bridge.' },
  ]

  const sectors = [
    { icon: 'store',        color: '#2563EB', label: 'Comercios',      num: '180+' },
    { icon: 'restaurant',   color: '#0EA5E9', label: 'Restaurantes',   num: '95+' },
    { icon: 'construction', color: '#10B981', label: 'Talleres',       num: '120+' },
    { icon: 'favorite',     color: '#F43F5E', label: 'Otros sectores', num: '105+' },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', overflowX: 'hidden' }}>
      <Helmet>
        <title>Sobre Nosotros — Salesek | Software de gestión para pymes</title>
        <meta name="description" content="Salesek nació para resolver el problema que tienen las pequeñas empresas de gestionar clientes y stock en herramientas separadas." />
        <link rel="canonical" href="https://salesek.onrender.com/about" />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://salesek.onrender.com/about" />
        <meta property="og:title"       content="Sobre Nosotros — Salesek" />
        <meta property="og:description" content="Salesek nació para resolver el problema que tienen las pequeñas empresas de gestionar clientes y stock en herramientas separadas." />
        <meta property="og:image"       content="https://salesek.onrender.com/og-salesek.png" />
        <meta property="og:site_name"   content="Salesek" />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="twitter:title"      content="Sobre Nosotros — Salesek" />
        <meta name="twitter:description" content="La historia detrás del software de gestión para pymes." />
        <meta name="twitter:image"      content="https://salesek.onrender.com/og-salesek.png" />
      </Helmet>

      <PublicNavbar />

      {/* ── HERO ── */}
      <section style={{ padding: isMobile ? '48px 20px 40px' : '80px 24px 64px', textAlign: 'center' }}>
        <Animate delay={0}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '99px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>info</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>Sobre nosotros</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: '800', letterSpacing: '-0.02em', color: text, marginBottom: '20px', lineHeight: '1.15' }}>
              Construido por fundadores,<br />
              <span style={{ color: '#2563EB' }}>para fundadores</span>
            </h1>
            <p style={{ fontSize: isMobile ? '15px' : '18px', color: textSub, lineHeight: '1.7', maxWidth: '580px', margin: '0 auto' }}>
              Nacimos de la frustración de gestionar clientes en hojas de cálculo y el inventario en papel. Sabemos lo que es perder una venta por no dar seguimiento a tiempo.
            </p>
          </div>
        </Animate>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: isMobile ? '0 20px 48px' : '0 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '24px' }}>
          {stats.map((s, i) => (
            <Animate key={s.label} delay={i * 100}>
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '20px', padding: isMobile ? '20px 16px' : '32px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '800', color: '#2563EB', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                  <Counter target={s.target} suffix={s.suffix} />
                </p>
                <p style={{ fontSize: isMobile ? '12px' : '14px', color: textSub }}>{s.label}</p>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '80px', alignItems: 'center' }}>
          <Animate delay={0}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nuestra misión</span>
              <h2 style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: '700', color: text, marginTop: '12px', marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                Democratizar las herramientas de gestión empresarial
              </h2>
              <p style={{ fontSize: isMobile ? '14px' : '16px', color: textSub, lineHeight: '1.8', marginBottom: '16px' }}>
                Las grandes empresas tienen SAP, Salesforce, Oracle. Las pequeñas empresas tienen hojas de cálculo y grupos de WhatsApp.
              </p>
              <p style={{ fontSize: isMobile ? '14px' : '16px', color: textSub, lineHeight: '1.8', marginBottom: '28px' }}>
                Queremos cambiar eso. serElMejor lleva las herramientas de gestión de nivel enterprise a cualquier negocio de 1 a 10 personas, a un precio accesible y sin necesidad de formación técnica.
              </p>
              <button
                onClick={() => navigate('/register')}
                style={{ padding: '12px 28px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}
              >
                Únete a nosotros
              </button>
            </div>
          </Animate>

          <Animate delay={150}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {sectors.map(item => (
                <div key={item.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: item.color }}>{item.icon}</span>
                  </div>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: text, marginBottom: '4px' }}>{item.num}</p>
                  <p style={{ fontSize: '12px', color: textSub }}>{item.label}</p>
                </div>
              ))}
            </div>
          </Animate>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Animate delay={0}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '56px' }}>
              <h2 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '700', color: text, letterSpacing: '-0.02em', marginBottom: '12px' }}>
                Nuestros valores
              </h2>
              <p style={{ fontSize: '16px', color: textSub }}>Lo que guía cada decisión que tomamos.</p>
            </div>
          </Animate>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '20px' }}>
            {values.map((v, i) => (
              <Animate key={v.title} delay={i * 100}>
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '20px', padding: isMobile ? '20px 16px' : '28px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${v.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px', color: v.color }}>{v.icon}</span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: text, marginBottom: '8px' }}>{v.title}</h4>
                  <p style={{ fontSize: '12px', color: textSub, lineHeight: '1.6' }}>{v.desc}</p>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <Animate delay={0}>
            <h2 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '700', color: text, textAlign: 'center', marginBottom: isMobile ? '32px' : '56px', letterSpacing: '-0.02em' }}>
              Nuestra historia
            </h2>
          </Animate>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {timeline.map((item, i) => (
              <Animate key={i} delay={i * 120}>
                <div style={{ display: 'flex', gap: '20px', paddingBottom: i < timeline.length - 1 ? '36px' : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700' }}>
                      {item.year.slice(2)}
                    </div>
                    {i < timeline.length - 1 && (
                      <div style={{ width: '2px', flex: 1, background: isDark ? '#334155' : '#E2E8F0', marginTop: '8px' }} />
                    )}
                  </div>
                  <div style={{ paddingTop: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB' }}>{item.year}</span>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: text, margin: '4px 0 6px' }}>{item.title}</h4>
                    <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.6' }}>{item.desc}</p>
                  </div>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: bg }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <Animate delay={0}>
            <h2 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '700', color: text, marginBottom: '40px', letterSpacing: '-0.02em' }}>
              El equipo
            </h2>
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '24px', padding: isMobile ? '28px 20px' : '40px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white', fontSize: '28px', fontWeight: '800' }}>
                Y
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: text, marginBottom: '6px' }}>Yasser</h3>
              <p style={{ fontSize: '14px', color: '#2563EB', fontWeight: '600', marginBottom: '14px' }}>Founder & Full-Stack Developer</p>
              <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.7' }}>
                Desarrollador Full-Stack apasionado por construir productos que resuelven problemas reales para pequeños negocios.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                {['code', 'design_services', 'psychology'].map(icon => (
                  <div key={icon} style={{ width: '36px', height: '36px', borderRadius: '8px', background: isDark ? '#0F172A' : '#F8FAFC', border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>{icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </Animate>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: isMobile ? '64px 20px' : '80px 24px', background: '#0F172A', textAlign: 'center' }}>
        <Animate delay={0}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '700', color: '#F1F5F9', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              ¿Quieres ser parte de la historia?
            </h2>
            <p style={{ fontSize: isMobile ? '15px' : '17px', color: '#64748B', marginBottom: '32px' }}>
              Únete a las 500+ empresas que ya confían en serElMejor.
            </p>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '14px 36px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', width: isMobile ? '100%' : 'auto' }}
            >
              Empezar gratis
            </button>
          </div>
        </Animate>
      </section>

      <PublicFooter />
    </div>
  )
}

export default About