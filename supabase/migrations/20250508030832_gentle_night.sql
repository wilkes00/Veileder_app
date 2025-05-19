/*
  # Add account type to users table

  1. Changes
    - Add account_type column to users table
    - Add subscription_status for professors
    - Add subscription_expiry for professors

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'student',
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS subscription_expiry timestamptz;

-- Update policies to include new columns
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);