#!/usr/bin/env python3
"""
Documentation Analysis Tool
Scans repository for markdown files and Mermaid diagrams, provides pipeline recommendations.
"""

import os
import re
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Set
from collections import defaultdict

@dataclass
class MermaidDiagram:
    file_path: str
    line_number: int
    diagram_type: str
    content: str

@dataclass
class DocumentationStats:
    total_md_files: int
    files_with_mermaid: int
    total_diagrams: int
    diagram_types: Dict[str, int]
    largest_files: List[tuple]  # (path, size_kb)
    orphaned_files: List[str]

class DocumentationScanner:
    """Scans repository for markdown files."""
    
    def __init__(self, root_path: str = "."):
        self.root_path = Path(root_path)
        self.ignore_dirs = {'.git', 'node_modules', '.venv', '__pycache__', 'dist', 'build'}
    
    def find_markdown_files(self) -> List[Path]:
        """Find all markdown files in the repository."""
        md_files = []
        
        for root, dirs, files in os.walk(self.root_path):
            # Skip ignored directories
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            for file in files:
                if file.lower().endswith(('.md', '.markdown')):
                    md_files.append(Path(root) / file)
        
        return sorted(md_files)

class MermaidAnalyzer:
    """Analyzes markdown files for Mermaid diagrams."""
    
    MERMAID_PATTERN = re.compile(
        r'