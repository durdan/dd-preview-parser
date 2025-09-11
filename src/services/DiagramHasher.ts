import crypto from 'crypto';
import { DiagramData, ExportOptions } from '../types/export';

export class DiagramHasher {
  static generateHash(diagram: DiagramData, options: ExportOptions): string {
    const content = JSON.stringify({
      content: diagram.content,
      type: diagram.type,
      options: diagram.options,
      exportOptions: options
    });
    
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}