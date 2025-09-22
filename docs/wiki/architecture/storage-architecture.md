# Storage Architecture

## Overview

DD Preview Parser uses **Supabase PostgreSQL** as its primary database with **Row Level Security (RLS)** for fine-grained access control. The architecture provides real-time capabilities, type-safe database operations, and seamless integration with NextAuth.js authentication.

## Database Schema

### Core Tables

```sql
-- Users table managed by Supabase Auth [ref: supabase-schema.sql:1-10]
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Main diagrams table [ref: supabase-schema.sql:12-25]
CREATE TABLE diagrams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mermaid', 'plantuml')),
  is_public BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  thumbnail TEXT, -- Base64 encoded thumbnail or URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Diagram sharing and collaboration [ref: supabase-schema.sql:27-35]
CREATE TABLE diagram_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(diagram_id, shared_with)
);

-- Template system for common diagrams [ref: supabase-schema.sql:37-45]
CREATE TABLE diagram_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mermaid', 'plantuml')),
  category TEXT NOT NULL,
  is_official BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### Indexes for Performance

```sql
-- Performance indexes [ref: supabase-schema.sql:47-55]
CREATE INDEX idx_diagrams_owner_updated ON diagrams(owner_id, updated_at DESC);
CREATE INDEX idx_diagrams_public ON diagrams(is_public) WHERE is_public = true;
CREATE INDEX idx_diagrams_type ON diagrams(type);
CREATE INDEX idx_diagrams_title_search ON diagrams USING gin(to_tsvector('english', title));
CREATE INDEX idx_diagram_shares_user ON diagram_shares(shared_with);
CREATE INDEX idx_templates_category ON diagram_templates(category);
```

## Row Level Security (RLS) Policies

### Diagram Access Control

```sql
-- Enable RLS on all tables [ref: supabase-schema.sql:57-60]
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Diagram policies [ref: supabase-schema.sql:62-85]
-- Users can view their own diagrams and public diagrams
CREATE POLICY "diagrams_select_policy" ON diagrams
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    is_public = true OR
    id IN (
      SELECT diagram_id FROM diagram_shares 
      WHERE shared_with = auth.uid()
    )
  );

-- Users can insert their own diagrams
CREATE POLICY "diagrams_insert_policy" ON diagrams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own diagrams or diagrams shared with edit permission
CREATE POLICY "diagrams_update_policy" ON diagrams
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT diagram_id FROM diagram_shares 
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  ) WITH CHECK (
    owner_id = auth.uid() OR
    id IN (
      SELECT diagram_id FROM diagram_shares 
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  );

-- Users can delete their own diagrams
CREATE POLICY "diagrams_delete_policy" ON diagrams
  FOR DELETE USING (owner_id = auth.uid());
```

### Profile Access Control

```sql
-- Profile policies [ref: supabase-schema.sql:87-95]
-- Users can view their own profile
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());
```

### Sharing Policies

```sql
-- Diagram sharing policies [ref: supabase-schema.sql:97-110]
-- Users can view shares for diagrams they own or that are shared with them
CREATE POLICY "shares_select_policy" ON diagram_shares
  FOR SELECT USING (
    shared_with = auth.uid() OR
    diagram_id IN (SELECT id FROM diagrams WHERE owner_id = auth.uid())
  );

-- Only diagram owners can create shares
CREATE POLICY "shares_insert_policy" ON diagram_shares
  FOR INSERT WITH CHECK (
    diagram_id IN (SELECT id FROM diagrams WHERE owner_id = auth.uid())
  );

-- Only diagram owners can delete shares
CREATE POLICY "shares_delete_policy" ON diagram_shares
  FOR DELETE USING (
    diagram_id IN (SELECT id FROM diagrams WHERE owner_id = auth.uid())
  );
```

## TypeScript Integration

### Database Types

```typescript
// Generated Supabase types [ref: src/types/supabase.ts]
export interface Database {
  public: {
    Tables: {
      diagrams: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'mermaid' | 'plantuml';
          is_public: boolean;
          owner_id: string;
          thumbnail: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type: 'mermaid' | 'plantuml';
          is_public?: boolean;
          owner_id: string;
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: 'mermaid' | 'plantuml';
          is_public?: boolean;
          owner_id?: string;
          thumbnail?: string | null;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
```

### Application Types

```typescript
// Application-specific types [ref: src/types/diagram.ts]
export interface Diagram {
  id: string;
  title: string;
  content: string;
  type: 'mermaid' | 'plantuml';
  isPublic: boolean;
  ownerId: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagramShare {
  id: string;
  diagramId: string;
  sharedWith: string;
  permission: 'view' | 'edit';
  createdAt: Date;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  type: 'mermaid' | 'plantuml';
  category: string;
  isOfficial: boolean;
  createdBy?: string;
  createdAt: Date;
}

// User profile interface [ref: src/types/user.ts]
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Database Client Configuration

### Supabase Client Setup

```typescript
// Supabase client configuration [ref: lib/supabase.ts]
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Service role client for admin operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

### Database Service Layer

```typescript
// Database service abstraction [ref: src/services/DatabaseService.ts]
import { supabase } from '@/lib/supabase';
import type { Diagram, DiagramShare, UserProfile } from '@/types';

export class DatabaseService {
  // Diagram operations
  static async getDiagrams(userId: string, page = 1, limit = 20): Promise<Diagram[]> {
    const offset = (page - 1) * limit;
    
    const { data, error } = await supabase
      .from('diagrams')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch diagrams: ${error.message}`);
    
    return data.map(this.mapDiagramFromDB);
  }

  static async getDiagram(id: string, userId?: string): Promise<Diagram | null> {
    let query = supabase
      .from('diagrams')
      .select('*')
      .eq('id', id);

    // If userId provided, ensure user has access
    if (userId) {
      query = query.or(`owner_id.eq.${userId},is_public.eq.true`);
    } else {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch diagram: ${error.message}`);
    }

    return this.mapDiagramFromDB(data);
  }

  static async createDiagram(diagram: Omit<Diagram, 'id' | 'createdAt' | 'updatedAt'>): Promise<Diagram> {
    const { data, error } = await supabase
      .from('diagrams')
      .insert({
        title: diagram.title,
        content: diagram.content,
        type: diagram.type,
        is_public: diagram.isPublic,
        owner_id: diagram.ownerId,
        thumbnail: diagram.thumbnail,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create diagram: ${error.message}`);
    
    return this.mapDiagramFromDB(data);
  }

  static async updateDiagram(id: string, updates: Partial<Diagram>): Promise<Diagram> {
    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.content) updateData.content = updates.content;
    if (updates.type) updateData.type = updates.type;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
    if (updates.thumbnail) updateData.thumbnail = updates.thumbnail;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('diagrams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update diagram: ${error.message}`);
    
    return this.mapDiagramFromDB(data);
  }

  static async deleteDiagram(id: string): Promise<void> {
    const { error } = await supabase
      .from('diagrams')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete diagram: ${error.message}`);
  }

  // Profile operations
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return this.mapProfileFromDB(data);
  }

  static async createProfile(profile: UserProfile): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatarUrl,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create profile: ${error.message}`);
    
    return this.mapProfileFromDB(data);
  }

  // Helper methods for data mapping
  private static mapDiagramFromDB(data: any): Diagram {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      type: data.type,
      isPublic: data.is_public,
      ownerId: data.owner_id,
      thumbnail: data.thumbnail,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapProfileFromDB(data: any): UserProfile {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
```

## Real-Time Features

### Subscription Setup

```typescript
// Real-time diagram updates [ref: src/hooks/useRealtimeDiagrams.ts]
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Diagram } from '@/types';

export function useRealtimeDiagrams(userId: string) {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);

  useEffect(() => {
    // Initial load
    const loadDiagrams = async () => {
      const data = await DatabaseService.getDiagrams(userId);
      setDiagrams(data);
    };
    
    loadDiagrams();

    // Set up real-time subscription
    const channel = supabase
      .channel('diagram-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diagrams',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Diagram change received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setDiagrams(prev => [
                DatabaseService.mapDiagramFromDB(payload.new),
                ...prev
              ]);
              break;
              
            case 'UPDATE':
              setDiagrams(prev => prev.map(diagram =>
                diagram.id === payload.new.id
                  ? DatabaseService.mapDiagramFromDB(payload.new)
                  : diagram
              ));
              break;
              
            case 'DELETE':
              setDiagrams(prev => prev.filter(diagram => 
                diagram.id !== payload.old.id
              ));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return diagrams;
}
```

## Migration Management

### Database Migrations

```sql
-- Migration example: Add collaboration features [ref: migrations/20240101_add_collaboration.sql]
-- Create diagram_shares table
CREATE TABLE diagram_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(diagram_id, shared_with)
);

-- Add RLS policies for sharing
ALTER TABLE diagram_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shares_select_policy" ON diagram_shares
  FOR SELECT USING (
    shared_with = auth.uid() OR
    diagram_id IN (SELECT id FROM diagrams WHERE owner_id = auth.uid())
  );

-- Update diagram select policy to include shared diagrams
DROP POLICY IF EXISTS "diagrams_select_policy" ON diagrams;
CREATE POLICY "diagrams_select_policy" ON diagrams
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    is_public = true OR
    id IN (
      SELECT diagram_id FROM diagram_shares 
      WHERE shared_with = auth.uid()
    )
  );
```

### Rollback Procedures

```sql
-- Rollback migration: Remove collaboration features
DROP TABLE IF EXISTS diagram_shares;

-- Restore original diagram select policy  
DROP POLICY IF EXISTS "diagrams_select_policy" ON diagrams;
CREATE POLICY "diagrams_select_policy" ON diagrams
  FOR SELECT USING (owner_id = auth.uid() OR is_public = true);
```

## Performance Optimization

### Query Optimization

```typescript
// Optimized queries with proper indexing [ref: src/services/DiagramSearch.ts]
export class DiagramSearch {
  static async searchDiagrams(
    query: string, 
    userId: string, 
    filters: SearchFilters = {}
  ): Promise<Diagram[]> {
    let dbQuery = supabase
      .from('diagrams')
      .select('*')
      .or(`owner_id.eq.${userId},is_public.eq.true`);

    // Full-text search on title and content
    if (query) {
      dbQuery = dbQuery.textSearch('title', query, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Type filter
    if (filters.type) {
      dbQuery = dbQuery.eq('type', filters.type);
    }

    // Date range filter
    if (filters.dateFrom) {
      dbQuery = dbQuery.gte('updated_at', filters.dateFrom.toISOString());
    }
    
    if (filters.dateTo) {
      dbQuery = dbQuery.lte('updated_at', filters.dateTo.toISOString());
    }

    // Pagination
    const offset = (filters.page || 1 - 1) * (filters.limit || 20);
    dbQuery = dbQuery
      .order('updated_at', { ascending: false })
      .range(offset, offset + (filters.limit || 20) - 1);

    const { data, error } = await dbQuery;

    if (error) throw new Error(`Search failed: ${error.message}`);
    
    return data.map(DatabaseService.mapDiagramFromDB);
  }
}
```

### Connection Pooling

```typescript
// Connection pooling configuration [ref: lib/supabase.ts]
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'dd-preview-parser',
      },
    },
  }
);
```

## Backup and Recovery

### Automated Backups

```sql
-- Supabase provides automated backups, but custom backup procedures can be implemented
-- Create backup of critical data
CREATE OR REPLACE FUNCTION backup_user_data(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE p.id = user_id),
    'diagrams', (SELECT json_agg(row_to_json(d)) FROM diagrams d WHERE d.owner_id = user_id),
    'shares', (SELECT json_agg(row_to_json(s)) FROM diagram_shares s 
               WHERE s.diagram_id IN (SELECT id FROM diagrams WHERE owner_id = user_id))
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Data Export Features

```typescript
// User data export functionality [ref: src/services/DataExport.ts]
export class DataExportService {
  static async exportUserData(userId: string): Promise<ExportData> {
    const [profile, diagrams, shares] = await Promise.all([
      DatabaseService.getProfile(userId),
      DatabaseService.getDiagrams(userId, 1, 1000), // Get all diagrams
      this.getUserShares(userId)
    ]);

    return {
      exportDate: new Date().toISOString(),
      profile,
      diagrams,
      shares,
    };
  }

  private static async getUserShares(userId: string): Promise<DiagramShare[]> {
    const { data, error } = await supabase
      .from('diagram_shares')
      .select('*')
      .eq('shared_with', userId);

    if (error) throw new Error(`Failed to fetch shares: ${error.message}`);
    
    return data;
  }
}
```

---

**Related Documentation**:
- [System Overview](./system-overview.md) - High-level architecture
- [Data Flow](./data-flow.md) - Request lifecycle patterns  
- [Authentication](./authentication.md) - NextAuth.js and RLS integration

**Navigation**: [← Back to Authentication](./authentication.md) | [Next: Frontend Components →](../frontend/component-architecture.md)