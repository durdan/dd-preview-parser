import { DiagramData, ExportOptions, ExportResult } from '../types/export';
import { PuppeteerRenderer } from './PuppeteerRenderer';
import { ExportCache } from './ExportCache';
import { ExportOptimizer } from './ExportOptimizer';
import { DiagramHasher } from './DiagramHasher';

export class DiagramExporter {
  private renderer: PuppeteerRenderer;
  private cache: ExportCache;
  private optimizer: ExportOptimizer;

  constructor() {
    this.renderer = new PuppeteerRenderer();
    this.cache = new ExportCache();
    this.optimizer = new ExportOptimizer();
  }

  async initialize(): Promise<void> {
    await this.renderer.initialize();
  }

  async exportDiagram(diagram: DiagramData, options: ExportOptions): Promise<ExportResult> {
    this.validateInputs(diagram, options);
    
    const startTime = Date.now();
    const cacheKey = DiagramHasher.generateHash(diagram, options);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const renderTime = Date.now() - startTime;
      this.optimizer.recordExport(renderTime, true);
      
      return {
        buffer: cached.buffer,
        metadata: {
          ...cached.metadata,
          renderTime,
          cached: true
        }
      };
    }

    // Render new diagram
    const buffer = await this.renderer.renderDiagram(diagram, options);
    const renderTime = Date.now() - startTime;
    
    const metadata = {
      format: options.format,
      size: buffer.length,
      dimensions: { width: options.width || 1200, height: options.height || 800 },
      renderTime,
      cached: false
    };

    // Cache the result
    this.cache.set(cacheKey, buffer, metadata);
    this.optimizer.recordExport(renderTime, false);

    return { buffer, metadata };
  }

  private validateInputs(diagram: DiagramData, options: ExportOptions): void {
    if (!diagram.content?.trim()) {
      throw new Error('Diagram content is required');
    }

    if (!['png', 'pdf'].includes(options.format)) {
      throw new Error('Format must be png or pdf');
    }

    if (options.width && (options.width < 100 || options.width > 4000)) {
      throw new Error('Width must be between 100 and 4000 pixels');
    }

    if (options.height && (options.height < 100 || options.height > 4000)) {
      throw new Error('Height must be between 100 and 4000 pixels');
    }
  }

  getOptimizationReport() {
    return this.optimizer.generateReport();
  }

  getCacheStats() {
    return this.cache.getStats();
  }

  async close(): Promise<void> {
    await this.renderer.close();
  }
}