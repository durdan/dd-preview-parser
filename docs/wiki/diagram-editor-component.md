# Diagram Editor Component

The DiagramEditor is the core component of the DD Preview Parser, providing a sophisticated code editing experience with real-time diagram preview capabilities.

## Component Overview

**Location:** `src/components/DiagramEditor.tsx` [ref: src/components/DiagramEditor.tsx]

The DiagramEditor component integrates Monaco Editor (VS Code's editor) with custom diagram rendering to create a seamless editing experience for both Mermaid and PlantUML diagrams.

### Key Features

- **Dual-pane Interface:** Side-by-side code editor and live preview
- **Automatic Syntax Detection:** Intelligently detects Mermaid vs PlantUML syntax
- **Real-time Rendering:** Updates preview as user types with debouncing
- **Monaco Editor Integration:** Full VS Code editing experience with syntax highlighting
- **Error Handling:** Graceful error display for invalid diagram syntax
- **Responsive Design:** Adapts to different screen sizes and orientations

## Architecture

### Component Structure

```typescript
interface DiagramEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({
  initialCode = '',
  onCodeChange,
  readOnly = false
}) => {
  // Component implementation
}
```
[ref: src/components/DiagramEditor.tsx:18-25]

### State Management

The component manages several pieces of state:

```typescript
const [code, setCode] = useState<string>(initialCode);
const [diagramType, setDiagramType] = useState<DiagramType>('unknown');
const [isPreviewLoading, setIsPreviewLoading] = useState(false);
const [previewError, setPreviewError] = useState<string | null>(null);
```
[ref: src/components/DiagramEditor.tsx:27-30]

### Diagram Type Detection

The component automatically detects diagram types using pattern matching:

```typescript
const detectDiagramType = useCallback((content: string): DiagramType => {
  const trimmedContent = content.trim().toLowerCase();

  // Mermaid detection patterns
  const mermaidPatterns = [
    /^graph\s+(td|tb|bt|rl|lr)/,
    /^flowchart\s+(td|tb|bt|rl|lr)/,
    /^sequencediagram/,
    /^classDiagram/,
    /^stateDiagram/,
    /^journey:/,
    /^gantt/,
    /^pie\s+title/
  ];

  // PlantUML detection patterns
  const plantumlPatterns = [
    /^@startuml/,
    /^@startmindmap/,
    /^@startsalt/,
    /^@startgantt/
  ];

  // Check patterns and return type
  if (mermaidPatterns.some(pattern => pattern.test(trimmedContent))) {
    return 'mermaid';
  }

  if (plantumlPatterns.some(pattern => pattern.test(trimmedContent))) {
    return 'plantuml';
  }

  return 'unknown';
}, []);
```
[ref: src/components/DiagramEditor.tsx:36-94]

## Monaco Editor Integration

### Configuration

The Monaco Editor is configured with optimal settings for diagram editing:

```typescript
const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  theme: 'vs-dark',
  wordWrap: 'on',
  readOnly
};
```
[ref: src/components/DiagramEditor.tsx:236-248]

### Change Handling

Code changes are debounced to prevent excessive re-rendering:

```typescript
const handleEditorChange = useCallback((value: string | undefined) => {
  const newCode = value || '';
  setCode(newCode);
  onCodeChange?.(newCode);

  // Detect diagram type
  const detectedType = detectDiagramType(newCode);
  setDiagramType(detectedType);
}, [onCodeChange, detectDiagramType]);
```
[ref: src/components/DiagramEditor.tsx:126-133]

## Preview Component Integration

### DiagramPreview Component

The editor integrates with a separate `DiagramPreview` component:

```typescript
<div className="diagram-preview-container">
  <DiagramPreview
    code={code}
    diagramType={diagramType}
    onRenderStart={() => setIsPreviewLoading(true)}
    onRenderComplete={() => {
      setIsPreviewLoading(false);
      setPreviewError(null);
    }}
    onRenderError={(error) => {
      setIsPreviewLoading(false);
      setPreviewError(error);
    }}
  />
</div>
```
[ref: src/components/DiagramEditor.tsx:200-215]

### Loading States

The component provides visual feedback during rendering:

```typescript
{isPreviewLoading && (
  <div className="loading-overlay">
    <div className="loading-spinner">Rendering diagram...</div>
  </div>
)}

{previewError && (
  <div className="error-overlay">
    <div className="error-message">
      <h3>Render Error</h3>
      <p>{previewError}</p>
    </div>
  </div>
)}
```
[ref: src/components/DiagramEditor.tsx:217-232]

## Usage Examples

### Basic Usage

```typescript
import DiagramEditor from '@/src/components/DiagramEditor';

function MyPage() {
  return (
    <DiagramEditor
      initialCode="graph TD\n  A --> B"
      onCodeChange={(code) => console.log('Code changed:', code)}
    />
  );
}
```

### Read-Only Mode

```typescript
<DiagramEditor
  initialCode={savedDiagram.content}
  readOnly={true}
/>
```

### With Save Functionality

```typescript
const [currentCode, setCurrentCode] = useState('');

<DiagramEditor
  initialCode={currentCode}
  onCodeChange={setCurrentCode}
/>

<button onClick={() => saveDiagram(currentCode)}>
  Save Diagram
</button>
```

## Styling and Layout

### CSS Classes

The component uses Tailwind CSS classes for responsive layout:

```typescript
<div className="flex h-full">
  <div className="w-1/2 border-r border-gray-300">
    {/* Monaco Editor */}
  </div>
  <div className="w-1/2 p-4 bg-gray-50">
    {/* Preview Panel */}
  </div>
</div>
```
[ref: src/components/DiagramEditor.tsx:160-170]

### Responsive Design

The component adapts to different screen sizes:
- Desktop: Side-by-side editor and preview
- Tablet: Stacked layout with tabs
- Mobile: Single-pane with toggle between edit/preview modes

## Error Handling

### Syntax Errors

Invalid diagram syntax is caught and displayed:

```typescript
try {
  await renderDiagram(code, diagramType);
} catch (error) {
  setPreviewError(`Failed to render ${diagramType} diagram: ${error.message}`);
}
```

### Network Errors

PlantUML rendering failures are handled gracefully:

```typescript
if (response.status === 504) {
  throw new Error('PlantUML server timeout - diagram may be too complex');
}
```

## Performance Optimizations

1. **Debounced Updates:** Code changes are debounced to prevent excessive API calls
2. **Memoized Callbacks:** Functions are memoized to prevent unnecessary re-renders
3. **Lazy Loading:** Monaco Editor loads asynchronously
4. **Error Boundaries:** React error boundaries prevent component crashes

## Testing

### Unit Tests

Component tests are located in `__tests__/DiagramEditor.test.tsx` [ref: __tests__/DiagramEditor.test.tsx]

Key test scenarios:
- Initial render with empty code
- Code change handling
- Diagram type detection
- Error state handling
- Read-only mode functionality

### Integration Tests

Full user flow tests in `tests/editor-integration.test.ts` [ref: tests/editor-integration.test.ts]

## Related Documentation

- [Rendering Pipeline](rendering-pipeline.md) - How diagrams are rendered
- [Architecture Overview](architecture-overview.md) - System architecture
- [Performance Optimizations](performance-optimizations.md) - Performance strategies

## Backlinks

Referenced by:
- [Index](index.md)
- [Architecture Overview](architecture-overview.md)
- [Rendering Pipeline](rendering-pipeline.md)
- [Testing Strategy](testing-strategy.md)