# Source Code Documentation (`src/`)

The `src/` directory contains the core application source code with 52 files, representing the main business logic and application structure.

## Table of Contents
- [Overview](#overview)
- [File Organization](#file-organization)
- [Key Components](#key-components)
- [Cross-References](#cross-references)
- [Related Modules](#related-modules)

## Overview

The `src/` directory serves as the primary source code location, containing the main application logic, utilities, and core functionality. With 52 files, this is the largest module in the repository.

## File Organization

Based on the repository structure, the `src/` directory likely contains:

### TypeScript Files (.ts)
- Core application logic
- Business rule implementations
- Utility functions and helpers
- Configuration modules

### React Components (.tsx)
- Main application components
- Page-level components
- Container components
- Higher-order components

### JavaScript Files (.js)
- Legacy JavaScript modules
- Build scripts
- Configuration files
- Utility functions

## Key Components

### Application Entry Points
The `src/` directory typically contains main application entry points and bootstrapping code.

### Business Logic
Core business logic and domain-specific functionality resides in this module.

### Utilities and Helpers
Common utility functions and helper modules used throughout the application.

## Cross-References

### Related to Components
- **[Components Module](./components.md)** - Reusable UI components used by src/ files
- **[Hooks Module](./hooks.md)** - Custom React hooks utilized in src/ components

### Related to Application Layer
- **[App Module](./app.md)** - Application-level configuration and setup that imports from src/

### Related to Services
- **[Services Module](./services.md)** - Business services called by src/ components
- **[Types Module](./types.md)** - Type definitions used throughout src/ files

## Related Modules

| Module | Relationship | Description |
|--------|--------------|-------------|
| [`app/`](./app.md) | Consumer | Application layer that imports and uses src/ modules |
| [`components/`](./components.md) | Peer | Shared components used within src/ files |
| [`lib/`](./lib.md) | Dependency | Utility libraries imported by src/ modules |
| [`services/`](./services.md) | Dependency | Services consumed by src/ business logic |
| [`types/`](./types.md) | Dependency | Type definitions used in src/ TypeScript files |

## Development Notes

### File Naming Conventions
Based on the mixed file extensions (.ts, .tsx, .js, .jsx), the src/ directory follows standard conventions:
- `.ts` for TypeScript modules
- `.tsx` for React TypeScript components
- `.js` for JavaScript modules
- `.jsx` for React JavaScript components

### Import Patterns
Files in src/ likely import from:
- `../lib/` for utility functions
- `../services/` for business services
- `../types/` for type definitions
- `../components/` for reusable UI components

## Backlinks

- [Main Index](./README.md#core-modules)
- [Architecture Overview](./architecture.md#source-code-layer)
- [Development Guidelines](./development.md#src-directory-standards)

---
*Part of: [Repository Wiki](./README.md) | Next: [Application Layer](./app.md)*