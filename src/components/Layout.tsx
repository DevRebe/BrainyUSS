import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  BookOpen, 
  MessageSquare, 
  Upload, 
  Grid3X3,
  LogOut,
  Home,
  Search,
  User
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Layout({ children }: { children?: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Malla Curricular', href: '/curriculum', icon: Grid3X3 },
    { name: 'Asignaturas', href: '/subjects', icon: BookOpen },
    { name: 'Apuntes', href: '/materials', icon: Search },
    { name: 'Subir Apunte', href: '/upload', icon: Upload },
    { name: 'Brainy', href: '/chat', icon: MessageSquare },
  ]

  const isActive = (href: string) => {
    return location.pathname === href
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-slate-700">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <h1 className="text-lg font-bold text-white">Brainy USS</h1>
              <p className="text-xs text-slate-400">Universidad San Sebastián</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-slate-400" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-slate-400">Estudiante USS</p>
              </div>
              <button
                onClick={signOut}
                className="ml-2 p-1 text-slate-400 hover:text-white"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="min-h-screen">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}