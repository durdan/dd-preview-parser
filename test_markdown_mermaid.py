import unittest
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock
from main import (
    MermaidExtractor, ImageProcessor, ScalingCalculator, 
    MarkdownRebuilder, process_markdown_files
)

class TestMermaidExtractor(unittest.TestCase):
    
    def test_extract_mermaid_blocks(self):
        content = """# Test