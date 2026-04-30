import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import SamplesPage from './pages/SamplesPage'
import AuditTrailPage from './pages/AuditTrailPage'
import BatchesPage from './pages/BatchesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  const token = localStorage.getItem('token')

  if (!token) {
    return <LoginPage />
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/samples" element={<SamplesPage />} />
          <Route path="/audit-trail" element={<AuditTrailPage />} />
          <Route path="/batches" element={<BatchesPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App