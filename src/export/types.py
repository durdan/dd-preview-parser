from enum import Enum
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from pathlib import Path

class ExportFormat(Enum):
    PNG = "png"
    SVG = "svg"
    PDF = "pdf"

class ExportQuality(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    ULTRA = "ultra"

@dataclass
class ExportOptions:
    format: ExportFormat
    quality: ExportQuality = ExportQuality.MEDIUM
    width: Optional[int] = None
    height: Optional[int] = None
    dpi: int = 300
    background_color: str = "white"
    transparent: bool = False
    
    def get_quality_settings(self) -> Dict[str, Any]:
        """Get format-specific quality settings"""
        quality_map = {
            ExportQuality.LOW: {"dpi": 72, "compression": 9},
            ExportQuality.MEDIUM: {"dpi": 150, "compression": 6},
            ExportQuality.HIGH: {"dpi": 300, "compression": 3},
            ExportQuality.ULTRA: {"dpi": 600, "compression": 1}
        }
        return quality_map[self.quality]

@dataclass
class ExportResult:
    success: bool
    file_path: Optional[Path] = None
    error_message: Optional[str] = None
    file_size: Optional[int] = None
    processing_time: Optional[float] = None