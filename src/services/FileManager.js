const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class FileManager {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'diagram-exports');
    this.maxFileAge = 30 * 60 * 1000; // 30 minutes
    this.cleanupInterval = null;
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      this.startCleanupScheduler();
    } catch (error) {
      throw new Error(`Failed to initialize temp directory: ${error.message}`);
    }
  }

  async getTempPath(filename) {
    if (!filename || typeof filename !== 'string') {
      throw new Error('Invalid filename provided');
    }
    return path.join(this.tempDir, filename);
  }

  async fileExists(filepath) {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteFile(filepath) {
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.warn(`Failed to delete file ${filepath}: ${error.message}`);
    }
  }

  async cleanupOldFiles() {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      
      for (const file of files) {
        const filepath = path.join(this.tempDir, file);
        const stats = await fs.stat(filepath);
        
        if (now - stats.mtime.getTime() > this.maxFileAge) {
          await this.deleteFile(filepath);
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error.message);
    }
  }

  startCleanupScheduler() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldFiles();
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  stopCleanupScheduler() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

module.exports = FileManager;