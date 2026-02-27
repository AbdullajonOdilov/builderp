
-- Create feature_flags table
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read flags (needed for app to check flags)
CREATE POLICY "Anyone can read feature flags"
ON public.feature_flags
FOR SELECT
USING (true);

-- Only authenticated users can update (we'll add admin role later if needed)
CREATE POLICY "Authenticated users can update feature flags"
ON public.feature_flags
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow inserts for seeding
CREATE POLICY "Authenticated users can insert feature flags"
ON public.feature_flags
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow deletes
CREATE POLICY "Authenticated users can delete feature flags"
ON public.feature_flags
FOR DELETE
TO authenticated
USING (true);

-- Seed initial feature flags
INSERT INTO public.feature_flags (key, label, description, category, enabled) VALUES
  ('page_buildings', 'Buildings sahifasi', 'Buildings sahifasini ko''rsatish', 'pages', true),
  ('page_tasks', 'Tasks sahifasi', 'Tasks sahifasini ko''rsatish', 'pages', true),
  ('page_finance', 'Finance sahifasi', 'Finance sahifasini ko''rsatish', 'pages', true),
  ('page_ishlar_doskasi', 'Ishlar doskasi', 'Ishlar doskasi sahifasini ko''rsatish', 'pages', true),
  ('page_requests', 'Requests sahifasi', 'Requests sahifasini ko''rsatish', 'pages', true),
  ('feature_unit_conversion', 'Birlik konvertatsiyasi', 'Supplier dialogida birlik konvertatsiyasini yoqish', 'functionality', true),
  ('feature_dark_mode', 'Dark mode', 'Tema almashtirish tugmasini ko''rsatish', 'ui', true),
  ('feature_offline_banner', 'Offline banner', 'Offline holatda bannerni ko''rsatish', 'ui', true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_feature_flags_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_flags;
