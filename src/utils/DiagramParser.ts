import { ParsedDiagram, DiagramNode, DiagramConnection } from '../types/diagram';
import { PerformanceOptimizer } from './PerformanceOptimizer';

export class DiagramParser {
  private static memoizedParse = PerformanceOptimizer.memoize(
    (content: string): ParsedDiagram => {
      if (!content || typeof content !== 'string') {
        return { nodes: [], connections: [], errors: ['No content provided'] };
      }
      const lines = content.split('\n').filter(line => line && line.trim());
      const nodes: DiagramNode[] = [];
      const connections: DiagramConnection[] = [];
      const errors: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//')) continue;

        try {
          if (trimmed.includes('->')) {
            // Connection: nodeA -> nodeB [label]
            const match = trimmed.match(/(\w+)\s*->\s*(\w+)(?:\s*\[(.+)\])?/);
            if (match) {
              connections.push({
                from: match[1],
                to: match[2],
                label: match[3]?.trim()
              });
            } else {
              errors.push(`Invalid connection syntax: ${trimmed}`);
            }
          } else {
            // Node: id: label (type)
            const match = trimmed.match(/(\w+):\s*(.+?)\s*\((\w+)\)/);
            if (match) {
              const type = match[3] as DiagramNode['type'];
              if (!['start', 'process', 'decision', 'end'].includes(type)) {
                errors.push(`Invalid node type: ${type}`);
                continue;
              }
              nodes.push({
                id: match[1],
                label: match[2],
                type
              });
            } else {
              errors.push(`Invalid node syntax: ${trimmed}`);
            }
          }
        } catch (error) {
          errors.push(`Parse error: ${trimmed}`);
        }
      }

      return { nodes, connections, errors };
    }
  );

  static parse(content: string): ParsedDiagram {
    return this.memoizedParse(content);
  }
}