import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log for debugging (remove in production)
console.log('Supabase URL:', supabaseUrl ? 'Configured' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Configured' : 'Missing');

// Create a client based on available credentials
let supabaseClient;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Using mock client.');

  // Mock implementation for development
  supabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({
          data: [],
          error: null
        })
      }),
      insert: (data) => Promise.resolve({
        data,
        error: null
      }),
      upsert: (data) => Promise.resolve({
        data,
        error: null
      }),
      order: () => Promise.resolve({
        data: [],
        error: null
      })
    })
  };
} else {
  // Create real Supabase client
  supabaseClient = createClient(supabaseUrl, supabaseKey);
}

export default supabaseClient;
