import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ data: { provider: string; url: string | null }; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session retrieval
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error('Error fetching initial Supabase session:', error.message);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    // 2. Real-time auth state changes (login, logout, token refresh, OAuth redirects)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName?.trim(),
        },
      },
    });

    if (error) {
      return { data, error };
    }

    // If an active session is already present, store it and return immediately
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      return { data, error: null };
    }

    // Direct fallback: Immediately sign in to establish an active session without email verification
    const signInRes = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signInRes.data?.session) {
      setSession(signInRes.data.session);
      setUser(signInRes.data.session.user);
      return { data: signInRes.data, error: null };
    }

    return { data, error: signInRes.error ?? null };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data: { provider: 'google', url: data?.url ?? null }, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOut,
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
