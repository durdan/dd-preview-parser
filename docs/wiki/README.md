# DD Preview Parser - Repository Wiki

Welcome to the comprehensive documentation for the DD Preview Parser project - a modern diagram editor and preview application built with Next.js 14.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Module Guide](#module-guide)
4. [Architecture](#architecture)
5. [Quick Start](#quick-start)

## Project Overview

DD Preview Parser is a web-based diagram editor that supports multiple diagram formats including Mermaid and PlantUML. The application provides real-time editing capabilities with live preview, user authentication, and diagram management features.

**Key Features:**
- Real-time diagram editing with Monaco Editor [ref: src/components/DiagramEditor.tsx]
- Support for Mermaid and PlantUML diagram formats [ref: src/components/DiagramPreview.tsx]
- User authentication and authorization [ref: lib/auth.ts]
- Diagram sharing and visibility controls [ref: supabase-schema.sql]
- Responsive web interface built with Tailwind CSS [ref: tailwind.config.ts]

## Technology Stack

### Frontend
- **Next.js 14** with App Router [ref: next.config.js]
- **React 18** with TypeScript [ref: package.json]
- **Tailwind CSS** for styling [ref: tailwind.config.ts]
- **Monaco Editor** for code editing [ref: src/components/DiagramEditor.tsx]

### Backend & Database
- **Next.js API Routes** for server-side logic [ref: app/api/]
- **Supabase** PostgreSQL database [ref: supabase-schema.sql]
- **NextAuth.js** for authentication [ref: lib/auth.ts]

### External Services
- **PlantUML Server** for UML diagram rendering [ref: app/api/plantuml/]
- **Mermaid.js** for flowchart and diagram rendering [ref: package.json]

## Module Guide

### Core Modules

| Module | Purpose | Key Files | Documentation |
|--------|---------|-----------|---------------|
| **[App Router](./app-module.md)** | Next.js pages and API routes | `app/` (30+ files) | Page routing, API endpoints |
| **[Source Components](./src-module.md)** | React components and services | `src/` (50+ files) | UI components, business logic |
| **[Components](./components-module.md)** | Reusable UI components | `components/` (10 files) | Shared components |
| **[Types](./types-module.md)** | TypeScript definitions | `types/` (5 files) | Type safety |
| **[Library](./lib-module.md)** | Utilities and configurations | `lib/` (5 files) | Helper functions |

### Supporting Modules

| Module | Purpose | Key Files | Notes |
|--------|---------|-----------|-------|
| **Legacy JS** | Legacy JavaScript code | `js/` (10 files) | Pre-migration code |
| **Tests** | Test suites | `__tests__/` (5 files) | Jest test files |
| **Hooks** | Custom React hooks | `hooks/` (2 files) | State management |
| **Services** | External integrations | `services/` (2 files) | API clients |

## Architecture

For detailed architectural information, see:
- **[System Architecture](./architecture/system-architecture.md)** - High-level system design
- **[Component Architecture](./architecture/component-architecture.md)** - Frontend component structure
- **[Data Architecture](./architecture/data-architecture.md)** - Database and data flow
- **[API Architecture](./architecture/api-architecture.md)** - Backend API design

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Development Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Key Entry Points
- **Home Page**: `app/page.tsx` [ref: /workspace/main-repo/app/page.tsx]
- **Editor**: `app/editor/page.tsx` [ref: /workspace/main-repo/app/editor/page.tsx]
- **Dashboard**: `app/dashboard/page.tsx` [ref: /workspace/main-repo/app/dashboard/page.tsx]
- **API Routes**: `app/api/` [ref: /workspace/main-repo/app/api/]

## Directory Structure

```
/workspace/main-repo/
├── app/                 # Next.js App Router (30+ files)
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # User dashboard
│   ├── editor/         # Diagram editor
│   └── page.tsx        # Home page
├── src/                # Core React components (50+ files)
│   ├── components/     # Main UI components
│   └── services/       # Business logic services
├── components/         # Reusable UI components (10 files)
├── lib/               # Utilities and config (5 files)
├── types/             # TypeScript definitions (5 files)
├── hooks/             # Custom React hooks (2 files)
├── __tests__/         # Test files (5 files)
└── js/                # Legacy JavaScript (10 files)
```

## Contributing

This project follows TypeScript best practices with strict type checking [ref: tsconfig.json]. All components use Tailwind CSS for styling and follow the established patterns in the existing codebase.

## Migration History

This project was recently migrated from Python to Next.js [ref: PYTHON_TO_NEXTJS_MIGRATION.md] and from MongoDB to Supabase [ref: git commit history]. The current architecture represents a modern, streamlined approach to the diagram editor functionality.

---

*Last updated: 2025-09-24*
*Total files analyzed: 137*
*Primary languages: TypeScript (78%), JavaScript (22%)*