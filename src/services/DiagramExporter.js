const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class DiagramExporter {
  constructor(fileManager, optimizer) {
    this.fileManager = fileManager;
    this.optimizer = optimizer;
    this.browser = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
    }
  }

  async exportToPNG(diagramHtml, options = {}) {
    const { width = 1200, height = 800, quality = 90 } = options;
    
    await this.initialize();
    const page = await this.browser.newPage();
    
    try {
      await this.optimizer.optimizePage(page);
      await page.setViewport({ width, height });
      await page.setContent(diagramHtml, { waitUntil: 'networkidle0' });
      
      const filename = `diagram-${uuidv4()}.png`;
      const filepath = await this.fileManager.getTempPath(filename);
      
      await page.screenshot({
        path: filepath,
        type: 'png',
        quality,
        fullPage: true
      });
      
      return { filepath, filename };
    } finally {
      await page.close();
    }
  }

  async exportToPDF(diagramHtml, options = {}) {
    const { format = 'A4', landscape = false, margin = { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' } } = options;
    
    await this.initialize();
    const page = await this.browser.newPage();
    
    try {
      await this.optimizer.optimizePage(page);
      await page.setContent(diagramHtml, { waitUntil: 'networkidle0' });
      
      const filename = `diagram-${uuidv4()}.pdf`;
      const filepath = await this.fileManager.getTempPath(filename);
      
      await page.pdf({
        path: filepath,
        format,
        landscape,
        margin,
        printBackground: true
      });
      
      return { filepath, filename };
    } finally {
      await page.close();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = DiagramExporter;