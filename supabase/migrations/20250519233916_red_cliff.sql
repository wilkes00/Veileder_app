/*
  # Add study groups functionality

  1. New Tables
    - `study_groups`
      - `id` (uuid, primary key)
      - `name` (text) - group name
      - `description` (text) - group description
      - `subject` (text) - main subject of study
      - `creator_id` (uuid) - references users(id)
      - `created_at` (timestamptz)
      - `max_participants` (integer)

    - `group_members`
      - `group_id` (uuid) - references study_groups(id)
      - `user_id` (uuid) - references users(id)
      - `joined_at` (timestamptz)
      - `role` (text) - 'admin' or 'member'

  2. Security
    - Enable RLS on both tables
    - Add policies for creating and joining groups
*/

-- Create study_groups table
CREATE TABLE IF NOT EXISTS public.study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  subject text NOT NULL,
  creator_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  max_participants integer DEFAULT 10
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  role text DEFAULT 'member',
  PRIMARY KEY (group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policies for study_groups
CREATE POLICY "Users can view all study groups"
  ON public.study_groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create study groups"
  ON public.study_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Policies for group_members
CREATE POLICY "Users can view group members"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);