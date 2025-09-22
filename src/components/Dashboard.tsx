import React, { useEffect, useState } from 'react'
import { BookOpen, FileText, MessageSquare, TrendingUp, Users, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Stats {
  totalSubjects: number
  totalMaterials: number
  chatSessions: number
  recentMaterials: any[]
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSubjects: 0,
    totalMaterials: 0,
    chatSessions: 0,
    recentMaterials: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [subjectsResult, materialsResult, chatResult] = await Promise.all([
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('materials').select('*', { count: 'exact', head: true }),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true })
      ])

      const { data: recentMaterials } = await supabase
        .from('materials')
        .select(`
          *,
          subjects (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalSubjects: subjectsResult.count || 0,
        totalMaterials: materialsResult.count || 0,
        chatSessions: chatResult.count || 0,
        recentMaterials: recentMaterials || []
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Asignaturas',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'bg-blue-600',
      href: '/subjects'
    },
    {
      title: 'Apuntes',
      value: stats.totalMaterials,
      icon: FileText,
      color: 'bg-green-600',
      href: '/materials'
    },
    {
      title: 'Consultas Chat',
      value: stats.chatSessions,
      icon: MessageSquare,
      color: 'bg-purple-600',
      href: '/chat'
    },
    {
      title: 'Progreso',
      value: '85%',
      icon: TrendingUp,
      color: 'bg-orange-600',
      href: '/curriculum'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Bienvenido a tu plataforma académica USS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              to={card.href}
              className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors group"
            >
              <div className="flex items-center">
                <div className={`${card.color} rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-slate-400 text-sm">{card.title}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Materials */}
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-white">Apuntes Recientes</h2>
          </div>
          <div className="space-y-3">
            {stats.recentMaterials.length > 0 ? (
              stats.recentMaterials.map((material) => (
                <div key={material.id} className="flex items-center p-3 bg-slate-700 rounded-lg">
                  <FileText className="h-4 w-4 text-slate-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {material.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {material.subjects?.name} • {new Date(material.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No hay apuntes recientes</p>
            )}
          </div>
          <Link
            to="/materials"
            className="block mt-4 text-center text-blue-400 hover:text-blue-300 text-sm"
          >
            Ver todos los apuntes →
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            <h2 className="text-lg font-semibold text-white">Acciones Rápidas</h2>
          </div>
          <div className="space-y-3">
            <Link
              to="/upload"
              className="flex items-center p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <FileText className="h-4 w-4 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-white">Subir Apunte</p>
                <p className="text-xs text-slate-400">Agregar nuevo contenido</p>
              </div>
            </Link>
            <Link
              to="/chat"
              className="flex items-center p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-white">Brainy</p>
                <p className="text-xs text-slate-400">Hacer preguntas académicas</p>
              </div>
            </Link>
            <Link
              to="/curriculum"
              className="flex items-center p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-white">Explorar Malla</p>
                <p className="text-xs text-slate-400">Ver asignaturas futuras</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}