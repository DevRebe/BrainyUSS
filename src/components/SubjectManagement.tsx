import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Subject {
  id: string
  name: string
  code: string
  semester: number
  year: number
  description: string | null
  prerequisites: string[] | null
  created_at: string
}

export function SubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: 1,
    year: 1,
    description: '',
    prerequisites: [] as string[]
  })

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('year', { ascending: true })
        .order('semester', { ascending: true })

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error('Error loading subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update(formData)
          .eq('id', editingSubject.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([formData])
        
        if (error) throw error
      }

      setFormData({
        name: '',
        code: '',
        semester: 1,
        year: 1,
        description: '',
        prerequisites: []
      })
      setShowForm(false)
      setEditingSubject(null)
      loadSubjects()
    } catch (error) {
      console.error('Error saving subject:', error)
    }
  }

  const handleEdit = (subject: Subject) => {
    setFormData({
      name: subject.name,
      code: subject.code,
      semester: subject.semester,
      year: subject.year,
      description: subject.description || '',
      prerequisites: subject.prerequisites || []
    })
    setEditingSubject(subject)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta asignatura?')) {
      try {
        const { error } = await supabase
          .from('subjects')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        loadSubjects()
      } catch (error) {
        console.error('Error deleting subject:', error)
      }
    }
  }

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    const key = `Año ${subject.year}`
    if (!acc[key]) acc[key] = []
    acc[key].push(subject)
    return acc
  }, {} as Record<string, Subject[]>)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-4 h-16"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Asignaturas</h1>
          <p className="text-slate-400">Administra las asignaturas de la malla curricular</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingSubject(null)
            setFormData({
              name: '',
              code: '',
              semester: 1,
              year: 1,
              description: '',
              prerequisites: []
            })
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Asignatura
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar asignaturas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingSubject ? 'Editar Asignatura' : 'Nueva Asignatura'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Código
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Año
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Semestre
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSubject(null)
                  }}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  {editingSubject ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subjects List */}
      <div className="space-y-6">
        {Object.entries(groupedSubjects).map(([year, yearSubjects]) => (
          <div key={year} className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              {year}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {yearSubjects
                .sort((a, b) => a.semester - b.semester)
                .map((subject) => (
                  <div key={subject.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{subject.name}</h3>
                        <p className="text-slate-400 text-sm">
                          {subject.code} • Semestre {subject.semester}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {subject.description && (
                      <p className="text-slate-300 text-sm">{subject.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No se encontraron asignaturas</p>
        </div>
      )}
    </div>
  )
}