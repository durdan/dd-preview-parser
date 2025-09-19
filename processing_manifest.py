"""
Processing manifest for tracking file processing status and metadata
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

@dataclass
class FileMetadata:
    source_path: str
    output_path: str
    file_size: int
    processed_at: str
    status: str  # 'success', 'error', 'skipped'
    processing_time_ms: float
    error_message: Optional[str] = None
    word_count: Optional[int] = None
    line_count: Optional[int] = None

class ProcessingManifest:
    def __init__(self):
        self.files: List[FileMetadata] = []
        self.pipeline_start = datetime.now()
        self.pipeline_end: Optional[datetime] = None
        self.errors: List[Dict] = []
    
    def add_file(self, source_path: Path, output_path: Path, processing_result: Dict):
        """Add a successfully processed file to the manifest"""
        file_stats = source_path.stat()
        
        metadata = FileMetadata(
            source_path=str(source_path),
            output_path=str(output_path),
            file_size=file_stats.st_size,
            processed_at=datetime.now().isoformat(),
            status='success',
            processing_time_ms=processing_result.get('processing_time_ms', 0),
            word_count=processing_result.get('word_count'),
            line_count=processing_result.get('line_count')
        )
        
        self.files.append(metadata)
    
    def add_error(self, source_path: Path, error_message: str):
        """Add a failed file to the manifest"""
        try:
            file_stats = source_path.stat()
            file_size = file_stats.st_size
        except:
            file_size = 0
        
        metadata = FileMetadata(
            source_path=str(source_path),
            output_path="",
            file_size=file_size,
            processed_at=datetime.now().isoformat(),
            status='error',
            processing_time_ms=0,
            error_message=error_message
        )
        
        self.files.append(metadata)
    
    def save(self, output_path: Path):
        """Save manifest to JSON file"""
        self.pipeline_end = datetime.now()
        
        manifest_data = {
            'pipeline_info': {
                'start_time': self.pipeline_start.isoformat(),
                'end_time': self.pipeline_end.isoformat(),
                'duration_seconds': (self.pipeline_end - self.pipeline_start).total_seconds(),
                'total_files': len(self.files)
            },
            'files': [asdict(file_meta) for file_meta in self.files],
            'summary': self.get_summary()
        }
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(manifest_data, f, indent=2, ensure_ascii=False)
    
    def get_summary(self) -> Dict:
        """Get processing summary statistics"""
        successful = [f for f in self.files if f.status == 'success']
        failed = [f for f in self.files if f.status == 'error']
        
        total_size = sum(f.file_size for f in self.files)
        total_words = sum(f.word_count or 0 for f in successful)
        
        return {
            'total_files': len(self.files),
            'successful': len(successful),
            'failed': len(failed),
            'total_size_bytes': total_size,
            'total_words': total_words,
            'success_rate': len(successful) / len(self.files) if self.files else 0
        }