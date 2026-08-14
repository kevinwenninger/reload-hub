import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';

export type Profile = Tables<'profiles'>;

interface AuthContextValue {
  session: Session | null;
  /** True until the persisted session has been restored from AsyncStorage. */
  initializing: boolean;
  /** Cache-first profile of the signed-in user; null while unknown. */
  profile: Profile | null;
  profileLoading: boolean;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );
    return () => subscription.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;
  const {
    data: profile,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useCachedQuery<Profile>(
    userId === null ? null : `profile:${userId}`,
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single();
      if (error) throw error;
      return data;
    },
  );

  return (
    <AuthContext.Provider
      value={{ session, initializing, profile, profileLoading, refetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
