import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  if (!clientInstance && typeof window !== 'undefined') {
    clientInstance = createClientComponentClient<Database>()
  }
  return clientInstance!
}

// Client-side Supabase client for use in components
export const supabaseClient = typeof window !== 'undefined' ? createClient() : null as any