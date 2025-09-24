# DD Preview Parser Wiki

Welcome to the DD Preview Parser documentation. This is a diagram creation and editing platform built with Next.js that enables real-time diagram editing with Mermaid.js and PlantUML support.

## Overview

DD Preview Parser is a modern web-based diagram editor built with Next.js 14 and React 18, providing real-time preview capabilities for Mermaid and PlantUML diagrams. The application features user authentication, diagram persistence, and collaborative sharing functionality.

**Key Capabilities:**
- Real-time diagram editing with Monaco Editor [ref: src/components/DiagramEditor.tsx]
- Live preview rendering with Mermaid.js and PlantUML [ref: src/services/DiagramRenderer.ts]
- User authentication and session management [ref: lib/auth.ts]
- Diagram persistence and sharing [ref: app/api/diagrams/route.ts]
- Export functionality with multiple formats [ref: components/ExportPanel.js]

### Repository Statistics
Based on repository analysis:
- **Total Files**: 114 TypeScript/JavaScript files
- **React Components**: 31 TSX files + 14 component files
- **API Routes**: Multiple endpoints in app/api/
- **Architecture**: Next.js 14 App Router with TypeScript
- **Database**: Supabase PostgreSQL with Row Level Security

## Architecture Overview

### System Components
- **Frontend**: Next.js 13+ App Router with React components [ref: app/]
- **API Layer**: Next.js API routes for diagrams, auth, and PlantUML [ref: app/api/]
- **Services**: Business logic layer for diagram operations [ref: src/services/, services/]
- **Data Layer**: Supabase PostgreSQL with Row Level Security [ref: supabase-schema.sql]
- **External Services**: PlantUML Java microservice [ref: src/main/java/]

### User Journeys
1. **Guest User**: Landing page → Editor → Real-time preview → Export
2. **Authenticated User**: Login → Dashboard → Create/Edit diagrams → Save/Share
3. **PlantUML User**: Editor → PlantUML syntax → Server rendering → Preview

## Documentation Structure

### Architecture Documentation
- [System Overview](architecture/system-overview.md) - High-level system architecture and components
- [Data Models](architecture/data-models.md) - Database schema and TypeScript type definitions
- [API Design](architecture/api-design.md) - API routes, contracts, and request/response patterns

### Feature Modules
- [Diagram Editor](features/diagram-editor.md) - Core editor components and rendering pipeline
- [Authentication System](features/authentication.md) - NextAuth integration and user management
- [Diagram Management](features/diagram-management.md) - CRUD operations and persistence layer
- [Export System](features/export-system.md) - Diagram export functionality and supported formats
- [PlantUML Integration](features/plantuml-integration.md) - Java microservice and PlantUML rendering

### Technical Implementation
- [Getting Started](development/getting-started.md) - Development setup and workflow
- [Testing Strategy](development/testing-strategy.md) - Test structure and coverage approach
- [Deployment Guide](development/deployment.md) - Build processes and deployment configuration
- [API Endpoints](api/endpoints.md) - Complete API documentation with examples
- [Component Library](frontend/component-library.md) - UI components and design system

## Key Technologies

### Frontend Stack
- **Next.js 13+**: App Router, API routes, server components [ref: package.json:22]
- **React 18**: Component library with hooks [ref: package.json:30]
- **TypeScript**: Type-safe development [ref: tsconfig.json]
- **Tailwind CSS**: Utility-first styling [ref: package.json:33]
- **Monaco Editor**: Code editor integration [ref: package.json:25]
- **Mermaid.js**: Diagram rendering library [ref: package.json:24]

### Backend & Services
- **Supabase**: PostgreSQL database and authentication [ref: supabase-schema.sql]
- **NextAuth.js**: Authentication framework [ref: package.json:27, lib/auth.ts]
- **PlantUML Server**: Java microservice for PlantUML diagrams [ref: src/main/java/]

### Development Tools
- **ESLint**: Code linting [ref: .eslintrc.json]
- **Jest**: Unit testing framework [ref: package.json:45]
- **Husky**: Git hooks [ref: package.json:47]

## Directory Structure

```
main-repo/
├── app/                    # Next.js App Router (22 files)
│   ├── api/               # API route handlers (8 routes)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── editor/            # Diagram editor page
├── src/                   # Core application logic (49 files)
│   ├── components/        # React components
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript type definitions
│   ├── parsers/           # Diagram parsing logic
│   └── main/java/         # PlantUML Java microservice
├── components/            # Shared UI components (9 files)
├── lib/                   # Core utilities (3 files)
├── services/              # High-level services (2 files)
└── tests/                 # Test files (6 files)
```

## Quick Start

1. **Development Setup**: See [Getting Started Guide](development/getting-started.md)
2. **Architecture Overview**: Review [System Overview](architecture/system-overview.md)
3. **API Documentation**: Check [API Endpoints](api/endpoints.md)
4. **Component Usage**: Browse [Component Library](frontend/component-library.md)

## Contributing

This wiki is automatically generated from the repository structure and code analysis. All documentation is grounded in actual implementation files with specific references [ref: path] throughout.

For development contributions, see the [Getting Started Guide](development/getting-started.md) for setup instructions and coding standards.