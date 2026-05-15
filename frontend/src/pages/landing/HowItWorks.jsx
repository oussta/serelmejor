import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import PublicNavbar from '../../components/layout/PublicNavbar'
import PublicFooter from '../../components/layout/PublicFooter'

export default function HowItWorks() {
  const navigate   = useNavigate()
  const { t }      = useTranslation()
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [activeTab, setActiveTab] = useState('salesflow')
  const [mounted,  setMounted]  = useState(false)

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
      title: 'Gestiona tus ventas sin perder ningún cliente',
      desc:  'SalesFlow es tu pipeline visual de ventas. Ve el estado de cada lead de un vistazo y nunca pierdas un seguimiento.',
      steps: [
        { icon: 'person_add',   title: 'Añade un lead',             desc: 'Crea el contacto en 10 segundos con nombre, descripción y probabilidad de cierre.' },
        { icon: 'view_kanban',  title: 'Muévelo por el pipeline',   desc: 'Arrastra de Nuevo → Contactado → Negociando → Ganado. Todo visual.' },
        { icon: 'chat',         title: 'Historial de mensajes',     desc: 'Cada conversación queda registrada en la ficha del cliente.' },
        { icon: 'smart_toy',    title: 'IA genera la respuesta',    desc: 'Pulsa el botón IA y obtén un borrador profesional adaptado al lead.' },
        { icon: 'notifications',title: 'Recordatorios automáticos', desc: 'El sistema te avisa cuando un lead lleva demasiado tiempo sin actividad.' },
        { icon: 'bar_chart',    title: 'Estadísticas en tiempo real',desc: 'Ve tu tasa de conversión, el valor del pipeline y qué etapa falla.' },
      ],
    },
    stockflow: {
      color: '#0EA5E9',
      title: 'Control total de tu inventario sin hojas de cálculo',
      desc:  'StockFlow te dice exactamente cuánto tienes en almacén y actúa solo cuando el stock baja del mínimo.',
      steps: [
        { icon: 'add_box',         title: 'Añade tus productos',      desc: 'Crea productos con categoría, stock inicial y nivel mínimo.' },
        { icon: 'trending_down',   title: 'Alertas automáticas',      desc: 'Cuando el stock baja del mínimo recibes una notificación al instante.' },
        { icon: 'remove_shopping_cart', title: 'Registra ventas',     desc: 'Anota cada venta y el stock se descuenta automáticamente.' },
        { icon: 'add_shopping_cart','title': 'Reabastece rápido',     desc: 'Un clic para registrar un restock con nota y fecha automática.' },
        { icon: 'smart_toy',       title: 'IA sugiere cantidades',    desc: 'La IA analiza tus ventas de 30 días y recomienda cuánto pedir.' },
        { icon: 'local_shipping',  title: 'Pedido automático',        desc: 'Genera y envía la orden al proveedor por email desde la app.' },
      ],
    },
    bridge: {
      color: '#10B981',
      title: 'CRM e inventario conectados — La magia de Salesek',
      desc:  'Cuando cierras una venta en el CRM, el inventario se actualiza solo. Sin pasos manuales, sin errores.',
      steps: [
        { icon: 'diversity_3',    title: 'Cierras una venta',        desc: 'Marcas un lead como "Ganado" en el CRM de SalesFlow.' },
        { icon: 'bolt',           title: 'The Bridge actúa',         desc: 'El sistema detecta el cierre y descuenta el stock automáticamente.' },
        { icon: 'trending_down',  title: 'Comprueba el mínimo',      desc: 'Si el stock cae bajo el mínimo, genera un pedido al proveedor.' },
        { icon: 'local_shipping', title: 'Pedido al proveedor',      desc: 'Email automático al proveedor con la orden de compra.' },
        { icon: 'notifications',  title: 'Todo el equipo se entera', desc: 'Notificaciones WebSocket en tiempo real para todo tu equipo.' },
        { icon: 'summarize',      title: 'Reporte unificado',        desc: 'Ve ventas e inventario en un solo dashboard.' },
      ],
    },
  }

  const current = content[activeTab]

  const faqs = [
    { q: '¿Necesito instalar algo?',          a: 'No. Salesek es 100% web. Funciona en cualquier navegador, móvil, tablet y PC. Sin instalaciones.' },
    { q: '¿Puedo usar solo un módulo?',       a: 'Sí. SalesFlow y StockFlow se contratan por separado a 29€/mes cada uno. La Suite Completa incluye ambos a 49€/mes.' },
    { q: '¿Cómo funciona la IA?',             a: 'Usamos la API de Claude (Anthropic) para generar respuestas a leads y sugerencias de pedido basadas en tu historial de ventas.' },
    { q: '¿Mis datos están seguros?',         a: 'Sí. JWT + bcrypt para autenticación, HTTPS en todo momento, y base de datos PostgreSQL en la nube con backups diarios.' },
    { q: '¿Puedo cancelar cuando quiera?',    a: 'Por supuesto. Sin permanencia, sin penalizaciones. Cancelas en un clic desde tu perfil.' },
    { q: '¿Hay soporte si tengo problemas?',  a: 'Sí. Puedes contactarnos en cualquier momento desde la página de contacto. Respondemos en menos de 24h.' },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <Helmet>
        <title>¿Cómo funciona Salesek? — CRM e inventario para pymes</title>
        <meta name="description" content="Aprende cómo SalesFlow, StockFlow y The Bridge trabajan juntos para que nunca pierdas una venta ni te quedes sin stock." />
        <link rel="canonical" href="https://serelmejor.vercel.app/como-funciona" />
      </Helmet>

      <PublicNavbar />

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', padding: isMobile ? '60px 20px 48px' : '96px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#60A5FA' }}>help</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#60A5FA', letterSpacing: '0.08em', textTransform: 'uppercase' }}>¿Cómo funciona?</span>
          </div>
          <h1 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '800', color: 'white', marginBottom: '20px', lineHeight: '1.12', letterSpacing: '-0.03em' }}>
            Todo lo que necesita<br />
            <span style={{ color: '#60A5FA' }}>tu negocio, explicado</span>
          </h1>
          <p style={{ fontSize: isMobile ? '15px' : '18px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', marginBottom: '36px', maxWidth: '560px', margin: '0 auto 36px' }}>
            Salesek conecta tu CRM de ventas con tu inventario. Dos módulos, una plataforma, cero hojas de Excel.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
              Pruébalo gratis 14 días
            </button>
            <button onClick={() => navigate('/contact')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Hablar con nosotros
            </button>
          </div>
        </div>
      </section>

      {/* ── 3 MODULE INTRO CARDS ── */}
      <section style={{ padding: isMobile ? '48px 20px' : '72px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '56px' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              3 módulos, un solo objetivo
            </h2>
            <p style={{ fontSize: '16px', color: textSub, maxWidth: '480px', margin: '0 auto' }}>
              Cada parte de Salesek resuelve un problema real de las pequeñas empresas.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { icon: 'diversity_3', color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  title: 'SalesFlow CRM',   desc: 'Pipeline visual de ventas. Gestiona leads, mensajes, recordatorios y estadísticas. Nunca pierdas un cliente por falta de seguimiento.', tag: '€29/mes' },
              { icon: 'inventory_2', color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)', title: 'StockFlow',       desc: 'Control total de inventario. Alertas de stock bajo, movimientos, pedidos automáticos a proveedores y sugerencias con IA.', tag: '€29/mes' },
              { icon: 'hub',         color: '#10B981', bg: 'rgba(16,185,129,0.08)', title: 'The Bridge',      desc: 'Cuando cierras una venta, el inventario se actualiza solo. CRM e inventario conectados en tiempo real. Sin trabajo manual.', tag: 'Incluido en Suite' },
            ].map((mod, i) => (
              <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px', padding: isMobile ? '24px' : '28px', transition: 'transform 0.2s, box-shadow 0.2s' }}
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
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '34px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em', marginBottom: '10px' }}>
              ¿Cómo funciona cada módulo?
            </h2>
            <p style={{ fontSize: '15px', color: textSub }}>Selecciona el módulo para ver el flujo paso a paso</p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: isMobile ? '10px 16px' : '12px 22px', background: activeTab === tab.id ? tab.color : cardBg, color: activeTab === tab.id ? 'white' : textSub, border: `2px solid ${activeTab === tab.id ? tab.color : border}`, borderRadius: '12px', fontSize: isMobile ? '13px' : '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s', boxShadow: activeTab === tab.id ? `0 4px 16px ${tab.color}40` : 'none' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
                {!isMobile && tab.label}
              </button>
            ))}
          </div>

          {/* Module content */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '24px', padding: isMobile ? '24px 20px' : '40px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: isMobile ? '24px' : '36px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '99px', background: `${current.color}15`, marginBottom: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: current.color }}>{tabs.find(t => t.id === activeTab)?.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: current.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tabs.find(t => t.id === activeTab)?.label}</span>
              </div>
              <h3 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '800', color: textMain, marginBottom: '10px', letterSpacing: '-0.02em' }}>{current.title}</h3>
              <p style={{ fontSize: isMobile ? '14px' : '16px', color: textSub, lineHeight: '1.7' }}>{current.desc}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              {current.steps.map((step, i) => (
                <div key={i} style={{ background: isDark ? '#0F172A' : '#F8FAFC', border: `1px solid ${border}`, borderRadius: '14px', padding: '18px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '14px', right: '14px', width: '24px', height: '24px', borderRadius: '50%', background: current.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'white' }}>{i + 1}</span>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${current.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: current.color }}>{step.icon}</span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: textMain, marginBottom: '6px' }}>{step.title}</h4>
                  <p style={{ fontSize: '13px', color: textSub, lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOW DIAGRAM ── */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '24px' : '34px', fontWeight: '800', color: textMain, marginBottom: '12px', letterSpacing: '-0.02em' }}>
            El flujo completo de Salesek
          </h2>
          <p style={{ fontSize: '15px', color: textSub, marginBottom: '48px' }}>
            Así funciona la plataforma de principio a fin
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '0' : '0' }}>
            {[
              { icon: 'person_add',      color: '#2563EB', bg: 'rgba(37,99,235,0.1)',  label: 'Nuevo lead entra', sub: 'Lo añades al CRM' },
              { icon: 'view_kanban',     color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', label: 'Avanza en pipeline', sub: 'Contactado → Negociando' },
              { icon: 'check_circle',    color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Cierras la venta', sub: 'Estado = Ganado' },
              { icon: 'hub',             color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'The Bridge actúa', sub: 'Stock se descuenta solo' },
              { icon: 'local_shipping',  color: '#F43F5E', bg: 'rgba(244,63,94,0.1)',  label: 'Pedido automático', sub: 'Email al proveedor' },
              { icon: 'trending_up',     color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)', label: 'Negocio crece', sub: 'Sin trabajo manual' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: isMobile ? '12px' : '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', borderRadius: '50%', background: step.bg, border: `2px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${step.color}30`, flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: isMobile ? '22px' : '28px', color: step.color }}>{step.icon}</span>
                  </div>
                  {!isMobile && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: textMain, marginBottom: '3px' }}>{step.label}</p>
                      <p style={{ fontSize: '11px', color: textSub }}>{step.sub}</p>
                    </div>
                  )}
                </div>
                {isMobile && (
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: textMain, marginBottom: '2px' }}>{step.label}</p>
                    <p style={{ fontSize: '12px', color: textSub }}>{step.sub}</p>
                  </div>
                )}
                {i < 5 && (
                  <div style={{ color: step.color, fontSize: '20px', fontWeight: '800', margin: isMobile ? '4px 0 4px 8px' : '0 8px', flexShrink: 0 }}>
                    {isMobile ? '↓' : '→'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '48px' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '34px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em', marginBottom: '10px' }}>
              ¿Para quién es Salesek?
            </h2>
            <p style={{ fontSize: '15px', color: textSub }}>Diseñado para negocios de 1 a 10 personas</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { icon: 'store',          color: '#2563EB', title: 'Tiendas y comercios',    desc: 'Control de stock y clientes en un solo lugar' },
              { icon: 'engineering',    color: '#10B981', title: 'Talleres y servicios',   desc: 'Gestiona piezas, clientes y presupuestos' },
              { icon: 'apartment',      color: '#F59E0B', title: 'Distribuidoras',         desc: 'Inventario masivo y pedidos automáticos' },
              { icon: 'groups',         color: '#7C3AED', title: 'Equipos comerciales',    desc: 'Pipeline visual y seguimientos sin esfuerzo' },
              { icon: 'medical_services',color:'#F43F5E', title: 'Farmacias',              desc: 'Stock crítico con alertas inmediatas' },
              { icon: 'restaurant',     color: '#0EA5E9', title: 'Hostelería',             desc: 'Ingredientes y proveedores bajo control' },
              { icon: 'build',          color: '#10B981', title: 'Construcción',           desc: 'Materiales y clientes corporativos' },
              { icon: 'school',         color: '#2563EB', title: 'Academias',              desc: 'CRM de alumnos y seguimiento comercial' },
            ].map((item, i) => (
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
      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', background: isDark ? '#080f1c' : '#ffffff' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em', marginBottom: '10px' }}>
              Preguntas frecuentes
            </h2>
            <p style={{ fontSize: '15px', color: textSub }}>Respondemos todo antes de que empieces</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, i) => {
              const [open, setOpen] = useState(false)
              return (
                <div key={i} style={{ background: cardBg, border: `1px solid ${open ? '#2563EB' : border}`, borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'left' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>{faq.q}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: open ? '#2563EB' : textSub, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>expand_more</span>
                  </button>
                  {open && (
                    <div style={{ padding: '0 20px 18px', borderTop: `1px solid ${border}` }}>
                      <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.7', marginTop: '14px' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACT HELP BANNER ── */}
      <section style={{ padding: isMobile ? '40px 20px' : '56px 24px', background: bg }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ background: isDark ? '#1E293B' : 'white', border: `1px solid ${border}`, borderRadius: '20px', padding: isMobile ? '28px 20px' : '36px 40px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '24px', textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#2563EB' }}>support_agent</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: textMain, marginBottom: '6px' }}>¿Tienes alguna duda?</h3>
              <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.6' }}>
                Estamos aquí para ayudarte. Nuestro equipo responde en menos de 24 horas.
                No somos bots — somos personas reales que entienden tu negocio.
              </p>
            </div>
            <button
              onClick={() => navigate('/contact')}
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', flexShrink: 0 }}
            >
              Contactar ahora →
            </button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: isMobile ? '60px 20px' : '96px 24px', background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#60A5FA', marginBottom: '16px', display: 'block' }}>rocket_launch</span>
          <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: 'white', marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Empieza hoy mismo
          </h2>
          <p style={{ fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.6)', marginBottom: '36px', lineHeight: '1.6' }}>
            14 días gratis. Sin tarjeta. Sin compromiso. Configura tu cuenta en 5 minutos.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: isMobile ? '14px' : '16px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', width: isMobile ? '100%' : 'auto' }}>
              Crear cuenta gratis
            </button>
            <button onClick={() => navigate('/precios')} style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: isMobile ? '14px' : '16px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}>
              Ver precios
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}