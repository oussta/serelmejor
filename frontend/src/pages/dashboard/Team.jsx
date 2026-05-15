import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { showToast } from '../../components/ui/Toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const ROLES = ['owner', 'employee', 'supplier']

function Team() {
  const { token, user } = useAuth()
  const { theme }       = useTheme()
  const { t }           = useTranslation()
  const isDark          = theme === 'dark'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mounted,  setMounted]  = useState(false)

  const [team,          setTeam]          = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [showInvite,    setShowInvite]    = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving,        setSaving]        = useState(false)

  const [inviteForm, setInviteForm] = useState(() => {
    try {
      const saved = localStorage.getItem('team_invite_draft')
      return saved ? JSON.parse(saved) : { name: '', email: '', password: '', role: 'employee' }
    } catch { return { name: '', email: '', password: '', role: 'employee' } }
  })
  const [inviteErrors,  setInviteErrors]  = useState({ name: '', email: '', password: '' })
  const [inviteTouched, setInviteTouched] = useState({ name: false, email: false, password: false })
  const [inviteError,   setInviteError]   = useState('')

  const cardBg  = isDark ? '#1E293B' : 'white'
  const border  = isDark ? '#334155' : '#E2E8F0'
  const textMain = isDark ? '#F1F5F9' : '#0F172A'
  const textSub  = isDark ? '#94A3B8' : '#64748B'
  const inputBg  = isDark ? '#0F172A' : '#F8FAFC'
  const inputText = isDark ? '#F1F5F9' : '#0F172A'

  const roleColors = {
    owner:    { color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  label: t('team.roleOwner')    || 'Owner' },
    employee: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: t('team.roleEmployee') || 'Empleado' },
    supplier: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: t('team.roleSupplier') || 'Proveedor' },
    admin:    { color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', label: 'Admin' },
  }

  function validate(name, value) {
    switch (name) {
      case 'name':
        if (!value.trim()) return t('team.nameRequired') || 'El nombre es obligatorio'
        if (value.trim().length < 2) return t('team.nameMin') || 'Mínimo 2 caracteres'
        return ''
      case 'email':
        if (!value.trim()) return t('team.emailRequired') || 'El email es obligatorio'
        if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value.trim())) return t('team.emailInvalid') || 'Email no válido'
        return ''
      case 'password':
        if (!value) return t('team.passwordRequired') || 'La contraseña es obligatoria'
        if (value.length < 8) return t('team.passwordMin') || 'Mínimo 8 caracteres'
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) return t('team.passwordStrength') || 'Debe contener letras y números'
        return ''
      default: return ''
    }
  }

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    loadTeam()
    const h = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  async function loadTeam() {
    try {
      setLoading(true)
      const res  = await fetch(`${API}/team`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setTeam(Array.isArray(data) ? data : [])
    } catch { setError(t('team.loadError') || 'Error cargando el equipo') }
    finally { setLoading(false) }
  }

  function updateForm(field, value) {
    setInviteForm(prev => {
      const updated = { ...prev, [field]: value }
      localStorage.setItem('team_invite_draft', JSON.stringify({ ...updated, password: '' }))
      return updated
    })
  }

  function handleBlur(field) {
    setInviteTouched(prev => ({ ...prev, [field]: true }))
    setInviteErrors(prev => ({ ...prev, [field]: validate(field, inviteForm[field]) }))
  }

  function handleChange(field, value) {
    updateForm(field, value)
    if (inviteTouched[field]) setInviteErrors(prev => ({ ...prev, [field]: validate(field, value) }))
  }

  function borderColor(field) {
    if (inviteTouched[field] && inviteErrors[field]) return '#F43F5E'
    if (inviteTouched[field] && !inviteErrors[field] && inviteForm[field]) return '#10B981'
    return border
  }

  async function handleInvite() {
    setInviteTouched({ name: true, email: true, password: true })
    const errs = {
      name:     validate('name',     inviteForm.name),
      email:    validate('email',    inviteForm.email),
      password: validate('password', inviteForm.password),
    }
    setInviteErrors(errs)
    if (errs.name || errs.email || errs.password) return
    setSaving(true); setInviteError('')
    try {
      const res  = await fetch(`${API}/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(inviteForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al invitar')
      setTeam(prev => [...prev, data])
      setShowInvite(false)
      setInviteForm({ name: '', email: '', password: '', role: 'employee' })
      setInviteTouched({ name: false, email: false, password: false })
      setInviteErrors({ name: '', email: '', password: '' })
      localStorage.removeItem('team_invite_draft')
      showToast(t('team.memberAdded') || 'Miembro añadido ✓', 'success')
    } catch (e) { setInviteError(e.message) }
    finally { setSaving(false) }
  }

  async function handleRoleChange(memberId, newRole) {
    try {
      const res = await fetch(`${API}/team/${memberId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error()
      setTeam(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      showToast(t('team.roleUpdated') || 'Rol actualizado ✓', 'success')
    } catch { setError(t('team.roleError') || 'Error actualizando rol') }
  }

  async function handleDelete(member) {
    try {
      const res = await fetch(`${API}/team/${member.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setTeam(prev => prev.filter(m => m.id !== member.id))
      setDeleteConfirm(null)
      showToast(t('team.memberDeleted') || 'Miembro eliminado', 'info')
    } catch { setError(t('team.deleteError') || 'Error eliminando miembro') }
  }

  const inputStyle = (field) => ({
    width: '100%', padding: '10px 12px',
    border: `1.5px solid ${borderColor(field)}`,
    borderRadius: '8px', fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    background: inputBg, color: inputText,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  })

  const modalStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }
  const modalBox   = { background: cardBg, borderRadius: '20px', padding: isMobile ? '24px 20px' : '32px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${border}`, maxHeight: '90vh', overflowY: 'auto' }
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: textSub, display: 'block', marginBottom: '6px' }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: textSub }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#0EA5E9', display: 'block', marginBottom: '12px', animation: 'spin 1.5s linear infinite' }}>refresh</span>
        <p>{t('team.loading') || 'Cargando equipo...'}</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      padding: isMobile ? '0 0 80px' : '0 0 40px',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: textMain, marginBottom: '4px', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#0EA5E9' }}>group</span>
            {t('team.title') || 'Gestión de Equipo'}
          </h1>
          <p style={{ fontSize: '13px', color: textSub }}>
            {team.length} {t('team.members') || 'miembros en tu equipo'}
          </p>
        </div>
        <button
          onClick={() => { setShowInvite(true); setInviteError('') }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
          {t('team.addMember') || 'Añadir miembro'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Role info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { role: 'owner',    icon: 'admin_panel_settings', desc: t('team.ownerDesc')    || 'Acceso total a la plataforma' },
          { role: 'employee', icon: 'badge',                desc: t('team.employeeDesc') || 'Leads, productos y pedidos' },
          { role: 'supplier', icon: 'local_shipping',       desc: t('team.supplierDesc') || 'Solo portal de proveedores' },
        ].map(item => {
          const r     = roleColors[item.role]
          const count = team.filter(m => m.role === item.role).length
          return (
            <div key={item.role} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: r.color }}>{item.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
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

      {/* Team list */}
      {team.length === 0 ? (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', textAlign: 'center', padding: '64px 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: textSub, marginBottom: '16px', display: 'block', opacity: 0.5 }}>group</span>
          <p style={{ fontSize: '18px', fontWeight: '600', color: textMain, marginBottom: '8px' }}>{t('team.empty') || 'Sin miembros aún'}</p>
          <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>{t('team.emptyDesc') || 'Añade miembros a tu equipo para colaborar'}</p>
          <button onClick={() => setShowInvite(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
            {t('team.addFirst') || 'Añadir primer miembro'}
          </button>
        </div>
      ) : isMobile ? (
        // Mobile: card view
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {team.map(member => {
            const r      = roleColors[member.role] || roleColors.employee
            const isMe   = member.id === user?.id
            const isOwner = member.role === 'owner'
            return (
              <div key={member.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: '800', flexShrink: 0 }}>
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: textMain }}>
                      {member.name}
                      {isMe && <span style={{ fontSize: '11px', color: '#2563EB', marginLeft: '6px' }}>({t('team.you') || 'Tú'})</span>}
                    </p>
                    <p style={{ fontSize: '12px', color: textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: r.color, background: r.bg, padding: '3px 10px', borderRadius: '99px', flexShrink: 0 }}>{r.label}</span>
                </div>
                {!isMe && !isOwner && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={member.role}
                      onChange={e => handleRoleChange(member.id, e.target.value)}
                      style={{ flex: 1, padding: '8px 10px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: inputText, outline: 'none' }}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{roleColors[r]?.label || r}</option>)}
                    </select>
                    <button
                      onClick={() => setDeleteConfirm(member)}
                      style={{ padding: '8px 12px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', color: '#F43F5E', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_remove</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        // Desktop: table
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: isDark ? '#0F172A' : '#F8FAFC', borderBottom: `1px solid ${border}` }}>
                {[t('team.member') || 'Miembro', 'Email', t('team.role') || 'Rol', t('team.actions') || 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {team.map((member, i) => {
                const r      = roleColors[member.role] || roleColors.employee
                const isMe   = member.id === user?.id
                const isOwner = member.role === 'owner'
                return (
                  <tr key={member.id} style={{ borderBottom: i < team.length - 1 ? `1px solid ${border}` : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: textMain }}>
                          {member.name}
                          {isMe && <span style={{ fontSize: '11px', color: '#2563EB', marginLeft: '6px', fontWeight: '400' }}>({t('team.you') || 'Tú'})</span>}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><p style={{ fontSize: '13px', color: textSub }}>{member.email}</p></td>
                    <td style={{ padding: '14px 16px' }}>
                      {isMe || isOwner ? (
                        <span style={{ fontSize: '12px', fontWeight: '700', color: r.color, background: r.bg, padding: '4px 10px', borderRadius: '99px' }}>{r.label}</span>
                      ) : (
                        <select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value)} style={{ padding: '5px 8px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: inputText, outline: 'none', cursor: 'pointer' }}>
                          {ROLES.map(r => <option key={r} value={r}>{roleColors[r]?.label || r}</option>)}
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {!isMe && !isOwner ? (
                        <button onClick={() => setDeleteConfirm(member)} style={{ padding: '7px 12px', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', color: '#F43F5E', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>person_remove</span>
                          {t('team.remove') || 'Eliminar'}
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

      {/* INVITE MODAL */}
      {showInvite && (
        <div style={modalStyle} onClick={() => setShowInvite(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: textMain, marginBottom: '6px' }}>{t('team.addMember') || 'Añadir miembro'}</h2>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>{t('team.inviteDesc') || 'Se creará una cuenta con acceso a tu negocio.'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{t('team.fullName') || 'Nombre completo'} *</label>
                <div style={{ position: 'relative' }}>
                  <input style={inputStyle('name')} value={inviteForm.name} placeholder="Ana García" onChange={e => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} />
                  {inviteTouched.name && !inviteErrors.name && inviteForm.name && <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#10B981' }}>check_circle</span>}
                </div>
                {inviteTouched.name && inviteErrors.name && <p style={{ fontSize: '12px', color: '#F43F5E', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>{inviteErrors.name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <div style={{ position: 'relative' }}>
                  <input style={inputStyle('email')} type="email" value={inviteForm.email} placeholder="ana@empresa.com" onChange={e => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} />
                  {inviteTouched.email && !inviteErrors.email && inviteForm.email && <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#10B981' }}>check_circle</span>}
                </div>
                {inviteTouched.email && inviteErrors.email && <p style={{ fontSize: '12px', color: '#F43F5E', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>{inviteErrors.email}</p>}
              </div>
              <div>
                <label style={labelStyle}>{t('team.tempPassword') || 'Contraseña temporal'} *</label>
                <div style={{ position: 'relative' }}>
                  <input style={inputStyle('password')} type="password" value={inviteForm.password} placeholder="Mínimo 8 caracteres con números" onChange={e => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')} />
                  {inviteTouched.password && !inviteErrors.password && inviteForm.password && <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#10B981' }}>check_circle</span>}
                </div>
                {inviteTouched.password && inviteErrors.password && <p style={{ fontSize: '12px', color: '#F43F5E', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>{inviteErrors.password}</p>}
              </div>
              <div>
                <label style={labelStyle}>{t('team.role') || 'Rol'}</label>
                <select style={{ width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', background: inputBg, color: inputText, outline: 'none', boxSizing: 'border-box' }} value={inviteForm.role} onChange={e => handleChange('role', e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{roleColors[r]?.label || r}</option>)}
                </select>
                <div style={{ marginTop: '8px', padding: '10px 12px', background: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '8px', border: `1px solid ${border}` }}>
                  <p style={{ fontSize: '12px', color: textSub }}>
                    {inviteForm.role === 'owner'    && (t('team.ownerDesc')    || 'Acceso completo — gestión del negocio, facturación y configuración')}
                    {inviteForm.role === 'employee' && (t('team.employeeDesc') || 'Acceso a leads, productos y pedidos — sin facturación')}
                    {inviteForm.role === 'supplier' && (t('team.supplierDesc') || 'Solo portal de proveedores — ve sus pedidos y los confirma')}
                  </p>
                </div>
              </div>
              {inviteError && (
                <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', fontSize: '13px', color: '#F43F5E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                  {inviteError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={() => { setShowInvite(false); setInviteTouched({ name: false, email: false, password: false }); setInviteErrors({ name: '', email: '', password: '' }) }} style={{ flex: 1, padding: '10px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {t('common.cancel') || 'Cancelar'}
                </button>
                <button onClick={handleInvite} disabled={saving} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
                  {saving ? (t('team.adding') || 'Añadiendo...') : (t('team.addMember') || 'Añadir miembro')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div style={modalStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...modalBox, maxWidth: '380px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#F43F5E' }}>person_remove</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: textMain, marginBottom: '8px' }}>{t('team.deleteTitle') || '¿Eliminar miembro?'}</h3>
            <p style={{ fontSize: '14px', color: textSub, marginBottom: '24px' }}>
              {t('team.deleteDesc') || 'Se eliminará'} <strong style={{ color: textMain }}>{deleteConfirm.name}</strong> {t('team.deleteDesc2') || 'del equipo. Esta acción no se puede deshacer.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '10px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: textSub, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('common.cancel') || 'Cancelar'}</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '10px', background: '#F43F5E', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t('team.confirmDelete') || 'Sí, eliminar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Team