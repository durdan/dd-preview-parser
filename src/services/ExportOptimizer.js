class ExportOptimizer {
  constructor() {
    this.memoryThreshold = 100 * 1024 * 1024; // 100MB
  }

  async optimizePage(page) {
    // Disable images and fonts loading for faster rendering
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      
      if (['image', 'font'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Set memory limits
    await page.evaluateOnNewDocument(() => {
      // Limit canvas size to prevent memory issues
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, attributes) {
        if (this.width > 4096 || this.height > 4096) {
          console.warn('Canvas size limited for memory optimization');
          this.width = Math.min(this.width, 4096);
          this.height = Math.min(this.height, 4096);
        }
        return originalGetContext.call(this, type, attributes);
      };
    });
  }

  checkMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      isOverThreshold: usage.heapUsed > this.memoryThreshold
    };
  }

  async forceGarbageCollection() {
    if (global.gc) {
      global.gc();
    }
  }
}

module.exports = ExportOptimizer;