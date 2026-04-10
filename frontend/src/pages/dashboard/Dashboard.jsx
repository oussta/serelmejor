import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>Bienvenido, {user?.name} 👋</h1>
      <p>Rol: {user?.role}</p>
      <p>Plan: {user?.plan}</p>
      <button onClick={handleLogout} style={{
        marginTop: '20px',
        padding: '10px 20px',
        background: '#F43F5E',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}>
        Cerrar sesión
      </button>
    </div>
  )
}

export default Dashboard