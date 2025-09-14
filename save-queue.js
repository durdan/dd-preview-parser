export class SaveQueue {
  constructor(maxRetries = 3, retryDelay = 5000) {
    this.queue = [];
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.processing = false;
  }

  add(saveOperation) {
    this.queue.push({
      operation: saveOperation,
      retries: 0,
      id: this.generateId()
    });
    
    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      
      try {
        await item.operation();
      } catch (error) {
        if (item.retries < this.maxRetries) {
          item.retries++;
          this.queue.unshift(item); // Put back at front
          await this.delay(this.retryDelay);
        } else {
          console.error('Save operation failed after max retries:', error);
        }
      }
    }

    this.processing = false;
  }

  clear() {
    this.queue = [];
  }

  size() {
    return this.queue.length;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}