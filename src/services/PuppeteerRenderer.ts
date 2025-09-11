import puppeteer, { Browser, Page } from 'puppeteer';
import { DiagramData, ExportOptions } from '../types/export';

export class PuppeteerRenderer {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async renderDiagram(diagram: DiagramData, options: ExportOptions): Promise<Buffer> {
    if (!this.browser) {
      throw new Error('Renderer not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      await this.setupPage(page, options);
      await this.loadDiagram(page, diagram);
      return await this.captureOutput(page, options);
    } finally {
      await page.close();
    }
  }

  private async setupPage(page: Page, options: ExportOptions): Promise<void> {
    const width = options.width || 1200;
    const height = options.height || 800;
    
    await page.setViewport({ width, height });
    
    if (options.background) {
      await page.evaluateOnNewDocument((bg) => {
        document.body.style.backgroundColor = bg;
      }, options.background);
    }
  }

  private async loadDiagram(page: Page, diagram: DiagramData): Promise<void> {
    const html = this.generateHTML(diagram);
    await page.setContent(html);
    
    // Wait for diagram to render
    await page.waitForSelector('.diagram-container', { timeout: 10000 });
    await page.waitForFunction(() => {
      const container = document.querySelector('.diagram-container');
      return container && container.children.length > 0;
    });
  }

  private generateHTML(diagram: DiagramData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .diagram-container { display: flex; justify-content: center; align-items: center; }
        </style>
      </head>
      <body>
        <div class="diagram-container">
          <div class="mermaid">${diagram.content}</div>
        </div>
        <script>
          mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            ...${JSON.stringify(diagram.options || {})}
          });
        </script>
      </body>
      </html>
    `;
  }

  private async captureOutput(page: Page, options: ExportOptions): Promise<Buffer> {
    const element = await page.$('.diagram-container');
    if (!element) {
      throw new Error('Diagram not found');
    }

    if (options.format === 'png') {
      return await element.screenshot({
        type: 'png',
        quality: options.quality || 90,
        omitBackground: !options.background
      });
    } else if (options.format === 'pdf') {
      return await page.pdf({
        format: 'A4',
        printBackground: true,
        scale: options.scale || 1
      });
    }

    throw new Error(`Unsupported format: ${options.format}`);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}