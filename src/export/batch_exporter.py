import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import List, Dict, Callable, Optional
from dataclasses import dataclass
import threading

from .diagram_exporter import DiagramExporter
from .types import ExportOptions, ExportResult

@dataclass
class BatchExportJob:
    diagram_id: str
    diagram_data: str
    output_path: Path
    options: ExportOptions

@dataclass
class BatchExportProgress:
    total: int
    completed: int
    failed: int
    current_job: Optional[str] = None
    
    @property
    def percentage(self) -> float:
        return (self.completed + self.failed) / self.total * 100 if self.total > 0 else 0

class BatchExporter:
    """Service for batch export operations with progress tracking"""
    
    def __init__(self, max_workers: int = 4):
        self.max_workers = max_workers
        self.exporter = DiagramExporter()
        self._cancel_event = threading.Event()
        self._progress_callbacks: List[Callable[[BatchExportProgress], None]] = []
    
    def add_progress_callback(self, callback: Callable[[BatchExportProgress], None]):
        """Add callback for progress updates"""
        self._progress_callbacks.append(callback)
    
    def export_batch(self, jobs: List[BatchExportJob]) -> Dict[str, ExportResult]:
        """Export multiple diagrams with progress tracking"""
        if not jobs:
            return {}
        
        self._cancel_event.clear()
        results = {}
        progress = BatchExportProgress(total=len(jobs), completed=0, failed=0)
        
        self._notify_progress(progress)
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all jobs
            future_to_job = {
                executor.submit(self._export_single_job, job): job 
                for job in jobs
            }
            
            # Process completed jobs
            for future in as_completed(future_to_job):
                if self._cancel_event.is_set():
                    break
                
                job = future_to_job[future]
                progress.current_job = job.diagram_id
                
                try:
                    result = future.result()
                    results[job.diagram_id] = result
                    
                    if result.success:
                        progress.completed += 1
                    else:
                        progress.failed += 1
                        
                except Exception as e:
                    results[job.diagram_id] = ExportResult(
                        success=False, 
                        error_message=f"Unexpected error: {str(e)}"
                    )
                    progress.failed += 1
                
                self._notify_progress(progress)
        
        progress.current_job = None
        self._notify_progress(progress)
        return results
    
    def cancel_batch(self):
        """Cancel ongoing batch export"""
        self._cancel_event.set()
    
    def _export_single_job(self, job: BatchExportJob) -> ExportResult:
        """Export a single job (used by thread pool)"""
        if self._cancel_event.is_set():
            return ExportResult(success=False, error_message="Export cancelled")
        
        return self.exporter.export_diagram(
            job.diagram_data, 
            job.output_path, 
            job.options
        )
    
    def _notify_progress(self, progress: BatchExportProgress):
        """Notify all progress callbacks"""
        for callback in self._progress_callbacks:
            try:
                callback(progress)
            except Exception:
                pass  # Don't let callback errors break the export