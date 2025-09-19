"""
Document processor for handling individual documentation files
"""

from pathlib import Path
from typing import Dict

class DocumentProcessor:
    def __init__(self):
        self.supported_extensions = {'.md', '.rst', '.txt', '.adoc', '.html'}
    
    def process(self, file_path: Path) -> Dict:
        """Process a documentation file and return processing results"""
        if file_path.suffix.lower() not in self.supported_extensions:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Basic processing metrics
            word_count = len(content.split())
            line_count = len(content.splitlines())
            
            # In a real implementation, this would include:
            # - Format conversion
            # - Link validation
            # - Image processing
            # - Table of contents generation
            # - Syntax highlighting
            # etc.
            
            return {
                'word_count': word_count,
                'line_count': line_count,
                'character_count': len(content),
                'processed': True
            }
            
        except UnicodeDecodeError:
            # Try with different encoding
            with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()
            
            return {
                'word_count': len(content.split()),
                'line_count': len(content.splitlines()),
                'character_count': len(content),
                'processed': True,
                'encoding_note': 'Processed with latin-1 encoding'
            }