import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getLeads, updateLeadStatus } from '../../services/leadService'
import { getMessages, addMessage, getFollowups, createFollowup, updateFollowup } from '../../services/leadService'

function LeadDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { token, user } = useAuth()

  const [lead, setLead]           = useState(null)
  const [messages, setMessages]   = useState([])
  const [followups, setFollowups] = useState([])
  const [newMsg, setNewMsg]       = useState('')
  const [newDate, setNewDate]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      setLoading(true)
      const [leads, msgs, fups] = await Promise.all([
        getLeads(token),
        getMessages(id, token),
        getFollowups(id, token)
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

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim()) return
    try {
      setSending(true)
      const msg = await addMessage(id, newMsg, token)
      setMessages(prev => [...prev, msg])
      setNewMsg('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  async function handleStatusChange(status) {
    try {
      const updated = await updateLeadStatus(id, status, token)
      setLead(updated)
    } catch (err) {
      setError(err.message)
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
    negotiating: '#F59E0B', won: '#10B981', lost: '#F43F5E'
  }

  const statusLabels = {
    new: 'Nuevo', contacted: 'Contactado',
    negotiating: 'Negociando', won: 'Ganado', lost: 'Perdido'
  }

  if (loading) return <div style={styles.center}>Cargando...</div>
  if (!lead)   return null

  return (
    <div style={styles.container}>
      {/* Back button */}
      <button style={styles.backBtn} onClick={() => navigate('/leads')}>
        ← Volver a Leads
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {/* Lead Header */}
      <div style={styles.leadHeader}>
        <div>
          <h1 style={styles.leadName}>{lead.client_name}</h1>
          <p style={styles.leadText}>{lead.inquiry_text}</p>
        </div>
        <div style={styles.headerRight}>
          <span style={{...styles.statusBadge, background: statusColors[lead.status]}}>
            {statusLabels[lead.status]}
          </span>
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

      <div style={styles.grid}>
        {/* Messages */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💬 Mensajes</h2>
          <div style={styles.messageList}>
            {messages.length === 0 && (
              <p style={styles.empty}>Sin mensajes aún</p>
            )}
            {messages.map(msg => (
              <div key={msg.id} style={{
                ...styles.message,
                alignSelf: msg.sent_by === user?.id ? 'flex-end' : 'flex-start',
                background: msg.sent_by === user?.id ? 'var(--color-brand)' : 'var(--color-surface-2)',
                color: msg.sent_by === user?.id ? 'white' : 'var(--color-text-primary)',
              }}>
                <p style={styles.msgContent}>{msg.content}</p>
                <p style={{...styles.msgMeta, color: msg.sent_by === user?.id ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)'}}>
                  {msg.sender_name} · {new Date(msg.sent_at).toLocaleString()}
                  {msg.ai_generated && ' · 🤖 IA'}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} style={styles.msgForm}>
            <input
              style={styles.msgInput}
              placeholder="Escribe un mensaje..."
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
            />
            <button style={styles.sendBtn} type="submit" disabled={sending}>
              {sending ? '...' : 'Enviar'}
            </button>
          </form>
        </div>

        {/* Followups */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📅 Seguimientos</h2>
          <div style={styles.followupList}>
            {followups.length === 0 && (
              <p style={styles.empty}>Sin seguimientos programados</p>
            )}
            {followups.map(fup => (
              <div key={fup.id} style={{
                ...styles.followupCard,
                opacity: fup.sent ? 0.6 : 1,
              }}>
                <div>
                  <p style={styles.followupDate}>
                    📅 {new Date(fup.scheduled_at).toLocaleString()}
                  </p>
                  {fup.outcome && (
                    <p style={styles.followupOutcome}>{fup.outcome}</p>
                  )}
                </div>
                {!fup.sent && (
                  <button
                    style={styles.doneBtn}
                    onClick={() => handleFollowupDone(fup)}
                  >
                    ✓ Hecho
                  </button>
                )}
                {fup.sent && (
                  <span style={styles.doneBadge}>✅ Completado</span>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleCreateFollowup} style={styles.followupForm}>
            <input
              style={styles.msgInput}
              type="datetime-local"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
            />
            <button style={styles.sendBtn} type="submit">
              + Añadir
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: 'var(--color-text-secondary)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-brand)',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    marginBottom: '16px',
    padding: 0,
    fontWeight: '600',
  },
  error: {
    background: 'var(--color-error-light)',
    color: 'var(--color-error)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '16px',
    fontSize: 'var(--text-sm)',
  },
  leadHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: 'var(--color-white)',
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    marginBottom: '24px',
  },
  leadName: {
    fontSize: 'var(--text-2xl)',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    marginBottom: '8px',
  },
  leadText: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  statusBadge: {
    color: 'white',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
  },
  statusSelect: {
    padding: '6px 10px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  section: {
    background: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    boxShadow: 'var(--shadow-sm)',
  },
  sectionTitle: {
    fontSize: 'var(--text-lg)',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    marginBottom: '16px',
  },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '350px',
    overflowY: 'auto',
    marginBottom: '16px',
  },
  message: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    maxWidth: '80%',
  },
  msgContent: {
    fontSize: 'var(--text-sm)',
    marginBottom: '4px',
  },
  msgMeta: {
    fontSize: 'var(--text-xs)',
  },
  msgForm: {
    display: 'flex',
    gap: '8px',
  },
  msgInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
  },
  sendBtn: {
    padding: '8px 16px',
    background: 'var(--gradient-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  empty: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--text-sm)',
    textAlign: 'center',
    padding: '20px 0',
  },
  followupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '350px',
    overflowY: 'auto',
    marginBottom: '16px',
  },
  followupCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },
  followupDate: {
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
  },
  followupOutcome: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-secondary)',
    marginTop: '2px',
  },
  doneBtn: {
    padding: '4px 10px',
    background: 'var(--color-success-light)',
    color: 'var(--color-success)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  doneBadge: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-success)',
    fontWeight: '600',
  },
  followupForm: {
    display: 'flex',
    gap: '8px',
  },
}

export default LeadDetail