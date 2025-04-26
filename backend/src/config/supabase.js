const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://vusraeqlushmmiofpvdc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkc2tucnp4bW9sc2xhdHBlb2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NDM4NDgsImV4cCI6MjA2MTIxOTg0OH0.ljqnp2bSfiRJ6NUcvrc0muN_HnqbQ6-vsogZ0uk8P1U';

if (!supabaseKey) {
  console.error('Supabase key is missing. Please add SUPABASE_ANON_KEY to your .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
