import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getLeads, createLead, updateLeadStatus, deleteLead } from '../../services/leadService'
import { showToast } from '../../components/ui/Toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const PAGE_SIZE = 5

function Leads() {
  const { token } = useAuth()
  const navigate  = useNavigate()
  const { t }     = useTranslation()
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const [leads,     setLeads]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [showForm,  setShowForm]  = useState(false)
  const [creating,  setCreating]  = useState(false)
  const [isMobile,  setIsMobile]  = useState(window.innerWidth <= 768)
  const [mounted,   setMounted]   = useState(false)
  const [activeCol, setActiveCol] = useState(null)
  const [pages,     setPages]     = useState({ new: 1, contacted: 1, negotiating: 1, won: 1, lost: 1 })
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult,  setAiResult]  = useState('')
  const [showAI,    setShowAI]    = useState(false)
  const [aiContext, setAiContext]  = useState('')

  const [form, setForm] = useState(() => {
    try { const s = localStorage.getItem('new_lead_form'); return s ? JSON.parse(s) : { client_name: '', inquiry_text: '', close_probability: 50 } }
    catch { return { client_name: '', inquiry_text: '', close_probability: 50 } }
  })

  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const border  = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const colBg    = isDark ? '#1E293B' : '#F1F5F9'

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => { loadLeads() }, [])

  async function loadLeads() {
    try {
      setLoading(true)
      const data = await getLeads(token)
      setLeads(Array.isArray(data) ? data : [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  function handleFormChange(field, value) {
    const updated = { ...form, [field]: value }
    setForm(updated)
    localStorage.setItem('new_lead_form', JSON.stringify(updated))
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.client_name.trim()) { setError('El nombre es obligatorio'); return }
    setError('')
    try {
      setCreating(true)
      const newLead = await createLead(form, token)
      setLeads(prev => [newLead, ...prev])
      setForm({ client_name: '', inquiry_text: '', close_probability: 50 })
      localStorage.removeItem('new_lead_form')
      setShowForm(false)
      showToast('Lead creado correctamente ✓', 'success')
    } catch (err) { setError(err.message) }
    finally { setCreating(false) }
  }

  async function handleStatusChange(leadId, newStatus) {
    try {
      const updated = await updateLeadStatus(leadId, newStatus, token)
      setLeads(prev => prev.map(l => l.id === leadId ? (updated.lead || updated) : l))
      showToast('Estado actualizado ✓', 'success')
    } catch (err) { setError(err.message) }
  }

  async function handleDelete(leadId) {
    if (!confirm('¿Eliminar este lead?')) return
    try {
      await deleteLead(leadId, token)
      setLeads(prev => prev.filter(l => l.id !== leadId))
      showToast('Lead eliminado', 'info')
    } catch (err) { setError(err.message) }
  }

  async function handleAI() {
    if (!aiContext.trim()) return
    setAiLoading(true)
    setAiResult('')
    try {
      const res = await fetch(`${API}/ai/draft-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inquiry_text: aiContext }),
      })
      const data = await res.json()
      setAiResult(data.draft || data.response || 'Respuesta generada')
    } catch { setAiResult('Error al conectar con la IA.') }
    finally { setAiLoading(false) }
  }

  const COLUMNS = [
    { id: 'new',         label: t('leads.statusNew')         || 'Nuevo',       color: '#64748B' },
    { id: 'contacted',   label: t('leads.statusContacted')   || 'Contactado',  color: '#2563EB' },
    { id: 'negotiating', label: t('leads.statusNegotiating') || 'Negociando',  color: '#F59E0B' },
    { id: 'won',         label: t('leads.statusWon')         || 'Ganado',      color: '#10B981' },
    { id: 'lost',        label: t('leads.statusLost')        || 'Perdido',     color: '#F43F5E' },
  ]

  const leadsByStatus = (status) => leads.filter(l => l.status === status)

  function paginatedLeads(status) {
    const all  = leadsByStatus(status)
    const page = pages[status] || 1
    return { items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: all.length, totalPages: Math.ceil(all.length / PAGE_SIZE) }
  }

  function setPage(status, page) { setPages(prev => ({ ...prev, [status]: page })) }

  const inputStyle = { width: '100%', padding: '10px 14px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', color: textMain, background: isDark ? '#0F172A' : '#F8FAFC', outline: 'none', boxSizing: 'border-box', marginBottom: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif' }

  const visibleColumns = isMobile && activeCol ? COLUMNS.filter(c => c.id === activeCol) : COLUMNS

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#2563EB', marginBottom: '12px', display: 'block', animation: 'spin 1.5s linear infinite' }}>refresh</span>
        <p>{t('leads.loading') || 'Cargando...'}</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding: isMobile ? '0 0 80px' : '0 0 40px', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: textMain, letterSpacing: '-0.5px' }}>SalesFlow CRM</h1>
          <p style={{ fontSize: '13px', color: textSub, marginTop: '4px' }}>{leads.length} {t('leads.total') || 'leads en total'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAI(!showAI)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: showAI ? 'linear-gradient(135deg, #7C3AED, #2563EB)' : (isDark ? '#1E293B' : '#F1F5F9'), color: showAI ? 'white' : textSub, border: `1px solid ${showAI ? 'transparent' : border}`, borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>smart_toy</span>
            {!isMobile && 'Salesek AI'}
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            {t('leads.newLead') || 'Nuevo Lead'}
          </button>
        </div>
      </div>

      {/* AI Panel */}
      {showAI && (
        <div style={{ background: isDark ? '#0a0f1e' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE'}`, borderRadius: '16px', padding: '20px', marginBottom: '20px', animation: 'slideDown 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#7C3AED' }}>smart_toy</span>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>Salesek AI — Asistente de ventas</h3>
          </div>
          <textarea value={aiContext} onChange={e => setAiContext(e.target.value)} placeholder="Describe el lead o situación para generar una respuesta profesional..." rows={3} style={{ ...inputStyle, marginBottom: '10px', resize: 'vertical' }} />
          {aiResult && (
            <div style={{ background: isDark ? '#1E293B' : 'white', border: `1px solid ${border}`, borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', color: textSub, marginBottom: '4px', fontWeight: '600' }}>Respuesta IA:</p>
              <p style={{ fontSize: '14px', color: textMain, lineHeight: '1.6' }}>{aiResult}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleAI} disabled={aiLoading || !aiContext.trim()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: aiLoading || !aiContext.trim() ? 0.6 : 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{aiLoading ? 'hourglass_empty' : 'send'}</span>
              {aiLoading ? 'Generando...' : 'Generar respuesta'}
            </button>
            {aiResult && (
              <button onClick={() => navigator.clipboard.writeText(aiResult)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                Copiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', color: '#F43F5E', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* New Lead Form */}
      {showForm && (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px', marginBottom: '20px', maxWidth: '500px', animation: 'slideDown 0.2s ease' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: textMain, marginBottom: '16px' }}>{t('leads.newLead') || 'Nuevo Lead'}</h3>
          <form onSubmit={handleCreate}>
            <input style={inputStyle} placeholder={t('leads.clientName') || 'Nombre del cliente *'} value={form.client_name} onChange={e => handleFormChange('client_name', e.target.value)} />
            <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} placeholder={t('leads.description') || 'Descripción del interés'} value={form.inquiry_text} onChange={e => handleFormChange('inquiry_text', e.target.value)} />
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: textSub, marginBottom: '6px', display: 'block', fontWeight: '500' }}>
                {t('leads.probability') || 'Probabilidad de cierre'}: <strong style={{ color: '#2563EB' }}>{form.close_probability}%</strong>
              </label>
              <input type="range" min="0" max="100" value={form.close_probability} onChange={e => handleFormChange('close_probability', parseInt(e.target.value))} style={{ width: '100%', accentColor: '#2563EB' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: 'none', border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
              <button type="submit" disabled={creating} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{creating ? 'Guardando...' : t('common.save') || 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile column filter */}
      {isMobile && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', scrollbarWidth: 'none' }}>
          <button onClick={() => setActiveCol(null)} style={{ padding: '6px 14px', borderRadius: '99px', border: `1px solid ${!activeCol ? '#2563EB' : border}`, background: !activeCol ? '#2563EB' : 'transparent', color: !activeCol ? 'white' : textSub, fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Todos ({leads.length})
          </button>
          {COLUMNS.map(col => (
            <button key={col.id} onClick={() => setActiveCol(activeCol === col.id ? null : col.id)} style={{ padding: '6px 14px', borderRadius: '99px', border: `1px solid ${activeCol === col.id ? col.color : border}`, background: activeCol === col.id ? col.color : 'transparent', color: activeCol === col.id ? 'white' : textSub, fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {col.label} ({leadsByStatus(col.id).length})
            </button>
          ))}
        </div>
      )}

      {/* Board */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', paddingBottom: '16px' }}>
        {visibleColumns.map(col => {
          const { items, total, totalPages } = paginatedLeads(col.id)
          const currentPage = pages[col.id] || 1
          return (
            <div key={col.id} style={{ flex: isMobile ? 'none' : '1', minWidth: isMobile ? '100%' : '180px', background: colBg, borderRadius: '14px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: `2px solid ${col.color}` }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: col.color }}>{col.label}</span>
                <span style={{ background: col.color, color: 'white', borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>{total}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map(lead => (
                  <div key={lead.id} style={{ background: cardBg, borderRadius: '10px', padding: '12px', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${border}`, transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.06)' }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '700', color: textMain, marginBottom: '4px' }}>{lead.client_name}</div>
                    {lead.inquiry_text && <div style={{ fontSize: '11px', color: textSub, marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{lead.inquiry_text}</div>}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '10px', color: textSub }}>Cierre</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB' }}>{lead.close_probability}%</span>
                      </div>
                      <div style={{ height: '3px', background: isDark ? '#334155' : '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${lead.close_probability}%`, background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', borderRadius: '99px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select value={lead.status} onChange={e => { e.stopPropagation(); handleStatusChange(lead.id, e.target.value) }} onClick={e => e.stopPropagation()} style={{ flex: 1, padding: '4px 6px', border: `1px solid ${border}`, borderRadius: '6px', fontSize: '11px', color: textMain, background: isDark ? '#0F172A' : '#F8FAFC', outline: 'none', cursor: 'pointer' }}>
                        {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <button onClick={e => { e.stopPropagation(); navigate(`/leads/${lead.id}`) }} style={{ padding: '4px 10px', background: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>{t('common.view') || 'Ver'}</button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(lead.id) }} style={{ padding: '4px 6px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑</button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div style={{ textAlign: 'center', color: textSub, fontSize: '12px', padding: '20px 0', opacity: 0.7 }}>Sin leads</div>}
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${border}` }}>
                  <button onClick={() => setPage(col.id, Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ width: '24px', height: '24px', borderRadius: '6px', border: `1px solid ${border}`, background: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === 1 ? 0.4 : 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
                  </button>
                  <span style={{ fontSize: '11px', color: textSub }}>{currentPage}/{totalPages}</span>
                  <button onClick={() => setPage(col.id, Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={{ width: '24px', height: '24px', borderRadius: '6px', border: `1px solid ${border}`, background: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === totalPages ? 0.4 : 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

export default Leads