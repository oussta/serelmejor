import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import PublicNavbar from '../../components/layout/PublicNavbar'
import PublicFooter from '../../components/layout/PublicFooter'

import blog1Img from '../../assets/images/blog1.png'
import blog2Img from '../../assets/images/blog2.png'
import blog3Img from '../../assets/images/blog3.png'
import blog4Img from '../../assets/images/blog4.png'
import blog5Img from '../../assets/images/blog5.png'
import blog6Img from '../../assets/images/blog6.png'

const META = {
  'crm-para-pequenas-empresas-espana':                { img: blog1Img, alt: 'Persona gestionando pipeline de ventas en un CRM para pequeña empresa española',   tagColor: '#2563EB', mins: 5 },
  'como-dejar-de-gestionar-clientes-con-excel':       { img: blog2Img, alt: 'Empresario mirando hojas de cálculo antes de usar software de gestión de clientes', tagColor: '#10B981', mins: 4 },
  'control-inventario-pymes-sin-complicaciones':      { img: blog3Img, alt: 'Control de inventario y gestión de stock en almacén con tablet para pymes',          tagColor: '#F59E0B', mins: 6 },
  'software-gestion-pymes-que-vale-la-pena':          { img: blog4Img, alt: 'Equipo de pequeña empresa revisando software de gestión empresarial en ordenador',   tagColor: '#8B5CF6', mins: 5 },
  'como-no-perder-clientes-por-falta-de-seguimiento': { img: blog5Img, alt: 'Comercial haciendo seguimiento de clientes potenciales por teléfono',                tagColor: '#F43F5E', mins: 4 },
  'gestionar-proveedores-sin-llamadas-ni-emails':     { img: blog6Img, alt: 'Gestión automatizada de pedidos a proveedores sin llamadas ni emails',               tagColor: '#0EA5E9', mins: 5 },
}

const SLUGS = Object.keys(META)

const LANGS = [
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
]

export default function BlogPost() {
  const { slug }      = useParams()
  const navigate      = useNavigate()
  const { t, i18n }  = useTranslation()
  const { theme }     = useTheme()
  const isDark        = theme === 'dark'
  const [hov, setHov] = useState(null)

  // ── Dark mode colors ──
  const pageBg     = isDark ? '#0F172A' : '#F8FAFC'
  const cardBg     = isDark ? '#1E293B' : 'white'
  const cardBorder = isDark ? '#334155' : '#E2E8F0'
  const textMain   = isDark ? '#F1F5F9' : '#0F172A'
  const textSub    = isDark ? '#94A3B8' : '#374151'
  const textMuted  = isDark ? '#64748B' : '#94A3B8'
  const langBarBg  = isDark ? '#0F172A' : '#F1F5F9'
  const inputBg    = isDark ? '#0F172A' : '#F8FAFC'

  function switchLang(code) {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
  }

  const meta = META[slug]

  if (!meta) return (
    <>
      <PublicNavbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: pageBg, minHeight: '100vh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '56px', color: textMuted, marginBottom: '16px', display: 'block' }}>article</span>
        <h1 style={{ fontSize: '24px', color: textMain, marginBottom: '16px' }}>Artículo no encontrado</h1>
        <button onClick={() => navigate('/blog')} style={{ padding: '10px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', fontWeight: '600' }}>
          {t('blog.back')}
        </button>
      </div>
      <PublicFooter />
    </>
  )

  const title       = t(`blog.posts.${slug}.title`)
  const description = t(`blog.posts.${slug}.description`)
  const tag         = t(`blog.posts.${slug}.tag`)
  const date        = t(`blog.posts.${slug}.date`)
  const content     = t(`blog.posts.${slug}.content`)

  const related = SLUGS
    .filter(s => s !== slug)
    .slice(0, 3)
    .map(s => ({
      slug:  s,
      title: t(`blog.posts.${s}.title`),
      tag:   t(`blog.posts.${s}.tag`),
      date:  t(`blog.posts.${s}.date`),
      ...META[s],
    }))

  return (
    <>
      <Helmet>
        <title>{title} — Salesek Blog</title>
        <meta name="description"        content={description} />
        <meta property="og:title"       content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image"       content={meta.img} />
        <meta property="og:type"        content="article" />
        <link rel="canonical" href={`https://salesek.onrender.com/blog/${slug}`} />
      </Helmet>

      <PublicNavbar />

      <div style={{ background: pageBg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

        {/* ── LANGUAGE BAR ── */}
        <div style={{ background: langBarBg, borderBottom: `1px solid ${cardBorder}`, padding: '8px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '12px', color: textMuted, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>translate</span>
              Este artículo está disponible en 3 idiomas
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {LANGS.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => switchLang(lang.code)}
                  style={{
                    padding:      '4px 12px',
                    borderRadius: '99px',
                    border:       `1px solid ${i18n.language === lang.code ? '#2563EB' : cardBorder}`,
                    background:   i18n.language === lang.code ? '#2563EB' : 'transparent',
                    color:        i18n.language === lang.code ? 'white' : textMuted,
                    fontSize:     '12px',
                    fontWeight:   '600',
                    cursor:       'pointer',
                    fontFamily:   'Plus Jakarta Sans, sans-serif',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '5px',
                    transition:   'all 0.15s',
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── HERO IMAGE ── */}
        <div style={{ width: '100%', height: 'clamp(260px, 42vw, 440px)', overflow: 'hidden', position: 'relative' }}>
          <img
            src={meta.img}
            alt={meta.alt}
            width="1200"
            height="440"
            loading="eager"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.8) 100%)' }} />

          {/* Back button */}
          <button
            onClick={() => navigate('/blog')}
            style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            {t('blog.back')}
          </button>

          {/* Post meta on image */}
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: 'clamp(20px, 4vw, 40px)', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'white', background: meta.tagColor, padding: '5px 14px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: `0 2px 10px ${meta.tagColor}60` }}>
                {tag}
              </span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                {date}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                {meta.mins} {t('blog.mins')}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(18px, 4vw, 36px)', fontWeight: '800', color: 'white', lineHeight: '1.25', letterSpacing: '-0.02em', maxWidth: '760px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {title}
            </h1>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) 24px 80px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px', alignItems: 'start' }}>

          {/* ── LEFT: Article ── */}
          <div>

            {/* Excerpt pull quote */}
            <div style={{ background: cardBg, borderRadius: '16px', padding: '22px 24px', marginBottom: '20px', borderLeft: `5px solid ${meta.tagColor}`, boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: meta.tagColor, flexShrink: 0, marginTop: '2px' }}>format_quote</span>
              <p style={{ fontSize: '16px', color: textSub, lineHeight: '1.7', fontStyle: 'italic', margin: 0, fontWeight: '500' }}>
                {description}
              </p>
            </div>

            {/* Article body */}
            <article
              style={{ background: cardBg, borderRadius: '20px', padding: 'clamp(24px, 5vw, 48px)', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.06)', border: `1px solid ${cardBorder}`, marginBottom: '24px' }}
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Reaction bar */}
            <div style={{ background: cardBg, borderRadius: '14px', padding: '16px 22px', border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: meta.tagColor }}>thumb_up</span>
                <p style={{ fontSize: '14px', fontWeight: '600', color: textMain, margin: 0 }}>{t('blog.useful')}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[t('blog.yes'), t('blog.quite')].map(label => (
                  <button
                    key={label}
                    style={{ padding: '7px 16px', borderRadius: '8px', border: `1px solid ${cardBorder}`, background: inputBg, color: textSub, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = meta.tagColor; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = meta.tagColor }}
                    onMouseLeave={e => { e.currentTarget.style.background = inputBg; e.currentTarget.style.color = textSub; e.currentTarget.style.borderColor = cardBorder }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Related articles */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>auto_stories</span>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: textMain, margin: 0 }}>{t('blog.related')}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {related.map((r, i) => (
                  <div
                    key={r.slug}
                    onClick={() => { navigate(`/blog/${r.slug}`); window.scrollTo(0, 0) }}
                    onMouseEnter={() => setHov(i)}
                    onMouseLeave={() => setHov(null)}
                    style={{ background: cardBg, border: `1.5px solid ${hov === i ? r.tagColor : cardBorder}`, borderRadius: '14px', padding: '14px', display: 'flex', gap: '14px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: hov === i ? '0 6px 20px rgba(0,0,0,0.15)' : 'none', transform: hov === i ? 'translateX(3px)' : 'translateX(0)' }}
                  >
                    <img
                      src={r.img}
                      alt={r.alt}
                      width="72"
                      height="72"
                      loading="lazy"
                      style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: r.tagColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.tag}</span>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: textMain, lineHeight: '1.4', marginTop: '3px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {r.title}
                      </p>
                      <p style={{ fontSize: '11px', color: textMuted, marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>schedule</span>
                        {r.mins} {t('blog.mins')}
                      </p>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: hov === i ? r.tagColor : textMuted, flexShrink: 0, alignSelf: 'center', transition: 'all 0.2s' }}>chevron_right</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '88px' }}>

            {/* Main CTA */}
            <div style={{ background: `linear-gradient(135deg, #1E3A5F, ${meta.tagColor})`, borderRadius: '20px', padding: '28px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
              <span className="material-symbols-outlined" style={{ fontSize: '34px', color: 'rgba(255,255,255,0.85)', marginBottom: '14px', display: 'block', position: 'relative', zIndex: 1 }}>rocket_launch</span>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '8px', lineHeight: '1.35', position: 'relative', zIndex: 1 }}>
                {t('blog.cta.title')}
              </h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px', lineHeight: '1.6', position: 'relative', zIndex: 1 }}>
                {t('blog.cta.subtitle')}
              </p>
              <button
                onClick={() => navigate('/register')}
                style={{ width: '100%', padding: '11px', background: 'white', color: meta.tagColor, border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative', zIndex: 1, transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {t('blog.cta.button')}
              </button>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '10px', position: 'relative', zIndex: 1 }}>
                {t('blog.cta.noCard')}
              </p>
            </div>

            {/* Features mini list */}
            <div style={{ background: cardBg, borderRadius: '16px', padding: '20px', border: `1px solid ${cardBorder}`, boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>
                Salesek incluye
              </p>
              {[
                { icon: 'contacts',      color: '#2563EB', label: 'CRM con pipeline visual' },
                { icon: 'inventory_2',   color: '#10B981', label: 'Control de inventario' },
                { icon: 'hub',           color: '#F59E0B', label: 'The Bridge automático' },
                { icon: 'notifications', color: '#8B5CF6', label: 'Alertas en tiempo real' },
                { icon: 'smart_toy',     color: '#0EA5E9', label: 'Asistente con IA' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: item.color }}>{item.icon}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: textSub, fontWeight: '500' }}>{item.label}</span>
                </div>
              ))}
              <button
                onClick={() => navigate('/precios')}
                style={{ width: '100%', marginTop: '6px', padding: '9px', background: inputBg, color: '#2563EB', border: `1px solid ${cardBorder}`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Ver precios →
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ background: cardBg, borderRadius: '16px', padding: '16px 20px', border: `1px solid ${cardBorder}`, boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }}>
              {[
                { icon: 'verified', color: '#10B981', label: '14 días gratis' },
                { icon: 'lock',     color: '#2563EB', label: 'Datos seguros (JWT + HTTPS)' },
                { icon: 'cancel',   color: '#F43F5E', label: 'Sin permanencia' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: item.color, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: textSub }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />

      <style>{`
        article h2 { font-size: clamp(17px, 3vw, 21px); font-weight: 800; color: ${textMain}; margin: 32px 0 12px; letter-spacing: -0.01em; line-height: 1.3; }
        article h2::before { content: ''; display: block; width: 32px; height: 3px; background: ${meta.tagColor}; border-radius: 99px; margin-bottom: 10px; }
        article p { font-size: 15px; color: ${textSub}; line-height: 1.85; margin-bottom: 18px; }
        article ul { padding-left: 6px; margin-bottom: 18px; list-style: none; }
        article li { font-size: 15px; color: ${textSub}; line-height: 1.75; margin-bottom: 10px; padding-left: 24px; position: relative; }
        article li::before { content: ''; position: absolute; left: 0; top: 9px; width: 8px; height: 8px; border-radius: 50%; background: ${meta.tagColor}; }
        article strong { color: ${textMain}; font-weight: 700; }
        article a { color: ${meta.tagColor}; font-weight: 600; text-decoration: none; border-bottom: 1px solid ${meta.tagColor}40; transition: border-color 0.15s; }
        article a:hover { border-color: ${meta.tagColor}; }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: minmax(0, 1fr) 300px"] { grid-template-columns: 1fr !important; }
          div[style*="position: sticky"] { position: relative !important; top: 0 !important; }
        }
      `}</style>
    </>
  )
}