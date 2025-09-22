# DD Preview Parser Wiki

Welcome to the comprehensive documentation for DD Preview Parser, a modern diagram editor application with real-time preview capabilities.

## Overview

DD Preview Parser is a full-stack Next.js application that enables users to create, edit, and share diagrams using Mermaid and PlantUML syntax. The application provides a Monaco Editor-based interface with real-time rendering and collaborative features.

**Key Features:**
- Real-time diagram preview with debounced updates
- Multi-format support (Mermaid, PlantUML)
- User authentication and personal dashboards
- Public/private diagram sharing
- Export capabilities with multiple formats
- Responsive design with Tailwind CSS

[ref: README.md, app/ directory structure]

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with JWT tokens
- **Editor**: Monaco Editor (VS Code core)
- **Diagram Rendering**: Mermaid.js, PlantUML
- **Testing**: Jest, React Testing Library

[ref: package.json, app/api structure]

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Database      │
│   (Next.js)     │◄──►│   (Serverless)  │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • React UI      │    │ • Auth API      │    │ • Users         │
│ • Monaco Editor │    │ • Diagrams API  │    │ • Diagrams      │
│ • Real-time     │    │ • PlantUML API  │    │ • RLS Policies  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Wiki Navigation

### 📋 Core Documentation
- **[Architecture Overview](./architecture/README.md)** - System design and technical architecture
- **[Frontend Architecture](./frontend/README.md)** - React components and client-side logic
- **[Backend Architecture](./backend/README.md)** - API routes and server-side functionality
- **[Authentication System](./authentication/README.md)** - User management and security

### 🧩 Component Documentation
- **[Component Library](./components/README.md)** - Reusable React components
- **[Diagram Editor](./components/diagram-editor.md)** - Core editing functionality
- **[Sharing System](./components/sharing.md)** - Public/private diagram sharing
- **[Export Features](./components/export.md)** - Diagram export capabilities

### 💾 Data & API
- **[Database Schema](./backend/database.md)** - Supabase table structures and relationships
- **[API Reference](./backend/api-reference.md)** - Complete API endpoint documentation
- **[Data Models](./backend/data-models.md)** - TypeScript type definitions

### 🛠️ Development
- **[Development Setup](./development/setup.md)** - Getting started guide
- **[Testing Strategy](./development/testing.md)** - Test structure and guidelines
- **[Deployment](./development/deployment.md)** - Deployment configuration

## 🏗️ Repository Overview

**Primary Language**: TypeScript/JavaScript with React  
**Framework**: Next.js 14 with App Router  
**Database**: Supabase (PostgreSQL)  
**Authentication**: NextAuth.js  

### Key Directories
- **`app/`** (18 files) - Next.js App Router pages and API routes [ref: /workspace/main-repo/app/]
- **`src/`** (25 files) - Core application logic and services [ref: /workspace/main-repo/src/]  
- **`components/`** (29 files) - React components and UI elements [ref: /workspace/main-repo/components/]
- **`__tests__/`** (10 files) - Test suites and testing utilities [ref: /workspace/main-repo/__tests__/]

### Core Features
- **Real-time Diagram Editor** with Monaco Editor integration [ref: /workspace/main-repo/src/components/DiagramEditor.tsx]
- **Multi-format Support**: Mermaid and PlantUML diagrams [ref: /workspace/main-repo/src/services/DiagramRenderer.ts]
- **Authentication System** with NextAuth.js and JWT tokens [ref: /workspace/main-repo/types/next-auth.d.ts]
- **Database Persistence** with Supabase and row-level security [ref: /workspace/main-repo/supabase-schema.sql]

## 🚀 Quick Navigation

### For Developers
- Start with **[[development-setup]]** for local environment configuration
- Review **[[architecture-overview]]** to understand the system design
- Explore **[[component-guide]]** for frontend development patterns

### For System Administrators  
- Check **[[deployment-guide]]** for production setup
- Review **[[database-schema]]** for data management
- See **[[api-reference]]** for service integration

### For Users
- Learn about **[[diagram-types]]** for supported syntax
- Understand **[[authentication-flow]]** for account management

## 🔗 External References

- **Main Repository**: [DD Preview Parser](https://github.com/durdan/dd-preview-parser) [ref: /workspace/main-repo/README.md:46]
- **Live Demo**: [http://localhost:3000](http://localhost:3000) [ref: /workspace/main-repo/README.md:73]
- **Supabase Dashboard**: Database management interface [ref: /workspace/main-repo/supabase-schema.sql]

---

*This wiki is automatically generated from the actual codebase structure and maintained to reflect the current state of the repository.*