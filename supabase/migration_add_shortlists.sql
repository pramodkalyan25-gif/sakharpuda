-- Create shortlists table
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, target_id)
);

-- Enable RLS
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own shortlists"
    ON public.shortlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shortlists"
    ON public.shortlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shortlists"
    ON public.shortlists FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS shortlists_user_id_idx ON public.shortlists(user_id);
CREATE INDEX IF NOT EXISTS shortlists_target_id_idx ON public.shortlists(target_id);
