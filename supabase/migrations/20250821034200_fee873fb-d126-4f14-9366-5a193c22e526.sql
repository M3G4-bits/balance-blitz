-- Fix admin user deletion permissions by updating the service role
-- Create edge function for admin user management with service role access
-- Also add email column to pending_transactions for OTP functionality

-- Add email column to pending_transactions for OTP functionality
ALTER TABLE public.pending_transactions ADD COLUMN IF NOT EXISTS email text;

-- Update pending_transactions policies to allow admin deletion
DROP POLICY IF EXISTS "Admins can delete pending transactions" ON public.pending_transactions;
CREATE POLICY "Admins can delete pending transactions" 
ON public.pending_transactions 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE admin_roles.user_id = auth.uid()
));

-- Create function to safely delete users (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid, admin_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(admin_user_id) THEN
    RETURN json_build_object('error', 'Unauthorized: Admin access required');
  END IF;

  -- Delete user from all related tables first
  DELETE FROM public.user_presence WHERE user_id = target_user_id;
  DELETE FROM public.pending_transactions WHERE user_id = target_user_id;
  DELETE FROM public.transactions WHERE user_id = target_user_id;
  DELETE FROM public.user_balances WHERE user_id = target_user_id;
  DELETE FROM public.admin_transfer_settings WHERE user_id = target_user_id;
  DELETE FROM public.support_messages WHERE sender_id = target_user_id;
  DELETE FROM public.support_conversations WHERE user_id = target_user_id;
  DELETE FROM public.admin_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE user_id = target_user_id;

  RETURN json_build_object('success', true, 'message', 'User deleted successfully');
END;
$$;