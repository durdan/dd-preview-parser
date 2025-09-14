export class OfflineStorage {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  save(data) {
    try {
      const saveData = {
        data,
        timestamp: Date.now(),
        id: this.generateId()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(saveData));
      return saveData.id;
    } catch (error) {
      throw new Error(`Failed to save offline: ${error.message}`);
    }
  }

  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load offline data:', error);
      return null;
    }
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}