-- Fix RLS issues by enabling RLS on all public tables and ensuring proper policies

-- Enable RLS on all tables that might be missing it
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_transfer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Update database functions to use proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    account_number,
    tac_code,
    security_code,
    tin_number,
    otp_code
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    generate_account_number(),
    -- Hash the codes using md5 (for now, better than plaintext)
    md5(random()::text || NEW.id::text || 'tac'),
    md5(random()::text || NEW.id::text || 'security'),
    md5(random()::text || NEW.id::text || 'tin'),
    md5(random()::text || NEW.id::text || 'otp')
  );
  
  INSERT INTO public.user_balances (user_id, balance)
  VALUES (NEW.id, 12547.83);
  
  RETURN NEW;
END;
$$;

-- Update generate_static_codes_for_users to hash codes
CREATE OR REPLACE FUNCTION public.generate_static_codes_for_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    tac_code = md5(random()::text || user_id::text || 'tac'),
    security_code = md5(random()::text || user_id::text || 'security'),
    tin_number = md5(random()::text || user_id::text || 'tin'),
    otp_code = md5(random()::text || user_id::text || 'otp')
  WHERE tac_code IS NULL OR security_code IS NULL OR tin_number IS NULL OR otp_code IS NULL;
END;
$$;

-- Create helper function to hash verification codes
CREATE OR REPLACE FUNCTION public.hash_verification_code(code text, user_id uuid, code_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN md5(code || user_id::text || code_type);
END;
$$;