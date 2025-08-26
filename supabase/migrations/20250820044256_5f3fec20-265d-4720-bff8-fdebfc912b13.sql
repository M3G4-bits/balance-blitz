-- Add pending transactions table for admin approval
CREATE TABLE public.pending_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  recipient TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  sort_code TEXT,
  description TEXT NOT NULL,
  transfer_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for pending transactions
CREATE POLICY "Admins can view all pending transactions" 
ON public.pending_transactions 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM admin_roles
  WHERE (admin_roles.user_id = auth.uid())));

CREATE POLICY "Admins can update pending transactions" 
ON public.pending_transactions 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM admin_roles
  WHERE (admin_roles.user_id = auth.uid())));

CREATE POLICY "Admins can delete pending transactions" 
ON public.pending_transactions 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM admin_roles
  WHERE (admin_roles.user_id = auth.uid())));

CREATE POLICY "Users can insert their own pending transactions" 
ON public.pending_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_pending_transactions_updated_at
BEFORE UPDATE ON public.pending_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add static codes to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tac_code TEXT DEFAULT NULL,
ADD COLUMN security_code TEXT DEFAULT NULL,
ADD COLUMN tin_number TEXT DEFAULT NULL,
ADD COLUMN otp_code TEXT DEFAULT NULL;

-- Function to generate static codes for existing users
CREATE OR REPLACE FUNCTION generate_static_codes_for_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    tac_code = upper(substring(md5(random()::text || user_id::text) from 1 for 6)),
    security_code = upper(substring(md5(random()::text || user_id::text || 'security') from 1 for 6)),
    tin_number = floor(1000000000 + random() * 9000000000)::text,
    otp_code = lpad(floor(random() * 1000000)::text, 6, '0')
  WHERE tac_code IS NULL OR security_code IS NULL OR tin_number IS NULL OR otp_code IS NULL;
END;
$$;

-- Generate codes for existing users
SELECT generate_static_codes_for_users();

-- Function to generate codes for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    upper(substring(md5(random()::text || NEW.id::text) from 1 for 6)),
    upper(substring(md5(random()::text || NEW.id::text || 'security') from 1 for 6)),
    floor(1000000000 + random() * 9000000000)::text,
    lpad(floor(random() * 1000000)::text, 6, '0')
  );
  
  INSERT INTO public.user_balances (user_id, balance)
  VALUES (NEW.id, 12547.83);
  
  RETURN NEW;
END;
$function$;