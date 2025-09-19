import unittest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock
from main import (
    MermaidExtractor, ScalingCalculator, MarkdownRebuilder, 
    ImageProcessor, MermaidMarkdownProcessor
)

class TestMermaidExtractor(unittest.TestCase):
    
    def test_extract_mermaid_blocks(self):
        content = """# Test