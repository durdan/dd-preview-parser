export interface DiagramData {
  id: string;
  content: string;
  type: 'flowchart' | 'sequence' | 'class' | 'gantt';
  options?: Record<string, any>;
}

export interface ExportOptions {
  format: 'png' | 'pdf';
  width?: number;
  height?: number;
  quality?: number;
  scale?: number;
  background?: string;
}

export interface ExportResult {
  buffer: Buffer;
  metadata: {
    format: string;
    size: number;
    dimensions: { width: number; height: number };
    renderTime: number;
    cached: boolean;
  };
}

export interface CacheEntry {
  buffer: Buffer;
  metadata: any;
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export interface OptimizationReport {
  totalExports: number;
  cacheHitRate: number;
  averageRenderTime: number;
  recommendations: string[];
}