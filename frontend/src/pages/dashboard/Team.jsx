import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const API = 'http://localhost:8000'
const ROLES = ['owner', 'employee', 'supplier']

const roleColors = {
  owner:    { color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  label: 'Owner' },
  employee: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'Empleado' },
  supplier: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: 'Proveedor' },
  admin:    { color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', label: 'Admin' },
}

function validate(name, value) {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'El nombre es obligatorio'
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim())) return 'El nombre solo puede contener letras'
      if (value.trim().length < 2)   return 'El nombre debe tener al menos 2 caracteres'
      if (value.trim().length > 100) return 'El nombre no puede superar 100 caracteres'
      return ''
    case 'email':
      if (!value.trim()) return 'El email es obligatorio'
      if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value.trim())) return 'Introduce un email válido'
      if (value.trim().length > 150) return 'El email no puede superar 150 caracteres'
      return ''
    case 'password':
      if (!value) return 'La contraseña es obligatoria'
      if (value.length < 8) return 'Mínimo 8 caracteres'
      if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) return 'Debe contener letras y números'
      if (value.length > 100) return 'La contraseña no puede superar 100 caracteres'
      return ''
    default:
      return ''
  }
}

function Team() {
  const { token, user } = useAuth()
  const { theme }       = useTheme()
  const isDark          = theme === 'dark'

  const [team,          setTeam]          = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState('')
  const [showInvite,    setShowInvite]    = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving,        setSaving]        = useState(false)

  // Invite form with localStorage draft
  const [inviteForm, setInviteForm] = useState(() => {
    try {
      const saved = localStorage.getItem('team_invite_draft')
      return saved ? JSON.parse(saved) : { name: '', email: '', password: '', role: 'employee' }
    } catch {
      return { name: '', email: '', password: '', role: 'employee' }
    }
  })
  const [inviteErrors,  setInviteErrors]  = useState({ name: '', email: '', password: '' })
  const [inviteTouched, setInviteTouched] = useState({ name: false, email: false, password: false })
  const [inviteError,   setInviteError]   = useState('')

  const cardBg     = isDark ? '#1E293B' : 'white'
  const cardBorder = isDark ? '#334155' : '#E2E8F0'
  const textMain   = isDark ? '#F1F5F9' : '#0F172A'
  const textSub    = isDark ? '#94A3B8' : '#64748B'
  const inputBg    = isDark ? '#0F172A' : '#F8FAFC'

  useEffect(() => { loadTeam() }, [])

  async function loadTeam() {
    try {
      setLoading(true)
      const res  = await fetch(`${API}/team`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setTeam(Array.isArray(data) ? data : [])
    } catch {
      setError('Error cargando el equipo')
    } finally {
      setLoading(false)
    }
  }

  function updateForm(field, value) {
    setInviteForm(prev => {
      const updated = { ...prev, [field]: value }
      // Never save password to localStorage
      const toSave = { ...updated, password: '' }
      localStorage.setItem('team_invite_draft', JSON.stringify(toSave))
      return updated
    })
  }

  function handleBlur(field) {
    setInviteTouched(prev => ({ ...prev, [field]: true }))
    setInviteErrors(prev => ({ ...prev, [field]: validate(field, inviteForm[field]) }))
  }

  function handleChange(field, value) {
    updateForm(field, value)
    if (inviteTouched[field]) {
      setInviteErrors(prev => ({ ...prev, [field]: validate(field, value) }))
    }
  }

  function borderColor(field) {
    if (inviteTouched[field] && inviteErrors[field]) return '#F43F5E'
    if (inviteTouched[field] && !inviteErrors[field] && inviteForm[field]) return '#10B981'
    return cardBorder
  }

  function FieldCheck({ field }) {
    if (!inviteTouched[field] || inviteErrors[field] || !inviteForm[field]) return null
    return (
      <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#10B981' }}>
        check_circle
      </span>
    )
  }

  function FieldError({ field }) {
    if (!inviteTouched[field] || !inviteErrors[field]) return null
    return (
      <p style={{ fontSize: '12px', color: '#F43F5E', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
        {inviteErrors[field]}
      </p>
    )
  }

  async function handleInvite() {
    setInviteTouched({ name: true, email: true, password: true })
    const newErrors = {
      name:     validate('name',     inviteForm.name),
      email:    validate('email',    inviteForm.email),
      password: validate('password', inviteForm.password),
    }
    setInviteErrors(newErrors)
    if (newErrors.name || newErrors.email || newErrors.password) return

    setSaving(true)
    setInviteError('')
    try {
      const res = await fetch(`${API}/team/invite`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(inviteForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al invitar')

      setTeam(prev => [...prev, data])
      setShowInvite(false)
      setInviteForm({ name: '', email: '', password: '', role: 'employee' })
      setInviteTouched({ name: false, email: false, password: false })
      setInviteErrors({ name: '', email: '', password: '' })
      localStorage.removeItem('team_invite_draft')
      setSuccess('Miembro añadido correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setInviteError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRoleChange(memberId, newRole) {
    try {
      const res = await fetch(`${API}/team/${memberId}/role`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error('Error actualizando rol')
      setTeam(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      setSuccess('Rol actualizado')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(member) {
    try {
      const res = await fetch(`${API}/team/${member.id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Error eliminando miembro')
      setTeam(prev => prev.filter(m => m.id !== member.id))
      setDeleteConfirm(null)
      setSuccess('Miembro eliminado')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  const s = {
    page:      { fontFamily: 'Plus Jakarta Sans, sans-serif' },
    card:      { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '20px' },
    btn:       { padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    btnSec:    { padding: '8px 14px', background: 'none', border: `1px solid ${cardBorder}`, borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' },
    btnDanger: { padding: '8px 14px', background: 'rgba(244,63,94,0.08)', color: '#F43F5E', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' },
    input:     { width: '100%', padding: '10px 12px', border: `1.5px solid ${cardBorder}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: textMain, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' },
    label:     { fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' },
    modal:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' },
    modalBox:  { background: cardBg, borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  }

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: textSub }}>Cargando equipo...</p>
    </div>
  )

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: textMain, marginBottom: '6px', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#0EA5E9' }}>group</span>
            Gestión de Equipo
          </h1>
          <p style={{ fontSize: '14px', color: textSub }}>
            {team.length} miembro{team.length !== 1 ? 's' : ''} en tu equipo
          </p>
        </div>
        <button style={s.btn} onClick={() => { setShowInvite(true); setInviteError('') }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
          Añadir miembro
        </button>
      </div>

      {/* ── Success ── */}
      {success && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#10B981' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          {success}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#F43F5E' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#F43F5E', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* ── Role info cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { role: 'owner',    icon: 'admin_panel_settings', desc: 'Acceso total a la plataforma' },
          { role: 'employee', icon: 'badge',                desc: 'Leads, productos y pedidos' },
          { role: 'supplier', icon: 'local_shipping',       desc: 'Solo portal de proveedores' },
        ].map(item => {
          const r     = roleColors[item.role]
          const count = team.filter(m => m.role === item.role).length
          return (
            <div key={item.role} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: r.color }}>{item.icon}</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>{r.label}</p>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: r.color, background: r.bg, padding: '1px 7px', borderRadius: '99px' }}>{count}</span>
                </div>
                <p style={{ fontSize: '12px', color: textSub }}>{item.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Team table ── */}
      {team.length === 0 ? (
        <div style={{ ...s.card, textAlign: 'center', padding: '64px 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: textSub, marginBottom: '16px', display: 'block' }}>group</span>
          <p style={{ fontSize: '18px', fontWeight: '600', color: textMain, marginBottom: '8px' }}>Sin miembros aún</p>
          <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>Añade miembros a tu equipo para colaborar</p>
          <button style={s.btn} onClick={() => setShowInvite(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
            Añadir primer miembro
          </button>
        </div>
      ) : (
        <div style={s.card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                {['Miembro', 'Email', 'Rol', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {team.map((member, i) => {
                const r       = roleColors[member.role] || roleColors.employee
                const isMe    = member.id === user?.id
                const isOwner = member.role === 'owner'
                return (
                  <tr
                    key={member.id}
                    style={{ borderBottom: i < team.length - 1 ? `1px solid ${cardBorder}` : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>
                            {member.name}
                            {isMe && <span style={{ fontSize: '11px', color: '#2563EB', marginLeft: '6px', fontWeight: '400' }}>(Tú)</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <p style={{ fontSize: '13px', color: textSub }}>{member.email}</p>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {isMe || isOwner ? (
                        <span style={{ fontSize: '12px', fontWeight: '700', color: r.color, background: r.bg, padding: '4px 10px', borderRadius: '99px' }}>
                          {r.label}
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={e => handleRoleChange(member.id, e.target.value)}
                          style={{ padding: '5px 8px', border: `1px solid ${cardBorder}`, borderRadius: '8px', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: textMain, outline: 'none', cursor: 'pointer' }}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{roleColors[r]?.label || r}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {!isMe && !isOwner ? (
                        <button onClick={() => setDeleteConfirm(member)} style={s.btnDanger}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_remove</span>
                          Eliminar
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: textSub }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── INVITE MODAL ── */}
      {showInvite && (
        <div style={s.modal} onClick={() => setShowInvite(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: textMain, marginBottom: '6px' }}>
              Añadir miembro al equipo
            </h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>
              Se creará una cuenta con acceso a tu negocio.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Name */}
              <div>
                <label style={s.label}>Nombre completo *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...s.input, borderColor: borderColor('name') }}
                    value={inviteForm.name}
                    placeholder="Ana García"
                    onChange={e => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                  />
                  <FieldCheck field="name" />
                </div>
                <FieldError field="name" />
              </div>

              {/* Email */}
              <div>
                <label style={s.label}>Email *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...s.input, borderColor: borderColor('email') }}
                    type="email"
                    value={inviteForm.email}
                    placeholder="ana@empresa.com"
                    onChange={e => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                  />
                  <FieldCheck field="email" />
                </div>
                <FieldError field="email" />
              </div>

              {/* Password */}
              <div>
                <label style={s.label}>Contraseña temporal *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...s.input, borderColor: borderColor('password') }}
                    type="password"
                    value={inviteForm.password}
                    placeholder="Mínimo 8 caracteres con números"
                    onChange={e => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                  />
                  <FieldCheck field="password" />
                </div>
                <FieldError field="password" />
              </div>

              {/* Role */}
              <div>
                <label style={s.label}>Rol</label>
                <select
                  style={s.input}
                  value={inviteForm.role}
                  onChange={e => handleChange('role', e.target.value)}
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{roleColors[r]?.label || r}</option>
                  ))}
                </select>
                <div style={{ marginTop: '8px', padding: '10px 12px', background: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '8px', border: `1px solid ${cardBorder}` }}>
                  <p style={{ fontSize: '12px', color: textSub }}>
                    {inviteForm.role === 'owner'    && '✅ Acceso completo — gestión del negocio, facturación y configuración'}
                    {inviteForm.role === 'employee' && '✅ Acceso a leads, productos y pedidos — sin facturación ni configuración'}
                    {inviteForm.role === 'supplier' && '✅ Solo portal de proveedores — ve sus pedidos entrantes y los confirma'}
                  </p>
                </div>
              </div>

              {/* Draft saved */}
              {(inviteForm.name || inviteForm.email) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>save</span>
                  Borrador guardado automáticamente
                </div>
              )}

              {/* Server error */}
              {inviteError && (
                <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', fontSize: '13px', color: '#F43F5E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                  {inviteError}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  style={{ ...s.btnSec, flex: 1, padding: '10px' }}
                  onClick={() => {
                    setShowInvite(false)
                    setInviteTouched({ name: false, email: false, password: false })
                    setInviteErrors({ name: '', email: '', password: '' })
                  }}
                >
                  Cancelar
                </button>
                <button
                  style={{ ...s.btn, flex: 1, justifyContent: 'center', opacity: saving ? 0.7 : 1 }}
                  onClick={handleInvite}
                  disabled={saving}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                  {saving ? 'Añadiendo...' : 'Añadir miembro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div style={s.modal} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modalBox, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#F43F5E' }}>person_remove</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '8px' }}>¿Eliminar miembro?</h3>
              <p style={{ fontSize: '14px', color: textSub }}>
                Se eliminará <strong>{deleteConfirm.name}</strong> del equipo. Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ ...s.btnSec, flex: 1, padding: '10px' }} onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button
                style={{ flex: 1, padding: '10px', background: '#F43F5E', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Team