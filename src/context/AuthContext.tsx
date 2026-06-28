import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  providerToken: string | null;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (scopes?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (fullName: string, companyName: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [providerToken, setProviderToken] = useState<string | null>(() => {
    return sessionStorage.getItem('google_provider_token');
  });

  // Sync profile from 'users' table
  const fetchProfile = async (userId: string, fallbackEmail?: string, currentUserObj?: User | null) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Notice: fetching user profile returned error (using local state fallback):', error);
      }

      const activeUser = currentUserObj || user;

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // If profile doesn't exist, auto-insert a placeholder
        const newProfile = {
          id: userId,
          email: fallbackEmail || '',
          full_name: activeUser?.user_metadata?.full_name || activeUser?.user_metadata?.name || 'New User',
          company_name: activeUser?.user_metadata?.company_name || 'GrowInvicta Agency Client',
          created_at: new Date().toISOString(),
        };
        
        // Suppress any errors if table doesn't exist yet, we will fallback gracefully
        const { error: insertError } = await supabase.from('users').upsert(newProfile);
        if (!insertError) {
          setProfile(newProfile);
        } else {
          // If insert fails (table structure not set up yet), define local state fallback profile
          setProfile(newProfile);
        }
      }
    } catch (err) {
      console.warn('Profile fetch handler encountered warning (possibly tables not ready):', err);
      // Fallback
      setProfile({
        id: userId,
        email: fallbackEmail || '',
        full_name: 'User',
        company_name: 'GrowInvicta Agency Client',
        created_at: new Date().toISOString(),
      });
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email, user);
    }
  };

  useEffect(() => {
    // Helper to extract provider_token from hash if present
    const extractHashToken = () => {
      try {
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const pToken = params.get('provider_token');
          if (pToken) {
            setProviderToken(pToken);
            sessionStorage.setItem('google_provider_token', pToken);
          }
        }
      } catch (err) {
        console.warn('Could not extract provider_token from URL hash:', err);
      }
    };

    extractHashToken();

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      const currentUser = initSession?.user ?? null;
      setUser(currentUser);
      
      if (initSession?.provider_token) {
        setProviderToken(initSession.provider_token);
        sessionStorage.setItem('google_provider_token', initSession.provider_token);
      }
      
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email, currentUser);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen to Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentSession?.provider_token) {
          setProviderToken(currentSession.provider_token);
          sessionStorage.setItem('google_provider_token', currentSession.provider_token);
        } else if (event === 'SIGNED_OUT') {
          setProviderToken(null);
          sessionStorage.removeItem('google_provider_token');
        }

        if (currentUser) {
          await fetchProfile(currentUser.id, currentUser.email, currentUser);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Set loading to false once profile is fetched
  useEffect(() => {
    if (user && profile) {
      setLoading(false);
    } else if (!user) {
      setLoading(false);
    }
  }, [user, profile]);

  // Auth Operations
  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            company_name: companyName,
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        // Explicitly create user profile row in public users table
        const profileObj = {
          id: data.user.id,
          email,
          full_name: fullName,
          company_name: companyName,
          created_at: new Date().toISOString(),
        };
        
        const { error: dbError } = await supabase.from('users').upsert(profileObj);
        if (dbError) {
          console.warn('Could not insert profile into users table (it might not be created yet):', dbError);
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithGoogle = async (scopes?: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          scopes: scopes,
          queryParams: scopes ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
        }
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      console.warn('Supabase auth.signOut encountered an error, clearing state locally:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setProviderToken(null);
      sessionStorage.removeItem('google_provider_token');
    }
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    try {
      let redirectTo = `${window.location.origin}/reset-password`;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        redirectTo = 'http://localhost:3000/reset-password';
      } else if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('grow-invicta')) {
        redirectTo = 'https://grow-invicta.vercel.app/reset-password';
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateProfile = async (fullName: string, companyName: string) => {
    try {
      if (!user) throw new Error('No authenticated user available.');
      
      // 1. Update auth user metadata
      const { data: authData, error: metaError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          company_name: companyName,
        }
      });
      if (metaError) throw metaError;

      // Update local state immediately with new auth user info
      if (authData?.user) {
        setUser(authData.user);
      }

      const updatedUser = authData?.user || user;

      // 2. Update DB row if possible
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: fullName,
          company_name: companyName,
        });
      
      if (dbError) {
        console.warn('DB profile upsert failed (this is fine if users table not set up/migrated yet):', dbError);
      }

      // Refresh local profile
      await fetchProfile(user.id, user.email, updatedUser);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        providerToken,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
