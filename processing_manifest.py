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
    output_path: Optional[str]
    file_size: int
    modified_time: str
    processing_time: Optional[str]
    status: str  # 'success', 'error', 'skipped'
    error_message: Optional[str] = None
    word_count: Optional[int] = None
    line_count: Optional[int] = None

class ProcessingManifest:
    def __init__(self):
        self.files: Dict[str, FileMetadata] = {}
        self.start_time = datetime.now()
        self.end_time: Optional[datetime] = None
        self.stats = {
            'total_files': 0,
            'successful': 0,
            'errors': 0,
            'skipped': 0
        }
    
    def add_file(self, source_path: Path, output_path: Path, processing_result: dict):
        """Add a successfully processed file to the manifest"""
        file_stats = source_path.stat()
        
        metadata = FileMetadata(
            source_path=str(source_path),
            output_path=str(output_path),
            file_size=file_stats.st_size,
            modified_time=datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
            processing_time=datetime.now().isoformat(),
            status='success',
            word_count=processing_result.get('word_count'),
            line_count=processing_result.get('line_count')
        )
        
        self.files[str(source_path)] = metadata
        self.stats['total_files'] += 1
        self.stats['successful'] += 1
    
    def add_error(self, source_path: Path, error_message: str):
        """Add a failed file to the manifest"""
        file_stats = source_path.stat()
        
        metadata = FileMetadata(
            source_path=str(source_path),
            output_path=None,
            file_size=file_stats.st_size,
            modified_time=datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
            processing_time=datetime.now().isoformat(),
            status='error',
            error_message=error_message
        )
        
        self.files[str(source_path)] = metadata
        self.stats['total_files'] += 1
        self.stats['errors'] += 1
    
    def save(self, output_path: Path):
        """Save manifest to JSON file"""
        self.end_time = datetime.now()
        
        manifest_data = {
            'pipeline_info': {
                'start_time': self.start_time.isoformat(),
                'end_time': self.end_time.isoformat(),
                'duration_seconds': (self.end_time - self.start_time).total_seconds()
            },
            'statistics': self.stats,
            'files': {path: asdict(metadata) for path, metadata in self.files.items()}
        }
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(manifest_data, f, indent=2, ensure_ascii=False)
    
    def get_files_by_status(self, status: str) -> List[FileMetadata]:
        """Get all files with a specific status"""
        return [metadata for metadata in self.files.values() if metadata.status == status]