import { AutoSaveConfig } from './config.js';
import { DebounceTimer } from './debounce-timer.js';
import { NetworkDetector } from './network-detector.js';
import { OfflineStorage } from './offline-storage.js';
import { SaveQueue } from './save-queue.js';

export class AutoSaveManager {
  constructor(saveCallback, config = AutoSaveConfig) {
    if (typeof saveCallback !== 'function') {
      throw new Error('Save callback must be a function');
    }

    this.saveCallback = saveCallback;
    this.config = { ...config };
    this.isActive = false;
    this.lastSaveTime = null;

    // Initialize components
    this.debounceTimer = new DebounceTimer(
      this.config.debounceDelay,
      () => this.performSave()
    );
    
    this.networkDetector = new NetworkDetector();
    this.offlineStorage = new OfflineStorage(this.config.offlineStorageKey);
    this.saveQueue = new SaveQueue(this.config.maxRetries, this.config.retryDelay);

    // Set up network status handling
    this.networkDetector.onStatusChange((status) => {
      if (status === 'online') {
        this.syncOfflineData();
      }
    });

    this.intervalId = null;
  }

  start() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.intervalId = setInterval(() => {
      this.triggerSave();
    }, this.config.saveInterval);

    // Sync any offline data on start
    if (this.networkDetector.isOnline) {
      this.syncOfflineData();
    }
  }

  stop() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.debounceTimer.cancel();
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  triggerSave() {
    if (!this.isActive) {
      return;
    }

    this.debounceTimer.trigger();
  }

  async performSave() {
    try {
      if (this.networkDetector.isOnline) {
        await this.saveOnline();
      } else {
        await this.saveOffline();
      }
      this.lastSaveTime = Date.now();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  async saveOnline() {
    const saveOperation = async () => {
      await this.saveCallback();
    };

    this.saveQueue.add(saveOperation);
  }

  async saveOffline() {
    // Get current data from callback (assuming it can return current state)
    let currentData;
    try {
      currentData = await this.saveCallback(true); // Pass flag to indicate we want data back
    } catch (error) {
      throw new Error(`Failed to get current data: ${error.message}`);
    }

    this.offlineStorage.save(currentData);
  }

  async syncOfflineData() {
    const offlineData = this.offlineStorage.load();
    if (!offlineData) {
      return;
    }

    try {
      // Sync offline data
      await this.saveCallback(false, offlineData.data);
      this.offlineStorage.clear();
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  getStatus() {
    return {
      isActive: this.isActive,
      isOnline: this.networkDetector.isOnline,
      lastSaveTime: this.lastSaveTime,
      pendingSaves: this.saveQueue.size(),
      hasPendingDebounce: this.debounceTimer.isPending(),
      hasOfflineData: !!this.offlineStorage.load()
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Update debounce timer if delay changed
    if (newConfig.debounceDelay) {
      this.debounceTimer.delay = newConfig.debounceDelay;
    }

    // Restart interval if interval changed
    if (newConfig.saveInterval && this.isActive) {
      this.stop();
      this.start();
    }
  }
}