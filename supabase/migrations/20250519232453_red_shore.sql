/*
  # Add subjects array to users table and update existing users

  1. Changes
    - Add subjects array column to users table
    - Update subjects for existing users

  2. Security
    - Maintain existing RLS policies
*/

-- Add subjects array column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subjects'
  ) THEN
    ALTER TABLE public.users ADD COLUMN subjects text[] DEFAULT '{}';
  END IF;
END $$;

-- Update subjects for specific users
UPDATE public.users 
SET subjects = ARRAY['Estructuras de Datos I', 'Estructuras de Datos II']
WHERE email IN ('omanleon@gmail.com', 'edsonibarra@gmail.com');