import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Auth } from './components/Auth'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { SubjectManagement } from './components/SubjectManagement'
import { MaterialUpload } from './components/MaterialUpload'
import { MaterialSearch } from './components/MaterialSearch'
import { CurriculumGrid } from './components/CurriculumGrid'
import { AcademicChat } from './components/AcademicChat'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects" element={<SubjectManagement />} />
          <Route path="/upload" element={<MaterialUpload />} />
          <Route path="/materials" element={<MaterialSearch />} />
          <Route path="/curriculum" element={<CurriculumGrid />} />
          <Route path="/chat" element={<AcademicChat />} />
        </Routes>
      </Layout>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App