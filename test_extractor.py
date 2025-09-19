import unittest
import tempfile
import json
from pathlib import Path
from extractor import MermaidExtractor

class TestMermaidExtractor(unittest.TestCase):
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.temp_path = Path(self.temp_dir)
        
    def tearDown(self):
        # Clean up temp files
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_extract_single_mermaid_block(self):
        # Create test markdown file
        md_content = """# Test Doc