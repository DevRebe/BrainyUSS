import React, { useState, useEffect } from 'react'
import { BookOpen, Lock, CheckCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Subject {
  id: string
  name: string
  code: string
  semester: number
  year: number
  description: string | null
  prerequisites: string[] | null
  materialCount?: number
}

export function CurriculumGrid() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  useEffect(() => {
    // Debug: log mount
    // eslint-disable-next-line no-console
    console.info('[CurriculumGrid] mounted, starting to load subjects')
    loadSubjectsWithMaterials()
  }, [])

  const loadSubjectsWithMaterials = async () => {
    try {
      // Debug: indicate request starting
      // eslint-disable-next-line no-console
      console.info('[CurriculumGrid] loading subjects from supabase...')

      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('year')
        .order('semester')

      if (subjectsError) throw subjectsError

      // Debug: log fetched subjects count
      // eslint-disable-next-line no-console
      console.info('[CurriculumGrid] fetched subjects count:', (subjectsData || []).length)

      // Get material count for each subject
      const subjectsWithCounts = await Promise.all(
        (subjectsData || []).map(async (subject) => {
          const { count } = await supabase
            .from('materials')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id)

          return {
            ...subject,
            materialCount: count || 0
          }
        })
      )

      setSubjects(subjectsWithCounts)
    } catch (error) {
      console.error('Error loading curriculum:', error)
      setErrorMsg(String(error))
    } finally {
      setLoading(false)
    }
  }

  const getSubjectsByYear = () => {
    return subjects.reduce((acc, subject) => {
      if (!acc[subject.year]) {
        acc[subject.year] = { 1: [], 2: [] }
      }
      acc[subject.year][subject.semester].push(subject)
      return acc
    }, {} as Record<number, Record<number, Subject[]>>)
  }

  const getSubjectStatus = (subject: Subject) => {
    // Simulate progress based on year (students would be further in earlier years)
    const currentYear = new Date().getFullYear() - 2020 // Assuming started in 2020
    if (subject.year < currentYear) return 'completed'
    if (subject.year === currentYear) return 'current'
    return 'future'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'current':
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case 'future':
        return <Lock className="h-4 w-4 text-slate-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 border-green-700 hover:bg-green-900/50'
      case 'current':
        return 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/50'
      case 'future':
        return 'bg-slate-800 border-slate-700 hover:bg-slate-700'
      default:
        return 'bg-slate-800 border-slate-700'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-slate-700 rounded w-32"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="bg-slate-800 rounded-lg p-4 h-24"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-bold text-red-400">Error cargando la malla</h2>
        <p className="text-sm text-slate-300">{errorMsg}</p>
      </div>
    )
  }

  const subjectsByYear = getSubjectsByYear()

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Malla Curricular</h1>
        <p className="text-slate-400">
          Explora todas las asignaturas por año académico. Haz clic en cualquier asignatura para ver sus apuntes.
        </p>
      </div>

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Estado de Asignaturas:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-slate-300">Completada</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-slate-300">En Curso</span>
          </div>
          <div className="flex items-center">
            <Lock className="h-4 w-4 text-slate-500 mr-2" />
            <span className="text-slate-300">Futura</span>
          </div>
        </div>
      </div>

      {/* Curriculum by Year */}
      {Object.entries(subjectsByYear).map(([year, semesters]) => (
        <div key={year} className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            Año {year}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Semester 1 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-4">Primer Semestre</h3>
              <div className="space-y-3">
                {semesters[1].map((subject) => {
                  const status = getSubjectStatus(subject)
                  return (
                    <div
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${getStatusColor(status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          <h4 className="font-medium text-white ml-2">{subject.name}</h4>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{subject.code}</span>
                        <span className="text-slate-400">
                          {subject.materialCount || 0} apuntes
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Semester 2 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-4">Segundo Semestre</h3>
              <div className="space-y-3">
                {semesters[2].map((subject) => {
                  const status = getSubjectStatus(subject)
                  return (
                    <div
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${getStatusColor(status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          <h4 className="font-medium text-white ml-2">{subject.name}</h4>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{subject.code}</span>
                        <span className="text-slate-400">
                          {subject.materialCount || 0} apuntes
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Subject Detail Modal */}
      {selectedSubject && (
        <SubjectModal 
          subject={selectedSubject} 
          onClose={() => setSelectedSubject(null)} 
        />
      )}
    </div>
  )
}

function SubjectModal({ subject, onClose }: { subject: Subject; onClose: () => void }) {
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubjectMaterials()
  }, [subject.id])

  const loadSubjectMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('subject_id', subject.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error loading materials:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{subject.name}</h2>
            <p className="text-slate-400">{subject.code} • Año {subject.year} • Semestre {subject.semester}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <BookOpen className="h-6 w-6" />
          </button>
        </div>

        {subject.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Descripción:</h3>
            <p className="text-slate-300 text-sm">{subject.description}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Apuntes Disponibles ({materials.length})
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-700 rounded p-3 h-16 animate-pulse"></div>
              ))}
            </div>
          ) : materials.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {materials.map((material) => (
                <div key={material.id} className="bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-white text-sm">{material.title}</h4>
                    <span className="text-xs text-slate-400">
                      {new Date(material.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs line-clamp-2">
                    {material.content.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No hay apuntes disponibles para esta asignatura</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded"
          >
            Cerrar
          </button>
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
            Ver todos los apuntes
          </button>
        </div>
      </div>
    </div>
  )
}