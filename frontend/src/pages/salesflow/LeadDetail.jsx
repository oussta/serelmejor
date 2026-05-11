import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { request } from '../../services/api'
import { getLeads, updateLeadStatus, getMessages, addMessage, getFollowups, createFollowup, updateFollowup } from '../../services/leadService'

// ── AI Modal ──────────────────────────────────────────────
function AIModal({ lead, token, user, onClose }) {
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [isTyping,  setIsTyping]  = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem(`ai_chat_${lead.id}`)
    if (saved) setMessages(JSON.parse(saved))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function askAI(text) {
    const userMsg = {
      id: Date.now(), content: text, role: 'user',
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setIsTyping(true)
    try {
      const data = await request('POST', '/ai/draft-response', { inquiry_text: text }, token)
      const aiMsg = {
        id: Date.now() + 1, content: data.draft, role: 'ai',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }
      const final = [...updated, aiMsg]
      setMessages(final)
      localStorage.setItem(`ai_chat_${lead.id}`, JSON.stringify(final))
    } catch {
      const errMsg = {
        id: Date.now() + 1,
        content: 'Lo siento, no pude procesar tu solicitud. Intenta de nuevo.',
        role: 'ai',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }
      const final = [...updated, errMsg]
      setMessages(final)
      localStorage.setItem(`ai_chat_${lead.id}`, JSON.stringify(final))
    } finally {
      setAiLoading(false)
      setIsTyping(false)
    }
  }

  async function handleAskAI(e) {
    e.preventDefault()
    if (!input.trim()) return
    setAiLoading(true)
    await askAI(input)
  }

  function handleClear() {
    if (!confirm('¿Limpiar el historial del chat IA?')) return
    setMessages([])
    localStorage.removeItem(`ai_chat_${lead.id}`)
  }

  return (
    <div style={modal.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal.container}>
        <div style={modal.bg}>
          <div style={{ ...modal.orb, top: '-20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)' }} />
          <div style={{ ...modal.orb, bottom: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)' }} />
        </div>

        {/* Header */}
        <div style={modal.header}>
          <div style={modal.headerLeft}>
            <div style={{ position: 'relative' }}>
              <div style={modal.aiAvatar}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'white' }}>smart_toy</span>
              </div>
              <div style={modal.onlinePulse} />
            </div>
            <div>
              <div style={modal.aiName}>Salesek AI</div>
              <div style={modal.aiSubtitle}>
                <div style={modal.onlineDot} />
                Asistente de ventas inteligente
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={modal.clearBtn} onClick={handleClear}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete_sweep</span>
            </button>
            <button style={modal.closeBtn} onClick={onClose}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        </div>

        {/* Context bar */}
        <div style={modal.contextBar}>
          <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>person</span>
          <span style={modal.contextText}>
            Hablando sobre: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{lead.client_name}</strong>
          </span>
        </div>

        {/* Messages */}
        <div style={modal.messages}>
          {messages.length === 0 && (
            <div style={modal.welcome}>
              <div style={modal.welcomeGlow} />
              <div style={modal.welcomeIconBox}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#2563EB' }}>smart_toy</span>
              </div>
              <p style={modal.welcomeTitle}>¿En qué puedo ayudarte?</p>
              <p style={modal.welcomeSub}>Pregúntame sobre estrategias de venta, cómo responder al cliente, o pide una respuesta profesional.</p>
              <div style={modal.suggestions}>
                {['¿Cómo responder a este lead?', 'Dame una propuesta de precio', 'Estrategia de seguimiento'].map((s, i) => (
                  <button key={i} style={modal.suggBtn} onClick={() => askAI(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} style={{ ...modal.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'ai' && (
                <div style={modal.msgAiAvatar}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'white' }}>smart_toy</span>
                </div>
              )}
              <div style={{
                ...modal.msgBubble,
                background: msg.role === 'user' ? 'linear-gradient(135deg, #2563EB, #0EA5E9)' : 'rgba(255,255,255,0.06)',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <p style={modal.msgText}>{msg.content}</p>
                <p style={modal.msgTime}>{msg.time}</p>
              </div>
              {msg.role === 'user' && (
                <div style={modal.msgUserAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ ...modal.msgRow, justifyContent: 'flex-start' }}>
              <div style={modal.msgAiAvatar}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'white' }}>smart_toy</span>
              </div>
              <div style={{ ...modal.msgBubble, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px 20px 20px 4px' }}>
                <div style={{ display: 'flex', gap: '4px', padding: '4px 2px' }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'inline-block', animation: `bounce 1.2s infinite ${d}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={modal.footer}>
          <form onSubmit={handleAskAI} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              style={modal.input}
              placeholder="Escribe tu pregunta al asistente..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={aiLoading}
              autoFocus
            />
            <button
              style={{ ...modal.sendBtn, opacity: input.trim() && !aiLoading ? 1 : 0.4 }}
              type="submit"
              disabled={!input.trim() || aiLoading}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
            </button>
          </form>
          <p style={modal.footerNote}>Powered by AI · serElMejor</p>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-10px)} }
      `}</style>
    </div>
  )
}

const modal = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' },
  container: { width: '100%', maxWidth: '640px', height: '680px', background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1628 60%, #080e1c 100%)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)', animation: 'modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative' },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: '50%', animation: 'orbFloat 8s ease-in-out infinite' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  aiAvatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(37,99,235,0.5)' },
  onlinePulse: { position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', border: '2px solid #0a0f1e', animation: 'pulse 2s infinite' },
  aiName: { color: 'white', fontSize: '15px', fontWeight: '700' },
  aiSubtitle: { display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' },
  onlineDot: { width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' },
  clearBtn: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  closeBtn: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  contextBar: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 1 },
  contextText: { fontSize: '11px', color: 'rgba(255,255,255,0.35)' },
  messages: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 },
  welcome: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px', textAlign: 'center', position: 'relative' },
  welcomeGlow: { position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  welcomeIconBox: { width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(14,165,233,0.2))', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  welcomeTitle: { color: 'white', fontSize: '18px', fontWeight: '700', marginBottom: '8px' },
  welcomeSub: { color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6', maxWidth: '280px', marginBottom: '20px' },
  suggestions: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '320px' },
  suggBtn: { padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  msgAiAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgUserAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 },
  msgBubble: { padding: '12px 16px', maxWidth: '75%' },
  msgText: { color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.6', marginBottom: '4px' },
  msgTime: { color: 'rgba(255,255,255,0.25)', fontSize: '10px', textAlign: 'right' },
  footer: { padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 },
  input: { flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '13px', color: 'white', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  sendBtn: { width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' },
  footerNote: { textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '10px', marginTop: '8px' },
}

// ── LeadDetail ────────────────────────────────────────────
function LeadDetail() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const { token, user } = useAuth()

  // Core state
  const [lead,      setLead]      = useState(null)
  const [messages,  setMessages]  = useState([])
  const [followups, setFollowups] = useState([])
  const [newMsg,    setNewMsg]    = useState(() => localStorage.getItem(`draft_msg_${id}`) || '')
  const [newDate,   setNewDate]   = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const [error,     setError]     = useState('')
  const [showAI,    setShowAI]    = useState(false)

  // Won modal + Bridge state
  const [showWonModal, setShowWonModal] = useState(false)
  const [wonProductId, setWonProductId] = useState('')
  const [wonQuantity,  setWonQuantity]  = useState(1)
  const [products,     setProducts]     = useState([])
  const [bridgeResult, setBridgeResult] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      setLoading(true)
      const [leads, msgs, fups] = await Promise.all([
        getLeads(token),
        getMessages(id, token),
        getFollowups(id, token),
      ])
      const found = leads.find(l => l.id === parseInt(id))
      if (!found) { navigate('/leads'); return }
      setLead(found)
      setMessages(msgs)
      setFollowups(fups)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {}
  }

  async function handleStatusChange(status) {
    if (status === 'won') {
      await loadProducts()
      setWonProductId('')
      setWonQuantity(1)
      setShowWonModal(true)
      return
    }
    try {
      const updated = await updateLeadStatus(id, status, token)
      setLead(updated.lead || updated)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleConfirmWon() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/leads/${id}/status`,  {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status:     'won',
          product_id: wonProductId ? parseInt(wonProductId) : null,
          quantity:   parseInt(wonQuantity),
        }),
      })
      const data = await res.json()
      setLead(data.lead || data)
      setBridgeResult(data.bridge || null)
      setShowWonModal(false)
    } catch (err) {
      setError(err.message)
    }
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
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  async function handleCreateFollowup(e) {
    e.preventDefault()
    if (!newDate) return
    try {
      const fup = await createFollowup(id, newDate, token)
      setFollowups(prev => [...prev, fup])
      setNewDate('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleFollowupDone(fup) {
    try {
      const updated = await updateFollowup(id, fup.id, { sent: true, outcome: 'Completado' }, token)
      setFollowups(prev => prev.map(f => f.id === fup.id ? updated : f))
    } catch (err) {
      setError(err.message)
    }
  }

  const statusColors = {
    new: '#64748B', contacted: '#2563EB',
    negotiating: '#F59E0B', won: '#10B981', lost: '#F43F5E',
  }
  const statusLabels = {
    new: 'Nuevo', contacted: 'Contactado',
    negotiating: 'Negociando', won: 'Ganado', lost: 'Perdido',
  }

  if (loading) return (
    <div style={styles.center}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Cargando...</p>
    </div>
  )
  if (!lead) return null

  return (
    <div style={styles.container}>

      {/* AI Modal */}
      {showAI && (
        <AIModal lead={lead} token={token} user={user} onClose={() => setShowAI(false)} />
      )}

      {/* ── Won Modal ── */}
      {showWonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ background: 'var(--color-white)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#10B981' }}>celebration</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>¡Lead ganado! 🎉</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                ¿Se vendió algún producto? El stock se actualizará automáticamente.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Producto vendido (opcional)
                </label>
                <select
                  value={wonProductId}
                  onChange={e => setWonProductId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--color-surface)', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="">Sin producto asociado</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.current_stock})
                    </option>
                  ))}
                </select>
              </div>

              {wonProductId && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Cantidad vendida
                  </label>
                  <input
                    type="number" min="1"
                    value={wonQuantity}
                    onChange={e => setWonQuantity(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--color-surface)', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>hub</span>
                  The Bridge actuará automáticamente si el stock baja del mínimo
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowWonModal(false)}
                  style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmWon}
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Confirmar victoria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bridge toast ── */}
      {bridgeResult && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: bridgeResult.low_stock ? '#F59E0B' : '#10B981', color: 'white', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 200, maxWidth: '340px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', flexShrink: 0 }}>
              {bridgeResult.low_stock ? 'warning' : 'check_circle'}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                {bridgeResult.low_stock ? '⚠️ Stock bajo detectado' : '✅ Lead ganado'}
              </p>
              <p style={{ fontSize: '13px', opacity: 0.9 }}>
                {bridgeResult.stock_deducted && 'Stock actualizado. '}
                {bridgeResult.order_created && `Pedido #${bridgeResult.order_id} creado automáticamente.`}
                {!bridgeResult.stock_deducted && 'Estado actualizado correctamente.'}
              </p>
            </div>
            <button
              onClick={() => setBridgeResult(null)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', flexShrink: 0 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        </div>
      )}

      {/* Back button */}
      <button style={styles.backBtn} onClick={() => navigate('/leads')}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        Volver a Leads
      </button>

      {error && (
        <div style={styles.errorBanner}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
          {error}
          <button style={styles.errorClose} onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Lead Header */}
      <div style={styles.leadHeader}>
        <div style={styles.leadHeaderLeft}>
          <div style={styles.leadAvatar}>
            {lead.client_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={styles.leadName}>{lead.client_name}</h1>
            <p style={styles.leadText}>{lead.inquiry_text}</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.aiBtn} onClick={() => setShowAI(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>smart_toy</span>
            Salesek AI
          </button>
          <div style={{ ...styles.statusBadge, background: statusColors[lead.status] }}>
            {statusLabels[lead.status]}
          </div>
          <select
            style={styles.statusSelect}
            value={lead.status}
            onChange={e => handleStatusChange(e.target.value)}
          >
            {Object.entries(statusLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={styles.grid}>

        {/* Messages */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-brand)' }}>chat</span>
              Mensajes internos
            </h2>
            <span style={styles.msgCount}>{messages.length} mensajes</span>
          </div>
          <div style={styles.messageList}>
            {messages.length === 0 && (
              <div style={styles.emptyState}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-text-muted)' }}>chat_bubble_outline</span>
                <p style={styles.emptyText}>Sin mensajes aún</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} style={{ ...styles.msgWrapper, justifyContent: msg.sent_by === user?.id ? 'flex-end' : 'flex-start' }}>
                {msg.sent_by !== user?.id && (
                  <div style={styles.msgAvatar}>{msg.sender_name?.charAt(0)}</div>
                )}
                <div style={{
                  ...styles.msgBubble,
                  background: msg.sent_by === user?.id ? 'var(--gradient-primary)' : 'var(--color-surface-2)',
                  color: msg.sent_by === user?.id ? 'white' : 'var(--color-text-primary)',
                  borderRadius: msg.sent_by === user?.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                }}>
                  <p style={styles.msgContent}>{msg.content}</p>
                  <p style={{ ...styles.msgMeta, color: msg.sent_by === user?.id ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)' }}>
                    {msg.sender_name} · {new Date(msg.sent_at).toLocaleString()}
                    {msg.ai_generated && ' · 🤖'}
                  </p>
                </div>
                {msg.sent_by === user?.id && (
                  <div style={{ ...styles.msgAvatar, background: 'var(--gradient-primary)', color: 'white' }}>
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} style={styles.msgForm}>
            <input
              style={styles.msgInput}
              placeholder="Escribe un mensaje interno..."
              value={newMsg}
              onChange={e => {
                setNewMsg(e.target.value)
                localStorage.setItem(`draft_msg_${id}`, e.target.value)
              }}
            />
            <button style={styles.sendBtn} type="submit" disabled={sending}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
            </button>
          </form>
        </div>

        {/* Followups */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-warning)' }}>event_note</span>
              Seguimientos
            </h2>
            <span style={styles.msgCount}>{followups.length} programados</span>
          </div>
          <div style={styles.followupList}>
            {followups.length === 0 && (
              <div style={styles.emptyState}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-text-muted)' }}>event_busy</span>
                <p style={styles.emptyText}>Sin seguimientos</p>
              </div>
            )}
            {followups.map(fup => (
              <div key={fup.id} style={{ ...styles.followupCard, opacity: fup.sent ? 0.6 : 1, borderLeft: `3px solid ${fup.sent ? 'var(--color-success)' : 'var(--color-warning)'}` }}>
                <div style={styles.followupInfo}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: fup.sent ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {fup.sent ? 'check_circle' : 'schedule'}
                  </span>
                  <div>
                    <p style={styles.followupDate}>
                      {new Date(fup.scheduled_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {fup.outcome && <p style={styles.followupOutcome}>{fup.outcome}</p>}
                  </div>
                </div>
                {!fup.sent && (
                  <button style={styles.doneBtn} onClick={() => handleFollowupDone(fup)}>✓ Hecho</button>
                )}
                {fup.sent && <span style={styles.doneBadge}>✅</span>}
              </div>
            ))}
          </div>
          <form onSubmit={handleCreateFollowup} style={styles.followupForm}>
            <input
              style={styles.dateInput}
              type="datetime-local"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
            />
            <button style={styles.addBtn} type="submit">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_alarm</span>
              Añadir
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '0 0 80px 0' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-brand)', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0, fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  errorBanner: { display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-error-light)', color: 'var(--color-error)', padding: '10px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px', fontWeight: '500' },
  errorClose: { marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '18px', fontWeight: '700', lineHeight: 1 },
  leadHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-white)', padding: '20px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '24px', border: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '16px' },
  leadHeaderLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  leadAvatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 },
  leadName: { fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' },
  leadText: { fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '400px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  aiBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #0a0f1e, #1e3a5f)', color: 'white', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  statusBadge: { color: 'white', padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '700' },
  statusSelect: { padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'white' },
 grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  section: { background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' },
  msgCount: { fontSize: '11px', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '3px 8px', borderRadius: 'var(--radius-full)' },
  messageList: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', marginBottom: '16px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '8px' },
  emptyText: { fontSize: '13px', color: 'var(--color-text-muted)' },
  msgWrapper: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  msgAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0, color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
  msgBubble: { padding: '10px 14px', maxWidth: '78%' },
  msgContent: { fontSize: '13px', marginBottom: '4px', lineHeight: '1.5' },
  msgMeta: { fontSize: '10px' },
  msgForm: { display: 'flex', gap: '8px' },
  msgInput: { flex: 1, padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  followupList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' },
  followupCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' },
  followupInfo: { display: 'flex', alignItems: 'center', gap: '8px' },
  followupDate: { fontSize: '12px', fontWeight: '600', color: 'var(--color-text-primary)' },
  followupOutcome: { fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' },
  doneBtn: { padding: '5px 10px', background: 'var(--color-success-light)', color: 'var(--color-success)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  doneBadge: { fontSize: '16px' },
  followupForm: { display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' },
  dateInput: { flex: 1, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '12px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', whiteSpace: 'nowrap' },
}

export default LeadDetail