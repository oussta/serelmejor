import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Dashboard from '../pages/dashboard/Dashboard'
import Pricing from '../pages/pricing/Pricing'
import Payment from '../pages/pricing/Payment'
import Leads from '../pages/salesflow/Leads'
import LeadDetail from '../pages/salesflow/LeadDetail'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" />
  return children
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pricing" element={
        <ProtectedRoute>
          <Pricing />
        </ProtectedRoute>
      } />
      <Route path="/payment" element={
        <ProtectedRoute>
          <Payment />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/leads" element={
        <ProtectedRoute>
          <Leads />
        </ProtectedRoute>
      } />
      <Route path="/leads/:id" element={
        <ProtectedRoute>
          <LeadDetail />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default AppRouter