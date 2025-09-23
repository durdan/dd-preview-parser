# Rendering Pipeline

The DD Preview Parser supports two primary diagram rendering engines: Mermaid.js for client-side rendering and PlantUML for server-side rendering. This document details the complete rendering pipeline for both diagram types.

## Overview

The rendering pipeline automatically detects diagram types and routes them to the appropriate rendering engine. The system is designed for performance, reliability, and graceful error handling.

### Supported Diagram Types

**Mermaid Diagrams:**
- Flowcharts (`graph`, `flowchart`)
- Sequence diagrams (`sequenceDiagram`)
- Class diagrams (`classDiagram`)
- State diagrams (`stateDiagram`)
- User journey (`journey`)
- Gantt charts (`gantt`)
- Pie charts (`pie`)

**PlantUML Diagrams:**
- UML diagrams (`@startuml`)
- Mind maps (`@startmindmap`)
- Salt wireframes (`@startsalt`)
- Gantt charts (`@startgantt`)

## Mermaid Rendering Pipeline

### Client-Side Architecture

**Primary Service:** `src/services/DiagramRenderer.ts` [ref: src/services/DiagramRenderer.ts]

The Mermaid rendering process occurs entirely on the client side for optimal performance and reduced server load.

### Rendering Process

#### 1. Dynamic Import and Initialization

```typescript
let mermaid: any = null;

const initializeMermaid = async () => {
  if (!mermaid) {
    const mermaidModule = await import('mermaid');
    mermaid = mermaidModule.default;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'sandbox',
      fontFamily: 'Arial, sans-serif'
    });
  }
  return mermaid;
};
```
[ref: src/services/DiagramRenderer.ts:8-25]

#### 2. SVG Generation

```typescript
export const renderMermaidDiagram = async (code: string): Promise<string> => {
  try {
    const mermaidInstance = await initializeMermaid();
    const graphId = `mermaid-${Date.now()}`;

    // Validate syntax before rendering
    const isValid = await mermaidInstance.parse(code);
    if (!isValid) {
      throw new Error('Invalid Mermaid syntax');
    }

    // Render to SVG
    const { svg } = await mermaidInstance.render(graphId, code);
    return svg;

  } catch (error) {
    console.error('Mermaid rendering error:', error);
    throw new Error(`Mermaid rendering failed: ${error.message}`);
  }
};
```
[ref: src/services/DiagramRenderer.ts:27-48]

#### 3. Error Handling

The system provides comprehensive error handling for common Mermaid issues:

```typescript
// Syntax validation
if (error.message.includes('Parse error')) {
  throw new Error('Diagram syntax error - check your Mermaid code');
}

// Security violations
if (error.message.includes('Sanitization')) {
  throw new Error('Diagram contains unsafe content');
}

// Generic failures
throw new Error(`Rendering failed: ${error.message}`);
```
[ref: src/services/DiagramRenderer.ts:49-58]

### Performance Optimizations

1. **Lazy Loading:** Mermaid is loaded only when needed
2. **Instance Caching:** Mermaid instance is reused across renders
3. **Syntax Pre-validation:** Invalid syntax is caught before rendering
4. **Memory Management:** Old diagrams are cleaned up automatically

## PlantUML Rendering Pipeline

### Server-Side Architecture

**API Endpoints:** `app/api/plantuml/` [ref: app/api/plantuml/]

PlantUML diagrams are rendered server-side using the official PlantUML web service for maximum compatibility and feature support.

### Rendering Process

#### 1. Text Encoding

PlantUML requires special encoding for web transmission:

```typescript
const encodePlantUML = (text: string): string => {
  // Remove @startuml/@enduml wrappers if present
  const cleanText = text
    .replace(/^@startuml\s*\n?/i, '')
    .replace(/\n?\s*@enduml\s*$/i, '');

  // Add proper wrapper
  const wrappedText = `@startuml\n${cleanText}\n@enduml`;

  // Encode for URL transmission
  return Buffer.from(wrappedText)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};
```
[ref: app/api/plantuml/encode/route.ts:8-23]

#### 2. Remote Rendering

```typescript
export async function POST(request: Request): Promise<Response> {
  try {
    const { code } = await request.json();

    if (!code?.trim()) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Encode the PlantUML code
    const encoded = encodePlantUML(code);

    // Generate PlantUML server URL
    const plantUMLUrl = `http://www.plantuml.com/plantuml/svg/${encoded}`;

    // Fetch rendered SVG
    const response = await fetch(plantUMLUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'DD-Preview-Parser/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`PlantUML server error: ${response.statusText}`);
    }

    const svgContent = await response.text();

    return NextResponse.json({
      svg: svgContent,
      url: plantUMLUrl
    });

  } catch (error) {
    console.error('PlantUML rendering error:', error);
    return NextResponse.json(
      { error: `PlantUML rendering failed: ${error.message}` },
      { status: 500 }
    );
  }
}
```
[ref: app/api/plantuml/render/route.ts:8-45]

#### 3. Error Recovery

The system handles various PlantUML server errors:

```typescript
// Timeout handling
if (error.name === 'AbortError') {
  throw new Error('PlantUML server timeout - try a simpler diagram');
}

// Server unavailable
if (response.status >= 500) {
  throw new Error('PlantUML server temporarily unavailable');
}

// Invalid diagram
if (response.status === 400) {
  throw new Error('Invalid PlantUML syntax - check your diagram code');
}
```
[ref: app/api/plantuml/render/route.ts:47-58]

## Unified Rendering Interface

### DiagramRenderer Service

The `DiagramRenderer` service provides a unified interface for both rendering engines:

```typescript
export const renderDiagram = async (
  code: string,
  type: 'mermaid' | 'plantuml'
): Promise<string> => {
  switch (type) {
    case 'mermaid':
      return await renderMermaidDiagram(code);

    case 'plantuml':
      return await renderPlantUMLDiagram(code);

    default:
      throw new Error(`Unsupported diagram type: ${type}`);
  }
};
```
[ref: src/services/DiagramRenderer.ts:60-75]

### Component Integration

The DiagramPreview component handles rendering orchestration:

```typescript
const DiagramPreview: React.FC<DiagramPreviewProps> = ({
  code,
  diagramType,
  onRenderStart,
  onRenderComplete,
  onRenderError
}) => {
  const renderDiagram = useCallback(async () => {
    if (!code.trim() || diagramType === 'unknown') return;

    try {
      onRenderStart?.();

      const svg = await DiagramRenderer.renderDiagram(code, diagramType);
      setSvgContent(svg);

      onRenderComplete?.();
    } catch (error) {
      console.error('Diagram rendering failed:', error);
      onRenderError?.(error.message);
    }
  }, [code, diagramType, onRenderStart, onRenderComplete, onRenderError]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);
};
```
[ref: src/components/DiagramPreview.tsx:25-50]

## Performance Metrics

### Mermaid Performance
- **Cold Start:** ~200-500ms (initial Mermaid load)
- **Warm Render:** ~10-50ms (subsequent renders)
- **Memory Usage:** ~2-5MB per diagram instance

### PlantUML Performance
- **Network Latency:** ~200-1000ms (depending on server load)
- **Encoding Overhead:** ~1-5ms
- **Timeout:** 10 seconds maximum

## Caching Strategy

### Client-Side Caching
```typescript
const renderCache = new Map<string, string>();

const getCachedRender = (code: string, type: string): string | null => {
  const cacheKey = `${type}:${btoa(code)}`;
  return renderCache.get(cacheKey) || null;
};

const setCachedRender = (code: string, type: string, svg: string): void => {
  const cacheKey = `${type}:${btoa(code)}`;
  renderCache.set(cacheKey, svg);

  // Limit cache size
  if (renderCache.size > 50) {
    const firstKey = renderCache.keys().next().value;
    renderCache.delete(firstKey);
  }
};
```

### Server-Side Considerations
- PlantUML server provides its own caching
- API responses include appropriate cache headers
- CDN caching for static SVG content

## Error Types and Handling

### Common Mermaid Errors
1. **Syntax Errors:** Invalid Mermaid syntax
2. **Security Violations:** Unsafe content blocked
3. **Memory Errors:** Diagram too complex for browser
4. **Timeout Errors:** Rendering takes too long

### Common PlantUML Errors
1. **Network Errors:** Server unreachable
2. **Timeout Errors:** Server response too slow
3. **Syntax Errors:** Invalid PlantUML code
4. **Rate Limiting:** Too many requests

### Error Display

Errors are displayed in a user-friendly format:

```typescript
const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <div className="error-container">
    <div className="error-icon">⚠️</div>
    <div className="error-content">
      <h3>Rendering Error</h3>
      <p>{error}</p>
      <div className="error-actions">
        <button onClick={retryRender}>Retry</button>
        <button onClick={showHelp}>Help</button>
      </div>
    </div>
  </div>
);
```

## Related Documentation

- [Diagram Editor Component](diagram-editor-component.md) - Editor integration
- [Diagram Types Support](diagram-types-support.md) - Supported syntax
- [Performance Optimizations](performance-optimizations.md) - Optimization strategies
- [API Endpoints](api-endpoints.md) - PlantUML API details

## Backlinks

Referenced by:
- [Index](index.md)
- [Architecture Overview](architecture-overview.md)
- [Diagram Editor Component](diagram-editor-component.md)
- [Performance Optimizations](performance-optimizations.md)