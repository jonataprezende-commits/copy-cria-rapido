-- Add new columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS preferred_template text DEFAULT 'infoproduto',
  ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_level text DEFAULT 'Iniciante',
  ADD COLUMN IF NOT EXISTS analyses_used integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS analyses_limit integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS rewrites_used integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rewrites_limit integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS coach_sessions_used integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coach_sessions_limit integer DEFAULT 5;

-- Create analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  original_copy text NOT NULL,
  platform text,
  score numeric,
  breakdown jsonb,
  positives text[],
  negatives text[],
  improved_copy jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON public.analyses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.analyses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create coach_sessions table
CREATE TABLE IF NOT EXISTS public.coach_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  headline text,
  body text,
  cta text,
  platform text,
  scores jsonb,
  feedbacks jsonb,
  final_score numeric,
  xp_earned integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coach sessions" ON public.coach_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own coach sessions" ON public.coach_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);