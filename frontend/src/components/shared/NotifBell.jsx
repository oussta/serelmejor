import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS  = 'ws://localhost:8080'

function NotifBell() {
  const { token } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [open,          setOpen]          = useState(false)
  const [connected,     setConnected]     = useState(false)

  const ws        = useRef(null)
  const ref       = useRef(null)
  const reconnect = useRef(null)

  // ── WebSocket connection ──────────────────────────────
  useEffect(() => {
    connect()
    return () => {
      if (ws.current) ws.current.close()
      if (reconnect.current) clearTimeout(reconnect.current)
    }
  }, [token])

  function connect() {
    try {
      ws.current = new WebSocket(WS)

      ws.current.onopen = () => {
        setConnected(true)
        // Authenticate
        ws.current.send(JSON.stringify({ type: 'auth', token }))
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (e) {}
      }

      ws.current.onclose = () => {
        setConnected(false)
        // Reconnect after 5 seconds
        reconnect.current = setTimeout(() => {
          if (token) connect()
        }, 5000)
      }

      ws.current.onerror = () => {
        ws.current.close()
        // Fallback to polling if WebSocket fails
        fallbackPoll()
      }
    } catch (e) {
      fallbackPoll()
    }
  }

  function handleMessage(data) {
    switch (data.type) {
      case 'auth_success':
        break

      case 'notifications':
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
        break

      case 'new_notification':
        setNotifications(prev => [data.notification, ...prev])
        setUnreadCount(prev => prev + 1)
        // Browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('serElMejor', {
            body: data.notification.message,
            icon: '/logo.png',
          })
        }
        break

      case 'marked_read':
        setNotifications(prev =>
          prev.map(n => n.id === data.notification_id ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        break

      case 'all_marked_read':
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
        break
    }
  }

  // ── Fallback polling if WebSocket not available ───────
  async function fallbackPoll() {
    try {
      const res  = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
    } catch (e) {}
  }

  // ── Request browser notification permission ───────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // ── Close dropdown on outside click ──────────────────
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Actions ───────────────────────────────────────────
  function markRead(id) {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'mark_read', notification_id: id }))
    } else {
      fetch(`${API}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  function markAllRead() {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'mark_all_read' }))
    } else {
      fetch(`${API}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  async function deleteNotif(id) {
    try {
      await fetch(`${API}/notifications/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const notif = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {}
  }

  function formatDate(dateStr) {
    const d    = new Date(dateStr)
    const now  = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60)    return 'Ahora'
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  function notifIcon(type) {
    switch (type) {
      case 'low_stock': return { icon: 'warning',       color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }
      case 'lead_won':  return { icon: 'celebration',   color: '#10B981', bg: 'rgba(16,185,129,0.1)' }
      case 'order':     return { icon: 'local_shipping', color: '#2563EB', bg: 'rgba(37,99,235,0.1)' }
      default:          return { icon: 'notifications', color: '#64748B', bg: 'rgba(100,116,139,0.1)' }
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '36px', height: '36px',
          background: open ? 'rgba(37,99,235,0.08)' : 'none',
          border: '1px solid var(--color-border)',
          borderRadius: '8px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          position: 'relative',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          notifications
        </span>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: '4px', right: '4px',
            width: '16px', height: '16px',
            background: '#F43F5E', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: '700', color: 'white',
            border: '2px solid white',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}

        {/* WebSocket connected dot */}
        {connected && (
          <div style={{
            position: 'absolute', bottom: '3px', right: '3px',
            width: '7px', height: '7px',
            background: '#10B981', borderRadius: '50%',
            border: '1.5px solid white',
          }} />
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: 'absolute', top: '44px', right: 0,
          width: '360px', maxHeight: '480px',
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 300, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>

          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>notifications</span>
              <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Notificaciones</p>
              {unreadCount > 0 && (
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', background: 'rgba(37,99,235,0.08)', padding: '2px 8px', borderRadius: '99px' }}>
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {connected && (
                <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  En vivo
                </span>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Leer todas
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--color-text-muted)', marginBottom: '12px', display: 'block' }}>notifications_off</span>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Sin notificaciones</p>
              </div>
            ) : (
              notifications.map(notif => {
                const { icon, color, bg } = notifIcon(notif.type)
                return (
                  <div
                    key={notif.id}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--color-border)',
                      background: notif.read ? 'none' : 'rgba(37,99,235,0.02)',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      cursor: 'pointer',
                    }}
                    onClick={() => !notif.read && markRead(notif.id)}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color }}>{icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: '1.5', marginBottom: '4px' }}>
                        {notif.message}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {formatDate(notif.created_at)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {!notif.read && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotif(notif.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotifBell
