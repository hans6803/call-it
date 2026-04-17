import { create } from 'zustand';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  session: Session | null;
  profile: User | null;
  loading: boolean;

  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, loading: false });
    if (session) await loadProfile(session.user, set);

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session });
      if (session) await loadProfile(session.user, set);
      else set({ profile: null });
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUp: async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        display_name: displayName,
      });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },

  updateProfile: async (updates) => {
    const { session } = get();
    if (!session) return;
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', session.user.id);
    if (error) throw error;
    set(state => ({ profile: state.profile ? { ...state.profile, ...updates } : null }));
  },

  refreshProfile: async () => {
    const { session } = get();
    if (!session) return;
    await loadProfile(session.user, set);
  },

  setSession: (session) => set({ session }),
}));

async function loadProfile(user: SupabaseUser, set: (s: Partial<AuthState>) => void) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  set({ profile: data ?? null });
}
