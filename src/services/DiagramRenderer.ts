export class DiagramRenderer {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Only initialize mermaid in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const mermaid = await import('mermaid');
      mermaid.default.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize mermaid:', error);
    }
  }

  static async render(content: string, elementId: string): Promise<void> {
    await this.initialize();

    if (!content.trim()) {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = '<div class="empty-diagram">Enter diagram content to see preview</div>';
      }
      return;
    }

    try {
      // Only render in browser environment
      if (typeof window === 'undefined') return;
      
      const mermaid = await import('mermaid');
      
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid content provided');
      }
      
      const { svg } = await mermaid.default.render(`diagram-${Date.now()}`, content);
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = svg;
      }
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `<div class="error" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px;">
          <strong>Rendering Error:</strong><br/>
          ${error instanceof Error ? error.message : 'Unknown error'}
        </div>`;
      }
      throw new Error(`Rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}