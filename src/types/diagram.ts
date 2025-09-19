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

export interface Diagram {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  isPublic: boolean;
  ownerId: string;
  thumbnail?: string;
  participantCount?: number;
  createdAt: string;
  updatedAt: string;
}