export interface SaveState {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  version: number;
  hasConflict: boolean;
  conflictData?: ConflictData;
}

export interface ConflictData {
  localVersion: number;
  remoteVersion: number;
  localChanges: DiagramChange[];
  remoteChanges: DiagramChange[];
  conflictedFields: string[];
}

export interface DiagramChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

export enum SaveStatus {
  CLEAN = 'clean',
  DIRTY = 'dirty',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  CONFLICT = 'conflict'
}

export interface SaveOptions {
  force?: boolean;
  skipConflictCheck?: boolean;
  mergeStrategy?: MergeStrategy;
}

export enum MergeStrategy {
  LOCAL_WINS = 'local_wins',
  REMOTE_WINS = 'remote_wins',
  MANUAL = 'manual'
}