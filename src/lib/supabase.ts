import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseAnonKey === 'your_supabase_anon_key') {
  console.warn('⚠️ Warning: Using placeholder Supabase credentials. Please update your .env file with actual values.')
  console.warn('To get your Supabase credentials:')
  console.warn('1. Go to https://supabase.com/dashboard')
  console.warn('2. Select your project')
  console.warn('3. Go to Settings > API')
  console.warn('4. Copy your Project URL and anon/public key')
}

// Validate URL format only if not using placeholder
if (supabaseUrl !== 'https://your-project-id.supabase.co') {
  try {
    new URL(supabaseUrl)
  } catch (error) {
    throw new Error('Invalid VITE_SUPABASE_URL format. Please ensure it starts with https:// and is a valid URL.')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)