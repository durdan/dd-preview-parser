import mermaid from 'mermaid';

export class DiagramRenderer {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });

    this.initialized = true;
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
      const { svg } = await mermaid.render(`diagram-${Date.now()}`, content);
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = svg;
      }
    } catch (error) {
      throw new Error(`Rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}