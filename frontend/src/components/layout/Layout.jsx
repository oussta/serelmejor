import Navbar from './Navbar'

function Layout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-surface)',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}>
      <Navbar />
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 16px',
      }}>
        {children}
      </main>
    </div>
  )
}

export default Layout