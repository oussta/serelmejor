import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getLeads, createLead, updateLeadStatus, deleteLead } from '../../services/leadService'

const COLUMNS = [
  { id: 'new',         label: 'Nuevo',       color: '#64748B' },
  { id: 'contacted',   label: 'Contactado',  color: '#2563EB' },
  { id: 'negotiating', label: 'Negociando',  color: '#F59E0B' },
  { id: 'won',         label: 'Ganado',      color: '#10B981' },
  { id: 'lost',        label: 'Perdido',     color: '#F43F5E' },
]

function Leads() {
  const { token } = useAuth()
  const navigate  = useNavigate()

  const [leads, setLeads]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(() => {
    const saved = localStorage.getItem('new_lead_form')
    return saved ? JSON.parse(saved) : {
      client_name: '', inquiry_text: '', close_probability: 50
    }
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadLeads()
  }, [])

  async function loadLeads() {
    try {
      setLoading(true)
      const data = await getLeads(token)
      setLeads(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFormChange(field, value) {
    const updated = { ...form, [field]: value }
    setForm(updated)
    localStorage.setItem('new_lead_form', JSON.stringify(updated))
  }

  async function handleCreate(e) {
    e.preventDefault()

    if (!form.client_name.trim()) {
      setError('El nombre del cliente es obligatorio')
      return
    }

    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(form.client_name)) {
      setError('El nombre solo puede contener letras')
      return
    }

    setError('')

    try {
      setCreating(true)
      const newLead = await createLead(form, token)
      setLeads(prev => [newLead, ...prev])
      const empty = { client_name: '', inquiry_text: '', close_probability: 50 }
      setForm(empty)
      localStorage.removeItem('new_lead_form')
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleStatusChange(leadId, newStatus) {
    try {
      const updated = await updateLeadStatus(leadId, newStatus, token)
      setLeads(prev => prev.map(l => l.id === leadId ? updated : l))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(leadId) {
    if (!confirm('¿Eliminar este lead?')) return
    try {
      await deleteLead(leadId, token)
      setLeads(prev => prev.filter(l => l.id !== leadId))
    } catch (err) {
      setError(err.message)
    }
  }

  const leadsByStatus = (status) => leads.filter(l => l.status === status)

  if (loading) return <div style={styles.center}>Cargando leads...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>SalesFlow CRM</h1>
          <p style={styles.subtitle}>{leads.length} leads en total</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          <span className="material-icons-round" style={{fontSize: '18px'}}>add</span>
          Nuevo Lead
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Nuevo Lead</h3>
          <form onSubmit={handleCreate}>
            <input
              style={styles.input}
              placeholder="Nombre del cliente *"
              value={form.client_name}
              onChange={e => handleFormChange('client_name', e.target.value)}
            />
            <textarea
              style={{...styles.input, height: '80px', resize: 'vertical'}}
              placeholder="Descripción del interés"
              value={form.inquiry_text}
              onChange={e => handleFormChange('inquiry_text', e.target.value)}
            />
            <div style={styles.probabilityRow}>
              <label style={styles.label}>
                Probabilidad de cierre: {form.close_probability}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.close_probability}
                onChange={e => handleFormChange('close_probability', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button type="submit" style={styles.saveBtn} disabled={creating}>
                {creating ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.board}>
        {COLUMNS.map(col => (
          <div key={col.id} style={styles.column}>
            <div style={{...styles.columnHeader, borderColor: col.color}}>
              <span style={{...styles.columnTitle, color: col.color}}>
                {col.label}
              </span>
              <span style={{...styles.columnCount, background: col.color}}>
                {leadsByStatus(col.id).length}
              </span>
            </div>
            <div style={styles.columnBody}>
              {leadsByStatus(col.id).map(lead => (
                <div key={lead.id} style={styles.leadCard}>
                  <div style={styles.leadName}>{lead.client_name}</div>
                  {lead.inquiry_text && (
                    <div style={styles.leadText}>{lead.inquiry_text}</div>
                  )}
                  <div style={styles.leadFooter}>
                    <span style={styles.probability}>
                      {lead.close_probability}% cierre
                    </span>
                  </div>
                  <div style={styles.leadActions}>
                    <select
                      style={styles.statusSelect}
                      value={lead.status}
                      onChange={e => handleStatusChange(lead.id, e.target.value)}
                    >
                      {COLUMNS.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                    <button
                      style={styles.detailBtn}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      Ver
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(lead.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
              {leadsByStatus(col.id).length === 0 && (
                <div style={styles.emptyCol}>Sin leads</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
  padding: '0 0 80px 0',
},
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    color: 'var(--color-text-secondary)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    marginTop: '4px',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: 'var(--gradient-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    background: 'var(--color-error-light)',
    color: 'var(--color-error)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '16px',
    fontSize: '13px',
  },
  formCard: {
    background: 'var(--color-white)',
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    marginBottom: '24px',
    maxWidth: '500px',
    border: '1px solid var(--color-border)',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '16px',
    color: 'var(--color-text-primary)',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '12px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  },
  probabilityRow: {
    marginBottom: '16px',
  },
  label: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
    display: 'block',
    fontWeight: '500',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '8px 16px',
    background: 'var(--color-surface-2)',
    color: 'var(--color-text-secondary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  saveBtn: {
    padding: '8px 20px',
    background: 'var(--gradient-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
 board: {
  display: 'flex',
  gap: '12px',
  overflowX: 'auto',
  paddingBottom: '16px',
  WebkitOverflowScrolling: 'touch',
  scrollSnapType: 'x mandatory',
},
  column: {
  minWidth: '200px',
  maxWidth: '220px',
  flex: '0 0 200px',
  background: 'var(--color-surface-2)',
  borderRadius: 'var(--radius-lg)',
  padding: '12px',
  scrollSnapAlign: 'start',
},
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '2px solid',
  },
  columnTitle: {
    fontSize: '13px',
    fontWeight: '700',
  },
  columnCount: {
    color: 'white',
    borderRadius: 'var(--radius-full)',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '700',
  },
  columnBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  leadCard: {
    background: 'var(--color-white)',
    borderRadius: 'var(--radius-md)',
    padding: '12px',
    boxShadow: 'var(--shadow-xs)',
    border: '1px solid var(--color-border)',
  },
  leadName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    marginBottom: '4px',
  },
  leadText: {
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    marginBottom: '8px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  leadFooter: {
    marginBottom: '8px',
  },
  probability: {
    fontSize: '11px',
    color: 'var(--color-brand)',
    fontWeight: '600',
  },
  leadActions: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  statusSelect: {
    flex: 1,
    padding: '4px 6px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    color: 'var(--color-text-primary)',
    outline: 'none',
  },
  detailBtn: {
    padding: '4px 10px',
    background: 'var(--color-brand-light)',
    color: 'var(--color-brand)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '4px 6px',
    background: 'var(--color-error-light)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '12px',
  },
  emptyCol: {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: '12px',
    padding: '20px 0',
  }
}

export default Leads