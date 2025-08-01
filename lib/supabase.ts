import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          duration: number
          price: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration: number
          price: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration?: number
          price?: number
          active?: boolean
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status: "scheduled" | "completed" | "cancelled"
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status?: "scheduled" | "completed" | "cancelled"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: "scheduled" | "completed" | "cancelled"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
