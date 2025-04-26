-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  owner_name TEXT,
  email TEXT,
  phone TEXT,
  social_media JSONB,
  address TEXT,
  description TEXT,
  sector TEXT NOT NULL,
  location TEXT NOT NULL,
  source TEXT,
  verification_score FLOAT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_name, location)
);

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  sector TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exports table
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  sector TEXT NOT NULL,
  location TEXT NOT NULL,
  lead_count INTEGER NOT NULL,
  spreadsheet_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table to store public user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_sector_location ON leads(sector, location);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id); -- Index for profiles table

-- Create RLS (Row Level Security) policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; -- Enable RLS for profiles

-- Create policy for leads (public read, authenticated write)
CREATE POLICY "Allow public read access" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON leads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON leads FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy for saved_searches (user can only see their own searches)
CREATE POLICY "Users can only see their own searches" ON saved_searches
  FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can only insert their own searches" ON saved_searches
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create policy for exports (user can only see their own exports)
CREATE POLICY "Users can only see their own exports" ON exports
  FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can only insert their own exports" ON exports
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create policy for profiles (users can view all profiles, update their own)
CREATE POLICY "Allow public read access to profiles" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
