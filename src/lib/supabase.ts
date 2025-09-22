import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Development debug: log which Supabase URL and key-length are being used (do not print the full key)
if (import.meta.env.DEV) {
  try {
    const keyPreview = typeof supabaseAnonKey === 'string' ? supabaseAnonKey.slice(0, 6) + '...' + supabaseAnonKey.slice(-6) : 'not-set'
    // eslint-disable-next-line no-console
    console.info('[supabase] URL:', supabaseUrl, 'anonKeyPreview:', keyPreview, 'keyLength:', supabaseAnonKey ? supabaseAnonKey.length : 0)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] Unable to preview env vars')
  }
}

export type Database = {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string
          name: string
          code: string
          semester: number
          year: number
          description: string | null
          prerequisites: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          semester: number
          year: number
          description?: string | null
          prerequisites?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          semester?: number
          year?: number
          description?: string | null
          prerequisites?: string[] | null
          created_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          title: string
          content: string
          file_path: string | null
          file_type: string
          subject_id: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          file_path?: string | null
          file_type: string
          subject_id: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          file_path?: string | null
          file_type?: string
          subject_id?: string
          uploaded_by?: string
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          messages: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: any[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}