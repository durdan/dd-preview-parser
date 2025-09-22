# System Overview

## Architecture Summary

DD Preview Parser is a **diagram editing platform** built with modern web technologies, enabling real-time creation and management of Mermaid and PlantUML diagrams. The architecture follows a **full-stack TypeScript** approach with clear separation between frontend, API, and data layers.

## Technology Stack

### Frontend Layer
- **Next.js 14** with App Router [ref: package.json, next: "14.2.5"]
- **React 18** with TypeScript for type safety [ref: package.json, react: "^18"]
- **Monaco Editor** for professional code editing [ref: @monaco-editor/react]
- **Tailwind CSS** for utility-first styling [ref: tailwind.config.js]

### Backend Layer
- **Next.js API Routes** for serverless functions [ref: app/api/]
- **NextAuth.js** for authentication and session management [ref: lib/auth.ts]
- **Supabase** as primary database and real-time backend [ref: @supabase/supabase-js]

### Diagram Engines
- **Mermaid.js** for client-side diagram rendering [ref: src/services/DiagramRenderer.ts]
- **PlantUML Server** for server-side diagram generation [ref: src/services/plantuml-server.js]

### Development Tools
- **TypeScript** for static type checking across the entire stack
- **ESLint** and **Prettier** for code quality and formatting
- **Jest** and **React Testing Library** for testing [ref: __tests__/]

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router │  React Components │  Monaco Editor    │
│  [app/page.tsx]     │  [src/components/] │  [DiagramEditor]  │
└─────────────────────┼─────────────────────────────────────────┘
                      │
┌─────────────────────┼─────────────────────────────────────────┐
│                     │         Server (API)                   │
├─────────────────────┼─────────────────────────────────────────┤
│  API Routes         │  Services Layer     │  Authentication   │
│  [app/api/]         │  [src/services/]    │  [NextAuth.js]    │
└─────────────────────┼─────────────────────────────────────────┘
                      │
┌─────────────────────┼─────────────────────────────────────────┐
│                     │      External Services                  │
├─────────────────────┼─────────────────────────────────────────┤
│  Supabase Database  │  PlantUML Server    │  File Storage     │
│  [PostgreSQL + RLS] │  [Remote API]       │  [Supabase]       │
└─────────────────────┴─────────────────────────────────────────┘
```

## Application Flow

### 1. Entry Points
- **Landing Page**: [app/page.tsx](../../../app/page.tsx) - Immediate diagram editing
- **Editor Page**: [app/editor/page.tsx](../../../app/editor/page.tsx) - Dedicated editing interface  
- **Dashboard**: [app/dashboard/page.tsx](../../../app/dashboard/page.tsx) - User diagram management
- **API Server**: [app/api/](../../../app/api/) - RESTful backend services

### 2. Component Hierarchy
```
App
├── DiagramEditor [src/components/DiagramEditor.tsx]
│   ├── Monaco Editor (code input)
│   ├── DiagramPreview (real-time rendering)
│   └── Toolbar (save, export, templates)
├── Dashboard [app/dashboard/page.tsx]
│   ├── DiagramGrid [app/dashboard/components/DiagramGrid.tsx]
│   └── DiagramFilters [app/dashboard/components/DiagramFilters.tsx]
└── Authentication [app/auth/]
    ├── Login [app/auth/login/page.tsx]
    └── Register [app/auth/register/page.tsx]
```

### 3. Data Flow
1. **User Input** → Monaco Editor → Syntax Detection [ref: src/services/DiagramParser.ts]
2. **Real-time Rendering** → Mermaid/PlantUML → Preview Component
3. **Persistence** → API Routes → Supabase Database
4. **Authentication** → NextAuth → JWT Session → Protected Routes

## Directory Structure

### Core Directories by Purpose

| Directory | Files | Purpose | Key Files |
|-----------|-------|---------|-----------|
| `app/` | 37 | Next.js App Router pages and API routes | page.tsx, layout.tsx, api/ |
| `src/components/` | 15 | Reusable React components | DiagramEditor.tsx, DiagramPreview.tsx |
| `src/services/` | 13 | Business logic and external integrations | DiagramRenderer.ts, plantuml-*.js |
| `src/types/` | 4 | TypeScript interfaces and type definitions | diagram.ts, user.ts |
| `src/hooks/` | 2 | Custom React hooks | useLocalStorage.ts |
| `__tests__/` | 8 | Test suites and mocks | DiagramEditor.test.tsx |

### File Distribution
- **TypeScript**: 64 files (primary development language)
- **JavaScript**: 50 files (legacy services and configuration)
- **React Components**: 31 TSX/JSX files
- **Configuration**: 8 JSON/JS config files
- **Documentation**: 5 Markdown files

## Key Architectural Decisions

### 1. Full-Stack TypeScript
**Decision**: Use TypeScript across frontend, backend, and shared types
**Rationale**: Type safety, better developer experience, reduced runtime errors
**Implementation**: Shared interfaces in [src/types/](../../../src/types/)

### 2. Server-Side Rendering with Client Interactivity
**Decision**: Next.js App Router with selective client components
**Rationale**: SEO benefits, fast initial load, interactive editing features
**Implementation**: 'use client' directives in interactive components

### 3. Multi-Engine Diagram Support
**Decision**: Support both Mermaid (client) and PlantUML (server)
**Rationale**: Different diagram types have different strengths
**Implementation**: 
- Mermaid: [src/services/DiagramRenderer.ts](../../../src/services/DiagramRenderer.ts)
- PlantUML: [src/services/plantuml-server.js](../../../src/services/plantuml-server.js)

### 4. Supabase for Backend-as-a-Service
**Decision**: Migrate from MongoDB to Supabase PostgreSQL
**Rationale**: Better TypeScript integration, Row Level Security, real-time features
**Implementation**: Schema in [supabase-schema.sql](../../../supabase-schema.sql)

### 5. Progressive Web App Features
**Decision**: Client-side diagram rendering with server-side persistence
**Rationale**: Offline capability, real-time preview, data backup
**Implementation**: Service workers and caching strategies

## Performance Characteristics

### Client-Side Optimizations
- **Dynamic Imports**: Monaco Editor loaded only when needed
- **Debounced Rendering**: Prevents excessive re-renders during typing
- **Lazy Loading**: Dashboard diagram thumbnails loaded on scroll
- **Code Splitting**: Automatic route-based code splitting via Next.js

### Server-Side Optimizations  
- **API Route Caching**: Static responses cached at CDN level
- **Database Indexing**: Optimized queries via Supabase indexes
- **Image Optimization**: Next.js automatic image optimization
- **Edge Functions**: Geographically distributed API responses

### Bundle Analysis
```javascript
// Dynamic imports for performance [ref: src/components/DiagramEditor.tsx]
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  loading: () => <div>Loading editor...</div>,
  ssr: false
});
```

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication via NextAuth.js
- **Row Level Security**: Database-level access control [ref: supabase-schema.sql]
- **API Route Protection**: Middleware-based route guards
- **CSRF Protection**: Built-in Next.js CSRF handling

### Data Security
- **Input Sanitization**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries via Supabase client
- **XSS Protection**: React's built-in XSS prevention
- **Content Security Policy**: HTTP headers for script execution control

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: No server-side session storage
- **CDN Distribution**: Static assets served via CDN
- **Database Scaling**: Supabase handles database scaling automatically
- **Edge Computing**: API routes can run on edge functions

### Vertical Scaling
- **Memory Management**: Efficient React component lifecycle
- **Database Connections**: Connection pooling via Supabase
- **File Storage**: Separate storage tier for diagram exports
- **Monitoring**: Performance metrics and error tracking

## Integration Points

### External Services
1. **PlantUML Server**: Remote diagram rendering [ref: src/services/plantuml-server.js:15]
2. **Supabase API**: Database and authentication [ref: lib/supabase.ts]
3. **Monaco Editor**: Code editing interface [ref: @monaco-editor/react]
4. **NextAuth Providers**: OAuth integration capability

### Internal APIs
1. **Diagram CRUD**: [/api/diagrams](../../../app/api/diagrams/)
2. **Authentication**: [/api/auth](../../../app/api/auth/)
3. **PlantUML Proxy**: [/api/plantuml](../../../app/api/plantuml/)
4. **Export Services**: [/api/export](../../../app/api/export/) (referenced but missing)

## Development Workflow

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Code quality checks
npm test             # Run test suite
```

### Deployment Pipeline
- **Build Process**: Next.js static generation and SSR
- **Environment Variables**: Configuration via .env files
- **Database Migrations**: Supabase migration system
- **CI/CD Integration**: GitHub Actions or similar platforms

---

**Related Documentation**:
- [Data Flow](./data-flow.md) - Request lifecycle and API patterns
- [Authentication](./authentication.md) - NextAuth.js implementation details
- [Storage Architecture](./storage-architecture.md) - Database schema and design

**Navigation**: [← Back to Wiki Home](../README.md) | [Next: Data Flow →](./data-flow.md)