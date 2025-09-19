"""
File organizer for managing output directory structure
"""

import shutil
from pathlib import Path
from typing import Dict

class FileOrganizer:
    def __init__(self, output_dir: Path):
        self.output_dir = Path(output_dir)
        self.structure = {
            'processed': 'processed',
            'assets': 'assets',
            'reports': 'reports',
            'logs': 'logs'
        }
    
    def setup_directories(self):
        """Create output directory structure"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        for subdir in self.structure.values():
            (self.output_dir / subdir).mkdir(exist_ok=True)
    
    def place_file(self, source_path: Path, base_input_dir: Path) -> Path:
        """Place processed file in organized output structure"""
        # Preserve relative path structure
        relative_path = source_path.relative_to(base_input_dir)
        output_path = self.output_dir / self.structure['processed'] / relative_path
        
        # Create parent directories
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy file (in real implementation, this would be the processed version)
        shutil.copy2(source_path, output_path)
        
        return output_path
    
    def get_asset_path(self, filename: str) -> Path:
        """Get path for asset files"""
        return self.output_dir / self.structure['assets'] / filename
    
    def get_report_path(self, filename: str) -> Path:
        """Get path for report files"""
        return self.output_dir / self.structure['reports'] / filename