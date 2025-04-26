import { createClient } from '@supabase/supabase-js';

// Use the correct Supabase URL and key
const supabaseUrl = 'https://jdsknrzxmolslatpeokc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkc2tucnp4bW9sc2xhdHBlb2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NDM4NDgsImV4cCI6MjA2MTIxOTg0OH0.ljqnp2bSfiRJ6NUcvrc0muN_HnqbQ6-vsogZ0uk8P1U';

// Log Supabase configuration for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key available:', !!supabaseAnonKey);

// Create Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'lead-generation-auth',
    storage: localStorage
  }
});

// Log the current session for debugging
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error getting session:', error.message);
  } else if (data?.session) {
    console.log('Current session:', data.session.user.email);
  } else {
    console.log('No active session');
  }
});

// API functions for authentication
export const authApi = {
  // Register a new user
  register: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;
    return data;
  },

  // Login with email and password
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Login with Google
  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
    return data;
  },

  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }
};
