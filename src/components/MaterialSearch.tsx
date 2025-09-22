import React, { useState, useEffect } from 'react'
import { Search, Filter, FileText, Download, Eye, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Material {
  id: string
  title: string
  content: string
  file_type: string
  created_at: string
  subjects: {
    name: string
    code: string
    year: number
    semester: number
  }
}

export function MaterialSearch() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

  useEffect(() => {
    loadMaterials()
  }, [])

  useEffect(() => {
    filterMaterials()
  }, [materials, searchTerm, selectedYear, selectedSemester])

  const loadMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          subjects (
            name,
            code,
            year,
            semester
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error loading materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMaterials = () => {
    let filtered = materials

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.subjects.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.subjects.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedYear) {
      filtered = filtered.filter(material => 
        material.subjects.year.toString() === selectedYear
      )
    }

    if (selectedSemester) {
      filtered = filtered.filter(material => 
        material.subjects.semester.toString() === selectedSemester
      )
    }

    setFilteredMaterials(filtered)
  }

  const getUniqueYears = () => {
    const years = materials.map(m => m.subjects.year)
    return [...new Set(years)].sort()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-4 h-24"></div>
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
  <h1 className="text-2xl font-bold text-white mb-2">Biblioteca de Apuntes</h1>
  <p className="text-slate-400">Explora y consulta apuntes de todas las asignaturas</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, contenido o asignatura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los años</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year}>Año {year}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los semestres</option>
              <option value="1">Semestre 1</option>
              <option value="2">Semestre 2</option>
            </select>
          </div>
        </div>

        <div className="flex items-center text-sm text-slate-400">
          <Filter className="h-4 w-4 mr-2" />
          {filteredMaterials.length} apuntes encontrados
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div key={material.id} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{material.title}</h3>
                <p className="text-slate-400 text-sm">
                  {material.subjects.name} ({material.subjects.code})
                </p>
                <p className="text-slate-500 text-xs">
                  Año {material.subjects.year} • Semestre {material.subjects.semester}
                </p>
              </div>
              <FileText className="h-5 w-5 text-blue-400 flex-shrink-0" />
            </div>

            <p className="text-slate-300 text-sm mb-4 line-clamp-3">
              {material.content.substring(0, 150)}...
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(material.created_at).toLocaleDateString()}
              </div>
              <span className="bg-slate-700 px-2 py-1 rounded">
                {material.file_type.includes('pdf') ? 'PDF' : 
                 material.file_type.includes('doc') ? 'DOC' : 'TXT'}
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMaterial(material)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded flex items-center justify-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </button>
              <button className="bg-slate-600 hover:bg-slate-500 text-white text-sm py-2 px-3 rounded flex items-center justify-center">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No se encontraron apuntes</p>
        </div>
      )}

      {/* Material Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedMaterial.title}</h2>
                <p className="text-slate-400">
                  {selectedMaterial.subjects.name} ({selectedMaterial.subjects.code}) • 
                  Año {selectedMaterial.subjects.year} • Semestre {selectedMaterial.subjects.semester}
                </p>
                <p className="text-slate-500 text-sm">
                  {new Date(selectedMaterial.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-slate-400 hover:text-white"
              >
                <Eye className="h-6 w-6" />
              </button>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm">
                {selectedMaterial.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}