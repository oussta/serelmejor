import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HowItWorks from '../pages/landing/HowItWorks'
import Team from '../pages/dashboard/Team'
// Auth pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import AdminPanel from '../pages/admin/AdminPanel'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
// App pages (protected)
import Dashboard from '../pages/dashboard/Dashboard'
import Leads from '../pages/salesflow/Leads'
import LeadDetail from '../pages/salesflow/LeadDetail'
import Pricing from '../pages/pricing/Pricing'
import Payment from '../pages/pricing/Payment'

// StockFlow pages (protected)
import Products from '../pages/stockflow/Products'
import ProductDetail from '../pages/stockflow/ProductDetail'
import Orders from '../pages/stockflow/Orders'

// Public pages
import Landing from '../pages/landing/Landing'
import Features from '../pages/landing/Features'
import PublicPricing from '../pages/landing/PublicPricing'
import About from '../pages/landing/About'
import Contact from '../pages/landing/Contact'
import Blog from '../pages/landing/Blog'
import BlogPost from '../pages/landing/BlogPost'

// Layout
import Layout from '../components/layout/Layout'
import SupplierPortal from '../pages/supplier/SupplierPortal'

function ProtectedRoute({ children }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role === 'supplier') return <Navigate to="/supplier" replace />
  return <Layout>{children}</Layout>
}

function AdminRoute({ children }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Layout>{children}</Layout>
}

function AppRouter() {
  return (
    <Routes>

      {/* ── Public ── */}
      <Route path="/"              element={<Landing />} />
      <Route path="/features"      element={<Features />} />
      <Route path="/precios"       element={<PublicPricing />} />
      <Route path="/about"         element={<About />} />
      <Route path="/contact"       element={<Contact />} />
      <Route path="/blog"          element={<Blog />} />
      <Route path="/blog/:slug"    element={<BlogPost />} />
      <Route path="/como-funciona" element={<HowItWorks />} />

      {/* ── Auth ── */}
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* ── Admin only ── */}
      <Route path="/admin" element={
        <AdminRoute><AdminPanel /></AdminRoute>
      } />

      {/* ── Supplier ── */}
      <Route path="/supplier" element={
        <ProtectedRoute><SupplierPortal /></ProtectedRoute>
      } />

      {/* ── Protected ── */}
      <Route path="/pricing" element={
        <ProtectedRoute><Pricing /></ProtectedRoute>
      } />
      <Route path="/team" element={
        <ProtectedRoute><Team /></ProtectedRoute>
      } />
      <Route path="/payment" element={
        <ProtectedRoute><Payment /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      {/* SalesFlow */}
      <Route path="/leads" element={
        <ProtectedRoute><Leads /></ProtectedRoute>
      } />
      <Route path="/leads/:id" element={
        <ProtectedRoute><LeadDetail /></ProtectedRoute>
      } />

      {/* StockFlow */}
      <Route path="/products" element={
        <ProtectedRoute><Products /></ProtectedRoute>
      } />
      <Route path="/products/:id" element={
        <ProtectedRoute><ProductDetail /></ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute><Orders /></ProtectedRoute>
      } />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRouter