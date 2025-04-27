const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Use default values for development if environment variables are not set
if (!supabaseUrl) {
  console.warn('Missing environment variable: SUPABASE_URL. Using default value for development.');
  supabaseUrl = 'https://vusraeqlushmmiofpvdc.supabase.co';
}
if (!supabaseKey) {
  console.warn('Missing environment variable: SUPABASE_ANON_KEY. Using a placeholder value for development.');
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-key-for-development';
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
