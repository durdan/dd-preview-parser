# Diagram Editor

## Table of Contents
- [Editor Overview](#editor-overview)
- [Monaco Editor Integration](#monaco-editor-integration)
- [Diagram Type Detection](#diagram-type-detection)
- [Real-time Preview](#real-time-preview)
- [Auto-save Functionality](#auto-save-functionality)
- [Export Features](#export-features)

## Editor Overview

The DiagramEditor is the core component of DD Preview Parser, providing a full-featured code editing experience for diagram creation [ref: src/components/DiagramEditor.tsx].

### Key Features
- **Syntax Highlighting**: Language-aware highlighting for Mermaid and PlantUML
- **Auto-completion**: IntelliSense for diagram syntax
- **Real-time Preview**: Live rendering as you type
- **Auto-save**: Automatic saving with visual feedback
- **Theme Support**: Light/dark mode integration
- **Error Detection**: Syntax error highlighting and reporting

### Component Structure

```typescript
interface DiagramEditorProps {
  initialContent?: string
  diagramId?: string
  onSave?: (diagram: Diagram) => void
  onContentChange?: (content: string) => void
}
```

## Monaco Editor Integration

### Dynamic Loading [ref: src/components/DiagramEditor.tsx:13-20]

Monaco Editor is loaded dynamically to prevent SSR issues:

```typescript
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.Editor),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
  }
)
```

### Editor Configuration

**Language Registration**:
```typescript
const configureMonaco = (monaco: Monaco) => {
  // Register Mermaid language
  monaco.languages.register({ id: 'mermaid' })
  monaco.languages.setMonarchTokensProvider('mermaid', mermaidSyntax)

  // Register PlantUML language
  monaco.languages.register({ id: 'plantuml' })
  monaco.languages.setMonarchTokensProvider('plantuml', plantUMLSyntax)
}
```

**Editor Options**:
```typescript
const editorOptions = {
  minimap: { enabled: false },
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on',
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  fontSize: 14
}
```

### Theme Integration

The editor automatically adapts to system theme preferences:

```typescript
const [theme, setTheme] = useState<'light' | 'dark'>('light')

useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  setTheme(mediaQuery.matches ? 'dark' : 'light')

  const handleChange = (e: MediaQueryListEvent) => {
    setTheme(e.matches ? 'dark' : 'light')
  }

  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}, [])
```

## Diagram Type Detection

### Automatic Detection [ref: src/components/DiagramEditor.tsx:22]

The editor automatically detects diagram type based on content:

```typescript
type DiagramType = 'mermaid' | 'plantuml' | 'unknown'

const detectDiagramType = (content: string): DiagramType => {
  const trimmed = content.trim().toLowerCase()

  // Mermaid detection patterns
  const mermaidPatterns = [
    /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram)/,
    /^(gantt|pie|gitgraph|journey|quadrantChart)/,
    /^(erDiagram|mindmap|timeline|sankey)/
  ]

  // PlantUML detection patterns
  const plantumlPatterns = [
    /^@startuml/,
    /^@startmindmap/,
    /^@startsalt/,
    /^@startgantt/
  ]

  // Check for Mermaid
  if (mermaidPatterns.some(pattern => pattern.test(trimmed))) {
    return 'mermaid'
  }

  // Check for PlantUML
  if (plantumlPatterns.some(pattern => pattern.test(trimmed))) {
    return 'plantuml'
  }

  return 'unknown'
}
```

### Type-specific Features

**Mermaid Support**:
- Native browser rendering
- Immediate preview updates
- Full feature set support

**PlantUML Support**:
- Server-side rendering via API [ref: app/api/plantuml/]
- Network-dependent preview
- Comprehensive diagram types

## Real-time Preview

### Preview Component Integration [ref: src/components/DiagramPreview.tsx]

The preview updates in real-time as users type:

```typescript
const DiagramEditor: React.FC = () => {
  const [content, setContent] = useState('')
  const [diagramType, setDiagramType] = useState<DiagramType>('unknown')

  const handleContentChange = useCallback((value: string | undefined) => {
    const newContent = value || ''
    setContent(newContent)
    setDiagramType(detectDiagramType(newContent))
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4">
      <MonacoEditor
        value={content}
        onChange={handleContentChange}
        language="typescript"
        theme={theme}
        options={editorOptions}
      />
      <DiagramPreview
        content={content}
        type={diagramType}
        onRenderComplete={handlePreviewRender}
      />
    </div>
  )
}
```

### Error Handling

Preview errors are captured and displayed to users:

```typescript
const [previewError, setPreviewError] = useState<string | null>(null)

const handlePreviewRender = useCallback((error?: string) => {
  setPreviewError(error || null)
}, [])

// Error display in UI
{previewError && (
  <div className="bg-red-50 border border-red-200 rounded p-4">
    <h4 className="text-red-800 font-medium">Preview Error</h4>
    <p className="text-red-600 text-sm mt-1">{previewError}</p>
  </div>
)}
```

## Auto-save Functionality

### Debounced Saving [ref: src/components/DiagramEditor.tsx:185-190]

Auto-save prevents data loss while avoiding excessive API calls:

```typescript
const [isSaving, setIsSaving] = useState(false)
const [lastSaved, setLastSaved] = useState<Date | null>(null)

const debouncedSave = useMemo(
  () => debounce(async (content: string, title: string) => {
    try {
      setIsSaving(true)
      const saved = await diagramService.saveDiagram({
        id: diagramId,
        title,
        content,
        type: diagramType,
        is_public: shareSettings.isPublic
      })
      setDiagramId(saved.id)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Save failed:', error)
      // Show user-friendly error
    } finally {
      setIsSaving(false)
    }
  }, 2000),
  [diagramId, diagramType, shareSettings.isPublic]
)
```

### Save Status Indicator

Visual feedback shows save status to users:

```typescript
const SaveStatusIndicator: React.FC<{ isSaving: boolean, lastSaved: Date | null }> = ({
  isSaving,
  lastSaved
}) => {
  if (isSaving) {
    return (
      <div className="flex items-center text-blue-600">
        <Spinner className="w-4 h-4 mr-2" />
        Saving...
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div className="text-green-600">
        Saved {formatRelativeTime(lastSaved)}
      </div>
    )
  }

  return <div className="text-gray-500">Unsaved changes</div>
}
```

## Export Features

### Export Service Integration [ref: services/exportService.js]

The editor provides multiple export options:

```typescript
const handleExport = async (format: 'png' | 'svg' | 'pdf' | 'json') => {
  try {
    await exportService.exportDiagram(content, format, {
      title: diagramTitle,
      type: diagramType,
      quality: 'high'
    })
  } catch (error) {
    console.error('Export failed:', error)
    showNotification('Export failed', 'error')
  }
}
```

### Thumbnail Generation

Thumbnails are generated for saved diagrams:

```typescript
const generateThumbnail = useCallback(async (content: string) => {
  try {
    const previewElement = document.querySelector('.diagram-preview')
    if (!previewElement) return null

    // Use html2canvas or similar to capture preview
    const canvas = await html2canvas(previewElement as HTMLElement, {
      width: 200,
      height: 150,
      scale: 1
    })

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Thumbnail generation failed:', error)
    return null
  }
}, [])
```

### Export Options UI

```typescript
const ExportDropdown: React.FC = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => handleExport('png')}>
        Export as PNG
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleExport('svg')}>
        Export as SVG
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleExport('pdf')}>
        Export as PDF
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleExport('json')}>
        Export Data
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
```

---

## Related Pages
- [Component Architecture](component-architecture.md) - React component structure
- [API Reference](api-reference.md) - Service layer documentation
- [Sharing System](sharing-system.md) - Diagram sharing features

---

*[← Back to Wiki Index](index.md)*