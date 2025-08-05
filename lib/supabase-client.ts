import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Client-side Supabase client for use in components
export const supabaseClient = typeof window !== 'undefined' ? createClient() : null as any