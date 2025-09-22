# DD Preview Parser - Wiki

A comprehensive diagram editing platform built with Next.js, TypeScript, and Supabase. This wiki documents the actual architecture, components, and implementation patterns found in this repository.

## Table of Contents

### [Architecture](./architecture/)
- [System Overview](./architecture/system-overview.md) - Technology stack and high-level design
- [Data Flow](./architecture/data-flow.md) - Request lifecycle and API patterns  
- [Authentication](./architecture/authentication.md) - NextAuth.js integration and JWT handling
- [Storage Architecture](./architecture/storage-architecture.md) - Supabase schema and RLS policies

### [Frontend](./frontend/)
- [Component Architecture](./frontend/component-architecture.md) - React patterns and interfaces
- [Editor Integration](./frontend/editor-integration.md) - Monaco Editor and diagram rendering
- [Routing & Pages](./frontend/routing-pages.md) - Next.js App Router structure
- [State Management](./frontend/state-management.md) - React hooks and context usage

### [Backend](./backend/)
- [API Routes](./backend/api-routes.md) - REST endpoints and request handling
- [Service Layer](./backend/service-layer.md) - Business logic and diagram processing
- [External Integrations](./backend/external-integrations.md) - PlantUML API and Supabase client
- [Missing Implementation](./backend/missing-implementation.md) - Storage abstraction gaps

### [Components](./components/)
- [Diagram Editor](./components/diagram-editor.md) - Core editing component [ref: src/components/DiagramEditor.tsx]
- [Dashboard Components](./components/dashboard-components.md) - Grid, cards, and modals
- [Authentication UI](./components/authentication-ui.md) - Login and registration forms
- [Export Functionality](./components/export-functionality.md) - Multi-format export system

## Quick Start

### Entry Points
- **Main Application**: [app/page.tsx](../../app/page.tsx) - Landing page with DiagramEditor
- **Standalone Editor**: [app/editor/page.tsx](../../app/editor/page.tsx) - Dedicated editing interface
- **User Dashboard**: [app/dashboard/page.tsx](../../app/dashboard/page.tsx) - Diagram management
- **API Server**: [app/api/](../../app/api/) - 8 REST endpoints for auth and diagrams

### Key Directories
- [app/](../../app/) - Next.js App Router pages and API routes (37 files)
- [src/components/](../../src/components/) - React components (15 files)
- [src/services/](../../src/services/) - Business logic services (13 files)
- [src/types/](../../src/types/) - TypeScript interfaces and types

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Monaco Editor
- **Backend**: Next.js API Routes, NextAuth.js for authentication
- **Database**: Supabase PostgreSQL with Row Level Security
- **Diagram Engines**: Mermaid.js (client-side), PlantUML (server-side)
- **Styling**: Tailwind CSS, custom CSS modules

## Repository Statistics

| Category | Count | Primary Files |
|----------|-------|---------------|
| TypeScript | 64 | Components, pages, services |
| JavaScript | 50 | Legacy services, configuration |
| React Components | 31 | TSX/JSX files across app/ and src/ |
| API Routes | 8 | Authentication and diagram CRUD |
| Test Files | 8 | Jest/React Testing Library |

## Business Purpose

This application serves as a **diagram editing platform** that enables users to:

1. **Create and edit diagrams** using Mermaid and PlantUML syntax
2. **Real-time preview** with syntax highlighting via Monaco Editor
3. **Save and manage** personal diagram collections
4. **Export diagrams** to multiple formats (PNG, SVG, PDF)
5. **Share diagrams** with public/private visibility controls
6. **Template system** for common diagram patterns

### Primary User Journeys
- **Anonymous editing**: Immediate access to diagram creation without registration
- **User registration**: Account creation for diagram persistence
- **Diagram management**: Dashboard for organizing saved diagrams
- **Collaborative sharing**: Public diagram sharing and template usage

## Architecture Highlights

### Frontend Architecture
- **App Router**: Next.js 14 with server/client component separation
- **Component Composition**: Reusable UI components with TypeScript interfaces
- **Real-time Rendering**: Debounced diagram preview with error handling
- **Progressive Enhancement**: Client-side features with SSR fallbacks

### Backend Architecture  
- **API-First Design**: RESTful endpoints for all data operations
- **Authentication Layer**: JWT-based session management
- **Service Abstraction**: Business logic separated from API routes
- **External Integration**: PlantUML server and Supabase client

### Data Architecture
- **PostgreSQL Schema**: Structured data with foreign key relationships
- **Row Level Security**: User-based access control at database level
- **Type Safety**: End-to-end TypeScript interfaces for data contracts
- **Migration Pattern**: Evidence of MongoDB to Supabase transition

## Implementation Status

### ✅ Implemented Features
- Complete diagram editing interface
- Real-time Mermaid rendering
- PlantUML server integration
- User authentication and registration
- Dashboard with diagram grid
- Export functionality
- Public/private diagram sharing

### ⚠️ Missing Components
- Storage abstraction layer [ref: app/api routes import @/lib/storage]
- Complete test coverage for all services
- Error boundary components
- Offline editing capabilities
- Advanced diagram templates

### 🔄 Recent Changes
- Migration from MongoDB to Supabase [ref: recent commits]
- PlantUML API route simplification
- Project structure cleanup
- Syntax highlighting implementation

---

**Navigation**: Use the links above to explore specific aspects of the codebase. Each section contains detailed analysis with concrete file references and implementation examples.