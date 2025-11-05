-- Ensure RLS allows users to read their own admin role so admin panel access check works
-- Enable Row Level Security on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Remove existing conflicting policy if any
DROP POLICY IF EXISTS "Users can view their admin role" ON public.admin_roles;

-- Allow users to SELECT their own admin role row
CREATE POLICY "Users can view their admin role"
ON public.admin_roles
FOR SELECT
USING (auth.uid() = user_id);
