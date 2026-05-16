import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  'crm-para-pequenas-empresas-espana':                { img: blog1Img, tagColor: '#2563EB', tagKey: 'crm',         mins: 5, featured: true  },
  'como-dejar-de-gestionar-clientes-con-excel':       { img: blog2Img, tagColor: '#10B981', tagKey: 'gestion',     mins: 4, featured: false },
  'control-inventario-pymes-sin-complicaciones':      { img: blog3Img, tagColor: '#F59E0B', tagKey: 'inventario',  mins: 6, featured: false },
  'software-gestion-pymes-que-vale-la-pena':          { img: blog4Img, tagColor: '#8B5CF6', tagKey: 'software',    mins: 5, featured: false },
  'como-no-perder-clientes-por-falta-de-seguimiento': { img: blog5Img, tagColor: '#F43F5E', tagKey: 'ventas',      mins: 4, featured: false },
  'gestionar-proveedores-sin-llamadas-ni-emails':     { img: blog6Img, tagColor: '#0EA5E9', tagKey: 'proveedores', mins: 5, featured: false },
}

const SLUGS = Object.keys(META)
const LANGS = [
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
]

export default function Blog() {
  const navigate   = useNavigate()
  const { t, i18n } = useTranslation()
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'
  const [hovered,   setHovered]   = useState(null)
  const [activeTag, setActiveTag] = useState('all')
  const [isMobile,  setIsMobile]  = useState(window.innerWidth <= 768)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const pageBg    = isDark ? '#0F172A' : '#F8FAFC'
  const cardBg    = isDark ? '#1E293B' : 'white'
  const border    = isDark ? '#334155' : '#E2E8F0'
  const textMain  = isDark ? '#F1F5F9' : '#0F172A'
  const textSub   = isDark ? '#94A3B8' : '#64748B'
  const textMuted = isDark ? '#64748B' : '#94A3B8'
  const surfBg    = isDark ? '#0F172A' : '#F8FAFC'

  function switchLang(code) {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
  }

  const tagKeys = ['all', 'crm', 'gestion', 'inventario', 'software', 'ventas', 'proveedores']

  const posts = SLUGS.map(slug => ({
    slug,
    title:   t(`blog.posts.${slug}.title`),
    excerpt: t(`blog.posts.${slug}.description`),
    tag:     t(`blog.posts.${slug}.tag`),
    date:    t(`blog.posts.${slug}.date`),
    alt:     t(`blog.posts.${slug}.title`),
    ...META[slug],
  }))

  const filtered  = activeTag === 'all' ? posts : posts.filter(p => p.tagKey === activeTag)
  const featured  = filtered.find(p => p.featured) || filtered[0]
  const secondary = filtered.filter(p => p !== featured)

  const stats = [
    { icon: 'article',     value: '6',      label: t('blog.stat1') || 'Artículos publicados' },
    { icon: 'schedule',    value: '~29',    label: t('blog.stat2') || 'Minutos de lectura total' },
    { icon: 'trending_up', value: '100%',   label: t('blog.stat3') || 'Enfocados en pymes' },
    { icon: 'star',        value: t('blog.statFree') || 'Gratis', label: t('blog.stat4') || 'Siempre gratuito' },
  ]

  return (
    <>
      <Helmet>
        <title>Blog — Salesek | {t('blog.title')}</title>
        <meta name="description" content={t('blog.subtitle')} />
        <link rel="canonical" href="https://serelmejor.vercel.app/blog" />
      </Helmet>

      <PublicNavbar />

      <div style={{ background: pageBg, minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

        {/* Language bar */}
        <div style={{ background: isDark ? '#0F172A' : '#F1F5F9', borderBottom: `1px solid ${border}`, padding: '8px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '12px', color: textSub, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>translate</span>
              {t('blog.langAvailable') || 'Este blog está disponible en 3 idiomas'}
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {LANGS.map(lang => (
                <button key={lang.code} onClick={() => switchLang(lang.code)} style={{ padding: '4px 12px', borderRadius: '99px', border: `1px solid ${i18n.language === lang.code ? '#2563EB' : border}`, background: i18n.language === lang.code ? '#2563EB' : 'transparent', color: i18n.language === lang.code ? 'white' : textSub, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>{lang.flag}</span><span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', padding: isMobile ? '48px 20px 40px' : 'clamp(56px,8vw,96px) 24px clamp(48px,7vw,80px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 18px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#60A5FA' }}>article</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#60A5FA', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('blog.badge')}</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '28px' : 'clamp(26px, 5vw, 48px)', fontWeight: '800', color: 'white', marginBottom: '16px', letterSpacing: '-0.03em', lineHeight: '1.15' }}>
              {t('blog.title')}
            </h1>
            <p style={{ fontSize: isMobile ? '15px' : 'clamp(14px, 2vw, 17px)', color: 'rgba(255,255,255,0.6)', lineHeight: '1.75', maxWidth: '540px', margin: '0 auto' }}>
              {t('blog.subtitle')}
            </p>
          </div>
        </div>

        {/* Tag filters */}
        <div style={{ background: isDark ? '#1E293B' : 'white', borderBottom: `1px solid ${border}`, boxShadow: isDark ? '0 1px 8px rgba(0,0,0,0.3)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '4px', overflowX: 'auto', padding: '10px 20px', scrollbarWidth: 'none' }}>
            {tagKeys.map(key => (
              <button key={key} onClick={() => setActiveTag(key)} style={{ padding: isMobile ? '6px 14px' : '7px 18px', borderRadius: '99px', border: activeTag === key ? 'none' : `1px solid ${border}`, background: activeTag === key ? '#2563EB' : 'transparent', color: activeTag === key ? 'white' : textSub, fontSize: isMobile ? '12px' : '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s ease', boxShadow: activeTag === key ? '0 4px 12px rgba(37,99,235,0.25)' : 'none' }}>
                {t(`blog.tags.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '24px 16px 60px' : 'clamp(32px,5vw,56px) 24px clamp(56px,8vw,96px)' }}>

          {/* Featured post */}
          {featured && (
            <div
              onClick={() => navigate(`/blog/${featured.slug}`)}
              onMouseEnter={() => setHovered('featured')}
              onMouseLeave={() => setHovered(null)}
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', background: cardBg, borderRadius: '24px', overflow: 'hidden', border: `2px solid ${hovered === 'featured' ? featured.tagColor : border}`, marginBottom: '48px', cursor: 'pointer', boxShadow: hovered === 'featured' ? '0 20px 56px rgba(0,0,0,0.2)' : isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)', transform: hovered === 'featured' ? 'translateY(-4px)' : 'translateY(0)', transition: 'all 0.28s ease' }}
            >
              <div style={{ position: 'relative', minHeight: isMobile ? '220px' : '300px', overflow: 'hidden' }}>
                <img src={featured.img} alt={featured.alt} loading="eager" width="600" height="300" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: isMobile ? '220px' : '300px', transform: hovered === 'featured' ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'white', background: featured.tagColor, padding: '5px 12px', borderRadius: '99px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{featured.tag}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'white', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '5px 12px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.25)' }}>⭐ {t('blog.featured')}</span>
                </div>
                <div style={{ position: 'absolute', bottom: '14px', left: '14px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', borderRadius: '99px', padding: '5px 14px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>schedule</span>
                    {featured.mins} {t('blog.mins')}
                  </span>
                </div>
              </div>
              <div style={{ padding: isMobile ? '20px' : 'clamp(24px, 4vw, 44px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ fontSize: '12px', color: textMuted, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                  {featured.date}
                </p>
                <h2 style={{ fontSize: isMobile ? '20px' : 'clamp(18px, 3vw, 28px)', fontWeight: '800', color: textMain, marginBottom: '12px', lineHeight: '1.3', letterSpacing: '-0.02em' }}>{featured.title}</h2>
                <p style={{ fontSize: '14px', color: textSub, lineHeight: '1.75', marginBottom: '20px' }}>{featured.excerpt}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', background: featured.tagColor, color: 'white', borderRadius: '12px', fontSize: '14px', fontWeight: '700', width: 'fit-content', boxShadow: `0 4px 16px ${featured.tagColor}40` }}>
                  {t('blog.readFull')}
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', transform: hovered === 'featured' ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.2s' }}>arrow_forward</span>
                </div>
              </div>
            </div>
          )}

          {/* Secondary grid */}
          {secondary.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563EB' }}>library_books</span>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: textMain }}>{t('blog.moreArticles') || 'Más artículos'}</h2>
                <div style={{ flex: 1, height: '1px', background: border, marginLeft: '8px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: isMobile ? '16px' : '24px' }}>
                {secondary.map((post, i) => (
                  <article key={post.slug} onClick={() => navigate(`/blog/${post.slug}`)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ background: cardBg, borderRadius: '20px', overflow: 'hidden', border: `1.5px solid ${hovered === i ? post.tagColor : border}`, cursor: 'pointer', transition: 'all 0.25s ease', transform: hovered === i && !isMobile ? 'translateY(-6px)' : 'translateY(0)', boxShadow: hovered === i ? '0 20px 48px rgba(0,0,0,0.2)' : isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                      <img src={post.img} alt={post.alt} width="400" height="200" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: hovered === i ? 'scale(1.07)' : 'scale(1)' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)' }} />
                      <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'white', background: post.tagColor, padding: '4px 11px', borderRadius: '99px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{post.tag}</span>
                      </div>
                      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>{post.date}</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: '700', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: '99px' }}>{post.mins} min</span>
                      </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '9px', lineHeight: '1.45' }}>{post.title}</h3>
                      <p style={{ fontSize: '13px', color: textSub, lineHeight: '1.7', marginBottom: '16px' }}>{post.excerpt}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: `1px solid ${border}` }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: post.tagColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {t('blog.readMore')}
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', transition: 'transform 0.2s', transform: hovered === i ? 'translateX(4px)' : 'translateX(0)' }}>arrow_forward</span>
                        </span>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${post.tagColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: post.tagColor }}>article</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* Stats */}
          <div style={{ marginTop: '56px', marginBottom: '40px', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {stats.map(stat => (
              <div key={stat.icon} style={{ background: cardBg, borderRadius: '16px', padding: '20px', textAlign: 'center', border: `1px solid ${border}` }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2563EB', marginBottom: '8px', display: 'block' }}>{stat.icon}</span>
                <p style={{ fontSize: '22px', fontWeight: '800', color: textMain, letterSpacing: '-0.02em', marginBottom: '4px' }}>{stat.value}</p>
                <p style={{ fontSize: '12px', color: textMuted }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', borderRadius: '24px', padding: isMobile ? '32px 20px' : 'clamp(32px, 5vw, 56px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#60A5FA', marginBottom: '16px', position: 'relative', zIndex: 1 }}>auto_awesome</span>
            <h3 style={{ fontSize: isMobile ? '22px' : 'clamp(20px, 3vw, 30px)', fontWeight: '800', color: 'white', marginBottom: '12px', letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>{t('blog.newsletter.title')}</h3>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '28px', lineHeight: '1.7', maxWidth: '460px', position: 'relative', zIndex: 1 }}>{t('blog.newsletter.subtitle')}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <button onClick={() => navigate('/register')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', width: isMobile ? '100%' : 'auto' }}>{t('blog.newsletter.button')}</button>
              <button onClick={() => navigate('/precios')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', width: isMobile ? '100%' : 'auto' }}>{t('pricing.cta') || 'Ver precios'}</button>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </>
  )
}