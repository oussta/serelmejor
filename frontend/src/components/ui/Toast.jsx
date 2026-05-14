import { useState, useEffect } from 'react'

let toastFn = null

export function showToast(message, type = 'success') {
  if (toastFn) toastFn(message, type)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastFn = (message, type) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3500)
    }
    return () => { toastFn = null }
  }, [])

  const colors = {
    success: { bg: '#10B981', icon: 'check_circle' },
    error:   { bg: '#F43F5E', icon: 'error' },
    info:    { bg: '#2563EB', icon: 'info' },
    warning: { bg: '#F59E0B', icon: 'warning' },
  }

  return (
    <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {toasts.map(toast => {
        const c = colors[toast.type] || colors.success
        return (
          <div
            key={toast.id}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: c.bg, color: 'white', padding: '12px 18px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: '14px', fontWeight: '600', maxWidth: '320px', animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>{c.icon}</span>
            {toast.message}
          </div>
        )
      })}
      <style>{`@keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }`}</style>
    </div>
  )
}