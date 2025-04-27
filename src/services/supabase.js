import { createClient } from '@supabase/supabase-js';

// Use the correct Supabase URL and key
// Use environment variables provided by Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log Supabase configuration for debugging (using env vars)
console.log('Supabase URL from env:', supabaseUrl);
console.log('Supabase Key available from env:', !!supabaseAnonKey);

// Check if environment variables are set
if (!supabaseUrl) {
  console.error('CRITICAL: Missing environment variable VITE_SUPABASE_URL. Frontend Supabase features will not work.');
  // alert('Application configuration error: Supabase URL is missing.'); // Optional: Alert user
}
if (!supabaseAnonKey) {
  console.error('CRITICAL: Missing environment variable VITE_SUPABASE_ANON_KEY. Frontend Supabase features will not work.');
  // alert('Application configuration error: Supabase Key is missing.'); // Optional: Alert user
}

// Initialize Supabase client only if variables are present
let supabaseInstance = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'lead-generation-auth',
        storage: localStorage
      }
    });
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
    // Create a fallback instance with default values for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating fallback Supabase client for development');
      supabaseInstance = {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signOut: async () => ({ error: null })
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => ({ data: [], error: null })
            })
          }),
          insert: () => ({ error: null })
        })
      };
    }
  }
} else {
  console.error("Supabase client could not be initialized due to missing environment variables.");
  // Create a mock instance for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating mock Supabase client for development');
    supabaseInstance = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({ data: [], error: null })
          })
        }),
        insert: () => ({ error: null })
      })
    };
  }
}

export const supabase = supabaseInstance;

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
