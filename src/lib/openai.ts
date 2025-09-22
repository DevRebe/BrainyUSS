import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface MaterialEmbedding {
  id: string
  title: string
  content: string
  embedding: number[]
  subject: string
}

// Función para crear embeddings de los apuntes
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error creating embedding:', error)
    throw error
  }
}

// Función para buscar apuntes similares usando cosine similarity
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dotProduct / (normA * normB)
}

// Función para generar respuesta del chatbot (Brainy)
export async function generateChatResponse(
  query: string,
  relevantMaterials: string[],
  chatHistory: ChatMessage[]
): Promise<string> {
  try {
    const context = relevantMaterials.length > 0 
      ? `Contexto académico disponible:\n${relevantMaterials.join('\n\n')}`
  : 'No hay apuntes específicos disponibles para esta consulta.'

    const systemPrompt = `Eres un asistente académico de la Universidad San Sebastián. 
Tu objetivo es ayudar a estudiantes con sus consultas académicas basándote en los apuntes disponibles. Eres conocido como Brainy.

Instrucciones:
- Responde de manera clara y educativa
- Si tienes información relevante en el contexto, úsala para responder
- Si no tienes información específica, ofrece orientación general académica
- Menciona cuando recomiendas revisar apuntes específicos
- Mantén un tono profesional pero amigable

${context}`

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: query }
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    return response.choices[0].message.content || 'No pude generar una respuesta.'
  } catch (error) {
    console.error('Error generating chat response:', error)
    throw error
  }
}