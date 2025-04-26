import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        setLoading(true);

        // Get current session - Supabase handles OAuth redirects automatically
        // by checking URL parameters and setting the session internally.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error.message);
          setUser(null);
          setSession(null);
        } else if (session) {
          console.log('Found active session on initial load:', session.user.email);
          setSession(session);
          setUser(session.user);
        } else {
          console.log('No active session found on initial load');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);

        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    // Initialize auth
    initAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN') {
          console.log('User signed in:', newSession?.user?.email);
          setSession(newSession);
          setUser(newSession?.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
          setSession(newSession);
          setUser(newSession?.user);
        }

        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Register with email and password
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);

      // Use real authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error.message);

      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Initiating Google OAuth login...');

      // Get the current URL for the redirect
      const redirectUrl = `${window.location.origin}/callback`;
      console.log('Using redirect URL:', redirectUrl);

      // Clear any existing session first
      await supabase.auth.signOut();

      // Use the standard flow for OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Error initiating Google OAuth:', error.message);
        throw error;
      }

      // Log the OAuth URL for debugging
      console.log('Google OAuth URL:', data?.url);

      // If we have a URL, redirect to it
      if (data?.url) {
        console.log('Redirecting to Google OAuth URL...');

        // Redirect to Google OAuth
        window.location.href = data.url;
      } else {
        console.error('No OAuth URL returned from Supabase');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Google login error:', error.message);

      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
