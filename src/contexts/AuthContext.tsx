import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { useNavigate } from 'react-router-dom';

interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  stateProvince?: string;
  zipCode?: string;
  dateOfBirth?: string;
  occupation?: string;
  annualIncomeRange?: string;
  ssnTin?: string;
  accountType?: string;
  passportImageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (data: SignUpData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleInactivityTimeout = async () => {
    if (user) {
      await supabase.auth.signOut();
      // Clear captcha verification on timeout
      sessionStorage.removeItem('captchaVerified');
      // Redirect to home (captcha) instead of just logging out
      window.location.href = '/';
    }
  };

  // 7 minutes = 7 * 60 * 1000 = 420000 milliseconds
  useInactivityTimer({
    timeout: 420000,
    onTimeout: handleInactivityTimeout,
    enabled: !!user
  });

  useEffect(() => {
    const initializeAuth = async () => {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Check admin status
          if (session?.user) {
            const { data: isAdminRes } = await supabase
              .rpc('is_admin', { user_id: session.user.id });
            setIsAdmin(!!isAdminRes);
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
        }
      );

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        
        // Check admin status
        const { data: isAdminRes } = await supabase
          .rpc('is_admin', { user_id: session.user.id });
        setIsAdmin(!!isAdminRes);
      }
      
      setLoading(false);

      return () => subscription.unsubscribe();
    };

    initializeAuth();
  }, []);

  const signUp = async (data: SignUpData) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        }
      }
    });

    if (error || !authData.user) {
      return { error };
    }

    // Handle passport image: move temp upload to user folder and set avatar URL
    let passportPath: string | null = null;
    let avatarPublicUrl: string | null = null;
    if (data.passportImageUrl) {
      try {
        const sourcePath = data.passportImageUrl;
        const fileExt = sourcePath.split('.').pop();
        const desiredPath = `${authData.user.id}/passport.${fileExt}`;

        if (sourcePath !== desiredPath) {
          await supabase.storage.from('passports').move(sourcePath, desiredPath);
        }
        const finalPath = desiredPath;
        const { data: pub } = supabase.storage
          .from('passports')
          .getPublicUrl(finalPath);
        if (pub?.publicUrl) {
          avatarPublicUrl = pub.publicUrl;
          passportPath = finalPath;
        }
      } catch (e) {
        console.error('Error handling passport image:', e);
      }
    }

    // Update profile with additional data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        address: data.address,
        city: data.city,
        state_province: data.stateProvince,
        zip_code: data.zipCode,
        date_of_birth: data.dateOfBirth,
        occupation: data.occupation,
        annual_income_range: data.annualIncomeRange,
        ssn_tin: data.ssnTin,
        account_type: data.accountType,
        passport_image_url: passportPath,
        avatar_url: avatarPublicUrl,
      })
      .eq('user_id', authData.user.id);

    return { error: profileError };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAdmin,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};