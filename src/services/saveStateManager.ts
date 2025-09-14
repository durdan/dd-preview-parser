import { SaveState, SaveStatus, DiagramChange, ConflictData, SaveOptions } from '../types/saveState';

export class SaveStateManager {
  private state: SaveState;
  private listeners: Set<(state: SaveState) => void> = new Set();
  private changeBuffer: DiagramChange[] = [];
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(initialVersion: number = 1) {
    this.state = {
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      saveError: null,
      version: initialVersion,
      hasConflict: false
    };
  }

  getState(): SaveState {
    return { ...this.state };
  }

  getStatus(): SaveStatus {
    if (this.state.hasConflict) return SaveStatus.CONFLICT;
    if (this.state.isSaving) return SaveStatus.SAVING;
    if (this.state.saveError) return SaveStatus.ERROR;
    if (this.state.isDirty) return SaveStatus.DIRTY;
    if (this.state.lastSaved) return SaveStatus.SAVED;
    return SaveStatus.CLEAN;
  }

  subscribe(listener: (state: SaveState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  markDirty(change: DiagramChange): void {
    if (!this.state.isDirty) {
      this.updateState({ isDirty: true, saveError: null });
    }
    
    this.changeBuffer.push(change);
    this.scheduleAutoSave();
  }

  markClean(): void {
    this.updateState({ 
      isDirty: false, 
      saveError: null,
      lastSaved: new Date()
    });
    this.changeBuffer = [];
    this.clearAutoSave();
  }

  setSaving(saving: boolean): void {
    this.updateState({ isSaving: saving });
  }

  setSaveError(error: string | null): void {
    this.updateState({ 
      saveError: error, 
      isSaving: false 
    });
  }

  setConflict(conflictData: ConflictData): void {
    this.updateState({ 
      hasConflict: true, 
      conflictData,
      isSaving: false 
    });
  }

  resolveConflict(): void {
    this.updateState({ 
      hasConflict: false, 
      conflictData: undefined 
    });
  }

  incrementVersion(): void {
    this.updateState({ version: this.state.version + 1 });
  }

  getChanges(): DiagramChange[] {
    return [...this.changeBuffer];
  }

  clearChanges(): void {
    this.changeBuffer = [];
  }

  private updateState(updates: Partial<SaveState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  private scheduleAutoSave(): void {
    this.clearAutoSave();
    this.autoSaveTimer = setTimeout(() => {
      if (this.state.isDirty && !this.state.isSaving) {
        this.notifyListeners(); // Trigger auto-save through listeners
      }
    }, 2000);
  }

  private clearAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  destroy(): void {
    this.clearAutoSave();
    this.listeners.clear();
  }
}