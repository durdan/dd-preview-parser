# Data Models

This document describes the data models, database schema, and TypeScript type definitions used throughout the DD Preview Parser application.

## Database Schema

### Core Tables [ref: supabase-schema.sql]

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores user account information for authentication and diagram ownership.

**Indexes**:
- Primary key on `id`
- Unique index on `email`
- Created/updated timestamps for auditing

#### Diagrams Table
```sql
CREATE TABLE diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'mermaid',
  is_public BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores diagram data with ownership, privacy settings, and content.

**Indexes**:
- Primary key on `id`
- Foreign key on `owner_id` → `users(id)`
- Index on `is_public` for public diagram queries
- Index on `owner_id, created_at` for user dashboard queries

### Row Level Security (RLS)

**User Access Control**:
```sql
-- Users can only access their own records
CREATE POLICY users_own_data ON users
  FOR ALL USING (auth.uid()::text = id::text);

-- Diagram access policies
CREATE POLICY diagrams_owner_access ON diagrams
  FOR ALL USING (auth.uid()::text = owner_id::text);

CREATE POLICY diagrams_public_read ON diagrams
  FOR SELECT USING (is_public = true);
```

## TypeScript Type Definitions

### Core Domain Types [ref: src/types/diagram.ts]

#### Diagram Type
```typescript
export interface Diagram {
  id: string;
  title: string;
  description?: string;
  content: string;
  type: 'mermaid' | 'plantuml';
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
```

**Usage**: Primary data model for diagram entities throughout the application.

**Validation**:
- `title`: Required, 1-255 characters
- `content`: Required, diagram syntax content
- `type`: Enum validation for supported diagram types
- `isPublic`: Boolean flag for privacy control

#### Diagram Input Types
```typescript
export interface DiagramInput {
  title: string;
  description?: string;
  content: string;
  type?: 'mermaid' | 'plantuml';
  isPublic?: boolean;
}

export interface DiagramUpdate {
  title?: string;
  description?: string;
  content?: string;
  isPublic?: boolean;
}
```

**Purpose**: Input validation types for create and update operations.

### Parsing Types [ref: src/types/parser.ts]

#### Diagram Node Structure
```typescript
export interface DiagramNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'custom';
  position?: {
    x: number;
    y: number;
  };
  metadata?: Record<string, any>;
}
```

#### Diagram Connection
```typescript
export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
  type?: 'solid' | 'dashed' | 'dotted';
}
```

#### Parsed Diagram Result
```typescript
export interface ParsedDiagram {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  errors: ParseError[];
  metadata: {
    diagramType: string;
    syntax: string;
    version?: string;
  };
}

export interface ParseError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
```

**Usage**: Output from diagram parsing services for validation and rendering [ref: src/services/DiagramParser.js].

### API Types [ref: services/diagramService.ts]

#### Service Layer Types
```typescript
export interface DiagramData {
  title: string;
  content: string;
  description?: string;
  isPublic?: boolean;
  id?: string;
}

export interface SavedDiagram extends DiagramData {
  id: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  type: 'mermaid' | 'plantuml';
}
```

#### API Response Types
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**Usage**: Standardized API response format used across all endpoints [ref: app/api/diagrams/route.ts].

### Authentication Types [ref: lib/auth.ts]

#### User Session
```typescript
export interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  expires: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}
```

#### JWT Payload
```typescript
export interface JWTPayload {
  sub: string; // user id
  email: string;
  name?: string;
  iat: number;
  exp: number;
}
```

### Export Types [ref: src/services/DiagramExporter.js]

#### Export Configuration
```typescript
export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'jpeg';
  quality?: number; // 0.1 - 1.0 for JPEG
  width?: number;
  height?: number;
  backgroundColor?: string;
  scale?: number; // 1x, 2x, 3x for retina displays
}

export interface ExportResult {
  data: string | Blob;
  filename: string;
  mimeType: string;
  size: number;
}
```

### Validation Schemas [ref: lib/validation.js]

#### Input Validation Rules
```typescript
export const DiagramValidation = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_]+$/
  },
  content: {
    required: true,
    minLength: 1,
    maxLength: 50000 // ~50KB text limit
  },
  description: {
    required: false,
    maxLength: 1000
  },
  type: {
    required: false,
    enum: ['mermaid', 'plantuml']
  }
};
```

## Data Relationships

### Entity Relationship Diagram
```
Users (1) ────────────── (N) Diagrams
  │                           │
  │ id                       │ owner_id
  │ email                    │ title
  │ name                     │ content
  │ created_at               │ type
  │ updated_at               │ is_public
                             │ created_at
                             │ updated_at
```

### Foreign Key Constraints
- `diagrams.owner_id` → `users.id` (CASCADE DELETE)
- Orphaned diagrams are automatically deleted when user is removed
- Public diagrams remain accessible even if owner account is deactivated

## Data Access Patterns

### Common Queries

#### User Dashboard Query
```sql
SELECT id, title, description, type, is_public, created_at, updated_at
FROM diagrams
WHERE owner_id = $1
ORDER BY updated_at DESC
LIMIT $2 OFFSET $3;
```

#### Public Diagrams Query
```sql
SELECT d.id, d.title, d.description, d.type, d.created_at, u.name as owner_name
FROM diagrams d
JOIN users u ON d.owner_id = u.id
WHERE d.is_public = true
ORDER BY d.created_at DESC
LIMIT $1 OFFSET $2;
```

#### Diagram Search Query
```sql
SELECT id, title, description, type, created_at
FROM diagrams
WHERE owner_id = $1
AND (title ILIKE $2 OR description ILIKE $2)
ORDER BY updated_at DESC;
```

### Caching Strategy

#### Application-Level Caching
- **Public Diagrams**: 5-minute cache for public diagram listings
- **User Sessions**: In-memory session caching
- **Rendered Diagrams**: Browser cache for SVG outputs

#### Database-Level Optimization
- **Connection Pooling**: Supabase managed connection pool
- **Query Optimization**: Indexed columns for common filters
- **Prepared Statements**: Parameterized queries to prevent SQL injection

## Data Migration Strategy

### Version Control
- **Schema Migrations**: Supabase migration files
- **Rollback Support**: Each migration includes down migration
- **Environment Consistency**: Same schema across dev/staging/prod

### Backup and Recovery
- **Automated Backups**: Daily Supabase automated backups
- **Point-in-Time Recovery**: 7-day recovery window
- **Export Functionality**: User data export via API

## Performance Considerations

### Database Performance
- **Indexing Strategy**: Optimized indexes for common query patterns
- **Query Optimization**: Efficient JOIN operations and filtering
- **Connection Management**: Proper connection pooling and cleanup

### Application Performance
- **Type Safety**: TypeScript prevents runtime type errors
- **Validation**: Client and server-side validation reduces database load
- **Caching**: Strategic caching reduces database queries

## Security Considerations

### Data Protection
- **Row Level Security**: Database-level access control
- **Input Sanitization**: Prevent XSS and injection attacks
- **Audit Trail**: Created/updated timestamps for compliance

### Privacy Controls
- **Public/Private Flags**: User-controlled diagram visibility
- **Access Controls**: Owner-only access to private diagrams
- **Data Deletion**: Cascade delete maintains referential integrity

---

**Related Documentation**:
- [System Overview](system-overview.md) - High-level architecture
- [API Design](api-design.md) - API contracts and endpoints
- [Authentication System](../features/authentication.md) - User management details