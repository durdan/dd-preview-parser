import os
import re
import json
from pathlib import Path
from typing import List, Dict, Tuple, Optional

class MermaidBlock:
    def __init__(self, content: str, start_line: int, end_line: int):
        self.content = content.strip()
        self.start_line = start_line
        self.end_line = end_line
        self.diagram_type = self._detect_type()
    
    def _detect_type(self) -> str:
        """Detect diagram type from first line of content."""
        first_line = self.content.split('\n')[0].strip().lower()
        
        type_mapping = {
            'graph': 'flowchart',
            'flowchart': 'flowchart',
            'sequencediagram': 'sequence',
            'classDiagram': 'class',
            'stateDiagram': 'state',
            'erDiagram': 'er',
            'journey': 'journey',
            'gantt': 'gantt',
            'pie': 'pie',
            'gitgraph': 'git'
        }
        
        for keyword, diagram_type in type_mapping.items():
            if first_line.startswith(keyword.lower()):
                return diagram_type
        
        return 'unknown'

class MermaidExtractor:
    def __init__(self, source_dir: str = "docs/markdown", output_dir: str = "extracted_diagrams"):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.manifest = []
        
        if not self.source_dir.exists():
            raise ValueError(f"Source directory '{source_dir}' does not exist")
        
        self.output_dir.mkdir(exist_ok=True)
    
    def find_markdown_files(self) -> List[Path]:
        """Recursively find all .md files in source directory."""
        return list(self.source_dir.rglob("*.md"))
    
    def extract_mermaid_blocks(self, file_path: Path) -> List[MermaidBlock]:
        """Extract all mermaid code blocks from a markdown file."""
        try:
            content = file_path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            print(f"Warning: Could not read {file_path} as UTF-8, skipping")
            return []
        
        blocks = []
        lines = content.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Look for mermaid code block start
            if re.match(r'^