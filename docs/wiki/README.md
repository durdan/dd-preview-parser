# Repository Wiki

This is the comprehensive documentation for the diagram editor application - a Next.js full-stack web application for creating, editing, and sharing Mermaid and PlantUML diagrams.

## 📋 Table of Contents

### Core Documentation
- [Architecture Overview](architecture/overview.md) - System design and technology stack
- [Diagram Processing](diagram-processing.md) - Type detection and rendering pipeline
- [API Reference](api-reference.md) - RESTful endpoints and schemas
- [Authentication System](authentication-system.md) - NextAuth configuration and session management
- [Data Models](data-models.md) - Database schema and entity definitions

### Module Documentation
- [Frontend Components](frontend-components.md) - React component hierarchy and interfaces
- [Business Services](business-services.md) - Core business logic and service layer
- [API Routes](api-routes.md) - Server-side route handlers and middleware

### Operations
- [Deployment Guide](deployment-guide.md) - Environment setup and production deployment

## 🏗️ Application Overview

**Primary Purpose**: Web-based diagram editor supporting Mermaid and PlantUML formats with real-time preview and user authentication.

**Technology Stack**:
- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS [ref: package.json]
- **Backend**: Next.js API routes with NextAuth.js authentication [ref: app/api/]
- **Database**: Supabase PostgreSQL with Row Level Security [ref: supabase-schema.sql]
- **Editor**: Monaco Editor with syntax highlighting [ref: src/components/DiagramEditor.tsx]
- **Rendering**: Mermaid.js client-side, PlantUML external service [ref: src/components/DiagramPreview.tsx]

**Key Features**:
- Real-time diagram editing with live preview
- Auto-detection of diagram types (Mermaid vs PlantUML)
- User authentication and diagram persistence
- Public/private diagram sharing
- Export capabilities to multiple formats

## 🚀 Quick Start

**Entry Points**:
- Main Application: [app/page.tsx](../../app/page.tsx) - Landing page with embedded editor
- Dedicated Editor: [app/editor/page.tsx](../../app/editor/page.tsx) - Full-screen editing interface
- API Base: [app/api/](../../app/api/) - RESTful API endpoints

**Development**:
```bash
npm run dev    # Start development server
npm run build  # Production build
npm run lint   # Code linting
```

## 📁 Repository Structure

```
/workspace/main-repo/
├── app/                    # Next.js App Router (23 files)
│   ├── page.tsx           # Landing page with embedded editor
│   ├── editor/            # Dedicated editor pages
│   └── api/               # API route handlers
├── src/                   # Core business logic (52 files)
│   ├── components/        # Shared React components
│   ├── services/          # Business service layer
│   └── lib/               # Utility libraries
├── components/            # UI component library (14 files)
├── lib/                   # Configuration and utilities (3 files)
│   ├── auth.ts           # NextAuth configuration
│   └── validation.js     # Input validation
├── supabase-schema.sql    # Database schema definition
└── next.config.js         # Next.js build configuration
```

## 🔗 Module Interconnections

The application follows a layered architecture:

1. **Presentation Layer** (`/app/`, `/components/`) → User interface and routing
2. **Business Logic** (`/src/services/`) → Core application logic
3. **API Layer** (`/app/api/`) → Server-side request handling
4. **Data Layer** (Supabase) → Persistent storage with authentication

**Key Data Flows**:
- User Input → DiagramEditor → DiagramService → API Routes → Database
- Diagram Content → DiagramPreview → Renderer (Mermaid/PlantUML) → Visual Output
- Authentication → NextAuth → Session Management → Protected Resources

## 📊 Key Metrics

- **Total Files**: 141 files across 10+ directories
- **Primary Languages**: TypeScript (33), JavaScript (41), JSX/TSX (40)
- **Main Components**: 14 React components, 6 API routes, 2 service modules
- **External Dependencies**: Next.js, React, Mermaid.js, Monaco Editor, NextAuth, Supabase

## 🔍 Navigation Tips

- Use the **Table of Contents** above to jump to specific documentation sections
- Each page includes `[ref: path]` citations pointing to actual source files
- Cross-references between pages use relative links within the wiki
- All file paths are relative to the repository root: `/workspace/main-repo/`

---

*This wiki is generated based on the actual repository structure and code analysis. All references point to existing files and implementations.*