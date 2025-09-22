import React, { useState, useEffect } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Subject {
  id: string
  name: string
  code: string
}

export function MaterialUpload() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .order('name')

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true
  })

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        // For text files, return the content directly
        if (file.type === 'text/plain') {
          resolve(reader.result as string)
        } else {
          // For other files, return basic info
          resolve(`Archivo: ${file.name} (${file.type}) - ${(file.size / 1024).toFixed(2)} KB`)
        }
      }
      reader.readAsText(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject || !title.trim()) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      let finalContent = content

      // Extract text from files if any
      if (files.length > 0) {
        const fileContents = await Promise.all(
          files.map(async (file) => {
            const text = await extractTextFromFile(file)
            return `--- ${file.name} ---\n${text}\n`
          })
        )
        finalContent = content + '\n\n' + fileContents.join('\n')
      }

      const { error: insertError } = await supabase
        .from('materials')
        .insert([{
          title: title.trim(),
          content: finalContent,
          file_type: files.length > 0 ? files[0].type : 'text/plain',
          subject_id: selectedSubject,
          uploaded_by: user?.id || '',
        }])

      if (insertError) throw insertError

      setSuccess('Material subido exitosamente')
      setTitle('')
      setContent('')
      setFiles([])
      setSelectedSubject('')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error uploading material:', error)
      setError('Error al subir el material')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Subir Apunte de Estudio</h1>
        <p className="text-slate-400">
          Agrega nuevos apuntes académicos para compartir con otros estudiantes
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Asignatura *
            </label>
            <select
              required
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una asignatura</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Título del Material *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Resumen Capítulo 1 - Introducción a la Programación"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Contenido del Material
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido del material o será extraído automáticamente de los archivos..."
              rows={10}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Archivos (opcional)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-400">Suelta los archivos aquí...</p>
              ) : (
                <>
                  <p className="text-slate-300 mb-2">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-slate-400 text-sm">
                    Soporta: PDF, DOC, DOCX, TXT
                  </p>
                </>
              )}
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-white text-sm">{file.name}</span>
                      <span className="text-slate-400 text-xs ml-2">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-900/50 border border-green-800 rounded-lg">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !selectedSubject || !title.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            ) : (
              <Upload className="h-5 w-5 mr-2" />
            )}
            {uploading ? 'Subiendo...' : 'Subir Apunte'}
          </button>
        </form>
      </div>
    </div>
  )
}