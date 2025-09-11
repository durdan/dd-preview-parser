import threading
from typing import Dict, Callable, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ProgressInfo:
    job_id: str
    progress: float
    status: str
    message: str = ""
    started_at: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None

class ProgressTracker:
    def __init__(self):
        self._progress: Dict[str, ProgressInfo] = {}
        self._lock = threading.RLock()
        self._callbacks: Dict[str, Callable[[ProgressInfo], None]] = {}
    
    def start_job(self, job_id: str, message: str = "Starting..."):
        with self._lock:
            self._progress[job_id] = ProgressInfo(
                job_id=job_id,
                progress=0.0,
                status="processing",
                message=message,
                started_at=datetime.now()
            )
            self._notify_callbacks(job_id)
    
    def update_progress(self, job_id: str, progress: float, message: str = ""):
        if not 0.0 <= progress <= 1.0:
            raise ValueError("Progress must be between 0.0 and 1.0")
        
        with self._lock:
            if job_id in self._progress:
                info = self._progress[job_id]
                info.progress = progress
                if message:
                    info.message = message
                
                # Estimate completion time
                if progress > 0 and info.started_at:
                    elapsed = datetime.now() - info.started_at
                    total_estimated = elapsed / progress
                    info.estimated_completion = info.started_at + total_estimated
                
                self._notify_callbacks(job_id)
    
    def complete_job(self, job_id: str, success: bool = True, message: str = ""):
        with self._lock:
            if job_id in self._progress:
                info = self._progress[job_id]
                info.progress = 1.0
                info.status = "completed" if success else "failed"
                info.message = message or ("Completed successfully" if success else "Failed")
                self._notify_callbacks(job_id)
    
    def get_progress(self, job_id: str) -> Optional[ProgressInfo]:
        with self._lock:
            return self._progress.get(job_id)
    
    def get_all_progress(self) -> Dict[str, ProgressInfo]:
        with self._lock:
            return self._progress.copy()
    
    def add_callback(self, job_id: str, callback: Callable[[ProgressInfo], None]):
        with self._lock:
            self._callbacks[job_id] = callback
    
    def remove_callback(self, job_id: str):
        with self._lock:
            self._callbacks.pop(job_id, None)
    
    def _notify_callbacks(self, job_id: str):
        callback = self._callbacks.get(job_id)
        if callback and job_id in self._progress:
            try:
                callback(self._progress[job_id])
            except Exception:
                pass  # Don't let callback errors break progress tracking