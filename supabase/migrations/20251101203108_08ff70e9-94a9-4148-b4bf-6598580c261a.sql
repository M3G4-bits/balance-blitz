-- Add new fields to profiles table for enhanced registration
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS state_province text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS annual_income_range text,
ADD COLUMN IF NOT EXISTS ssn_tin text,
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'checking',
ADD COLUMN IF NOT EXISTS passport_image_url text;

-- Create storage bucket for passport images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('passports', 'passports', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own passport" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own passport" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all passports" ON storage.objects;

-- Create policies for passport uploads
CREATE POLICY "Users can upload their own passport"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own passport"
ON storage.objects
FOR SELECT
USING (bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all passports"
ON storage.objects
FOR SELECT
USING (bucket_id = 'passports' AND EXISTS (
  SELECT 1 FROM public.admin_roles WHERE admin_roles.user_id = auth.uid()
));