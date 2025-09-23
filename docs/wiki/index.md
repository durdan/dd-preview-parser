# DD Preview Parser - Repository Wiki

Welcome to the comprehensive documentation for the DD Preview Parser, a Next.js application for creating and editing Mermaid and PlantUML diagrams with real-time preview capabilities.

## Table of Contents

### Core Documentation
- [Architecture Overview](architecture-overview.md) - System design, tech stack, and key architectural decisions
- [Diagram Editor Component](diagram-editor-component.md) - Main editor implementation and Monaco integration
- [Rendering Pipeline](rendering-pipeline.md) - Mermaid and PlantUML rendering processes
- [Authentication System](authentication-system.md) - NextAuth setup and user management
- [API Endpoints](api-endpoints.md) - REST API documentation and usage
- [Database Schema](database-schema.md) - Supabase tables and policies

### Development & Deployment
- [Deployment Guide](deployment-guide.md) - Environment setup and configuration
- [Testing Strategy](testing-strategy.md) - Test organization and coverage
- [Performance Optimizations](performance-optimizations.md) - SSR handling and optimization techniques

### Feature Documentation
- [Diagram Types Support](diagram-types-support.md) - Mermaid vs PlantUML syntax detection and rendering

### Architecture Diagrams
- [System Architecture](architecture/system-overview.md) - High-level system diagram
- [Component Architecture](architecture/component-diagram.md) - Detailed component relationships
- [Sequence Diagrams](architecture/sequence-diagrams.md) - User flow diagrams

## Repository Overview

**Primary Technologies:** Next.js 14, TypeScript, React, Monaco Editor, Mermaid.js, NextAuth.js, Supabase

**File Structure:**
- `src/` (52 files) - Core business logic and React components [ref: src/]
- `app/` (23 files) - Next.js App Router pages and API routes [ref: app/]
- `components/` (14 files) - Standalone React components [ref: components/]
- `lib/` (3 files) - Configuration and utilities [ref: lib/]
- `tests/` (6 files) - Test suites [ref: tests/]

**Key Entry Points:**
- Main Editor: [src/components/DiagramEditor.tsx](../src/components/DiagramEditor.tsx)
- Landing Page: [app/page.tsx](../app/page.tsx)
- Authentication: [lib/auth.ts](../lib/auth.ts)
- API Routes: [app/api/](../app/api/)

## Quick Start

1. **Development**: `npm run dev` - Starts development server [ref: package.json]
2. **Build**: `npm run build` - Production build [ref: package.json]
3. **Test**: `npm test` - Run test suites [ref: package.json]

## Core Features

- **Real-time Diagram Editing** with Monaco Editor integration
- **Dual Rendering Support** for Mermaid and PlantUML diagrams
- **Authentication & Authorization** via NextAuth.js
- **Diagram Management** with save, load, and export capabilities
- **Public Sharing** with visibility controls and share tokens
- **Responsive Design** optimized for various screen sizes

---

*This wiki is generated from the actual repository structure and code. All references point to real files and implementations.*