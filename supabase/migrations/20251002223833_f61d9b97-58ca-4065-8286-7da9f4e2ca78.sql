-- Add daily transfer limit column to user_balances table
ALTER TABLE public.user_balances 
ADD COLUMN daily_transfer_limit numeric DEFAULT 10000.00;