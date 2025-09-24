# DD Preview Parser Wiki

Welcome to the DD Preview Parser documentation. This is a Next.js application for creating and editing diagrams with real-time preview support for Mermaid and PlantUML formats.

## Quick Start

1. **Installation**: `npm install` [ref: package.json]
2. **Development**: `npm run dev` [ref: package.json:6]
3. **Access**: Navigate to `http://localhost:3000`

## Architecture Overview

DD Preview Parser is built with:
- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Editor**: Monaco Editor with syntax highlighting
- **Rendering**: Mermaid.js and PlantUML integration
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: NextAuth.js with credential provider

## Wiki Navigation

### Core Documentation
- [**System Overview**](system-overview.md) - Architecture, tech stack, and deployment model
- [**Component Architecture**](component-architecture.md) - React component hierarchy and relationships
- [**API Reference**](api-reference.md) - REST API endpoints and data contracts

### Feature Documentation
- [**Diagram Editor**](diagram-editor.md) - Main editing interface and Monaco integration
- [**Authentication**](authentication.md) - User management and session handling
- [**Sharing System**](sharing-system.md) - Public/private diagrams and share tokens

### Technical Reference
- [**Database Schema**](database-schema.md) - Supabase tables, relationships, and policies
- [**Development Setup**](development-setup.md) - Local environment and deployment
- [**Troubleshooting**](troubleshooting.md) - Common issues and solutions

## Key Features

- **Real-time Preview**: Live diagram rendering as you type [ref: src/components/DiagramPreview.tsx]
- **Multi-format Support**: Mermaid and PlantUML diagram types [ref: src/components/DiagramEditor.tsx:22]
- **User Authentication**: Secure login and registration [ref: lib/auth.ts]
- **Diagram Management**: Save, load, and organize diagrams [ref: services/diagramService.ts]
- **Public Sharing**: Share diagrams with custom URLs [ref: types/sharing.ts]
- **Export Options**: Multiple export formats [ref: services/exportService.js]

## Repository Structure

```
/workspace/main-repo/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # REST API endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── editor/            # Main diagram editor
├── src/
│   └── components/        # Core React components
├── components/ui/         # Reusable UI components
├── services/              # Business logic and API clients
├── lib/                   # Utility libraries and configurations
├── types/                 # TypeScript type definitions
└── supabase-schema.sql    # Database schema
```

## Development Status

**Current Version**: Development phase
**Primary Language**: TypeScript (4,207 lines)
**Total Files**: 114 source files
**Test Coverage**: Basic test structure in `__tests__/` [ref: __tests__/]

---

*Last updated: 2025-09-24*