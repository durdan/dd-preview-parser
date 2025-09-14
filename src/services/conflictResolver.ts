import { ConflictData, DiagramChange, MergeStrategy } from '../types/saveState';

export class ConflictResolver {
  resolveConflict(
    conflictData: ConflictData, 
    strategy: MergeStrategy
  ): { resolved: boolean; mergedChanges: DiagramChange[]; errors: string[] } {
    const errors: string[] = [];
    
    try {
      switch (strategy) {
        case MergeStrategy.LOCAL_WINS:
          return {
            resolved: true,
            mergedChanges: conflictData.localChanges,
            errors: []
          };
          
        case MergeStrategy.REMOTE_WINS:
          return {
            resolved: true,
            mergedChanges: conflictData.remoteChanges,
            errors: []
          };
          
        case MergeStrategy.MANUAL:
          return this.attemptAutoMerge(conflictData);
          
        default:
          errors.push(`Unknown merge strategy: ${strategy}`);
          return { resolved: false, mergedChanges: [], errors };
      }
    } catch (error) {
      errors.push(`Merge failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { resolved: false, mergedChanges: [], errors };
    }
  }

  private attemptAutoMerge(conflictData: ConflictData): {
    resolved: boolean;
    mergedChanges: DiagramChange[];
    errors: string[];
  } {
    const mergedChanges: DiagramChange[] = [];
    const errors: string[] = [];
    const processedFields = new Set<string>();

    // Process local changes first
    for (const localChange of conflictData.localChanges) {
      const hasRemoteConflict = conflictData.remoteChanges.some(
        remote => remote.field === localChange.field
      );

      if (!hasRemoteConflict) {
        mergedChanges.push(localChange);
        processedFields.add(localChange.field);
      } else {
        // Find the conflicting remote change
        const remoteChange = conflictData.remoteChanges.find(
          remote => remote.field === localChange.field
        );

        if (remoteChange) {
          // Use timestamp to resolve conflict (last write wins)
          if (localChange.timestamp > remoteChange.timestamp) {
            mergedChanges.push(localChange);
          } else {
            mergedChanges.push(remoteChange);
          }
          processedFields.add(localChange.field);
        }
      }
    }

    // Add remaining remote changes
    for (const remoteChange of conflictData.remoteChanges) {
      if (!processedFields.has(remoteChange.field)) {
        mergedChanges.push(remoteChange);
      }
    }

    return {
      resolved: true,
      mergedChanges,
      errors
    };
  }

  getConflictSummary(conflictData: ConflictData): string {
    const conflictCount = conflictData.conflictedFields.length;
    const localCount = conflictData.localChanges.length;
    const remoteCount = conflictData.remoteChanges.length;

    return `${conflictCount} conflicted fields (${localCount} local, ${remoteCount} remote changes)`;
  }
}