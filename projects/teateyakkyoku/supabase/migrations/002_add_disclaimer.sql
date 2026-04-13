ALTER TABLE public.users ADD COLUMN IF NOT EXISTS agreed_disclaimer BOOLEAN DEFAULT false;
