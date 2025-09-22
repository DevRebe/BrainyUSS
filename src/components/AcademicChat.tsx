import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, User, Bot, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { generateChatResponse, createEmbedding, cosineSimilarity, ChatMessage } from '../lib/openai'

interface Material {
  id: string
  title: string
  content: string
  subjects: {
    name: string
    code: string
  }
}

export function AcademicChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadMaterials()
    initializeSession()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          id,
          title,
          content,
          subjects (
            name,
            code
          )
        `)

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error loading materials:', error)
    }
  }

  const initializeSession = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: user?.id || '',
          messages: []
        }])
        .select()
        .single()

      if (error) throw error
      setSessionId(data.id)

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
  content: '¡Hola! Soy Brainy, tu asistente académico de Brainy USS. Puedo ayudarte con preguntas sobre los apuntes de estudio, asignaturas de la malla curricular y orientación académica. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Error initializing session:', error)
    }
  }

  const findRelevantMaterials = async (query: string): Promise<string[]> => {
    try {
      // Create embedding for the query
      const queryEmbedding = await createEmbedding(query)
      
      // For demo purposes, we'll use simple keyword matching
      // In production, you'd store embeddings in the database and use vector similarity
      const relevantMaterials = materials
        .filter(material => {
          const searchText = `${material.title} ${material.content} ${material.subjects.name}`.toLowerCase()
          const queryWords = query.toLowerCase().split(' ')
          return queryWords.some(word => searchText.includes(word))
        })
        .slice(0, 3) // Limit to top 3 most relevant materials
        .map(material => 
          `**${material.subjects.name} (${material.subjects.code})**\n${material.title}\n${material.content.substring(0, 500)}...`
        )

      return relevantMaterials
    } catch (error) {
      console.error('Error finding relevant materials:', error)
      return []
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage('')
    setLoading(true)

    try {
      // Find relevant materials
      const relevantMaterials = await findRelevantMaterials(inputMessage)

      // Generate response
      const response = await generateChatResponse(
        inputMessage,
        relevantMaterials,
        updatedMessages
      )

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)

      // Save session to database
      if (sessionId) {
        await supabase
          .from('chat_sessions')
          .update({
            messages: finalMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
      }
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu pregunta. Por favor, intenta nuevamente.',
        timestamp: new Date()
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const exampleQuestions = [
    "¿Qué necesito aprender para estar preparado para Inteligencia Artificial?",
    "¿Cuáles son los prerrequisitos de Matemáticas Discretas?",
    "Explícame los conceptos básicos de programación",
    "¿Qué asignaturas me ayudarán a ser mejor desarrollador?"
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
          <MessageSquare className="h-6 w-6 mr-2 text-blue-500" />
          Brainy
        </h1>
        <p className="text-slate-400">
          Haz preguntas sobre apuntes, asignaturas y orientación académica
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-800 rounded-lg flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-slate-300">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Example Questions */}
        {messages.length <= 1 && (
          <div className="p-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm mb-3">Preguntas de ejemplo:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="text-left text-sm p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta académica aquí..."
              rows={2}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}