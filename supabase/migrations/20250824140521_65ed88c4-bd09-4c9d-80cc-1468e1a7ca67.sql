-- Fix RLS policies for admin access to user_balances
DROP POLICY IF EXISTS "Admin users can manage all balances" ON user_balances;
DROP POLICY IF EXISTS "Admin users can update all balances" ON user_balances;

-- Create new admin policy for user_balances that allows full CRUD for admins
CREATE POLICY "Admin users can manage all user balances" 
ON user_balances 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
);

-- Also ensure users can view their own balance  
CREATE POLICY "Users can view own balance" 
ON user_balances 
FOR SELECT 
USING (user_id = auth.uid());

-- Fix pending_transactions RLS for admin access
DROP POLICY IF EXISTS "Admin users can manage all pending transactions" ON pending_transactions;

CREATE POLICY "Admin users can manage all pending transactions" 
ON pending_transactions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
);