# System Architecture

## Overview

This document provides detailed architecture diagrams for the DD Preview Parser diagram editor application.

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Client UI]
        Editor[Monaco Editor]
        Renderer[Diagram Renderers]
    end

    subgraph "Application Layer"
        NextJS[Next.js App Router]
        API[API Routes]
        Auth[NextAuth.js]
        Components[React Components]
    end

    subgraph "Service Layer"
        DiagramSvc[Diagram Service]
        ExportSvc[Export Service]
        Storage[Storage Layer*]
    end

    subgraph "Data Layer"
        Memory[(In-Memory Store*)]
        Supabase[(Supabase PostgreSQL)]
    end

    subgraph "External Services"
        PlantUML[PlantUML.com API]
    end

    UI --> NextJS
    Editor --> Renderer
    Renderer --> |Mermaid| UI
    Renderer --> |PlantUML| PlantUML

    NextJS --> API
    API --> Auth
    API --> DiagramSvc
    API --> ExportSvc

    DiagramSvc --> Storage
    Storage --> Memory
    Storage --> Supabase

    ExportSvc --> UI

    style Storage fill:#ffcccc
    style Memory fill:#ffcccc
    note1["*Missing Implementation"]
```

**Reference Files:**
- Frontend: `app/page.tsx`, `app/layout.tsx`
- API Layer: `app/api/` directory
- Services: `services/diagramService.ts`, `services/exportService.js`
- Storage: `@/lib/storage` (missing), `supabase-schema.sql`

## Component Architecture

```mermaid
graph TD
    subgraph "App Router Structure"
        Layout[layout.tsx]
        Providers[providers.tsx]
        HomePage[page.tsx]

        subgraph "Authentication"
            AuthPage[auth/page.tsx]
            AuthForm[AuthForm.tsx]
            AuthAPI[api/auth/]
        end

        subgraph "Dashboard"
            DashboardPage[dashboard/page.tsx]
            DiagramList[DiagramList Component]
        end

        subgraph "Editor"
            EditorPage[editor/[id]/page.tsx]
            MonacoEditor[Monaco Editor]
            DiagramPreview[Diagram Preview]
            ExportPanel[ExportPanel.js]
            SharePanel[SharePanel.tsx]
        end
    end

    subgraph "Shared Components"
        UIComponents[components/ui/]
        SharedView[SharedDiagramView.tsx]
    end

    subgraph "Business Logic"
        DiagramHook[useDiagrams.ts]
        DiagramService[diagramService.ts]
        ExportService[exportService.js]
    end

    Layout --> HomePage
    Layout --> AuthPage
    Layout --> DashboardPage
    Layout --> EditorPage

    AuthPage --> AuthForm
    AuthForm --> AuthAPI

    DashboardPage --> DiagramList
    DiagramList --> DiagramHook

    EditorPage --> MonacoEditor
    EditorPage --> DiagramPreview
    EditorPage --> ExportPanel
    EditorPage --> SharePanel

    DiagramHook --> DiagramService
    ExportPanel --> ExportService
    SharePanel --> SharedView

    DiagramService --> |Missing| Storage[lib/storage]

    style Storage fill:#ffcccc
```

**Reference Files:**
- Pages: `app/` directory structure
- Components: `components/` directory
- Hooks: `hooks/useDiagrams.ts`
- Services: `services/` directory

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant Auth
    participant Storage
    participant PlantUML

    Note over User,PlantUML: Authentication Flow
    User->>Client: Login/Register
    Client->>API: POST /api/auth/register
    API->>Storage: createUser()
    Storage-->>API: User Created
    API->>Auth: NextAuth Session
    Auth-->>Client: JWT Token

    Note over User,PlantUML: Diagram Creation Flow
    User->>Client: Create Diagram
    Client->>API: POST /api/diagrams
    API->>Auth: Validate Session
    Auth-->>API: User Verified
    API->>Storage: createDiagram()
    Storage-->>API: Diagram Created
    API-->>Client: Diagram Response

    Note over User,PlantUML: Diagram Rendering Flow
    User->>Client: Edit Diagram Content
    alt Mermaid Diagram
        Client->>Client: Mermaid.render()
    else PlantUML Diagram
        Client->>API: POST /api/plantuml/render
        API->>PlantUML: Encode & Request
        PlantUML-->>API: SVG/PNG Response
        API-->>Client: Rendered Diagram
    end

    Note over User,PlantUML: Export Flow
    User->>Client: Export Diagram
    Client->>Client: exportService.export()
    alt SVG Export
        Client->>Client: Direct SVG Download
    else PNG Export
        Client->>Client: Canvas Conversion
        Client->>Client: Blob Download
    end
```

**Reference Files:**
- Authentication: `lib/auth.ts`, `app/api/auth/`
- Diagram API: `app/api/diagrams/`
- PlantUML: `app/api/plantuml/`
- Export: `services/exportService.js`

## Security Architecture

```mermaid
graph TB
    subgraph "Frontend Security"
        CSP[Content Security Policy]
        ClientAuth[Client-side Auth Check]
    end

    subgraph "API Security"
        SessionMW[Session Middleware]
        AuthCheck[Authentication Check]
        OwnerCheck[Ownership Validation]
    end

    subgraph "Database Security"
        RLS[Row Level Security]
        Policies[Access Policies]
        JWTAuth[JWT Validation]
    end

    subgraph "External Security"
        CORS[CORS Configuration]
        PlantUMLSafe[PlantUML Validation]
    end

    ClientAuth --> SessionMW
    SessionMW --> AuthCheck
    AuthCheck --> OwnerCheck

    OwnerCheck --> RLS
    RLS --> Policies
    Policies --> JWTAuth

    CORS --> PlantUMLSafe

    style SessionMW fill:#e1f5fe
    style RLS fill:#e8f5e8
```

**Security Features:**
- **Authentication**: NextAuth.js with JWT tokens (30-day expiry)
- **Password Security**: bcryptjs hashing with salt rounds of 12
- **API Protection**: Session validation on all protected routes
- **Database Security**: Supabase RLS policies for user data isolation
- **Input Validation**: PlantUML content validation before external API calls

**Reference Files:**
- Auth Config: `lib/auth.ts`
- API Security: `app/api/diagrams/route.ts:8-23`
- Database Security: `supabase-schema.sql:35-59`
- Validation: `lib/validation.js`

---

## Architecture Notes

### Current Implementation Status
- ✅ **Frontend Architecture**: Complete with Next.js 14 and React 18
- ✅ **Authentication System**: NextAuth.js fully configured
- ✅ **External Integrations**: PlantUML API integration working
- ⚠️ **Storage Layer**: Missing `@/lib/storage` implementation
- ⚠️ **Database Integration**: Supabase schema ready but not connected

### Critical Dependencies
- **Monaco Editor**: Dynamic loading to prevent SSR issues
- **Mermaid**: Client-side diagram rendering
- **PlantUML External**: Dependency on plantuml.com service
- **NextAuth**: Session management and JWT handling

### Performance Considerations
- **Client-side Export**: Reduces server load for diagram exports
- **Dynamic Loading**: Monaco Editor loaded only when needed
- **External API**: PlantUML rendering adds network latency
- **Memory Storage**: Current in-memory approach doesn't persist data

---

*[← Back to Wiki Index](../index.md) | [System Overview](../system-overview.md)*