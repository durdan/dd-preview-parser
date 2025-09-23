# API Reference

This document provides comprehensive documentation for all REST API endpoints in the diagram editor application, including request/response schemas, authentication requirements, and usage examples.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Diagrams API](#diagrams-api)
4. [PlantUML Rendering API](#plantuml-rendering-api)
5. [Error Responses](#error-responses)
6. [Rate Limiting](#rate-limiting)

## API Overview

The application exposes a RESTful API built on Next.js API routes, providing endpoints for diagram management, user authentication, and external service integration.

**Base URL**: `/api/`
**Content Type**: `application/json`
**Authentication**: JWT via NextAuth.js session cookies

### Available Endpoints

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/diagrams` | GET, POST, PUT, DELETE | Required | Diagram CRUD operations |
| `/api/auth/*` | POST | Optional | NextAuth.js authentication |
| `/api/plantuml/render` | POST | None | PlantUML rendering service |

## Authentication

### NextAuth.js Integration
**Location**: [app/api/auth/[...nextauth]/route.ts](../../app/api/auth/[...nextauth]/route.ts)

Authentication is handled by NextAuth.js with JWT tokens and session management.

#### Configuration
```typescript
// Authentication configuration [ref: lib/auth.ts]
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials against Supabase
        const user = await validateUser(credentials.email, credentials.password);
        return user ? { id: user.id, email: user.email, name: user.name } : null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  }
};
```

#### Authentication Endpoints

##### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  },
  "expires": "2024-01-01T00:00:00.000Z"
}
```

##### Sign Out
```http
POST /api/auth/signout
```

**Response**:
```json
{
  "url": "/api/auth/signin"
}
```

### Protected Route Middleware
**Location**: [lib/auth.ts](../../lib/auth.ts)

Protected endpoints use middleware to validate sessions:

```typescript
export async function requireAuth(request: Request): Promise<User | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Authentication required');
  }

  return session.user;
}
```

## Diagrams API

### Data Model
**Location**: [src/services/diagramService.ts](../../src/services/diagramService.ts)

```typescript
interface DiagramData {
  id?: string;
  title: string;
  content: string;
  type: 'mermaid' | 'plantuml' | 'unknown';
  isPublic?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Endpoints

#### Get All Diagrams
**Location**: [app/api/diagrams/route.ts](../../app/api/diagrams/route.ts)

Retrieve all diagrams for the authenticated user.

```http
GET /api/diagrams
Authorization: Session cookie required
```

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `type` (optional): Filter by diagram type (`mermaid`, `plantuml`)
- `public` (optional): Include public diagrams (`true`, `false`)

**Response**:
```json
{
  "diagrams": [
    {
      "id": "diagram-uuid",
      "title": "Sample Flowchart",
      "content": "graph TD\n    A-->B",
      "type": "mermaid",
      "isPublic": false,
      "userId": "user-uuid",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Create Diagram
```http
POST /api/diagrams
Authorization: Session cookie required
Content-Type: application/json

{
  "title": "My New Diagram",
  "content": "graph TD\n    A-->B-->C",
  "type": "mermaid",
  "isPublic": false
}
```

**Response**:
```json
{
  "id": "new-diagram-uuid",
  "title": "My New Diagram",
  "content": "graph TD\n    A-->B-->C",
  "type": "mermaid",
  "isPublic": false,
  "userId": "user-uuid",
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

#### Get Single Diagram
```http
GET /api/diagrams/{id}
Authorization: Session cookie (required for private diagrams)
```

**Response**:
```json
{
  "id": "diagram-uuid",
  "title": "Sample Flowchart",
  "content": "graph TD\n    A-->B",
  "type": "mermaid",
  "isPublic": true,
  "userId": "user-uuid",
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

#### Update Diagram
```http
PUT /api/diagrams/{id}
Authorization: Session cookie required
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "graph TD\n    A-->B-->C-->D",
  "isPublic": true
}
```

**Response**:
```json
{
  "id": "diagram-uuid",
  "title": "Updated Title",
  "content": "graph TD\n    A-->B-->C-->D",
  "type": "mermaid",
  "isPublic": true,
  "userId": "user-uuid",
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T13:00:00Z"
}
```

#### Delete Diagram
```http
DELETE /api/diagrams/{id}
Authorization: Session cookie required
```

**Response**:
```json
{
  "message": "Diagram deleted successfully",
  "id": "diagram-uuid"
}
```

### Implementation Details

#### Route Handler Structure
```typescript
// app/api/diagrams/route.ts
export async function GET(request: Request) {
  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);

    // Query database with user filter
    const diagrams = await getDiagrams(user.id, { page, limit });

    return NextResponse.json({
      diagrams,
      pagination: calculatePagination(page, limit, diagrams.total)
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
```

#### Database Integration
**Location**: [supabase-schema.sql](../../supabase-schema.sql)

The API integrates with Supabase using Row Level Security:

```sql
-- Diagrams table with RLS policies
CREATE TABLE diagrams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mermaid', 'plantuml', 'unknown')),
  is_public BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagrams"
  ON diagrams FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own diagrams"
  ON diagrams FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## PlantUML Rendering API

### Render Endpoint
**Location**: [app/api/plantuml/render/route.ts](../../app/api/plantuml/render/route.ts)

Provides PlantUML diagram rendering via external service integration.

```http
POST /api/plantuml/render
Content-Type: application/json

{
  "content": "@startuml\nAlice -> Bob: Hello\n@enduml"
}
```

**Response**:
```json
{
  "svg": "<svg xmlns=\"...\" width=\"...\" height=\"...\">...</svg>",
  "format": "svg",
  "cached": false
}
```

### Implementation
```typescript
export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    // Validate input
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // Check content length limit
    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Content exceeds maximum length (10,000 characters)' },
        { status: 400 }
      );
    }

    // Encode for PlantUML service
    const encoded = encodePlantUML(content);
    const serviceUrl = `http://www.plantuml.com/plantuml/svg/${encoded}`;

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(serviceUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Diagram-Editor/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`PlantUML service returned ${response.status}`);
    }

    const svg = await response.text();

    return NextResponse.json({
      svg,
      format: 'svg',
      cached: false
    });

  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'PlantUML service timeout' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'PlantUML rendering failed' },
      { status: 500 }
    );
  }
}
```

### Encoding Function
```typescript
function encodePlantUML(plantuml: string): string {
  // Ensure proper UML wrapping
  let content = plantuml.trim();
  if (!content.startsWith('@startuml')) {
    content = `@startuml\n${content}\n@enduml`;
  }

  // Deflate compression
  const compressed = deflate(content, { level: 9 });

  // Base64 encoding with PlantUML alphabet
  return encode64(compressed);
}
```

## Error Responses

### Standard Error Format
All API endpoints return errors in a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "field": "Specific field error",
    "validation": "Validation details"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `504 Gateway Timeout` - External service timeout

### Common Error Scenarios

#### Authentication Errors
```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### Validation Errors
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "title": "Title is required",
    "content": "Content cannot be empty",
    "type": "Must be one of: mermaid, plantuml"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### Resource Not Found
```json
{
  "error": "Diagram not found",
  "code": "RESOURCE_NOT_FOUND",
  "details": {
    "id": "diagram-uuid"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Rate Limiting

### Implementation
Rate limiting is implemented using Next.js middleware and in-memory storage:

```typescript
// Simplified rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}
```

### Limits by Endpoint
- **Diagrams API**: 100 requests per hour per user
- **PlantUML Rendering**: 50 requests per hour per IP
- **Authentication**: 10 attempts per hour per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Related Pages
- [Architecture Overview](architecture/overview.md) - System architecture
- [Authentication System](authentication-system.md) - Detailed auth implementation
- [Data Models](data-models.md) - Database schema and entities
- [Diagram Processing](diagram-processing.md) - PlantUML integration details

*All file references are relative to repository root: `/workspace/main-repo/`*