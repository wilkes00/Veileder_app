import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project-id.supabase.co' || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error('Please configure your Supabase environment variables in the .env file with your actual project URL and anon key.')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error('Invalid VITE_SUPABASE_URL format. Please ensure it starts with https:// and is a valid URL.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)