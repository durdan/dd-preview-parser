from enum import Enum
from dataclasses import dataclass
from typing import Any, Dict, Optional, List
from datetime import datetime
import uuid

class ExportFormat(Enum):
    JSON = "json"
    CSV = "csv"
    XML = "xml"
    PDF = "pdf"

class ExportStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class QualitySettings:
    compression_level: int = 6  # 0-9, higher = more compression
    resolution_dpi: int = 300   # For PDF exports
    optimize_size: bool = True
    preserve_formatting: bool = True
    custom_options: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.custom_options is None:
            self.custom_options = {}
        
        if not 0 <= self.compression_level <= 9:
            raise ValueError("Compression level must be between 0-9")
        if self.resolution_dpi < 72:
            raise ValueError("Resolution must be at least 72 DPI")

@dataclass
class ExportJob:
    id: str
    data: Any
    format: ExportFormat
    output_path: str
    quality_settings: QualitySettings
    status: ExportStatus = ExportStatus.PENDING
    created_at: datetime = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    progress: float = 0.0  # 0.0 to 1.0
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if not self.id:
            self.id = str(uuid.uuid4())