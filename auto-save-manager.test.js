import { AutoSaveManager } from '../auto-save-manager.js';
import { AutoSaveConfig } from '../config.js';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
global.localStorage = localStorageMock;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

describe('AutoSaveManager', () => {
  let saveCallback;
  let autoSaveManager;

  beforeEach(() => {
    saveCallback = jest.fn().mockResolvedValue();
    autoSaveManager = new AutoSaveManager(saveCallback, {
      ...AutoSaveConfig,
      saveInterval: 100,
      debounceDelay: 50
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    autoSaveManager.stop();
  });

  test('should throw error if save callback is not a function', () => {
    expect(() => new AutoSaveManager('not a function')).toThrow('Save callback must be a function');
  });

  test('should start and stop auto-save', () => {
    expect(autoSaveManager.getStatus().isActive).toBe(false);
    
    autoSaveManager.start();
    expect(autoSaveManager.getStatus().isActive).toBe(true);
    
    autoSaveManager.stop();
    expect(autoSaveManager.getStatus().isActive).toBe(false);
  });

  test('should trigger save with debouncing', async () => {
    autoSaveManager.start();
    
    // Trigger multiple saves quickly
    autoSaveManager.triggerSave();
    autoSaveManager.triggerSave();
    autoSaveManager.triggerSave();
    
    // Should be debounced
    expect(saveCallback).not.toHaveBeenCalled();
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 60));
    
    // Should have been called once
    expect(saveCallback).toHaveBeenCalledTimes(1);
  });

  test('should handle offline storage', async () => {
    // Mock offline
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    const testData = { content: 'test document' };
    saveCallback.mockResolvedValue(testData);
    
    autoSaveManager.start();
    autoSaveManager.triggerSave();
    
    await new Promise(resolve => setTimeout(resolve, 60));
    
    // Should have saved to localStorage
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('should update configuration', () => {
    const newConfig = { debounceDelay: 1000 };
    autoSaveManager.updateConfig(newConfig);
    
    expect(autoSaveManager.config.debounceDelay).toBe(1000);
  });

  test('should provide status information', () => {
    const status = autoSaveManager.getStatus();
    
    expect(status).toHaveProperty('isActive');
    expect(status).toHaveProperty('isOnline');
    expect(status).toHaveProperty('lastSaveTime');
    expect(status).toHaveProperty('pendingSaves');
    expect(status).toHaveProperty('hasPendingDebounce');
    expect(status).toHaveProperty('hasOfflineData');
  });
});