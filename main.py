#!/usr/bin/env python3
import os
import re
import subprocess
import tempfile
from pathlib import Path
from PIL import Image
from typing import List, Tuple, Dict

class MermaidExtractor:
    """Extract mermaid code blocks from markdown content."""
    
    @staticmethod
    def extract_mermaid_blocks(content: str) -> List[Tuple[str, str]]:
        """Extract mermaid code blocks and return (full_match, mermaid_code) tuples."""
        pattern = r'