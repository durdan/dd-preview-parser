# System Overview

This document provides a comprehensive overview of the DD Preview Parser system architecture, based on the actual implementation found in this repository.

## High-Level Architecture

The DD Preview Parser follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Data Layer    │
│   (Next.js)     │◄──►│  (API Routes)   │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ - React Pages   │    │ - Diagram CRUD  │    │ - PostgreSQL    │
│ - Components    │    │ - Auth Routes   │    │ - User Auth     │
│ - Monaco Editor │    │ - PlantUML API  │    │ - File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ External Service│
                    │  (PlantUML)     │
                    │                 │
                    │ - Java Service  │
                    │ - SVG Rendering │
                    └─────────────────┘
```

## Core Components

### Frontend Layer [ref: app/, src/components/]

**Next.js App Router Structure**:
- `/app/page.tsx` - Landing page with embedded diagram editor [ref: app/page.tsx]
- `/app/editor/page.tsx` - Standalone diagram editor interface [ref: app/editor/page.tsx]
- `/app/dashboard/page.tsx` - User dashboard for diagram management [ref: app/dashboard/page.tsx]
- `/app/auth/` - Authentication pages (login, register, callback) [ref: app/auth/]

**Core React Components**:
- `DiagramEditor` - Monaco-based code editor with syntax highlighting [ref: src/components/DiagramEditor.tsx]
- `DiagramPreview` - Real-time Mermaid diagram rendering [ref: src/components/DiagramPreview.tsx]
- `Dashboard` - User diagram management interface [ref: src/components/Dashboard.jsx]
- `ProtectedRoute` - Authentication wrapper component [ref: src/components/ProtectedRoute.jsx]

### API Layer [ref: app/api/]

**Authentication Routes**:
- `/api/auth/[...nextauth]/route.ts` - NextAuth.js handler [ref: app/api/auth/[...nextauth]/route.ts]
- `/api/auth/register/route.ts` - User registration endpoint [ref: app/api/auth/register/route.ts]

**Diagram Management Routes**:
- `/api/diagrams/route.ts` - List and create diagrams [ref: app/api/diagrams/route.ts]
- `/api/diagrams/[id]/route.ts` - Individual diagram CRUD operations [ref: app/api/diagrams/[id]/route.ts]
- `/api/diagrams/public/route.ts` - Public diagram listings [ref: app/api/diagrams/public/route.ts]

**PlantUML Integration Routes**:
- `/api/plantuml/render/route.ts` - PlantUML diagram rendering [ref: app/api/plantuml/render/route.ts]
- `/api/plantuml/validate/route.ts` - PlantUML syntax validation [ref: app/api/plantuml/validate/route.ts]

### Service Layer

**Core Services** [ref: src/services/]:
- `DiagramRenderer.ts` - Mermaid diagram rendering service [ref: src/services/DiagramRenderer.ts]
- `DiagramParser.js` - Diagram syntax parsing and validation [ref: src/services/DiagramParser.js]
- `DiagramExporter.js` - Export functionality (PNG, SVG, PDF) [ref: src/services/DiagramExporter.js]

**High-Level Services** [ref: services/]:
- `diagramService.ts` - Diagram CRUD operations with error handling [ref: services/diagramService.ts]
- `exportService.js` - Export orchestration service [ref: services/exportService.js]

**Utility Layer** [ref: lib/]:
- `auth.ts` - NextAuth configuration and JWT handling [ref: lib/auth.ts]
- `validation.js` - Input validation schemas [ref: lib/validation.js]
- `errorHandler.js` - Global error handling utilities [ref: lib/errorHandler.js]

### Data Layer

**Database Schema** [ref: supabase-schema.sql]:
```sql
-- Users table with authentication
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Diagrams table with ownership and privacy
diagrams (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type VARCHAR DEFAULT 'mermaid',
  is_public BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Row Level Security (RLS)**:
- Users can only access their own diagrams
- Public diagrams are accessible to all authenticated users
- Anonymous users can only view public diagrams

### External Services

**PlantUML Java Microservice** [ref: src/main/java/com/example/plantuml/]:
- `PlantUMLController.java` - REST API controller [ref: src/main/java/com/example/plantuml/PlantUMLController.java]
- `PlantUMLService.java` - PlantUML rendering service [ref: src/main/java/com/example/plantuml/PlantUMLService.java]
- `Application.java` - Spring Boot application entry point [ref: src/main/java/com/example/plantuml/Application.java]

## Data Flow Patterns

### Diagram Creation Flow
1. User types in Monaco editor → `DiagramEditor` component
2. Real-time validation → `DiagramParser` service
3. Live rendering → `DiagramRenderer` → Mermaid.js
4. Save action → API route → `diagramService` → Supabase

### Authentication Flow
1. User login → NextAuth.js provider
2. Credential validation → Supabase auth
3. JWT token generation → Session storage
4. Protected route access → `ProtectedRoute` component

### PlantUML Rendering Flow
1. PlantUML syntax input → Editor
2. API call → `/api/plantuml/render`
3. Java service invocation → PlantUML library
4. SVG response → Frontend rendering

## Technology Stack

### Frontend Technologies
- **Next.js 13+**: React framework with App Router [ref: package.json:22]
- **TypeScript**: Static type checking [ref: tsconfig.json]
- **Tailwind CSS**: Utility-first CSS framework [ref: package.json:33]
- **Monaco Editor**: VS Code editor component [ref: package.json:25]
- **Mermaid.js**: Diagram rendering library [ref: package.json:24]

### Backend Technologies
- **Next.js API Routes**: Server-side API endpoints
- **NextAuth.js**: Authentication framework [ref: package.json:27]
- **Supabase**: PostgreSQL database and auth [ref: supabase-schema.sql]
- **Spring Boot**: Java microservice framework [ref: src/main/java/]

### Development Tools
- **ESLint**: Code linting and formatting [ref: .eslintrc.json]
- **Jest**: Unit testing framework [ref: package.json:45]
- **Husky**: Git hooks for pre-commit validation [ref: package.json:47]

## Performance Considerations

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for heavy components [ref: app/page.tsx:6-14]
- **Debounced Rendering**: Prevents excessive re-renders [ref: src/hooks/useDebouncedValue.ts]
- **Lazy Loading**: Monaco editor loaded on demand

### Backend Optimizations
- **Database Indexing**: Optimized queries for diagram retrieval
- **Caching**: API response caching for public diagrams
- **Error Boundaries**: Graceful error handling [ref: lib/errorHandler.js]

## Security Architecture

### Authentication Security
- **JWT Tokens**: Secure session management [ref: lib/auth.ts]
- **Password Hashing**: Bcrypt for credential storage
- **CSRF Protection**: Built-in Next.js protection

### Data Security
- **Row Level Security**: Database-level access control
- **Input Validation**: Server-side validation [ref: lib/validation.js]
- **XSS Prevention**: Sanitized diagram content

## Scalability Design

### Horizontal Scaling
- **Stateless API**: Enables load balancing
- **Database Connection Pooling**: Supabase managed connections
- **CDN Ready**: Static asset optimization

### Vertical Scaling
- **Efficient Queries**: Optimized database operations
- **Memory Management**: Proper cleanup in React components
- **Resource Optimization**: Minimal bundle sizes

## Integration Points

### Internal Integrations
- **Monaco ↔ Mermaid**: Real-time syntax validation and rendering
- **NextAuth ↔ Supabase**: Authentication provider integration
- **API Routes ↔ Services**: Clean separation of concerns

### External Integrations
- **PlantUML Server**: Java microservice for specialized rendering
- **Supabase**: Third-party database and authentication
- **CDN Services**: Asset delivery optimization

## Error Handling Strategy

### Frontend Error Handling
- **Error Boundaries**: React error boundary components
- **User Feedback**: Graceful error messages [ref: src/components/ErrorDisplay.tsx]
- **Retry Logic**: Automatic retry for transient failures

### Backend Error Handling
- **Global Handler**: Centralized error processing [ref: lib/errorHandler.js]
- **Structured Errors**: Consistent error response format
- **Logging**: Comprehensive error logging for debugging

---

**Related Documentation**:
- [Data Models](data-models.md) - Database schema and type definitions
- [API Design](api-design.md) - API contracts and request/response patterns
- [Getting Started](../development/getting-started.md) - Development setup guide