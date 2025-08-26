import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Transaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment';
  amount: number;
  description: string;
  date: Date;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
  recipient?: string;
  bank_name?: string;
}

interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
}

interface BankingContextType {
  balance: number;
  transactions: Transaction[];
  country: Country;
  setBalance: (balance: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => void;
  setCountry: (country: Country) => void;
  formatCurrency: (amount: number) => string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£' },
  { code: 'EU', name: 'European Union', currency: 'EUR', currencySymbol: '€' },
  { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'C$' },
  { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', currencySymbol: '₦' },
];

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};

export const BankingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [country, setCountry] = useState<Country>(countries[0]); // Default to US
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserBalance();
      fetchUserTransactions();
      fetchUserProfile();
    }
  }, [user]);

  // Real-time subscription for transaction updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Transaction change detected:', payload.eventType, payload);
          // Refetch transactions when any change occurs (INSERT, UPDATE, DELETE)
          fetchUserTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUserBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('balance, currency')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setBalance(Number(data.balance));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchUserTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const formattedTransactions = data.map(tx => ({
          id: tx.id,
          type: tx.type as 'transfer' | 'deposit' | 'withdrawal' | 'payment',
          amount: Number(tx.amount),
          description: tx.description,
          date: new Date(tx.created_at),
          created_at: tx.created_at,
          status: (tx.status || 'completed') as 'completed' | 'pending' | 'failed',
          recipient: tx.recipient,
          bank_name: tx.bank_name,
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('country_code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data && data.country_code) {
        const userCountry = countries.find(c => c.code === data.country_code);
        if (userCountry) {
          setCountry(userCountry);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      // Insert transaction into database
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          recipient: transaction.recipient,
          status: transaction.status || 'completed',
        })
        .select()
        .single();

      if (error) throw error;

      // Update local balance if transaction is successful and not pending/failed
      if (transaction.status !== 'failed' && transaction.status !== 'pending') {
        if (transaction.type === 'transfer' && transaction.amount < 0) {
          const newBalance = balance + transaction.amount;
          setBalance(newBalance);
          
          // Update balance in database
          await supabase
            .from('user_balances')
            .update({ balance: newBalance })
            .eq('user_id', user.id);
        } else if (transaction.type === 'deposit' && transaction.amount > 0) {
          const newBalance = balance + transaction.amount;
          setBalance(newBalance);
          
          // Update balance in database
          await supabase
            .from('user_balances')
            .update({ balance: newBalance })
            .eq('user_id', user.id);
        }
      }

      // Add to local transactions
      const newTransaction = {
        id: data.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: new Date(),
        created_at: data.created_at,
        status: transaction.status || 'completed',
        recipient: transaction.recipient,
      };
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(country.code === 'US' ? 'en-US' : country.code === 'GB' ? 'en-GB' : 'en-EU', {
      style: 'currency',
      currency: country.currency,
    }).format(amount);
  };

  return (
    <BankingContext.Provider value={{
      balance,
      transactions,
      country,
      setBalance,
      addTransaction,
      setCountry,
      formatCurrency,
    }}>
      {children}
    </BankingContext.Provider>
  );
};

export { countries };