"""
File organizer for managing output directory structure
"""

import shutil
from pathlib import Path
from typing import Dict

class FileOrganizer:
    def __init__(self, output_dir: Path):
        self.output_dir = Path(output_dir)
        self.directory_structure = {
            'processed': 'processed',
            'assets': 'assets',
            'reports': 'reports',
            'logs': 'logs'
        }
    
    def setup_directories(self):
        """Create the output directory structure"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        for dir_name in self.directory_structure.values():
            (self.output_dir / dir_name).mkdir(exist_ok=True)
    
    def place_file(self, source_path: Path, base_input_dir: Path) -> Path:
        """Place a processed file in the appropriate output location"""
        # Preserve relative directory structure
        relative_path = source_path.relative_to(base_input_dir)
        output_path = self.output_dir / self.directory_structure['processed'] / relative_path
        
        # Create parent directories
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy file (in real implementation, this would be the processed version)
        shutil.copy2(source_path, output_path)
        
        return output_path
    
    def get_directory(self, dir_type: str) -> Path:
        """Get path to a specific directory type"""
        if dir_type not in self.directory_structure:
            raise ValueError(f"Unknown directory type: {dir_type}")
        
        return self.output_dir / self.directory_structure[dir_type]