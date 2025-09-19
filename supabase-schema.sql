-- Supabase database schema for production
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagrams table
CREATE TABLE IF NOT EXISTS diagrams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  content TEXT NOT NULL,
  type TEXT DEFAULT 'mermaid',
  is_public BOOLEAN DEFAULT FALSE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diagrams_owner_id ON diagrams(owner_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_created_at ON diagrams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagrams_is_public ON diagrams(is_public);

-- Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Diagrams policies
CREATE POLICY "Users can view own diagrams" ON diagrams
  FOR SELECT USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can view public diagrams" ON diagrams
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create diagrams" ON diagrams
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can update own diagrams" ON diagrams
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can delete own diagrams" ON diagrams
  FOR DELETE USING (auth.uid()::text = owner_id::text);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diagrams_updated_at BEFORE UPDATE ON diagrams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


