export interface DiagramNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
}

export interface ParsedDiagram {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  errors: string[];
}

export interface EditorState {
  content: string;
  parsedDiagram: ParsedDiagram;
  isValid: boolean;
}