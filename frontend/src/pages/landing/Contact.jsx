import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import PublicNavbar from '../../components/layout/PublicNavbar'
import PublicFooter from '../../components/layout/PublicFooter'
import { useTheme } from '../../context/ThemeContext'

function validate(name, value, lang) {
  const msg = {
    es: {
      nameRequired: 'El nombre es obligatorio', nameLetters: 'El nombre solo puede contener letras',
      nameMin: 'El nombre debe tener al menos 2 caracteres', nameMax: 'El nombre no puede superar 100 caracteres',
      emailRequired: 'El email es obligatorio', emailInvalid: 'Introduce un email válido',
      emailMax: 'El email no puede superar 150 caracteres', companyInvalid: 'La empresa contiene caracteres no permitidos',
      companyMax: 'El nombre de empresa no puede superar 150 caracteres', messageRequired: 'El mensaje es obligatorio',
      messageMin: 'El mensaje debe tener al menos 20 caracteres', messageMax: 'El mensaje no puede superar 2000 caracteres',
    },
    en: {
      nameRequired: 'Name is required', nameLetters: 'Name can only contain letters',
      nameMin: 'Name must be at least 2 characters', nameMax: 'Name cannot exceed 100 characters',
      emailRequired: 'Email is required', emailInvalid: 'Please enter a valid email',
      emailMax: 'Email cannot exceed 150 characters', companyInvalid: 'Company contains invalid characters',
      companyMax: 'Company name cannot exceed 150 characters', messageRequired: 'Message is required',
      messageMin: 'Message must be at least 20 characters', messageMax: 'Message cannot exceed 2000 characters',
    },
    fr: {
      nameRequired: 'Le nom est obligatoire', nameLetters: 'Le nom ne peut contenir que des lettres',
      nameMin: 'Le nom doit contenir au moins 2 caractères', nameMax: 'Le nom ne peut pas dépasser 100 caractères',
      emailRequired: "L'email est obligatoire", emailInvalid: 'Veuillez entrer un email valide',
      emailMax: "L'email ne peut pas dépasser 150 caractères", companyInvalid: "L'entreprise contient des caractères non autorisés",
      companyMax: "Le nom de l'entreprise ne peut pas dépasser 150 caractères", messageRequired: 'Le message est obligatoire',
      messageMin: 'Le message doit contenir au moins 20 caractères', messageMax: 'Le message ne peut pas dépasser 2000 caractères',
    },
  }
  const e = msg[lang] || msg.es
  switch (name) {
    case 'name':
      if (!value.trim()) return e.nameRequired
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim())) return e.nameLetters
      if (value.trim().length < 2) return e.nameMin
      if (value.trim().length > 100) return e.nameMax
      return ''
    case 'email':
      if (!value.trim()) return e.emailRequired
      if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value.trim())) return e.emailInvalid
      if (value.trim().length > 150) return e.emailMax
      return ''
    case 'company':
      if (value.trim() && !/^[a-zA-ZÀ-ÿ0-9\s.,'"\-&()]+$/.test(value.trim())) return e.companyInvalid
      if (value.trim().length > 150) return e.companyMax
      return ''
    case 'message':
      if (!value.trim()) return e.messageRequired
      if (value.trim().length < 20) return e.messageMin
      if (value.trim().length > 2000) return e.messageMax
      return ''
    default: return ''
  }
}

function Contact() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
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
  const inputBg    = isDark ? '#0F172A' : '#F8FAFC'

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem('contact_form_draft')
      return saved ? JSON.parse(saved) : { name: '', email: '', company: '', message: '' }
    } catch { return { name: '', email: '', company: '', message: '' } }
  })
  const [errors,  setErrors]  = useState({ name: '', email: '', company: '', message: '' })
  const [touched, setTouched] = useState({ name: false, email: false, company: false, message: false })
  const [status,  setStatus]  = useState('idle')

  useEffect(() => {
    localStorage.setItem('contact_form_draft', JSON.stringify(form))
  }, [form])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (touched[name]) setErrors(prev => ({ ...prev, [name]: validate(name, value, lang) }))
  }

  function handleBlur(e) {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validate(name, value, lang) }))
  }

  function isFormValid() {
    return !validate('name', form.name, lang) && !validate('email', form.email, lang) && !validate('message', form.message, lang)
  }

  async function handleSubmit() {
    setTouched({ name: true, email: true, company: true, message: true })
    const newErrors = {
      name: validate('name', form.name, lang), email: validate('email', form.email, lang),
      company: validate('company', form.company, lang), message: validate('message', form.message, lang),
    }
    setErrors(newErrors)
    if (!isFormValid()) return
    setStatus('sending')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('sent')
        localStorage.removeItem('contact_form_draft')
        setForm({ name: '', email: '', company: '', message: '' })
        setTouched({ name: false, email: false, company: false, message: false })
      } else { setStatus('error') }
    } catch {
      setStatus('sent')
      localStorage.removeItem('contact_form_draft')
      setForm({ name: '', email: '', company: '', message: '' })
      setTouched({ name: false, email: false, company: false, message: false })
    }
  }

  function borderColor(fieldName) {
    if (touched[fieldName] && errors[fieldName]) return '#F43F5E'
    if (touched[fieldName] && !errors[fieldName] && form[fieldName]) return '#10B981'
    return cardBorder
  }

  function inputStyle(fieldName, extra = {}) {
    return {
      width: '100%', padding: '11px 14px', background: inputBg,
      border: `1.5px solid ${borderColor(fieldName)}`, borderRadius: '10px',
      fontSize: '15px', color: text, fontFamily: 'Plus Jakarta Sans, sans-serif',
      outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', ...extra,
    }
  }

  function FieldError({ field }) {
    if (!touched[field] || !errors[field]) return null
    return (
      <p style={{ fontSize: '12px', color: '#F43F5E', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
        {errors[field]}
      </p>
    )
  }

  function FieldCheck({ field }) {
    if (!touched[field] || errors[field] || !form[field]) return null
    return (
      <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#10B981' }}>
        check_circle
      </span>
    )
  }

  const info = [
    { icon: 'mail',          color: '#2563EB', label: 'Email',      value: 'hola@salesek.com' },
    { icon: 'schedule',      color: '#10B981', label: 'Horario',    value: 'Lun–Vie, 9:00–18:00' },
    { icon: 'location_on',   color: '#F59E0B', label: 'Ubicación',  value: 'España' },
    { icon: 'support_agent', color: '#0EA5E9', label: 'Soporte',    value: 'Respuesta en < 24h' },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', overflowX: 'hidden' }}>
      <Helmet>
        <title>Contacto — Salesek | Habla con nosotros</title>
        <meta name="description" content="¿Tienes dudas sobre Salesek? Escríbenos y te respondemos en menos de 24 horas." />
        <link rel="canonical" href="https://salesek.onrender.com/contact" />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://salesek.onrender.com/contact" />
        <meta property="og:title"       content="Contacto — Salesek" />
        <meta property="og:description" content="¿Tienes dudas sobre Salesek? Escríbenos y te respondemos en menos de 24 horas." />
        <meta property="og:image"       content="https://salesek.onrender.com/og-salesek.png" />
        <meta property="og:site_name"   content="Salesek" />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="twitter:title"      content="Contacto — Salesek" />
        <meta name="twitter:description" content="Habla con el equipo de Salesek." />
        <meta name="twitter:image"      content="https://salesek.onrender.com/og-salesek.png" />
      </Helmet>

      <PublicNavbar />

      {/* ── HERO ── */}
      <section style={{ padding: isMobile ? '48px 20px 32px' : '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '99px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', marginBottom: '24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>chat</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>Estamos aquí para ayudarte</span>
          </div>
          <h1 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: '800', letterSpacing: '-0.02em', color: text, marginBottom: '16px', lineHeight: '1.15' }}>
            {t('contact.title')}
          </h1>
          <p style={{ fontSize: isMobile ? '15px' : '18px', color: textSub, lineHeight: '1.6' }}>
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* ── MAIN ── */}
      <section style={{ padding: isMobile ? '0 20px 60px' : '0 24px 100px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.4fr', gap: isMobile ? '24px' : '48px', alignItems: 'start' }}>

          {/* Left: info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {info.map(item => (
              <div key={item.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: item.color }}>{item.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{item.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: text }}>{item.value}</p>
                </div>
              </div>
            ))}

            <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', borderRadius: '16px', padding: '20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '26px', color: 'rgba(255,255,255,0.8)', marginBottom: '10px', display: 'block' }}>rocket_launch</span>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                ¿Quieres una demo personalizada?
              </h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6' }}>
                Cuéntanos sobre tu negocio y te preparamos una demo adaptada a tu sector.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '24px', padding: isMobile ? '24px 20px' : '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: text, marginBottom: '6px' }}>
              Envíanos un mensaje
            </h2>
            <p style={{ fontSize: '13px', color: textSub, marginBottom: '28px' }}>
              Tu borrador se guarda automáticamente mientras escribes.
            </p>

            {status === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#10B981' }}>check_circle</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: text, marginBottom: '8px' }}>¡Mensaje enviado!</h3>
                <p style={{ fontSize: '14px', color: textSub, marginBottom: '20px' }}>{t('contact.sent')}</p>
                <button
                  onClick={() => setStatus('idle')}
                  style={{ padding: '10px 24px', background: 'none', border: `1px solid ${cardBorder}`, borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', color: text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Name + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }}>
                      {t('contact.name')} <span style={{ color: '#F43F5E' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder="Ana García" style={inputStyle('name')} />
                      <FieldCheck field="name" />
                    </div>
                    <FieldError field="name" />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }}>
                      {t('contact.email')} <span style={{ color: '#F43F5E' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="ana@empresa.com" style={inputStyle('email')} />
                      <FieldCheck field="email" />
                    </div>
                    <FieldError field="email" />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }}>
                    {t('contact.company')}
                    <span style={{ fontSize: '12px', fontWeight: '400', marginLeft: '6px', color: textSub }}>(opcional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input name="company" value={form.company} onChange={handleChange} onBlur={handleBlur} placeholder="Mi Empresa S.L." style={inputStyle('company')} />
                    <FieldCheck field="company" />
                  </div>
                  <FieldError field="company" />
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }}>
                    {t('contact.message')} <span style={{ color: '#F43F5E' }}>*</span>
                    <span style={{ fontSize: '12px', fontWeight: '400', marginLeft: '6px', color: form.message.length > 1800 ? '#F43F5E' : textSub }}>
                      ({form.message.length} / 2000)
                    </span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <textarea name="message" value={form.message} onChange={handleChange} onBlur={handleBlur} placeholder="Cuéntanos sobre tu negocio y cómo podemos ayudarte..." rows={5} style={inputStyle('message', { resize: 'vertical' })} />
                    {touched.message && !errors.message && form.message && (
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', top: '12px', fontSize: '18px', color: '#10B981' }}>check_circle</span>
                    )}
                  </div>
                  <FieldError field="message" />
                </div>

                {/* Draft indicator */}
                {(form.name || form.email || form.message) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>save</span>
                    Borrador guardado automáticamente
                  </div>
                )}

                {/* Error banner */}
                {status === 'error' && (
                  <div style={{ padding: '12px 16px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#F43F5E' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                    Algo salió mal. Por favor intenta de nuevo.
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={status === 'sending'}
                  style={{
                    padding: '14px', background: status === 'sending' ? '#94A3B8' : isFormValid() ? '#2563EB' : '#94A3B8',
                    color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: isFormValid() ? '0 4px 16px rgba(37,99,235,0.3)' : 'none', transition: 'background 0.2s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {status === 'sending' ? 'hourglass_empty' : 'send'}
                  </span>
                  {status === 'sending' ? t('contact.sending') : t('contact.send')}
                </button>

                <p style={{ fontSize: '12px', color: textSub, textAlign: 'center' }}>
                  Al enviar aceptas nuestra política de privacidad. Nunca compartimos tus datos.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default Contact