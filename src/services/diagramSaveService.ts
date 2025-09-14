import { SaveOptions, DiagramChange, ConflictData } from '../types/saveState';
import { SaveStateManager } from './saveStateManager';
import { ConflictResolver } from './conflictResolver';

interface DiagramData {
  id: string;
  content: any;
  version: number;
  lastModified: Date;
}

export class DiagramSaveService {
  private saveStateManager: SaveStateManager;
  private conflictResolver: ConflictResolver;

  constructor(saveStateManager: SaveStateManager) {
    this.saveStateManager = saveStateManager;
    this.conflictResolver = new ConflictResolver();
  }

  async saveDiagram(
    diagramId: string, 
    diagramData: any, 
    options: SaveOptions = {}
  ): Promise<{ success: boolean; error?: string; newVersion?: number }> {
    
    if (this.saveStateManager.getState().isSaving) {
      return { success: false, error: 'Save already in progress' };
    }

    this.saveStateManager.setSaving(true);

    try {
      // Check for conflicts unless skipped
      if (!options.skipConflictCheck) {
        const conflictCheck = await this.checkForConflicts(diagramId);
        if (conflictCheck.hasConflict && !options.force) {
          this.saveStateManager.setConflict(conflictCheck.conflictData!);
          return { success: false, error: 'Conflict detected' };
        }
      }

      // Simulate API call
      const result = await this.performSave(diagramId, diagramData);
      
      if (result.success) {
        this.saveStateManager.incrementVersion();
        this.saveStateManager.markClean();
        return { success: true, newVersion: result.version };
      } else {
        this.saveStateManager.setSaveError(result.error || 'Save failed');
        return { success: false, error: result.error };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.saveStateManager.setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async resolveConflictAndSave(
    diagramId: string,
    diagramData: any,
    strategy: string
  ): Promise<{ success: boolean; error?: string }> {
    const state = this.saveStateManager.getState();
    
    if (!state.hasConflict || !state.conflictData) {
      return { success: false, error: 'No conflict to resolve' };
    }

    const resolution = this.conflictResolver.resolveConflict(
      state.conflictData,
      strategy as any
    );

    if (!resolution.resolved) {
      return { success: false, error: resolution.errors.join(', ') };
    }

    // Apply merged changes to diagram data
    const mergedData = this.applyChanges(diagramData, resolution.mergedChanges);
    
    this.saveStateManager.resolveConflict();
    
    return this.saveDiagram(diagramId, mergedData, { skipConflictCheck: true });
  }

  private async checkForConflicts(diagramId: string): Promise<{
    hasConflict: boolean;
    conflictData?: ConflictData;
  }> {
    // Simulate checking remote version
    const remoteData = await this.fetchRemoteVersion(diagramId);
    const currentState = this.saveStateManager.getState();
    
    if (remoteData.version > currentState.version) {
      const localChanges = this.saveStateManager.getChanges();
      const remoteChanges = this.detectRemoteChanges(remoteData);
      
      const conflictedFields = this.findConflictedFields(localChanges, remoteChanges);
      
      if (conflictedFields.length > 0) {
        return {
          hasConflict: true,
          conflictData: {
            localVersion: currentState.version,
            remoteVersion: remoteData.version,
            localChanges,
            remoteChanges,
            conflictedFields
          }
        };
      }
    }

    return { hasConflict: false };
  }

  private async fetchRemoteVersion(diagramId: string): Promise<DiagramData> {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: diagramId,
          content: {},
          version: Math.floor(Math.random() * 10) + 1,
          lastModified: new Date()
        });
      }, 100);
    });
  }

  private async performSave(diagramId: string, data: any): Promise<{
    success: boolean;
    error?: string;
    version?: number;
  }> {
    // Simulate API call with potential failure
    return new Promise(resolve => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve({
            success: true,
            version: Math.floor(Math.random() * 100) + 1
          });
        } else {
          resolve({
            success: false,
            error: 'Network error'
          });
        }
      }, 500);
    });
  }

  private detectRemoteChanges(remoteData: DiagramData): DiagramChange[] {
    // Simulate detecting changes from remote data
    return [
      {
        field: 'title',
        oldValue: 'Old Title',
        newValue: 'Remote Title',
        timestamp: remoteData.lastModified
      }
    ];
  }

  private findConflictedFields(
    localChanges: DiagramChange[], 
    remoteChanges: DiagramChange[]
  ): string[] {
    const localFields = new Set(localChanges.map(c => c.field));
    const remoteFields = new Set(remoteChanges.map(c => c.field));
    
    return Array.from(localFields).filter(field => remoteFields.has(field));
  }

  private applyChanges(data: any, changes: DiagramChange[]): any {
    const result = { ...data };
    
    for (const change of changes) {
      result[change.field] = change.newValue;
    }
    
    return result;
  }
}