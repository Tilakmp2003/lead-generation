const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing required environment variable: SUPABASE_URL');
  throw new Error('Missing required environment variable: SUPABASE_URL. Please set it in your .env file or environment configuration.');
}
if (!supabaseKey) {
  console.error('Missing required environment variable: SUPABASE_ANON_KEY');
  throw new Error('Missing required environment variable: SUPABASE_ANON_KEY. Please set it in your .env file or environment configuration.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
