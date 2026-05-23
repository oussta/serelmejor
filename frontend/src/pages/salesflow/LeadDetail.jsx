import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { request } from '../../services/api'
import { getLeads, updateLeadStatus, getMessages, addMessage, getFollowups, createFollowup, updateFollowup } from '../../services/leadService'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── AI Modal ──────────────────────────────────────────────
function AIModal({ lead, token, user, onClose, isDark }) {
  const { t } = useTranslation()
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [isTyping,  setIsTyping]  = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ai_chat_${lead.id}`)
      if (saved) setMessages(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  async function askAI(text) {
    const userMsg = { id: Date.now(), content: text, role: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setIsTyping(true)
    try {
      const data = await request('POST', '/ai/draft-response', { inquiry_text: text }, token)
      const aiMsg = { id: Date.now() + 1, content: data.draft, role: 'ai', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      const final = [...updated, aiMsg]
      setMessages(final)
      localStorage.setItem(`ai_chat_${lead.id}`, JSON.stringify(final))
    } catch {
      const errMsg = { id: Date.now() + 1, content: t('leadDetail.aiError') || 'Error al procesar. Intenta de nuevo.', role: 'ai', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      const final = [...updated, errMsg]
      setMessages(final)
      localStorage.setItem(`ai_chat_${lead.id}`, JSON.stringify(final))
    } finally { setAiLoading(false); setIsTyping(false) }
  }

  async function handleAskAI(e) {
    e.preventDefault()
    if (!input.trim()) return
    setAiLoading(true)
    await askAI(input)
  }

  function handleClear() {
    if (!confirm(t('leadDetail.clearChat') || '¿Limpiar el historial del chat IA?')) return
    setMessages([])
    localStorage.removeItem(`ai_chat_${lead.id}`)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: '640px', height: '680px', background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1628 60%, #080e1c 100%)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)', animation: 'modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(37,99,235,0.5)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'white' }}>smart_toy</span>
              </div>
              <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', border: '2px solid #0a0f1e', animation: 'pulse 2s infinite' }} />
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '15px', fontWeight: '700' }}>Salesek AI</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>{t('leadDetail.aiSubtitle') || 'Asistente de ventas inteligente'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleClear} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete_sweep</span>
            </button>
            <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        </div>

        {/* Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>person</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
            {t('leadDetail.talkingAbout') || 'Hablando sobre:'} <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{lead.client_name}</strong>
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(14,165,233,0.2))', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#2563EB' }}>smart_toy</span>
              </div>
              <p style={{ color: 'white', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{t('leadDetail.aiWelcome') || '¿En qué puedo ayudarte?'}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6', maxWidth: '280px', marginBottom: '20px' }}>{t('leadDetail.aiWelcomeSub') || 'Pregúntame sobre estrategias de venta o pide una respuesta profesional.'}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '320px' }}>
                {[
                  t('leadDetail.aiSugg1') || '¿Cómo responder a este lead?',
                  t('leadDetail.aiSugg2') || 'Dame una propuesta de precio',
                  t('leadDetail.aiSugg3') || 'Estrategia de seguimiento',
                ].map((s, i) => (
                  <button key={i} onClick={() => askAI(s)} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'ai' && <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'white' }}>smart_toy</span></div>}
              <div style={{ padding: '12px 16px', maxWidth: '75%', background: msg.role === 'user' ? 'linear-gradient(135deg, #2563EB, #0EA5E9)' : 'rgba(255,255,255,0.06)', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.6', marginBottom: '4px' }}>{msg.content}</p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', textAlign: 'right' }}>{msg.time}</p>
              </div>
              {msg.role === 'user' && <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }}>{user?.name?.charAt(0).toUpperCase()}</div>}
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'white' }}>smart_toy</span></div>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px 20px 20px 4px' }}>
                <div style={{ display: 'flex', gap: '4px', padding: '4px 2px' }}>
                  {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'inline-block', animation: `bounce 1.2s infinite ${d}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
          <form onSubmit={handleAskAI} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '13px', color: 'white', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }} placeholder={t('leadDetail.aiInputPlaceholder') || 'Escribe tu pregunta al asistente...'} value={input} onChange={e => setInput(e.target.value)} disabled={aiLoading} autoFocus />
            <button style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: input.trim() && !aiLoading ? 1 : 0.4 }} type="submit" disabled={!input.trim() || aiLoading}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
            </button>
          </form>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '10px', marginTop: '8px' }}>Powered by AI · Salesek</p>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}} @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.3)}} @keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  )
}

// ── LeadDetail ────────────────────────────────────────────
function LeadDetail() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const { token, user } = useAuth()
  const { theme }       = useTheme()
  const { t, i18n }    = useTranslation()
  const isDark          = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mounted,  setMounted]  = useState(false)

  const [lead,      setLead]      = useState(null)
  const [messages,  setMessages]  = useState([])
  const [followups, setFollowups] = useState([])
  const [newMsg,    setNewMsg]    = useState(() => localStorage.getItem(`draft_msg_${id}`) || '')
  const [newDate,   setNewDate]   = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const [error,     setError]     = useState('')
  const [showAI,    setShowAI]    = useState(false)
  const [showWonModal, setShowWonModal] = useState(false)
  const [wonProductId, setWonProductId] = useState('')
  const [wonQuantity,  setWonQuantity]  = useState(1)
  const [products,     setProducts]     = useState([])
  const [bridgeResult, setBridgeResult] = useState(null)

  const cardBg   = isDark ? '#1E293B' : 'white'
  const border   = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const surfBg   = isDark ? '#0F172A' : '#F8FAFC'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'
  const inputText = isDark ? '#F1F5F9' : '#0F172A'

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    loadAll()
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

async function loadAll() {
  try {
    setLoading(true)
    
    const leadData = await request('GET', `/leads/${id}`, null, token)
    console.log('lead ok:', leadData)
    
    const msgs = await getMessages(id, token)
    console.log('messages ok:', msgs)
    
    const fups = await getFollowups(id, token)
    console.log('followups ok:', fups)
    
    if (!leadData || leadData.error) { navigate('/leads'); return }
    setLead(leadData)
    setMessages(Array.isArray(msgs) ? msgs : [])
    setFollowups(Array.isArray(fups) ? fups : [])
  } catch (err) {
    console.error('FAILED AT:', err.message)
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  async function loadProducts() {
    try {
      const res  = await fetch(`${API}/products`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {}
  }

  async function handleStatusChange(status) {
    if (status === 'won') {
      await loadProducts()
      setWonProductId(''); setWonQuantity(1); setShowWonModal(true); return
    }
    try {
      const updated = await updateLeadStatus(id, status, token)
      setLead(updated.lead || updated)
    } catch (err) { setError(err.message) }
  }

  async function handleConfirmWon() {
    try {
      const res  = await fetch(`${API}/leads/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'won', product_id: wonProductId ? parseInt(wonProductId) : null, quantity: parseInt(wonQuantity) }),
      })
      const data = await res.json()
      setLead(data.lead || data)
      setBridgeResult(data.bridge || null)
      setShowWonModal(false)
    } catch (err) { setError(err.message) }
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim()) return
    try {
      setSending(true)
      const msg = await addMessage(id, newMsg, token)
      setMessages(prev => [...prev, msg])
      setNewMsg('')
      localStorage.removeItem(`draft_msg_${id}`)
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }

  async function handleCreateFollowup(e) {
    e.preventDefault()
    if (!newDate) return
    try {
      const fup = await createFollowup(id, newDate, token)
      setFollowups(prev => [...prev, fup])
      setNewDate('')
    } catch (err) { setError(err.message) }
  }

  async function handleFollowupDone(fup) {
    try {
      const updated = await updateFollowup(id, fup.id, { sent: true, outcome: t('leadDetail.completed') || 'Completado' }, token)
      setFollowups(prev => prev.map(f => f.id === fup.id ? updated : f))
    } catch (err) { setError(err.message) }
  }

  const locale = i18n.language === 'en' ? 'en-GB' : i18n.language === 'fr' ? 'fr-FR' : 'es-ES'

  const statusColors = { new: '#64748B', contacted: '#2563EB', negotiating: '#F59E0B', won: '#10B981', lost: '#F43F5E' }
  const statusLabels = {
    new: t('leads.statusNew') || 'Nuevo',
    contacted: t('leads.statusContacted') || 'Contactado',
    negotiating: t('leads.statusNegotiating') || 'Negociando',
    won: t('leads.statusWon') || 'Ganado',
    lost: t('leads.statusLost') || 'Perdido',
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textSub }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#2563EB', display: 'block', marginBottom: '12px', animation: 'spin 1.5s linear infinite' }}>refresh</span>
        <p>{t('common.loading') || 'Cargando...'}</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!lead) return null

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', padding: isMobile ? '0 0 80px' : '0 0 40px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>

      {showAI && <AIModal lead={lead} token={token} user={user} onClose={() => setShowAI(false)} isDark={isDark} />}

      {/* Won Modal */}
      {showWonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: cardBg, borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${border}` }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#10B981' }}>celebration</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: textMain, marginBottom: '8px' }}>{t('leadDetail.wonTitle') || '¡Lead ganado! 🎉'}</h2>
              <p style={{ fontSize: '14px', color: textSub }}>{t('leadDetail.wonDesc') || '¿Se vendió algún producto? El stock se actualizará automáticamente.'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }}>{t('leadDetail.soldProduct') || 'Producto vendido (opcional)'}</label>
                <select value={wonProductId} onChange={e => setWonProductId(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: inputText, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">{t('leadDetail.noProduct') || 'Sin producto asociado'}</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>)}
                </select>
              </div>
              {wonProductId && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }}>{t('leadDetail.soldQuantity') || 'Cantidad vendida'}</label>
                  <input type="number" min="1" value={wonQuantity} onChange={e => setWonQuantity(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: inputText, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}
              <div style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>hub</span>
                  {t('leadDetail.bridgeNote') || 'The Bridge actuará automáticamente si el stock baja del mínimo'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowWonModal(false)} style={{ flex: 1, padding: '10px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '14px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
                <button onClick={handleConfirmWon} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('leadDetail.confirmWon') || 'Confirmar victoria'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bridge toast */}
      {bridgeResult && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: bridgeResult.low_stock ? '#F59E0B' : '#10B981', color: 'white', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 200, maxWidth: '340px', fontFamily: 'Plus Jakarta Sans, sans-serif', animation: 'slideIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', flexShrink: 0 }}>{bridgeResult.low_stock ? 'warning' : 'check_circle'}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{bridgeResult.low_stock ? (t('leadDetail.bridgeLowStock') || '⚠️ Stock bajo detectado') : (t('leadDetail.bridgeSuccess') || '✅ Lead ganado')}</p>
              <p style={{ fontSize: '13px', opacity: 0.9 }}>
                {bridgeResult.stock_deducted && (t('leadDetail.stockUpdated') || 'Stock actualizado. ')}
                {bridgeResult.order_created && `${t('leadDetail.orderCreated') || 'Pedido'} #${bridgeResult.order_id} ${t('leadDetail.createdAuto') || 'creado automáticamente.'}`}
                {!bridgeResult.stock_deducted && (t('leadDetail.statusUpdated') || 'Estado actualizado correctamente.')}
              </p>
            </div>
            <button onClick={() => setBridgeResult(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        </div>
      )}

      {/* Back */}
      <button onClick={() => navigate('/leads')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0, fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        {t('common.back') || 'Volver'} — Leads
      </button>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', color: '#F43F5E', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', border: '1px solid rgba(244,63,94,0.3)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Lead Header */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: isMobile ? '16px' : '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
            {lead.client_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '800', color: textMain, marginBottom: '4px' }}>{lead.client_name}</h1>
            {lead.inquiry_text && <p style={{ fontSize: '13px', color: textSub, maxWidth: '400px' }}>{lead.inquiry_text}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAI(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: 'linear-gradient(135deg, #0a0f1e, #1e3a5f)', color: 'white', border: '1px solid rgba(37,99,235,0.4)', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>smart_toy</span>
            {!isMobile && 'Salesek AI'}
          </button>
          <span style={{ color: 'white', background: statusColors[lead.status], padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '700' }}>{statusLabels[lead.status]}</span>
          <select value={lead.status} onChange={e => handleStatusChange(e.target.value)} style={{ padding: '6px 10px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: inputText, cursor: 'pointer' }}>
            {Object.entries(statusLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>

        {/* Messages */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${border}` }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: textMain }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>chat</span>
              {t('leadDetail.internalMessages') || 'Mensajes internos'}
            </h2>
            <span style={{ fontSize: '11px', color: textSub, background: isDark ? '#334155' : '#F1F5F9', padding: '3px 8px', borderRadius: '99px' }}>{messages.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', marginBottom: '16px' }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', color: textSub }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>chat_bubble_outline</span>
                <p style={{ fontSize: '13px' }}>{t('leadDetail.noMessages') || 'Sin mensajes aún'}</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: msg.sent_by === user?.id ? 'flex-end' : 'flex-start' }}>
                {msg.sent_by !== user?.id && <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDark ? '#334155' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0, color: textSub }}>{msg.sender_name?.charAt(0)}</div>}
                <div style={{ padding: '10px 14px', maxWidth: '78%', background: msg.sent_by === user?.id ? 'linear-gradient(135deg, #2563EB, #0EA5E9)' : (isDark ? '#334155' : '#F1F5F9'), color: msg.sent_by === user?.id ? 'white' : textMain, borderRadius: msg.sent_by === user?.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px' }}>
                  <p style={{ fontSize: '13px', marginBottom: '4px', lineHeight: '1.5' }}>{msg.content}</p>
                  <p style={{ fontSize: '10px', opacity: 0.6 }}>{msg.sender_name} · {new Date(msg.sent_at).toLocaleString(locale)}{msg.ai_generated && ' · 🤖'}</p>
                </div>
                {msg.sent_by === user?.id && <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }}>{user?.name?.charAt(0)}</div>}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
            <input style={{ flex: 1, padding: '10px 14px', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', color: inputText, background: inputBg, outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }} placeholder={t('leadDetail.messagePlaceholder') || 'Escribe un mensaje interno...'} value={newMsg} onChange={e => { setNewMsg(e.target.value); localStorage.setItem(`draft_msg_${id}`, e.target.value) }} />
            <button type="submit" disabled={sending} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
            </button>
          </form>
        </div>

        {/* Followups */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${border}` }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: textMain }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#F59E0B' }}>event_note</span>
              {t('leadDetail.followups') || 'Seguimientos'}
            </h2>
            <span style={{ fontSize: '11px', color: textSub, background: isDark ? '#334155' : '#F1F5F9', padding: '3px 8px', borderRadius: '99px' }}>{followups.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
            {followups.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', color: textSub }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>event_busy</span>
                <p style={{ fontSize: '13px' }}>{t('leadDetail.noFollowups') || 'Sin seguimientos'}</p>
              </div>
            )}
            {followups.map(fup => (
              <div key={fup.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: surfBg, borderRadius: '10px', border: `1px solid ${border}`, borderLeft: `3px solid ${fup.sent ? '#10B981' : '#F59E0B'}`, opacity: fup.sent ? 0.7 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: fup.sent ? '#10B981' : '#F59E0B' }}>{fup.sent ? 'check_circle' : 'schedule'}</span>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: textMain }}>{new Date(fup.scheduled_at).toLocaleString(locale, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    {fup.outcome && <p style={{ fontSize: '11px', color: textSub, marginTop: '2px' }}>{fup.outcome}</p>}
                  </div>
                </div>
                {!fup.sent ? (
                  <button onClick={() => handleFollowupDone(fup)} style={{ padding: '5px 10px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: '#10B981', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>✓ {t('leadDetail.done') || 'Hecho'}</button>
                ) : (
                  <span style={{ fontSize: '16px' }}>✅</span>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleCreateFollowup} style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: `1px solid ${border}` }}>
            <input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ flex: 1, padding: '8px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '12px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: inputText }} />
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', whiteSpace: 'nowrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_alarm</span>
              {t('leadDetail.add') || 'Añadir'}
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default LeadDetail