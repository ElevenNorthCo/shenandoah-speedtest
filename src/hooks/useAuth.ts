import { useState, useEffect, useCallback } from 'react';
import { supabase, signInWithMagicLink, signOut as supaSignOut, onAuthChange } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    // Check initial session
    supabase.auth.getUser().then(({ data }) => {
      setState({ user: data.user, loading: false });
    });

    // Subscribe to auth changes
    const subscription = onAuthChange((user) => {
      setState({ user, loading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string) => {
    const { error } = await signInWithMagicLink(email);
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supaSignOut();
    setState({ user: null, loading: false });
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    signIn,
    signOut,
  };
}
