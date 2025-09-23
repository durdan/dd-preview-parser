# Architecture Overview

## System Architecture

DD Preview Parser is a modern Next.js application built for creating and editing Mermaid and PlantUML diagrams with real-time preview capabilities. The architecture follows a clean separation of concerns with distinct layers for presentation, business logic, and data management.

### Technology Stack

**Frontend Framework:**
- Next.js 14 with App Router [ref: package.json, app/layout.tsx]
- React 18 with TypeScript [ref: package.json]
- Tailwind CSS for styling [ref: tailwind.config.js]

**Editor & Rendering:**
- Monaco Editor (VS Code editor) [ref: @monaco-editor/react in package.json]
- Mermaid.js for client-side diagram rendering [ref: src/services/DiagramRenderer.ts]
- PlantUML server integration for server-side rendering [ref: app/api/plantuml/]

**Authentication & Data:**
- NextAuth.js for authentication [ref: lib/auth.ts]
- Supabase for database (PostgreSQL) [ref: supabase-schema.sql]
- In-memory storage for development [ref: app/api/diagrams/route.ts]

**Development & Testing:**
- Jest and React Testing Library [ref: package.json, tests/]
- TypeScript for type safety [ref: tsconfig.json]
- ESLint and Prettier for code quality [ref: .eslintrc.json]

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │   External      │
│                 │    │                 │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ React Components│────│ Next.js API     │────│ PlantUML Server │
│ Monaco Editor   │    │ Routes          │    │                 │
│ Mermaid.js      │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ NextAuth Client │────│ NextAuth Server │    │ Supabase        │
│                 │    │                 │    │ PostgreSQL      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Modules

#### 1. Editor Layer
**Primary Component:** `src/components/DiagramEditor.tsx` [ref: src/components/DiagramEditor.tsx]
- Integrates Monaco Editor for code editing
- Handles diagram type detection (Mermaid vs PlantUML)
- Manages editor state and user interactions
- Provides real-time preview synchronization

#### 2. Rendering Engine
**Mermaid Rendering:** `src/services/DiagramRenderer.ts` [ref: src/services/DiagramRenderer.ts]
- Client-side rendering using Mermaid.js
- Dynamic import for SSR compatibility
- Error handling for invalid syntax

**PlantUML Rendering:** `app/api/plantuml/` [ref: app/api/plantuml/]
- Server-side rendering via external PlantUML service
- Encoding and URL generation
- Fallback error handling

#### 3. Authentication System
**Configuration:** `lib/auth.ts` [ref: lib/auth.ts]
- NextAuth.js with Credentials provider
- JWT token management
- Session handling and middleware

#### 4. API Layer
**Routes Location:** `app/api/` [ref: app/api/]
- RESTful endpoints for diagrams, authentication
- Type-safe request/response handling
- Error handling and status codes

#### 5. Data Management
**Schema:** `supabase-schema.sql` [ref: supabase-schema.sql]
- PostgreSQL tables for users, diagrams, sharing
- Row Level Security (RLS) policies
- Relationships and constraints

### Design Patterns

#### Server-Side Rendering (SSR)
Dynamic imports prevent hydration mismatches:
```typescript
// app/page.tsx
const DiagramEditor = dynamic(() => import('@/src/components/DiagramEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})
```
[ref: app/page.tsx:6-14]

#### Type Safety
Comprehensive TypeScript interfaces:
```typescript
// types/sharing.ts
interface SharingSettings {
  isPublic: boolean;
  shareToken?: string;
}
```
[ref: types/sharing.ts]

#### Error Boundaries
Try-catch blocks in critical rendering paths:
```typescript
// src/services/DiagramRenderer.ts
try {
  const { svg } = await mermaid.render(id, code);
  return svg;
} catch (error) {
  throw new Error(`Mermaid rendering failed: ${error.message}`);
}
```
[ref: src/services/DiagramRenderer.ts:49-58]

### Performance Considerations

1. **Code Splitting:** Dynamic imports for heavy dependencies
2. **Client-Side Caching:** Mermaid diagrams cached in memory
3. **Optimized Bundling:** Next.js automatic optimization
4. **Lazy Loading:** Editor components loaded on demand

### Security Architecture

1. **Authentication:** JWT tokens with secure httpOnly cookies
2. **Authorization:** Role-based access control via NextAuth
3. **Data Validation:** TypeScript interfaces and runtime validation
4. **CORS:** Configured for external PlantUML service access

## Related Documentation

- [Diagram Editor Component](diagram-editor-component.md) - Detailed editor implementation
- [Rendering Pipeline](rendering-pipeline.md) - Rendering process documentation
- [Authentication System](authentication-system.md) - Auth setup and configuration
- [API Endpoints](api-endpoints.md) - Complete API reference

## Backlinks

Referenced by:
- [Index](index.md)
- [Deployment Guide](deployment-guide.md)
- [Performance Optimizations](performance-optimizations.md)